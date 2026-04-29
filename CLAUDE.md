# CLAUDE.md

This project is a Tauri 2 desktop app for managing a local Skyrim Special Edition modding workflow on Linux.

## Commands

Use these commands from the repository root unless noted.

```bash
npm install
npm run tauri dev
npm run build
cd src-tauri && cargo check
```

If `npm run tauri dev` fails because port `1420` is already in use, check for a stale Vite process:

```bash
ss -ltnp 'sport = :1420'
ps -ef | rg 'vite --host|tauri dev|skyrim-auto-modder'
```

Stop only stale processes from this project.

## Architecture

- `src/main.ts`: frontend state, rendering, Tauri command calls, deep-link handling.
- `src/styles.css`: app styling.
- `src-tauri/src/lib.rs`: Tauri commands, Nexus API integration, archive download/extract/install logic, mod registry, uninstall logic.
- `src-tauri/tauri.conf.json`: Tauri app and deep-link configuration.
- `src-tauri/capabilities/default.json`: Tauri permission set.

The app uses plain TypeScript rendering, not React/Vue/Svelte.

## Local Data

Do not commit local user data or secrets. `.local/` is ignored by Git.

Important local paths:

```text
.local/skyrim-auto-modder/nexus.json
.local/skyrim-auto-modder/install-log.json
.local/skyrim-auto-modder/archives/
.local/skyrim-auto-modder/installed-mods/
```

Runtime download and staging data is stored under:

```text
~/.local/share/skyrim-auto-modder/downloads/
~/.local/share/skyrim-auto-modder/staging/
```

## Nexus Behavior

The app supports:

- Direct archive URLs.
- Nexus page URLs.
- `nxm://` Mod Manager Download links.

Non-Premium Nexus accounts generally need `nxm://` links with `key` and `expires`. Direct Nexus page URL download through the API can return `403 Forbidden` without Premium download access.

The app registers `nxm://` through `tauri-plugin-deep-link` and uses `tauri-plugin-single-instance` so links can be sent to an already-running app.

## Install And Uninstall Rules

Normal mods are copied into the selected Skyrim `Data` folder.

SKSE runtime archives are special:

- `skse64_loader.exe` and `skse64_*.dll` are copied beside `SkyrimSE.exe`.
- Bundled `Data` content is copied into the game's `Data` folder.
- `src` folders from SKSE archives are intentionally skipped.

Installed mods are recorded as JSON manifests. Uninstall removes only files copied by this app and preserves files that existed before install.

When changing install behavior, keep the manifest accurate. It is the safety boundary for uninstall.

## Verification

Before finishing code changes, run:

```bash
npm run build
cd src-tauri && cargo check
```

For UI changes, ensure startup still renders even if local JSON files are missing or empty.
