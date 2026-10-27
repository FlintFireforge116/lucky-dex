# LuckyDex v0.69.33 — Pocket card implementation report

Date and card-data cutoff: **27 October 2026, Europe/London**.

## Delivery and baseline

Patch-only release **0.69.33 / Android versionCode 7014**. Application ID remains `com.example.luckydex`; the supplied signer is unchanged and is not in the patch. Canonical application layout remains `~/lucky-dex/source`. The sole input baseline was the newly supplied `lucky-dex.zip`, SHA-256 `9662b9a9a71716395d1bedf1eba73a2095b864a8b70159784cb36e99aee9e041`, containing canonical v0.69.32 / 7013. Its 8,817 source files were extracted directly. Earlier LuckyDex versions were ignored.

The external repository and source archive were not modified. A local isolated Git snapshot of the exact supplied working files is the patch comparison baseline (`3b36381d7a477d3cbad8d8fdcf42e751ce9f73c4`); the archive's 1.6 GB Git history is not needed or shipped. No push, publication or remote merge was performed.

## Exact coverage — remaining exceptions are not hidden

| Measure | Count |
| --- | ---: |
| Expansion/promo namespaces | 24 |
| Known collectible prints | 4317 |
| Released/obtainable prints | 4316 |
| Canonical gameplay identities | 2319 |
| FULL | 1145 |
| PARTIAL | 543 |
| UNSUPPORTED | 631 |
| Unmapped released prints | 0 |
| Unknown effect references | 0 |
| Schema errors | 0 |
| Invalid enabled evolution references | 0 |

**This is not an all-cards-fully-supported claim.** All released prints have a local canonical mapping, but only FULL cards are enabled in legal decks. PARTIAL cards have detailed rules with an unsupported mechanic/data-quality constraint. UNSUPPORTED cards lack compatible detailed combat data. Every one of the **543 PARTIAL and 631 UNSUPPORTED identities** is named with reasons in [TCGP_CARD_COVERAGE.md](TCGP_CARD_COVERAGE.md); `generated/tcgp-card-coverage.json` additionally lists every affected print.

Released print support is **1,959 FULL / 1,217 PARTIAL / 1,140 UNSUPPORTED**. Detailed licensed data covers 1,688 identities; 631 identities remain without it, mainly newer B-series designs. The only complete detailed source found was AGPL, and the user prohibited incorporating it without approval. No unlicensed wholesale dataset was substituted and no same-name attack/ability was invented. Other remaining examples include Pidgeot's opponent-chosen Drive Off, Lilligant's type-restricted Bench Energy attachment, Mesagoza's activated Stadium, complex evolution, attack copying, discard-Energy recovery and multiple independent target selections. The exhaustive report gives actual card names and exact text, rather than this abbreviated example list.

P-B-103 is known in collection metadata but requires ten login days from October 20, making October 29 the earliest obtainable date; it is explicitly excluded from released coverage. Dual Fusion (October 29 UTC) and First Partners (October 31) are future releases and excluded. Existing collection feeds and ownership are untouched.

## Expansions included

- **A1** — Genetic Apex (2024-10-30)
- **A1a** — Mythical Island (2024-12-17)
- **A2** — Space-Time Smackdown (2025-01-29)
- **A2a** — Triumphant Light (2025-02-28)
- **A2b** — Shining Revelry (2025-03-27)
- **A3** — Celestial Guardians (2025-04-30)
- **A3a** — Extradimensional Crisis (2025-05-29)
- **A3b** — Eevee Grove (2025-06-26)
- **A4** — Wisdom of Sea and Sky (2025-07-30)
- **A4a** — Secluded Springs (2025-08-28)
- **A4b** — Deluxe Pack: ex (2025-09-30)
- **P-A** — Promo A (2024-10-30)
- **B1** — Mega Rising (2025-10-30)
- **B1a** — Crimson Blaze (2025-12-17)
- **B2** — Fantastical Parade (2026-01-29)
- **B2a** — Paldean Wonders (2026-02-26)
- **B2b** — Mega Shine (2026-03-26)
- **B3** — Pulsing Aura (2026-04-28)
- **B3a** — Paradox Drive (2026-05-28)
- **B3b** — Everyday Wonders (2026-06-30)
- **B4** — Ruler of the Skies (2026-07-30)
- **B4a** — Team Rocket’s Ambition (2026-08-27)
- **B4b** — Deluxe Pack: Mega (2026-09-30)
- **P-B** — Promo B (2025-10-30)

These are 22 expansions plus Promo-A and Promo-B. Release boundaries and official announcement links are recorded in [TCGP_CARD_SOURCES.md](TCGP_CARD_SOURCES.md).

## Sources and licences

- **PocketDecks legacy v4**, `ec444f849be468d0104977906b4e1f14b42a5d47`, MIT, Copyright 2024 Chase Manning: 4,317-print inventory and collection metadata, bundled verbatim as a development input. Its v5 AGPL datasets/projections were not imported.
- **flibustier/pokemon-tcg-pocket-database**, `746566d75408c04fe35210c503351dc87aee00c5`, MIT, Copyright 2025 Jon: basic print/set data and namespace-aware design keys. The unreliable combat defaults in `cards.extra.json` were not used.
- **TCGdex/cards-database**, `cbddf7e54033b1b58e44af1049c88832e55b94d0`, MIT, Copyright 2021 TCGdex: 2,480 detailed English Pocket records and 15 sets.
- **TCGdex feat/add-A4b**, `00eb8499ed1526bf4df8d5b1c724ba02ba081507`, same MIT notice: 288 additional Deluxe Pack ex records.

All notices, exact source paths, hashes, import scope and factual errata references are checked in. Full MIT notices are also bundled inside Android assets at `tcgp/generated/THIRD_PARTY_NOTICES.txt`. No upstream application code or image binaries were copied. Thirty-four reviewed field corrections resolve 16 conflicting rule families; raw imports are immutable and before-value guards prevent accidental drift. The source grants do not transfer Pokémon trademark/artwork ownership.

## Implementation and compatibility

The existing Battle Lab data/core/effects/deck/UI/AI architecture remains. Generated local definitions load once, then print and canonical indexes are prepared once. Asset design keys plus full normalized rule fingerprints link true art variants/reprints; different same-name cards remain separate. Collections still own their original print IDs, quantities, rarity, sets and art. Saved alternate-print deck entries remain unchanged; ownership aggregation and two-copy name limits account for aliases and accented Poké Ball names.

Thirty reusable validated effect types support deterministic damage/coins, healing, Energy, draw/search/recovery/hand shuffle, switching, Pocket conditions, prevention/modifiers, activated/passive/triggered abilities, Supporters, Tools, passive Stadiums and Fossils. Unknown or partially matched text stays explicitly unsupported. One action supports one independent selected target; multiple independent selections are rejected at compilation.

Pocket Confusion tails ends the attack without physical-TCG self-damage. Simultaneous KOs, physical Bench positions, manual promotion and continuation, evolution timing/status clearing and safe old saved-promotion states are tested. A reviewer reproduced FULL Hitmonlee's empty-Bench snipe incorrectly hitting Active; it was fixed through a failing actual-card test. A subsequent real-engine draw settlement test exposed explicit `winner:'draw'` being counted as a loss; the one-expression progress fix preserves legacy null draws, rewards/currencies and first-clear behavior.

Owned browsing searches all rows/print IDs but renders 100 at a time. Inspection exposes actual attack text/cost/damage, abilities, weakness/retreat, subtype and support reasons. Existing owned art metadata is preferred and missing art does not disable supported cards. Saved decks accept 1–3 Energy types and the seeded engine chooses the current Energy. The CPU uses only enumerated legal actions, bounded to 30 per turn, including legal abilities, targets, promotion and Trainer actions. Recent portrait layout, drag semantics, selected Bench, manual setup, narration and sleeves remain.

No Adventure, Arcade, Fishing, Trade, pack odds, general economy or unrelated achievement changes are included. Reward amounts and eligibility are unchanged. Main app and Android/package files have byte-minimal version substitutions; `index.html` additionally loads the one generated local table. The patch audit independently verifies preservation against the supplied archive.

## Tests and exact results

- Initial unchanged-baseline Battle subset: **34/34 passed**.
- Sequential final Battle Lab/data/schema/engine/deck/AI/UI/navigation/layout/drag/Bench/promotion/narration/stress/release run: **174 passed, 0 failed, 0 skipped**. Browser tests ran in real installed Chrome through Playwright with external requests blocked.
- After the draw-statistics correction: **3/3 progress checks passed**, including two existing checks and one new real simultaneous-KO settlement check. This adds one distinct check beyond the 174-run list; do not count the two repeated checks twice.
- Actual-card execution and varied stress were freshly rerun: **2/2 passed**.
- Source audit: **six pinned payload hashes and three MIT notices passed**. Restricted acquisition parser reproduction matched 2,480 main cards, 15 sets and 288 Deluxe records byte for byte; four valid grammar samples accepted, nine unsafe/executable inputs rejected. The explicit pinned refresh was also exercised successfully.
- Generated verifier: **0 schema errors, 0 unresolved released print IDs, 0 unknown effect references, 0 invalid enabled evolution references**; source hashes, coverage agreement and packaged notices pass.
- Whitespace check: `git diff --check` passed with the local repository configured to recognize the supplied CRLF endings.
- Eight added 360/393 px portrait captures passed page-error/overflow checks and were visually inspected; existing geometry tests cover 360×720, 360×800, 393×873, 412×915 and 430×932. The visual fixtures intentionally lack remote card art and demonstrate readable rules/fallback behavior.

Final regression command:

```powershell
$env:NODE_PATH='C:/Users/sjwal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
$battleTests=Get-ChildItem tests -Filter 'v069*-tcgp*.cjs' | ForEach-Object {$_.FullName}
node --test --test-concurrency=1 @battleTests tests/v06933-release.test.cjs
node --test tests/v06933-tcgp-progress.test.cjs tests/v06920-tcgp-battle-progress.test.cjs
python scripts/import-tcgp-sources.py
node scripts/verify-tcgp-catalogue.cjs
```

A normally installed project can use its local `npm ci` dependencies; `NODE_PATH` above is only this host's bundled runtime configuration. TDD RED/GREEN evidence is retained for importer/schema/identity, whole-text/activation context, engine families, UI/decks, empty-Bench sniping, draw settlement and release identity. One old data test was advanced only for the new display-text field and Fearow's now-supported seeded effect; assertions were not deleted.

## Stress and card execution

- **1000 completed battles; 0 stalls; 0 crashes; maximum 50 turns; failing seeds: none.**
- Outcomes by reason: {'points': 914, 'turn-limit': 85, 'simultaneous-ko': 1}. The inherited 50-turn Solo policy awards an opponent win; this remains an explicit rules divergence.
- **1140 FULL attack definitions and 23 FULL Trainer definitions** executed twice from identical legal fixtures with identical results. 4 activated and 17 passive/triggered Pokémon ability definitions were also exercised in relevant fixtures. Fossil discard and Tool/Stadium contexts have family/actual-card tests.
- State checks cover finite/nonnegative damage and Energy, legal hand/Bench sizes, promotion completion, bounded action/turn loops and deterministic RNG. PARTIAL/UNSUPPORTED cards are deliberately not falsely claimed as executed gameplay.

## Project-wide and review limitations

The normal project runner was run. It completed **12 test programs: 11 passed and 1 failed**, then stopped by its existing fail-fast behavior. The failing program is `adventure-location-browser-v0402.test.cjs`: **8 cases, 6 passed and 2 failed**:

1. `v0402 starting town has at most six valid local actions, truthful services, and a separate unique tool strip` — New Bark Town's Map tool count is 0 instead of 1.
2. `v0402 first-Gym chapter completes through ordinary UI travel and real PP-bearing battle moves` — the same Map-tool assertion.

Both failures reproduce with matching diagnostics in the untouched 8,817-file v0.69.32 source extraction. No Adventure files were changed. Programs after that fail-fast stop were not executed; the entire project suite is **not** claimed green.

An initial parallel Battle run was **167/169**: one intentionally superseded data-object/unsupported expectation, and one 4-second hand locator timeout in `centre Trainer plays immediately; multi-target evolution shows only relevant choices; illegal card drop changes nothing`. The data expectation was updated for supported content; the browser case passed in isolation and in the sequential final run. Early agent runs without this host's Playwright module path failed to load Playwright; after configuring it, all current Battle browser cases ran. No current Battle browser test is omitted as unavailable.

Independent read-only review found the Hitmonlee targeting bug described above. Its final review turn was interrupted by a usage limit, so a complete independent clean-review signoff is not claimed. The reported bug has RED/GREEN evidence and the release-owner checks passed. No native Android build, emulator installation or physical-device test was performed for this patch-only task.

## Performance

One final local Node measurement: 1,771,893 generated-table bytes; load/index 51.453 ms; retained heap 8,305,064 bytes. This is a host observation, not Android timing. Runtime does not repeatedly parse raw development datasets or fetch battle rules.

## Changed/new source files

- `README.md`
- `app/build.gradle`
- `app/src/main/assets/app-v0167.js`
- `app/src/main/assets/index.html`
- `app/src/main/assets/tcgp-battle-ai.js`
- `app/src/main/assets/tcgp-battle-core.js`
- `app/src/main/assets/tcgp-battle-data.js`
- `app/src/main/assets/tcgp-battle-decks.js`
- `app/src/main/assets/tcgp-battle-effects.js`
- `app/src/main/assets/tcgp-battle-progress.js`
- `app/src/main/assets/tcgp-battle-solo.js`
- `app/src/main/assets/tcgp-battle-ui.js`
- `app/src/main/assets/tcgp/generated/THIRD_PARTY_NOTICES.txt`
- `app/src/main/assets/tcgp/generated/catalogue.js`
- `data/tcgp/import/PocketDecks-LICENSE-MIT.txt`
- `data/tcgp/import/TCGdex-LICENSE-MIT.txt`
- `data/tcgp/import/cutoff.json`
- `data/tcgp/import/data-quality-overrides.json`
- `data/tcgp/import/flibustier-LICENSE-MIT.txt`
- `data/tcgp/import/flibustier-cards.json`
- `data/tcgp/import/flibustier-sets.json`
- `data/tcgp/import/identity-evidence.json`
- `data/tcgp/import/pocketdecks-v4-cards.json`
- `data/tcgp/import/provenance.json`
- `data/tcgp/import/tcgdex-A4b-cards.json`
- `data/tcgp/import/tcgdex-pocket-cards.json`
- `data/tcgp/import/tcgdex-pocket-sets.json`
- `docs/TCGP_CARD_COVERAGE.md`
- `docs/TCGP_CARD_DATABASE.md`
- `docs/TCGP_CARD_SOURCES.md`
- `docs/TCGP_IMPLEMENTATION_REPORT_v06933.md`
- `docs/superpowers/plans/2026-10-27-tcgp-complete-cards.md`
- `generated/tcgp-card-coverage.json`
- `package-lock.json`
- `package.json`
- `scripts/build-tcgp-catalogue.cjs`
- `scripts/import-tcgp-sources.py`
- `scripts/lib/tcgp-normalize.cjs`
- `scripts/lib/tcgp-validate.cjs`
- `scripts/package-tcgp-cards-patch.py`
- `scripts/run-tests.cjs`
- `scripts/tcgp-card-qa.cjs`
- `scripts/verify-tcgp-catalogue.cjs`
- `tests/v06920-tcgp-battle-data.test.cjs`
- `tests/v06933-release.test.cjs`
- `tests/v06933-tcgp-card-execution.test.cjs`
- `tests/v06933-tcgp-catalogue.test.cjs`
- `tests/v06933-tcgp-effects.test.cjs`
- `tests/v06933-tcgp-integration-browser.test.cjs`
- `tests/v06933-tcgp-integration.test.cjs`
- `tests/v06933-tcgp-normalizer.test.cjs`
- `tests/v06933-tcgp-progress.test.cjs`
- `tests/v06933-tcgp-validation.test.cjs`

The automatic ZIP manifest lists exact paths, file bytes and SHA-256 values, independently compares the patch with the supplied source archive, and excludes unchanged files, `.git`, dependencies, caches, build output and the signer. No files are intentionally deleted; no deletion list is required. The final ZIP is reapplied to a fresh baseline and checked separately before delivery.

## Termux handoff

Download `LuckyDex_patch_v0.69.33.zip` to `/sdcard/Download/`. These commands operate on the actual unpacked `source/`; they use no rsync and do not recreate that directory. The version guard prevents applying this patch after main has moved beyond its expected base. The diff check recognizes the supplied Windows CRLF endings while retaining other whitespace checks.

```sh
sh <<'LUCKYDEX_UPDATE'
set -eu
cd ~/lucky-dex
git fetch origin
git pull --rebase origin main
grep -q "versionName '0.69.32'" source/app/build.gradle
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.33.zip -d source
grep "versionName" source/app/build.gradle
grep "versionCode" source/app/build.gradle
grep "__LUCKYDEX_BUILD" source/app/src/main/assets/app-v0167.js | head -n 1
git -c core.whitespace=cr-at-eol --no-pager diff --check
git status
git add -A source
git commit -m "Update LuckyDex to v0.69.33 - expand Pocket card catalogue and battle mechanics"
git push origin main
LUCKYDEX_UPDATE
```

If the version guard fails, stop and rebase the changes against that newer canonical source; do not downgrade it or bypass the guard. The commands are a user handoff only; no remote commands were run by this task.
