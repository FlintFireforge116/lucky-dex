# LuckyDex v0.69.277 — Arceus CI preflight repair

Both GitHub APK workflows failed in `:app:auditArceusForApk` before an APK was assembled:
- Run 567 / commit ad2a2cfd85567f49298b17261cc1ed79022dea81 — two stage-1 tests failed.
- Run 568 / commit 471cf983efbf0fb17703a6bd8fd1451115e5cfea — three stage-1 tests failed.
- The immutable English `pl4.json` successfully fetched and the v276 generator printed 111 collector IDs (108 enabled, three Fossils gated).

## Corrections
1. Bronzong Antigravity uses the engine's supported `nextOwnTurn` modifier duration, not invalid `nextTurn`.
2. Lopunny Hover Heal lists all five Special Conditions to clear, satisfying the engine schema and the printed text.
3. The Classic collection projection respects actual `quantity` when `count` is absent, preserving collector ownership counts.
4. Old Amber Hard Amber maps to a real continuous Bench-only prevention Body, respecting Body suppression.
5. Dome Fossil Rock Reaction and Helix Fossil Aqua Reaction are real triggered abilities, using the shared battle event to offer a choice only for Fighting/Water Energy respectively attached from hand; the previous duplicate hard-coded hook was removed. Exact matching evolution cards from the deck are chosen and evolved or the player may decline.
6. Gradle and the Termux generator execute new v07277 regression checks in addition to v07275 and v07276.

## Verification
- 163 predefined mapped attacks, abilities and trainer effects checked against `validateEffect`: 0 invalid definitions.
- `node --test tests/v07277-arceus-build-fixes.test.cjs tests/v07276-arceus-completion.test.cjs tests/v07273-supreme-victors-completion.test.cjs`: 36/36 passed locally.
- `node --test tests/v07274-supreme-victors-independent-audit.test.cjs`: 11/11 passed separately.
- Local JavaScript syntax checks passed. Full authenticated Arceus print test v07275, GitHub Actions APK build and Android gameplay are pending; no claim of a successful APK build until GitHub confirms.

## Install on top of v276
```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.277_ARCEUS_BUILD_FIX.zip -d source
sh source/scripts/prepare-arceus.sh && git add source && git commit -m "LuckyDex v0.69.277 fix Arceus CI" && git push origin main
```

Do not run `git push` if the preparation script fails. Existing generated `pl4-print-source.json` is preserved. Do not use Codex.
