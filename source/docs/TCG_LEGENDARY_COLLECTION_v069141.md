# LuckyDex v0.69.141 — Classic TCG: Legendary Collection (2002)

## Scope
- Add all **110 numbered Legendary Collection** (`base6`) reprints, each with its own card identity, rarity, artwork URLs and the original printed attack/Power signatures.
- Preserve existing `base1`, `base2`, `base3`, `base5`, Gym, Neo, Scarlet & Violet, and Pokémon Snap custom sets. Previously owned cards and decks retain their IDs.
- Reuse verified prior print mechanics when attacks and Pokémon Powers are identical. Legendary Collection Mewtwo #29 receives its own attacks.
- Register the expansion in the Classic catalogue, physical ownership projection, set filters, deck builder, opponent generator and battle UI.
- Restore the early initialisation of three damage-only Base Set cards needed to map exact reprints.

## Battle engine and existing-set repairs
- Dark Dragonite **Summon Minions**: two optional Basic Pokémon searches from deck and bench placements when evolved from hand.
- Dark Slowbro **Reel In**: retrieve up to three discarded Pokémon to hand on evolution.
- Dark Wartortle **Mirror Shell**: retaliate for actual incoming attack damage (even if the original hit knocks it out), once per hit.
- Legendary Mewtwo **Energy Control**: flip, attacker selects an opposing Basic Energy source and another opposing Pokémon destination; **Telekinesis** targets either opposing active or bench for 30 ignoring weakness/resistance.
- **Challenge!**: opponent accepts or declines; decline draws two, acceptance permits both players to select Basic Pokémon from their own decks, including the case where either player stops early.
- **The Boss's Way**: searches for a Dark-name evolution.
- **Full Heal Energy** and **Potion Energy**: provide a single Colorless Energy as Special Energy, respectively cure conditions or heal 10 when attached from hand.
- Corrected these mechanics for the corresponding original Team Rocket (`base5`) prints as well.
- Normalize apostrophes and symbol spacing of printed names in Classic evolution resolution and four-copy limits; avoid false duplicate permits and broken cross-print Nidoran evolution chains.
- Normalized text for 36 straightforward damage-only attacks that previously had no visible descriptions.

## Testing
`node --test tests/v07141-legendary-collection.test.cjs`

The focused suite checks registration, card availability, physical ownership, deck legality/copy limits, mixed-print evolution, effect choices, Special Energy attachments, retaliation, opponent acceptance/decline, randomized and competitive building, and CPU match completion. `lc.coverage()` reports 110 of 110 battle-enabled.

## Patch installation
Apply the patch at the **Git repository root**, not inside `source`, to retain all other canonical files. The ZIP contains `source/app/...`, `source/tests/...` and this note. Do not remove files not present in the patch.

In Termux (when patch ZIP has been copied to `/sdcard/Download`):

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.141_Legendary_Collection.zip -d .
node --test source/tests/v07141-legendary-collection.test.cjs  # if node available

git add source

git commit -m "Add TCG Legendary Collection 110-card set and battle fixes"
git push origin main
```

### Limitations
- No device APK was built or Android UI manually inspected in this pass. Validate gameplay on the device after CI builds the APK.
- Previous-era card rules are used within LuckyDex's deliberate **30-card deck + separate generated Basic Energy + five Prize** hybrid; this is not the official historical 60-card TCG format.
- This pass adds no separate card-art bundle; artwork uses the standard existing remote card image host.
