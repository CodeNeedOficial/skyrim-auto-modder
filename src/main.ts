import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { open } from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import "./styles.css";

// Imports from new modules
import { state } from "./state";
import { icon, escapeHtml } from "./utils";
import type { SkyrimInstallation } from "./types";
import { 
  scanSkyrimInstallations, 
  validateInstallationPath, 
  selectInstallation,
  runGame 
} from "./installation";
import { 
  installModsFromLinks, 
  installNexusApiKey, 
  loadNexusAuthStatus,
  loadInstallLogs,
  clearInstallLogs
} from "./installer";
import { 
  loadInstalledMods, 
  uninstallMod 
} from "./mods";

// Initialize DOM
const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App root not found");
}
const root = app;

// Error handling
window.addEventListener("error", (event) => {
  root.innerHTML = `<main class="boot-error"><strong>Startup error</strong><p>${escapeHtml(event.message)}</p></main>`;
});

window.addEventListener("unhandledrejection", (event) => {
  const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
  state.status = message;
  render();
});

// ===== RENDER FUNCTIONS =====

function renderInstallation(item: SkyrimInstallation, index: number): string {
  const selected = state.selected?.game_dir === item.game_dir;
  const statusClass = item.valid ? "ok" : "warn";
  const statusText = item.valid ? "Valid" : "Needs attention";
  const skseText = item.skse_loader_path ? "SKSE detected" : "SKSE not detected";

  return `
    <button class="install-row ${selected ? "selected" : ""}" data-select="${index}">
      <span class="install-main">
        <span class="install-title">${escapeHtml(item.name)}</span>
        <span class="install-path">${escapeHtml(item.game_dir)}</span>
      </span>
      <span class="install-meta">
        <span class="pill ${statusClass}">${statusText}</span>
        <span class="muted">${skseText}</span>
      </span>
    </button>
  `;
}

function renderSelected(item: SkyrimInstallation | null): string {
  if (!item) {
    return `
      <section class="panel empty">
        <div class="empty-icon">${icon("folder-search")}</div>
        <h2>No installation selected</h2>
        <p>Scan Steam libraries or choose the Skyrim Special Edition folder manually.</p>
      </section>
    `;
  }

  const issueList = item.issues.length
    ? item.issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join("")
    : "<li>No validation issues found.</li>";

  return `
    <section class="panel details">
      <div class="panel-head">
        <div>
          <h2>${escapeHtml(item.name)}</h2>
          <p>${escapeHtml(item.game_dir)}</p>
        </div>
        <span class="pill ${item.valid ? "ok" : "warn"}">${item.valid ? "Ready" : "Check setup"}</span>
      </div>

      <div class="facts">
        <div>
          <span>Executable</span>
          <strong>${escapeHtml(item.exe_path ?? "Missing")}</strong>
        </div>
        <div>
          <span>Data folder</span>
          <strong>${escapeHtml(item.data_dir ?? "Missing")}</strong>
        </div>
        <div>
          <span>SKSE loader</span>
          <strong>${escapeHtml(item.skse_loader_path ?? "Not installed")}</strong>
        </div>
        <div>
          <span>Steam manifest</span>
          <strong>${escapeHtml(item.steam_app_manifest ?? "Unknown")}</strong>
        </div>
      </div>

      <div class="issues">
        <h3>Validation</h3>
        <ul>${issueList}</ul>
      </div>

      ${
        state.savesLocations.length > 0
          ? `
      <div class="saves">
        <h3>Game Saves Locations</h3>
        <ul>
          ${state.savesLocations
            .map(
              (location) => `
            <li>
              <strong>${escapeHtml(location.name)}</strong>
              ${
                location.exists
                  ? `<span class="muted">${location.save_count} save${location.save_count === 1 ? "" : "s"}</span>`
                  : '<span class="muted">Not found</span>'
              }
              <span class="path">${escapeHtml(location.path)}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
      `
          : ""
      }

      <div class="actions">
        <button id="run-game">${icon("play")}Run Skyrim</button>
        <button class="secondary" id="run-game-skse">${icon("play")}Run with SKSE</button>
        <button class="secondary" id="reveal-game">${icon("folder-open")}Reveal folder</button>
        <button class="secondary" id="rescan">${icon("refresh-cw")}Scan again</button>
      </div>
    </section>
  `;
}

function renderInstaller(): string {
  const logs = state.installLog.length
    ? state.installLog
        .map((entry) => {
          const warnings = entry.result?.warnings.length
            ? `<ul>${entry.result.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
            : "";
          return `
            <div class="log-row ${entry.ok ? "success" : "failure"}">
              <div>
                <strong>${escapeHtml(entry.result?.name ?? entry.mod_name ?? (entry.ok ? "Installed" : "Failed"))}</strong>
                <span>${escapeHtml(entry.url)}</span>
              </div>
              <p>${escapeHtml(entry.message)}</p>
              ${warnings}
            </div>
          `;
        })
        .join("")
    : `<div class="list-empty">No mod install attempts yet.</div>`;

  return `
    <section class="panel mod-panel">
      <div class="panel-head compact">
        <div>
          <h2>Mod Installer</h2>
          <p>Paste direct archive, Nexus page, or nxm links, one per line.</p>
        </div>
        <span class="pill ${state.selected ? "ok" : "warn"}">${state.selected ? "Target selected" : "No target"}</span>
      </div>

      <div class="nexus-auth">
        <div>
          <strong>Nexus Mods API</strong>
          <span>${
            state.nexusStatus.configured
              ? `Connected as ${escapeHtml(state.nexusStatus.user_name ?? "Nexus user")}${
                  state.nexusStatus.is_premium ? " - Premium" : ""
                }`
              : "Not connected"
          }</span>
        </div>
        <span class="api-status ${state.nexusStatus.configured ? "saved" : "missing"}">
          ${state.nexusStatus.configured ? `${icon("check")}Key saved` : `${icon("key")}No key`}
        </span>
        <div>
          <input id="nexus-api-key" value="${escapeHtml(state.nexusApiKey)}" type="password" placeholder="Paste Nexus API key" />
          <button class="secondary" id="save-nexus-key" title="Save Nexus API key" ${state.busy ? "disabled" : ""}>${icon("key")}</button>
        </div>
      </div>

      <label class="mod-links">
        <span>Download links</span>
        <textarea id="mod-links" placeholder="https://www.nexusmods.com/skyrimspecialedition/mods/123?tab=files&file_id=456&#10;nxm://skyrimspecialedition/mods/123/files/456?key=...&expires=...&#10;https://example.com/mod.7z">${escapeHtml(state.modLinks)}</textarea>
      </label>

      <div class="actions">
        <button id="install-mods" ${state.busy || !state.selected ? "disabled" : ""}>${icon("download")}Download and install</button>
        <button class="secondary" id="clear-log">${icon("package")}Clear log</button>
      </div>

      <div class="mod-log">
        ${logs}
      </div>
    </section>
  `;
}

function renderInstalledMods(): string {
  const mods = state.installedMods.length
    ? state.installedMods
        .map((mod) => {
          const installedDate = new Date(mod.installed_at * 1000).toLocaleString();
          const overwritten = mod.copied_files.filter((file) => file.existed_before).length;
          const warnings = mod.warnings.length
            ? `<ul>${mod.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
            : "";

          return `
            <div class="mod-card">
              <div class="mod-card-main">
                <div>
                  <strong>${escapeHtml(mod.name)}</strong>
                  <span>${escapeHtml(mod.source_url)}</span>
                </div>
                <button class="danger" data-uninstall="${escapeHtml(mod.id)}" ${state.busy ? "disabled" : ""}>${icon("trash")}Uninstall</button>
              </div>
              <div class="mod-card-facts">
                <span>${mod.copied_files.length} tracked files</span>
                <span>${overwritten} protected overwrite${overwritten === 1 ? "" : "s"}</span>
                <span>Installed ${escapeHtml(installedDate)}</span>
              </div>
              <p>Archive copy: ${escapeHtml(mod.archive_path)}</p>
              ${warnings}
            </div>
          `;
        })
        .join("")
    : `<div class="list-empty">No installed mods registered yet.</div>`;

  return `
    <section class="panel mod-panel">
      <div class="panel-head compact">
        <div>
          <h2>Installed Mods</h2>
          <p>Mods installed by this app, with local archive copies for reinstalling later.</p>
        </div>
        <span class="pill ${state.installedMods.length ? "ok" : "warn"}">${state.installedMods.length} tracked</span>
      </div>
      <div class="mods-list">
        ${mods}
      </div>
    </section>
  `;
}

function renderTopNav(): string {
  const apiConfigured = state.nexusStatus.configured;
  return `
    <div class="top-nav">
      <div class="tabs">
        <button class="tab-button ${state.activeTab === "installer" ? "active" : ""}" data-tab="installer">${icon("radar")}Installer</button>
        <button class="tab-button ${state.activeTab === "mods" ? "active" : ""}" data-tab="mods">${icon("list")}Mods</button>
      </div>
      <div class="status">
        <span class="status-indicator ${state.busy ? "busy" : "ready"}"></span>
        <span>${escapeHtml(state.status)}</span>
      </div>
    </div>
  `;
}

function render(): void {
  const content = `
    <main>
      <header>
        <h1>${icon("shield")} Skyrim Auto Modder</h1>
      </header>
      <div class="container">
        <aside>
          <div class="scan-controls">
            <button id="scan" ${state.busy ? "disabled" : ""}>${icon("radar")}Scan libraries</button>
          </div>
          <div class="installations">
            ${state.installations.map(renderInstallation).join("")}
          </div>
          <details class="manual-path">
            <summary>Manual path</summary>
            <div>
              <input id="manual-path" value="${escapeHtml(state.manualPath)}" type="text" placeholder="Or paste a local folder path" />
            </div>
          </details>
        </aside>
        <section class="main">
          ${renderTopNav()}
          ${renderSelected(state.selected)}
          ${state.activeTab === "installer" ? renderInstaller() : renderInstalledMods()}
        </section>
      </div>
    </main>
  `;
  root.innerHTML = content;
  bindEvents();
}

// ===== EVENT BINDING =====

function bindEvents(): void {
  // Tab navigation
  document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      if (tab === "installer" || tab === "mods") {
        state.activeTab = tab;
        render();
      }
    });
  });

  // Scan button
  document.querySelector<HTMLButtonElement>("#scan")?.addEventListener("click", () => {
    void withBusy("Scanning Steam libraries...", scanSkyrimInstallations);
  });

  // Manual path input
  document.querySelector<HTMLInputElement>("#manual-path")?.addEventListener("input", (event) => {
    state.manualPath = (event.target as HTMLInputElement).value;
  });

  // Manual path validation (Enter key)
  document.querySelector<HTMLInputElement>("#manual-path")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const trimmed = state.manualPath.trim();
      if (trimmed) {
        void withBusy("Validating folder...", () => validateInstallationPath(trimmed));
      }
    }
  });

  // Browse button for manual path
  const folder = document.querySelector<HTMLButtonElement>("#browse-manual-path");
  if (folder) {
    folder.addEventListener("click", async () => {
      const selected = await open({ directory: true });
      if (typeof selected === "string") {
        state.manualPath = selected;
        await validateInstallationPath(selected);
        render();
      }
    });
  }

  // Installation selection
  document.querySelectorAll<HTMLButtonElement>("[data-select]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.select);
      await selectInstallation(index);
      render();
    });
  });

  // Run game buttons
  document.querySelector<HTMLButtonElement>("#run-game")?.addEventListener("click", async () => {
    if (!state.selected) return;
    await withBusy("Starting Skyrim...", () => runGame(state.selected!.game_dir, false));
  });

  document.querySelector<HTMLButtonElement>("#run-game-skse")?.addEventListener("click", async () => {
    if (!state.selected) return;
    await withBusy("Starting Skyrim with SKSE...", () => runGame(state.selected!.game_dir, true));
  });

  // Reveal game folder
  document.querySelector<HTMLButtonElement>("#reveal-game")?.addEventListener("click", async () => {
    if (!state.selected) return;
    await revealItemInDir(state.selected.game_dir);
  });

  // Rescan
  document.querySelector<HTMLButtonElement>("#rescan")?.addEventListener("click", () => {
    void withBusy("Scanning Steam libraries...", scanSkyrimInstallations);
  });

  // Installer tab events
  document.querySelector<HTMLInputElement>("#mod-links")?.addEventListener("input", (event) => {
    state.modLinks = (event.target as HTMLInputElement).value;
  });

  document.querySelector<HTMLInputElement>("#nexus-api-key")?.addEventListener("input", (event) => {
    state.nexusApiKey = (event.target as HTMLInputElement).value;
  });

  document.querySelector<HTMLButtonElement>("#save-nexus-key")?.addEventListener("click", () => {
    void withBusy("Saving API key...", () => installNexusApiKey(state.nexusApiKey));
  });

  document.querySelector<HTMLButtonElement>("#install-mods")?.addEventListener("click", () => {
    const links = state.modLinks
      .split("\n")
      .map((link) => link.trim())
      .filter((link) => link.length > 0);
    void withBusy("Installing mods...", () => installModsFromLinks(links));
  });

  document.querySelector<HTMLButtonElement>("#clear-log")?.addEventListener("click", () => {
    void withBusy("Clearing logs...", clearInstallLogs);
  });

  // Mods tab events
  document.querySelectorAll<HTMLButtonElement>("[data-uninstall]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.uninstall;
      if (id) {
        void withBusy("Uninstalling mod...", () => uninstallMod(id));
      }
    });
  });
}

// ===== UTILITY FUNCTIONS =====

async function withBusy(status: string, task: () => Promise<void>): Promise<void> {
  state.busy = true;
  state.status = status;
  render();
  try {
    await task();
  } catch (error) {
    state.status = error instanceof Error ? error.message : String(error);
  } finally {
    state.busy = false;
    render();
  }
}

async function setupDeepLinks(): Promise<void> {
  const deepLinkCurrent = await getCurrent();
  if (deepLinkCurrent && deepLinkCurrent.length > 0) {
    await handleDeepLink(deepLinkCurrent[0]);
  }

  onOpenUrl(async (urls) => {
    if (urls.length > 0) {
      await handleDeepLink(urls[0]);
    }
  });
}

async function handleDeepLink(url: string): Promise<void> {
  if (!url.startsWith("nxm://")) return;
  if (!state.selected) {
    state.status = "Please select a Skyrim installation first.";
    return;
  }

  state.modLinks = url;
  state.activeTab = "installer";
  render();

  const links = [url];
  await withBusy("Installing from deep link...", () => installModsFromLinks(links));
}

// ===== INITIALIZATION =====

async function initialize(): Promise<void> {
  render();
  await Promise.allSettled([loadNexusAuthStatus(), loadInstalledMods(false), loadInstallLogs(false), scanSkyrimInstallations()]);
  render();
  void setupDeepLinks();
}

void initialize();
