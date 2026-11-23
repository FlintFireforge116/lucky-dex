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

The initial Zone-only smoke case was reaching the global search coin logger on 55 of 82 enabled search effects. After the first-pass central legacy-rule fallback it reached 70 of 82; after the second-pass special-case fixes it reaches **78 of 82**. This counts a logged search, **not** proof that each card is correct in every gameplay state. The fallback only activates for confirmed printed Basic Energy searches when there are no real Basic Energy cards in the physical draw deck. A real-card search still uses the existing `deckCard` picker.

The new shared fallback covers 14 old effect keys, including EX Dragon **Vibrava Quick Charge**, Rocket Returns **Heracross Extra Draw**, **Voltorb Recharge**, FireRed & LeafGreen **Raichu Recharge**, **Kingler Water Arrow**, **Parasect Energy Powder**, Deoxys **Yanma Quick Charge**, **Mareep Static Electricity**, **Marill Energy Search**, Diamond & Pearl **Flaaffy Attract Current** and **Shinx Recharge**, Platinum **Parasect Nutritional Support**, HGSS/Call of Legends **Skarmory Steel Coat**, and BW Plasma Freeze **Chandelure Flare Navigate**. The shared fallback respects Lightning/Water/Fire/Metal/Grass type restrictions, distinct types where printed, eligible target restrictions, the opponent-ex requirement for Heracross, and Chandelure's damage after successful attachment. A failed coin flip does not consume Zone Energy or skip further search attempts. This is a targeted central routing table, **not** individual rewritten card definitions.

## Second-pass resolution of the former 12 special cases (23 November 2026)

The initial audit's 12 exceptions have now received prerequisite-aware tests and real engine repairs. The generic Zone-only smoke reaches the shared search coin logger in **78 / 82 battle-enabled effects**, up from **70 / 82**, with **zero exceptions**. All **12 former exceptions** have new card-level tests in `tests/v07406-basic-energy-search-special-cases.test.cjs` (16 scenarios including independent physical-card compatibility and six-slot Arceus).

| Card or mechanic | Second audit result |
| --- | --- |
| EX Team Aqua / Team Magma Conspirator | Mixed matching Basic Pokémon and Zone Basic Energy searches can be chosen in any combination, up to two independent attempts. Physical cards keep their physical picker. Tails leaves the Zone unit and allows the next attempt. |
| EX Igglybuff Set Song | Searches for a physical Basic Pokémon first where possible, then independently offers one physical or coin-gated Zone Basic Energy. Energy still works when the deck contains no Basic Pokémon. |
| EX Remoraid Energy Draw | Its *printed* coin is evaluated first; only on heads can the search proceed. A newly retrieved Zone Energy gets a *second*, independent search coin. Physical Basic Energy keeps only the printed coin. |
| EX Typhlosion ex Bursting Up | Requires its evolution event and opponent Bench; after choosing a Fire target, each of up to that many Fire searches consumes its own attempt even on tails. No unavailable Fire source is offered. |
| EX Holon Researcher | A real card must be discarded from hand before any search. Offers the existing physical Metal Energy/δ-Pokémon route or a gated new Basic Metal Energy from Zone. Physical picker recursion after choosing the physical route has been fixed. |
| DP Infernape Blaze Dance | Requires its printed evolution-heads gate; then makes up to four independent Fire Zone search attempts, each targeted separately and limited by supply. |
| DP Bronzong Cycler | First moves a real hand card atop the draw deck, then offers up to two independent coin-gated Zone searches while keeping physical Energy search available. Also repaired a previously broken `stage: 'hand'` choice continuation. |
| DP Drifblim Lifting | First puts a physical Basic Pokémon onto Bench, then independently offers a coin-gated Zone Energy for that new Pokémon. Repeats at most twice subject to available Bench slots and physical Pokémon. |
| DP Tangela Ingrain | Original printed heads gate is followed by a separate Zone search coin. Defensive protection is granted only when a real Grass Energy was attached (not on tails). |
| Platinum Arceus Ripple Swell | In LuckyDex's default **3-Bench / 1-Active** Classic layout, requires **4** differently typed Arceus filling all playable positions, instead of an impossible six. Scales the maximum Energy attempts to 4 and independently gates each Zone search; successful Energy must attach to different Pokémon. If the board really allows 6 slots, the original six-type prerequisite remains. This is a *documented hybrid adaptation*, not official TCG text. |
| HGSS Undaunted Unown DARK | The printed Darkness Energy request now matches the Zone's Basic Darkness Energy alias while preserving the Bench-entry trigger and independent heads/tails. |

### Four legitimate generic-smoke exclusions

`ex10-110` Typhlosion ex (evolution trigger / opponent Bench), `dp7-13` Bronzong (must first finish hand-card return choice), `dp7-16` Drifblim (requires Basic Pokémon in physical deck and a valid Bench placement), and `pl4-AR5` Arceus (requires a full qualifying Arceus board) cannot reach their coin logger in a deliberately empty-deck, missing-prerequisites generic state. All four are instead covered by valid, constructed scenarios in v07406. Do not mark them as failed or skip their special-case tests to inflate the generic coverage number.

## Out of scope / not claimed

Seven matching printed effects belong to currently battle-disabled prints: `base3-59`, `pl1-11`, `pl1-36`, `pl1-105`, `pl1-SH6`, `bw10-9`, `bw10-96`. Some have no-op or unsupported effects; this audit does not enable or repair those disabled cards. Direct physical deck search remains a real-card search, not a Zone search. `Max Elixir`, `Serene Grace` and `Thunder Rod` have independent reveal/coin rules. No full Android Gradle build was performed offline; confirm the GitHub APK job after installation.

## Regression

`tests/v07405-basic-energy-search-completeness-audit.test.cjs` includes catalogue inventory/implementation guard, Xerneas after-tails, Unown Q after-tails, HGSS Ampharos no-free-Energy, both Fomantis outcomes, Vikavolt Ability eligibility/second search, Lotad's nested coin provenance, and representative old EX/HGSS/BW Zone-only fallback cases and physical deck compatibility. It runs in XY7/XY11 Gradle audits and XY11 source/full preflights. The new `tests/v07406-basic-energy-search-special-cases.test.cjs` likewise runs in these gates and covers all former 12 special cases plus physical compatibility. Baseline `v07404` remains required.
