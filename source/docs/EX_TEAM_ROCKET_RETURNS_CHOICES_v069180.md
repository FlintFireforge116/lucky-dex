# LuckyDex v0.69.180 — EX Team Rocket Returns choices and Scyther attack lock

Base: v0.69.179. Extract this source patch under `~/lucky-dex/source/`, then commit and push canonical source files. ZIP entries begin with `app/`, `tests/`, and `docs/`.

- Hoppip #57 and Skiploom #49 Miracle Powder now flip exactly once and, on heads, open a five-Special-Condition choice (Sleep, Confusion, Poison, Burn, Paralysis). No status on tails.
- Rocket's Moltres ex #100 Fire Dance now selects a Fire Energy from either card discard or the separate Energy-discard ledger and then selects any of your Pokémon to receive it. The selected Fire Energy is transferred exactly once, not automatically to the attacker.
- Rocket's Entei ex #97 Energy Link and Rocket's Articuno ex #96 / Zapdos ex #106 discard retrieval now choose the eligible Energy rather than silently retrieving the first, and can recover from the separate basic Energy ledger. Original type restrictions preserved.
- Pow! Hand Extension now offers both legal modes: choose an attached Defending Pokémon Energy and another opposing Pokémon to receive it, or let the defending player choose which Benched Pokémon switches in. Attached Special Energy can be moved. It is only playable when behind on Prize cards and an opposing Bench exists.
- Rocket's Scyther ex #102 locks Slashing Strike specifically after use, not Bounce or every attack. Attack-choice logic honors the per-attack lock on the next turn.
- Updated the older Trainer execution test to set the correct Hand Extension Prize condition. Added nine outcome-specific regression tests.

The patch does not modify player or opponent deck lists, card pools, Test Lab saves or the mono-type deck-builder preferences.
