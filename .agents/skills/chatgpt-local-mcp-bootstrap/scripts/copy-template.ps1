[CmdletBinding()]
param([Parameter(Mandatory)][string]$TargetRepo)
$ErrorActionPreference = 'Stop'
$skillRoot = Split-Path -Parent $PSScriptRoot
$sourceTool = Join-Path $skillRoot 'assets\chatgpt-local-mcp'
$targetRoot = [IO.Path]::GetFullPath($TargetRepo)
if (-not (Test-Path -LiteralPath (Join-Path $targetRoot '.git'))) { throw 'Target must be a Git repo root.' }
$targetTool = Join-Path $targetRoot 'tools\chatgpt-local-mcp'
$targetSkill = Join-Path $targetRoot '.agents\skills\chatgpt-local-mcp-bootstrap'
function Get-Sha256([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    try {
        $algorithm = [Security.Cryptography.SHA256]::Create()
        try { return [BitConverter]::ToString($algorithm.ComputeHash($stream)) }
        finally { $algorithm.Dispose() }
    }
    finally { $stream.Dispose() }
}
$pairs = @(@{ Source = $sourceTool; Target = $targetTool }, @{ Source = $skillRoot; Target = $targetSkill })
foreach ($pair in $pairs) {
    $sourceFull = [IO.Path]::GetFullPath($pair.Source)
    $targetFull = [IO.Path]::GetFullPath($pair.Target)
    if ($targetFull -eq $sourceFull) { continue }
    Get-ChildItem -LiteralPath $sourceFull -Recurse -File | ForEach-Object {
        if ($_.FullName -like '*\node_modules\*') { return }
        $relative = $_.FullName.Substring($sourceFull.Length).TrimStart([IO.Path]::DirectorySeparatorChar)
        $destination = Join-Path $targetFull $relative
        if (Test-Path -LiteralPath $destination) {
            $left = Get-Sha256 $_.FullName
            $right = Get-Sha256 $destination
            if ($left -ne $right) { throw "Existing file differs; inspect before copying: $destination" }
        }
    }
}
foreach ($pair in $pairs) {
    $sourceFull = [IO.Path]::GetFullPath($pair.Source)
    $targetFull = [IO.Path]::GetFullPath($pair.Target)
    if ($targetFull -eq $sourceFull) { continue }
    Get-ChildItem -LiteralPath $sourceFull -Recurse -File | ForEach-Object {
        if ($_.FullName -like '*\node_modules\*') { return }
        $relative = $_.FullName.Substring($sourceFull.Length).TrimStart([IO.Path]::DirectorySeparatorChar)
        $destination = Join-Path $targetFull $relative
        if (-not (Test-Path -LiteralPath $destination)) {
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
            Copy-Item -LiteralPath $_.FullName -Destination $destination
        }
    }
}
Write-Host "Copied bootstrap skill and MCP template into $targetRoot"
