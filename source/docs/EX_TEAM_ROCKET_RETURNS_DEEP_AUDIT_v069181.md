# LuckyDex v0.69.181 — EX Team Rocket Returns deep combat audit

Base: v0.69.180. Unzip into `~/lucky-dex/source/` (ZIP paths start at `app/`, `tests/`, `docs/`). This is a source patch, not an APK or a full repo replacement.

## Corrected outcomes and choices
- Venture Bomb flips once and then gives the active player a choice of target on the correct side. The selection no longer rerolls the coin.
- Seadra's Aqua Trick selects a Basic or Special Energy attached to the Defending Pokémon and then the exact opposing Bench recipient.
- Dark Electrode's Energy Bomb allows keeping the Energy or distributing all attached Basic and Special Energy individually among chosen Bench Pokémon.
- Pokémon Retriever offers either one selected Pokémon to hand or three selected Pokémon shuffled into the deck; Rocket's Wobbuffet's Dark Aid now offers the same alternatives for Tool / Rocket's Secret Machine cards.
- Dark Marowak's Hard Bone makes the Pokémon-card discard part of the attack choice and deals zero damage if there is no valid Pokémon to discard.
- Dark Houndoom's Shakedown offers anonymous face-down hand positions and discards the selected opposing hand card without revealing the rest of the hand.
- Dark Slowking's Litter counts Rocket's Secret Machine cards (which are classified as Items in the battle catalogue), allows picking which up to two cards are discarded, and keeps damage choices in sync.
- Rocket's Meowth's Snatch and Run can find Pokémon Tools or Rocket's Secret Machine cards in the deck, then optionally switch with a chosen Bench Pokémon.
- Dark Octillery's Black Suction Cups deals its printed 10 damage, in addition to its coin-dependent status.

## Validation
- 173/173 selected regressions passed before release-version bump across ex7 and old original Rocket cross-set coverage, prior EX expansions, deck builders and separate Test Lab saves.
- New 14-test deep audit exercises selected targets, actual Energy movement, exact discard choices, one-coin-only resolution, invalid attack costs, and actual hand/deck mutations.
- Catalogue count and player/CPU set filter tests retained. No change to player inventory or existing saved decks.

## Limitations
- LuckyDex supports one Active Pokémon and a custom 30-card Classic format; original 2-on-2 behavior remains out of scope.
- Tests validate the new paths and representative cross-set behavior but do not guarantee every printed card interaction. Android visual/on-device testing remains outstanding.
- The original 2000 Team Rocket set still has 43 partially implemented cards outside this pass.
