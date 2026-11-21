# LuckyDex v0.69.368 — Ancient Origins Stage 6

Ancient Origins remains **partially battle-enabled**, not yet a completed or independent-audited set. This stage enables six additional verified prints and corrects the GitHub build failure caused by an obsolete Stage 1 test expectation.

## Printed cards implemented

- **Gyarados #21** — Full Retaliation counts damage counters on *currently Benched Magikarp only*. Its already-supported Thrash coin flip remains intact; θ Double still permits two Tools.
- **Malamar #46** — Entangling Control offers an explicit opposing Bench choice and Confuses the new Active *after* the switch. Trash Tentacle returns one actual card from its owner's physical discard (including correctly ledgered Classic Basic Energy), without inventing a card.
- **Porygon-Z #66** — Cyber Crush discards physical Special Energy from each opponent Pokémon (and preserves both players' Basic Energy). Slowing Beam adds exactly one Colorless to the affected defender's attack costs during the opponent's next turn and clears on leaving the Active Spot.
- **Goomy #58** — Water Down triggers only when Water Energy is attached to that exact Goomy **from hand**, offering a real Goomy from the physical draw deck if the Bench has space. Ordinary Energy Zone attachments do not trigger it.
- **Eco Arm #71** — Select and recycle up to three actual discarded Pokémon Tool cards into the physical draw deck. The Item being played and unrelated discarded Items are not selectable.
- **Energy Recycler #72** — Select and recycle up to five actually discarded Basic Energy units into the ordered Classic Energy Zone, without recovering Special Energy or creating free Energy.

## Fix to Stage 5 GitHub APK test

The v0.69.367 APK build failed in `auditXY7ForApk`, because `v07363-ancient-origins-stage1.test.cjs` still expected **M Sceptile-EX #8** to be unplayable after Stage 5 implemented Jagged Saber. This test is updated to keep only the still-incomplete Porygon-Z #67 gated. All current implementation and regression tests are wired into `auditXY7ForApk`.

## Deck-building and CPU safeguards

- Eco Arm is not automatically used without sufficient actual Pokémon Tool support in the deck.
- Energy Recycler is not generic filler in decks without attacks that discard Energy.
- The existing selectable choice system handles opposing switch targets, physical discard choices and Energy types for human and CPU sides.
- Basic Energy stays out of the compact 30-card draw deck, as required by LuckyDex's Energy Zone format.

## Testing

- New Stage 6 direct tests: **11 passed, 0 failed**.
- Prior Ancient Origins, Roaring Skies, Primal Clash and deck-quality selection before the two additional edge tests: **95 passed, 0 failed, 6 skipped** (generated-catalogue tests).
- The completed Stage 6 source still needs GitHub's full APK build / generated catalogue verification.

## Install

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.368_ANCIENT_ORIGINS_STAGE6.zip -d source
git add source
git commit -m "LuckyDex v0.69.368 Ancient Origins Stage 6 and CI fix"
git push origin main
```
