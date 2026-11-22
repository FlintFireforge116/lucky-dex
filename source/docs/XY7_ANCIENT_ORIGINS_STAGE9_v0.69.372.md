# LuckyDex v0.69.372 — Ancient Origins Stage 9

## Baseline and eligibility
- Incremental patch over v0.69.371 (Stage 8), whose GitHub Actions run #660 completed successfully.
- Android `versionCode 7372`, `versionName 0.69.372`; title and menu labels match.
- Three additional official prints become battle-ready: Entei #14, Ampharos-EX #27 and alternate-art Ampharos-EX #87. All unrelated unsupported prints remain gated.
- Both attacks of each newly enabled print have validated descriptors; the two Ampharos prints share identical playable effects, but remain separate collection prints.

## Printed effects and Classic hybrid adaptation

### Entei #14 — Burning Roar
Printed effect: discard the top four cards of your deck, attaching all Fire Energy found among them to your Pokémon in any chosen distribution.
- LuckyDex's 30-card draw deck does not normally hold Basic Energy. Therefore the attack **mills up to four real physical draw-deck cards** and **also samples the first four finite Basic Energy Zone units**, in place of a printed mixed deck. This is a documented hybrid-game adaptation, not a claim that eight cards would be discarded in tabletop play.
- Non-Fire Basic Energy sampled from the Zone enters the real Basic Energy discard ledger; every sampled Fire unit must be assigned to an Active or Benched friendly Pokémon. No Energy is generated out of thin air.
- If a physical Basic Energy card exists in the draw deck, it is treated as Basic Energy on mill rather than duplicated in the physical discard. Milled Trainer/Pokémon/Special Energy refs enter the physical discard pile.
- Multiple Fire units are distributed via explicit target choices, not silently placed onto the Active.
- Combat Blaze's opponent-Bench damage bonus remains supported.

### Ampharos-EX #27 / #87 — Thunder Rod
Printed effect: examine top four deck cards, attach any Lightning Energy found to Ampharos-EX, then shuffle the rest into the deck.
- Because Basic Energy lives in the ordered Zone, inspect exactly its first four genuine Basic units. Only revealed Lightning can be attached; a fifth Lightning outside that window cannot be attached.
- Each attachment is optional: the player can stop at any point. Unselected units go back into and shuffle with the Zone; the physical draw deck is unaffected.
- The CPU selects actual eligible Lightning before Done, and the cards have the `ramp` synergy role. This cannot attach Special Energy or manufacture Energy.
- Sparkling Tail retains its existing damage-rule bypass for the second attack.

## Verification
- New regression suite: `tests/v07372-ancient-origins-stage9.test.cjs`, wired into Gradle `auditXY7ForApk`. The ten new cases cover card eligibility, finite top-four Zone selection, optional stop, no-match, real mill, both discard zones, physical Basic Energy fallback and CPU choices.
- Ancient Origins Stage 1–9 selection: 89 passed, 0 failed, 2 skipped (requires GitHub-generated catalogue).
- Selected Primal Clash, Roaring Skies, Legends Awakened switching regression suites: 62 passed, 0 failed, 5 skipped.
- Focused deck-quality/Energy-synergy suites: 13 passed, 0 failed.
- No full Android build claimed locally. Run GitHub workflow after installing patch; it generates and verifies the pinned 101-print official catalogue.

## Install
```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.372_ANCIENT_ORIGINS_STAGE9.zip -d source
git add source
git commit -m "LuckyDex v0.69.372 Ancient Origins Stage 9 Energy attacks"
git push origin main
```
