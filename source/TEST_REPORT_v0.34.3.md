# LuckyDex v0.34.3 verification report

## Scope

v0.34.3 is built from the verified v0.34.2 source baseline and combines four approved changes:

1. data-driven physical/Pocket booster structure, price and rarity policy;
2. rarity-specific card reveal presentation, including a dedicated LEGEND treatment and Illustration Rare above Ultra/Double Rare;
3. one-hour Global Link Trade market refreshes;
4. the Pokémon Dash gameplay/course-identity pass on top of the v0.34.0 Gen III asset renderer.

The v0.34.2 Collection set picker and earlier stability/save work are retained.

## Version / identity

- Version name: `0.34.3`
- Android versionCode: `343`
- Application ID: `com.example.luckydex` (unchanged)
- Package/runtime/visible build markers are aligned to `0.34.3`.
- Existing save keys and ownership schemas are unchanged. Trade market cache versioning is deliberately invalidated to move old four-hour boards to the hourly schedule without deleting trade history or ownership.

## Booster product policy

`app/src/main/assets/pack-policy-v0343.js` is now the canonical pack-product policy and is loaded after canonical rarity classification but before pack consumers.

Physical profile/card-count/Lucky Coin baselines:

| Profile | Cards | Price |
| --- | ---: | ---: |
| Base Set–Neo Destiny (`wotc_11`) | 11 | 650 |
| e-Card / EX (`ecard_ex_9`) | 9 | 550 |
| DP/BW/XY standard | 10 | 600 |
| SM/SWSH standard | 10 | 600 |
| Scarlet & Violet standard | 10 | 600 |
| Dragon Vault | 5 | 400 |
| Double Crisis | 7 | 450 |
| Detective Pikachu | 4 | 325 |
| Generations + Radiant Collection | 10 | 650 |
| Celebrations | 4 | 375 |
| 30th Celebration | 6 | 500 |

The physical builder no longer derives booster size from total set size and no longer uses one global 600-coin physical price.

### Collation

- WotC, e-Card/EX, DP/BW/XY, SM/SWSH and S&V have separate slot plans.
- S&V standard uses 4 Common + 3 Uncommon + 3 foil/replacement positions.
- Generations uses 8 core positions + 2 Radiant Collection positions.
- Dragon Vault, Double Crisis, Detective Pikachu, Celebrations and 30th Celebration have explicit special-product plans.
- Trainer Gallery, Galarian Gallery, Shiny Vault, Radiant Collection and Classic Collection subset rows are non-purchasable where they belong to a parent product; cards remain collectible under their catalogue identity and enter via parent-pack replacement/subset positions.
- Normal duplicate printings are avoided where alternatives exist; descriptor-approved parallel/finish repeats remain possible.
- Online and offline physical openings consume the same slot policy.

### Pocket separation

TCG Pocket remains a separate policy branch rather than inheriting physical-TCG rules:

- normal Pocket products use five positional descriptors;
- known Deluxe products use four positional descriptors;
- early positions stay low-rarity oriented while later positions use richer offering tables;
- the existing all-hit Lucky Pack behavior is preserved through a dedicated Pocket Lucky profile;
- online and offline Pocket builders now consume the same Pocket policy descriptors instead of the old numeric tier-plan shortcut;
- the existing God Pack path remains a separate pack-level event at `1 / 1000`.

No six-card Pocket product is currently exposed by the bundled Pocket catalogue metadata, so no invented bonus-card product was added.

## High-rarity simulation and rarity audit

Physical chase probabilities above guaranteed structure are LuckyDex simulation families, not claimed official Pokémon pull rates. Named families cover classic/WotC, e-Card/EX, DP/BW/XY, SM/SWSH, S&V standard/high-density, all-holo/celebration products and HGSS LEGEND-era products.

The HGSS family now assigns `historic-chase` / LEGEND a 7% rare-slot target (about one target per 14.3 eligible packs), rather than allowing LEGEND to fall through as an unknown low-tier rarity.

The catalogue audit currently resolves:

- 233 physical catalogue rows;
- 31 distinct known rarity labels;
- 13 subset-parent mappings;
- 0 unresolved audited known rarity labels/profiles.

Unknown future rarity strings are surfaced as `unknown-rarity` diagnostics rather than silently behaving as ordinary Uncommon cards.

## Reveal hierarchy

Economy/trade rarity tier remains backward-compatible, while reveal drama now has a separate `revealRank` / `revealStyle`.

Required ordering is enforced by tests:

`Double Rare < Ultra Rare < Illustration Rare < Special Illustration Rare`

Additional dedicated treatments include LEGEND (`LEGEND PULL`), Prime, LV.X, BREAK, Shining, Radiant, Amazing Rare, ACE SPEC, Shiny, prismatic/rainbow, immersive/3★, Secret, Gold/Hyper and Crown-style jackpot cards. Reverse/Holo finish adds presentation without rewriting the printed rarity class.

God Pack retains its pack-level spectacle and each contained card still receives its own rarity-specific reveal.

## Global Link Trade

- `REFRESH_HOURS = 1`.
- Market slot rolls to the next local clock-hour boundary.
- Market version is `v0343-hourly-market`, so a saved four-hour board rebuilds on entry.
- Existing board/opened-set/history/total-trade state outside the stale market snapshot is preserved.
- Failed-refresh retry throttling remains `15000 ms`.

## Pokémon Dash gameplay / course pass

The v0.34.0 authentic Gen III visual foundation is retained. v0.34.3 changes race feel and authored mechanics:

- steering response increased (`PLAYER_STEER_SPEED = 7.2`) while remaining continuous;
- sprint drain/regen/recovery rebalanced and a 24-point re-arm threshold prevents empty/refill flicker abuse;
- racer contact adds a small bounded lateral separation without hidden base-speed bonuses;
- existing per-object hit tracking continues to prevent repeated snag/penalty loops on one obstacle;
- stamina berries/pickups are shared one-shot objects, despawn immediately when collected and trigger pickup feedback;
- position-change and final-stretch feedback are explicit race states;
- all 18 Type League courses now have distinct mechanic signatures and authored feature-section grammars (boost chains, recovery lines, squeezes, risk lines, slaloms, rough lines, zigzags and balanced variants);
- course sections can vary steering factor / safe-lane width while deterministic safe-path tests preserve fairness;
- strict speed-band eligibility is preserved.

## Automated verification

### Standard runner

Command attempted:

```bash
npm test
```

The repository's standard runner stops at the first browser-integrated program when `playwright` cannot be required in this execution environment (`adventure-core.test.cjs`). It therefore cannot itself reach the asset-validator stage here.

### Complete Node inventory classification

Every `tests/*.cjs` program was then executed individually so environment-only browser failures could be separated from real regressions.

- Active Node test programs: **206**
- Passed: **185**
- Browser-integrated programs unavailable because the `playwright` module is not installed: **21**
- Other failures: **0**

Unavailable browser programs:

- `adventure-core.test.cjs`
- `adventure-file-origin.test.cjs`
- `adventure-lifecycle.test.cjs`
- `adventure-persistence.test.cjs`
- `adventure-regional-browser.test.cjs`
- `adventure-runtime.test.cjs`
- `amie-recovery.test.cjs`
- `arcade-dash-browser.test.cjs`
- `recovery-layout.cjs`
- `recovery-lifecycle.cjs`
- `recovery-navigation.cjs`
- `recovery-runtime.cjs`
- `recovery-trade-refresh.cjs`
- `recovery-transactions.cjs`
- `v0223-ball-stalls.test.cjs`
- `v0223-berry-touch.test.cjs`
- `v0223-layout-grid.test.cjs`
- `v0320-ball-drop-render.test.cjs`
- `v0340-dash-previews.test.cjs`
- `v0340-dash-repeated-races.test.cjs`
- `v0340-dash-viewport.test.cjs`

### New v0.34.3 focused regressions

All pass:

- `v0343-pack-policy.test.cjs`
- `v0343-pack-collation.test.cjs`
- `v0343-pack-builder.test.cjs`
- `v0343-pack-entitlement.test.cjs`
- `v0343-rarity-audit.test.cjs`
- `v0343-rarity-reveal.test.cjs`
- `v0343-pack-diagnostics.test.cjs`
- `v0343-trade-hourly.test.cjs`
- `v0343-dash-gameplay.test.cjs`
- `v0343-dash-course-identity.test.cjs`
- `v0343-release.test.cjs`

`v0291-god-pack.test.cjs` also passes with production denominator fixed at `1000`.

### JavaScript syntax

`node --check` passes for all production JavaScript files modified in the v0.34.3 implementation.

## Asset verification

The existing release validators were run separately because `npm test` cannot pass the missing-Playwright boundary in this environment.

Passed:

- 44 authentic Arcade scenes/sheets/crops checksum and encoding validation;
- 2,098 offline Arcade sprites PNG/checksum validation;
- 2,078 unretouched Arcade actor source/output validation;
- 8 local Arcade venue assets;
- Adventure assets: 829 images, 1,025 species, 386 back sprites, 37 registry objects, 0 errors;
- Fossil Museum: 42 images.

The v0.34.3 pack-policy audit also passes: `233 physical catalogue rows · 31 rarity labels · 13 subset mappings`.

## Android build limitation

Build preflight found Java 21, but this environment has:

- no `gradle` executable;
- no Gradle wrapper in the source archive;
- no `ANDROID_HOME`;
- no `ANDROID_SDK_ROOT`;
- no `local.properties` SDK path.

Therefore `:app:assembleDebug` cannot be executed locally here and no APK is claimed from this verification environment. The existing GitHub Android workflow remains the build/signing path.

## Known verification limitation

The 21 Playwright-backed browser/WebView tests could not execute, so browser-rendered visual confirmation (including Dash preview/viewport/repeated-race checks) remains unavailable in this environment. Their non-browser logic/data regressions and all asset integrity checks pass, but this report does not represent those browser tests as passed.
