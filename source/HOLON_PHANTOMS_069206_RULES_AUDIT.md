# LuckyDex 0.69.206 — EX Holon Phantoms rules and deck-building audit

This update follows v0.69.205 and audits live battle outcomes, interactive choices, evolution prerequisites, auto-decks, CPU compatibility and cross-set interactions. All 111 EX Holon Phantoms card records remain enabled; “attack executes without an exception” is not used as proof of exact printed-rule behaviour.

## Corrected gameplay

- EX Holon Phantoms Deoxys δ Energy Loop: choose and return exactly two attached Energy cards, including eligible Special Energy; Form Change also finds eligible older Deoxys prints.
- Pidgeot δ Rotating Claws: optional Energy discard followed by selection of a *different* Energy from the discard pile; it cannot recover the Energy just discarded.
- Gyarados ★ All-out Blast: discard the top of the deck down to one remaining card, then scale damage for Energy discarded.
- Mew ex Devo Crush: retain the base 50 damage and offer its two-Energy discard and devolution as optional actions.
- Deoxys δ Crystal Laser: +40 on its owner's next turn, not the opponent's intervening turn.
- Raichu δ Zzzap: damage-counter distribution ignores Weakness and Resistance.
- Regirock Rock Slide: damage up to two chosen Benched Pokémon rather than every Benched Pokémon.
- Kabutops δ Vital Drain: on KO, heal and clear Special Conditions.
- Rayquaza δ Flamethrower: discard the required Fire Energy.
- Mew Super Psywave: place damage counters (not standard damage subject to Weakness/Resistance); counts supplied Energy units, including Holon's Castform.
- Mawile Feint Attack: attack ignores protective modifiers; Trapinch δ Big Bite deals its printed 10 damage and applies the retreat restriction.
- EX Holon Phantoms Root Fossil: between-turn healing; Claw Fossil: counter damage after being struck.
- Aerodactyl δ Primal Light: choose a basic Energy from the separate Classic Energy Zone; Mr. Stone's Project: choose two Basic Energy cards from the appropriate source.

## Deck building and metadata

- EX Holon Phantoms Deoxys alternate-form metadata includes compatible EX Deoxys-era Deoxys prints.
- Bench-only Latias/Latios partners do not inject unsupported attack Energy requirements into a mono-Energy deck; dual attacks still need their real Energy.
- Holon Fossil is not generic Trainer filler and can appear as support only when eligible Fossil Pokémon are included; capped at two in auto decks.
- Physical Claw Fossil / Mysterious Fossil / Root Fossil Trainer cards are preserved as evolution-line prerequisites even though Trainer synergy scoring otherwise rejects Colorless Trainer identities. The same logic repairs saved decks missing their prerequisite Fossil.

## Verification

- 140 targeted/adjacent tests passed (EX Holon Phantoms, prior Delta and Legend Maker interactions, builder, CPU Energy and movement).
- 135 CPU-generated EX Holon Phantoms decks checked, 15 seeds across 9 archetype choices; all returned legal builds.
- Two historical mono-Energy test failures remain; both were reproduced on the unchanged 0.69.205 source and are not counted as passing.
- Automated tests do not replace Android/touch QA; complex multi-card interactions may still need manual testing.
