# LuckyDex v0.69.178 — EX Team Rocket Returns Classic TCG

Base: v0.69.177. Extract this ZIP into the canonical `~/lucky-dex/source/` directory, preserving its paths, commit and push there. It is an incremental source patch, not a standalone APK or complete source archive.

- 111 original 2004 set records, including 97 Pokémon, 12 Trainers and two Special Energy cards. 166 printed attacks: 165 on Pokémon plus 1 borrowed Stadium attack on Rocket's Tricky Gym.
- 41 printed Poké-Powers/Bodies retained with original text. 11 original Rocket's Pokémon-ex use two Prize cards on KO. Mudkip, Torchic and Treecko Pokémon ★ are individually available but limited to one Pokémon ★ per deck.
- Fully wired to player Classic card filters, unrestricted Test Lab catalogue, normal Classic auto-building and CPU-only expansion generation.
- Dark/Rocket card synergy metadata and original dual typing preserved; special R Energy only attaches to Dark/Rocket Pokémon, provides two Darkness, boosts attack damage by 10 and expires at the end of its owner's turn. Dark Metal Energy counts as one wildcard Darkness/Metal, not two Energy.
- Key live interactions implemented and outcome-tested: Rocket's Hideout HP, Rocket's Tricky Gym attack, Dark Crobat's spread/heal, Dark Tyranitar's scaling/spread, Dark Houndoom's optional discard, Piloswine's optional self-damage, Kingdra's opponent Energy discards, Dark Electrode's Energy transfer, selected damage from Rocket's Entei ex and Rocket's Zapdos ex, Sneasel ex's Drag Off order, Holy Shield and Dragon Veil protection.
- Preserves existing mono-type auto-builder and CPU benching changes, and the separate Test Lab deck libraries.

Automated verification: 108/108 across new expansion outcomes, FRLG, Hidden Legends, prior EX sets and deck-builder regressions. Attack execution across two seeded paths was checked for all 165 Pokémon attacks and the Stadium attack was exercised separately. This does not establish perfect accuracy of every complex cross-set Power, Trainer or Pokémon interaction; Android testing and the usual post-release outcomes audit remain important.
