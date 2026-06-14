import { invoke } from "@tauri-apps/api/core";
import { DEFAULT_CENTER } from "../config/mapServices";
import { DEFAULT_LANGUAGE } from "../i18n";
import type { AppSettings } from "../types";

const SETTINGS_KEY = "navmap.settings";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export const defaultSettings: AppSettings = {
  activeLayer: "standard",
  language: DEFAULT_LANGUAGE,
  themePreference: "system",
  showTrafficHints: true,
  lastCenter: DEFAULT_CENTER,
  lastZoom: 12,
  recentSearches: [],
};

export async function loadSettings(): Promise<AppSettings> {
  if (isTauriRuntime()) {
    const settings = await invoke<AppSettings | null>("load_settings");
    return settings ? { ...defaultSettings, ...settings } : defaultSettings;
  }

  const rawValue = localStorage.getItem(SETTINGS_KEY);
  return rawValue ? { ...defaultSettings, ...JSON.parse(rawValue) } : defaultSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (isTauriRuntime()) {
    await invoke("save_settings", { settings });
    return;
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function isTauriRuntime() {
  return Boolean(window.__TAURI_INTERNALS__);
}
