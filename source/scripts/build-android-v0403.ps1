param([string]$GradleBat = 'C:\Users\sjwal\.gradle\wrapper\dists\gradle-8.12.1-bin\eumc4uhoysa37zql93vfjkxy0\gradle-8.12.1\bin\gradle.bat')
$ErrorActionPreference='Stop'
$taskRoot=Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $taskRoot
$taskTools=Join-Path (Split-Path $taskRoot -Parent) '.tools'
if (!$env:GRADLE_USER_HOME) {$env:GRADLE_USER_HOME=Join-Path $taskTools 'gradle-user-home'}
if (!$env:ANDROID_USER_HOME) {$env:ANDROID_USER_HOME=Join-Path $taskTools 'android-user'}
if (!$env:ANDROID_HOME) {$env:ANDROID_HOME=Join-Path $taskTools 'android-sdk'}
if (!$env:LUCKYDEX_PYTHON) {throw 'Set LUCKYDEX_PYTHON to an installed Python executable.'}
New-Item -ItemType Directory -Force -Path 'artifacts/v0403' | Out-Null
& $GradleBat --offline --no-daemon --console=plain :app:assembleDebug *> 'artifacts/v0403/android-build.log'
$taskBuildExit=$LASTEXITCODE
Get-Content -LiteralPath 'artifacts/v0403/android-build.log' -Tail 50
if ($taskBuildExit -ne 0) {throw "Gradle build failed: $taskBuildExit"}
Copy-Item -LiteralPath 'app/build/outputs/apk/debug/app-debug.apk' -Destination 'artifacts/LuckyDex-v0.40.3-debug.apk'
$taskBuildTools=Join-Path $env:ANDROID_HOME 'build-tools/35.0.0'
& (Join-Path $taskBuildTools 'aapt.exe') dump badging 'artifacts/LuckyDex-v0.40.3-debug.apk' *> 'artifacts/v0403-apk-metadata.log'
if ($LASTEXITCODE -ne 0) {throw 'APK metadata inspection failed'}
& (Join-Path $taskBuildTools 'apksigner.bat') verify --verbose --print-certs 'artifacts/LuckyDex-v0.40.3-debug.apk' *> 'artifacts/v0403-apk-signature.log'
if ($LASTEXITCODE -ne 0) {throw 'APK signature verification failed'}
Get-Content -LiteralPath 'artifacts/v0403-apk-metadata.log' -TotalCount 3
Get-Content -LiteralPath 'artifacts/v0403-apk-signature.log' -TotalCount 9
