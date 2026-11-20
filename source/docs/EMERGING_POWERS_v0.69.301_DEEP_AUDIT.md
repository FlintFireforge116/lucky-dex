# LuckyDex v0.69.301 — Emerging Powers deeper independent audit

**Starting point:** v0.69.300 (includes v0.69.298 Emerging Powers and v0.69.299 independent audit).  **Set:** `bw2`, 98 prints, 164 attacks, two Abilities, seven Trainers. **Scope:** print-to-executable review, cross-era Energy, physical vs tracked discard, actual Trainer play and CPU choices, deck-builder legality, hand limits and older-set regressions.

## Confirmed bugs corrected

1. **Recycle #96 — missing Basic Energy discard ledger.** Previously `bw2:recycle` searched only `discard[]`. Basic Energy discarded from attached Pokémon is instead recorded in `energyDiscard`. The optional heads outcome now offers eligible discarded Basic Energy types, creates a real BW-era Basic Energy print on top of the deck, consumes one ledger unit, and never removes fresh Energy from the ordered Energy Zone. Existing physical cards still retain their exact identity and can be selected. The player and Advanced CPU resolve both sources.
2. **Recycle self-selection while resolving.** The core implementation puts Items into `discard[]` immediately. The just-played Recycle was therefore incorrectly eligible to target itself on heads. The effect now excludes the resolving Trainer until its effect finishes. Previously discarded Recycle cards remain eligible.
3. **Elemental monkeys' conditional attached-Energy bonuses.** Simisage #2 Fire's Power, Simisear #19 Water's Power, and Simipour #23 Grass' Power did not consistently recognise earlier Rainbow-style Special Energy printed as `{Miracle:1}`. The shared BW2 energy-type check now recognises those cards and the actual effective Energy type.
4. **Mandibuzz #69 — Dark Pulse.** Bonus damage previously ignored attached Rainbow Energy from earlier eras when counting Darkness Energy across your Pokémon. It now counts cards that actually supply Darkness without counting unrelated Colorless-only cards.
5. **Great Ball #93 hand cap.** Its delayed selection unconditionally pushed a Pokémon into hand, bypassing the eight-card Classic limit. A selected card now remains in the deck if the hand has filled, and the remaining deck is shuffled as normal.

## Tests

- **10/10 new deep-audit regression tests** passed, including real Recycle Item play, physical/ledger choices, opponent-owned discard isolation, tails case, multiple recovered units with distinct UIDs, CPU continuation, Rainbow Energy across four effects, Great Ball cap and optional attack damage.
- **209/209 cross-set regression tests passed** across Undaunted, Triumphant, Call of Legends, Black & White Base and Emerging Powers, including the v0.69.300 Fisherman/discard fix. This is the explicitly selected recent-set suite, not a claim that all repository tests were run.
- **98/98 enabled**, **zero errors and zero warnings**, **342/342 synthetic smoke checks executed (zero skipped)**, **16/16 sampled CPU decks legal**.
- **37 static review flags** remain. These identify specialised implementations for future manual/on-device follow-up, not automatically failing tests. An audit green light does not establish complete combat correctness or strategic CPU quality.
- The Android APK build, GitHub Actions build and on-device interactions have **not** been verified in this environment.

## Installation over v0.69.300

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.301_BW2_DEEP_INDEPENDENT_AUDIT.zip -d source
git add source
git commit -m "LuckyDex v0.69.301 Emerging Powers deep audit fixes"
git push origin main
```

Build-time regression gates include the new `tests/v07301-emerging-powers-deep-audit.test.cjs` suite.
