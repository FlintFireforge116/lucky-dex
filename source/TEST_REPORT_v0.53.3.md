# LuckyDex v0.53.3 Test Report

## Scope

v0.53.3 is a bounded polish/fix release built from the v0.53.2 source baseline.

### Pikachu's Beach / Super Surfing Pikachu DX

- Locks the Beach stage, HUD, playfield and controls to a stable full width so combat/status changes cannot resize the game surface.
- Recolours the lower DX playfield from the old purple fill to the recovered wave-blue palette while retaining the original horizon/sky bands.
- Reduces ready/live dead space and lets the active playfield consume the available vertical room.
- Adds a visible airborne Iron Tail state: Pikachu spins, a metallic melee swipe is rendered over the actual attack range, and successful hits receive stronger hit feedback.
- Existing 2x3 mobile controls, companions, bosses, records, achievements and Lucky Wave reward/settings behavior are preserved.

### Card detail artwork identity guard

- Adds an identity guard for cached card artwork so an image is not reused when it does not agree with the card's set/local identity.
- Known-provider artwork URLs (including TCGdex/Scrydex/Pokémon TCG image routes) must agree with the card identity; a stale `_artIdentityVerified` flag cannot override a visible provider-path mismatch.
- Invalid cached artwork and stale cross-catalog resolution hints are cleared and re-resolved rather than being shown beside another card's metadata.
- The card modal clears previous image/fallback state before applying the resolved artwork.
- A one-time v0.53.3 artwork migration repairs stale saved image mappings without changing collection counts or card ownership.

## Fresh source-tree verification

All commands below were run on the final v0.53.3 working tree before packaging.

- JavaScript syntax checks: PASS
  - `card-art-identity-v0533.js`
  - `arcade-pikachu-beach-dx-core.js`
  - `arcade-pikachu-beach-dx.js`
  - `app-v0167.js`
- `git diff --check`: PASS
- Pikachu's Beach + v0.53.3 card-art regression suite: **89/89 PASS**
- Cross-cutting Arcade achievements / records / rare-event checks: **30/30 PASS**
  - The Arcade Records browser QA test reports an expected skip because Playwright is unavailable in this environment.
- Related Trade / booster-reward / card-art checks: **9/9 PASS**

## Wider test runner

`npm test` was run on v0.53.3.

- `adventure-battle-v0404.test.cjs`: 5/5 PASS
- `adventure-battle-v0411.test.cjs`: 23/23 PASS
- `adventure-battle.test.cjs`: 18/18 PASS
- Total before environment stop: **46/46 PASS**
- The next suite (`adventure-core.test.cjs`) cannot start because the `playwright` module is not installed in this environment. This is an environment/dependency stop, not a v0.53.3 assertion failure.

## Known inherited test-fixture issue

`tests/v0267-physical-card-art-recovery.test.cjs` fails before assertions because it expects `.github/workflows/build-card-art-index.yml`, which is not present in this source tree.

The same test was run against an untouched extracted v0.53.2 baseline and fails identically with the same `ENOENT`, confirming this is inherited rather than introduced by v0.53.3. No workflow was invented or fabricated to mask the baseline omission.

## Visual / build limitations

- The recoloured DX background asset was inspected directly and uses the recovered wave-blue family in the lower playfield.
- No fresh browser/device screenshot run was performed in this environment because Playwright is unavailable. User-provided phone screenshots guided the layout fixes.
- No Android APK was built in this environment, so no APK-build claim is made.

## Package verification

A release-candidate ZIP was created directly from the committed tracked tree with `git archive`, integrity-checked with `unzip -t`, and extracted to a clean directory. The extracted package passed:

- JavaScript syntax checks: PASS
- Pikachu's Beach + v0.53.3 card-art regression suite: **89/89 PASS**
- Cross-cutting Arcade achievements / records / rare-event checks: **30/30 PASS**
- Related Trade / booster-reward / card-art checks: **9/9 PASS**

The final delivery archive is regenerated from the report-bearing commit and rechecked before release.
