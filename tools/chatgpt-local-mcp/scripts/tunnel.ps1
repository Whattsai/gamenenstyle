[CmdletBinding()]
param([ValidateSet('Init','Doctor','Run')][string]$Mode='Doctor')
$ErrorActionPreference = 'Stop'
$toolRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $toolRoot '.env'
if (-not (Test-Path -LiteralPath $envPath)) { throw 'Create the project-local .env first.' }
Get-Content -LiteralPath $envPath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    if ($line -notmatch '^([A-Z][A-Z0-9_]*)=(.*)$') { throw 'Invalid .env line.' }
    $name = $Matches[1]
    $value = $Matches[2].Trim().Trim('"').Trim("'")
    if ($name -notin @('CONTROL_PLANE_API_KEY','PROJECT_TUNNEL_ID','PROJECT_CHATGPT_APP_ID','PROJECT_TUNNEL_PROFILE','PROJECT_TUNNEL_CLIENT_PATH','PROJECT_TUNNEL_HEALTH_PORT')) { throw "Unsupported .env key: $name" }
    [Environment]::SetEnvironmentVariable($name,$value,'Process')
}
$config = Get-Content -Raw -LiteralPath (Join-Path $toolRoot 'config\project.json') | ConvertFrom-Json
$profile = $env:PROJECT_TUNNEL_PROFILE
$client = $env:PROJECT_TUNNEL_CLIENT_PATH
if (-not $env:CONTROL_PLANE_API_KEY -or $env:PROJECT_TUNNEL_ID -notmatch '^tunnel_[A-Za-z0-9_-]+$' -or $profile -notmatch '^[a-z][a-z0-9-]{2,63}$') { throw 'Project tunnel settings are incomplete.' }
if ($profile -ne $config.projectId) { throw 'Tunnel profile must equal the configured projectId to avoid another project profile.' }
if (-not [IO.Path]::IsPathRooted($client) -or -not (Test-Path -LiteralPath $client)) { throw 'PROJECT_TUNNEL_CLIENT_PATH must point to tunnel-client.exe.' }
$healthPort = if ($env:PROJECT_TUNNEL_HEALTH_PORT) { $env:PROJECT_TUNNEL_HEALTH_PORT } else { '8081' }
if ($healthPort -notmatch '^[0-9]{4,5}$' -or [int]$healthPort -lt 1000 -or [int]$healthPort -gt 65535) { throw 'PROJECT_TUNNEL_HEALTH_PORT must be a port from 1000 to 65535.' }
$server = (Join-Path $toolRoot 'src\index.js').Replace('\', '/')
if ($Mode -eq 'Init') {
    Get-Command node.exe -ErrorAction Stop > $null
    $mcpCommand = "node $server"
    & $client init --sample sample_mcp_stdio_local --profile $profile --tunnel-id $env:PROJECT_TUNNEL_ID --mcp-command $mcpCommand --health-listen-addr "127.0.0.1:$healthPort" --force
    if ($LASTEXITCODE -ne 0) { throw 'tunnel-client Init failed.' }
}
if ($Mode -ne 'Doctor') {
    # 持久化到既有 profile，讓直接執行 tunnel-client run 也使用相同握手設定。
    # 與 tunnel-client v0.0.15 的 profile directory precedence 一致。
    $profileDirectory = if ($env:TUNNEL_CLIENT_PROFILE_DIR) { $env:TUNNEL_CLIENT_PROFILE_DIR }
        elseif ($env:XDG_CONFIG_HOME) { Join-Path $env:XDG_CONFIG_HOME 'tunnel-client' }
        elseif ($env:HOME) { Join-Path $env:HOME '.config/tunnel-client' }
        else { Join-Path $env:APPDATA 'tunnel-client' }
    $profilePath = Join-Path $profileDirectory "$profile.yaml"
    & node.exe (Join-Path $PSScriptRoot 'configure-tunnel-profile.js') $profilePath $profile $server
    if ($LASTEXITCODE -ne 0) { throw 'Tunnel stdio profile configuration failed.' }
}
if ($Mode -eq 'Doctor') { & $client doctor --profile $profile --explain }
elseif ($Mode -eq 'Run') {
    # 官方選項只在 initialize 成功後補通知，並保留未初始化時的拒絕機制。
    & $client run --profile $profile --mcp.stdio-send-initialized-notification=true
}
if ($LASTEXITCODE -ne 0) { throw "tunnel-client $Mode failed." }
