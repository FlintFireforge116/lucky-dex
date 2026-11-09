# LuckyDex v0.69.170 — EX Team Magma vs Team Aqua accuracy / builder audit

Base: **v0.69.169**. This patch does not replace the full source directory and does not change saved data.

## Confirmed builder integration

- All 97 numbered cards remain registered under `ex4`.
- Player collection filter, selected-set controls, auto-build set pool and Classic CPU opponent expansion selection all expose `ex4`.
- Separate saved Test Lab decks and previously implemented mono-Energy preference are preserved.
- Added *hard Team matching* for 12 cards whose useful effects require Team Aqua or Team Magma Pokémon: Archie, Maxie, each Team's Ball, Belt, Hideout, Technical Machine and Conspirator. A deck without a matching Team no longer gets those dead support cards.
- Team Aqua/Magma Schemer remain usable without matching Team Pokémon (they still draw three cards), with bonus synergy when the relevant Team is present.
- The Team Aqua Technical Machine 01 metadata now identifies all five possible Special Conditions it can inflict.

## Battle outcome corrections

- Team Aqua's Crawdaunt **Aqua Reverse** changes the defending Pokémon before damage; the new Active Pokémon's Weakness and Resistance apply.
- Team Magma's Mightyena **Overrun** now targets the opponent's Bench, not their Active Pokémon.
- Team Magma's Baltoy **Psymist** offers a target for each successful flip, while **Night Attack** can choose an opponent's Pokémon.
- Team Magma's Claydol **Clay Curse** lets the user distribute its two damage counters among opposing Pokémon.
- Suicune ex **Energy Flip** only attacks Benched Pokémon and offers a destination for the optional Energy transfer. **Reverse Stream** is now all-or-nothing, as printed, rather than returning a partial amount.
- Team Aqua's Walrein **Hydro Reverse** returns Water Energy to hand without incorrectly counting the same Energy in the discard-energy ledger.

## Verification

`node --test tests/v07160-testlab-persistent-decks.test.cjs tests/v07161-testlab-deck-filter-restoration.test.cjs tests/v07163-ex-sandstorm.test.cjs tests/v07164-ex-sandstorm-audit.test.cjs tests/v07165-ex-dragon.test.cjs tests/v07166-ex-deck-builder-audit.test.cjs tests/v07167-classic-mono-energy.test.cjs tests/v07168-classic-energy-cohesion.test.cjs tests/v07169-ex-magma-aqua.test.cjs tests/v07170-ex-magma-aqua-outcome-audit.test.cjs`

**88 / 88 passed**, including 100 independent random seeds for both player and CPU EX4-only builds (200 legal decks), full previous EX4 attack execution checks, team support consistency, and focused numerical / card-choice outcomes. This is not an exhaustive guarantee for every cross-set interaction. Android touchscreen testing has not been performed.
