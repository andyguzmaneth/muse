#[tauri::command]
fn get_project_dir() -> String {
    // CARGO_MANIFEST_DIR is src-tauri/, go up one level for the project root
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    std::path::Path::new(manifest_dir)
        .parent()
        .unwrap_or(std::path::Path::new(manifest_dir))
        .to_string_lossy()
        .to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_project_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
