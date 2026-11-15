# LuckyDex v0.69.251 — Legends Awakened (dp6), staged implementation

## Scope and limitations

The next Classic expansion after Majestic Dawn is **Legends Awakened (dp6)**: 146 numbered prints. It is registered in the battle catalogue, collection/owned-card projection, set selection, deck builder, CPU set filter and Android web assets. It has dedicated source-level tests. Build and source-only verification do **not** constitute an Android install or device playtest.

**Not a completed deck:** 18 prints with simple, verified attack outcomes are enabled in the bundled fallback; 128 complex or not-yet-verified prints are gated. The full 146 card identities and artwork URLs are available in the shipped catalogue, but most non-enabled entries in the bundled fallback deliberately omit unverified stats/attack text rather than invent printed outcomes. **Run `sh scripts/prepare-legends-awakened.sh` in Termux BEFORE building/uploading the APK:** this imports the archived 146-print dataset from PokemonTCG/pokemon-tcg-data and generates accurate print metadata and complete printed attack, Ability, and Trainer texts, leaving mechanics that have no tested implementation in the gated state. It is a required release preparation step, not an optional enhancement. The generated module becomes fully offline/self-contained after this one-time preparation. The source JSON is cached at `data/classic/dp6-print-source.json` so subsequent rebuilds need no network.

A dp6-only CPU deck does not yet have a complete selection of legal battle-ready Trainer and evolution lines. The CPU must fail with an explicit no-legal-deck message, not silently substitute other expansions. Mixed-set playable decks remain possible.

### Bundled 18 battle-ready collector prints

| Print | Pokémon | Printed action or interaction exercised |
|---|---|---|
| 52 | Dragonair | Wrap coin/Paralysis; Rising Lunge bonus damage |
| 55 | Gliscor | Poison Jab; Sharp Tail bonus coin damage |
| 64 | Metang | Agility protection; Metal Claw |
| 84 | Beldum | Allure draws a physical card; Tackle |
| 87 | Chinchou | Supersonic coin/Confusion; Wave Splash |
| 90 | Cubone | Bonemerang two visible coin results and variable damage |
| 91 | Dratini | Slam two visible coin results and variable damage |
| 92 | Drifloon | Mind Bend coin/Confusion; Gust |
| 95 | Gligar | Poison Sting coin/Poison; Slash |
| 104 | Ledyba | Supersonic; Double-edge actual self-damage |
| 108 | Nincada | Scratch; Big Bite retreat lock |
| 110 | Numel | Rollout; Singe coin/Burn with between-turn check |
| 111 | Oddish | Stun Spore; Blot heals one damage counter |
| 112 | Oddish | Poisonpowder; Ram |
| 115 | Poliwhirl | Light Punch; Bubblebeam coin/Paralysis |
| 116 | Poochyena | Corner retreat lock; Ambush bonus coin damage |
| 117 | Riolu | Punch; Low Kick |
| 127 | Weepinbell | Poisonpowder; Razor Leaf |

These 18 battle-enabled entries have their **actual** printed attacks, costs, base damage, HP, stage, Weakness and Resistance in the included fallback; `support.status=FULL`, `battleEnabled=true`, and `deckEligible=true`. All other collector prints have `support.status=PARTIAL`, `battleEnabled=false`, and `deckEligible=false`; they cannot appear as a fake, no-op playable attack. No fossil can appear alone in a generated deck.

## Source rules respected and pending mechanics

- The **master contract** (`docs/LUCKYDEX_MASTER_RULES.txt`) overrides assumptions about Classic Energy and the three-Bench adaptation; no source-only test claims an Android or visual victory.
- All seven LV.X prints (Azelf, Gliscor, Magnezone, Mesprit, Mewtwo, Rhyperior, Uxie) must use the existing **Active previous-level, preserve stack/attachments, inherit printed attacks** rules. They remain gated pending per-card tests, not promoted as Basic Pokémon.
- The four Deoxys Formes and Castform Formes require their actual form-switching/hand/deck zone behaviour. A power or body text is not a no-op simply because the card is catalogued.
- Claw Fossil and Root Fossil are real Pokemon-slot Trainer-Fossils only when their HP, abilities and fossil-evolution prerequisites work; they remain gated, never deckbuilder fillers.
- Buck's Training, Cynthia's Feelings, Energy Pickup, Poké Radar, Snowpoint Temple, Stark Mountain and both Technical Machines need real trainer/stadium timing, choices and printed card interactions, so they remain gated.
- Trainers and Powers must not manufacture fresh Basic Energy from the deck/discard in violation of the Classic Energy-Zone vs physical-hand vs discard rules.
- Coin results, reactive damage, special conditions and Knocks Out follow the existing animation/Prize-pick barrier; prevent a Prize choice from obscuring coin/secondary effects.
- CPU/autobuild must reject any card with an unsupported mandatory effect, obey explicit set filtering, include evolution prerequisites, and never pick a stadium/Tool with no working synergy.

## Tests and evidence

- `node --test tests/v07251-legends-awakened-stage1.test.cjs` — source-level registration, gating, combat attack damage, affected targets, visible coin event outcomes, status-check timing, draw, heal, recoil, retreat lock, printed energy-cost metadata, CPU filter.
- `node scripts/audit-classic-set.cjs --set dp6 --no-cpu --no-write` — expect a **PARTIAL** report at this stage. Do not present all printed cards as finished just to satisfy auditor metrics; it is expected to flag the gated catalogue while unverified actions remain.
- Selected previous-set regression tests must still pass after the shared registration edits. Test Android/card selector separately before reporting fully complete.

## Termux patch application (repository-root patch)

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.251_LEGENDS_AWAKENED_STAGE1.zip -d .
cd source
sh scripts/prepare-legends-awakened.sh
```

The **repo-root** extraction is important: this archive contains `source/...` AND `.github/workflows/build-apk.yml`. Do not unzip it into `source/` or those paths will be nested incorrectly. The GitHub APK workflow also invokes the prepare script before Android build so downloaded print metadata is never silently skipped in CI. The prepare script requires Termux `curl`, Python 3 and Node.js. It uses `curl` only during data preparation and does not cause app-network calls at runtime. Do not build an APK from the unprepared fallback if you expect correct printed metadata for all 146 collection cards.

**Next pass:** implement every remaining gated printed mechanic with real targets, selected physical cards, AI outcome tests and a full independent audit, then release a completed dp6. This pass is a defensively integrated foundation, **not 146/146 battle-ready**.
