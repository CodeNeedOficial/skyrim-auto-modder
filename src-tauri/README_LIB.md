# 📖 lib.rs Documentation

This folder contains complete Rust backend for Skyrim Auto Modder.

## 📚 Documentation Files

### 🗺️ [FUNCTION_MAP.md](./FUNCTION_MAP.md)
**Quick reference for all functions**
- Find functions by purpose (🔍 Installation, 🔑 API, 📥 Install, etc.)
- Call flow diagrams
- Data storage layout
- Search tips

**Use this to:** Quickly locate a function or understand data flow

### 📖 [LIB_STRUCTURE.md](./LIB_STRUCTURE.md)
**Detailed breakdown of entire lib.rs**
- All 15 sections explained
- Each function documented
- Key concepts explained
- Debugging tips

**Use this to:** Understand how a feature works or debug issues

## 🗂️ File Organization

```
src/lib.rs (1,246 lines)
├─ SECTION 1: Imports & Constants (lines 1-20)
├─ SECTION 2: Type Definitions (lines 22-138)
├─ SECTION 3: Commands - Installation (lines 141-169)
├─ SECTION 4: Commands - Nexus API (lines 172-206)
├─ SECTION 5: Commands - Mods (lines 208-291)
├─ SECTION 6: Commands - Logs (lines 294-328)
├─ SECTION 7: Command - Mod Install (lines 331-407)
├─ SECTION 8: Helpers - Installation (lines 417-455)
├─ SECTION 9: Helpers - Nexus API (lines 457-679)
├─ SECTION 10: Helpers - Archives (lines 681-836)
├─ SECTION 11: Helpers - Paths & Config (lines 913-1020)
├─ SECTION 12: Commands - Saves & Game (lines 1028-1211)
├─ SECTION 13: Helpers - Saves (lines 1110-1129)
├─ SECTION 14: Helpers - Game Launch (lines 1181-1211)
└─ SECTION 15: Entry Point (lines 1214-1246)
```

## 🔍 How to Navigate

### Find a Function
1. Open FUNCTION_MAP.md
2. Search for function name in table
3. Note the line number
4. Press Ctrl+G in editor to jump to line

### Understand a Feature
1. Look up feature in FUNCTION_MAP.md "Common Call Flows"
2. Follow the call chain
3. Check LIB_STRUCTURE.md for each function's explanation

### Debug an Issue
1. Check "Debugging Tips" in LIB_STRUCTURE.md
2. Use search patterns from FUNCTION_MAP.md
3. Look at related data structures in SECTION 2

## 📋 Key Sections

### Types (SECTION 2)
All Rust structs that serialize to TypeScript:
- `SkyrimInstallation` - Skyrim game info
- `ModInstallResult` - Mod installation result
- `InstalledMod` - Installed mod manifest
- etc.

### Commands (SECTIONS 3-7, 12)
Functions called from frontend:
- Installation detection
- API authentication
- Mod installation/uninstallation
- Game launching

### Helpers (SECTIONS 8-11, 13-14)
Internal utility functions:
- Skyrim validation
- Nexus API calls
- Archive operations
- File system operations

## 🚀 Common Tasks

### Find where API keys are saved
→ Search for `nexus_config_path()` in FUNCTION_MAP.md

### Find mod installation logic
→ Search for `install_mod_from_url()` and follow call flow

### Find SKSE handling
→ Search for `is_skse_runtime_layout()` in FUNCTION_MAP.md

### Find game launch logic
→ Search for `run_skyrim()` in FUNCTION_MAP.md

### Find Proton integration
→ Search for `run_with_proton()` in FUNCTION_MAP.md

### Find safe uninstall logic
→ Search for `uninstall_mod()` in FUNCTION_MAP.md

## 📍 Line Markers

lib.rs has section headers marked with:
```
// ════════════════════════════════════════════════════════════════════════════════
// SECTION N: NAME
// ════════════════════════════════════════════════════════════════════════════════
```

Search for "SECTION" to jump between sections.

## 💻 Editor Tips

### VS Code
- Press Ctrl+G to open "Go to Line" dialog
- Press Ctrl+F to find by name or pattern
- Press Ctrl+H to find and replace

### Search Patterns
- `fn function_name(` - Find function
- `SECTION \d+:` - Find section header
- `struct .*Name` - Find struct
- `const.*=` - Find constant

## 🔗 Related Files

- **Frontend:** `../src/main.ts` - TypeScript calling these Rust functions
- **Config:** `./tauri.conf.json` - Tauri app configuration  
- **Manifest:** `./Cargo.toml` - Rust dependencies
- **API Responses:** Types in SECTION 2 match TypeScript interfaces

## 📞 Common Questions

**Q: Where are installed mods stored?**
A: `.local/skyrim-auto-modder/installed-mods/` - Look for `installed_mods_dir()`

**Q: How does safe uninstall work?**
A: Every file is tracked in manifest - only files we copied are deleted

**Q: How does SKSE installation work?**
A: Loader goes to game root, Data content goes to Data folder - See `install_skse_runtime()`

**Q: How does Proton support work?**
A: Detected via Steam manifest, game runs via Wine/Proton env - See `run_with_proton()`

**Q: How are Nexus links parsed?**
A: Both `nexusmods.com` and `nxm://` supported - See `parse_nexus_link()` and `parse_nxm_link()`

## 📈 Statistics

| Metric | Value |
|--------|-------|
| Total lines | 1,246 |
| Functions | 45 |
| Type structs | 14 |
| Tauri commands | 12 |
| Helper functions | 33 |
| Code sections | 15 |

## ✅ Code Quality

All code is:
- ✅ Fully documented with section headers
- ✅ Organized by functionality
- ✅ Uses descriptive function names
- ✅ Includes error handling with Result types
- ✅ Compiles without warnings

---

**Start with FUNCTION_MAP.md for quick lookup, then LIB_STRUCTURE.md for detailed explanations!**
