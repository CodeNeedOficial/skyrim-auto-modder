# 🗺️ Function Map - Quick Reference

## 🎯 Find Functions by Purpose

### 🔍 Installation Detection & Validation

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `scan_skyrim_installations()` | 141 | 🔎 Scan Steam libs | `Vec<SkyrimInstallation>` |
| `validate_skyrim_path(path)` | 159 | ✓ Validate path | `SkyrimInstallation` |
| `inspect_installation(path)` | 417 | 🔍 Check Skyrim folder | `SkyrimInstallation` |
| `steam_libraries()` | 855 | 📁 Find Steam folders | `Vec<PathBuf>` |
| `parse_libraryfolders(path)` | 882 | 📄 Parse Steam config | `Vec<PathBuf>` |
| `find_manifest_for_game(dir)` | 906 | 📋 Find Steam manifest | `Option<PathBuf>` |

### 🔑 Nexus API & Authentication

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `save_nexus_api_key(key)` | 172 | 💾 Save API key | `NexusAuthStatus` |
| `get_nexus_auth_status()` | 195 | 🔑 Check auth | `NexusAuthStatus` |
| `validate_nexus_api_key(key)` | 457 | ✓ Test API key | `NexusAuthStatus` |
| `resolve_nexus_download_url(link)` | 475 | 📥 Get download URL | `String` |
| `choose_default_nexus_file(id, key)` | 549 | 🎯 Auto-select file | `u64` |
| `parse_nexus_link(input)` | 584 | 🔗 Parse nexusmods.com | `Option<NexusResolvedLink>` |
| `parse_nxm_link(input)` | 626 | 🔗 Parse nxm:// | `NexusResolvedLink` |
| `nexus_client()` | 667 | 🌐 HTTP client | `Client` |
| `load_nexus_api_key()` | 989 | 📖 Read API key | `Option<String>` |
| `nexus_download_error_message()` | 537 | ⚠️ Format error | `String` |

### 📥 Mod Installation

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `install_mod_from_url(url, dir)` | 331 | 📦 Main install flow | `ModInstallResult` |
| `resolve_download_source(input)` | 409 | 🔗 Parse mod URL | `String` |
| `download_file(url, dest)` | 694 | ⬇️ Download archive | `()` |
| `extract_archive(src, dest)` | 712 | 📦 Extract files | `()` |
| `detect_install_root(staging)` | 729 | 🎯 Find install dir | `PathBuf` |
| `copy_tree(src, dest)` | 757 | 📋 Copy files | `Vec<InstalledFile>` |
| `install_extracted_mod(root, ...)` | 783 | 💾 Install to Data | `Vec<InstalledFile>` |
| `is_skse_runtime_layout(root)` | 791 | 🔍 Detect SKSE | `bool` |
| `install_skse_runtime(root, ...)` | 807 | ⚙️ Install SKSE | `Vec<InstalledFile>` |
| `detect_install_warnings(root)` | 838 | ⚠️ Check for issues | `Vec<String>` |

### 📚 Installed Mods Management

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `list_installed_mods()` | 208 | 📋 Load mod list | `Vec<InstalledMod>` |
| `uninstall_mod(id)` | 226 | 🗑️ Remove mod | `UninstallResult` |
| `save_installed_mod(mod)` | 978 | 💾 Save manifest | `()` |
| `installed_mod_manifest_path(id)` | 959 | 📄 Path to manifest | `PathBuf` |

### 📜 Installation Logs

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `list_install_logs()` | 294 | 📜 Load history | `Vec<InstallLogEntry>` |
| `clear_install_logs()` | 307 | 🗑️ Clear history | `()` |
| `append_install_log_entry(...)` | 316 | ✍️ Add log entry | `()` |
| `append_install_log(entry)` | 942 | 💾 Save to log | `()` |

### 💾 File & Path Management

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `home_dir()` | 913 | 🏠 Get home dir | `Option<PathBuf>` |
| `path_to_string(path)` | 917 | 🔤 Convert path | `String` |
| `app_data_dir()` | 921 | 📁 User data dir | `PathBuf` |
| `app_config_dir()` | 926 | ⚙️ Config dir | `PathBuf` |
| `nexus_config_path()` | 934 | 📄 nexus.json path | `PathBuf` |
| `install_logs_path()` | 938 | 📜 Log file path | `PathBuf` |
| `installed_mods_dir()` | 955 | 📁 Mods dir | `PathBuf` |
| `local_archives_dir()` | 963 | 📁 Archives dir | `PathBuf` |
| `copy_archive_to_local_store(...)` | 967 | 💾 Save archive | `PathBuf` |
| `filename_from_url(url)` | 1002 | 🔤 Extract filename | `Option<String>` |
| `sanitize_filename(name)` | 1008 | 🔤 Clean filename | `String` |
| `timestamp()` | 1020 | ⏰ Unix timestamp | `u64` |

### 🎮 Save Games & Game Launch

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `get_saves_locations(dir)` | 1028 | 🎮 Find saves | `Vec<SavesLocation>` |
| `count_save_files(dir)` | 1110 | 📊 Count .ess | `usize` |
| `run_skyrim(dir, use_skse)` | 1132 | ▶️ Launch game | `String` |
| `run_natively(exe)` | 1181 | 🖥️ Direct launch | `()` |
| `run_with_proton(exe, dir)` | 1188 | 🍷 Proton launch | `()` |

### 🔧 Utility Functions

| Function | Line | Purpose | Returns |
|----------|------|---------|---------|
| `ensure_command_exists(cmd)` | 681 | ✓ Check curl/tar | `()` |
| `directory_entries(path)` | 750 | 📁 List dir | `Vec<PathBuf>` |

---

## 🔄 Common Call Flows

### Installation Workflow
```
install_mod_from_url()
  ├─ inspect_installation()
  ├─ resolve_download_source()
  │   └─ parse_nexus_link() → resolve_nexus_download_url()
  ├─ download_file()
  ├─ extract_archive()
  ├─ detect_install_root()
  ├─ install_extracted_mod()
  │   ├─ is_skse_runtime_layout()
  │   └─ copy_tree() or install_skse_runtime()
  ├─ detect_install_warnings()
  ├─ save_installed_mod()
  └─ append_install_log()
```

### Skyrim Launch Workflow
```
run_skyrim(dir, use_skse)
  ├─ inspect_installation()
  ├─ Detect Proton (check steam manifest)
  ├─ If Proton: run_with_proton()
  └─ Else: run_natively()
```

### Uninstall Workflow
```
uninstall_mod(id)
  ├─ Load manifest from installed_mod_manifest_path()
  ├─ Verify game_dir
  ├─ For each file in manifest:
  │   └─ If not pre-existing: delete
  ├─ Delete manifest file
  └─ append_install_log()
```

### Nexus Authentication
```
save_nexus_api_key(key)
  ├─ validate_nexus_api_key()
  │   └─ Call /users/validate endpoint
  └─ Save to nexus_config_path()

get_nexus_auth_status()
  ├─ load_nexus_api_key()
  └─ validate_nexus_api_key()
```

---

## 📊 Data Flow

### Frontend → Backend → Disk

```
TypeScript (main.ts)
    ↓ Tauri invoke()
Rust Command (e.g., install_mod_from_url)
    ↓
Helper functions (download, extract, copy)
    ↓
Disk operations (.local/skyrim-auto-modder/)
    ↓
JSON files (manifests, logs)
```

### Disk Storage Layout

```
.local/skyrim-auto-modder/          ← app_config_dir()
├── nexus.json                       ← Nexus API key
├── install-log.json                 ← Installation history
├── installed-mods/                  ← installed_mods_dir()
│   ├── mod-id-1.json               ← Manifest for mod 1
│   ├── mod-id-2.json               ← Manifest for mod 2
│   └── ...
└── archives/                        ← local_archives_dir()
    ├── mod-1.zip                   ← Downloaded archives
    ├── mod-2.7z
    └── ...

~/.local/share/skyrim-auto-modder/  ← app_data_dir()
├── downloads/                       ← Temp downloads
└── staging/                         ← Temp extract dirs
```

---

## 🎯 Entry Points from TypeScript

These are called from `src/main.ts`:

1. **Installation**
   - `scan_skyrim_installations()` - Find installed game
   - `validate_skyrim_path(path)` - Verify user selection

2. **Nexus Configuration**
   - `save_nexus_api_key(key)` - Configure API
   - `get_nexus_auth_status()` - Check auth

3. **Mod Management**
   - `install_mod_from_url(url, dir)` - Install mod
   - `list_installed_mods()` - Load mod list
   - `uninstall_mod(id)` - Remove mod

4. **Logging**
   - `list_install_logs()` - View history
   - `clear_install_logs()` - Clear history
   - `append_install_log_entry(...)` - Manual log

5. **Game Launch**
   - `get_saves_locations(dir)` - Find saves
   - `run_skyrim(dir, use_skse)` - Launch game

---

## 🔍 Search Tips

| Goal | Search Pattern |
|------|-----------------|
| Find all Tauri commands | `#[tauri::command]` |
| Find all HTTP calls | `reqwest` or `Client` |
| Find all file operations | `fs::` or `Path` |
| Find Nexus API calls | `NEXUS_API_BASE` |
| Find config paths | `app_config_dir` or `.local` |
| Find SKSE handling | `skse64` or `is_skse` |
| Find Steam code | `SKYRIM_APP_ID` or `steam` |
| Find installation logic | `install_extracted_mod` |

---

*Keep this file open while editing lib.rs for quick reference!*
