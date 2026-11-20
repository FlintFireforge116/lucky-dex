# LuckyDex v0.69.319 — Legendary Treasures (BW11)

## Scope and print identity

- Final Black & White expansion; **115 numbered collector prints and 25 Radiant Collection prints**, 140 total.
- Source: immutable `PokemonTCG/pokemon-tcg-data` Git blob `e4e09d569e76c71943e2399221c9f904b4420096` (`cards/en/bw11.json`). Source checks **220 attacks** and **19 printed Abilities**.
- Original IDs are `bw11-1`…`bw11-115`, and Radiant Collection prints `bw11-RC1`…`bw11-RC25`. Never merge a Radiant Collection print into a regular one.
- `app/build.gradle` generates `data/classic/bw11-print-compact.json` and the complete `tcg-classic-legendary-treasures.js` **automatically before APK asset merge**. The ZIP contains a safe placeholder which is replaced by this generated asset. No manual preparation step is required; the GitHub runner must have internet access to fetch the pinned Git blob on its first run.
- Generator writes `docs/BW11_BUILD_COVERAGE.json` with the actual battle-ready/gated numbers. Do not infer the final battle-ready count from catalogue registration.

## Battle mechanics and unique risks

- Existing effects reused where printed text matches, otherwise BW11-specific resolution is used with choices for Energy and targeted damage. Non-empty printed text without a supported effect **disables that print**; it never silently becomes a no-op.
- Pre-Weakness calculation for X Ball, Outrage, Hydro Pump, Energy Press, Gaia Blaster, Round, Prize scaling and other BW11 moves; Double Colorless Energy is one physical card providing two Colorless energy units.
- Mew-EX Radiant Collection `RC24` Versatile uses existing copied-attack logic while still checking actual payable costs.
- Lugia-EX #102 Overflow grants an extra Prize on a KO caused by its attack; Plasma Gale requires a physical Plasma Energy attached, so a BW11-only deck cannot assume Basic Energy Zone makes it work.
- Garbotoxin #68, Smooth Coat #105/RC19, Safeguard #66, Leaf Tailor #12, Royal Heal #8, Royal Garden RC3, Dark Cloak #88 and Magic Room #72 have ongoing global handling, with suppression/attachment conditions respected.
- Rare ability/choice mechanics intentionally gated until proper interaction: Victini #23 Victory Star (whole attack coin reroll), Xatu #56 Fortunate Draw (rock-paper-scissors), Cedric Juniper #110 (blinded height guess), Ursaring RC16 (Picnic Weather), Spiritomb #87 (bilateral ACE SPEC lock), Lucario #80 (post-damage Reflexive Retaliation), Druddigon #106 (post-damage Rough Skin).
- Other prints are gated by the generator if printed attack/Ability text remains unsupported. `BW11_BUILD_COVERAGE.json` will enumerate them; this is a FIRST INTEGRATION, not a 140/140 certification.

## CPU and deck integrity

- New BW11 single-set recovery uses only owned BW11 prints, 14 Pokemon + 16 distinct-support/Special Energy card slots, staying within 4-copy caps, 30 cards and zero ACE SPEC overflow. No orphan evolutions; Darkness option includes matching Zorua/Zoroark line.
- The recovery is a last resort only. Normal player builds and all earlier sets retain their normal builder.
- Special Energy such as Double Colorless never becomes an imaginary Basic Energy from the zone. Special printed Plasma-energy payoff must be considered before putting Lugia-EX into a deck.

## Testing and build status

- BW10 regression suite and BW11 targeted suite: **33 passed, 0 failed, 2 skipped** locally; the two skips are *official generated-source* coverage and CPU recovery checks.
- Separately, a synthetic 140-print fixture validated the generator shape and BW11 CPU recovery for all ten supported types, **8/8 checks**. That fixture was removed and is **NOT included** in the ZIP. It is not evidence of official 140-print rules coverage.
- Node syntax and Python compilation checks pass. ZIP structure is verified for `unzip -d source` installation.
- **GitHub APK compilation and official-source coverage are not yet confirmed**. If the pinned-source network fetch or any test fails, do not bypass the gate; fix it and retain honest coverage counts.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.319_BW11_LEGENDARY_TREASURES.zip -d source
git add source
git commit -m "LuckyDex v0.69.319 Legendary Treasures integration"
git push origin main
```
