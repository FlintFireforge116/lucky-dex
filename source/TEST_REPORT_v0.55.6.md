# LuckyDex v0.55.6 test report

Scope: Kanto Adventure full-playthrough feedback pass, plus Challenge Course instructions and Dust rarity filter usability.

## Changes verified
- Adventure uses HP / Attack / Defense / Sp. Atk / Sp. Def / Speed; Physical and Special damage select the correct stat pair.
- Ancient Power and battle stat text expose Sp. Atk / Sp. Def rather than the previous generic offense abstraction.
- Fake Out only works on the user's first turn on the field and cannot flinch an immune Ghost target after dealing zero damage.
- Journey move synchronization fills missing current Collection moves without discarding retained Journey move choices.
- Kanto wild pools are location-specific; Route 19 excludes Grimer while Pokémon Mansion includes it.
- Viridian Forest and other configured Kanto locations can be hunted on first visit; completed stops can be revisited from the Journey Map without rewinding story progress.
- Champion completion uses a finish-journey action rather than routing the player back toward the Pokémon League.
- Poké Mart access is gated to actual Journey locations with Mart service, including Adventure home and Bag entry points.
- Link Cable enables standard direct trade evolutions, including Kadabra, Machoke, Graveler and Haunter in Kanto.
- Blue receives a dedicated Champion difficulty increase while ordinary regional trainer damage remains near the prior balance.
- Pokémon Challenge Course event selection shows a HOW TO PLAY explanation before entering each game.
- Dust rarity filtering is multi-select and ordered by rarity tier rather than alphabetically.

## Focused regression
Fresh `node --test` coverage across Adventure battle/status/journey/location/region/tools/balance, Goldenrod Challenge Course, Dust Exchange, special-stat load order and v0.55.6 release identity:
- 86 tests
- 86 passed
- 0 failed

All 12 modified JavaScript/CommonJS implementation files also passed `node --check`.

## Balance simulation
The persistent regional balance regression completes its seeded Kanto, Johto and Hoenn runs under the six-stat combat model. The simulator now evaluates Physical and Special moves with the corresponding offensive and defensive stats so the test matches runtime combat.

## Offline asset integrity
The Arcade source-art check, venue check, Adventure asset check and Fossil Museum asset check all pass. The historical sleeve verifier cannot complete from the supplied v0.55.5 source archive because `qa/v0440/physical/catalogue-enumeration.json` is not present; the verifier reports that missing provenance input before reconciliation. No sleeve code or art was changed in v0.55.6.

## Full historical runner
`npm test` runs successfully through the first 46 historical test programs and then stops at `adventure-core.test.cjs` because this environment does not have the declared Playwright module installed (`Cannot find module 'playwright'`). This is the same environment limitation documented in the supplied v0.55.5 report and is not a v0.55.6 assertion failure.

## Android packaging
The supplied source archive has no Gradle wrapper and this environment has no Android SDK configured, so an APK was not produced here. Android identity remains `com.example.luckydex`, versionName `0.55.6`, versionCode `5506`.

No Codex was used.
