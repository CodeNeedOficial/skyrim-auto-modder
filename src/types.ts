export type SkyrimInstallation = {
  name: string;
  game_dir: string;
  data_dir: string | null;
  exe_path: string | null;
  skse_loader_path: string | null;
  steam_app_manifest: string | null;
  valid: boolean;
  issues: string[];
};

export type SavesLocation = {
  name: string;
  path: string;
  exists: boolean;
  save_count: number;
};

export type ModInstallResult = {
  name: string;
  source_url: string;
  archive_path: string;
  staging_dir: string;
  installed_to: string;
  copied_files: number;
  installed_mod_id: string;
  warnings: string[];
};

export type InstalledFile = {
  path: string;
  existed_before: boolean;
};

export type InstalledMod = {
  id: string;
  name: string;
  source_url: string;
  archive_path: string;
  staging_dir: string;
  game_dir: string;
  installed_to: string;
  installed_at: number;
  copied_files: InstalledFile[];
  warnings: string[];
};

export type UninstallResult = {
  id: string;
  name: string;
  removed_files: number;
  skipped_files: number;
  archive_path: string;
};

export type NexusAuthStatus = {
  configured: boolean;
  user_name: string | null;
  is_premium: boolean | null;
};

export type InstallLog = {
  id?: string;
  timestamp?: number;
  action?: string;
  url: string;
  ok: boolean;
  message: string;
  mod_id?: string | null;
  mod_name?: string | null;
  result?: ModInstallResult;
};

export type AppState = {
  installations: SkyrimInstallation[];
  selected: SkyrimInstallation | null;
  activeTab: "installer" | "mods";
  manualPath: string;
  modLinks: string;
  nexusApiKey: string;
  nexusStatus: NexusAuthStatus;
  installedMods: InstalledMod[];
  installLog: InstallLog[];
  savesLocations: SavesLocation[];
  status: string;
  busy: boolean;
};
