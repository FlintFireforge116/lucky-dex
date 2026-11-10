# LuckyDex 0.69.182 — Classic TCG EX Deoxys

The printed EX Deoxys (ex8) card catalogue is now registered as a playable Classic expansion: 108 cards, 159 printed Pokémon attacks, 45 Poké-Powers/Bodies, 9 Trainers and 3 Special Energy. The player deck builder, Test Lab unrestricted collection, CPU opponent selection, and ownership mapping share the same card registry.

## Notable battle interactions

- Distinct Deoxys and Deoxys ex Form Change Powers, retaining current damage, status, attached Energy, and once-per-turn global limit.
- Deoxys ex Energy Burst / Psyburst damage choices, Shedinja Empty Shell Prize exception, and Rocket's Raikou ex Lightning Burst.
- Rayquaza ex Dragon Boost allows optional basic Energy transfers from other Pokémon after Bench entry.
- Boost Energy, Heal Energy and Scramble Energy attach only to legal targets and apply their proper Energy, healing and expiry rules.
- EX Deoxys attacker choice routes, damage scaling, delayed/self-damage effects, selected attack locks, and trainer searches.
- Defensive effects include Altaria Safeguard, Ninjask Fast Protection, Deoxys ex Psychic Shield, Crawdaunt Dark Protection, and selected damage reduction Bodies.

## Validation

- Automated card census, 30-card CPU/player EX Deoxys-only deck generation and legality checks.
- Every printed Pokémon attack exercises two seeded random paths with automatic resolution of pending choices.
- Targeted card-outcome, Form Change, Tool/Energy, Knock Out, search and ability tests.
- Cross-set regression suites cover preceding Gen 3 expansions including EX Team Rocket Returns and historical rules/choice audits.

The attack-execution sweep does **not** prove all printed interactions or multi-card edge cases are exact. Real Android testing and deeper follow-up audits are recommended for unusual combinations and any card that offers a complex multi-step choice.
