# EX Crystal Guardians (ex14) — card-by-card rules and metadata audit

**LuckyDex source:** v0.69.209 (baseline v0.69.208)  
**Date:** 12 November 2026  
**Printed card reference:** PokémonTCG/pokemon-tcg-data `cards/en/ex14.json` (100 cards, English)  
**Status:** **100 registered / 96 battle-enabled / 4 PARTIAL**. Battle-enabled means an engine route and selected outcome/attack tests exist, **not** exhaustive hand-play verification across all interactions.

## Source contract applied

- Every collector number (`ex14-1` … `ex14-100`) maps to exact name, stage, HP, typing, Weakness/Resistance, retreat, attacks and named Powers/Bodies. Official art URLs and ownership mapping are present.
- `tcg-classic-battle-data.js`, set picker, Test Lab collection, player/CPU deck builder and opponent generators load this expansion. `deckMeta` includes actual Energy costs, conditional bonuses, Tools, status strategy, optional partners and any named evolutions.
- EX-era 30-card Classic format uses LuckyDex's **three-Bench limit**, ordered Basic Energy Zone, and normal physical Special Energy/hand/discard ownership rules. These are LuckyDex conversions; they are not claims about standard 60-card TCG.
- Two-unit **Double Rainbow Energy** attaches only to evolved non-ex Pokémon; its outgoing damage is reduced by 10. **Crystal Beach** converts two-or-more Energy producing Special cards into one Colourless Energy while active. **Cessation Crystal** suppresses Pokémon Powers/Bodies while attached to Active; **Memory Berry** exposes earlier evolution attacks and expires after attacking; **Holon Circle** cancels the attack and discards itself.
- Attack/ability resolution includes selected Bench damage, coin flips, conditional damage and status, owned card movement, real deck peeks, hand/discard source, cost/retreat alterations, preventions, and time-sensitive triggers. CPU deck building uses printed costs and actual restrictions rather than treating all Special Energy as generic filler.
- Cards whose printed effect has an incomplete outcome or interactive choice are **visible in catalogue but excluded from legal auto-built and live battle decks**. Each exception is explicitly listed below.

## Required remaining work (do not silently promote)

1. **Delcatty ex #91:** Constrain two-player discard-to-six and Upstream actual discard-to-physical-deck shuffle.
2. **Swampert ex #98:** Energy Recycle's three selected discard Energy attachments and turn-ending effect; Ultra Pump optional two hand-card discard and selected Bench hit.
3. **Alakazam ★ #99:** Psychic Select arbitrary real discard recovery; Skill Copy hand Pokémon discard, legal copied attack choice and attack cost/side effects.
4. **Celebi ★ #100:** Time Travel optional knockout replacement, coin flip, attachment discard and bottom-of-deck return.

## Tests and limitations

- **`tests/v07209-ex-crystal-guardians.test.cjs`: 33/33 passing**, covering all 100 registry identities, 96 eligible/4 partial gate, all nine auto-deck archetypes across three seeds, critical Stadium/Tool/Energy choices, damage/status/trigger rules and all battle-ready Pokémon attacks executing without exceptions.
- **Neighbouring `v07203` through `v07208`: 77/77 passing**. One prior hard-coded 3459-card expectation was updated to include the 100 new collector numbers; no historical combat expectation was weakened.
- These are **Node state tests**, not Android handset touch tests. The execution sweep verifies no exceptions, **not** correctness of every optional branch, every player/CPU target decision, long CPU matches or complex cross-era combinations. Four cards remain unsupported until printed outcomes are implemented and tested.

## Full card ledger

| No. | Card | Category / type | Battle gate | Printed move/power and relevant rule status |
|---:|---|---|---|---|
| 1 | Banette | Pokémon · Psychic | ENABLED | Attacks: Night Murmurs. Powers/Bodies: Safeguard. |
| 2 | Blastoise δ | Pokémon · Fighting,Metal | ENABLED | Attacks: Enraged Linear Attack, Skull Bash. Powers/Bodies: Shield Veil. |
| 3 | Camerupt | Pokémon · Fire | ENABLED | Attacks: Linear Attack, Combustion. Powers/Bodies: Delta Protection. |
| 4 | Charizard δ | Pokémon · Lightning,Metal | ENABLED | Attacks: Metal Burn. Powers/Bodies: Peal of Thunder. |
| 5 | Dugtrio | Pokémon · Fighting | ENABLED | Attacks: Dig Under, Double-edge. Powers/Bodies: Sand Veil. |
| 6 | Ludicolo δ | Pokémon · Fire | ENABLED | Attacks: Knock Off, Fire Punch. Powers/Bodies: Overzealous. |
| 7 | Luvdisc | Pokémon · Water | ENABLED | Attacks: Even Game, Stadium Play. Powers/Bodies: —. |
| 8 | Manectric | Pokémon · Lightning | ENABLED | Attacks: Kick Away, Strong Current. Powers/Bodies: —. |
| 9 | Mawile | Pokémon · Metal | ENABLED | Attacks: Mining, Bite Off. Powers/Bodies: —. |
| 10 | Sableye | Pokémon · Darkness | ENABLED | Attacks: Disable. Powers/Bodies: Excavate. |
| 11 | Swalot | Pokémon · Grass | ENABLED | Attacks: Pick and Choose, Reactive Poison. Powers/Bodies: —. |
| 12 | Tauros | Pokémon · Colourless | ENABLED | Attacks: Call for Family, Horn Attack. Powers/Bodies: Crush Chance. |
| 13 | Wigglytuff | Pokémon · Colourless | ENABLED | Attacks: Collect, Pester. Powers/Bodies: Fluffy Fur. |
| 14 | Blastoise | Pokémon · Water | ENABLED | Attacks: Hydro Pump. Powers/Bodies: Water Pressure. |
| 15 | Cacturne δ | Pokémon · Fighting | ENABLED | Attacks: Triple Needle, Light Punch. Powers/Bodies: Spike Storm. |
| 16 | Combusken | Pokémon · Fighting | ENABLED | Attacks: Focus Energy, High Jump Kick. Powers/Bodies: —. |
| 17 | Dusclops | Pokémon · Psychic | ENABLED | Attacks: Will-o'-the-wisp, Psychic Shield. Powers/Bodies: Cursed Glare. |
| 18 | Fearow δ | Pokémon · Lightning | ENABLED | Attacks: Pierce. Powers/Bodies: Delta Sign. |
| 19 | Grovyle δ | Pokémon · Psychic | ENABLED | Attacks: Scratch, Agility. Powers/Bodies: —. |
| 20 | Grumpig | Pokémon · Psychic | ENABLED | Attacks: Circular Steps. Powers/Bodies: Thick Fat. |
| 21 | Igglybuff | Pokémon · Colourless | ENABLED | Attacks: —. Powers/Bodies: Hover Lift, Baby Evolution. |
| 22 | Kingler δ | Pokémon · Fire,Metal | ENABLED | Attacks: Body Slam, Prop-up Pinchers. Powers/Bodies: —. |
| 23 | Loudred | Pokémon · Colourless | ENABLED | Attacks: Surprise, Bass Control. Powers/Bodies: —. |
| 24 | Marshtomp | Pokémon · Water | ENABLED | Attacks: Rain Splash, Mud Splash. Powers/Bodies: —. |
| 25 | Medicham | Pokémon · Fighting | ENABLED | Attacks: Psyshock, Sky Uppercut. Powers/Bodies: Dual Armor. |
| 26 | Pelipper δ | Pokémon · Lightning | ENABLED | Attacks: Supersonic, Wing Attack. Powers/Bodies: Delta Transport. |
| 27 | Swampert | Pokémon · Fighting | ENABLED | Attacks: Rock Hurl. Powers/Bodies: Echo Draw. |
| 28 | Venusaur | Pokémon · Grass | ENABLED | Attacks: Green Blast, Toxic Sleep. Powers/Bodies: Chlorophyll. |
| 29 | Charmeleon | Pokémon · Fire | ENABLED | Attacks: Rage, Flamethrower. Powers/Bodies: —. |
| 30 | Charmeleon δ | Pokémon · Lightning | ENABLED | Attacks: Slash, Thunder Jolt. Powers/Bodies: —. |
| 31 | Combusken | Pokémon · Fire | ENABLED | Attacks: Searing Flame, Firebreathing. Powers/Bodies: —. |
| 32 | Grovyle | Pokémon · Grass | ENABLED | Attacks: Detect, Smash Kick. Powers/Bodies: —. |
| 33 | Gulpin | Pokémon · Grass | ENABLED | Attacks: Amnesia, Sludge Toss. Powers/Bodies: —. |
| 34 | Ivysaur | Pokémon · Grass | ENABLED | Attacks: Sleep Powder, Vine Whip. Powers/Bodies: —. |
| 35 | Ivysaur | Pokémon · Grass | ENABLED | Attacks: Stretch Vine, Sharp Leaf. Powers/Bodies: —. |
| 36 | Lairon | Pokémon · Metal | ENABLED | Attacks: Roar, Metal Charge. Powers/Bodies: —. |
| 37 | Lombre | Pokémon · Water | ENABLED | Attacks: Plunder, Wave Splash. Powers/Bodies: —. |
| 38 | Marshtomp | Pokémon · Fighting | ENABLED | Attacks: Hug, Mud Shot. Powers/Bodies: —. |
| 39 | Nuzleaf | Pokémon · Darkness | ENABLED | Attacks: Self Charge, Corkscrew Punch. Powers/Bodies: —. |
| 40 | Shuppet | Pokémon · Psychic | ENABLED | Attacks: Ascension, Tackle. Powers/Bodies: —. |
| 41 | Skitty | Pokémon · Colourless | ENABLED | Attacks: Tail Whap, Feint Attack. Powers/Bodies: —. |
| 42 | Wartortle | Pokémon · Water | ENABLED | Attacks: Bubble, Tackle. Powers/Bodies: —. |
| 43 | Wartortle | Pokémon · Water | ENABLED | Attacks: Tail Whip, Bite. Powers/Bodies: —. |
| 44 | Aron | Pokémon · Metal | ENABLED | Attacks: Flail. Powers/Bodies: —. |
| 45 | Bulbasaur | Pokémon · Grass | ENABLED | Attacks: Tackle, Poisonpowder. Powers/Bodies: —. |
| 46 | Bulbasaur | Pokémon · Grass | ENABLED | Attacks: Growth, Vine Whip. Powers/Bodies: —. |
| 47 | Cacnea | Pokémon · Grass | ENABLED | Attacks: Call for Family, Rising Lunge. Powers/Bodies: —. |
| 48 | Charmander | Pokémon · Fire | ENABLED | Attacks: Retaliate, Flame Tail. Powers/Bodies: —. |
| 49 | Charmander δ | Pokémon · Lightning | ENABLED | Attacks: Scratch, Bite. Powers/Bodies: —. |
| 50 | Diglett | Pokémon · Fighting | ENABLED | Attacks: Mud Slap, Sand Pit. Powers/Bodies: —. |
| 51 | Duskull | Pokémon · Psychic | ENABLED | Attacks: Collect, Super Psy Bolt. Powers/Bodies: —. |
| 52 | Electrike | Pokémon · Lightning | ENABLED | Attacks: Sniff Out, Quick Blow. Powers/Bodies: —. |
| 53 | Jigglypuff | Pokémon · Colourless | ENABLED | Attacks: Hypnoblast. Powers/Bodies: —. |
| 54 | Krabby | Pokémon · Water | ENABLED | Attacks: Vital Pinchers. Powers/Bodies: —. |
| 55 | Lotad | Pokémon · Water | ENABLED | Attacks: Rolling Tackle. Powers/Bodies: Aqua Lift. |
| 56 | Meditite | Pokémon · Fighting | ENABLED | Attacks: Kick, Pure Power. Powers/Bodies: —. |
| 57 | Mudkip | Pokémon · Water | ENABLED | Attacks: Mud Slap. Powers/Bodies: Submerge. |
| 58 | Mudkip | Pokémon · Water | ENABLED | Attacks: Nap, Waterfall. Powers/Bodies: —. |
| 59 | Numel | Pokémon · Fire | ENABLED | Attacks: Take Down. Powers/Bodies: —. |
| 60 | Seedot | Pokémon · Grass | ENABLED | Attacks: Headbutt. Powers/Bodies: —. |
| 61 | Spearow | Pokémon · Colourless | ENABLED | Attacks: Spearhead. Powers/Bodies: —. |
| 62 | Spoink | Pokémon · Psychic | ENABLED | Attacks: Psywave, Ram. Powers/Bodies: —. |
| 63 | Squirtle | Pokémon · Water | ENABLED | Attacks: Bite, Skull Bash. Powers/Bodies: —. |
| 64 | Squirtle | Pokémon · Water | ENABLED | Attacks: Bubblebeam. Powers/Bodies: Solid Shell. |
| 65 | Torchic | Pokémon · Fire | ENABLED | Attacks: Claw. Powers/Bodies: —. |
| 66 | Torchic | Pokémon · Fire | ENABLED | Attacks: Sand Attack. Powers/Bodies: —. |
| 67 | Treecko | Pokémon · Grass | ENABLED | Attacks: Paralyzing Gaze, Scratch. Powers/Bodies: —. |
| 68 | Treecko δ | Pokémon · Psychic | ENABLED | Attacks: Pound, Shining Claws. Powers/Bodies: —. |
| 69 | Whismur | Pokémon · Colourless | ENABLED | Attacks: Supersonic, Hyper Voice. Powers/Bodies: —. |
| 70 | Wingull | Pokémon · Water | ENABLED | Attacks: Wing Attack. Powers/Bodies: —. |
| 71 | Bill's Maintenance | Trainer · Trainer | ENABLED | You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends,  |
| 72 | Castaway | Trainer · Trainer | ENABLED | You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends,  |
| 73 | Celio's Network | Trainer · Trainer | ENABLED | You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends,  |
| 74 | Cessation Crystal | Trainer · Trainer | ENABLED | Attach Cessation Crystal to 1 of your Pokémon (excluding Pokémon-ex) that doesn't already have a Pokémon Tool attached to it. If t |
| 75 | Crystal Beach | Trainer · Trainer | ENABLED | This card stays in play when you play it. Discard this card if another Stadium card comes into play. If another card with the same |
| 76 | Crystal Shard | Trainer · Trainer | ENABLED | Attach Crystal Shard to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, |
| 77 | Double Full Heal | Trainer · Trainer | ENABLED | Remove all Special Conditions from each of your Active Pokémon. |
| 78 | Dual Ball | Trainer · Trainer | ENABLED | Flip 2 coins. For each heads, search your deck for a Basic Pokémon card, show it to your opponent, and put it into your hand. Shuf |
| 79 | Holon Circle | Trainer · Trainer | ENABLED | This card stays in play when you play it. Discard this card if another Stadium card comes into play. If another card with the same |
| 80 | Memory Berry | Trainer · Trainer | ENABLED | Attach Memory Berry to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out,  |
| 81 | Mysterious Shard | Trainer · Trainer | ENABLED | Attach Mysterious Shard to 1 of your Pokémon (excluding Pokémon-ex) that doesn't already have a Pokémon Tool attached to it. If th |
| 82 | Poké Ball | Trainer · Trainer | ENABLED | Flip a coin. If heads, search your deck for a Basic Pokémon or Evolution card, show it to your opponent, and put it into your hand |
| 83 | PokéNav | Trainer · Trainer | ENABLED | Look at the top 3 cards of your deck, and choose a Basic Pokémon, Evolution card, or Energy card. Show it to your opponent and put |
| 84 | Warp Point | Trainer · Trainer | ENABLED | Your opponent switches 1 of his or her Defending Pokémon with 1 of his or her Benched Pokémon, if any. You switch 1 of your Active |
| 85 | Windstorm | Trainer · Trainer | ENABLED | Choose up to 2 in any combination of Pokémon Tool cards and Stadium cards in play (both yours and your opponent's) and discard the |
| 86 | Energy Search | Trainer · Trainer | ENABLED | Search your deck for a basic Energy card, show it to your opponent, and put it into your hand. Shuffle your deck afterward. |
| 87 | Potion | Trainer · Trainer | ENABLED | Remove 2 damage counters from 1 of your Pokémon (remove 1 damage counter if that Pokémon has only 1). |
| 88 | Double Rainbow Energy | Energy · Special Energy | ENABLED | Double Rainbow Energy can be attached only to an Evolved Pokémon (excluding Pokémon-ex). While in play, Double Rainbow Energy prov |
| 89 | Aggron ex | Pokémon · Metal | ENABLED | Attacks: Split Bomb, Mega Burn. Powers/Bodies: Intimidating Armor. |
| 90 | Blaziken ex | Pokémon · Fighting | ENABLED | Attacks: Drag Off, Burn Away. Powers/Bodies: —. |
| 91 | Delcatty ex | Pokémon · Colourless | PARTIAL | Attacks: Upstream, Tail Slap. Powers/Bodies: Constrain. **UNSUPPORTED:** Constrain must let both sides choose hand discards down to six; Upstream must return exact physical Energy to top/deck. |
| 92 | Exploud ex | Pokémon · Colourless | ENABLED | Attacks: Derail, Hyper Tail. Powers/Bodies: Extra Noise. |
| 93 | Groudon ex | Pokémon · Fighting | ENABLED | Attacks: Power Blast. Powers/Bodies: Hard Rock. |
| 94 | Jirachi ex | Pokémon · Psychic | ENABLED | Attacks: Shield Beam, Super Psy Bolt. Powers/Bodies: Star Light. |
| 95 | Kyogre ex | Pokémon · Water | ENABLED | Attacks: Hydro Shot. Powers/Bodies: Flotation. |
| 96 | Sceptile ex δ | Pokémon · Psychic | ENABLED | Attacks: Power Revenge. Powers/Bodies: Extra Liquid. |
| 97 | Shiftry ex | Pokémon · Darkness | ENABLED | Attacks: Target Attack, Blade Arms. Powers/Bodies: Dark Eyes. |
| 98 | Swampert ex | Pokémon · Water | PARTIAL | Attacks: Ultra Pump. Powers/Bodies: Energy Recycle. **UNSUPPORTED:** Energy Recycle must choose exactly three discarded Energy and assign attachments, ending turn; Ultra Pump needs optional two-hand-card discard and Bench target. |
| 99 | Alakazam ★ | Pokémon · Psychic | PARTIAL | Attacks: Psychic Select, Skill Copy. Powers/Bodies: —. **UNSUPPORTED:** Psychic Select must retrieve any card from real discard; Skill Copy must discard selected hand Pokémon, choose legal attack, pay cost. |
| 100 | Celebi ★ | Pokémon · Grass | PARTIAL | Attacks: Leaf Shade. Powers/Bodies: Time Travel. **UNSUPPORTED:** Time Travel KO replacement must offer optional coin flip, remove attachments, and replace prize knockout with bottom-of-deck return. |
