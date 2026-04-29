import type { AppState } from "./types";

export const state: AppState = {
  installations: [],
  selected: null,
  activeTab: "installer",
  manualPath: "",
  modLinks: "",
  nexusApiKey: "",
  nexusStatus: {
    configured: false,
    user_name: null,
    is_premium: null
  },
  installedMods: [],
  installLog: [],
  savesLocations: [],
  status: "Ready",
  busy: false
};
