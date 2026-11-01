param([string]$Pattern='', [string]$Suite='forms-matrix', [string]$AdbPort='')
$ErrorActionPreference='Stop'
if($Suite -notin @('forms-matrix','faults','recovery-matrix','retry-matrix','account-matrix','identity-matrix','pending-matrix','real-identity','real-google-lifecycle','cross-platform-email')){throw 'Unknown Android suite'}
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Add-Type -Namespace DatingHigh -Name TestAwake -MemberDefinition '[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint state);'
# 僅此測試程序提出保持系統喚醒要求；不更改電源設定，也不阻止使用者手動睡眠。
[DatingHigh.TestAwake]::SetThreadExecutionState([uint32]2147483649) | Out-Null
try{
 if($AdbPort){$env:DATINGHIGH_ADB_PORT=$AdbPort}
 $testArgs=@('--test');if($Pattern){$testArgs+=@('--test-name-pattern',$Pattern)};$testArgs+=Join-Path $taskRoot "tests/e2e/android/$Suite.test.mjs"
 & node @testArgs
 $testExit=$LASTEXITCODE
}finally{[DatingHigh.TestAwake]::SetThreadExecutionState([uint32]2147483648) | Out-Null}
exit $testExit
