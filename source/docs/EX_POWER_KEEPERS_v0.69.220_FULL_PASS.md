# LuckyDex v0.69.220 — EX Power Keepers completion and final-stage audit

**Date:** 12 November 2026  
**Install base:** LuckyDex **v0.69.219_STAGE3** source. Patch ZIP paths are **relative to `~/lucky-dex/source/`**.  
**Format:** Classic TCG with LuckyDex's separate ordered Basic Energy supply, physical 30-card draw deck, discard-energy ledger, normal hand/deck rules and existing 8-card hand limit.

## Catalogue and battle coverage

**108/108 numbered EX Power Keepers prints battle-enabled** (previously 84/108). Includes six collectible Basic Energy artworks which remain excluded from physical deck construction, per the existing Classic Energy-zone rules. All 24 formerly gated card records now have explicit attack/Power/Fossil implementations. There are no remaining EX16 `PARTIAL` records in `tcg-classic-power-keepers.js`.

### Completed 24-card batch

| Number | Card | Battle implementation and focus |
|---|---|---|
| 3 | Armaldo | Rock Blast chooses/discards up to five Fighting Energy units with a separately chosen 20-damage target per Energy; Mach Claw ignores Resistance |
| 5 | Blaziken | Firestarter uses **discarded** Fire Energy and a chosen Bench recipient; Fire Stream discards Fire and damages opposing Bench |
| 7 | Cradily | Hand-evolution trigger searches up to three real Pokémon cards; Poison Ring applies Poison and next-turn retreat lock |
| 8 | Delcatty | Energy Draw discards a selected hand Energy and chooses up to three draws; Max Energy Source calculated from attached Energy |
| 9 | Gardevoir | Psy Shadow attaches Psychic to a chosen Pokémon and gives two damage counters; Energy Burst checks both Actives' Energy |
| 10 | Kabutops | Primal Stare blocks opponent's active evolution from hand; Luring Antenna offers a Bench switch before the 20-damage hit |
| 13 | Slaking | Lazy suppresses opponent's Poké-Powers while Slaking is Active; Critical Move requires a Basic Energy discard and imposes next-turn attack lock |
| 15 | Lanturn | Energy Grounding chooses Basic Energy from an ally knocked out **by opponent attack**, before discard; optional Lightning Strike has 50/90 alternatives |
| 16 | Magneton | Magnetic Field pays a hand discard and selects up to two eligible discarded Basic Energy; Magnetic Force counts own attached Energy |
| 22 | Sableye | Synergy guards from Pokémon-ex under Phoebe's Stadium; Down Draw takes bottom two physical draw-deck cards; Feint Attack selects its target and ignores defensive effects |
| 45 | Beldum | Magnetic Lines coin flip plus chosen basic Energy and recipient on the opposing Bench |
| 56 | Omanyte | Influence searches physical deck and benches up to two eligible named Pokémon, treating them as Basic |
| 84 | Claw Fossil | Playable Colorless Bench Fossil, no retreat/status, optional discard, no Prize on KO, Jagged Stone attack response |
| 86 | Root Fossil | Playable Colorless Bench Fossil, no retreat/status, optional discard, between-turn heal, no Prize on KO |
| 92 | Absol ex | On-Bench Cursed Eyes moves three counters between chosen opposing Pokémon; Psychic Pulse targets already-damaged Bench |
| 93 | Claydol ex | Type Shift to Fighting; Psychic Boom Energy scaling; Shadow Crush optional Psychic cost and selected opposing Energy discard |
| 94 | Flygon ex | Psychic Protector chooses 0–4 **actual hand cards**, discards them and reduces incoming attack damage by 10 each; Slashing Strike tails lock |
| 95 | Metagross ex | Magnetic Redraw shuffles both hands into decks and draws four; Scanblast damages same-name opposing Bench Pokémon |
| 97 | Shiftry ex | Skill Hack reveals an eligible opponent-hand Pokémon and chooses a copied attack (without its Energy cost); Dirge damages same-name Bench |
| 98 | Skarmory ex | Metal Gravity once-per-turn retreat reaction; Whirlwind switch; Razor Wing |
| 99 | Walrein ex | Hand-evolution Chilling Breath Trainer lock on opponent's next turn; Wreck adds 20 and discards Stadium |
| 100 | Flareon ★ | Hand-to-Bench Crimson Ray burns both Actives subject to status immunity; Flamethrower discards Fire |
| 101 | Jolteon ★ | Hand-to-Bench Yellow Ray gives each Active one damage counter; Agility coin guard |
| 102 | Vaporeon ★ | Hand-to-Bench Blue Ray clears conditions and heals each Active, respecting heal blocks; Whirlpool selects opposing Energy on heads |

Shared engine: abilities are dispatched through existing opponent/owner turn and Bench/evolution/KO events, not UI-only labels. The two new Fossils are explicitly **not** knockouts for Prize or KO counters. Effects with choices use `effectChoice` so Test Lab and CPU receive real legal options. Protected Bench damage respects preventive effects; match-up and damage-reduction logic are preserved as applicable.

## Automated verification

- `node --test tests/v072*.test.cjs` — **344/344 passed, zero failed**.
- Added `tests/v07220-ex16-completion.test.cjs` — 35 focused integration checks: 108-card coverage/registry validation, printed-damage numbers, Energy discard/search to correct zones, attack and Power choices, hand-evolution and Bench triggers, Fossil no-Prize KO, Flying shield, Stall/status, and all nine CPU-generated single-set 30-card decks.
- Updated two historical staged-rollout expectations whose `PARTIAL` checks became obsolete after completion: v07217 slice and v07219 stage 3. Older combat tests retain their actual assertions.
- **Not performed:** Android APK compilation, actual touchscreen interactions, long-duration CPU matches, exhaustive hand/energy/coin combinations per attack or manual QA against every printed-card image. Node tests support a **source-level completion**, not certification of every edge case.

## Existing known caveat and limitations

- **Altaria Surprise (EX16 #2):** currently chooses a reproducible random facedown opponent hand card, rather than displaying selectable indistinguishable facedown positions. This pre-dates v220 and remains an explicitly documented choice-UI refinement.
- Classic's fresh Basic Energy source is **LuckyDex's approved Energy Zone adaptation**; it is not a physical 60-card sanctioned TCG deck. Abilities like Psy Shadow can use a genuinely permitted fresh Psychic supply only within this adaptation. Discard-recovery Powers cannot mint fresh Energy from that zone.
- Source `versionCode` updated to **7200**, `versionName`/HTML/JS displays to **0.69.220**. Saves, app ID, signing config, external artwork and Pocket format are unchanged.

## Suggested device testing

1. **Armaldo** Rock Blast: select two different opposing Pokémon on consecutive Energy discards; verify no ordinary Active damage and correct damage counters.
2. **Flygon ex**: choose two real cards in your hand against a 60-damage attack, confirm 40 damage lands and both chosen cards are discarded; also test zero-card choice.
3. **Claw/Root Fossils**: play, evolve, discard manually and knock out, checking Prize count and between-turn healing.
4. **Lanturn**: KO allied Active while Lanturn is on Bench, then select discarded Basic Energy rather than receiving fresh supply.
5. **Shiftry ex / Walrein ex / Eeveelution ★**: verify hand reveal, Trainer lock and on-Bench triggers; confirm CPU can resolve these without stalled choices.
6. **Autobuilder**: build one Power Keepers-only deck per archetype and verify complete evolution lines, legal Energy plans, useful support/Tool/Stage 2-ex partners, and no off-type attackers.

## Termux install and push

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.220_EX_POWER_KEEPERS_COMPLETE.zip -d source
git add source
git commit -m "LuckyDex v0.69.220 complete EX Power Keepers"
git push origin main
```
