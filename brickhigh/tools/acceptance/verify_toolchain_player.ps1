param(
    [Parameter(Mandatory = $true)][string]$PlayerDirectory
)
$ErrorActionPreference = 'Stop'
$probeSource = (Resolve-Path -LiteralPath $PlayerDirectory).Path
$probeExe = Join-Path $probeSource 'BrickHighToolchainProbe.exe'
if (-not (Test-Path -LiteralPath $probeExe -PathType Leaf)) { throw '找不到內部工具鏈探針。' }
$probeEvidence = Join-Path (Split-Path $probeSource -Parent) ('matrix-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $probeEvidence | Out-Null

function Get-ProbeCatalogRoot([string]$PlayerRoot) {
    $streamingRoot = Join-Path $PlayerRoot 'BrickHighToolchainProbe_Data/StreamingAssets'
    $manifests = @()
    $legacy = Join-Path $streamingRoot 'release-manifest.json'
    if (Test-Path -LiteralPath $legacy -PathType Leaf) { $manifests += Get-Item -LiteralPath $legacy }
    $catalogs = Join-Path $streamingRoot 'Catalog'
    if (Test-Path -LiteralPath $catalogs -PathType Container) {
        $manifests += @(Get-ChildItem -LiteralPath $catalogs -Filter 'release-manifest.json' -File -Recurse)
    }
    if ($manifests.Count -ne 1) { throw '內部探針必須恰有一份人工 catalog。' }
    $manifest = Get-Content -LiteralPath $manifests[0].FullName -Raw | ConvertFrom-Json
    if ($manifest.purpose -ne 'F-Catalog' -or $manifest.readyAsset -ne $false) { throw '不允許對正式包注入故障。' }
    return $manifests[0].Directory.FullName
}

function Invoke-ProbeCase([string]$Executable, [string]$Name, [string]$Flags, [bool]$ExpectedPass, [string]$ExpectedFailure) {
    $caseRoot = Join-Path $probeEvidence $Name
    New-Item -ItemType Directory -Path $caseRoot | Out-Null
    $log = Join-Path $caseRoot 'player.log'
    $arguments = "$Flags -probe-output `"$caseRoot`" -logFile `"$log`""
    $process = Start-Process -FilePath $Executable -WindowStyle Hidden -ArgumentList $arguments -PassThru
    $timer = [Diagnostics.Stopwatch]::StartNew()
    while (-not $process.WaitForExit(1000)) {
        if ($timer.Elapsed.TotalSeconds -gt 180) {
            # 只終止本函式啟動的內部測試程序，不搜尋或終止使用者遊戲。
            Stop-Process -Id $process.Id
            throw "$Name：探針逾時，證據保留於 $caseRoot"
        }
    }
    $process.Refresh()
    $report = Get-Content -LiteralPath (Join-Path $caseRoot 'player-report.json') -Raw | ConvertFrom-Json
    if ($report.purpose -ne 'InternalToolchainProbe' -or $report.readyAsset -ne $false -or $report.passed -ne $ExpectedPass) {
        throw "$Name：探針結果與預期不符。"
    }
    if ($ExpectedPass) {
        if ($process.ExitCode -ne 0 -or $report.visibleRedPixels -lt 500 -or $report.captureMode -ne 'PlayerCameraRenderRequest' -or
            -not $report.leaseSharingVerified -or -not $report.leaseReleaseVerified -or
            -not $report.preCancelledVerified -or -not $report.cancelledLoadVerified -or -not $report.reloadVerified -or
            -not $report.previewFlowVerified -or -not $report.previewRetryVerified -or -not $report.previewCameraVerified) {
            throw "$Name：缺少有效相機畫面、共用 lease／釋放或預覽控制層證據。"
        }
        if (-not (Test-Path -LiteralPath (Join-Path $caseRoot 'player.png'))) { throw "$Name：沒有畫面證據。" }
        foreach ($capture in @('camera-reset.png', 'camera-orbit-zoom.png', 'camera-portrait.png')) {
            if (-not (Test-Path -LiteralPath (Join-Path $caseRoot $capture))) { throw "$Name：缺少鏡頭操作畫面 $capture。" }
        }
    } elseif ($process.ExitCode -eq 0 -or $report.failure -notlike $ExpectedFailure) {
        throw "$Name：故障未被明確拒絕。"
    }
    if ($Name -eq 'corrupt-bundle' -and ($report.remainingLeaseCount -ne 0 -or $report.remainingBundleCount -ne 0 -or $report.bundleReadCount -ne 1)) {
        throw '損壞反例必須確實讀取 bytes 並且不殘留資源。'
    }
    if ($Name -eq 'missing-bootstrap-catalog' -and ($report.allocatedHandleCount -ne 0 -or $report.bundleReadCount -ne 0)) {
        throw '啟動 catalog 缺失必須在資產配置前拒絕。'
    }
    Write-Output "$Name：符合預期；exit=$($process.ExitCode)，證據=$caseRoot"
}

Invoke-ProbeCase $probeExe 'normal' '-screen-fullscreen 0 -screen-width 960 -screen-height 640 -force-d3d11' $true ''
Invoke-ProbeCase $probeExe 'no-graphics' '-batchmode -nographics' $false '*GraphicsPipelineUnavailable*'

# 故障注入只作用於本次新建複本；原本可用 Player 與任何 profile 都不變。
$faultParent = Split-Path (Split-Path $probeSource -Parent) -Parent
# 複本不巢狀放在長報告路徑，避免 Mono 的長路徑限制掩蓋指定的故障。
$faultRoot = Join-Path $faultParent ('fault-sqlite-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
Copy-Item -LiteralPath $probeSource -Destination $faultRoot -Recurse
$faultDll = Join-Path $faultRoot 'BrickHighToolchainProbe_Data/Plugins/x86_64/sqlite3.dll'
$resolvedFaultDll = (Resolve-Path -LiteralPath $faultDll).Path
$faultPrefix = [IO.Path]::GetFullPath($faultRoot).TrimEnd('\') + '\'
if (-not $resolvedFaultDll.StartsWith($faultPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw '故障注入路徑越界。' }
Move-Item -LiteralPath $resolvedFaultDll -Destination (Join-Path $faultRoot 'sqlite3.dll.disabled')
Invoke-ProbeCase (Join-Path $faultRoot 'BrickHighToolchainProbe.exe') 'missing-sqlite' '-screen-fullscreen 0 -force-d3d11' $false 'DllNotFoundException:*'

# 同名、同大小、同時間戳的替換不能沿用舊驗證；僅修改新建的測試複本。
$corruptRoot = Join-Path $faultParent ('fault-bundle-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
Copy-Item -LiteralPath $probeSource -Destination $corruptRoot -Recurse
$corruptCatalog = Get-ProbeCatalogRoot $corruptRoot
$bundleCandidates = @(Get-ChildItem -LiteralPath (Join-Path $corruptCatalog 'aa') -Filter '*.bundle' -File -Recurse)
if ($bundleCandidates.Count -ne 1) { throw '內部測試包必須恰有一份 bundle。' }
$bundlePath = $bundleCandidates[0].FullName
$corruptPrefix = [IO.Path]::GetFullPath($corruptRoot).TrimEnd('\') + '\'
if (-not $bundlePath.StartsWith($corruptPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw '故障注入路徑越界。' }
$originalTime = $bundleCandidates[0].LastWriteTimeUtc
$originalLength = $bundleCandidates[0].Length
Copy-Item -LiteralPath $bundlePath -Destination (Join-Path $corruptRoot 'original.bundle.backup')
$bundleStream = [IO.File]::Open($bundlePath, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
try {
    $originalByte = $bundleStream.ReadByte()
    $bundleStream.Position = 0
    $bundleStream.WriteByte([byte]($originalByte -bxor 1))
    $bundleStream.Flush($true)
} finally { $bundleStream.Dispose() }
[IO.File]::SetLastWriteTimeUtc($bundlePath, $originalTime)
if ((Get-Item -LiteralPath $bundlePath).Length -ne $originalLength) { throw '同大小反例無效。' }
Invoke-ProbeCase (Join-Path $corruptRoot 'BrickHighToolchainProbe.exe') 'corrupt-bundle' '-screen-fullscreen 0 -force-d3d11' $false 'FirstAcquire:AssetCorrupt'

if ((Get-ProbeCatalogRoot $probeSource) -ne [IO.Path]::GetFullPath((Join-Path $probeSource 'BrickHighToolchainProbe_Data/StreamingAssets'))) {
    # 包內 bundle 才是資產來源；移走新複本頂層 bundle 後仍須成功。
    $topRoot = Join-Path $faultParent ('fault-top-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
    Copy-Item -LiteralPath $probeSource -Destination $topRoot -Recurse
    $topBundles = @(Get-ChildItem -LiteralPath (Join-Path $topRoot 'BrickHighToolchainProbe_Data/StreamingAssets/aa') -Filter '*.bundle' -File -Recurse)
    if ($topBundles.Count -ne 1) { throw '內部探針必須恰有一份頂層 bundle。' }
    $topPrefix = [IO.Path]::GetFullPath($topRoot).TrimEnd('\') + '\'
    if (-not $topBundles[0].FullName.StartsWith($topPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw '故障注入路徑越界。' }
    Move-Item -LiteralPath $topBundles[0].FullName -Destination (Join-Path $topRoot 'unused.bundle.backup')
    Invoke-ProbeCase (Join-Path $topRoot 'BrickHighToolchainProbe.exe') 'no-top-level-bundle' '-screen-fullscreen 0 -force-d3d11' $true ''

    # 啟動 catalog 與包內私有 catalog 是兩份受控檔案，缺一不可。
    $bootstrapRoot = Join-Path $faultParent ('fault-boot-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
    Copy-Item -LiteralPath $probeSource -Destination $bootstrapRoot -Recurse
    $bootstrapCatalog = (Resolve-Path -LiteralPath (Join-Path $bootstrapRoot 'BrickHighToolchainProbe_Data/StreamingAssets/aa/catalog.bin')).Path
    $bootstrapPrefix = [IO.Path]::GetFullPath($bootstrapRoot).TrimEnd('\') + '\'
    if (-not $bootstrapCatalog.StartsWith($bootstrapPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw '故障注入路徑越界。' }
    Move-Item -LiteralPath $bootstrapCatalog -Destination (Join-Path $bootstrapRoot 'bootstrap.catalog.backup')
    Invoke-ProbeCase (Join-Path $bootstrapRoot 'BrickHighToolchainProbe.exe') 'missing-bootstrap-catalog' '-screen-fullscreen 0 -force-d3d11' $false 'FirstAcquire:AssetMissing'
    Write-Output "另保留頂層與啟動故障複本：$topRoot；$bootstrapRoot"
}
Write-Output "保留可恢復的故障複本：$faultRoot；$corruptRoot"
Write-Output "內部工具鏈矩陣通過；不是安裝版、UX、全量或離線乾淨環境驗收：$probeEvidence"
