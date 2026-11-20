# LuckyDex v0.69.328 — Flashfire build failure + player-reported regressions

## Verified GitHub build failure

Workflow run #617, 20 November 2026, `https://github.com/FlintFireforge116/lucky-dex/actions/runs/44833527227`: `:app:auditXY2ForApk` failed on v07327 Flashfire completion test 49/49. The test selected Sneasel's **Scratch** (attackIndex 0), then expected Flash Claw's defending-player hand-discard choice. The actual printed Flash Claw is attackIndex 1. The real logic was working; the audit test was wrong. Corrected the test to find the named attack, keeping the genuine defending-player card choice checks.

## Other fixes

- Reshiram BW1/BW4 printed costs were already correct in data. The screenshot's extra icons and unattainable cost are explained by array `toString()` injecting commas into the cost. Normalised array costs to symbol strings at battle cost construction, direct cost payment, cost labels and energy icons. Added a battle-level test with two Fire attached.
- Noble Victories Vanilluxe Double Freeze now uses the supported `coinDamageStatus` with two logged visible coin results and 40 damage per heads; Paralysis on at least one heads. Eliminates the old no-damage handler path.
- XY Base and Flashfire were present in set rows but excluded by the set picker's missing XY era grouping. Added XY to the release-era list used by both player and CPU/opponent menus.
- Existing XY1/XY2 print catalogues are empty build placeholders, replaced in GitHub Actions by the pinned-source Python generation tasks. The v07328 post-generation audit now asserts **146 and 110 actual cards** in the final assets, so the build cannot silently package empty catalogues. Pinned Git-blob fetches remain unchanged and their SHA pin checks are mandatory; the latest failed run had already completed both XY generators.
- New version v0.69.328. Added both targeted and build-integrated regression tests; no Codex used.

## Verification scope

- Confirmed actual failure by reading GitHub Actions job 136624129968 logs.
- Local regression checks for costs, 0/40/80 damage + coin logs, defending-player Flash Claw hand choice and XY selector all pass.
- Final full-XY asset verification and Android APK compilation require Gradle/official GitHub generation and are **not** claimed complete locally. The new test intentionally fails on the source ZIP's blank XY placeholders if run before Gradle generates the catalogues.
