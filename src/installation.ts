import { invoke } from "@tauri-apps/api/core";
import type { SkyrimInstallation, SavesLocation } from "./types";
import { state } from "./state";

export async function scanSkyrimInstallations(): Promise<void> {
  const installations = await invoke<SkyrimInstallation[]>("scan_skyrim_installations");
  state.installations = installations;
  state.selected = installations[0] ?? null;
  if (state.selected) {
    await loadSavesLocations(state.selected.game_dir);
  }
  state.status = installations.length
    ? `Found ${installations.length} installation${installations.length === 1 ? "" : "s"}.`
    : "No Skyrim Special Edition install found in Steam libraries.";
}

export async function validateInstallationPath(path: string): Promise<void> {
  const installation = await invoke<SkyrimInstallation>("validate_skyrim_path", { path });
  const existingIndex = state.installations.findIndex((item) => item.game_dir === installation.game_dir);
  if (existingIndex >= 0) {
    state.installations[existingIndex] = installation;
  } else {
    state.installations = [installation, ...state.installations];
  }
  state.selected = installation;
  await loadSavesLocations(installation.game_dir);
  state.status = installation.valid ? "Folder validated." : "Folder found, but needs attention.";
}

export async function selectInstallation(index: number): Promise<void> {
  state.selected = state.installations[index] ?? null;
  if (state.selected) {
    await loadSavesLocations(state.selected.game_dir);
  }
  state.status = state.selected ? `Selected ${state.selected.name}.` : "Selection cleared.";
}

export async function loadSavesLocations(gameDir: string): Promise<void> {
  try {
    state.savesLocations = await invoke<SavesLocation[]>("get_saves_locations", { game_dir: gameDir });
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
    state.savesLocations = [];
  }
}

export async function runGame(gameDir: string, useSKSE: boolean): Promise<void> {
  const message = await invoke<string>("run_skyrim", { 
    game_dir: gameDir, 
    use_skse: useSKSE 
  });
  state.status = message;
}
