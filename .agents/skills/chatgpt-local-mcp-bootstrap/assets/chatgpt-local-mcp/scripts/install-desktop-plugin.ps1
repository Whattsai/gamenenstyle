[CmdletBinding()]
param([string]$Bundle)
$ErrorActionPreference = 'Stop'
$toolRoot = Split-Path -Parent $PSScriptRoot
$targetRepo = [IO.Path]::GetFullPath((Join-Path $toolRoot '..\..'))
$provision = Join-Path $toolRoot 'scripts\provision-project-tasks.mjs'
if (-not (Test-Path -LiteralPath $provision)) { throw "Missing capability provisioning script: $provision" }
& node $provision --target-repo $targetRepo
if ($LASTEXITCODE -ne 0) { throw 'Project capability provisioning failed.' }
$envPath = Join-Path $toolRoot '.env'
if (Test-Path -LiteralPath $envPath) {
    Get-Content -LiteralPath $envPath | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) { return }
        if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
            $name = $Matches[1]
            $val = $Matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($name, $val, 'Process')
        }
    }
}
$config = Get-Content -Raw -LiteralPath (Join-Path $toolRoot 'config\project.json') | ConvertFrom-Json
$name = [string]$config.plugin.name
if ($name -notmatch '^[a-z][a-z0-9-]{2,63}$' -or $name -like 'REPLACE_*') { throw 'Configure a valid Plugin name.' }
if (-not $Bundle) {
    $appId = $env:PROJECT_CHATGPT_APP_ID
    if ($appId -and $appId -match '^plugin_asdk_app_[A-Za-z0-9_-]+$') {
        Write-Host "Building latest plugin bundle with App ID: $appId"
        $buildJson = & node (Join-Path $toolRoot 'scripts\plugin.js') build --app-id $appId
        if ($LASTEXITCODE -ne 0) { throw 'Plugin build failed.' }
        try {
            $buildResult = $buildJson | ConvertFrom-Json
            $Bundle = $buildResult.output
        } catch { throw "Cannot parse build output: $buildJson" }
    } else {
        $runtimeRoot = [string]$config.runtimeRoot
        $projectRuntime = if ([IO.Path]::GetFileName($runtimeRoot) -eq $config.projectId) { $runtimeRoot } else { Join-Path $runtimeRoot $config.projectId }
        $buildsDir = Join-Path $projectRuntime 'plugin-build'
        $latest = Get-ChildItem -LiteralPath $buildsDir -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latest) {
            $Bundle = $latest.FullName
            Write-Host "Auto-detected latest bundle: $Bundle"
        } else {
            throw 'Set PROJECT_CHATGPT_APP_ID in .env or run npm run plugin:build first, or specify -Bundle <path>.'
        }
    }
}
$bundleFull = [IO.Path]::GetFullPath($Bundle)
if (-not (Test-Path -LiteralPath (Join-Path $bundleFull '.codex-plugin\plugin.json'))) { throw 'Invalid bundle.' }
& node (Join-Path $toolRoot 'scripts\plugin.js') validate $bundleFull
if ($LASTEXITCODE -ne 0) { throw 'Bundle validation failed.' }
$bundleApp = Get-Content -Raw -LiteralPath (Join-Path $bundleFull '.app.json') | ConvertFrom-Json
$bundleAppId = [string]$bundleApp.apps.PSObject.Properties[$name].Value.id
$homeRoot = [IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd([IO.Path]::DirectorySeparatorChar)
$pluginPath = [IO.Path]::GetFullPath((Join-Path $homeRoot ".codex\plugins\$name"))
$marketplacePath = [IO.Path]::GetFullPath((Join-Path $homeRoot '.agents\plugins\marketplace.json'))
foreach ($path in @($pluginPath,$marketplacePath)) {
    if (-not $path.StartsWith($homeRoot + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Install path outside user profile.' }
    $parent = Split-Path -Parent $path
    while ($parent -and $parent.StartsWith($homeRoot,[StringComparison]::OrdinalIgnoreCase)) {
        if ((Test-Path -LiteralPath $parent) -and ((Get-Item -LiteralPath $parent -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Reparse point in install path: $parent" }
        if ($parent -eq $homeRoot) { break }
        $parent = Split-Path -Parent $parent
    }
}
if (Test-Path -LiteralPath $marketplacePath) {
    $marketplace = Get-Content -Raw -LiteralPath $marketplacePath | ConvertFrom-Json
} else {
    $marketplace = [pscustomobject]@{ name='personal'; interface=[pscustomobject]@{displayName='Personal'}; plugins=@() }
}
foreach ($other in @($marketplace.plugins | Where-Object { $_.name -ne $name -and $_.source.source -eq 'local' })) {
    $relative = [string]$other.source.path
    if (-not $relative.StartsWith('./', [StringComparison]::Ordinal)) { continue }
    $otherPath = [IO.Path]::GetFullPath((Join-Path $homeRoot $relative.Substring(2)))
    if (-not $otherPath.StartsWith($homeRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { continue }
    $otherAppPath = Join-Path $otherPath '.app.json'
    if (-not (Test-Path -LiteralPath $otherAppPath)) { continue }
    $otherApp = Get-Content -Raw -LiteralPath $otherAppPath | ConvertFrom-Json
    foreach ($mapping in $otherApp.apps.PSObject.Properties) {
        if ([string]$mapping.Value.id -eq $bundleAppId) {
            throw "Developer app ID is already used by '$($other.name)'. Create a separate ChatGPT developer connection for $name before installing."
        }
    }
}
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $pluginPath) | Out-Null
if (Test-Path -LiteralPath $pluginPath) {
    $backup = "$pluginPath.backup.$(Get-Date -Format yyyyMMddHHmmssfff)"
    Move-Item -LiteralPath $pluginPath -Destination $backup
    Write-Host "Previous Plugin preserved: $backup"
}
Copy-Item -LiteralPath $bundleFull -Destination $pluginPath -Recurse
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $marketplacePath) | Out-Null
if (-not $marketplace.PSObject.Properties['plugins']) { $marketplace | Add-Member -NotePropertyName plugins -NotePropertyValue @() }
$entries = @($marketplace.plugins | Where-Object { $_.name -ne $name })
$entry = [pscustomobject]@{ name=$name; source=[pscustomobject]@{source='local';path="./.codex/plugins/$name"}; policy=[pscustomobject]@{installation='AVAILABLE';authentication='ON_USE'}; category='Productivity' }
$marketplace.plugins = @($entries) + @($entry)
$marketplaceTemp = Join-Path (Split-Path -Parent $marketplacePath) "marketplace.$([guid]::NewGuid().ToString('N')).tmp"
try {
    $marketplace | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $marketplaceTemp -Encoding utf8
    if (Test-Path -LiteralPath $marketplacePath) {
        $marketplaceBackup = "$marketplacePath.backup.$(Get-Date -Format yyyyMMddHHmmssfff)"
        [IO.File]::Replace($marketplaceTemp, $marketplacePath, $marketplaceBackup)
        Write-Host "Previous marketplace preserved: $marketplaceBackup"
    } else {
        Move-Item -LiteralPath $marketplaceTemp -Destination $marketplacePath
    }
} finally {
    if (Test-Path -LiteralPath $marketplaceTemp) { Remove-Item -LiteralPath $marketplaceTemp -Force }
}
Write-Host "Installed $name at $pluginPath"
Write-Host "Personal marketplace: $marketplacePath"
Write-Host "Restart ChatGPT Desktop, open Plugins Directory, select the Personal source, and reinstall/reload $name."
