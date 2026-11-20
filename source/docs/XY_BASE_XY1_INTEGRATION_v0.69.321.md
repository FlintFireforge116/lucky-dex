# LuckyDex v0.69.321 — XY Base first-pass integration

Date: 20 November 2026  
Base: v0.69.320 Legendary Treasures audit

## Verified published source

- Set: XY Base (`xy1`), original 5 February 2014 release.
- Official source: `PokemonTCG/pokemon-tcg-data/cards/en/xy1.json`, pinned immutable Git blob `0f709a58e008e0de36e02bc11f7a070607e17b31`.
- **146 collector prints**: 120 Pokémon, 15 Trainers, and 11 Energy, including nine Basic Energy types, Double Colorless Energy and Rainbow Energy.
- **202 printed attacks and 12 printed Abilities**. All print IDs are preserved, including six full-art cards (`141–146`).
- `M Venusaur-EX` #2 and `M Blastoise-EX` #30 are Mega Evolution prints, each evolving from its corresponding Pokémon-EX and awarding two Prizes upon KO.

## Rules newly integrated

- Basic Fairy Energy is a ninth typed Basic Energy option in the Classic Energy Zone (`Y`). Evolution/attack costs, typed-energy metadata and weakness all retain the published Fairy type.
- Mega Evolution from hand ends the player's current turn immediately; no additional attack/action on that turn.
- Fairy Garden grants free Retreat to a Pokémon holding Fairy-providing Energy on either side; Shadow Circle disables Weakness for Pokémon with Darkness-providing Energy on either side.
- Hard Charm reduces opposing attack damage by 20 after Weakness/Resistance to Active or Benched holder; Muscle Band adds 20 to the opposing Active before Weakness; Furfrou's Fur Coat reduces damage by 20.
- Sweet Veil prevents Special Conditions for holders of Fairy-providing Energy and removes existing conditions when the Ability activates. This depends on Ability suppression.
- Rainbow Energy remains one UID-bearing physical Special Energy card; attaching it from hand places one damage counter on its Pokémon; Double Colorless supplies two Colorless units as one physical card.
- Exact UID-preserving selection paths for Great Ball, Max Revive, Professor's Letter, Water Shuriken, Fairy Transfer, Y Cyclone and targeted Trainer Energy discard/healing. Metal Wallop records and applies the next-own-turn bonus only in the appropriate turn.
- Spiky Shield retaliates for 30 damage after a damaging opposing attack, even when Chesnaught itself is KO'd.
- Normal CPU autobuild remains authoritative. A sparse XY-only recovery fallback can make 30-card legal decks only from genuinely owned, enabled XY prints, with Basic Pokémon, typed Energy planning, copy limits and actual Trainer/Special Energy cards. It never overrides manual or featured builds.

## Conservative battle-ready policy

The generator records all 146 collector prints even if a mechanic is still incomplete. A card is only **battle-enabled** if **every** printed attack, Ability and Trainer effect has a supported mapping. Partially implemented prints are excluded from player/CPU deck selection; gates and exact reasons are written into `docs/XY1_BUILD_COVERAGE.json` by GitHub generation.

Outstanding printed mechanics include conditional multi-target Energy assignment, both-sided Rapid Spin, damage-threshold Harden, full Stance Change, Geomancy choosing two distinct recipients, multi-coin discard continuation, Evosoda deck evolution, and Cassius returning an entire physical stack. More may be identified by generation because unknown printed text is gated by default. **Do not infer the final playable-card count until the pinned official source is generated.**

## Verification and install

- Directly mapped XY effect schemas checked: **127/127 valid**.
- Offline fixture (clearly synthetic and excluded from release ZIP) checked 146-print integration, generation, Mega end-turn, Fairy Energy and 30-card CPU recovery: **13/13 passed**.
- A separate local pass against the actual workspace with *no source fixture* exercises independent mechanics and skips source-dependent checks. GitHub Actions runs the full 146-print checks after generation; no manual preparation script is required.
- `:app:generateXY1ForApk` depends on the previous BW11 gate; `:app:auditXY1ForApk` runs `tests/v07321-xy-base.test.cjs` after the official source is generated; APK preBuild/asset merge depends on this gate.
- **No actual Android APK compilation or on-device test was performed locally.** Official 146-print effects require further dedicated card-by-card audit after successful build.

### Phone installation

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.321_XY_BASE.zip -d source

git add source
git commit -m "LuckyDex v0.69.321 XY Base integration"
git push origin main
```
