# EX Power Keepers — v0.69.218 stage 2 audit

**Source baseline:** Apply over v0.69.217 staged integration; retains prior v0.69.215/216 changes. This is a changed-files ZIP with paths relative to `~/lucky-dex/source/`. No APK was built or installed; no GitHub push was made.

## Coverage

- 108 numbered official English EX Power Keepers prints remain catalogued, with printed text and artwork references.
- **70 battleEnabled**: 54 Pokémon, 5 Trainers, 5 Special Energy, and 6 collectible Basic Energy prints. **38 are still explicitly PARTIAL and barred from combat/autobuilder selection.**
- Added executable and state-tested Mawile #17 (Basic Bench search and defender-selected hand discards to four), Cacturne #27 (four coin flips and Poison Power conditional on Sidney Stadium), Combusken #29 (hand-attached Fire cures status and Lunge tails = no damage), Kabuto #51 (choice-based evolution search and coin damage), Energy Removal 2 #74 (heads, correct owner targets opposing Active/Bench, then exact basic/special card), EX16 Darkness #87, Metal #88 and Multi #89 reprints (rules/quantity/bonus/defense), Cyclone #90 and Warp #91 (mandatory legal switch selection on Active attachment).
- An existing Battle Core conditional branch now recognises EX16 Energy reprints without modifying older printed Energy IDs. Updated master instructions v2.11 with the rule and correction.
- Older v217 partial tests were updated **only to remove cards whose implementations this patch promotes**, not to relax gameplay expectations. New outcome-level tests exercise exact Energy and hand/discard locations.

## Validation

- `node --test tests/v072*.test.cjs`: **290 / 290 passed**, 0 failures (selected v07200–v07218 tests, prior to packaging).
- New `tests/v07218-ex16-battle-effects.test.cjs`: **14 state-level tests** covering printed effects, actual card choices and energy calculations.
- No Android touchscreen / APK / long-match CPU behaviour tested. No published full-set-completion certification.

## Remaining work

The 38 gated cards include relevant Stadiums (including Sidney's Stadium), Fossils, complex Trainer multi-card choices and several Pokémon-ex and Pokémon ★ triggers. They must **not** be silently promoted with placeholder effects. A later pass must verify these, test their CPU selection decisions and finish a per-card printed-effect ledger. Cacturne can only exercise its power when Sidney's Stadium is placed by a supported mechanism (e.g. Test Lab); it will not spontaneously create the Stadium.

## Manual checks

1. Test Lab: put Mawile #17 Active against a hand of at least five cards; use Pull Away and verify the defender selects discards down to four before normal next-turn draw.
2. Put two different Energy cards on an opposing Pokémon; use EX16 Energy Removal 2, repeat until heads, and verify you select both which opponent Pokémon and which Energy card is removed. Attach EX16 Warp / Cyclone from hand to Active with both players having a Bench to test their distinct choosers.
3. Build a Darkness deck with Cacturne #27 and a Metal defender; compare damage with and without #87/#88 reprints. Attach Multi #89 alongside another Special Energy and verify its any-type provision changes to Colorless.

## Install and push from Termux

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.218_STAGE2.zip -d source
git add source
git commit -m "LuckyDex v0.69.218 Power Keepers effects and Energy fixes"
git push origin main
```
