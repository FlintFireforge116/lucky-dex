# EX Power Keepers — v0.69.219 stage 3 audit

**Base:** Install over v0.69.218_STAGE2. Source-only, changed-files ZIP with paths relative to `~/lucky-dex/source/`; no APK, no GitHub push and no Android handset testing.

## Coverage and scope

- **108** numbered English EX Power Keepers cards registered, **84 battle-enabled**, **24 still gated** (70 enabled before this pass; +14 in stage 3).
- Enabled components by canonical kind: pokemon: 59, trainer: 14, energy: 11. The six collectible Basic Energy artworks remain outside normal 30-card-deck Energy construction.
- Newly enabled numbered cards: **#2 Altaria, #4 Banette, #18 Mightyena, #21 Pichu, #70 Wynaut**, the **five Stadiums #71 Battle Frontier, #72 Drake's Stadium, #76 Glacia's Stadium, #79 Phoebe's Stadium, #82 Sidney's Stadium**, and the choice-driven **Trainer cards #73 Energy Recycle System, #75 Energy Switch, #81 Scott, #83 Steven’s Advice**.

## State-tested implementation

1. **All five Stadiums:** Battle Frontier evolves-only Colorless/Darkness/Metal ability suppression; Drake's active Colorless damage prevention after matchup; Glacia non-ex Water Weakness cancellation; Phoebe Psychic retreat reduction; Sidney Dark status removal/prevention. Altaria Synergy heals 10 damage at between-turn checkup when Drake's is in play, respecting ability suppression and heal blocking.
2. **Physical zones and choices:** Energy Recycle System now offers **one selected Basic Energy to hand**, or **three chosen Basic Energy into the physical draw deck**, handling both detached Basic-Energy ledger and physical discarded Basic cards; Energy Switch chooses source Basic Energy type and a different Pokémon target, without moving Special Energy.
3. **Trainers and evolution:** Scott searches up to 3 authentic Supporter/Stadium cards with optional early stop; Steven's Advice offers an exact draw count and rejects a seven-card hand. Pichu Cry for Help filters Lightning non-ex Pokémon. Pichu and Wynaut Baby Evolution select eligible hand evolution and remove damage counters.
4. **Attacks:** Banette Grudge uses opponent's taken Prizes and Bench Manipulation flips one coin per defending Bench Pokémon, bypassing Weakness/Resistance; Mightyena Plunder removes attached Trainers before damage and Dark Burst respects Sidney; Wynaut Flail scales with 10-HP damage counters. Altaria Surprise returns one blindly selected opponent hand card to shuffled deck.
5. **Regressions and legacy safety:** Updated an obsolete stage-one test assertion only for newly enabled cards; tested set metadata and selected legal attack/deck builds. v0.69.216 Lightning/Fighting and Xatu synergy rules retained.

## Explicit remaining gate: 24 cards

| Card | Pokémon / Trainer | Status |
|---|---|---|
| ex16-3 | Armaldo | Gated — printed effect needs implementation/battle verification |
| ex16-5 | Blaziken | Gated — printed effect needs implementation/battle verification |
| ex16-7 | Cradily | Gated — printed effect needs implementation/battle verification |
| ex16-8 | Delcatty | Gated — printed effect needs implementation/battle verification |
| ex16-9 | Gardevoir | Gated — printed effect needs implementation/battle verification |
| ex16-10 | Kabutops | Gated — printed effect needs implementation/battle verification |
| ex16-13 | Slaking | Gated — printed effect needs implementation/battle verification |
| ex16-15 | Lanturn | Gated — printed effect needs implementation/battle verification |
| ex16-16 | Magneton | Gated — printed effect needs implementation/battle verification |
| ex16-22 | Sableye | Gated — printed effect needs implementation/battle verification |
| ex16-45 | Beldum | Gated — printed effect needs implementation/battle verification |
| ex16-56 | Omanyte | Gated — printed effect needs implementation/battle verification |
| ex16-84 | Claw Fossil | Gated — printed effect needs implementation/battle verification |
| ex16-86 | Root Fossil | Gated — printed effect needs implementation/battle verification |
| ex16-92 | Absol ex | Gated — printed effect needs implementation/battle verification |
| ex16-93 | Claydol ex | Gated — printed effect needs implementation/battle verification |
| ex16-94 | Flygon ex | Gated — printed effect needs implementation/battle verification |
| ex16-95 | Metagross ex | Gated — printed effect needs implementation/battle verification |
| ex16-97 | Shiftry ex | Gated — printed effect needs implementation/battle verification |
| ex16-98 | Skarmory ex | Gated — printed effect needs implementation/battle verification |
| ex16-99 | Walrein ex | Gated — printed effect needs implementation/battle verification |
| ex16-100 | Flareon ★ | Gated — printed effect needs implementation/battle verification |
| ex16-101 | Jolteon ★ | Gated — printed effect needs implementation/battle verification |
| ex16-102 | Vaporeon ★ | Gated — printed effect needs implementation/battle verification |

## Verification

- `node --test tests/v072*.test.cjs` runs all selected v07200–v07219 EX-era suites. **309/309 passed, 0 failures** on the final source before packaging. These are Node unit/integration checks and **not** Android UI certification.
- `tests/v07219-ex16-stadium-trainers.test.cjs` covers enabled/gated counts, five Stadiums, Energy Recycle System hand/deck modes, Energy Switch, Scott, Steven, Banette, Mightyena, Baby Evolution, Pichu and Altaria.
- No full CPU strategy review for all remaining cards, no long running device matches or APK compilation performed.

## Known limitations / follow-up

- **Altaria Surprise** correctly keeps the opponent’s hand hidden and selects a seeded random facedown card; the printed effect calls for a blind *player choice*. A future revision should offer the player indistinguishable facedown cards/positions without exposing identities.
- Still-gated Pokémon-ex, Pokémon ★, Fossils and the more complex evolved Powers remain deliberately unavailable to auto decks and Test Lab battle entry. In particular, additional printed energy/burn/other effects are not silently promoted to no-ops.
- When recovering a Basic Energy from the dedicated Energy discard, the engine materialises an existing legal Basic Energy ID (commonly a Neo print) for the requested type; this is a real hand/deck card, not an Energy Zone refill. Visual presentation can be standardised to Power Keepers artwork in a future cosmetics pass without changing routing rules.

## Phone validation priorities

1. Place **Sidney's Stadium**, use Cacturne Poison Structure and Mightyena Dark Burst; confirm that the status immunity applies to BOTH Darkness sides.
2. Use **Energy Recycle System** with several different Basic Energy types in Energy Discard; first return one to hand, then choose and shuffle three into the real draw deck; check which art appears.
3. Test **Scott** selecting up to three Trainer cards (including early stop), Steven’s Advice drawing a selected quantity, and **Energy Switch** moving a chosen Basic Energy between Active/Bench without touching Special Energy.
4. Compare incoming damage before/after Drake’s Stadium, and test Altaria healing at between-turn boundary; compare Glacia Water Weakness and Phoebe Psychic retreat cost.

## One-block Termux install and push

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.219_STAGE3.zip -d source
git add source
git commit -m "LuckyDex v0.69.219 Power Keepers Stadiums and Trainer choices"
git push origin main
```
