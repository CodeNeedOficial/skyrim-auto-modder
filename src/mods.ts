import { invoke } from "@tauri-apps/api/core";
import type { InstalledMod, UninstallResult } from "./types";
import { state } from "./state";
import { loadInstallLogs } from "./installer";

export async function loadInstalledMods(shouldRender = true): Promise<void> {
  try {
    state.installedMods = await invoke<InstalledMod[]>("list_installed_mods");
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  }
}

export async function uninstallMod(id: string): Promise<void> {
  const mod = state.installedMods.find((item) => item.id === id);
  if (!mod) {
    state.status = "Installed mod was not found.";
    return;
  }

  const confirmed = window.confirm(
    `Uninstall ${mod.name}? Files that existed before this install will be preserved.`
  );
  if (!confirmed) {
    return;
  }

  try {
    const result = await invoke<UninstallResult>("uninstall_mod", { id });
    await loadInstalledMods(false);
    await loadInstallLogs(false);
    state.status = `Uninstalled ${result.name}. Removed ${result.removed_files} file${result.removed_files === 1 ? "" : "s"}; preserved ${result.skipped_files}. Archive kept at ${result.archive_path}.`;
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  }
}
