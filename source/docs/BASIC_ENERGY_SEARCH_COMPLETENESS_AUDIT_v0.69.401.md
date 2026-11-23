# Basic Energy Search: Classic catalogue audit (23 November 2026)

Version: LuckyDex 0.69.401 (same APK version; source-relative combined patch).

## Method and scope

Scanned the `tcg-classic-battle-data.js` bundled `CARDS` array for printed "search your/the deck" clauses mentioning Basic Energy or a specified basic Energy type (including attacks, Abilities, and Trainer text), checked effect implementation type, then inspected Energy Zone consumption paths and exercised confirmed edge cases through the shared battle effect engine. The current bundled catalogue has **89 matching print/effect entries**, **82 battle-enabled**, **7 currently gated/disabled**. The scan is not an official full-card oracle and may miss unusual textual synonyms not matching its pattern, or future regenerated sets. It does not certify every search outcome dynamically.

## Confirmed previously missing or broken cases now repaired

- **HGSS Ampharos #14 / Call of Legends Ampharos #23 — Acceleration Bolt:** Legacy `zoneTake` result was ignored, meaning tails still attached Energy. Now attaches only when the coin-gated Zone take succeeded; next search still proceeds.
- **HGSS Mareep #73 — Static Electricity:** Uses the same HGSS branch and inherits the tails-protection fix.
- **Steam Siege Xerneas #81 — Geomancy:** Generic `distributeEnergy` aborted after a failed first request. Now uses two independent attempts with two targets. Tails does not attach Energy.
- **EX Emerald Unown Q — Hidden Power:** Distinct-type 3-search loop ended at the first tails. Now tracks attempts separately from successful Energy types.
- **Sun & Moon Fomantis #14 — Synthesis:** Had physical Energy only and could not use the Classic Zone. Zone source now offers a single coin-gated Grass search.
- **Sun & Moon Vikavolt #52 — Strong Charge:** Its Ability was ineligible with Zone-only Energy. Now supports Zone or physical Energy and independently resolves Grass and Lightning searches even after tails.
- **Platinum Lotad #81 — Synthesis:** The printed coinFlip effect wrapped a nested Energy search, and a resumed target choice lost the printed search identity. The provenance matcher now recognises nested heads/tails effects. Other nested printed searches inherit this fix.

## Expanded legacy coverage (shared fallback; physical deck searches preserved)

The initial Zone-only smoke case was reaching the global search coin logger on 55 of 82 enabled search effects. After the repairs above and an additional **central legacy-rule fallback**, the same synthetic harness reaches the logger on **70 of 82**. This counts a logged search, **not** proof that each card is correct in every gameplay state. The fallback only activates for confirmed printed Basic Energy searches when there are no real Basic Energy cards in the physical draw deck. A real-card search still uses the existing `deckCard` picker.

The new shared fallback covers 14 old effect keys, including EX Dragon **Vibrava Quick Charge**, Rocket Returns **Heracross Extra Draw**, **Voltorb Recharge**, FireRed & LeafGreen **Raichu Recharge**, **Kingler Water Arrow**, **Parasect Energy Powder**, Deoxys **Yanma Quick Charge**, **Mareep Static Electricity**, **Marill Energy Search**, Diamond & Pearl **Flaaffy Attract Current** and **Shinx Recharge**, Platinum **Parasect Nutritional Support**, HGSS/Call of Legends **Skarmory Steel Coat**, and BW Plasma Freeze **Chandelure Flare Navigate**. The shared fallback respects Lightning/Water/Fire/Metal/Grass type restrictions, distinct types where printed, eligible target restrictions, the opponent-ex requirement for Heracross, and Chandelure's damage after successful attachment. A failed coin flip does not consume Zone Energy or skip further search attempts. This is a targeted central routing table, **not** individual rewritten card definitions.

## Remaining 12 enabled prints not verified by Zone-only smoke

These searches **did not reach the global coin logger in the synthetic state** (no physical Energy cards in deck, no evolution event, no prerequisite cost, and limited Bench). That is a test-coverage gap, **not** proof of failure for every card; they still require prerequisite-aware card-level scenarios before a complete audit can be declared:

| Card and printed effect | Why generic Zone-only smoke did not validate it |
| --- | --- |
| `ex4-77` Team Aqua Conspirator | Mixed Team Aqua Basic Pokémon / Basic Energy search, legacy physical-deck picker; **possible Zone omission** |
| `ex4-82` Team Magma Conspirator | Mixed Team Magma Basic Pokémon / Basic Energy search; **possible Zone omission** |
| `ex5-37` Igglybuff Set Song | Requires selecting a Basic Pokémon alongside a Basic Energy; no Pokémon in test deck |
| `ex7-73` Remoraid Energy Draw | Printed coin precedes the Basic Energy search; requires explicit heads route |
| `ex10-110` Typhlosion ex Bursting Up | Evolution-triggered ability; opponent's Bench determines number of searches |
| `ex11-95` Holon Researcher | Requires discarding a hand card before the search, then offers Pokémon/Metal Energy alternatives |
| `dp7-3` Infernape Blaze Dance | Evolution-triggered; printed coin precedes up to four Fire searches |
| `dp7-13` Bronzong Cycler | Must first return a card from hand to deck before searching |
| `dp7-16` Drifblim Lifting | Must Bench Basic Pokémon searched from the deck before Energy searches |
| `dp7-78` Tangela Ingrain | Printed coin controls whether the search/defensive effect occurs |
| `pl4-AR5` Arceus Ripple Swell | Requires six differently typed Arceus in play; generic test Bench limit is three |
| `hgss3-40` Unown DARK | Requires a Bench-entry trigger and typed `searchChosen` effect |

Of these, **the two Conspirator supporters are specifically flagged for follow-up implementation review**, since they use mixed physical/Zone search mechanics and cannot be assumed covered by the global helper. A future systematic audit must construct valid trigger/cost/target states for the other ten rather than treating a no-op in the synthetic state as success or failure. This patch does not claim 82/82 certified.

## Out of scope / not claimed

Seven matching printed effects belong to currently battle-disabled prints: `base3-59`, `pl1-11`, `pl1-36`, `pl1-105`, `pl1-SH6`, `bw10-9`, `bw10-96`. Some have no-op or unsupported effects; this audit does not enable or repair those disabled cards. Direct physical deck search remains a real-card search, not a Zone search. `Max Elixir`, `Serene Grace` and `Thunder Rod` have independent reveal/coin rules. No full Android Gradle build was performed offline; confirm the GitHub APK job after installation.

## Regression

`tests/v07405-basic-energy-search-completeness-audit.test.cjs` includes catalogue inventory/implementation guard, Xerneas after-tails, Unown Q after-tails, HGSS Ampharos no-free-Energy, both Fomantis outcomes, Vikavolt Ability eligibility/second search, Lotad's nested coin provenance, and representative old EX/HGSS/BW Zone-only fallback cases and physical deck compatibility. It runs in XY7/XY11 Gradle audits and XY11 source/full preflights. Baseline `v07404` remains required.
