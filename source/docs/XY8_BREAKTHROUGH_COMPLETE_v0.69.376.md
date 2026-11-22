# BREAKthrough v0.69.376 — 165/165 print completion

## Scope

Builds on the committed but GitHub-failed v0.69.375 patch. Fixes its Xerneas
#107 Power Creation missing mapping and completes the remaining 28 printed
variations (some alternate art prints share the same physical effects).
Full official `xy8` (Git blob `951db4c259e70ca2fbd4daa2705e797af19fa25c`):
165 print IDs, 220 attacks, 19 Abilities, six BREAK evolutions.

## New mechanics implemented or reused

- Parasect Colorful Spores: three different Basic Energy types to three
  different selected Pokémon, from the deck/Classic Energy Zone.
- Pinsir Overhead Throw: actual selectable own Benched Pokémon damage.
- Houndoom-EX Inferno Fang: choose 80 normal or 160 and discard all Fire.
- Seaking Soaking Horn / Xerneas Power Creation: real healed-this-turn flags.
- Raichu Thunderclap Shot: 50 damage to *each* opposing Pokémon-EX.
- Mewtwo-EX Damage Change: simultaneous damage-counter exchange.
- Cacturne Derail: selected physical opposing Special Energy discard.
- Aromatisse Heavy Perfume: six-counter Confusion, not default three.
- Haxorus Dragon Dance: persistent +100 active-only attack damage, not stacking.
- Vivillon, Magnezone, Haunter, Mismagius, Zoroark and Smeargle Abilities:
  precise coin, Energy source, evolution trigger, swapping and Bench mechanics.
- Brigette, Buddy-Buddy Rescue, Heavy Boots, Parallel City, Reserved Ticket,
  Super Rod and Town Map: actual side-specific choices, statuses, recovery,
  placement and Prize visibility.
- Burning Energy reattaches its original physical UID after its own Pokémon's
  attack discards it. Rainbow Energy supplies exactly one flexible unit and
  puts one damage counter on attachment from hand.

## Release checks

- `scripts/build-xy8.py` errors if ANY print remains gated.
- `tests/v07374-breakthrough-mechanic-first.test.cjs` requires exactly 165
  enabled IDs after the generated catalogue exists and never skips in GitHub.
- `tests/v07376-breakthrough-complete.test.cjs` adds 19 effect/choice/energy
  outcome and core-hook checks.
- Local focused suite: 41 passed, zero failed, one generated-source skip.
- Broader local XY-era regressions: 257 passed, zero failed, ten generated-source skips.
- Real core-application probes verified Rainbow attachment damage, Burning
  Energy return after attack, Heavy Boots HP/Confusion and both Parallel City
  orientation choices.
- CI APK build is not claimed complete until the GitHub run succeeds.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.376_BREAKTHROUGH_COMPLETE.zip -d source
git add source
git commit -m "LuckyDex v0.69.376 BREAKthrough 165-print completion"
git push origin main
```
