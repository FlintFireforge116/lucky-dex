# Android build and verification

The debug APK can be built from the repository root with the existing
`:app:assembleDebug` Gradle task. The recovery workstation uses an isolated SDK
and dependency cache under ignored `.tools/`; `local.properties` points at that
SDK. Neither directory nor the signing key belongs in Git.

## Local environment

- Windows, Eclipse Temurin JDK 21.0.7.
- Cached Gradle 8.12.1; the Actions workflow originally selected Gradle 8.9 and
  Java 17. The local result therefore does not prove that Actions has run.
- Android Gradle Plugin 8.7.3, compile/target SDK 35, minimum SDK 26.
- Android platform 35 and Build Tools 34.0.0/35.0.0. AGP selected 34.0.0 for
  assembly; 35.0.0 tools were used to inspect metadata and signatures.
- Official Android command-line tools 22.0, downloaded from
  [Android Developers](https://developer.android.com/studio#command-tools).
  Package `commandlinetools-win-15859902_latest.zip` was verified against the
  published SHA-256
  `90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a`.

No global tool installation or persistent environment change was needed.

Use `ANDROID_USER_HOME` for Gradle's isolated preferences and leave
`ANDROID_SDK_HOME` unset. The deprecated `ANDROID_SDK_HOME` variable implicitly
adds `.android`; setting both variables to the same directory produces a
preference-location conflict. The workstation helper clears the deprecated
variable before building. Emulator-only commands use equivalent locations:
`ANDROID_SDK_HOME=.tools/android-user` and
`ANDROID_USER_HOME=.tools/android-user/.android`.

## Build

For a configured Android SDK, JDK and Gradle installation:

```powershell
gradle --no-daemon --console=plain :app:assembleDebug
```

On this workstation the ignored helper records the build log, copies the APK to
`artifacts/`, verifies its signature, inspects its package metadata and writes a
SHA-256 sidecar:

```powershell
& .\.tools\build-android.ps1 -Label final
```

The raw Gradle output is `app/build/outputs/apk/debug/app-debug.apk`. The copied
output is `artifacts/LuckyDex-v<versionName>-final-debug.apk`.

Keep the existing `app/luckydex-dev.keystore` private. The APK contains its public
signing certificate, as required by Android; the private key is not exported.
An installed app can be updated only by an APK signed with the same certificate.

Before a fresh build, follow the workflow's asset preparation/check steps. The
local assembly packages the files currently present in `app/src/main/assets`;
it does not automatically fetch missing art.

## Baseline verification, 5 October 2026

The unchanged Android build configuration assembled successfully in 24 seconds.
`aapt dump badging` confirmed `com.example.luckydex`, version `0.20.0` / code
`210`, minimum SDK `26`, target SDK `35`. `apksigner verify --verbose` passed
with APK Signature Scheme v2 and one development signer.

- APK: `artifacts/LuckyDex-v0.20.0-baseline-debug.apk`
- Size: 7,208,675 bytes.
- SHA-256: `a9cb52675965e1e6d50de947533dde88eb6cc3d0f45d41afdbb1c855b113b036`.
- Build log: `artifacts/baseline-android-build.log`.
- Metadata and signature logs: `artifacts/baseline-apk-metadata.log` and
  `artifacts/baseline-apk-signature.log`.

The Java compiler reported obsolete Java 8 source/target defaults and deprecated
Android API use. Gradle reported deprecated features incompatible with Gradle 9.
These warnings did not prevent assembly.

The recovery source also assembled successfully in 12 seconds after correcting
the preference-variable conflict. Its signed v0.20.0 APK was 10,342,924 bytes,
SHA-256 `ef7a1eec42b528302cf3babf66a750ecc72d6079c8baa543c770aaf6ffce132d`,
at `artifacts/LuckyDex-v0.20.0-recovery-debug.apk`.

The v0.21.0 candidate subsequently assembled successfully in 9 seconds.
`aapt` confirmed version name `0.21.0` / code `211`, with minimum SDK `26`
and target SDK `35`; `apksigner` verified its v2 development signature.
`artifacts/LuckyDex-v0.21.0-candidate-debug.apk` is 10,347,115 bytes after the final visual repair, SHA-256
`41b26b3c36776f3a922ee74c126a15b79d929cc42e84c4f77b159afcf3f8a663`.
Evidence is in `artifacts/candidate-android-build.log`,
`artifacts/candidate-apk-metadata.log` and
`artifacts/candidate-apk-signature.log`.

## Runtime coverage

Initially `adb devices -l` returned no connected physical device and no installed
emulator or existing AVD was found in conventional local locations. A subsequent
isolated runtime test installed emulator 37.2.12 and API 35 Google APIs x86_64
system image revision 9 under `.tools/android-sdk`, then created
`LuckyDexRecovery35` under `.tools/avd`.

The host has an AMD Ryzen 9 7950X3D, 63.2 GiB RAM, enabled firmware virtualization
and `HypervisorPresent=False`. `emulator -accel-check` reported code 6:
`Android Emulator hypervisor driver is not installed on this machine`.
Installing a hypervisor driver or enabling Windows optional features would
change the host and require administrator privileges; neither was attempted.

Headless cold software boots were attempted with `-no-accel -no-window
-no-audio -no-snapshot`, using SwiftShader graphics, then one virtual CPU with
Vulkan disabled and graphics disabled. A final attempt used Windows short
paths to rule out spaces in the SDK directory and attached output to the command
session. Each reachable attempt stayed `adb offline`, did not report
`sys.boot_completed`, and produced no guest kernel output. QEMU diagnostics
stopped during early boot-property initialization. All emulator processes
created for these attempts were stopped; the SDK and AVD remain isolated and
recoverable under `.tools/`.

Logs are in `artifacts/android-emulator-*.log`; the final adb evidence is
`artifacts/android-emulator-final-adb.log`. This establishes an emulator setup
blocker, not an application failure: the APK could not be installed or launched
on the offline guest. Compilation, packaging, metadata and cryptographic
signature checks passed; Android WebView behavior, lifecycle recovery, physical
Back navigation and absence of Android crashes remain unverified on a device
or emulator.

With an authorized connected device, install with `adb install -r <apk>`, launch
LuckyDex, exercise collection/search/pack/navigation and arcade screens, then
inspect `adb logcat` for application exceptions and WebView failures. A browser
smoke test does not substitute for these Android checks.

The user confirmed no device is available and requested delivery of the recovery candidate. Native installation/runtime QA is deliberately outstanding in this delivery.
