use espflash::{
    connection::{Connection, ResetAfterOperation, ResetBeforeOperation},
    flasher::Flasher,
    image_format::Segment,
    target::{Chip, DefaultProgressCallback},
};
use reqwest::{blocking::Client, Url};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    fs,
    path::{Path, PathBuf},
    time::Duration,
};
use tauri::{path::BaseDirectory, AppHandle, Manager};

const MAX_MANIFEST_BYTES: u64 = 1024 * 1024;
const MAX_PART_BYTES: u64 = 16 * 1024 * 1024;
const MAX_TOTAL_BYTES: u64 = 32 * 1024 * 1024;
const FLASH_BAUD: u32 = 460_800;

#[derive(Debug, Deserialize)]
struct FirmwareManifest {
    name: String,
    version: String,
    builds: Vec<FirmwareBuild>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FirmwareBuild {
    chip_family: String,
    parts: Vec<ManifestPart>,
}

#[derive(Debug, Deserialize)]
struct ManifestPart {
    path: String,
    offset: u32,
    sha256: String,
    #[serde(default)]
    size: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SerialPortSummary {
    path: String,
    label: String,
    is_usb: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FlashResult {
    name: String,
    version: String,
    source: String,
    bytes_written: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct CachedPackage {
    manifest_url: String,
    name: String,
    version: String,
    parts: Vec<CachedPart>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CachedPart {
    path: PathBuf,
    offset: u32,
    sha256: String,
    size: u64,
}

struct FirmwarePackage {
    name: String,
    version: String,
    source: String,
    parts: Vec<FirmwarePart>,
}

struct FirmwarePart {
    offset: u32,
    bytes: Vec<u8>,
}

pub fn list_serial_ports() -> Result<Vec<SerialPortSummary>, String> {
    let mut ports = serialport::available_ports()
        .map_err(|error| format!("读取系统串口失败：{error}"))?
        .into_iter()
        .map(|port| {
            let (label, is_usb) = match port.port_type {
                serialport::SerialPortType::UsbPort(info) => {
                    let device = info
                        .product
                        .or(info.manufacturer)
                        .unwrap_or_else(|| "USB 串口设备".to_string());
                    (format!("{} · {}", port.port_name, device), true)
                }
                _ => (port.port_name.clone(), false),
            };
            SerialPortSummary {
                path: port.port_name,
                label,
                is_usb,
            }
        })
        .collect::<Vec<_>>();

    ports.sort_by_key(|port| (!port.is_usb, port.path.clone()));
    Ok(ports)
}

pub async fn flash_firmware(
    app: AppHandle,
    port: String,
    manifest_url: String,
) -> Result<FlashResult, String> {
    tauri::async_runtime::spawn_blocking(move || {
        flash_firmware_blocking(&app, &port, &manifest_url)
    })
    .await
    .map_err(|error| format!("固件更新任务异常终止：{error}"))?
}

fn flash_firmware_blocking(
    app: &AppHandle,
    port_name: &str,
    manifest_url: &str,
) -> Result<FlashResult, String> {
    let package = prepare_firmware(app, manifest_url)?;
    let port_info = serialport::available_ports()
        .map_err(|error| format!("读取系统串口失败：{error}"))?
        .into_iter()
        .find(|port| port.port_name == port_name)
        .ok_or_else(|| format!("找不到串口 {port_name}，请重新连接设备并刷新串口列表。"))?;

    let usb_info = match port_info.port_type {
        serialport::SerialPortType::UsbPort(info) => info,
        _ => serialport::UsbPortInfo {
            vid: 0,
            pid: 0,
            serial_number: None,
            manufacturer: None,
            product: None,
        },
    };
    let serial = serialport::new(port_name, 115_200)
        .flow_control(serialport::FlowControl::None)
        .timeout(Duration::from_secs(3))
        .open_native()
        .map_err(|error| {
            format!("无法打开串口 {port_name}：{error}。如果设备已在创作页连接，请先断开后重试。")
        })?;
    let connection = Connection::new(
        serial,
        usb_info,
        ResetAfterOperation::HardReset,
        ResetBeforeOperation::DefaultReset,
        FLASH_BAUD,
    );
    let mut flasher = Flasher::connect(
        connection,
        true,
        true,
        false,
        Some(Chip::Esp32),
        Some(FLASH_BAUD),
    )
    .map_err(|error| {
        format!(
            "未能让设备进入 ESP32 下载模式：{error}。请确认数据线可传输数据；必要时按住 BOOT，再点按 EN/RESET。"
        )
    })?;

    let segments = package
        .parts
        .iter()
        .map(|part| Segment::new(part.offset, &part.bytes))
        .collect::<Vec<_>>();
    let mut progress = DefaultProgressCallback;
    flasher
        .write_bins_to_flash(&segments, &mut progress)
        .map_err(|error| format!("写入或校验固件失败：{error}"))?;

    Ok(FlashResult {
        name: package.name,
        version: package.version,
        source: package.source,
        bytes_written: package
            .parts
            .iter()
            .map(|part| part.bytes.len() as u64)
            .sum(),
    })
}

fn prepare_firmware(app: &AppHandle, manifest_url: &str) -> Result<FirmwarePackage, String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|error| format!("无法确定固件缓存目录：{error}"))?
        .join("firmware");
    fs::create_dir_all(&cache_dir).map_err(|error| format!("无法创建固件缓存目录：{error}"))?;

    let download_error = match download_firmware(manifest_url, &cache_dir) {
        Ok(package) => return Ok(package),
        Err(error) => error,
    };
    let cache_error = match load_cached_firmware(manifest_url, &cache_dir) {
        Ok(package) => return Ok(package),
        Err(error) => error,
    };
    load_bundled_firmware(app).map_err(|bundled_error| {
        format!(
            "在线固件获取失败，缓存和软件内置固件也不可用。在线错误：{download_error}；缓存错误：{cache_error}；内置错误：{bundled_error}"
        )
    })
}

fn load_bundled_firmware(app: &AppHandle) -> Result<FirmwarePackage, String> {
    let manifest_path = app
        .path()
        .resolve("firmware/firmware-manifest.json", BaseDirectory::Resource)
        .map_err(|error| format!("无法定位软件内置固件：{error}"))?;
    load_local_firmware(&manifest_path)
}

fn load_local_firmware(manifest_path: &Path) -> Result<FirmwarePackage, String> {
    let manifest_bytes = fs::read(manifest_path)
        .map_err(|error| format!("读取内置固件清单 {} 失败：{error}", manifest_path.display()))?;
    if manifest_bytes.is_empty() || manifest_bytes.len() as u64 > MAX_MANIFEST_BYTES {
        return Err("内置固件清单为空或超过安全大小限制。".to_string());
    }
    let manifest: FirmwareManifest = serde_json::from_slice(&manifest_bytes)
        .map_err(|error| format!("内置固件清单格式无效：{error}"))?;
    let build = manifest
        .builds
        .iter()
        .find(|build| build.chip_family.eq_ignore_ascii_case("ESP32"))
        .ok_or_else(|| "内置固件清单中没有 ESP32 构建。".to_string())?;
    if build.parts.is_empty() || build.parts.len() > 8 {
        return Err("内置 ESP32 固件分片数量必须在 1 到 8 之间。".to_string());
    }

    let resource_root = manifest_path
        .parent()
        .ok_or_else(|| "内置固件清单没有父目录。".to_string())?
        .canonicalize()
        .map_err(|error| format!("无法解析内置固件目录：{error}"))?;
    let mut parts = Vec::with_capacity(build.parts.len());
    let mut total_bytes = 0_u64;
    for part in &build.parts {
        validate_digest(&part.sha256)?;
        let relative = Path::new(&part.path);
        if relative.is_absolute() {
            return Err("内置固件分片路径必须是相对路径。".to_string());
        }
        let part_path = resource_root
            .join(relative)
            .canonicalize()
            .map_err(|error| format!("无法解析内置固件分片 {}：{error}", part.path))?;
        if !part_path.starts_with(&resource_root) {
            return Err("内置固件分片路径越过了资源目录。".to_string());
        }
        let metadata = fs::metadata(&part_path).map_err(|error| {
            format!("读取内置固件分片信息 {} 失败：{error}", part_path.display())
        })?;
        if metadata.len() == 0 || metadata.len() > MAX_PART_BYTES {
            return Err(format!(
                "内置固件分片 {} 为空或超过安全大小限制。",
                part.path
            ));
        }
        let bytes = fs::read(&part_path)
            .map_err(|error| format!("读取内置固件分片 {} 失败：{error}", part_path.display()))?;
        verify_bytes(&bytes, &part.sha256, part.size)?;
        total_bytes = total_bytes
            .checked_add(bytes.len() as u64)
            .ok_or_else(|| "内置固件总大小溢出。".to_string())?;
        if total_bytes > MAX_TOTAL_BYTES {
            return Err(format!(
                "内置固件总大小超过 {} MiB 安全限制。",
                MAX_TOTAL_BYTES / 1024 / 1024
            ));
        }
        parts.push(FirmwarePart {
            offset: part.offset,
            bytes,
        });
    }
    validate_layout(&parts)?;
    Ok(FirmwarePackage {
        name: manifest.name,
        version: manifest.version,
        source: "bundled".to_string(),
        parts,
    })
}

fn download_firmware(manifest_url: &str, cache_dir: &Path) -> Result<FirmwarePackage, String> {
    let manifest_url = validate_remote_url(manifest_url, "固件清单")?;
    let client = Client::builder()
        .connect_timeout(Duration::from_secs(12))
        .timeout(Duration::from_secs(60))
        .user_agent(concat!("OpenBlock-ESP32/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|error| format!("无法初始化下载器：{error}"))?;
    let manifest_bytes = download_bytes(&client, &manifest_url, MAX_MANIFEST_BYTES, "固件清单")?;
    let manifest: FirmwareManifest = serde_json::from_slice(&manifest_bytes)
        .map_err(|error| format!("固件清单格式无效：{error}"))?;
    let build = manifest
        .builds
        .iter()
        .find(|build| build.chip_family.eq_ignore_ascii_case("ESP32"))
        .ok_or_else(|| "固件清单中没有 ESP32 构建。".to_string())?;
    if build.parts.is_empty() || build.parts.len() > 8 {
        return Err("ESP32 固件分片数量必须在 1 到 8 之间。".to_string());
    }

    let release_dir = cache_dir.join(safe_component(&manifest.version));
    fs::create_dir_all(&release_dir).map_err(|error| format!("无法创建版本缓存目录：{error}"))?;
    let mut cached_parts = Vec::with_capacity(build.parts.len());
    let mut loaded_parts = Vec::with_capacity(build.parts.len());
    let mut total_bytes = 0_u64;

    for part in &build.parts {
        validate_digest(&part.sha256)?;
        let part_url = manifest_url
            .join(&part.path)
            .map_err(|error| format!("固件分片地址无效（{}）：{error}", part.path))?;
        validate_remote_url(part_url.as_str(), "固件分片")?;
        let cache_path =
            release_dir.join(format!("{:08x}-{}.bin", part.offset, &part.sha256[..16]));
        let bytes = match fs::read(&cache_path) {
            Ok(bytes) if verify_bytes(&bytes, &part.sha256, part.size).is_ok() => bytes,
            _ => {
                let bytes = download_bytes(&client, &part_url, MAX_PART_BYTES, "固件分片")?;
                verify_bytes(&bytes, &part.sha256, part.size)?;
                write_atomic(&cache_path, &bytes)?;
                bytes
            }
        };
        total_bytes = total_bytes
            .checked_add(bytes.len() as u64)
            .ok_or_else(|| "固件总大小溢出。".to_string())?;
        if total_bytes > MAX_TOTAL_BYTES {
            return Err(format!(
                "固件总大小超过 {} MiB 安全限制。",
                MAX_TOTAL_BYTES / 1024 / 1024
            ));
        }
        cached_parts.push(CachedPart {
            path: cache_path,
            offset: part.offset,
            sha256: part.sha256.to_ascii_lowercase(),
            size: bytes.len() as u64,
        });
        loaded_parts.push(FirmwarePart {
            offset: part.offset,
            bytes,
        });
    }
    validate_layout(&loaded_parts)?;

    let cached = CachedPackage {
        manifest_url: manifest_url.to_string(),
        name: manifest.name.clone(),
        version: manifest.version.clone(),
        parts: cached_parts,
    };
    let cached_json = serde_json::to_vec_pretty(&cached)
        .map_err(|error| format!("无法生成固件缓存索引：{error}"))?;
    write_atomic(&cache_dir.join("active.json"), &cached_json)?;

    Ok(FirmwarePackage {
        name: manifest.name,
        version: manifest.version,
        source: "online".to_string(),
        parts: loaded_parts,
    })
}

fn load_cached_firmware(manifest_url: &str, cache_dir: &Path) -> Result<FirmwarePackage, String> {
    let index = fs::read(cache_dir.join("active.json"))
        .map_err(|error| format!("读取缓存索引失败：{error}"))?;
    let cached: CachedPackage =
        serde_json::from_slice(&index).map_err(|error| format!("缓存索引格式无效：{error}"))?;
    if cached.manifest_url != manifest_url {
        return Err("缓存来自另一个固件源。".to_string());
    }
    let mut parts = Vec::with_capacity(cached.parts.len());
    for part in cached.parts {
        let bytes = fs::read(&part.path)
            .map_err(|error| format!("读取缓存分片 {} 失败：{error}", part.path.display()))?;
        verify_bytes(&bytes, &part.sha256, Some(part.size))?;
        parts.push(FirmwarePart {
            offset: part.offset,
            bytes,
        });
    }
    validate_layout(&parts)?;
    Ok(FirmwarePackage {
        name: cached.name,
        version: cached.version,
        source: "cache".to_string(),
        parts,
    })
}

fn validate_remote_url(value: &str, kind: &str) -> Result<Url, String> {
    let url = Url::parse(value).map_err(|error| format!("{kind}地址无效：{error}"))?;
    let is_local_http =
        url.scheme() == "http" && matches!(url.host_str(), Some("localhost" | "127.0.0.1" | "::1"));
    if url.scheme() != "https" && !is_local_http {
        return Err(format!("{kind}必须使用 HTTPS（本机测试地址除外）。"));
    }
    Ok(url)
}

fn download_bytes(client: &Client, url: &Url, limit: u64, kind: &str) -> Result<Vec<u8>, String> {
    let response = client
        .get(url.clone())
        .send()
        .map_err(|error| format!("下载{kind}失败：{error}"))?
        .error_for_status()
        .map_err(|error| format!("下载{kind}失败：{error}"))?;
    if response.content_length().is_some_and(|size| size > limit) {
        return Err(format!("{kind}超过 {} MiB 安全限制。", limit / 1024 / 1024));
    }
    let bytes = response
        .bytes()
        .map_err(|error| format!("读取{kind}失败：{error}"))?;
    if bytes.is_empty() {
        return Err(format!("{kind}是空文件。"));
    }
    if bytes.len() as u64 > limit {
        return Err(format!("{kind}超过 {} MiB 安全限制。", limit / 1024 / 1024));
    }
    Ok(bytes.to_vec())
}

fn validate_digest(expected: &str) -> Result<(), String> {
    if expected.len() != 64 || !expected.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Err("每个远程固件分片都必须提供 64 位十六进制 SHA-256。".to_string());
    }
    Ok(())
}

fn verify_bytes(bytes: &[u8], expected: &str, expected_size: Option<u64>) -> Result<(), String> {
    if bytes.is_empty() {
        return Err("固件分片是空文件。".to_string());
    }
    if bytes.len() as u64 > MAX_PART_BYTES {
        return Err("固件分片超过安全大小限制。".to_string());
    }
    if expected_size.is_some_and(|size| size != bytes.len() as u64) {
        return Err("固件分片大小与清单不一致。".to_string());
    }
    let actual = hex_digest(bytes);
    if !actual.eq_ignore_ascii_case(expected) {
        return Err("固件分片 SHA-256 校验失败，已拒绝烧录。".to_string());
    }
    Ok(())
}

fn validate_layout(parts: &[FirmwarePart]) -> Result<(), String> {
    let mut ranges = parts
        .iter()
        .map(|part| {
            let end = part
                .offset
                .checked_add(part.bytes.len() as u32)
                .ok_or_else(|| "固件分片地址溢出。".to_string())?;
            Ok((part.offset, end))
        })
        .collect::<Result<Vec<_>, String>>()?;
    ranges.sort_unstable_by_key(|range| range.0);
    if ranges.windows(2).any(|pair| pair[0].1 > pair[1].0) {
        return Err("固件分片地址互相重叠，已拒绝烧录。".to_string());
    }
    Ok(())
}

fn safe_component(value: &str) -> String {
    let value = value
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || matches!(character, '.' | '-' | '_') {
                character
            } else {
                '_'
            }
        })
        .take(80)
        .collect::<String>();
    if value.is_empty() {
        "unknown".to_string()
    } else {
        value
    }
}

fn hex_digest(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn write_atomic(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let temporary = path.with_extension("part");
    fs::write(&temporary, bytes)
        .map_err(|error| format!("写入临时缓存 {} 失败：{error}", temporary.display()))?;
    fs::rename(&temporary, path)
        .map_err(|error| format!("保存固件缓存 {} 失败：{error}", path.display()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        io::{Read, Write},
        net::TcpListener,
        thread,
        time::{SystemTime, UNIX_EPOCH},
    };

    #[test]
    fn rejects_overlapping_firmware_parts() {
        let parts = vec![
            FirmwarePart {
                offset: 0x1000,
                bytes: vec![0; 0x2000],
            },
            FirmwarePart {
                offset: 0x2000,
                bytes: vec![0; 0x1000],
            },
        ];
        assert!(validate_layout(&parts).is_err());
    }

    #[test]
    fn validates_sha256_before_flash() {
        let bytes = b"openblock";
        let digest = hex_digest(bytes);
        assert!(verify_bytes(bytes, &digest, Some(bytes.len() as u64)).is_ok());
        assert!(verify_bytes(bytes, &"0".repeat(64), None).is_err());
    }

    #[test]
    fn loads_and_verifies_bundled_firmware() {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("openblock-bundled-firmware-{unique}"));
        let binaries = root.join("binaries");
        fs::create_dir_all(&binaries).unwrap();
        let images = [
            ("boot.bin", 0x1000_u32, vec![0xe9, 1, 2, 3]),
            ("partitions.bin", 0x8000_u32, vec![4, 5, 6, 7]),
            ("app.bin", 0x10000_u32, vec![8, 9, 10, 11]),
        ];
        let parts = images
            .iter()
            .map(|(name, offset, bytes)| {
                fs::write(binaries.join(name), bytes).unwrap();
                serde_json::json!({
                    "path": format!("./binaries/{name}"),
                    "offset": offset,
                    "size": bytes.len(),
                    "sha256": hex_digest(bytes),
                })
            })
            .collect::<Vec<_>>();
        let manifest_path = root.join("firmware-manifest.json");
        fs::write(
            &manifest_path,
            serde_json::to_vec(&serde_json::json!({
                "name": "Bundled firmware",
                "version": "1.2.3",
                "builds": [{"chipFamily": "ESP32", "parts": parts}],
            }))
            .unwrap(),
        )
        .unwrap();

        let package = load_local_firmware(&manifest_path).unwrap();
        assert_eq!(package.name, "Bundled firmware");
        assert_eq!(package.version, "1.2.3");
        assert_eq!(package.source, "bundled");
        assert_eq!(package.parts.len(), 3);

        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn downloads_verifies_and_reopens_cached_release() {
        let images = [
            ("/boot.bin", 0x1000_u32, vec![0xe9, 1, 2, 3]),
            ("/partitions.bin", 0x8000_u32, vec![4, 5, 6, 7]),
            ("/app.bin", 0x10000_u32, vec![8, 9, 10, 11]),
        ];
        let parts = images
            .iter()
            .map(|(path, offset, bytes)| {
                serde_json::json!({
                    "path": format!(".{}", path),
                    "offset": offset,
                    "size": bytes.len(),
                    "sha256": hex_digest(bytes),
                })
            })
            .collect::<Vec<_>>();
        let manifest = serde_json::to_vec(&serde_json::json!({
            "name": "Test firmware",
            "version": "9.8.7",
            "builds": [{"chipFamily": "ESP32", "parts": parts}],
        }))
        .unwrap();
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let responses = images
            .iter()
            .map(|(path, _, bytes)| ((*path).to_string(), bytes.clone()))
            .chain(std::iter::once((
                "/firmware-manifest.json".to_string(),
                manifest,
            )))
            .collect::<std::collections::HashMap<_, _>>();
        let server = thread::spawn(move || {
            for stream in listener.incoming().take(4) {
                let mut stream = stream.unwrap();
                let mut request = [0_u8; 2048];
                let length = stream.read(&mut request).unwrap();
                let request = String::from_utf8_lossy(&request[..length]);
                let path = request
                    .lines()
                    .next()
                    .and_then(|line| line.split_whitespace().nth(1))
                    .unwrap();
                let body = responses.get(path).unwrap();
                write!(
                    stream,
                    "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                    body.len()
                )
                .unwrap();
                stream.write_all(body).unwrap();
            }
        });
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let cache = std::env::temp_dir().join(format!("openblock-firmware-test-{unique}"));
        fs::create_dir_all(&cache).unwrap();
        let url = format!("http://{address}/firmware-manifest.json");

        let downloaded = download_firmware(&url, &cache).unwrap();
        assert_eq!(downloaded.version, "9.8.7");
        assert_eq!(downloaded.source, "online");
        assert_eq!(downloaded.parts.len(), 3);
        let cached = load_cached_firmware(&url, &cache).unwrap();
        assert_eq!(cached.version, "9.8.7");
        assert_eq!(cached.source, "cache");

        server.join().unwrap();
        fs::remove_dir_all(cache).unwrap();
    }
}
