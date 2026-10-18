# LuckyDex v0.45.0 — Elemental Gauntlet verification report

16 October 2026. Delivery is a local source archive based solely on the user-supplied v0.44.0 `LuckyDex_source.zip` (7,485 files; SHA-256 `37454930d9bd623630b20d4795a5a05069b17ee1be877db0ff16ae496dd8839f`). Codex was not used. No remote repository was modified by this build session.

## Release identity

- versionName / package version / visible build: **0.45.0**
- Android versionCode: **4500**
- Android application ID retained: **com.example.luckydex**
- Existing signing configuration retained; no replacement signer generated.

## Elemental Gauntlet behavior

Elemental Gauntlet is the fifth playable Pokémon Challenge Course / Goldenrod event and uses caught Pokémon base **Special Defense**. Canonical Sp. Def values for species IDs 1–1025 are packaged locally. Five waves are present: Fire, Water, Electric, Ice and Psychic.

The control model is skill-first: drag/tap movement avoids telegraphed hazards, while a rechargeable hold-to-Defend control is a fallback when trapped. A clean dodge always takes zero damage. In the focused deterministic damage check using a 34-power hit, base Sp. Def 5 takes 58 damage, Sp. Def 160 takes 21, a full Defend at Sp. Def 5 reduces that hit to 17, and a clean dodge at Sp. Def 5 takes 0. Thus stats strongly change mistakes without making the highest-stat Pokémon a substitute for execution.

Exhibition supports Easy / Normal / Hard. Goldenrod uses the existing three-round Division Cup and Type Cup machinery from Rookie through Master, including seeded CPU scoring, standings, trophies and payout settlement. Permanent records store plays, clears, Hard clears, flawless clears, best score(s), best remaining HP, perfect waves, total dodges, defended hits, damage taken, Prismatic Storms seen/cleared and last Pokémon.

## Rare event and achievements

Prismatic Storm is a 2% vanilla rare roll. It visibly mixes element identities across the five waves and uses the existing reserved-safe rare Arcade reward pipeline when fully cleared. Settings exposes **Off / Vanilla 2% / Test 25% / Always 100%** so it can be tested on-device without waiting for RNG.

Seven new achievements are wired: Elemental Master, Into the Storm, Storm Veteran, Five Elements Standing, Specialist Survivor, Untouchable and hidden Prismatic Survivor. The existing Goldenrod Grand Champion four-event requirement is intentionally left unchanged to avoid invalidating an achievement already earned before this fifth event existed.

## Focused verification

Fresh final-source commands completed successfully:

- `node --check` on all changed/new application JavaScript files: **PASS**.
- Challenge Course / Goldenrod focused regression group: **93 tests pass, 0 fail** across 17 test programs, including the new v0.45.0 gameplay and release tests.
- `tests/v0390-arcade-records-registry.test.cjs`: **PASS**, including an adapter for Elemental Gauntlet. Its deliberate simulated `save()` failure logs `disk full` while asserting that review commit remains non-throwing.
- Historical structural tests that hard-coded the previous four Challenge Course event IDs were updated only to recognise `elementalGauntlet`; gameplay/trophy/stat assertions were not relaxed.

The v0.45.0 tests specifically verify the five elemental waves, skill-vs-stat damage contract, 2%/forced rare-roll boundaries, Goldenrod/world/session/records/settings/achievement wiring, Exhibition and tournament runtime APIs, all five CSS type identities, telegraphs/impact states, Defend control, release identity and unchanged Android application ID.

## Offline integrity guards

All five existing offline guards passed on the final source:

- Arcade asset check: **44** authentic scenes/sheets/crops, **2,098** sprites and **2,078** actor outputs.
- Venue integrity: **8** local venue assets.
- Adventure assets: **829** images, **1,025** species, **386** back-sprite species and **37** registry objects.
- Fossil Museum: **42** images.
- Sleeve audit: all **202** registered images, 8,210,062 bytes.

Generated guard caches/audit output not present in the supplied archive were removed before packaging.

## Browser / Android limitation

The normal full historical test runner could not be completed in this container because the supplied source archive does not contain `node_modules`, the locked Node Playwright package could not be installed in the available environment, and the system Chromium binary is blocked by local administrator navigation policy. This is an environment limitation, not reported as a browser pass. The supplied v0.44.0 report already records its historical inherited full-suite failures; this pass does not claim those old failures disappeared.

No local Gradle wrapper/system Gradle build or Android device/emulator run is available here, so no local APK build is claimed. The source preserves the existing repository/Android identity and is intended to use the project's existing GitHub APK workflow after push.

## Packaging

`scripts/package-source-v0450.py` audits the exact supplied v0.44.0 archive, rejects unexpected changed/added/removed source files, excludes transient dependencies/caches/build outputs, verifies ZIP CRC, and compares every packaged byte back to the working source. The final source archive is `LuckyDex_source_v0.45.0.zip`; its SHA-256 is supplied alongside the archive after packaging.
