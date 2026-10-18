# LuckyDex v0.44.0 â€” verification report

16 October 2026. Delivery is a local source archive. No push, publication, merge or external repository modification was performed.

## Baseline and release identity

Sole baseline: the newly supplied `C:/Users/sjwal/Documents/GitHub/lucky-dex/lucky-dex/LuckyDex_source.zip`, v0.43.1, 37,066,153 bytes, 7,284 files. SHA-256: `3465e1716efe96188a8ba26b65f29ddbc273670c20f0667b5c9b2511cc8a55ea`. All 7,284 stock extraction files were verified against it before comparison tests. No earlier application source was used.

Final package version and Android versionName are **0.44.0**; versionCode is **4400**; application ID remains **com.example.luckydex**. Main gameplay/build/package files contain only byte-minimal version substitutions. The supplied signer is retained unchanged; no replacement was generated.

## Catalogue, progression and saves

The existing v0413 registry/core/customise remain the runtime owners. The catalogue contains **202 distinct local designs: 114 Physical TCG, 78 TCG Pocket and 10 illustrated LuckyDex originals**. The PokÃ©mon Center category's 130 products are accounted for: three playmats excluded, 14 repeated designs consolidated, and an additional face from its two-design Celestial pack. All 78 recorded Serebii gallery designs are represented. This covers the supplied references at acquisition time, rather than every sleeve ever released worldwide.

All 30 legacy IDs remain valid. Eight original sleeves receive new illustrated art; 22 weak pattern files are removed while their saved/reward IDs now represent official designs. There are 172 additional IDs. The four existing basic LuckyDex sleeves remain free. Ownership, equipment, claimed tokens, secret discoveries and unknown cosmetics fields survive migration. Invalid equipment falls back safely; locked sleeves cannot be equipped.

New official content uses 82 small thematic groups, at most five new designs per group. Adventure Passport additionally uses existing Kanto-clear evidence; the original 26 reward bindings remain. Durable evidence includes regional clears, owned species/families/types/generation completion, complete known physical/Pocket sets, saved shiny/pack counters, Arcade records and Goldenrod/Type Cup trophies. Reconciliation changes cosmetics only, remains idempotent and feeds the existing compact recognition summary. It neither claims non-sleeve achievement rewards nor reconstructs unrecorded history. Explicit zero-count entries do not prove PokÃ©mon ownership.

Customise retains Profile flow, All/Owned/Locked, previews and Equip. It adds mobile search, source and multi-valued theme filters, lazy images and a large preview dialog. Six undiscovered secrets keep `???`, concealed art/requirements and no search/filter disclosure through real names or source metadata. Consequently a fresh Pocket source filter shows 73 visible designs until its five secrets are discovered; all 78 remain registered.

Actual cinematic pack backs, unrevealed covers, recovered/static backs and outgoing/received Trade backs use the equipped artwork. A RED browser test exposed stale mounted Trade images after switching sleeves; the shared core now refreshes those wrappers. Face-up artwork is unchanged. Pack and Trade gameplay/transaction/animation source files remain byte-identical to v0.43.1.

## Offline assets and sources

All **202 images decode**, with local paths and verified dimensions, hashes and bytes. No exact encoded/decoded duplicate designs or unused sleeve image files remain. Artwork totals **8,210,062 bytes** (7.83 MiB): 3,776,110 physical, 3,262,782 Pocket, 1,171,170 original. No individual file exceeds the 250 KB guard. Official images retain aspect ratio without upscaling; originals are 400 Ã— 560 WebP. No source website, CDN or browser cache is needed at runtime.

Ten separate built-in image-generation calls produced the premium originals. Provenance, crops, source URLs and prompts are documented in `docs/COSMETICS_SOURCES_v0440.md`, `docs/PHYSICAL_SLEEVES_v0440.md`, `docs/POCKET_SLEEVES_v0440.md`, `docs/LUCKYDEX_ORIGINALS_v0440.md` and `scripts/data/sleeves-*-v0440.json`. The runtime manifest is `app/src/main/assets/cosmetics/sleeves/manifest-v0440.json`. Exact durable evidence rules are in `docs/COSMETICS_PROGRESSION_v0440.md`.

## Focused final tests

**73 checks pass, zero fail**, across these 16 programs on the final v0.44.0 identity:

```text
node --test tests/v0440-catalogue.test.cjs tests/v0440-cosmetics-progression.test.cjs tests/v0440-card-backs-browser.test.cjs tests/v0440-customise-browser.test.cjs tests/v0440-sleeves-assets.test.cjs tests/v0440-preservation.test.cjs tests/v0440-release.test.cjs tests/v0413-cosmetics-core.test.cjs tests/v0413-achievements.test.cjs tests/v0413-cosmetics-assets.test.cjs tests/v0413-customise-ui.test.cjs tests/v0413-reconciliation.test.cjs tests/v0413-card-backs.test.cjs tests/v0430-goldenrod-type-trophies.test.cjs tests/v0436-impact-trial.test.cjs tests/v0431-impact-defense-release.test.cjs
```

Coverage includes catalogue completeness/local paths, old IDs/equipment and v0.43.1-shaped real-app migration, newer-game save sentinels, fallback, grouped retroactive grants/idempotence, malformed and absent evidence, secrets, non-sleeve rewards, all filters/search, persistence, locked UI/API guards, actual pack/Trade DOM, real Trade settlement and unchanged face-up images. The offline validator has negative fixtures for corrupt hashes, remote paths, missing designs, unused files and duplicate artwork.

Behavior checks were observed RED before implementation and GREEN after fixes, including progression, catalogue/search, stale mounted Trade backs, explicit zero-count ownership and final release identity. Four historical cosmetics test programs changed only superseded content expectations; gameplay tests were not weakened. Release identity assertions were advanced to the current version without changing Impact behavior checks.

The five independent offline guard commands passed:

| Guard | Evidence |
| --- | --- |
| `python scripts/fetch_arcade_v0200_assets.py --check` | 44 scenes/sheets/crops; 2,098 sprites; 2,078 actors |
| `python scripts/verify_v0223_venues.py` | Eight local venues |
| `python scripts/verify_adventure_assets.py` | 829 images; 1,025 species; 386 back species; 37 registry objects |
| `python scripts/verify_fossil_museum_v0250_assets.py` | 42 images |
| `python scripts/verify-sleeves-v0440.py` | All 202 sleeve images; coverage, hashes, sizes and duplicates |

The normal test runner now includes the new sleeve offline guard after its existing guards. Guards were also run separately because the old fail-fast runner stops at an inherited failure.

## Phone inspection and review

Final v0.44.0 screenshots cover **360 Ã— 800, 393 Ã— 873, 412 Ã— 915 and 320 Ã— 640**. All 48 views pass no-horizontal-overflow, no-missing-visible-art, secret-privacy and page-error checks. Each size covers free, physical, Pocket, locked, hidden, originals, equipped, search and enlarged previews. All four final contact sheets were visually inspected. The equipped screenshot grants one physical sleeve only in its disposable browser fixture.

Independent read-only review compared runtime diffs against exact stock and inspected save preservation, free defaults, privacy/filter metadata, durable evidence and shared backs. It found no important correctness issues and independently passed 18 catalogue/progression tests. Its default browser environment lacked Playwright on the module path; release-owner browser runs used the configured runtime and passed.

No Android build, emulator installation or physical-device test was performed for this source-only delivery. Desktop Chrome at phone dimensions does not establish on-device WebView behavior. The user had already confirmed no device was available. No APK is claimed or delivered.

## Preservation and archive checks

Of the 7,284 original files, **7,236 remain byte-identical**, **26 have approved cosmetics/version/test/documentation changes**, and **22 obsolete pattern images are removed** without removing saved sleeve IDs. Independently, all **6,073 production files** covered by the preservation fingerprint remain byte-identical outside approved cosmetics/version surfaces. New application files are confined to the cosmetics/sleeves subtree. Goldenrod/Impact, Adventure, Arcade, native Java, achievement definitions and trading/pack gameplay are preserved.

The all-file packaging audit rejects unexpected changes/removals and enforces byte-minimal version substitutions in the main app script, package files and Android Gradle file. A historical verification JSON rewritten by an asset guard was restored to baseline bytes before packaging. Original supplied source/evidence files remain included. New full-resolution source photos/PNGs, stock/frozen copies, dependencies, caches and test-output trees are excluded. Three small acquisition records remain so offline validation/reproduction works after extraction.

ZIP CRC and every packaged file's bytes are compared with the active source. A fresh extraction is checked with the focused suite and sleeve offline audit. Detailed results are retained in companion QA evidence; final hashes live in the sibling `LuckyDex_v0.44.0_SHA256SUMS.txt` to avoid a ZIP containing its own hash.

## Historical full-suite failures â€” not a whole-project green pass

The normal fail-fast runner was attempted and stopped at `adventure-location-browser-v0402.test.cjs`: `Map appears exactly once`, actual 0. A continue-on-failure diagnostic then ran **all 452 original programs, five new feature programs and one new preservation program: 458 total; 386 pass, 72 fail**. All five new feature programs and preservation pass. No per-program 120-second cap was hit.

All **72 failures reproduce on byte-verified untouched v0.43.1**, with matching primary diagnostics. One is an environment failure (`amie-recovery`: localhost network access denied); others include historical Adventure/browser expectations, old release/preservation assertions and workflow files already absent from the supplied ZIP. Root paths and ephemeral localhost ports are normalized when comparing diagnostics. None is an unexplained new failure in this diagnostic; unrelated gameplay and assertions were retained.

The diagnostic began on feature-complete source with its original 0.43.1 identity. After 224 results, the remaining programs used a SHA-verified frozen feature snapshot: 7,392 files, manifest SHA-256 `7ae48240d68d8355d076eaa6ec6b38e9ce3f6a45225d699c0a34c9bd488fdac6`. The new 0.44.0 identity check was deliberately excluded from this pre-version diagnostic, then passed in the final focused run. Later changes are identity/documentation/packaging and regional-form theme tags, covered by final checks. This distinguishes inherited failures from release verification; it does not claim the entire historical suite passes.

All names and stock evidence references follow below. Full logs, proofs, comparison JSON, TDD logs and phone contact sheets are in `LuckyDex_QA_v0.44.0.zip`.

| Historical failing program | Matching stock diagnostic |
| --- | --- |
| `adventure-location-browser-v0402.test.cjs` | AssertionError [ERR_ASSERTION]: Map appears exactly once |
| `adventure-location-menu-v0402.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `adventure-regional-browser.test.cjs` | locator.click: Timeout 4000ms exceeded. |
| `adventure-scene-nav-browser-v0403.test.cjs` | AssertionError [ERR_ASSERTION]: New Bark Town one Map tool |
| `adventure-scene-nav-chapter-v0403.test.cjs` | AssertionError [ERR_ASSERTION]: New Bark Town one Map tool |
| `adventure-tools-browser-v040.test.cjs` | AssertionError [ERR_ASSERTION]: The input did not match the regular expression /1,240 â†’ 1,060/. Input: |
| `adventure3-preservation.test.cjs` | AssertionError [ERR_ASSERTION]: unchanged supplied v0.39.1 file: app/src/main/assets/arcade/kids-club/SOURCES.md |
| `adventure3-shared-functions.test.cjs` | AssertionError [ERR_ASSERTION]: supplied v0.39.1 shared function unchanged: pickCardForDescriptorV0343 |
| `adventure3-ux-v0401-battle.test.cjs` | AssertionError [ERR_ASSERTION]: bag drawer needs no scrolling {"scroll":287,"client":252} |
| `adventure3-ux-v0401-journey.test.cjs` | AssertionError [ERR_ASSERTION]: route offers contextual field actions |
| `adventure3-ux-v0401-release.test.cjs` | AssertionError [ERR_ASSERTION]: expected v0.40.x |
| `adventure3-ux-v0401-tools.test.cjs` | AssertionError [ERR_ASSERTION]: Mart: {"outer":0,"horizontal":0,"inner":95,"top":64,"bottom":628,"height":640} |
| `amie-recovery.test.cjs` | page.goto: net::ERR_NETWORK_ACCESS_DENIED at http://127.0.0.1:<port>/ |
| `recovery-lifecycle.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `recovery-runtime.cjs` | page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect') |
| `recovery-trade-refresh.cjs` | page.waitForFunction: Timeout 3000ms exceeded. |
| `recovery-transactions.cjs` | locator.tap: Timeout 4000ms exceeded. |
| `v022-update-compat.test.cjs` | Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\OneDrive\Current OneDrive\Documentation\ChatGPT\Cards\LuckyDex_v0.44.0\.github\workflows\build-apk.yml' |
| `v0223-berry-touch.test.cjs` | AssertionError [ERR_ASSERTION]: exit must dispose run timers and gesture listeners |
| `v0223-layout-grid.test.cjs` | AssertionError [ERR_ASSERTION]: visible/tappable [data-venue-game="thunderingDynamo"] |
| `v024-compat.test.cjs` | Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\OneDrive\Current OneDrive\Documentation\ChatGPT\Cards\LuckyDex_v0.44.0\.github\workflows\build-apk.yml' |
| `v0243-release-signing.test.cjs` | Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\OneDrive\Current OneDrive\Documentation\ChatGPT\Cards\LuckyDex_v0.44.0\.github\workflows\build-apk.yml' |
| `v0244-release-dates.test.cjs` | Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\OneDrive\Current OneDrive\Documentation\ChatGPT\Cards\LuckyDex_v0.44.0\.github\workflows\build-card-art-index.yml' |
| `v0250-fossil-browser.test.cjs` | locator.tap: Timeout 4000ms exceeded. |
| `v0250-fossil-routing-browser.test.cjs` | page.evaluate: TypeError: Cannot read properties of null (reading 'arcade') |
| `v0259-global-excavation-booster-art.test.cjs` | Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\OneDrive\Current OneDrive\Documentation\ChatGPT\Cards\LuckyDex_v0.44.0\.github\workflows\build-apk.yml' |
| `v0261-github-index-workflows.test.cjs` | Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\OneDrive\Current OneDrive\Documentation\ChatGPT\Cards\LuckyDex_v0.44.0\.github\workflows\build-card-art-index.yml' |
| `v0264-booster-art-audit-and-slim-pack.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0267-physical-card-art-recovery.test.cjs` | Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\OneDrive\Current OneDrive\Documentation\ChatGPT\Cards\LuckyDex_v0.44.0\.github\workflows\build-card-art-index.yml' |
| `v0283-unown-browser.test.cjs` | locator.tap: Timeout 4000ms exceeded. |
| `v0340-dash-previews.test.cjs` | AssertionError [ERR_ASSERTION]: normal preview is the exact playable seeded section |
| `v0340-dash-repeated-races.test.cjs` | locator.click: Timeout 4000ms exceeded. |
| `v0340-dash-viewport.test.cjs` | locator.click: Timeout 4000ms exceeded. |
| `v0340-preservation.test.cjs` | AssertionError [ERR_ASSERTION]: exact supplied v0.33.1 preservation: app/src/main/assets/god-pack-v0291.css |
| `v0343-dash-gameplay.test.cjs` | AssertionError [ERR_ASSERTION]: overtake exposes a transient position-change signal |
| `v0360-dig-browser.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0370-magikarp-browser.test.cjs` | Error: SPLASH touch target too small |
| `v0380-release.test.cjs` | AssertionError [ERR_ASSERTION]: The input did not match the regular expression /v0\.38\.[0-9]+\s+â€”\s+Rock Harden/i. Input: |
| `v0380-rock-harden-browser.test.cjs` | Error: HARDEN touch target too small |
| `v0390-arcade-records-browser.test.cjs` | Error: records hub missing games |
| `v0400-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0404-release.test.cjs` | AssertionError [ERR_ASSERTION]: release remains on the v0.40.x line |
| `v0405-release.test.cjs` | AssertionError [ERR_ASSERTION]: release remains on the v0.40.x line |
| `v0406-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0407-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0408-integration.test.cjs` | AssertionError [ERR_ASSERTION]: The input did not match the regular expression /rareOdds:\{berry:\.03,unown:\.004,tileCard:\.004,tilePack:\.004,tilePresent:\.018(?:,voltorbGift:\.02)?(?:,goldRock:\.10,fossilCard:\.15,fossilPack:\.04)?\}/. Input: |
| `v0408-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0409-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0410-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0411-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0412-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0413-release.test.cjs` | AssertionError [ERR_ASSERTION]: expected a v0.40.x release |
| `v0414-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0415-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0416-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0417-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0418-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0419-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0420-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0421-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0421-target-range-polish.test.cjs` | AssertionError [ERR_ASSERTION]: The input did not match the regular expression /ground-prop.png/. Input: |
| `v0422-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0423-release.test.cjs` | AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: |
| `v0424-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0424-target-range-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0425-goldenrod-picker-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0425-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0427-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0428-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0429-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0430-goldenrod-stat-release.test.cjs` | AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: |
| `v0430-release.test.cjs` | AssertionError [ERR_ASSERTION]: The input did not match the regular expression /versionCode\s+40(?:3\d\|[4-9]\d)/. Input: |

## Reproduction

Install development dependencies from `package-lock.json` and Python requirements from `requirements-dev.txt`. Supply a Playwright browser or set `LUCKYDEX_BROWSER` to local Chrome and preload `scripts/test-browser-runtime.cjs`. Set `NODE_PATH` only for externally bundled modules, and `LUCKYDEX_PYTHON` if Python is not on PATH. Browser fixtures route local app assets and block external requests.

Use `node scripts/run-all-tests-v0440.cjs` for a diagnostic that continues after failures; inherited failures remain expected. Use `python scripts/verify-sleeves-v0440.py` for offline art validation. Rebuild registry and provenance with `node scripts/build-sleeve-catalogue-v0440.cjs` then `node scripts/document-sleeves-v0440.cjs`. Reference refresh/download scripts require network only during development; all final app sleeve art is local.
