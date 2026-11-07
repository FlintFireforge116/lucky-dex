# LuckyDex Classic TCG: Skyridge / v0.69.148

## Scope and source

Skyridge (set code `ecard3`, released May 2003) has 182 print identities: 150 numbered cards and 32 separately numbered Holo cards (`H1`–`H32`). The print catalogue follows the publicly maintained Pokémon TCG card data at `PokemonTCG/pokemon-tcg-data/cards/en/ecard3.json`; artwork identifiers point to `images.pokemontcg.io/ecard3/`.

This is the **initial integration pass**, not a claim that all Skyridge move mechanics are complete.

## Supported and deferred

* 182/182 cards are registered in the Classic catalogue with distinct IDs, images, type, stage, evolution, HP, rarity, retreat, weakness, resistance, attack names and costs, and print distinctions.
* 54/182 print identities currently have `battleEnabled=true`, `deckEligible=true` (including H27 Rhydon). The remainder are `PARTIAL` and cannot be included by Classic AI auto-building or opponent generation until their printed effects have proper support.
* Working examples: Rhydon Giant Tail coin gate, Electrode Selfdestruct and Lightning discard recovery, Abra Psychoflow zero retreat while Psychic Energy is attached, Snorlax Lolling About, status effects, coin-based damage, basic damage/recoil, five Crystal Type Pokémon (Charizard, Crobat, Golem, Ho-oh and Kabutops), and Fisherman.
* Celebi #145 has Crystal Type data, but its unique Empathic Healing isn't battle-ready and therefore remains gated. Other complex abilities, Trainer/Technical Machine interactions and the three special Energy cards remain gated pending precise rule implementation.
* Voltorb #113 Magnetic Pull correctly lets the **attacking** player select which opponent Benched Pokémon is switched in, rather than giving that selection to the defender.
* The shared `tcgp-battle-effects.js` forced-opponent-switch choice handler now supports `chooseBy:'attacker'` without changing the prior default (defender chooses).
* When adding support to existing cards, require behaviour tests for both coin outcomes, legal choice timing, target ownership, Energy discard/attachment and legal deck generation. Do **not** replace the printed effect with a similar but incorrect generic shortcut.

## Integration

Registered in Classic's main card database, ownership projection, deck validation, auto-builder and opponent deck pool, shared era selector, deck editor's set filter, and Classic fight set list. Android version `0.69.148` / `versionCode 7128` agrees with JavaScript marker and both visible start-screen labels.

## Regression

Run: `node --test source/tests/v0714{1,2,3,4,5,6,7,8}-*.test.cjs`

The release test pass showed 95/95 passing: prior Legendary Collection, Expedition and Aquapolis suites plus Skyridge-specific coverage and CPU simulations. No Android device APK validation was performed.
