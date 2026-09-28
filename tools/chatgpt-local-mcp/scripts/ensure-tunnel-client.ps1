[CmdletBinding()]
param([switch]$Refresh)
$ErrorActionPreference = 'Stop'

$toolRoot = Split-Path -Parent $PSScriptRoot
$config = Get-Content -Raw -LiteralPath (Join-Path $toolRoot 'config\project.json') | ConvertFrom-Json
$projectId = [string]$config.projectId
$runtimeRoot = [string]$config.runtimeRoot
if ($projectId -notmatch '^[a-z][a-z0-9-]{2,63}$' -or -not [IO.Path]::IsPathRooted($runtimeRoot) -or $runtimeRoot.Contains('REPLACE_')) {
    throw 'Configure projectId and an absolute runtimeRoot before installing tunnel-client.'
}
$runtimeRoot = [IO.Path]::GetFullPath($runtimeRoot)
$projectRuntime = if ([IO.Path]::GetFileName($runtimeRoot) -eq $projectId) { $runtimeRoot } else { Join-Path $runtimeRoot $projectId }
$projectRoot = [IO.Path]::GetFullPath((Join-Path $toolRoot '..\..')).TrimEnd([IO.Path]::DirectorySeparatorChar)
if ($projectRuntime.Equals($projectRoot, [StringComparison]::OrdinalIgnoreCase) -or $projectRuntime.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or $projectRoot.StartsWith($projectRuntime.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Project runtime must be outside the Git repo.'
}
$managedRoot = Join-Path $projectRuntime 'bin\tunnel-client'
$envPath = Join-Path $toolRoot '.env'
if (-not (Test-Path -LiteralPath $envPath)) {
    Copy-Item -LiteralPath (Join-Path $toolRoot '.env.example') -Destination $envPath
}
$lines = @(Get-Content -LiteralPath $envPath)
$configured = @($lines | Where-Object { $_ -match '^PROJECT_TUNNEL_CLIENT_PATH=' } | Select-Object -Last 1)
if ($configured.Count -gt 0) {
    $current = (($configured[0] -split '=', 2)[1]).Trim().Trim('"').Trim("'")
    if (-not $Refresh -and [IO.Path]::IsPathRooted($current) -and [IO.Path]::GetFullPath($current).StartsWith($managedRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $current -PathType Leaf)) {
        [pscustomobject]@{ path = [IO.Path]::GetFullPath($current); downloaded = $false } | ConvertTo-Json
        return
    }
}

$architecture = switch ([Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()) {
    'X64' { 'amd64' }
    'Arm64' { 'arm64' }
    default { throw 'Only Windows amd64 and arm64 tunnel-client releases are supported.' }
}
$release = Invoke-RestMethod -Uri 'https://api.github.com/repos/openai/tunnel-client/releases/latest' -Headers @{ 'User-Agent' = 'chatgpt-local-mcp-bootstrap' }
$assets = @($release.assets | Where-Object { $_.name -match "^tunnel-client-v[^/]+-windows-$architecture\.zip$" })
if ($assets.Count -ne 1 -or [string]$release.tag_name -notmatch '^v[0-9][A-Za-z0-9._-]*$') { throw 'Cannot identify the official Windows tunnel-client release asset.' }
$asset = $assets[0]
if (-not ([string]$asset.browser_download_url).StartsWith('https://github.com/openai/tunnel-client/releases/download/', [StringComparison]::Ordinal)) {
    throw 'Unexpected tunnel-client download origin.'
}
$expectedHash = ([string]$asset.digest) -replace '^sha256:', ''
if ($expectedHash -notmatch '^[a-fA-F0-9]{64}$') {
    $checksums = @($release.assets | Where-Object { $_.name -eq 'SHA256SUMS.txt' })
    if ($checksums.Count -ne 1) { throw 'The release has no verifiable SHA-256 checksum.' }
    $checksumText = (Invoke-WebRequest -Uri $checksums[0].browser_download_url).Content
    $checksumLine = @($checksumText -split "`r?`n" | Where-Object { $_ -match "^[a-fA-F0-9]{64}\s+\*?$([regex]::Escape($asset.name))$" } | Select-Object -First 1)
    if ($checksumLine.Count -ne 1) { throw 'The release checksum file does not list the selected asset.' }
    $expectedHash = ($checksumLine[0] -split '\s+', 2)[0]
}
$versionDir = Join-Path $projectRuntime "bin\tunnel-client\$($release.tag_name)"
New-Item -ItemType Directory -Force -Path $versionDir | Out-Null
$archive = Join-Path $versionDir $asset.name
if (-not (Test-Path -LiteralPath $archive)) {
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $archive
}
$actualHash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
if ($actualHash -ne $expectedHash) { throw "tunnel-client archive SHA-256 mismatch: $archive" }
$client = Get-ChildItem -LiteralPath $versionDir -Recurse -File -Filter 'tunnel-client.exe' | Select-Object -First 1
if (-not $client) {
    Expand-Archive -LiteralPath $archive -DestinationPath $versionDir -Force
    $client = Get-ChildItem -LiteralPath $versionDir -Recurse -File -Filter 'tunnel-client.exe' | Select-Object -First 1
}
if (-not $client) { throw 'Verified archive did not contain tunnel-client.exe.' }

$newLine = "PROJECT_TUNNEL_CLIENT_PATH=$($client.FullName)"
$updated = @($lines | Where-Object { $_ -notmatch '^PROJECT_TUNNEL_CLIENT_PATH=' }) + @($newLine)
$tempId = [guid]::NewGuid().ToString('N')
$tempEnv = Join-Path $toolRoot ".env.$tempId.tmp"
$backupEnv = Join-Path $toolRoot ".env.$tempId.bak"
try {
    $updated | Set-Content -LiteralPath $tempEnv -Encoding utf8
    [IO.File]::Replace($tempEnv, $envPath, $backupEnv)
} finally {
    if (Test-Path -LiteralPath $tempEnv) { Remove-Item -LiteralPath $tempEnv -Force }
    if (Test-Path -LiteralPath $backupEnv) { Remove-Item -LiteralPath $backupEnv -Force }
}
[pscustomobject]@{ path = $client.FullName; version = [string]$release.tag_name; downloaded = $true } | ConvertTo-Json
