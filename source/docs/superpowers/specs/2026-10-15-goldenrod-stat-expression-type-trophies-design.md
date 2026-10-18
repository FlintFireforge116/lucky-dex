# Goldenrod Stat Expression and Type Cup Trophy Design

**Baseline:** LuckyDex v0.42.5  
**Target:** next release after v0.42.5

## Intent

Make the relevant Pokémon stat feel materially different in every Goldenrod event, including within the same division, while preserving skill as the main way to outperform a moderate stat disadvantage. Apply the same stat model to CPU competitors so player and AI performance obey the same underlying rules. Expose the already-separated Type Cup achievements/trophies in the Trophy Cabinet. Fix the obviously incorrect Target Range tree scenery without redesigning the whole event.

## Shared stat curve

All four current Goldenrod events use one monotonic, steep-but-diminishing normalized performance curve from the relevant base stat.

Reference points for equal-quality play:

| Stat | Relative performance |
| ---: | ---: |
| 20 | 0.65x |
| 40 | 0.78x |
| 59 | 0.90x |
| 89 | 1.02x |
| 119 | 1.12x |
| 149 | 1.19x |
| 180 | 1.24x |
| 220+ | 1.28x |

The implementation may interpolate smoothly between these reference points but must preserve their ordering and approximate magnitude. The curve intentionally makes 25 vs 58 visibly different inside Rookie while tapering at very high stats so extreme species do not become absurd.

Skill remains decisive across moderate gaps. A very strong performance from a Pokémon roughly 30-40 relevant-stat points lower can beat a weaker performance from the stronger Pokémon. Equal-quality play should clearly favour the higher-stat Pokémon.

## Per-game physical expression

### Dash — Speed

- Speed materially affects acceleration and sustained/max pace.
- Course handling, stamina, boost timing, lane choice and hazard avoidance remain skill-driven.
- Faster Pokémon must visibly pull away under otherwise equal driving.
- Do not make top-end Speed scale linearly without limit; use the shared tapering curve.

### Power Trial — Attack

- Attack sets a much stronger strike-power ceiling than in v0.42.5.
- Charge/timing accuracy determines how much of that ceiling the player realizes.
- Perfect-vs-perfect comparisons should show a clear difference between low and high Attack.
- A low-Attack Pokémon can still beat a stronger one if the stronger run is executed poorly.

### Impact Trial — Defense

- Defense changes challenge burden and mistake mitigation.
- Lower Defense produces more Harden targets for the same hazard; higher Defense produces fewer.
- Simultaneous-target density remains capped at readable limits; low Defense becomes longer/more demanding rather than visually impossible.
- Defense also increases mitigation for missed targets.
- Existing invariant remains: hitting every required target yields 100% Harden and zero damage regardless of Defense.

### Target Range — Sp. Atk

- Sp. Atk becomes visible projectile power rather than a small hidden bonus.
- Lower Sp. Atk gives slower projectile travel, more ballistic drop and somewhat greater wind susceptibility.
- Higher Sp. Atk gives faster/flatter travel and stronger armour breaking.
- Aim/reticle accuracy remains primarily skill-based rather than being heavily auto-corrected by Sp. Atk.
- The scoring impact point and visual projectile destination must remain identical.

## CPU competitors

- CPU simulation uses the same shared stat curve as the player-facing physical mechanics.
- Relevant stat provides the same directional advantage: faster Dash pace, higher Power output, easier Impact burden/mitigation equivalent, and stronger/flatter Target Range output.
- AI consistency/execution variance layers on top of stat rather than replacing it.
- Division and round difficulty continue to influence AI execution quality.
- A low-stat CPU can occasionally outperform a stronger one through a better simulated performance, but equal execution favours the higher stat.
- Target Range's v0.42.4 Rookie balance target must remain approachable; do not accidentally restore the old 130-160 Rookie score field while adding stronger stat expression.

## Division behavior

- Existing division caps remain unchanged.
- Relevant stat differences inside a division remain meaningful.
- Higher divisions may contain stronger eligible Pokémon and better AI execution, but the stat curve itself does not change by division.
- Exhibition remains unrestricted.

## Type Cup trophies

The save model already distinguishes Type Cups by event, type and division; preserve that data model.

Update the Goldenrod Trophy Cabinet so each event has two clearly separated areas:

1. Division Cups — Rookie, Poke, Great, Ultra, Master.
2. Type Cups — each of the 18 Pokemon types, each with its own Rookie/Poke/Great/Ultra/Master medal/trophy track.

Winning Fire/Great and Water/Great are distinct visible trophies. Existing saved Type Cup results must appear automatically without migration loss.

The Type Cup presentation must remain compact enough for mobile. Collapsible/expandable per-event or per-type sections are acceptable if needed, but trophy identity must remain visible and unambiguous.

## Target Range scenery correction

- Remove the incorrect small tree sprites currently scattered through the range.
- Replace them with restrained, perspective-correct edge/background scenery using existing offline-safe assets/CSS.
- Keep the firing lane visually clean.
- This is a scenery correction only; do not rework Target Range gameplay or controls in this task.

## Architecture

Add one shared stat-curve utility used by all Goldenrod game adapters/simulators. Each game translates the normalized stat factor into its own physical mechanic; do not add one generic final-score multiplier.

Keep existing game-specific cores authoritative for mechanics. The shared utility should expose only the curve/factor calculation and any small interpolation helpers needed by both player mechanics and CPU simulation.

The Trophy Cabinet remains part of the shared Goldenrod tournament presentation and reads existing trophy/progression state rather than introducing a parallel save structure.

## Compatibility and safety

- Preserve existing saves, records, achievements, rewards and tournament progression.
- Preserve all four current events and their Exhibition/Division/Type Cup modes.
- Preserve offline operation and Android package identity.
- No external runtime dependencies.
- No unrelated Goldenrod redesign.

## Testing

Use TDD for every behavior change. Add focused coverage for:

- shared stat curve reference points and monotonic/tapering behavior;
- meaningful low-vs-high stat difference inside Rookie for each of the four games;
- Dash Speed affecting pace/acceleration;
- Power Attack affecting strike ceiling;
- Impact Defense changing target burden while preserving readable simultaneous density and perfect=zero-damage;
- Target Range Sp. Atk affecting projectile speed/drop and armour power without changing visual/scoring destination agreement;
- CPU simulations using the same stat-direction advantage in all four games;
- Target Range Rookie AI staying within the v0.42.4 approachable balance envelope;
- Type Cup trophy cabinet displaying distinct event/type/division trophies from existing saved state;
- Target Range no longer renders the incorrect tree sprites;
- existing Goldenrod, records, rewards, achievements, and per-game regressions remain green.

## Acceptance criteria

A player should be able to switch between two eligible Pokemon in the same Rookie division and immediately notice the relevant stat difference in the actual game behavior. Moderate stat gaps remain surmountable by better play; extreme gaps are obvious. CPU rivals obey the same principle. Type Cup wins are visibly distinct in the trophy cabinet, and Target Range scenery no longer uses the incorrect tree treatment.
