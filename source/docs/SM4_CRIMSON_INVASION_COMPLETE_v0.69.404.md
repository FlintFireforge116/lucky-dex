# Crimson Invasion (SM4) — final 43 cards / 126 of 126 — v0.69.404

**Status:** source-side release and local preflights passed; GitHub Actions APK compilation is **not yet confirmed**.

## Print / release contract

- Exactly 126 SHA-pinned, bundled collector prints (1–124, 63a, 84a), 193 attacks, 23 Abilities, 25 Pokémon-GX and GX attacks, and 4 Energy prints.
- Complete the previous continuation (83 playable + 43 gated) to **126/126 generated, battle-enabled and deck-eligible**, zero gated. The original SM4 compact print source and checksum stay unchanged.
- Android versionName `0.69.404` / versionCode `7404` unchanged. No remote card queries are needed to generate the APK.
- Player, CPU, deck-builder, set picker and offline asset all use the same generated data.

## Newly implemented and audited gameplay

- Optional and selected payments/targeting: Hunt chooses a real opposing Bench target *before* applying damage, Forceful Tackle's self counters, Special Artillery's chosen physical Special Energy discard, Pumpkin Bomb's exact chosen Tool discard, Dark Destruction's optional Energy on both sides, Dread Storm-GX's per-Pokémon Energy choices, and opponent-controlled Amazing Plea.
- Board/hand/Prize movements: Shell On requires and discards an actual Shelmet, then evolves from the actual deck; Symbiont-GX physically moves two opposing deck cards into Prizes; Glutton-GX awards two **additional** Prizes on a real damage KO; Blade-GX takes a real Prize; TLC moves a damaged opposing Benched Pokémon's stack/attachments into deck; Gale Blade conditionally shuffles attacker; Weed Out selects exactly three Bench survivors; Eat Sloppily consumes the actual top five cards; Dance of Flames recovers only discarded **Basic Fire Energy** and cannot create Energy from the fresh Zone.
- Locks, Abilities and reactions: Heavy Rock-GX opponent hand lock, Bell of Silence blocks playing Ability Pokémon from hand **including via Rare Candy**, Empty Light's optional dual-Active status, Slice Off's selected opposing Special Energy removal on a real from-hand Bench entry, Gnawing Curse and Moomoo Malt restricted to attachments from hand, Sky Hunting's post-KO switch, and Regice's Iceberg Shield prevention of attack effects.
- Pokémon Tool / Stadium / Special Energy: Fighting and Psychic Memories genuinely change Silvally-GX's type; Dashing Pouch returns paid retreat Energy to the physical hand; Counter Energy's catch-up requirement and non-GX/EX restriction; Warp Energy's Active-only forced switch; Sea of Nothingness maintains conditions during **both evolution and devolution**, not on switching.
- Physical discard transfers and optional choices must conserve the original card/UID, finish pending choice chains, and work for both human and CPU. Special Energy never silently becomes Basic or free Zone Energy.

## Mandatory and regression audits

- `python3 scripts/preflight-sm4-release.py --full`: SM4 catalogue source pin, generator, core, Android build hooks, plus 112 battle tests including `tests/v07422-crimson-invasion-completion.test.cjs` (36 targeted final-batch outcomes); all passed locally.
- `python3 scripts/preflight-sm3-release.py --full`: Burning Shadows previous-set check, 145/145 older battle and energy tests; passed locally.
- `tests/v07422-crimson-invasion-completion.test.cjs` is mandatory in BOTH `scripts/preflight-sm4-release.py --full` and Android Gradle `auditSM4ForApk` before APK generation. It also asserts all 126 cards' printed effect descriptors validate and no one is inadvertently gated.

## Termux (from original project root)

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.404_SM4_CRIMSON_INVASION_126_OF_126_COMPLETE.zip -d source
(cd source && python3 scripts/preflight-sm4-release.py --full)
git add source
git commit -m "LuckyDex v0.69.404 SM4 Crimson Invasion complete 126/126"
git push origin main
```

Check GitHub Actions after the push: local Node tests do not establish that the remote Android APK compiled.
