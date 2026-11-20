# LuckyDex v0.69.302 — Noble Victories

**Scope:** Black & White expansion 3, **102 distinct collector prints**, including 5 full-art/secret extras. Requires the v0.69.301 Emerging Powers deep-audit source baseline.

## Contents

- Complete **102/102** printed card roster, **153 attacks**, and **12 Abilities** from the pinned local `data/classic/bw3-print-compact.json` catalog; no internet download needed at build time.
- Collection, set picker, deck builder, CPU set selector, printed card art and print variants wired into the existing Classic TCG engine.
- Noble Victories battle rules include Dynamotor, Victory Star, Solid Rock, Leaf Tailor, Dark Aura, Ancient Power, Cursed Body, Cursed Shadow, Rough Skin, Craftsmanship and Durable Body.
- Trainer rules include N, Super Rod, Rocky Helmet, Eviolite, Xtransceiver, Cover Fossil, Plume Fossil, and the original collectible prints.
- The Restored Pokémon **Tirtouga and Archen** can be put on the Bench only through the corresponding Fossil Item searching the **bottom seven cards**; they are not Basic Pokémon and cannot be played into setup directly. Their normal evolutions remain available.
- Discard retrieval follows the shared physical-discard-plus-Basic-Energy-ledger rules; neither attacks nor abilities fabricate Energy from the ordered supply.
- Exact choice menus and attack conditions for V-blast, V-create, Round, Core Cannon, Electrichain, Stored Power, Cursed Shadow and other new effects.
- Master rules updated in `docs/LUCKYDEX_MASTER_RULES.txt`.

## Verification performed locally

- **102/102 enabled**, no gated entries.
- **322/322** static smoke scenarios executed with no resolution exceptions.
- **0 catalog errors; 0 warnings**; **37 remaining static follow-up flags** (automated review prompts, not test failures).
- **16/16** sampled CPU decks valid; **108 additional CPU builds** checked for deck legality and evolution lines.
- **28 dedicated Noble Victories regression tests** and **183/183** recent-era regression tests pass (Triumphant through Noble Victories).

The Android APK compilation and live device gameplay have **not** yet been verified. A full independent print-by-print gameplay audit is still recommended after this initial integration.

## Termux (after downloading ZIP to Downloads)

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.302_BW3_NOBLE_VICTORIES.zip -d source
git add source
git commit -m "LuckyDex v0.69.302 Noble Victories complete set"
git push origin main
```
