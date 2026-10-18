# LuckyDex Goldenrod Challenge Course Tournament Framework — Design Specification

Date: 2026-10-15  
Target release: v0.41.0  
Base: LuckyDex v0.40.39  
Status: design approved; ready for implementation planning after user review

## 1. Goal

Unify the Goldenrod Dome / Challenge Course into one coherent competitive venue built around the player's caught Pokémon and their base stats.

The existing Pokémon Dash race structure provides useful tournament bones — multi-round cups, standings, trophies, AI entrants, type-specific courses and stat eligibility — while Power Trial and Impact Trial currently behave as standalone difficulty runs. The new design promotes tournaments to a shared Goldenrod system so every stat challenge can support the same progression, results and trophy language without losing its own gameplay identity.

The finished venue should accomplish five things:

1. Every Goldenrod stat game supports meaningful tournament play, not only standalone runs.
2. Stat divisions stop extreme-stat Pokémon from trivialising low-level competition.
3. Player skill remains more important than simply choosing the Pokémon with the highest stat.
4. Pokémon Dash visually belongs to the same Goldenrod facility while retaining outdoor/type-themed races.
5. Future stat games can plug into the same tournament framework without another structural rewrite.

This work must preserve the app's Gen III-inspired visual language, local/offline operation, current Android identity, existing saves, existing rare-event settings and existing collected rewards.

## 2. Scope

### In scope for this release

- Shared Goldenrod tournament framework.
- Shared stat divisions and eligibility logic.
- Shared cup standings, scoring, podium and trophy cabinet.
- Division Cups for:
  - Pokémon Dash — Speed
  - Power Trial — Attack
  - Impact Trial — Defense
- Type Cups for all three implemented events.
- Exhibition mode retained for free practice.
- Pokémon Dash shell/presentation redesign to match the Goldenrod Challenge Course.
- Pokémon Dash outdoor race presentation retained, including type-specific course themes.
- AI tournament performance model for non-race events.
- Impact Trial difficulty rebalance so high divisions are challenging without returning to unreadable target spam.
- Save migration from existing Dash league/trophy data.
- New achievements for tournament progression.
- Rare-event rewards carried through tournament completion and shown in the final reward reveal.

### Explicitly deferred

- Target Range — Special Attack gameplay.
- Elemental Gauntlet — Special Defense gameplay.
- Endurance Expedition — HP gameplay.

Their event slots and adapter interfaces should be prepared by the shared framework, but their actual games are future work.

## 3. Goldenrod venue structure

Goldenrod becomes a single Challenge Course facility with a shared navigation flow:

`Challenge Course → Event → Mode → Division → Type (Type Cup only) → Pokémon → Competition`

The main event screen presents six event panels around a central Challenge Course identity:

- Pokémon Dash — Speed — active
- Power Trial — Attack — active
- Impact Trial — Defense — active
- Target Range — Special Attack — coming later
- Elemental Gauntlet — Special Defense — coming later
- Endurance Expedition — HP — coming later

The three active event cards show relevant progression, such as the highest unlocked division and best trophy. Future cards remain clearly visible as part of the facility but cannot be entered.

The visual shell should use the established Goldenrod/Gen III presentation from Power Trial and Impact Trial rather than the current separate Dash-app feel.

## 4. Competition modes

Each implemented event supports three competition modes.

### 4.1 Exhibition

Exhibition is a single standalone run/race for practice, records and casual play.

- Keeps the existing Easy / Normal / Hard style difficulty selection where the event currently uses it.
- Does **not** enforce stat caps. Any caught Pokémon may be used in Exhibition.
- Does not unlock divisions or trophies.
- Keeps existing per-event record behaviour where practical.
- Continues to support rare events and their rewards.

Exhibition exists specifically so players can experiment freely with favourites or overpowered Pokémon without affecting competitive fairness.

### 4.2 Division Cup

The main Goldenrod progression mode.

- Three rounds.
- Six entrants total: player + five AI competitors.
- Points per round: `10 / 6 / 4 / 3 / 2 / 1` for 1st through 6th.
- Standings shown between rounds.
- Final standings after Round 3.
- Gold / Silver / Bronze trophy for 1st / 2nd / 3rd overall.
- Top-three overall finish unlocks the next division for that event.
- First place records the division championship trophy.

### 4.3 Type Cup

Optional extra competition layered on top of the main division ladder.

- Same three-round, six-entrant format as Division Cups.
- Player Pokémon must match the selected type.
- Dual-type Pokémon qualify for either of their types.
- AI field is filtered to the selected type and division cap.
- Type Cups use only divisions already unlocked for that event.
- Type Cups unlock for an event once the player has achieved at least a Bronze podium in that event's Rookie Division Cup.

All 18 current Dash type themes are retained and become shared Goldenrod Type Cup identities where applicable:

Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel and Fairy.

For Dash, each Type Cup keeps its themed outdoor course. For Power Trial and Impact Trial, the type choice changes presentation, opponent pool and decorative arena treatment without changing the event's fundamental mechanic.

## 5. Stat divisions

Competitive cups use five maximum-stat divisions based on the event's relevant base stat.

| Division | Maximum relevant base stat |
| --- | ---: |
| Rookie | 59 |
| Poké | 89 |
| Great | 119 |
| Ultra | 149 |
| Master | Unrestricted |

Important rules:

- These are **maximum caps**, not minimum-to-maximum bands.
- A low-stat Pokémon may enter a higher unlocked division.
- A high-stat Pokémon may not enter a lower division if it exceeds that division's cap.
- Master allows any Pokémon.
- This prevents cases such as Steelix trivialising Rookie Impact Trial while still allowing skilled players to bring weaker favourites into hard competition.

Relevant stat by event:

- Pokémon Dash → Speed
- Power Trial → Attack
- Impact Trial → Defense
- Target Range → Special Attack
- Elemental Gauntlet → Special Defense
- Endurance Expedition → HP

The division system replaces the current Dash min/max difficulty bands for competitive play.

## 6. Progression

Progression is per event.

Initial state:

- Rookie Division unlocked for each implemented event.
- Higher divisions locked.
- Type Cups locked until the player podiums Rookie in that event.

Unlock rules:

- Finish 1st, 2nd or 3rd overall in a Division Cup to unlock the next division for that event.
- Winning 1st records the championship trophy for that division.
- Type Cups become available after the first Rookie podium for that event.
- Type Cups do not create a second unlock ladder; they use the player's already-unlocked event divisions.

This means a player can progress without needing to win every cup immediately, while first place remains meaningful for trophy completion.

## 7. Shared tournament engine

A shared Goldenrod tournament module should own generic cup behaviour rather than cloning Dash league logic into each game.

Responsibilities:

- Cup creation.
- Entrant roster.
- Round index and deterministic cup seed.
- Round result ingestion.
- `10 / 6 / 4 / 3 / 2 / 1` points.
- Standings and tiebreaking.
- Final placement.
- Trophy assignment.
- Unlock progression.
- Reward completion guards.
- Rare-prize accumulation across rounds.
- Final results/podium presentation data.

Tiebreak order:

1. Total cup points, descending.
2. Event-specific aggregate performance, best first.
3. Best single-round placement.
4. Stable seeded entrant order as final deterministic tiebreak.

The engine must not know the internal gameplay rules of Dash, Power or Impact. Instead, each event provides an adapter.

## 8. Event adapter contract

Each Goldenrod event adapter should provide a narrow interface describing:

- Event ID and display name.
- Relevant stat key.
- Exhibition difficulty configuration.
- Player eligibility calculation for cups.
- AI entrant selection.
- AI round-performance simulation.
- Player round result converted into a comparable tournament metric.
- Whether lower or higher raw metric is better.
- Round label and result formatting.
- Round-generation seed/input.
- Event-specific reward label and record handling.
- Optional type-theme hooks.

This keeps the shared tournament layer independent and allows the future three stat games to integrate through the same interface.

## 9. Stats and player skill

Base stats should provide a meaningful advantage without deciding the competition.

Use a compressed stat curve rather than direct linear multiplication. The difference between weak and average Pokémon should be noticeable, but extremely high stats should show diminishing returns.

The exact constants must be centralized and testable.

### 9.1 Pokémon Dash — Speed

Speed influences:

- sustainable pace,
- acceleration/recovery,
- AI baseline pace.

Player-controlled factors remain more important:

- stamina management,
- sprint timing,
- lane choices,
- hazard avoidance,
- boost/pickup use.

### 9.2 Power Trial — Attack

Attack influences the maximum power ceiling of a strike.

Player-controlled timing and accuracy determine how much of that potential is realized. A lower-Attack Pokémon with excellent play must be able to beat a higher-Attack Pokémon with poor execution.

### 9.3 Impact Trial — Defense

Defense influences mitigation when targets are missed.

Player execution determines Harden percentage. A perfect round where all required targets are hit always resolves as 100% Harden and **zero damage**, regardless of Defense.

This rule is absolute and must remain true at every division.

## 10. AI competition model

Tournament AI should feel like competing against Pokémon/rivals, not against five independent random rolls.

Each AI entrant receives a lightweight persistent cup profile containing:

- relevant base stat,
- consistency,
- aggression/risk,
- error tendency,
- peak-performance potential,
- seeded variance.

The profile persists across the three rounds of a cup so opponents develop recognisable behaviour.

Examples:

- A consistent rival tends to place near its expected level every round.
- A risky rival can post a dominant round but is more likely to make a large mistake.
- A strong-stat rival has a better baseline but can still lose through simulated mistakes.

AI selection should respect the same division cap and type eligibility as the player.

Difficulty/quality rises with division:

| Division | AI quality |
| --- | --- |
| Rookie | loose, frequent mistakes |
| Poké | average |
| Great | reliable |
| Ultra | strong |
| Master | elite but fair |

No AI may gain an impossible hidden stat advantage outside the event's allowed rules.

## 11. Pokémon Dash redesign

### 11.1 Shared Goldenrod shell

Dash should use the same Goldenrod flow and visual language as Power and Impact for:

- event selection,
- mode selection,
- division selection,
- type selection,
- Pokémon selection,
- tournament banners,
- standings,
- final results,
- podium/trophy presentation.

The current standalone race-app presentation should be retired.

### 11.2 Outdoor race retained

The actual active race remains outdoors and visually distinct from indoor challenge arenas.

Neutral Division Cups use a Goldenrod-region outdoor course theme.

Type Cups use the existing type-specific environments, for example:

- Fire → volcanic / ash route
- Water → coast / canal
- Grass → woodland
- Ice → snowfield
- Electric → power station / urban utility route
- Ground → desert / quarry
- Steel → rail yard
- Ghost → graveyard
- Fairy → luminous grove

All 18 existing type themes remain available.

### 11.3 Race gameplay retained

Do not replace the current core race gameplay:

- six visible racers,
- lane movement,
- stamina,
- sprinting,
- hazards,
- boosts,
- course progression.

The redesign is primarily shell, progression and tournament integration, not a new race engine.

## 12. Power Trial tournament integration

Each cup round is one Power Trial attempt using a seeded round configuration.

Rounds should become progressively more demanding within a cup, while the division sets the overall challenge envelope.

The player result is compared with simulated AI power-trial results using a normalized performance metric derived from:

- achieved launch/smash/push power,
- timing quality,
- accuracy,
- relevant Attack advantage.

Tournament UI should show six ranked competitors after each round rather than pretending all six were physically active in the player's arena.

## 13. Impact Trial tournament integration and rebalance

Each cup round is one Impact Trial sequence using a seeded hazard pattern.

The v0.40.39 readable simultaneous-target caps remain. Difficulty must **not** return to screen-filling target spam.

Higher divisions increase challenge through precision and tempo:

- smaller effective hit area at higher divisions,
- reduced dwell/fade grace,
- more awkward but readable target placement,
- faster target succession,
- less recovery time between impacts,
- more irregular falling patterns,
- stronger multi-impact pressure late in the cup.

The current responsive tap/swipe model, countdown, lowered impact line, stopping falling targets and fade-hit grace remain part of the mechanic; only their balance constants scale with division.

Critical invariant:

- If all required targets in a hazard are successfully hit, damage is zero.

Round ranking may use a normalized combination of:

- remaining endurance/HP,
- average Harden percentage,
- perfect hazards,
- response quality where relevant.

The exact formula should prioritize player execution over raw Defense.

## 14. Type Cup presentation outside Dash

Power Trial and Impact Trial should not receive wholly separate gameplay for every type. Type Cups alter atmosphere and opponent filtering while preserving the core mechanic.

Examples:

- Fire Cup → warmer arena lighting, ember/brazier props, Fire-type entrants.
- Water Cup → blue arena accents, spray/water props, Water-type entrants.
- Steel Cup → industrial/metal framing, Steel-type entrants.
- Ghost Cup → dimmer spectral presentation, Ghost-type entrants.

Use existing local assets and CSS/pixel-art treatment where possible. No network dependency is introduced.

## 15. Shared standings and final presentation

Between rounds, all events use a common Goldenrod scoreboard.

Example:

```text
ROUND 1 RESULTS
1. YOU       10 pts
2. MACHAMP    6 pts
3. HERACROSS  4 pts
...

CUP STANDINGS
YOU          10
MACHAMP       6
...
```

The screen must clearly distinguish:

- round placement,
- cumulative cup points,
- player row,
- current round number,
- next-round action.

After Round 3:

- show final standings,
- show top three on a Gen III-style pixel podium,
- award Gold/Silver/Bronze trophy,
- show Lucky Coins,
- show rare-event prizes won during any round,
- show unlocks/new division availability,
- show new records where relevant.

## 16. Trophy cabinet

Create a shared Goldenrod Trophy Cabinet rather than keeping Dash trophies isolated.

Per event, show:

- Rookie trophy,
- Poké trophy,
- Great trophy,
- Ultra trophy,
- Master trophy,
- Type Cup completion summary.

Trophy state records the best medal achieved for each competitive slot, with Gold being the completion target.

Preserve the complete legacy Dash league object unchanged for archival compatibility, and migrate all valid trophy/progression data using the deterministic mapping below rather than discarding it.

### Dash legacy migration

Current Dash stores `leagueRecords[type][difficulty]` with trophy, points and total time.

Use this deterministic migration because each old band's maximum Speed must fit wholly inside the destination division cap:

| Legacy Dash difficulty | Old Speed band | New Type Cup division |
| --- | --- | --- |
| Easy | 20–65 | Poké |
| Normal | 55–100 | Great |
| Hard | 90–135 | Ultra |
| Expert | 100–180 | Master |

Migration rules:

- A valid legacy Bronze/Silver/Gold trophy becomes the same medal in the mapped Dash Type Cup slot for that type/division.
- Never downgrade an already-migrated or newer trophy.
- Any valid legacy type trophy unlocks Dash Type Cups.
- Because every legacy trophy represents a top-three cup finish, Dash's unlocked Division Cup level advances to at least the division *after* the highest mapped non-Master legacy trophy: Poké trophy → Great unlocked, Great trophy → Ultra unlocked, Ultra trophy → Master unlocked. Master remains Master.
- If multiple legacy records map into progression, keep the highest resulting unlock and best medal per slot.
- Legacy records with no trophy do not grant division progression.
- Preserve legacy best points/time in an archival stats field when they do not map cleanly to the new aggregate record schema.
- Ignore malformed trophy names, non-finite score/time values and unknown difficulty keys for progression purposes while preserving the original legacy object.

This mapping intentionally leaves Rookie without a synthetic legacy trophy because the old Easy band allowed Speed values above the new Rookie cap.

## 17. Rewards

Exhibition keeps modest single-run rewards.

Cup rewards scale by:

- division,
- final placement.

Requirements:

- 1st place earns meaningfully more than Exhibition.
- Master pays more than Rookie.
- 4th–6th still receive a smaller participation reward.
- Rewards use the existing guarded arcade award path.
- Cup completion may award exactly once.

Do not let the tournament system become a disproportionately strong Lucky Coin farm compared with the rest of LuckyDex.

## 18. Rare events in tournaments

Existing rare events remain active inside tournaments:

- Golden Target — Power Trial
- Golden Hazard — Impact Trial
- no new Dash rare event is introduced by this feature; any already-existing Dash rare-event hook continues to use the same settlement/reveal rules

Rare-event Settings controls remain available for testing, following the project rule that rare events must be testable from Settings.

If a rare event is successfully completed during Round 1, 2 or 3:

- settle the rare prize immediately through the standard guarded rare-prize award path so navigation/crashes cannot lose it,
- store the resulting prize receipt on the active cup for presentation only,
- preserve that receipt through later rounds,
- never award the receipt a second time at cup completion,
- show the already-awarded prize prominently on the final Cup Complete reward screen.

If the player later abandons the cup, an already-earned rare prize remains theirs; abandoning simply means there is no final cup placement/trophy reward. This matches the rule that a completed rare challenge should neither duplicate nor disappear because later cup play ended early.

## 19. Persistence

Add a shared Goldenrod tournament state under `state.arcade` rather than embedding all new progression separately inside each game.

Required conceptual shape:

```js
state.arcade.goldenrod = {
  version: 1,
  events: {
    dash: {
      unlockedDivision: 'rookie',
      divisionTrophies: {},
      typeTrophies: {},
      lastMode: 'exhibition',
      lastDivision: 'rookie'
    },
    powerTrial: { ... },
    impactTrial: { ... }
  },
  cabinet: {
    viewed: false
  }
}
```

Additional fields may be added during implementation, but the shared state must satisfy:

- additive migration,
- old saves continue to load,
- unknown newer keys preserved,
- no existing exhibition records lost,
- Dash legacy league data preserved/migrated,
- partial/abandoned cups cannot corrupt progression.

Active cups are session-only in v0.41.0. Backgrounding during an active round pauses the underlying game and resumes safely on return. Fully leaving the cup abandons it; completed round history for that unfinished cup is discarded and no final placement/trophy reward is granted. Already-settled rare prizes remain owned by the player.

## 20. Achievements

All new game/tournament work must include achievements.

Add a Goldenrod tournament set including at least:

- **First Podium** — finish top 3 in any Goldenrod cup.
- **Division Champion** — win any Division Cup.
- **Master Champion** — win any Master Division Cup.
- **Type Specialist** — win a Type Cup.
- **Speed Master** — win Pokémon Dash Master Division.
- **Power Master** — win Power Trial Master Division.
- **Iron Wall** — win Impact Trial Master Division.
- **Goldenrod Grand Champion** — win Master Division in every currently implemented Challenge Course event.

Achievement evaluation must be save-safe and idempotent.

When future stat games are added, the broader Goldenrod achievement family may expand. Already-unlocked achievements must never be revoked.

## 21. Records

Preserve current Exhibition records.

Add tournament records separately so a cup result does not overwrite a single-run personal best with an incomparable metric.

Useful cup records include:

- best final placement by event/division,
- highest cup points,
- event-specific aggregate tiebreak metric,
- Type Cup best trophy.

Avoid unbounded per-Pokémon/per-type record growth unless the existing save model already handles it compactly.

## 22. Error handling and completion safeguards

Tournament completion must be resilient to duplicate callbacks and navigation events.

Requirements:

- Round result accepted once.
- Cup completion handled once.
- Trophy unlock handled once.
- Lucky Coin reward handled once.
- Rare prize handled once.
- Leaving/abandoning cannot accidentally award final placement.
- Invalid Pokémon eligibility blocks start with a clear reason rather than silently altering selection.
- Missing future event adapters leave the event card disabled rather than causing runtime errors.

## 23. Testing strategy

Implementation must follow test-first development.

### Shared tournament unit tests

- points table,
- three-round progression,
- standings,
- tiebreaks,
- trophy assignment,
- top-three division unlock,
- type cup unlock,
- duplicate completion guard,
- rare-prize carry-through,
- abandon behaviour.

### Eligibility tests

For every event:

- Rookie cap 59,
- Poké cap 89,
- Great cap 119,
- Ultra cap 149,
- Master unrestricted,
- lower-stat Pokémon allowed upward,
- over-cap Pokémon rejected downward,
- dual-type eligibility works,
- Exhibition unrestricted.

### Dash tests

- existing race simulation remains functional,
- shared shell routes correctly,
- outdoor neutral Division Cup theme,
- all 18 Type Cup themes still resolve,
- old Dash records migrate safely,
- old type trophies never downgrade.

### Power tests

- Attack stat adapter,
- AI performance generation,
- seeded round differences,
- standings conversion,
- Golden Target prize survives to final cup result.

### Impact tests

- Defense stat adapter,
- perfect target clear always zero damage,
- division scaling tightens timing without increasing unreadable simultaneous-target count,
- tap/swipe/fade handling remains functional,
- falling targets still stop at the lowered impact line,
- Golden Hazard prize survives to final cup result.

### Persistence tests

- old v0.40.39 saves load,
- missing Goldenrod state defaults safely,
- unknown keys survive normalization,
- legacy Dash league records migrate deterministically,
- no trophy/unlock duplication after reload.

### Visual/screen checks

Verify mobile layouts for:

- Challenge Course event selector,
- mode/division/type selection,
- Pokémon picker,
- Dash race shell,
- round standings,
- final podium,
- trophy cabinet,
- rare reward reveal.

## 24. Acceptance criteria

The feature is complete when all of the following are true:

1. Dash, Power Trial and Impact Trial each support Exhibition, Division Cup and Type Cup.
2. Competitive cups use the five approved stat-cap divisions.
3. A Pokémon over a division cap cannot enter that competitive division.
4. A lower-stat Pokémon may enter any unlocked higher division.
5. Division Cups run three rounds with six entrants and `10/6/4/3/2/1` scoring.
6. Top-three finish unlocks the next division; 1st earns the championship trophy.
7. Type Cups unlock after a Rookie podium and reuse event division progression.
8. Dash uses the Goldenrod shell but races remain outdoors.
9. Dash Type Cups retain distinct type-based course themes.
10. Power and Impact AI results are stat-aware but non-deterministic and skill remains more important than raw stat.
11. Impact high divisions are harder than v0.40.39 without returning to target spam.
12. Perfect Impact target completion always causes zero damage.
13. Golden Target and Golden Hazard remain testable from Settings and tournament prizes appear in the final reward reveal.
14. A shared trophy cabinet displays event/division progress.
15. Existing Dash league/trophy data and Exhibition records survive migration.
16. New tournament achievements exist and unlock idempotently.
17. Rewards and cup completion cannot duplicate.
18. Existing saves continue to load without destructive migration.
19. All relevant unit/regression tests and available screen checks pass before packaging.

## 25. Non-goals and guardrails

- Do not rebuild Pokémon Dash physics/racing from scratch.
- Do not move active Dash races indoors.
- Do not create six simultaneous Power/Impact player arenas.
- Do not make base stats deterministic winners.
- Do not make Master difficult by filling the screen with unreadable targets.
- Do not lock Exhibition based on stat caps.
- Do not discard legacy trophies or records merely because the progression model changed.
- Do not introduce network/runtime asset dependencies.
- Do not use Codex unless the user explicitly requests it or the work becomes impossible with the available direct tooling.
