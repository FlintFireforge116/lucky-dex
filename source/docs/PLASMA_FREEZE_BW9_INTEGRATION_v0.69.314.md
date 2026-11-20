# LuckyDex v0.69.314 — Plasma Freeze (BW9) integration and verification

## Data provenance and catalogue

- Pokémon TCG Plasma Freeze (BW9), 122 English collector prints, including six secret rares.
- Pinned PokémonTCG/pokemon-tcg-data Git blob: `b659099a0445bab44b1a7df61a70d83bc13895a0`.
- `data/classic/bw9-print-compact.json` is bundled with this patch so the Android build can regenerate the complete source offline.
- `python3 scripts/build-bw9.py` deterministically generates `app/src/main/assets/tcg-classic-plasma-freeze.js` and `docs/BW9_BUILD_COVERAGE.json`.
- 122 registered, 175 printed attacks, 17 printed abilities; 119 prints battle-enabled and deck-eligible.

## Implemented mechanics (targeted source and regression coverage)

- Team Plasma classification, Plasma Energy as a physical Special Energy across BW8/BW9, Team Plasma Badge, Team Plasma Ball, Frozen City Stadium, Shadow Triad, Ghetsis and Superior Energy Retrieval.
- Global Abilities: Deoxys-EX Power Connect (pre-Weakness active damage boost), Mr. Mime Bench Barrier, Umbreon Dark Shade (HP), Glaceon Freeze Zone (retreat cost), Quagsire Laid-Back, Latias-EX Bright Down and Sigilyph Safeguard.
- Pokémon Tools and ACE SPEC restrictions: Float Stone, Life Dew Prize reduction, Rock Guard retaliatory damage, Tool/Battle interactions.
- Attacks: Weavile Hail hits opposing Active **and** Bench, Seismitoad hits both Benches, attacker lock rules persist on the relevant **player**, cross-set Plasma Energy checks retain original card UID, and a broad set of ability/attack-specific mappings.
- Deck builder selects legal 30-card lists, with full evolution lines, Energy and ACE SPEC caps. BW8/BW9 Plasma Energy-dependent cores now reserve physical Plasma Energy cards instead of relying on Basic Colorless Zone; Quagsire Mud Gun conditional Fighting Energy is tracked.

## Intentionally gated cards pending exact implementation

These collector prints exist with authentic metadata, card art and texts but cannot enter playable/CPU decks until their complex printed rules are fully supported:

1. `bw9-4` Exeggcute — Propagation: activating an Ability **from discard pile** requires dedicated zone UI, action legality, and hand move.
2. `bw9-56` Cofagrigus — Six Feet Under: self-KO plus **optional 3 damage-counter distribution** across targets in a single Ability and KO/prize sequencing.
3. `bw9-94` Kecleon — Imittack: present defending Pokémon's attack choices, check copied attack Energy costs, then execute the copied effect correctly.

Never silently enable a no-op in place of one of these effects. Additional manually untested printed mechanics must be added to the audit ledger before claiming full fidelity.

## Verification scope

- Locally verified generator, six JavaScript module syntax checks, and **108/108 tests passing** across eight BW6/BW7/BW8/BW9 suites (`node --test --test-concurrency=2 ...`). The new BW9 suite passed **12/12** and validated **180/180** legal 30-card CPU decks across nine type choices.
- New BW9 test suite includes source print count/gating, card registration and metadata, core Team Plasma/ACE SPEC mechanics, and deterministic 30-card CPU stress builds across types/seeds.
- **Not** a full human-versus-CPU emulator gameplay simulation for all 175 attacks; some complex interaction paths remain manual-audit candidates.
- Android APK has **not** been built or verified in this environment. The GitHub build gate runs BW9 tests before the Android assets are merged; user should confirm its result.

## Installation

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.314_BW9_PLASMA_FREEZE.zip -d source
git add source
git commit -m "LuckyDex v0.69.314 Plasma Freeze integration"
git push origin main
```

Optional local check: `cd ~/lucky-dex/source && sh scripts/prepare-bw9.sh`. No first-time web fetch needed because the pinned source is inside the ZIP.
