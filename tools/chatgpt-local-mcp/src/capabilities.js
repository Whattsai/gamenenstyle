export const baseTools = [
  'get_active_workspace_session','resolve_workspace_session','begin_workspace_session','end_workspace_session','get_workspace_overview','list_workspace_files',
  'search_workspace_text','read_workspace_text','read_workspace_text_chunk','apply_workspace_patch','move_workspace_path',
  'trash_workspace_path','inspect_git_changes','list_project_tasks','start_project_job','get_project_job','cancel_project_job'
];
export function toolNames(config){return new Set([...baseTools,...(config.modules.web.enabled?['web_browser_action','read_web_artifact','close_web_browser']:[]),...(config.modules.android.enabled?['android_device_action','read_android_artifact']:[]),...(config.modules.offlineMedia.enabled?['transcribe_local_media']:[])]);}
export const dotnetTools=['start_dotnet_job','start_dependency_restore','get_job','get_job_summary','search_job_log','get_job_errors','get_job_log_tail','cancel_job'];
export function allToolNames(config){return new Set([...toolNames(config),...(config.dotnet.enabled?dotnetTools:[])]);}
