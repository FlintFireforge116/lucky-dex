# Platinum—Arceus v0.69.276: effects and integration pass

## Provenance and status

- All **111 original English collector prints** are generated from the pinned upstream `pl4.json` archive (#1–99, AR1–AR9 and SH10–SH12). The generator checks the exact immutable Git blob SHA `2cbff9e0d363c2fc516328bd03aada50c4d99373` and rejects substituted data.
- The local development environment cannot fetch that archive; `scripts/prepare-arceus.sh` must download it on the user device, regenerate the source-backed card asset, and run both focused suites **before** committing and building. No synthetic archive may be committed.
- **111 registered does not by itself mean 111 battle-certified.** `pl4.coverage()` and `build-arceus.py` show which prints remain gated for unknown secondary effects. Any such cards are visible in the collection but forbidden from deck building and CPU selection, until verified. The build and Android gameplay have not been validated here.

## Effect implementation coverage

The second pass adds dedicated, source-specific effect logic for the cards requiring more than the existing generic actions:

- Charizard Fire Formation and Fire Wing/Burning Tail; Froslass Snow Gift; Heatran Magma Mantle; Kabutops Primal Scythe and two different Rock Slide targets; Luxray Gadget Bolt; Salamence Top Accelerator; Swalot Damage Roller and Entangle Tackle; Tangrowth heal/HP checks; Zapdos G Lightning Strike.
- Raticate Recruit performs the physical opponent-hand Supporter discard and uses the actual chosen Supporter effect. Luxio Discharge counts/discards attached Lightning Energy and flips once per card. Pelipper Water Ball, Ponyta Ascension, Shelgon Dragon Bump, Beedrill G Raid and Nosepass Harden have pre-damage/timed implementation. Geodude Stone Barrage uses the engine's supported until-tails coin-damage path.
- Choice-driven Powers/attacks include Gengar Curse, Aerodactyl Unearth, Lopunny Relaxing Shower, Omastar Time Spiral, Pichu Baby Steps, Porygon-Z G Dowsing Code, Sceptile Leaf Supply, Spiritomb Darkness Grace and Arceus LV.X effects. Tangrowth LV.X Big Growth lets the player repeat actual discarded Grass Energy and target selections, with an explicit Done action.
- Trainers: Beginning Door and Department Store Girl search; Energy Restore three coin flips and actual recoveries; Professor Oak's Visit puts a selected hand card on bottom of deck. Bench Shield, Buffer Piece, Expert Belt and Lucky Egg apply their printed protections, HP/damage, Prize and knockout draw effects.
- Old Amber, Dome Fossil and Helix Fossil are playable fossil cards, with Dome/Helix appropriate hand-attached type triggers and valid selected evolution cards. The builder must only include a Fossil when it has a direct compatible evolution line.
- Ultimate Zone offers repeated moves of a physically attached Energy card from own Bench to Active Arceus. Arceus AR5 Ripple Swell requires exactly **six Arceus of six distinct types** in play, and Sky Spear sends its Energy to the **Lost Zone**, not the discard. The existing Classic board has insufficient default Bench capacity for Ripple Swell; never reduce the authentic prerequisite.
- Arceus LV.X previous-level types and attacks are retained; #94 Omniscient borrows attacks of other Arceus in play, with the required attack costs. Salamence LV.X Double Fall and Expert Belt extra Prize handling apply in the actual knockout flow.

## Independent gates and testing

- `node --test tests/v07276-arceus-completion.test.cjs tests/v07273-supreme-victors-completion.test.cjs`: 32 / 32 tests passed locally.
- Static JavaScript and Python syntax validation passed.
- The authenticated `v07275` catalogue, full-set CPU and cross-set battle tests cannot run locally without the original print archive. They run from the Termux preparation script and as a GitHub build prerequisite.
- Test Lab, physical phone interactions, final GitHub APK generation, all unusual copied-Supporter effects, and the six-Arceus stadium configuration still require interactive QA. Avoid claims that these were tested.

## Install v0.69.276

Extract into `source/`, not the repository root, preserving the unpacked canonical source:

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.276_ARCEUS_STAGE2.zip -d source
sh source/scripts/prepare-arceus.sh
git add source
git commit -m "LuckyDex v0.69.276 Arceus completion effects"
git push origin main
```

Requires the previously installed v0.69.275 stage-1 source. Do not use Codex without user request.
