# LuckyDex v0.69.262 — Stormfront completion / printed-effects verification

**Source:** archived Pokémon TCG Stormfront (dp7) collector catalogue, 103 numbered prints and SH1–SH3 (106 total), bundled offline in `data/classic/dp7-print-source.json`.

**Coverage:** 106/106 battle-enabled and deck-eligible; 0 gated. Version 0.69.262, Android versionCode 7250. This is source-tested implementation, *not* a guarantee that all possible match states have been phone-tested.

## Final 16 prints completed

- #7 Mismagius — Crash Chant selects/discards up to four physical Tool/TM cards, 20 per chosen card with no phantom base damage; Horror Chant keeps its printed 4+ opposing Bench requirement.
- #11 Torterra — Sunshine Song triggers on real evolution from hand and selects Grass evolution targets from deck; Land Shake affects the opponent's Basic Pokémon benched from hand next turn.
- #16 Drifblim — Lifting selects up to two physical Basic Pokémon from deck, then separately selects optional basic Energy for each.
- #17 Dusknoir — Spirit Pulse applies between-turn damage only to enemy Pokémon with attached Energy.
- #21 Mamoswine — Ramming Strike flips until tails, allows a 20-self-damage paid reroll when nonlethal, and deals 30 for each final head, not an additional base 30.
- #30 Tyranitar — Darkness Drive reacts to actual opposing Poké-Power use with a selected discarded basic Darkness Energy, not a counterfeit attachment.
- #48 Sableye — Overeager selects first player only when one opening Active is Sableye, while Impersonate selects a Supporter from deck, discards that actual card and performs its effect without using up an ordinary Supporter play.
- #83 Energy Link — repeatable Tool action moves an individual basic or physical Special Energy attachment between Pokémon bearing Energy Link; remains a Tool action even if the Pokémon's Poké-Powers are suppressed.
- #87 Marley's Request — two different-named discarded Trainer/Supporter/Stadium refs are offered and the opponent chooses which one returns; a single available name may be returned; the Marley currently being played cannot choose itself.
- #88 Poké Blower + — one copy flips and, on heads, targets one opponent Pokémon for a counter; two physical copies switch selected opponent Bench to Active.
- #89 Poké Drawer + — one physical copy draws a card; two copies retrieve up to two actual chosen deck cards.
- #90 Poké Healer + — one copy heals 10 and removes a chosen status from own Active; two copies heal 80 and remove all statuses, consuming both copies.
- #96 Dusknoir LV.X — Ectoplasm reacts to an opponent attack KO: physical LV.X becomes an owned Stadium while KO still awards a Prize; the Stadium damages the opposing board between turns and returns to its owner on replacement.
- #97 Heatran LV.X — Heat Metal retains Burn on opposing Pokémon through evolution and forces tails on Burn recovery; optional Heat Wave at end turn can reattach up to two Basic Energy cards actually discarded by that turn's Fire/Metal Active attack.
- #99 Raichu LV.X — Voltage Shoot discards two actual Basic Lightning cards from hand, selects a target for 80, and on the level-up turn permits precisely one inherited Raichu follow-up attack if Link Lightning can be used.
- #100 Regigigas LV.X — Sacrifice selects an own Pokémon to KO, awards opponent Prize, selects up to two actual basic discard Energy attachments and heals 80, with no effect if Regigigas KO'd itself.

## Implementation rules reinforced

1. For printed multiplier-only attacks (e.g. 20×, 30×) resolved in a selected/delayed handler, do not add a duplicate parsed base damage in the normal attack pipeline.
2. Multi-step selections must preserve their previous selections and advance through explicit stages. Paired Trainer mode and an option-choice stage are distinct; use a non-reserved effect field for paired mode.
3. Triggered reactive Powers use the engine's actual events (`opponentPower`, `knockedOutByAttack`, `evolved`); Tool actions do not become suppressed Poké-Powers.
4. Record actual attached Basic Energy **before** resolving the attack, then use same-turn differences and physical discard ledger for Heat Wave. Do not retrieve previous-turn Energy.
5. Both player and CPU must respect physical hand/deck/discard, special Energy identity, printed target side, existing Bench size, KO Prize rules and full effect-choice timing.
6. Source-relative ZIP handoff only: extract into `source`, then git add source, git commit, git push origin main. Never rename paths or require Codex.

## Verification

- `sh scripts/prepare-stormfront.sh` regenerates the offline catalogue and runs both Stormfront suites, **46/46 passing** including a live attack sweep and 35 completion-focused tests.
- Seven selected older-set suites passed **114/114**: eight-card hand cap/tools, Fossil deck prerequisites, DP6 batch4, DP6 LV.X reuse, DP6 shared abilities, DP6 completion and DP6 independent audit.
- `python3 scripts/build-stormfront.py --audit` reports 106 battle-enabled / 0 gated; no network required.
- JavaScript syntax checks and source-relative ZIP extraction integrity checked.
- The new GitHub APK build and device testing are required for final release confidence; previous source tests do not prove a full Android build.
