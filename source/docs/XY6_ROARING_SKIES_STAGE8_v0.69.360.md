# XY6 Roaring Skies — Stage 8 / v0.69.360

## Verified baseline
- GitHub run #648 for v0.69.359 / Stage 7 completed SUCCESS, after the v0.69.358 Wally EX fix.
- This is a follow-up source patch; its own GitHub APK build is **not verified** until pushed.

## New battle-ready cards
- **Ninjask #10 — Wing Buzz**: Activated only when Active and once each owner turn. A player selects a real hand card to discard; only after doing so does the top physical opposing draw-deck card move to the opposing discard pile. Basic Energy cards in hand go to the correct Classic Basic Energy discard ledger. The CPU does not offer/use Wing Buzz with an empty hand or opposing deck and prefers to discard a less crucial card.
- **Togekiss #46 — Serene Grace**: A from-hand evolution trigger, never a generic summon trigger. The Classic format places Basic Energy in a separate physical Energy Zone instead of the 30-card Pokémon/Trainer draw deck. On opting in, the player sees the top eight *actual shuffled Energy Zone units*, chooses any number of those units, and selects a receiving Pokémon separately for each attachment. Choosing Done (or exhausting the eight) returns and shuffles the unselected units into that Zone; the implementation consumes each selected unit exactly once, keeps existing current turn Energy intact, and does not count it as a normal hand attachment. The optional effect is suppressed with its Pokémon Ability.

## Safety and remaining work
- **Banette #31 Tool Concealment remains gated**. Older Tool effects appear in continuous HP/retreat/damage calculations, triggered events, old Poké-Power grants, and KO processing. Suppression must not strip physical Tool cards or suppress Garbotoxin's requirement merely that a Pokémon HAS a Tool. Disabling only the obvious Tool callbacks would make a misleading partially playable card. Keep it excluded until the full older-Tool compatibility pass.
- Cards with other unimplemented Roaring Skies effects remain gated, and the independent 112-print audit is still due.

## Tests & CI
- Seven direct tests: verified generated print metadata, decline, two target attachments with physical Zone conservation, empty Zone, Wing Buzz hand selection/one-card opponent milling, inactive/invalid-use gating, and CPU use of Serene Grace.
- Stage 8 tests chain after generated Stage 7 in Gradle `preBuild` and Merge Assets.
- Regession suite and syntax checks should be run before publishing ZIP; skips mean tests requiring catalogue assets generated in GitHub.

## Termux installation
```
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.360_ROARING_SKIES_STAGE8.zip -d source
git add source
git commit -m "LuckyDex v0.69.360 Roaring Skies Stage 8 Energy and Wing Buzz"
git push origin main
```
