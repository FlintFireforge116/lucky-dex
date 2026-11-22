# LuckyDex v0.69.399 — Sun & Moon Base SM1 Stage 1

## Official dataset

- Set: `sm1` / Sun & Moon Base, 3 February 2017; pinned upstream pokemon-tcg-data `sm1.json` blob `b3f5cd6f524ce45d59462fd2a56e237ff06063dc`.
- Complete **173-print** catalogue: numbers **1–172 plus Eevee 101a**; 130 Pokémon, 30 Trainers, 13 Energy.
- 238 printed attacks; 26 Abilities; 27 Pokémon-GX printings, each with one GX attack; secret and full-art variants retained.
- **104 enabled for battle and automatic decks**, 69 **gated** pending exact mechanics; `SM1_BUILD_COVERAGE.json` has every gated ID and reason. All 173 are listed in the catalogue.

## Mechanics and safety

- Pokémon-GX use the existing shared **one GX attack per game per player**, and **two Prize cards when knocked out**. No duplicate GX subsystem was introduced.
- Source-verified attacks and Trainer effects reuse validated existing effects. Unimplemented abilities/attacks and unusual Trainers are **never represented by a pretend successful noop**; the entire print is gated from player and CPU decks.
- All physical SM1 Basic Energy cards, including duplicate Psychic and Metal prints, are kept as distinct printable cards. SM1 #136 Double Colorless Energy is supported as a physical Special Energy with two Colorless units. #137 Rainbow Energy is gated pending flexible-type and on-attachment damage mechanics.
- GX alternate-art print effects and battle enabled state are checked against their ordinary printings.
- Keep the virtual Energy Zone distinct from real physical Energy cards in decks, hands, discard piles and attachments.

## CI and Termux gates

Run locally before pushing:

```sh
cd ~/lucky-dex
python3 source/scripts/check-gradle-source.py --self-test
(cd source && python3 scripts/preflight-sm1-release.py --full && python3 scripts/preflight-xy12-release.py --full && python3 scripts/preflight-xy11-release.py --full && python3 scripts/preflight-xy10-release.py --full)
```

Gradle generates SM1 after XY12's audit and runs both the SM1-specific integration tests and **the global 30-card deck-quality gate** before APK asset merge. The generated JS module and pinned compact dataset are already included to avoid needing network access during release preflight.

**Next pass:** implement and test additional GX attacks, passive and reactive Abilities, and nuanced Trainers; then independent full-print audit. Source-only checks do not confirm a GitHub APK build.
