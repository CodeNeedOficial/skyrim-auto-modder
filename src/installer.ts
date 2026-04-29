import { invoke } from "@tauri-apps/api/core";
import type { ModInstallResult, InstallLog } from "./types";
import { state } from "./state";

export async function installModsFromLinks(links: string[]): Promise<void> {
  if (!state.selected) {
    state.status = "Please select a Skyrim installation first.";
    return;
  }

  const validLinks = links
    .map((link) => link.trim())
    .filter((link) => link.length > 0);

  if (validLinks.length === 0) {
    state.status = "No valid links provided.";
    return;
  }

  for (const link of validLinks) {
    try {
      const result = await invoke<ModInstallResult>("install_mod_from_url", {
        url: link,
        gameDir: state.selected.game_dir
      });
      
      await loadInstallLogs(false);
      
      state.status = `Installed ${result.name}. Copied ${result.copied_files} file${result.copied_files === 1 ? "" : "s"}.`;
      if (result.warnings.length > 0) {
        state.status += ` Warnings: ${result.warnings.join("; ")}`;
      }
    } catch (error) {
      state.status = error instanceof Error ? error.message : String(error);
    }
  }
}

export async function installNexusApiKey(apiKey: string): Promise<void> {
  try {
    state.nexusStatus = await invoke("save_nexus_api_key", { api_key: apiKey });
    state.status = `Logged in as ${state.nexusStatus.user_name}. ${state.nexusStatus.is_premium ? "Premium account" : "Free account"}.`;
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  }
}

export async function loadNexusAuthStatus(): Promise<void> {
  try {
    state.nexusStatus = await invoke("get_nexus_auth_status");
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  }
}

export async function loadInstallLogs(shouldRender = true): Promise<void> {
  try {
    state.installLog = await invoke<InstallLog[]>("list_install_logs");
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  }
}

export async function clearInstallLogs(): Promise<void> {
  try {
    await invoke("clear_install_logs");
    state.installLog = [];
    state.status = "Install logs cleared.";
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  }
}

export async function addInstallLogEntry(action: string, url: string, ok: boolean, message: string): Promise<void> {
  try {
    await invoke("append_install_log_entry", { action, url, ok, message });
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  }
}
