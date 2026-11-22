# XY9 BREAKpoint Stage 2 — v0.69.379 (mechanic reuse)

Baseline: v0.69.378 (GitHub Actions run #45025311302 succeeded). This is a changed-files-only patch over that source.

## Verified new coverage

Projected 110 of 126 official prints implemented (up from approximately 91), contingent on the pinned GitHub generator audit. The new card states are subject to 21 simulated game-state outcome tests plus a mandatory generated-catalogue check and the existing XY9 audit.

- Palkia-EX Aqua Turbo uses a user-selected Bench target and moves up to two finite Water Energy from the Energy Zone or actual physical deck cards.
- Tympole Round counts actual Pokémon in play with Round (not cards in hand).
- Greninja Shadow Stitching suppresses opposing Abilities until the end of the next opponent turn; Moonlight Slash offers a real Water-Energy return choice for +20 damage; Greninja BREAK's Giant Water Shuriken consumes a real Water Energy from hand and lets the player target opposing Active or Bench.
- Garbodor's Tool-dependent Garbotoxin suppresses modern Abilities on both sides and exempts itself, including under Tool-effect blocking. Offensive Bomb applies both printed Special Conditions.
- Aegislash's Painful Sword doubles existing damage counters, and Megaton Slash uses the existing two-target Bench damage selector.
- Gible Never Enough lets the user discard a selected hand card before drawing two; Garchomp Turbo Assault selects both the recipient and actual discarded Energy, including Special Energy cards; Ferrothorn Spike Lash scales each target's damage with its own Retreat Cost.
- Togekiss-EX Mighty Wind moves a real hand Energy card to the selected Bench; Glameow Act Cute lets the affected player choose the hand card going to the bottom of their deck.
- Delinquent (three artwork variants) discards the existing Stadium before prompting the affected player to discard three selected cards. Fighting Fury Belt adds +40 max HP and +10 attack damage to Basic holders only.
- Max Potion chooses a damaged target, heals it, and discards all its Basic and attached Special Energy; Misty's Determination discards a selected hand card then lets the player choose from the top eight physical deck cards.
- Ho-Oh-EX Purifying Fire checks actual Basic Fire attached to the source; Special Fire-providing cards alone cannot activate it.

## Outstanding mechanic groups (still gated, not placeholder playable)

Print numbers: 6 Kricketune (Screech); 20 Slowbro (Walk-Off Homer); 21 Slowking (Royal Flash); 30 Suicune (Wind Charm); 35 Seismitoad (Siphon Off); 49 Zebstrika (Crashing Bolt/Zap Zone); 59 Meowstic (Energy Present); 67 Sudowoodo (Watch and Learn); 73 Shiftry (Roll Up); 96 All-Night Party; 97 Bursting Balloon; 102 Max Elixir; 108 Psychic's Third Eye; 109 Puzzle of Time; 110 Reverse Valley; 113 Splash Energy.

The CPU and player should share the same effect resolution but UI choice phases require further end-to-end validation on Android. Never count 126/126 until all effects and triggered hooks are implemented and audited.

## Mandatory checks

`node --test tests/v07378-breakpoint-effects.test.cjs tests/v07378-breakpoint-integration.test.cjs tests/v07379-breakpoint-continuation.test.cjs`

Gradle `auditXY9ForApk` now includes the new suite, after generated catalogue verification.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.379_BREAKPOINT_STAGE2.zip -d source
git add source
git commit -m "LuckyDex v0.69.379 BREAKpoint Stage 2 effects and audit"
git push origin main
```

## v0.69.379 CI repair: unified source contract

The previous Stage 1 build-time audit still required Greninja #40 and other
Stage 2 prints to remain gated, although Stage 2 implemented them. This caused
GitHub Actions run #45028250581 to fail after catalogue generation. The fix
centralizes all expected gated identities in scripts/xy9_release_contract.json
and makes both stage tests read it, with a new enforced pre-generator preflight.
Do not remove any printed-rule checks to make an audit pass. In later stages,
update the central contract and compare to the generated official catalogue
instead of adding independent hardcoded gated lists.
