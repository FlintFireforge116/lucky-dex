# LuckyDex v0.69.358 — XY Roaring Skies Stage 6 (verified interactions)

## Baseline and coverage

GitHub Actions #646 completed successfully for v0.69.357 Stage 5. This ZIP builds on that source, retains the official pinned 112-print Roaring Skies catalogue (Git blob `5eab0c0148a5cb52dd7005628aa61c793ec0d930`) and enables **10 additional original/alternate prints**: #14, #23, #29, #48, #52, #53, #63, #80, and Wally #94/#107 (**10 prints total**).

### Card-by-card

- **Fletchinder #14 — Peck Off** removes every attached Pokémon Tool on the defending Active *before* damage calculation. A pre-damage effect tag avoids the old error where Hard Charm or other Tool protection reduced the hit before being removed.
- **Zapdos #23 — Raging Thunder** deals 120 damage to the defending Active, then precisely 40 damage to a player-chosen friendly Benched Pokémon. It cannot silently damage the Active instead.
- **Xatu #29 — Future Sight** allows choosing either player's physical deck and ordering its actual top five cards individually; **Stressful Eye** reveals the opposing hand and lets the attacker select a Trainer card to discard, rather than choosing randomly or asking the wrong player.
- **Klefki #48 — Look for Keys** reveals physical draw-deck cards in order until the first Item, takes that Item, and shuffles all other revealed cards back. Without an Item it safely reshuffles the deck without manufacturing one or freezing.
- **Dragonite #52 — Wrapped in Wind** selects zero, one or two actual *Basic Energy cards in hand*; multiple colors can be attached, optional choices may be declined, and no fresh Zone Energy is generated.
- **Altaria #53 — Song of Echoes** shuffles its owner's hand into their draw deck and draws based on both players' occupied Bench slots (including Sky Field's expanded eight-slot Benches, subject to the Classic hand cap).
- **Reshiram #63 — Turboblaze** is an Active-only, once-per-turn Ability that attaches a Fire Energy *from hand* to a chosen Dragon Pokémon. It is not offered when no Fire Energy is in hand, does not use unspent Zone Energy, and signals correct hand-attachment triggers.
- **Unfezant #80 — Strong Winds** shuffles all players' attached Tool/Special Energy cards and Basic Energy cards back into their respective physical decks without relocating or discarding the Pokémon; no false Energy Zone refill.
- **Wally #94/#107** selects a real non-EX Pokémon on the board and a compatible evolution from the physical deck; this bypasses only the usual first-turn/newly-played timing restrictions, not evolution prohibitions. Both prints are playable. The autobuilder avoids Wally unless the selected 30-card deck has a compatible parent/evolution pair.

The gating system remains authoritative: any printed card still lacking an effect is **not** enabled in battle or auto-generated CPU decks. Stage 6 is not the final all-112 print audit. In particular, Banette Tool Concealment, Absol Cursed Eyes, Togekiss Serene Grace, Electrode Energy Bomb, and Wide Lens require further integration.

## Tests and build

`tests/v07358-roaring-skies-stage6.test.cjs` exercises physical draw/discard choices, turn ordering, before-damage Tool removal, dual-Bench draw, multiple hand-Energy colors, Turboblaze activation, Wally first-turn evolution/EX restrictions, and both-side attachment resets. The `auditXY6Stage6ForApk` Gradle task runs after all five older XY6 stages and pinned catalogue generation and is tied to the APK prebuild.

Prior to bundling the patch, the Roaring Skies Stages 1–6 plus deck-quality suite passed 68, failed 0 and skipped 3 catalogue-dependent tests; Stage 6's expanded direct suite passed 16/16. The APK build has not yet run for v0.69.358.

## Termux installation

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.358_ROARING_SKIES_STAGE6.zip -d source
git add source
git commit -m "LuckyDex v0.69.358 Roaring Skies Stage 6 interactions"
git push origin main
```
