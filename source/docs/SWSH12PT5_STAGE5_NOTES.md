# Crown Zenith stage 5 — v0.69.598

- All 160 main-set prints imported (194 attacks, 21 Abilities, 29 Trainers, 8 Basic Energy). 142 playable and 18 gated.
- Final 13 Pokémon records verified against the pinned GitHub catalogue (packet FNV-1a 200459038).
- Added 14 playable prints: Bidoof, Chatot, Regigigas V, Stoutland V, Yungoos, Greedent V, Wooloo, Dubwool, Pikachu, Mewtwo, Absol, Rotom VSTAR, Lycanroc and Tauros.
- Tauros #106's pinned data has an empty Adrena-Tackle damage value. The generated projection explicitly corrects it to 180; raw compact source and packet remain unchanged. Independent corroboration: https://bulbapedia.bulbagarden.net/wiki/Tauros_(Crown_Zenith_106), https://www.serebii.net/card/crownzenith/106.shtml and https://www.pokebeach.com/2023/01/crown-zenith-full-english-set-list. The attack does nothing at full HP. Both the corrected projection and outcome are tested.
- Remaining 18 gated prints require dedicated mechanisms. No Galarian Gallery import yet.
- Existing shared battle engine unchanged. Full Android compilation and device play remain external verification.
