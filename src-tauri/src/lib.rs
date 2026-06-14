use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct LngLat {
    lng: f64,
    lat: f64,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct SearchResult {
    id: String,
    name: String,
    address: String,
    distance_label: Option<String>,
    coordinate: LngLat,
    r#type: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct AppSettings {
    active_layer: String,
    #[serde(default = "default_language")]
    language: String,
    #[serde(default = "default_theme_preference")]
    theme_preference: String,
    show_traffic_hints: bool,
    last_center: LngLat,
    last_zoom: f64,
    recent_searches: Vec<SearchResult>,
}

fn default_language() -> String {
    "zh".to_string()
}

fn default_theme_preference() -> String {
    "system".to_string()
}

#[tauri::command]
fn load_settings(app: AppHandle) -> Result<Option<AppSettings>, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }

    let value = fs::read_to_string(path).map_err(|error| error.to_string())?;
    serde_json::from_str(&value).map(Some).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let path = settings_path(&app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let value = serde_json::to_string_pretty(&settings).map_err(|error| error.to_string())?;
    fs::write(path, value).map_err(|error| error.to_string())
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|path| path.join("settings.json"))
        .map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_settings, save_settings])
        .run(tauri::generate_context!())
        .expect("error while running NavMap");
}
