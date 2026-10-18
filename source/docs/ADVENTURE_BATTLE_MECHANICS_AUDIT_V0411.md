# LuckyDex v0.40.11 — Adventure Battle Mechanics Audit

## Scope

This audit is deliberately bounded to moves that LuckyDex Adventure can expose to a Pokémon at or below the Adventure level cap (50): basic moves, level-up moves learned by level 50, the Adventure TM catalogue, and Struggle.

The generated offline move/learnset snapshot contains 693 move rows. The Adventure-accessible audit set is **625 moves**:

- 405 damage-role moves
- 52 buff-role moves
- 29 debuff-role moves
- 26 status-role moves
- 13 heal-role moves
- 100 generated `no-op` utility rows that need explicit engine handling or honest unsupported copy

The goal is not a full competitive simulator. Adventure has no held-item engine, ability engine, doubles targeting model, switch-in hazard model, or complete field/terrain system. v0.40.11 therefore implements high-value mechanics that map cleanly to the existing single-battle model and makes the remaining incompatible mechanics explicit rather than silently pretending they work.

## Mechanics implemented or corrected in v0.40.11

### Damage and turn resolution

- Uses each move's real power instead of the old 95-power damage cap.
- Multi-hit moves use their generated hit ranges.
- Recoil uses the move's negative drain metadata.
- Positive drain continues to heal from damage dealt.
- Critical hits are resolved, with Focus Energy increasing the rate.
- Flinch can prevent the slower target's action in the same turn.
- Accuracy/evasion stages now affect hit chance.
- Speed stages now affect turn order.
- Recharge moves (Hyper Beam/Giga Impact/Rock Wrecker family) consume the following action.
- Explosion/Self-Destruct family faints the user after damage.
- False Swipe cannot reduce the target below 1 HP.

### Real stat stages

Adventure battles now retain bounded -6..+6 stages for Attack, Defense, Speed, Accuracy and Evasion. Generated move stat changes and damaging secondary stat changes use those stages. Haze resets them. The multiplier curve is intentionally Adventure-tuned at roughly 15% per positive stage (with reciprocal negative stages) rather than the much steeper competitive formula; the persistent regional balance simulator showed canonical multipliers caused repeat defeat loops in otherwise valid journeys. The old `guard` / `attackBoost` fields remain migrated for save compatibility but are no longer the only representation of stat-changing moves.

LuckyDex's current species combat schema contains one Attack and one Defense value rather than separate physical/special combat stats, so generated Attack/Special Attack changes share the Adventure Attack stage, and Defense/Special Defense changes share the Adventure Defense stage.

### Major and volatile conditions

- Existing burn/poison/paralysis/sleep handling remains active.
- Yawn's delayed sleep remains active from v0.40.4.
- Confusion now has a turn counter and self-hit chance.
- Damaging moves with a confusion secondary effect can inflict it.
- Bind/Wrap-style trapping prevents flee/switch and deals residual damage.
- Leech Seed drains residual HP and heals its owner; Grass targets are immune.
- Taunt blocks status moves temporarily.
- Encore locks the target to its previous move temporarily.
- Disable blocks the target's previous move temporarily.
- Mean Look/Block prevent escape/switch temporarily.
- Perish Song runs an active three-count.

### Healing and defensive utility

- Rest fully restores HP, clears the previous status/confusion and applies sleep.
- Heal Bell/Aromatherapy clear major/confusion status across the player's party.
- Wish resolves as delayed healing.
- Ingrain/Aqua Ring provide gradual recovery.
- Protect-family moves block targeted attacks for the turn. LuckyDex intentionally treats several shield variants as the same core protection mechanic; their competitive retaliation/side effects are not modelled yet.
- Pain Split averages current HP.
- Belly Drum spends half maximum HP and sets Attack to +6 when it can succeed.

### Weather and speed control

- Rain Dance, Sunny Day, Sandstorm, Hail and Snowscape create timed weather.
- Rain boosts Water and weakens Fire; sun boosts Fire and weakens Water.
- Sandstorm/Hail residual damage respects broad type immunities used by LuckyDex.
- Tailwind temporarily doubles side Speed.
- Trick Room temporarily reverses equal-priority Speed order.

### Fixed/variable damage families

- OHKO effect family: fails against a higher-level target; otherwise knocks out on a successful accuracy check.
- Super Fang: half current HP.
- Seismic Toss/Night Shade family: damage equal to user level.
- Endeavor: lowers a healthier target to the user's current HP.
- Final Gambit: damage based on user HP and user faints.
- Flail/Reversal, Water Spout/Eruption, Low Kick/Grass Knot, Gyro Ball, Heavy Slam/Heat Crash and Electro Ball use Adventure-appropriate variable-power rules.

### Other single-battle utility

- Teleport escapes wild/rare encounters and fails in trainer battles.
- Soak changes the target to pure Water for the battle.
- Topsy-Turvy inverts target stat stages.
- Speed Swap swaps the current Speed values.

## Former generated `no-op` moves now handled

Thirty of the 100 Adventure-accessible generated `no-op` rows now have real Adventure behaviour:

`Disable`, `Teleport`, `Haze`, `Focus Energy`, `Rest`, `Belly Drum`, `Sandstorm`, `Mean Look`, `Heal Bell`, `Pain Split`, `Encore`, `Rain Dance`, `Sunny Day`, `Hail`, `Taunt`, `Wish`, `Aromatherapy`, `Block`, `Tailwind`, `Aqua Ring`, `Trick Room`, `Soak`, `Quick Guard`, `Topsy-Turvy`, `Spiky Shield`, `Speed Swap`, `Aurora Veil`, `Obstruct`, `Snowscape`, and `Burning Bulwark`.

The shield variants above deliberately resolve through LuckyDex's shared Protect-family behaviour.

## Remaining generated `no-op` rows

**70** accessible generated `no-op` rows remain deliberately unsupported in v0.40.11. Their move detail text continues to say that no LuckyDex battle effect is implemented, instead of claiming a mechanic that is silently ignored.

They primarily require systems Adventure does not currently possess:

- **forced switching / doubles targeting:** Whirlwind, Roar, Follow Me, Helping Hand, Rage Powder, After You, Ally Switch, Quash, Instruct;
- **move copying/calling or form cloning:** Mimic, Metronome, Transform, Sketch, Sleep Talk, Copycat, Nature Power;
- **held-item / ability semantics:** Trick, Switcheroo, Role Play, Skill Swap, Gastro Acid, Worry Seed, Simple Beam, Entrainment, Recycle, Teatime, Doodle;
- **switch-in hazards / richer field or terrain state:** Spikes, Toxic Spikes, Stealth Rock, Sticky Web, Gravity, Wonder Room, Magic Room, Water Sport, Grassy Terrain, Misty Terrain, Electric Terrain, Psychic Terrain, Fairy Lock;
- **special swap/copy/conditional state:** Conversion, Conversion 2, Curse, Mind Reader, Lock-On, Psych Up, Magic Coat, Acupressure, Psycho Shift, Power Trick, Power Swap, Guard Swap, Heart Swap, Magnet Rise, Guard Split, Power Split, Reflect Type, Electrify, Laser Focus, Octolock;
- **faint/switch replacement mechanics:** Destiny Bond, Baton Pass, Healing Wish, Grudge, Revival Blessing, Shed Tail;
- **other absent battle-resource semantics:** Spite, Imprison, Splash.

These are future-engine work, not silent regressions. If Adventure gains abilities, held items, doubles, hazards or terrain ownership, the relevant families should move from this deferred list into shared mechanics rather than one-off move patches.

## Enemy battles

Player and enemy actions resolve through the same `useMove` mechanics path in `adventure-battle.js`, so an enemy that owns one of the supported effects receives the same resolution rules. Existing trainer strategy/budget logic still decides when support moves are selected; v0.40.11 does not build a competitive AI planner.

## Move descriptions

`adventure-move-view.js` now describes the implemented mechanics above from the same offline move rows used by battle resolution. Unsupported utility moves keep explicit unsupported copy. This is intentional: visible behaviour must not over-promise engine support.

## Compatibility notes

- Existing fight objects are migrated in place with defaults for new volatile/stage fields.
- No save schema reset is required.
- Existing move PP, party HP, Adventure progression and capture/economy paths remain unchanged.
- Freeze continues to use LuckyDex's existing simplified incapacitation model rather than introducing a new thaw subsystem in this release.
