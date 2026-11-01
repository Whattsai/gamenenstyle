$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$toolchain=Join-Path $taskRoot '.local/toolchain'
New-Item -ItemType Directory -Force $toolchain | Out-Null
$archive=Join-Path $toolchain 'node-v24.11.1-linux-x64.tar.xz'
if(!(Test-Path (Join-Path $toolchain 'node-linux/bin/node'))){
    Invoke-WebRequest 'https://nodejs.org/dist/v24.11.1/node-v24.11.1-linux-x64.tar.xz' -OutFile $archive
    $manifest=(Invoke-WebRequest 'https://nodejs.org/dist/v24.11.1/SHASUMS256.txt').Content
    $expected=($manifest -split "`n" | Where-Object {$_ -match ' node-v24\.11\.1-linux-x64\.tar\.xz$'}).Split(' ')[0]
    if(!$expected -or (Get-FileHash $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected){throw 'Node checksum mismatch'}
    $linuxToolchain=$toolchain.Replace('\','/').Replace(([IO.Path]::GetPathRoot($taskRoot).TrimEnd('\')),('/mnt/'+[char]::ToLowerInvariant($taskRoot[0])))
    & wsl.exe -d Ubuntu -- tar -xf "$linuxToolchain/node-v24.11.1-linux-x64.tar.xz" -C $linuxToolchain
    if($LASTEXITCODE -ne 0){throw 'WSL extraction failed'}
    $source=[IO.Path]::GetFullPath((Join-Path $toolchain 'node-v24.11.1-linux-x64'))
    $destination=[IO.Path]::GetFullPath((Join-Path $toolchain 'node-linux'))
    if(!$source.StartsWith($taskRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -or !$destination.StartsWith($taskRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Toolchain path escaped the workspace'}
    Move-Item -LiteralPath $source -Destination $destination
}
$platform=Join-Path $toolchain 'platform';New-Item -ItemType Directory -Force $platform | Out-Null
Copy-Item -LiteralPath (Join-Path $taskRoot 'cloudflare/package.json'),(Join-Path $taskRoot 'cloudflare/package-lock.json') -Destination $platform
$linuxRoot=$taskRoot.Replace('\','/').Replace(([IO.Path]::GetPathRoot($taskRoot).TrimEnd('\')),('/mnt/'+[char]::ToLowerInvariant($taskRoot[0])))
& wsl.exe -d Ubuntu --cd "$linuxRoot/.local/toolchain/platform" -- /usr/bin/env "PATH=$linuxRoot/.local/toolchain/node-linux/bin:/usr/bin:/bin" "$linuxRoot/.local/toolchain/node-linux/bin/node" "$linuxRoot/.local/toolchain/node-linux/lib/node_modules/npm/bin/npm-cli.js" ci
if($LASTEXITCODE -ne 0){throw 'Linux toolchain npm ci failed'}
Write-Output 'WSL toolchain ready. Enable Docker Desktop integration for Ubuntu, then npm run dev:platform.'
