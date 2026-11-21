# LuckyDex v0.69.367 — Ancient Origins Stage 5

Build baseline: v0.69.366 GitHub APK #655 **succeeded**. This new patch is **not APK-verified yet**.

## Newly completed effects

- **M Sceptile-EX #8 / #85:** Jagged Saber uses actual Basic Grass Energy already in hand, up to two separate choices; each choice attaches to a selected Benched Pokémon and heals all damage from that Pokémon, with an optional decline. CPU prioritises actual attachments and useful healing.
- **Virizion #12:** Prize Count uses a strict comparison of remaining Prize cards (not earned points).
- **Registeel #51:** Forbidden Iron Hammer removes Energy from the opposing Active Pokémon only when that Pokémon is EX.
- **Lugia-EX #68 / #94:** Aero Ball counts Energy *units* on both Active Pokémon, including multi-unit Special Energy. Deep Hurricane checks and discards a Stadium only when one exists.
- **Hoopa-EX #36:** Corrects nested optional choice flow for Scoundrel Ring, excluding Hoopa-EX itself from the EX search; Hyperspace Fury's opposing target choice and two-Energy discard are regression-tested.
- **Level Ball #76:** Selects an actual Pokémon with at most 90 printed HP from the physical deck.
- **Ace Trainer #69:** Requires own remaining Prizes to exceed opponent's, then shuffles both players' hands and draws six versus three physical cards.

All IDs and alternate art references remain distinct. These changes are cumulative on Stage 4. No ghost Energy cards are created; physical Basic Energy cannot be auto-inserted into the 30-card deck.

## Verification and remaining work

- `tests/v07367-ancient-origins-stage5.test.cjs` exercises 13 direct tests: attack mapping/enablement, multi-step target/hand selection, optional decline, CPU choice behaviour, Prize comparisons, Special Energy counting, Trainer eligibility, Hoopa choices, and autobuilder dependencies.
- `app/build.gradle` adds the suite to `auditXY7ForApk` so GitHub checks it against generated assets.
- All older XY and cross-era regressions should run; catalogue/Android packaging dependencies cannot be confirmed until the new GitHub APK job completes.
- **Ancient Origins is not yet complete.** Remaining individually gated card effects and dependencies need later integration and an independent 101-print audit. Do not pretend the complete catalogue is battle-enabled.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.367_ANCIENT_ORIGINS_STAGE5.zip -d source
git add source
git commit -m "LuckyDex v0.69.367 Ancient Origins Stage 5 effects"
git push origin main
```
