# LuckyDex v0.53.1 Test Report

## Scope

v0.53.1 is a bounded Pikachu's Beach DX clarity and gameplay-polish release based on v0.53.0.

### User-visible changes

- Retires the separate Classic/Yellow Beach mode from the playable Summer Beach House UI. Legacy Classic save data remains migration-compatible and previously reserved rewards remain retry-safe.
- Uses one context-sensitive **ATTACK** control: Thunderbolt while surfing, Iron Tail while airborne. The dedicated Tail/Tilt button and Tilt input are removed.
- Left/right steering now performs airborne spins automatically.
- Replaces the tall repeated wave-strip presentation with the compact recovered `s_wave1` animation. Waves vary vertically, require horizontal and vertical alignment to boost a jump, and Pikachu lands back on the lane from which he jumped.
- Explains companion effects in the game UI. Seaking grants five rings, Lapras restores 20 HP plus a five-second shield, and Natu actively auto-fires at nearby enemies/bosses.
- Boss attacks are visible recovered attack entities with collision checks rather than invisible/random lane damage.
- Cycles recovered animation frames for major player, wave, ally, enemy, boss, projectile and boss-attack sprites.
- Fixes result achievement description contrast.
- Fixes Lucky Wave banking so the player must actually catch the rare wave and then land it safely; merely letting it pass no longer awards the prize.
- Fixes a missing boss-introduction sound reference by using bundled recovered boss/bird sounds only.
- Keeps Lucky Wave Settings controls: Off / Vanilla 2% / Test 25% / Always 100%, and the reserved-safe five-way prize pool: Lucky Coins / Card Dust / Pack Voucher / card / sealed booster.

## Focused verification

The complete Pikachu's Beach test set is run with:

```bash
node --test tests/*pikachu-beach*.test.cjs
```

Result on the release source tree: **78/78 passed**. The suite covers the legacy save/migration contract, DX content manifest, gameplay core, controls, waves, companions, all five bosses, boss-attack collisions, animation, records, achievements, Lucky Wave settings/reward delivery, card/booster save-switch safety, and v0.53.1 metadata.

Cross-cutting Arcade checks for achievements, result achievement review, permanent records, rare rewards, rare odds/settings and rare visual presentation: **30/30 passed**.

Static release checks include:

- `git diff --check`
- `node --check` on the active Pikachu's Beach DX controller/core/content/launcher scripts
- DX sprite-frame manifest versus bundled PNG families
- every audio token referenced by the DX controller versus bundled WAV files
- active-runtime scan for removed Classic picker/Tilt/Thundershock presentation

## Wider suite

`npm test` is attempted. In this environment the active runner reaches the browser-backed Adventure test and stops because the `playwright` module is not installed (`MODULE_NOT_FOUND` from `scripts/recovery-browser.cjs`). This is an environment/dependency stop, not a claim that the entire project suite passed.

## Build / visual limitations

- There is no Gradle wrapper in this supplied source tree, so no APK was built in this environment.
- Playwright is not installed, so no fresh browser/device screenshot pass is claimed for v0.53.1.
- The supplied user screenshots were used to identify the v0.53.0 presentation problems, but are not represented as v0.53.1 visual verification.

## Package verification

The release ZIP is extracted into a clean directory and the full Pikachu's Beach test set is rerun against that extracted copy. ZIP integrity is checked separately. The final SHA-256 is reported with the delivered artifact.
