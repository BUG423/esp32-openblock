// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use openblock_link_rs::*;
use std::{
    sync::atomic::{AtomicBool, Ordering},
    thread,
    time::Duration,
};

mod firmware;

#[tauri::command]
fn list_firmware_ports() -> Result<Vec<firmware::SerialPortSummary>, String> {
    firmware::list_serial_ports()
}

#[tauri::command]
async fn flash_esp32_firmware(
    app: tauri::AppHandle,
    port: String,
    manifest_url: String,
) -> Result<firmware::FlashResult, String> {
    firmware::flash_firmware(app, port, manifest_url).await
}

static SERVER_STARTED: AtomicBool = AtomicBool::new(false);

#[cfg(target_os = "linux")]
fn configure_linux_graphics() {
    // WSLg can expose a D3D/Mesa route that WebKitGTK sees as available even
    // when EGL cannot create a screen. OpenBlock's WebGL stage then produces
    // black artifacts and repeated ZINK errors. Restrict the software fallback
    // to WSL and respect an explicit value supplied by the developer.
    if std::env::var_os("WSL_DISTRO_NAME").is_some()
        && std::env::var_os("LIBGL_ALWAYS_SOFTWARE").is_none()
    {
        std::env::set_var("LIBGL_ALWAYS_SOFTWARE", "1");
    }
}

#[cfg(not(target_os = "linux"))]
fn configure_linux_graphics() {}

#[tauri::command]
fn start_server() -> Result<bool, String> {
    if SERVER_STARTED.swap(true, Ordering::SeqCst) {
        return Ok(false);
    }

    logger_init();
    thread::spawn(|| loop {
        let server = AsyncWsRpcServer::new(SERVER_ADDR);
        if let Err(error) = server.run_sync() {
            log::error!("OpenBlock Link server stopped: {error}");
        }

        log::warn!("OpenBlock Link server stopped; retrying in 5 seconds");
        thread::sleep(Duration::from_secs(5));
    });

    Ok(true)
}

fn main() {
    configure_linux_graphics();
    tauri::Builder::default()
        .on_page_load(|webview, payload| {
            if matches!(payload.event(), tauri::webview::PageLoadEvent::Finished) {
                // The Rust shell is the authority for desktop runtime state.
                // Signal after the document and its deferred adapter are ready
                // so the UI never depends on WebView API injection timing.
                if let Err(error) = webview.eval(
                    r#"(() => {
                        window.__OPENBLOCK_DESKTOP_RUNTIME__ = true;
                        document.documentElement.classList.add('native-desktop');
                        const bindControls = () => {
                            const controls = document.querySelector('[data-testid="window-controls"]');
                            const dragRegion = document.querySelector('[data-testid="window-drag-region"]');
                            const getWin = () => (window.__TAURI__ && window.__TAURI__.window) ? window.__TAURI__.window.getCurrentWindow() : null;
                            if (controls && controls.dataset.nativeControlsBound !== 'true') {
                                controls.dataset.nativeControlsBound = 'true';
                                const minBtn = controls.querySelector('[data-window-action="minimize"]');
                                const maxBtn = controls.querySelector('[data-window-action="maximize"]');
                                const closeBtn = controls.querySelector('[data-window-action="close"]');
                                if (minBtn) minBtn.addEventListener('click', () => { const w = getWin(); if (w) w.minimize(); });
                                if (maxBtn) maxBtn.addEventListener('click', () => { const w = getWin(); if (w) w.toggleMaximize(); });
                                if (closeBtn) closeBtn.addEventListener('click', () => { const w = getWin(); if (w) w.close(); });
                            }
                            if (dragRegion && dragRegion.dataset.nativeDragBound !== 'true') {
                                dragRegion.dataset.nativeDragBound = 'true';
                                dragRegion.classList.add('native-window-drag-region');
                                dragRegion.title = '拖动窗口；双击最大化或还原';
                                dragRegion.addEventListener('mousedown', (e) => {
                                    if (e.button === 0 && e.detail === 1) {
                                        const w = getWin();
                                        if (w) w.startDragging();
                                    }
                                });
                                dragRegion.addEventListener('dblclick', () => {
                                    const w = getWin();
                                    if (w) w.toggleMaximize();
                                });
                            }
                        };
                        bindControls();
                        const observer = new MutationObserver(bindControls);
                        observer.observe(document.body, { childList: true, subtree: true });
                        window.dispatchEvent(new Event('openblock:desktop-ready'));
                    })()"#,
                ) {
                    log::error!("Failed to initialize desktop window controls: {error}");
                }
                if let Err(error) = webview.window().set_focus() {
                    log::warn!("Failed to focus the desktop window: {error}");
                }
                let _ = webview.eval_with_callback(
                    "(() => { const controls = document.querySelector('[data-testid=window-controls]'); \
                     const rect = controls && controls.getBoundingClientRect(); \
                     return JSON.stringify({url: location.href, \
                     editorDesktop: document.documentElement.classList.contains('native-desktop'), \
                     controlsDisplay: controls && getComputedStyle(controls).display, \
                     controlsRect: rect && {x: rect.x, width: rect.width, height: rect.height}}); })()",
                    |state| log::debug!("Desktop page state: {state}"),
                );
            }
        })
        .setup(|_| {
            // Device selection and connection live in OpenBlock's native top
            // bar. Start the local bridge with the desktop app so that flow
            // works without a duplicate connection page.
            start_server().map_err(std::io::Error::other)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_server,
            list_firmware_ports,
            flash_esp32_firmware
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
