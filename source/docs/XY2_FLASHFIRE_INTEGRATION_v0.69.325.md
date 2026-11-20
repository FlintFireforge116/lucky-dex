# LuckyDex v0.69.325 — XY Flashfire integration

## Scope and source

- Official XY Flashfire: **110 print rows** (109 numbered cards plus alternate Blacksmith **88a**).
- **153 printed attacks**, **13 printed Abilities**.
- Printed card metadata is pinned to PokemonTCG/pokemon-tcg-data Git blob `f531c9d28f16f48c23217e0f5b8ccb0dd1f242e8` at `cards/en/xy2.json`.
- The app ships a **placeholder** only; Gradle automatically executes `scripts/build-xy2.py` before Android asset merge, then runs `tests/v07325-flashfire.test.cjs`. The generated official catalogue and coverage are not included in the ZIP because the local mock fixture must never be committed as authentic.
- Flashfire is registered with catalogue, search/collection, set picker, legal-deck builder and CPU set selection. Existing Fairy Basic Energy, EX and Mega Evolution handling are reused.

## Implemented or reused mechanics

- **Blacksmith**: physical Fire Energy from discard or Basic Fire discard ledger, two attachments with explicit card and target choices.
- **Fiery Torch**: exact physical Fire Energy from hand as mandatory cost, then draws two.
- **Stoke / Quiver Dance**: printed Basic Energy deck searches can use LuckyDex's ordered Basic Energy Zone when no physical Basic Energy appears in the deck; the ordered supply is consumed. Quiver Dance heals only upon a successful Energy attachment.
- **Pyroar Intimidating Mane**: blocks incoming Basic Pokémon attack damage, not evolved attackers.
- **Toxicroak-EX Triple Poison**: records 30 damage at each between-turn check, with normal status prevention.
- **Magnetic Storm**: applies to both sides and suppresses Resistance.
- **Startling Megaphone, Pokémon Center Lady, Pal Pad, Sacred Ash, Trick Shovel, Ultra Ball**: exact source/target choices and physical discard/deck handling.
- **Mega Charizard-EX / Mega Kangaskhan-EX**: use existing Mega Evolution ending turn, preserve distinct Mega prints and their EX prize values.
- **Complete-family XY2 CPU fallback**: only when the normal builder fails for a Flashfire-only request. Keeps legal 30-card decks with no orphan evolutions and no fabricated owned cards.

## Explicitly outstanding

The source map `scripts/xy2_verified.py` documents conservative gates for unverified effects: first-turn Adaptive Evolution, Thorn Tempest KO/evolution timing, multiple-target moves, Dusknoir Shadow Void, Floette Flower Veil max-HP updates, Lopunny Big Jump's whole-stack return, and Protection Cube recoil protection. The generator also gates any printed attacks/Abilities whose effect mapping is absent. Do not mark these battle-ready without action/UI and state tests.

## Verification and deployment

- The local generated **test fixture** passed 16/16 focused Flashfire tests.
- Cross-set regression with mock fixture: **74 passed, zero failed, eight skipped** (source-dependent tests skipped in other sets because their local generated catalogues are missing).
- Syntax check: `tcgp-battle-core.js`, `tcgp-battle-effects.js`, battle data, builder; Python compile for pinned generator and effects map.
- **GitHub APK build has not yet been run for this patch**. After pushing, GitHub must download the pinned official source and execute the source-dependent tests.

## User's installation sequence

```
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.325_XY2_FLASHFIRE.zip -d source
git add source
git commit -m "LuckyDex v0.69.325 XY Flashfire integration"
git push origin main
```
