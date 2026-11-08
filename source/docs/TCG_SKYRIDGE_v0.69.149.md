# LuckyDex v0.69.149 — Skyridge mechanics pass

Base: v0.69.148. This is an **incremental source patch**, not a replacement application bundle.

## Progress

- Skyridge card identities retained: **182/182** (150 numbered and 32 holo).
- Battle-ready/deck-eligible: **104/182**, up from 54/182.
- Pending/unavailable for auto-builder and opponents: **78/182**, kept explicitly gated.
- Deck builders, ownership, artwork and the existing set selector remain intact.
- Android version name `0.69.149`, code `7129`; both start-screen labels and JS marker match.

## Mechanic additions and corrections

- Exact choice paths: Drag Off, optional Metal Tail, Warp Hole, Strange Spiral, Good Neighbor, Nidoran's Call for Family, Rattata's Call for Friends, Venusaur-era typed Energy interactions and player status selection.
- Variable damage and area attacks: Eruption, Zzzap, Trample, Max Voltage, Continuous Charge, Return Attack, Energy Burst, Gift of Spite, Do the Wave, Lonely Fang and other new attacks.
- Skyridge shared passives: Machamp Immunity, Kabutops Primal Aura, Omastar Primal Stare, Steelix Rare Metal, Ditto Prismatic Body, Xatu Synchronicity, Dunsparce Slippery Skin, Articuno/Moltres hand attachment restrictions and conditional damage reduction.
- Corrected cross-set effect dispatch for Skyridge Starmie's Core Blast, and extended old eligibility tests to recognise newly supported cards.
- Preserved the separate generated Energy Zone and original printed card text; unresolved effects do not masquerade as supported.

## Automated checks

- `node --test source/tests/v0714{1,2,3,4,5,6,7,8,9}-*.test.cjs`: **112 passing, 0 failing**.
- Node syntax checks for Skyridge module, battle core and battle effects passed.
- Android device/APK tests not performed.

## Remaining explicitly gated cards

The following prints are still displayed in the catalogue but excluded from playable decks until supported. Holo variants of blocked numbered prints are also gated.

- ecard3-1 Aerodactyl: Poké-Power / Poké-Body pending: Ancient Wind; Complex printed ability requires battle hooks: Ancient Wind
- ecard3-2 Alakazam: Poké-Power / Poké-Body pending: Energy Jump
- ecard3-3 Arcanine: Unimplemented printed attack: Shake; Unimplemented printed attack: White Flames; Poké-Power / Poké-Body pending: Energy Recharge; Complex printed ability requires battle hooks: Energy Recharge
- ecard3-4 Articuno: Unimplemented printed attack: Freeze Solid; Unimplemented printed attack: Ice Cyclone
- ecard3-5 Beedrill: Unimplemented printed attack: Needle Rush; Poké-Power / Poké-Body pending: Venom Spray; Complex printed ability requires battle hooks: Venom Spray
- ecard3-6 Crobat: Poké-Power / Poké-Body pending: Carry Off; Complex printed ability requires battle hooks: Carry Off
- ecard3-8 Flareon: Unimplemented printed attack: Burn Booster; Poké-Power / Poké-Body pending: Self-healing; Complex printed ability requires battle hooks: Self-healing
- ecard3-9 Forretress: Unimplemented printed attack: Spinning Blow; Unimplemented printed attack: Scatterbomb
- ecard3-10 Gengar: Poké-Power / Poké-Body pending: Manipulate; Complex printed ability requires battle hooks: Manipulate
- ecard3-11 Gyarados: Unimplemented printed attack: Dragon's Vengeance; Poké-Power / Poké-Body pending: Flame Vapor; Complex printed ability requires battle hooks: Flame Vapor
- ecard3-13 Jolteon: Unimplemented printed attack: Thunderspark; Poké-Power / Poké-Body pending: Self-healing; Complex printed ability requires battle hooks: Self-healing
- ecard3-18 Magcargo: Unimplemented printed attack: Crushing Lava; Poké-Power / Poké-Body pending: Streaming Mantle; Complex printed ability requires battle hooks: Streaming Mantle
- ecard3-19 Magneton: Unimplemented printed attack: Electric Blast; Poké-Power / Poké-Body pending: Attract Energy; Complex printed ability requires battle hooks: Attract Energy
- ecard3-20 Magneton: Unimplemented printed attack: Bounce Off
- ecard3-21 Moltres: Unimplemented printed attack: Collect Fire; Unimplemented printed attack: Burning Tail
- ecard3-22 Nidoqueen: Poké-Power / Poké-Body pending: Evolution Helper; Complex printed ability requires battle hooks: Evolution Helper
- ecard3-25 Politoed: Unimplemented printed attack: Sudden Growth; Unimplemented printed attack: Energy Splash
- ecard3-28 Raikou: Unimplemented printed attack: Lightning Sphere; Poké-Power / Poké-Body pending: Pure Body; Complex printed ability requires battle hooks: Pure Body
- ecard3-30 Starmie: Unimplemented printed attack: Star Back
- ecard3-32 Umbreon: Poké-Power / Poké-Body pending: Dark Gaze; Complex printed ability requires battle hooks: Dark Gaze
- ecard3-33 Vaporeon: Unimplemented printed attack: Aqua Trick; Poké-Power / Poké-Body pending: Self-healing; Complex printed ability requires battle hooks: Self-healing
- ecard3-38 Machoke: Unimplemented printed attack: Focus Energy
- ecard3-40 Noctowl: Poké-Power / Poké-Body pending: Investigate; Complex printed ability requires battle hooks: Investigate
- ecard3-41 Omanyte: Unimplemented printed attack: Water of Evolution; Unimplemented printed attack: Drag Off
- ecard3-42 Persian: Unimplemented printed attack: Surprise Slash
- ecard3-45 Wobbuffet: Poké-Power / Poké-Body pending: Mirror Coat; Complex printed ability requires battle hooks: Mirror Coat
- ecard3-47 Buried Fossil: Poké-Power / Poké-Body pending: Reconstruction; Complex printed ability requires battle hooks: Reconstruction
- ecard3-48 Cleffa: Unimplemented printed attack: Energy Recycle
- ecard3-58 Girafarig: Unimplemented printed attack: Energy Patch
- ecard3-63 Haunter: Unimplemented printed attack: Shadow Hand
- ecard3-76 Magnemite: Unimplemented printed attack: Magnetic Lines
- ecard3-78 Meowth: Unimplemented printed attack: Sudden Swipe
- ecard3-80 Natu: Unimplemented printed attack: Foresight
- ecard3-93 Sandslash: Unimplemented printed attack: Sand Trap
- ecard3-97 Skarmory: Unimplemented printed attack: Spinning Head
- ecard3-102 Stantler: Unimplemented printed attack: Threaten; Unimplemented printed attack: Antler Swipe
- ecard3-105 Sunflora: Unimplemented printed attack: Energy Plant
- ecard3-119 Ancient Ruins: Printed Trainer interaction requires battle implementation
- ecard3-122 Crystal Shard: Printed Trainer interaction requires battle implementation
- ecard3-123 Desert Shaman: Printed Trainer interaction requires battle implementation
- ecard3-126 Friend Ball: Printed Trainer interaction requires battle implementation
- ecard3-127 Hyper Potion: Printed Trainer interaction requires battle implementation
- ecard3-129 Miracle Sphere α: Printed Trainer interaction requires battle implementation
- ecard3-130 Miracle Sphere β: Printed Trainer interaction requires battle implementation
- ecard3-131 Miracle Sphere γ: Printed Trainer interaction requires battle implementation
- ecard3-132 Mirage Stadium: Printed Trainer interaction requires battle implementation
- ecard3-133 Mystery Plate α: Printed Trainer interaction requires battle implementation
- ecard3-134 Mystery Plate β: Printed Trainer interaction requires battle implementation
- ecard3-135 Mystery Plate γ: Printed Trainer interaction requires battle implementation
- ecard3-136 Mystery Plate δ: Printed Trainer interaction requires battle implementation
- ecard3-137 Mystery Zone: Printed Trainer interaction requires battle implementation
- ecard3-138 Oracle: Printed Trainer interaction requires battle implementation
- ecard3-139 Star Piece: Printed Trainer interaction requires battle implementation
- ecard3-140 Underground Expedition: Printed Trainer interaction requires battle implementation
- ecard3-141 Underground Lake: Printed Trainer interaction requires battle implementation
- ecard3-142 Bounce Energy: Printed Special Energy attachment and trigger rules not yet implemented
- ecard3-143 Cyclone Energy: Printed Special Energy attachment and trigger rules not yet implemented
- ecard3-144 Retro Energy: Printed Special Energy attachment and trigger rules not yet implemented
- ecard3-H1 Alakazam: Poké-Power / Poké-Body pending: Energy Jump
- ecard3-H2 Arcanine: Unimplemented printed attack: Shake; Unimplemented printed attack: White Flames; Poké-Power / Poké-Body pending: Energy Recharge; Complex printed ability requires battle hooks: Energy Recharge
- ecard3-H3 Articuno: Unimplemented printed attack: Freeze Solid; Unimplemented printed attack: Ice Cyclone
- ecard3-H4 Beedrill: Unimplemented printed attack: Needle Rush; Poké-Power / Poké-Body pending: Venom Spray; Complex printed ability requires battle hooks: Venom Spray
- ecard3-H5 Crobat: Poké-Power / Poké-Body pending: Carry Off; Complex printed ability requires battle hooks: Carry Off
- ecard3-H7 Flareon: Unimplemented printed attack: Burn Booster; Poké-Power / Poké-Body pending: Self-healing; Complex printed ability requires battle hooks: Self-healing
- ecard3-H8 Forretress: Unimplemented printed attack: Spinning Blow; Unimplemented printed attack: Scatterbomb
- ecard3-H9 Gengar: Poké-Power / Poké-Body pending: Manipulate; Complex printed ability requires battle hooks: Manipulate
- ecard3-H10 Gyarados: Unimplemented printed attack: Dragon's Vengeance; Poké-Power / Poké-Body pending: Flame Vapor; Complex printed ability requires battle hooks: Flame Vapor
- ecard3-H12 Jolteon: Unimplemented printed attack: Thunderspark; Poké-Power / Poké-Body pending: Self-healing; Complex printed ability requires battle hooks: Self-healing
- ecard3-H17 Magcargo: Unimplemented printed attack: Crushing Lava; Poké-Power / Poké-Body pending: Streaming Mantle; Complex printed ability requires battle hooks: Streaming Mantle
- ecard3-H18 Magneton: Unimplemented printed attack: Electric Blast; Poké-Power / Poké-Body pending: Attract Energy; Complex printed ability requires battle hooks: Attract Energy
- ecard3-H19 Magneton: Unimplemented printed attack: Bounce Off
- ecard3-H20 Moltres: Unimplemented printed attack: Collect Fire; Unimplemented printed attack: Burning Tail
- ecard3-H21 Nidoqueen: Poké-Power / Poké-Body pending: Evolution Helper; Complex printed ability requires battle hooks: Evolution Helper
- ecard3-H23 Politoed: Unimplemented printed attack: Sudden Growth; Unimplemented printed attack: Energy Splash
- ecard3-H26 Raikou: Unimplemented printed attack: Lightning Sphere; Poké-Power / Poké-Body pending: Pure Body; Complex printed ability requires battle hooks: Pure Body
- ecard3-H28 Starmie: Unimplemented printed attack: Star Back
- ecard3-H30 Umbreon: Poké-Power / Poké-Body pending: Dark Gaze; Complex printed ability requires battle hooks: Dark Gaze
- ecard3-H31 Vaporeon: Unimplemented printed attack: Aqua Trick; Poké-Power / Poké-Body pending: Self-healing; Complex printed ability requires battle hooks: Self-healing
