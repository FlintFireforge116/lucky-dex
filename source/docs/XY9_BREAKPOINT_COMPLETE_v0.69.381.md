# LuckyDex v0.69.381 — BREAKpoint / XY9 126/126 final four

Based on the successful GitHub v0.69.380 Stage 3 build. Source-relative patch for `~/lucky-dex/source`.

## Four newly completed prints

- XY9 #67 Sudowoodo — Watch and Learn: copy opponent's actual attack from its previous turn, preserving attack and source-card identity across switching; copy guards avoid recursion and stale turn references.
- XY9 #102 Max Elixir — choose one Basic Pokémon on Bench; search only the top six physical deck cards for one genuine Basic Energy and shuffle. If this Classic battle uses a separate Energy Zone instead of physical Basic Energy in the deck, inspect only the next six ordered units.
- XY9 #109 Puzzle of Time — one played copy reorders top three; two distinct played copies retrieve up to two chosen genuine discarded cards. The played copies cannot select themselves while resolving.
- XY9 #113 Splash Energy — Water-only special energy; opponent's attack-damage KO returns top Pokémon card to hand, discards its attachments and earlier stages, still gives opponent the normal Prize. Reuses HGSS rescue timing.

## Regression policy

- Source-of-truth `scripts/xy9_release_contract.json` now requires all 126 prints enabled and no gated cards.
- Offline `python3 scripts/preflight-xy9-release.py` and tests are a partial check; mandatory GitHub `generateXY9ForApk -> auditXY9ForApk` verifies the generated official 126-print catalogue before producing the APK.
- New `tests/v07381-breakpoint-completion.test.cjs` includes real choice/card conservation tests and a complete attack-KO Splash Energy integration test for Basic and evolved Water Pokémon (return only top card, discard Splash/understage, award Prize, require new Active).
- Retains Stage 1–3 test suites, card printed-effect audits and deck-quality regressions, no weakening of validation assertions.
- Single code-path changes verified against older XY and HGSS rules; no need to write a separate attack copying or Energy rescue subsystem.

## Installation

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.381_BREAKPOINT_COMPLETE.zip -d source
git add source
git commit -m "LuckyDex v0.69.381 BREAKpoint final four and complete audit"
git push origin main
```

Local checks do not establish that the subsequent Android GitHub APK build has succeeded.
