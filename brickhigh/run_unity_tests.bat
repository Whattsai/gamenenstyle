<# :
@echo off
chcp 65001 > nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$rootDir = '%~dp0'.TrimEnd('\'); Invoke-Expression ([System.IO.File]::ReadAllText('%~f0'))"
pause
exit /b %ERRORLEVEL%
#>

$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

if (-not $rootDir) {
    $rootDir = "C:\GitProjects\gamenenstyle\brickhigh"
}

$unityDir = "C:\Program Files\Unity\Hub\Editor\6000.3.18f1\Editor"
$unityCom = Join-Path $unityDir "Unity.com"
$unityExe = Join-Path $unityDir "Unity.exe"
$projDir = Join-Path $rootDir "game"
$resDir = Join-Path $rootDir "artifacts\test-results"
$resFile = Join-Path $resDir "unity-editmode-results.xml"
$logFile = Join-Path $resDir "unity-editor-run.log"

if (-not (Test-Path $unityExe)) {
    Write-Host "[ERROR] Unity Editor not found at: $unityExe" -ForegroundColor Red
    Write-Host "Please ensure Unity 6000.3.18f1 installation is complete." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $resDir)) {
    New-Item -ItemType Directory -Path $resDir -Force | Out-Null
}

if (Test-Path $logFile) { Remove-Item $logFile -Force }
if (Test-Path $resFile) { Remove-Item $resFile -Force }

$unity = if (Test-Path $unityCom) { $unityCom } else { $unityExe }

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  BrickHigh - Unity EditMode Live Test Runner" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Project: $projDir"
Write-Host "Results: $resFile"
Write-Host "Log:     $logFile"
Write-Host ""
Write-Host "-------------------- UNITY CONSOLE OUTPUT --------------------"

& $unity -batchmode -projectPath $projDir -runTests -testPlatform EditMode -testResults $resFile -logFile - | ForEach-Object {
    Write-Host $_
    Add-Content -Path $logFile -Value $_ -Encoding UTF8
}

$code = $LASTEXITCODE
Write-Host "--------------------------------------------------------------"

if ($code -eq 198) {
    Write-Host ""
    Write-Host "==============================================================" -ForegroundColor Red
    Write-Host "  [LICENSE ERROR] Unity returned code 198: No valid license found." -ForegroundColor Red
    Write-Host "==============================================================" -ForegroundColor Red
    Write-Host "Unity requires an active license to run tests." -ForegroundColor Yellow
    Write-Host "Steps to activate free license:" -ForegroundColor Yellow
    Write-Host "  1. Open Unity Hub"
    Write-Host "  2. Sign in to your Unity account"
    Write-Host "  3. Go to Preferences -> Licenses"
    Write-Host "  4. Click 'Add license' -> 'Get a free Personal license'"
    Write-Host "  5. Rerun this script once activated!"
    Write-Host ""
} elseif (Test-Path $resFile) {
    try {
        [xml]$xml = Get-Content $resFile
        $tot = $xml.'test-run'.total
        $pas = $xml.'test-run'.passed
        $fai = $xml.'test-run'.failed
        Write-Host ""
        Write-Host "[TEST SUMMARY] Total: $tot | Passed: $pas | Failed: $fai" -ForegroundColor Cyan
        if ($fai -eq '0' -and [int]$tot -gt 0) {
            Write-Host "==============================================================" -ForegroundColor Green
            Write-Host "  [VERIFICATION SUCCESS] All $tot EditMode tests passed!" -ForegroundColor Green
            Write-Host "==============================================================" -ForegroundColor Green
        } else {
            Write-Host "[VERIFICATION FAILED] Some tests failed. See details in $logFile" -ForegroundColor Red
        }
    } catch {
        Write-Host "[WARNING] Could not parse test XML: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[ERROR] Unity exited with code $code and did not produce results XML." -ForegroundColor Red
    Write-Host "Check the console output above or $logFile for error details." -ForegroundColor Yellow
}
