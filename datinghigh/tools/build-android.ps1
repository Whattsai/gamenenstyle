param([ValidateSet('x86_64','arm64-v8a')][string]$Architecture='x86_64')
$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if(!$env:ANDROID_HOME){$env:ANDROID_HOME=Join-Path $env:LOCALAPPDATA 'Android/Sdk'}
if(!$env:JAVA_HOME){$jdk=Get-ChildItem 'C:/Program Files/Microsoft' -Directory -Filter 'jdk-17*' | Select-Object -First 1;if(!$jdk){throw 'Install JDK 17 or set JAVA_HOME'};$env:JAVA_HOME=$jdk.FullName}
$ninja=Join-Path $taskRoot '.local/toolchain/ninja';New-Item -ItemType Directory -Force $ninja | Out-Null
if(!(Test-Path (Join-Path $ninja 'ninja.exe'))){
    $archive=Join-Path $ninja 'ninja-win.zip'
    Invoke-WebRequest 'https://github.com/ninja-build/ninja/releases/download/v1.13.2/ninja-win.zip' -OutFile $archive
    if((Get-FileHash $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne '07fc8261b42b20e71d1720b39068c2e14ffcee6396b76fb7a795fb460b78dc65'){throw 'Ninja checksum mismatch'}
    Expand-Archive -LiteralPath $archive -DestinationPath $ninja
}
Push-Location (Join-Path $taskRoot 'frontend/client')
try{
    & node node_modules/expo/bin/cli prebuild --platform android --no-install
    if($LASTEXITCODE -ne 0){throw 'Expo prebuild failed'}
    Push-Location android
    try{& ./gradlew.bat assembleDebug --init-script (Join-Path $PSScriptRoot 'android-windows.gradle') --no-daemon --console=plain "-PreactNativeArchitectures=$Architecture";if($LASTEXITCODE -ne 0){throw 'Gradle build failed'}}finally{Pop-Location}
}finally{Pop-Location}
