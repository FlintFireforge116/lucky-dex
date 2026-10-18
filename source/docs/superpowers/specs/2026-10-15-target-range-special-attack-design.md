# LuckyDex Goldenrod Target Range — Special Attack Design Specification

Date: 2026-10-15  
Target release: v0.42.0  
Base: LuckyDex v0.41.0  
Status: design approved in conversation; awaiting written-spec review before implementation planning

## 1. Goal

Add the fourth Goldenrod Challenge Course event: **Target Range — Special Attack**.

The game should feel like a Pokémon interpretation of Wii Sports Resort archery combined with the variety of Duck Hunt / Link-style shooting galleries: deliberate aiming, visible projectile travel, targets at meaningful distances, moving and pop-up targets, wind/drop compensation, satisfying bullseyes, and clear Pokémon-type attack identity.

Target Range must plug into the existing v0.41.0 Goldenrod framework rather than create a parallel progression system. It supports unrestricted Exhibition plus Rookie / Poké / Great / Ultra / Master Division Cups and all 18 Type Cups.

Player execution must matter more than raw Special Attack. A high-Sp. Atk Pokémon gets a useful margin, but a lower-stat Pokémon with excellent aim can win.

## 2. Core play loop

Each shot uses a deliberate aim-and-release loop:

1. The player touches and holds in the lower aiming/control region.
2. Dragging moves a visible reticle across the range using relative movement so the player's finger does not cover the target.
3. Holding focuses the shot over a short cap, reducing reticle sway and reaching full impact power.
4. Releasing fires immediately toward the current reticle solution.
5. The projectile visibly travels through the range, including distance drop and wind drift.
6. The target scores where the projectile actually arrives, not where the reticle was when fired.

There is no ammunition limit and no rapid-fire spam. A short shot-recovery interval prevents machine-gunning while keeping the game responsive.

The player can fire early before full focus. This is faster but produces more sway and lower impact power. Full focus is useful for difficult distant/armoured shots but costs time.

No phone gyroscope or motion sensor is required. The Wii Sports Resort reference is about deliberate aim, depth, wind and shot commitment rather than literal Wii Remote controls.

## 3. Range presentation and distance

The range is an outdoor Goldenrod training gallery with strong Gen III styling and perspective depth.

Targets can appear at clearly labelled distance bands rather than all sharing one flat plane:

- Near: approximately 10–15 m
- Mid: approximately 20–30 m
- Far: approximately 35–45 m
- Championship extreme shots may reach approximately 50 m

Distance affects:

- rendered target size,
- projectile travel time,
- vertical drop,
- wind influence,
- score difficulty.

Targets should be placed around an environmental gallery rather than only on a conventional archery line. Examples include wooden target stands, distant hillside targets, pop-up boards, crossing targets, suspended/swinging targets and small bonus targets. The visual inspiration is closer to a playful adventure/shooting gallery than a sterile shooting range.

The HUD must always show the current wind direction/strength and the target's distance when a target is active or selected/readable.

## 4. Type-themed special attacks

Every Pokémon fires a recognisable Special-style attack based on the chosen attacking type. Dual-type Pokémon may choose either of their own types before the round/cup begins; single-type Pokémon use their only type.

Default visual move identities:

| Type | Target Range attack |
| --- | --- |
| Normal | Swift |
| Fire | Flamethrower |
| Water | Water Pulse |
| Electric | Thunderbolt |
| Grass | Energy Ball |
| Ice | Ice Beam |
| Fighting | Aura Sphere |
| Poison | Sludge Bomb |
| Ground | Mud Bomb |
| Flying | Air Slash |
| Psychic | Psybeam |
| Bug | Signal Beam |
| Rock | Power Gem |
| Ghost | Shadow Ball |
| Dragon | Dragon Pulse |
| Dark | Dark Pulse |
| Steel | Flash Cannon |
| Fairy | Moonblast |

These are presentation identities, not a full battle move system. They share the same underlying aiming/trajectory rules, with differences limited to visual projectile/beam treatment, impact effects and audio. No type receives a mechanical advantage.

The selected attack type is fixed for an entire tournament cup to keep rounds consistent.

## 5. Aim, focus, sway and trajectory

### 5.1 Aim

The reticle is positioned through relative drag input from the lower control region. The game should preserve the last aim position between shots rather than snap back to centre.

The reticle must remain visible and readable without being obscured by the player's finger.

### 5.2 Focus

Holding a shot builds focus over roughly half a second. Focus:

- reduces reticle sway,
- increases impact power to its full value,
- slightly improves projectile stability.

There is no benefit to holding beyond the focus cap.

### 5.3 Sway

Sway is subtle on Rookie/Exhibition Easy and increasingly relevant in higher divisions. It must feel like a controllable aiming challenge rather than random aim sabotage.

Special Attack slightly reduces effective sway / increases stability using a diminishing-return stat curve.

### 5.4 Projectile travel

Shots have visible travel time. Close targets are nearly point-and-shoot; distant and moving targets require leading and compensation.

Projectile simulation includes:

- distance-dependent travel time,
- gravity/drop,
- horizontal wind drift,
- target movement during flight.

Wind is stable long enough to learn and compensate rather than changing unpredictably every frame. It may change between target groups/waves.

## 6. Scoring

Standard target rings score:

- Bullseye: 10
- Inner ring: 8
- Middle ring: 6
- Outer ring: 3
- Miss: 0

Bullseyes extend the active combo multiplier. Inner/middle/outer hits keep the current combo alive at lower divisions but do not increase it; misses break it. At higher divisions, outer-ring hits may also break the combo.

The combo multiplier must be capped so that one early mistake does not make the rest of the round mathematically unwinnable.

Tournament round placement uses final range score versus five AI scores, then converts placement into the existing Goldenrod `10 / 6 / 4 / 3 / 2 / 1` cup points.

Ties use the shared Goldenrod tournament tiebreak rules.

## 7. Special Attack stat effect

Special Attack provides a moderate, diminishing-return advantage. It must not aim for the player or erase trajectory compensation.

Sp. Atk influences:

- a small reduction in effective sway,
- a small increase in projectile/bullseye tolerance,
- impact power against armoured targets.

The stat bonus is capped. Bullseye skill always overrides armour: a bullseye breaks an armoured target regardless of Sp. Atk.

A lower-Sp. Atk Pokémon with excellent accuracy must be capable of beating a stronger Pokémon with average accuracy.

## 8. Target types

Target Range should support a reusable target model with these initial behaviours:

- **Stationary** — conventional targets used for distance/trajectory reads.
- **Crossing** — moves horizontally across the scene; requires leading.
- **Swinging** — pendulum/arc motion.
- **Pop-up** — appears for a limited period at a location, then drops away.
- **Armoured** — bullseye breaks instantly; non-bullseye hits require sufficient impact power or a second hit.
- **Golden Target** — rare reward target; see section 11.

Target placement must use the full range and depth bands. Difficulty should come from distance, motion, wind, timing and precision, not from covering the screen in simultaneous targets.

## 9. Round structure

A Division or Type Cup contains three Target Range rounds with a persistent six-entrant field.

### Round 1 — Marksman

Focus: learning the day's wind and judging distance.

- Mostly stationary targets.
- Near, mid and far distances.
- A small number of gentle movers may appear late in the round.
- Strong emphasis on bullseye precision and trajectory compensation.

### Round 2 — Moving Range

Focus: leading targets and target selection.

- Crossing targets.
- Swinging targets.
- Pop-ups at mixed distances.
- More frequent wind changes between groups.
- Some armoured targets.

### Round 3 — Championship Range

Focus: combined mastery.

- Mixes all target behaviours.
- Faster sequencing and shorter target exposure.
- More long-distance shots.
- More demanding wind.
- Armoured/high-value shots appear alongside moving targets.
- Screen density remains controlled; challenge comes from execution rather than clutter.

Exhibition uses the same target-generation vocabulary but maps Easy / Normal / Hard to progressively harder parameters.

## 10. Division difficulty

Target Range uses the shared Goldenrod Special Attack caps:

| Division | Maximum base Sp. Atk |
| --- | ---: |
| Rookie | 59 |
| Poké | 89 |
| Great | 119 |
| Ultra | 149 |
| Master | unrestricted |

Higher divisions increase difficulty through:

- longer average distance,
- faster target movement,
- slightly greater reticle sway,
- stronger wind,
- shorter pop-up exposure,
- more demanding armour distribution,
- less forgiving combo retention.

They should not simply shrink every target or spawn many targets simultaneously.

Master should be difficult but legible and mechanically fair.

## 11. Golden Target rare event

Target Range gets its own Goldenrod rare event: **Golden Target**.

- Uses the same configurable rare-event odds pattern as Power Trial / Impact Trial.
- A clearly gold target appears during a round.
- It may move, but must always offer a fair readable shot opportunity.
- Hitting it outside the bullseye scores normal target points but does **not** win the rare prize.
- A true bullseye secures the rare prize.
- Once secured, the reward receipt is carried through the active cup.
- The prize is visibly revealed on the final tournament result screen alongside normal cup rewards.
- Exhibition awards/reveals the prize at its normal result screen.
- Reward settlement must remain idempotent and safe against repeated result rendering.

## 12. Goldenrod integration

Target Range becomes the fourth active event card in the existing Challenge Course shell.

Event adapter data:

- Event ID: `targetRange`
- Display name: `Target Range`
- Relevant stat: Special Attack / `spAtk`
- Higher raw round score is better.
- Exhibition difficulties: Easy / Normal / Hard.
- Cup modes: Division Cup / Type Cup.
- Type Cup player eligibility uses the existing type rules.
- AI entrants obey both selected division cap and selected Type Cup type.

The three-round cup flow, persistent AI roster, standings, trophies, progression, reward settlement and trophy cabinet come from the shared v0.41.0 Goldenrod framework.

Target Range must not fork or duplicate the generic tournament engine.

## 13. AI performance

Target Range AI scores use the same persistent cup rival profiles introduced in v0.41.0.

AI simulation should combine:

- compressed relevant Sp. Atk contribution,
- division AI quality,
- rival consistency,
- rival risk/aggression,
- round difficulty,
- seeded variance.

AI score distributions must overlap enough that strong play beats stronger-stat opponents and poor play can lose to weaker-stat opponents.

The same rival field persists across all three cup rounds.

## 14. Records, trophies and achievements

Records should include at minimum:

- Best Exhibition score by difficulty.
- Best accuracy percentage.
- Best bullseye count.
- Longest bullseye/combo streak.
- Longest-distance bullseye.
- Golden Targets seen / won.
- Division Cup best trophy by division.
- Type Cup best trophies using the shared trophy cabinet.

Add Target Range-specific achievements for meaningful milestones, including:

- first Target Range completion,
- first bullseye,
- a multi-bullseye streak,
- a long-distance bullseye,
- a Golden Target bullseye,
- Target Range Master Division champion.

The existing Goldenrod Grand Champion achievement must expand to require Master championships in all **currently implemented** Goldenrod events, so Target Range becomes part of that requirement once v0.42.0 ships.

## 15. Presentation and feedback

Presentation should remain Gen III-inspired and fit the Goldenrod Challenge Course visual shell.

Required feedback:

- clear shot reticle,
- visible focus/charge state,
- wind indicator,
- distance readout,
- visible projectile path/travel,
- target hit ring feedback,
- `BULLSEYE!` callout,
- combo indicator,
- score popup at impact,
- satisfying target break/impact animation,
- distinct type-themed projectile and impact effects,
- Golden Target gold treatment and reward confirmation.

The projectile visual must never obscure the target long enough to harm aiming readability.

## 16. Input and mobile responsiveness

Target Range is primarily touch-first.

- Pointer/touch down begins focus.
- Pointer movement updates relative aim continuously.
- Pointer/touch release fires.
- Pointer capture should be used so a drag remains active if the finger crosses element boundaries.
- Touch input must prevent accidental page scroll during active aiming.
- Aim updates should use all useful pointer movement available without tying shot logic to frame rate.
- Leaving the app / visibility loss pauses safely rather than firing or losing an active cup round unexpectedly.

A keyboard/mouse fallback is permitted for desktop testing, but mobile touch is the primary interaction target.

## 17. Save and compatibility requirements

- Existing v0.41.0 saves must load unchanged.
- Goldenrod state normalization must add Target Range defaults without resetting Dash, Power or Impact progress.
- Existing rewards and achievements must not be re-awarded because of migration.
- Active cup state remains session-only as in v0.41.0.
- No network dependency may be introduced.
- Existing Android package/application identity must remain unchanged.

## 18. Testing requirements

Implementation follows TDD.

Minimum automated coverage:

1. Target trajectory/drop/wind calculations are deterministic under a fixed seed/input.
2. Near versus far shots produce different travel/drop behaviour.
3. Moving targets continue moving during projectile flight and require lead.
4. Focus reduces sway/increases impact only up to the defined cap.
5. Special Attack uses diminishing returns and cannot auto-aim.
6. Bullseye scoring and combo behaviour are correct.
7. Armoured targets always break on bullseye regardless of Sp. Atk.
8. Golden Target only awards its rare prize on a bullseye and settles once.
9. Dual-type Pokémon can select either owned type; non-owned types are rejected.
10. Division caps use Special Attack and Master is unrestricted.
11. Type Cup AI/player eligibility follows both type and division rules.
12. All three tournament rounds feed comparable scores into the shared standings engine.
13. Target Range progression/trophies persist without disturbing other Goldenrod event state.
14. Goldenrod Grand Champion expands to include Target Range Master only after Target Range is implemented.
15. Touch/pointer aim flow starts on down, updates on move and fires on release without page-scroll leakage.
16. Exhibition Easy / Normal / Hard remain unrestricted by stat caps.
17. Existing Dash, Power Trial, Impact Trial and Goldenrod regressions remain green.
18. Version surfaces are bumped consistently to v0.42.0.

## 19. Acceptance criteria

Target Range is ready to ship when:

- it is a fully active fourth Goldenrod event,
- touch aiming feels deliberate and responsive,
- distance, wind, projectile travel and moving-target lead are mechanically meaningful,
- each Pokémon uses one of its own type-themed special attacks,
- Ground uses Mud Bomb and Psychic uses Psybeam,
- Special Attack helps without replacing player aim,
- three cup rounds are visibly/mechanically distinct,
- Division and Type Cups work through the shared tournament engine,
- Golden Target bullseyes award and reveal a rare prize safely,
- records/achievements/progression persist correctly,
- legacy Goldenrod progress remains intact,
- the app remains offline/local and Android identity is preserved,
- focused Goldenrod/Target Range regressions and asset/syntax checks pass,
- any environment-limited full-suite checks are reported explicitly rather than represented as passing.
