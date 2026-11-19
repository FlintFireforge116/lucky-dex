# LuckyDex v0.69.300 — Classic discard recovery bugfix

## Reported issue

Skyridge Fisherman (`ecard3-125`) had no usable selections for discarded Basic Energy after it was detached from Pokémon. The generic `searchChosen` handler only looked at the physical `discard[]` pile, whereas attached Basic Energy is recorded by type in `energyDiscard`.

## Fixed effects

- Skyridge Fisherman `ecard3-125`: recover up to four matching discarded Basic Energy units.
- HeartGold & SoulSilver Fisherman `hgss1-92`: same shared handler.
- Mysterious Treasures Gabite `dp2-48`, **Gather Up**: recover up to two.
- Rising Rivals Snorlax `pl2-33`, **Pick and Collect**: recover up to four.
- Generic card searches from the discard pile also gain eligible ledger-based Basic Energy choices when their filters permit them. Pokémon- or Trainer-only searches are unaffected.

## Rule guarantees

1. A Basic Energy option consumes exactly one tracked discarded Energy unit when chosen; it does not draw from the fresh ordered Energy Zone.
2. Physical Basic Energy cards stay recoverable, with their original reference and identity preserved; Special Energy is never manufactured from the Basic Energy ledger.
3. Choices expose only eligible source cards belonging to the acting player. Choices stop on exhaustion or the eight-card Classic hand cap.
4. The CPU can resolve the new options, and the player sees meaningful per-type options rather than a blank discard list.

## Verification

- **12/12 new focused tests passed**, including actual Supporter play, live Energy discard, both Fisherman reprints, Gabite, Snorlax, mixed ledger/physical discard, hand cap, empty/other-side zones and Advanced CPU selection.
- **136/136** Skyridge, Energy routing and recent Black & White tests passed in an earlier cross-set run (before the two final added focused tests).
- **215/215** Rising Rivals–Emerging Powers cross-era tests passed in the final run, including all 12 new focused checks.
- No on-device gameplay or GitHub APK build has been verified in this workspace.

## Build and installation

`app/build.gradle` now runs `tests/v07300-classic-discard-ledger-recovery.test.cjs` together with the existing Emerging Powers tests at preBuild, preserving older gates. Install over `v0.69.299` using the usual `unzip -d source` and git commands.
