# 📖 lib.rs - Complete Structure Guide

## 🗂️ File Overview

The `lib.rs` file contains **1,246 lines** of Rust code organized into **15 major sections**.

### Quick Navigation

Find functions quickly by searching for these patterns in your editor:

```
// SECTION 1: IMPORTS & CONSTANTS
// SECTION 2: TYPE DEFINITIONS
// SECTION 3: TAURI COMMANDS - INSTALLATION
// SECTION 4: TAURI COMMANDS - NEXUS API
// SECTION 5: TAURI COMMANDS - INSTALLED MODS
// SECTION 6: TAURI COMMANDS - LOGS
// SECTION 7: TAURI COMMAND - MOD INSTALLATION
// SECTION 8: HELPER FUNCTIONS - INSTALLATION
// SECTION 9: HELPER FUNCTIONS - NEXUS API
// SECTION 10: HELPER FUNCTIONS - ARCHIVE OPERATIONS
// SECTION 11: HELPER FUNCTIONS - PATHS & CONFIG
// SECTION 12: TAURI COMMANDS - SAVES & GAME
// SECTION 13: HELPER FUNCTIONS - SAVES
// SECTION 14: HELPER FUNCTIONS - GAME LAUNCHING
// SECTION 15: ENTRY POINT
```

---

## 📋 Sections Breakdown

### ✅ SECTION 1: IMPORTS & CONSTANTS (Lines 1-20)

**Purpose:** Load external crates and define application constants

**Constants:**
- `SKYRIM_APP_ID = "489830"` - Steam app ID
- `SKYRIM_DIR_NAME = "Skyrim Special Edition"` - Game folder name
- `NEXUS_API_BASE = "https://api.nexusmods.com/v1"` - API endpoint
- `APP_VERSION = "0.1.0"` - App version

**Key Imports:**
- `reqwest` - HTTP client for API calls
- `serde` - JSON serialization
- `std::fs`, `std::path` - File system operations

---

### 📦 SECTION 2: TYPE DEFINITIONS (Lines 22-138)

**Purpose:** Define all Rust structs that serialize to/from TypeScript

| Struct | Purpose | Fields |
|--------|---------|--------|
| `SkyrimInstallation` | Represents a Skyrim install | name, game_dir, data_dir, exe_path, skse_loader_path, valid, issues |
| `SavesLocation` | Save game folder location | name, path, exists, save_count |
| `ModInstallResult` | Result of mod install | name, source_url, archive_path, copied_files, warnings |
| `InstalledFile` | File installed by mod | path, existed_before |
| `InstalledMod` | Mod manifest (persisted) | id, name, source_url, copied_files, installed_at |
| `UninstallResult` | Result of uninstall | id, name, removed_files, skipped_files |
| `InstallLogEntry` | History log entry | id, timestamp, action, url, ok, message |
| `NexusConfig` | API key storage | api_key |
| `NexusAuthStatus` | API auth status | configured, user_name, is_premium |

---

### 🔌 SECTION 3: TAURI COMMANDS - INSTALLATION (Lines 141-169)

These functions are called from TypeScript via Tauri IPC.

#### `scan_skyrim_installations()` 
- **Purpose:** Search Steam library folders for Skyrim
- **Returns:** `Vec<SkyrimInstallation>`
- **Used for:** Installation detection on app startup
- **Flow:** Steam libs → Find Skyrim → Validate → Return list

#### `validate_skyrim_path(path: String)`
- **Purpose:** Validate a user-selected folder is Skyrim
- **Returns:** `SkyrimInstallation` with validation result
- **Used for:** Manual path selection
- **Checks:** SkyrimSE.exe, Skyrim.esm, Update.esm exist

---

### 🔑 SECTION 4: TAURI COMMANDS - NEXUS API (Lines 172-206)

#### `save_nexus_api_key(api_key: String)`
- **Purpose:** Save and validate Nexus Mods API key
- **Returns:** `NexusAuthStatus` with username and premium status
- **Saves to:** `.local/skyrim-auto-modder/nexus.json`
- **Flow:** Validate key → Contact Nexus → Save if valid

#### `get_nexus_auth_status()`
- **Purpose:** Check current API authentication status
- **Returns:** `NexusAuthStatus`
- **Flow:** Load nexus.json → Validate → Return status

---

### 📥 SECTION 5: TAURI COMMANDS - INSTALLED MODS (Lines 208-291)

#### `list_installed_mods()`
- **Purpose:** Load all installed mods from disk
- **Returns:** `Vec<InstalledMod>` (sorted by install date)
- **Reads from:** `.local/skyrim-auto-modder/installed-mods/*.json`
- **Each mod has:** Manifest with all copied file paths for safe uninstall

#### `uninstall_mod(id: String)`
- **Purpose:** Remove all files from a mod installation
- **Returns:** `UninstallResult` showing files removed
- **Safety:** Only deletes files that were copied (not pre-existing)
- **Flow:** Load manifest → Remove files → Delete manifest → Log action

---

### 📜 SECTION 6: TAURI COMMANDS - LOGS (Lines 294-328)

#### `list_install_logs()`
- **Purpose:** Load installation history
- **Returns:** `Vec<InstallLogEntry>` (newest first)
- **Reads from:** `.local/skyrim-auto-modder/install-log.json`

#### `clear_install_logs()`
- **Purpose:** Clear entire installation history
- **Returns:** `()`

#### `append_install_log_entry(...)`
- **Purpose:** Manually add a log entry
- **Usage:** Frontend logging manual actions

---

### 💾 SECTION 7: TAURI COMMAND - MOD INSTALLATION (Lines 331-407)

#### `install_mod_from_url(url: String, game_dir: String)`

**The main workflow:**

1. **Validate input** - Check Skyrim Data folder exists
2. **Parse URL** - Support http://, https://, nxm://, nexusmods.com
3. **Resolve source** - Handle Nexus special cases
4. **Download** - Save to `~/.local/share/skyrim-auto-modder/downloads/`
5. **Extract** - Decompress with `bsdtar`
6. **Detect layout** - Find Data/ folder or SKSE layout
7. **Validate** - Check for FOMOD, SKSE plugins
8. **Install** - Copy files to Data/ (normal) or game root (SKSE)
9. **Save manifest** - Store file list for safe uninstall
10. **Log action** - Record in install history

**Returns:** `ModInstallResult` with summary

---

### 🎮 SECTION 8 & 12: INSTALLATION & SAVES/GAME (Lines 417-455, 1028-1211)

#### `inspect_installation(game_dir: &Path)` 
- **Purpose:** Validate a Skyrim folder
- **Checks:** 
  - SkyrimSE.exe exists
  - Data/Skyrim.esm exists
  - Data/Update.esm exists
  - SKSE loader detected
- **Returns:** `SkyrimInstallation` with status and issues list

#### `get_saves_locations(game_dir: String)`
- **Purpose:** Find all Skyrim save files
- **Checks three locations:**
  1. **Standard:** `~/Documents/My Games/Skyrim Special Edition/Saves`
  2. **Proton:** `~/.local/share/Steam/steamapps/compatdata/489830/pfx/.../Saves`
  3. **Game dir:** `<game_dir>/Saves`
- **Returns:** `Vec<SavesLocation>` with file counts

#### `run_skyrim(game_dir: String, use_skse: bool)`
- **Purpose:** Launch Skyrim game
- **Detects:** Proton vs native execution
- **With SKSE:** Runs `skse64_loader.exe` instead of `SkyrimSE.exe`
- **Via Proton:** Sets up Wine/Proton environment variables
- **Returns:** Success message or error

---

### 🔧 SECTION 9: HELPER FUNCTIONS - NEXUS API (Lines 457-679)

#### `validate_nexus_api_key(api_key: &str)`
- Calls `/users/validate` endpoint
- Returns username and premium status

#### `resolve_nexus_download_url(link: NexusResolvedLink)`
- Calls `/mods/{id}/files/{id}/download_link`
- Handles Premium-only downloads
- Returns actual download URL

#### `choose_default_nexus_file(mod_id: u64, api_key: &str)`
- Auto-selects main/primary file
- Falls back to newest file
- Returns file ID for download

#### `parse_nexus_link(input: &str)`
- Parses `nexusmods.com` URLs
- Extracts mod ID and optional file ID

#### `parse_nxm_link(input: &str)`
- Parses `nxm://` Mod Manager Download links
- Extracts mod ID, file ID, key, expires

---

### 📦 SECTION 10: HELPER FUNCTIONS - ARCHIVE OPERATIONS (Lines 681-836)

#### `download_file(url: &str, destination: &Path)`
- Uses `curl` CLI tool
- Downloads to destination with `-L` (follow redirects)

#### `extract_archive(archive_path: &Path, destination: &Path)`
- Uses `bsdtar` CLI tool
- Supports .zip, .7z, .rar formats

#### `detect_install_root(staging_dir: &Path)`
- Finds the correct install directory in extracted archive
- Handles single-folder archives
- Handles nested Data/ structures
- Detects SKSE runtime layout

#### `copy_tree(source: &Path, destination: &Path)`
- Recursively copies directory tree
- Tracks which files already existed
- Returns list of installed files

#### `install_extracted_mod(install_root: &Path, game_dir: &Path, data_dir: &Path)`
- Detects SKSE vs normal mod
- Routes to appropriate install function

#### `is_skse_runtime_layout(install_root: &Path)`
- Checks for `skse64_loader.exe` or `skse64_*.dll`

#### `install_skse_runtime(install_root: &Path, game_dir: &Path, data_dir: &Path)`
- **Special handling for SKSE:**
  - Copies loader/DLLs to game root
  - Copies bundled Data to Data folder
  - Skips `src` folder

#### `detect_install_warnings(install_root: &Path)`
- Detects FOMOD installer folders
- Detects SKSE plugin folders in Data
- Detects SKSE runtime layout

---

### 🗂️ SECTION 11: HELPER FUNCTIONS - PATHS & CONFIG (Lines 913-1020)

**Configuration directories:**
- `app_config_dir()` → `.local/skyrim-auto-modder/` (relative to project)
- `app_data_dir()` → `~/.local/share/skyrim-auto-modder/` (user data)

**Configuration files:**
- `nexus_config_path()` → `.local/skyrim-auto-modder/nexus.json`
- `install_logs_path()` → `.local/skyrim-auto-modder/install-log.json`
- `installed_mods_dir()` → `.local/skyrim-auto-modder/installed-mods/`
- `local_archives_dir()` → `.local/skyrim-auto-modder/archives/`

**Utility functions:**
- `sanitize_filename()` - Remove special characters
- `filename_from_url()` - Extract filename from URL
- `timestamp()` - Get current Unix timestamp
- `home_dir()` - Get $HOME
- `path_to_string()` - Convert PathBuf to String

---

### 🎮 SECTION 14: GAME LAUNCHING (Lines 1181-1211)

#### `run_natively(exe_path: &str)`
- Direct execution of SkyrimSE.exe or skse64_loader.exe
- Used when no Proton detected

#### `run_with_proton(exe_path: &str, game_dir: &str)`
- Sets up Proton/Wine environment
- Sets `STEAM_COMPAT_TOOL_PATHS`
- Sets `PROTON_USE_WINED3D=1`
- Changes to game directory
- Executes via `sh -c`

---

### 🚀 SECTION 15: ENTRY POINT (Lines 1214-1246)

#### `run()`
- **Tauri app initialization**
- Registers plugins:
  - `tauri_plugin_single_instance` - Only one instance
  - `tauri_plugin_deep_link` - Handle nxm:// links
  - `tauri_plugin_dialog` - File dialogs
  - `tauri_plugin_opener` - Open URLs
- Registers deep-link handler for `nxm://` protocol
- Registers all commands with `invoke_handler`
- Starts Tauri app

---

## 🔍 How to Find Code

### By Function
Search for: `fn function_name(`

### By Feature
- **Skyrim detection:** Search "inspect_installation"
- **Mod installation:** Search "install_mod_from_url"
- **Nexus API:** Search "nexus_client" or "NEXUS_API"
- **SKSE handling:** Search "is_skse_runtime_layout"
- **Proton launch:** Search "run_with_proton"
- **Save game location:** Search "get_saves_locations"
- **Uninstall:** Search "uninstall_mod"
- **Logging:** Search "append_install_log"

### By Line Number
Use Ctrl+G in your editor to jump to line number

---

## 📊 Statistics

- **Total lines:** 1,246
- **Functions:** 45
- **Types/Structs:** 14
- **Tauri Commands:** 12
- **Helper functions:** 33

---

## 🔗 Related Files

- **Frontend:** `src/main.ts` - TypeScript calling these commands
- **Config:** `src-tauri/tauri.conf.json` - App configuration
- **Types:** Struct definitions here are serialized to TypeScript

---

## 💡 Key Concepts

### Safe Uninstall
- Every file installed is tracked in JSON manifest
- Uninstall only deletes files that were copied by us
- Pre-existing files are preserved

### SKSE Special Handling
- SKSE loader/DLLs go next to SkyrimSE.exe
- SKSE Data folder content goes to Skyrim Data/
- Detected by presence of `skse64_*.dll` files

### Nexus API Limitations
- Premium accounts can download directly from nexusmods.com URLs
- Non-Premium must use nxm:// Mod Manager Download links
- App handles both via automatic file selection

### Proton Integration
- Detects Steam manifest to determine if Proton is needed
- Uses Wine/Proton compatibility layer for running
- Game directory must be Windows path format

---

## 🐛 Debugging Tips

1. **Check installation validity:** Look for `issues` field in `SkyrimInstallation`
2. **Review mod installation:** Check `.local/skyrim-auto-modder/install-log.json`
3. **Verify SKSE detection:** Search for `is_skse_runtime_layout()` usage
4. **Test Nexus API:** Call `validate_nexus_api_key()` with test key
5. **Review file tracking:** Check manifest files in `installed-mods/`

---

*Generated with comprehensive section comments for easy navigation*
