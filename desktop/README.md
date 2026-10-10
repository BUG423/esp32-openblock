# 🖥️ OpenBlock Desktop

Tauri 2 desktop shell and Rust hardware-link service for the unified OpenBlock ESP32 portal.

## Structure

- `../build/`: generated standalone OpenBlock GUI frontend consumed by Tauri;
- `src-tauri/`: Tauri application and Rust configuration;
- `src-tauri/openblock-link-rs/`: hardware connection service.

## Development

Install Node.js 24+, Rust, and the Tauri 2 prerequisites for your operating system. From the repository root, run:

```bash
npm ci
npm run desktop:dev
```

Tauri's `beforeDevCommand` and `beforeBuildCommand` both run the unified portal pipeline, so the desktop app cannot accidentally package a stale standalone GUI.

The Rust hardware bridge starts with the desktop application. Select and connect hardware through OpenBlock's native controls at the top of the creation page; the portal deliberately has no separate connection screen.

The main window is frameless without repeating the application name. Its minimize, maximize/restore, and close controls are integrated into the right side of OpenBlock's existing blue toolbar. The logo is a desktop-only drag handle and double-click maximize target; it never navigates away from the editor.

The integrated Firmware Update dialog detects Tauri and uses native Rust serial flashing instead of Web Serial. It downloads the latest release manifest over HTTPS, requires a SHA-256 digest for each image, caches verified images, and falls back first to that cache and then to verified firmware bundled with the application. Disconnect a device from the creation runtime before flashing so the serial port is not held by two services.

## Build

```bash
npm run check:desktop
npm run desktop:build
```

Do not commit `target/`, local IDE settings, credentials, or generated installer output.

Do not distribute a Linux debug bundle launched through WSLg as a Windows build. WSLg uses the Linux WebKitGTK/Mesa path and can exhibit rendering artifacts unrelated to WebView2. The app applies a WSL-only software-rendering fallback when that environment is detected, while native Linux and Windows keep their normal graphics path. Use the `Desktop Windows package` GitHub Actions workflow (or a native Windows toolchain) for the release-mode NSIS installer. See `docs/desktop-architecture.md` for the runtime and release boundaries.
