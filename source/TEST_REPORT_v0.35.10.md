# LuckyDex v0.35.10 Test Report

## Scope
Final Ekans' Hoop Hurl visual polish requested after v0.35.9:
- slightly larger Diglett / Dugtrio targets;
- true 3×3 cell-centre positioning, so the visual centre of each Pokémon sits at the centre of its box;
- no scoring, spawn, difficulty, start-flow or slingshot control changes.

## Changes
- Diglett target: 88×88 standard, 80×80 phone.
- Dugtrio target: 108×100 standard, 96×90 phone.
- Target row centres changed from compressed 76 / 51.5 / 27% placement to true near / middle / far cell centres at 83 / 50 / 17% from the top.
- Aim marker and airborne landing use the same row-centre mapping, preserving visual hit alignment.
- Horizontal lane centres remain 17 / 50 / 83%.
- Android application ID remains `com.example.luckydex`.
- Version metadata: `versionCode 3510`, `versionName 0.35.10`.

## Verification
Focused Hoop Hurl regressions passed, including:
- sprite scale + cell centering;
- slingshot direction;
- Android touch ownership;
- start/difficulty UI;
- clean board / pull-back runway;
- all historical Ekans core/runtime/lifecycle regressions.

Full source-tree regression pass:
- 217 non-browser test programs passed.
- 27 Playwright/recovery-browser dependent programs skipped because Playwright is not installed in this extracted environment.
- Arcade asset integrity: PASS.
- Venue asset integrity: PASS.
- Adventure asset integrity: PASS.
- Fossil Museum asset integrity: PASS.

No Android Gradle build is claimed from this environment; the release ZIP is packaged flat so CI can extract it directly to the Gradle project root.
