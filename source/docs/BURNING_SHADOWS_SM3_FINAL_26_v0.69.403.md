# Burning Shadows (SM3) — final 26 collector prints (v0.69.403)

## Coverage
- **177/177** pinned collector prints are battleEnabled and deckEligible; **0** gated.
- Pinned offline source: `data/classic/sm3-print-compact.json`, 274 attacks, 27 Abilities, 40 GX prints.
- 26 newly unlocked prints: Heatmor, Eelektross, Slowking, Dusknoir, Espurr, Palossand, Passimian, Marshadow-GX variants, Darkrai-GX variants, Diancie, Persian, Porygon-Z variants, Kiawe variants, Plumeria variants, Sophocles variants and Wishful Baton.

## Exact mechanics implemented
- `Restoration`: Darkrai-GX's actual discarded card comes onto the Bench. One physical or ledger Darkness Energy from discard may attach, never new Zone Energy. Discard-only abilities cannot be used while the same card is in play.
- `Shadow Hunt`: attacks of actual Basic Pokémon from own physical discard are legal with their printed Energy costs and GX once-per-game restrictions. `Peerless Hundred Blows-GX` counts only actual attached Basic Energy, not Special.
- `Kiawe`: one target and up to four independent Zone flips for Basic Fire deck searches. Physical Fire Energy card searches remain physical. Ends turn after search. Other Supporters discard physical hand cards first.
- `Wishful Baton`: attack-damage KO interruption offers up to three Basic Energy transfers and an actual friendly Bench destination. Per-unit type choices preserve Energy conservation and KO/Prize continuation.
- `Initialize`, `Dark Invitation`, `Sparkling Wish` provide actual evolution/bench/selection outcomes.
- Other new attacks use match-checked printed text; no unimplemented effects or made-up placeholders.

## Regression contract
- Mandatory `tests/v07417-burning-shadows-final-26.test.cjs`: Stage-4 outcome tests, player/CPU and hybrid Energy conformance.
- Gradle `auditSM3ForApk` also retains all previous SM3 + XY10/Basic Energy + deck-quality suites.
- Run `python3 scripts/preflight-sm3-release.py --full`, `python3 scripts/preflight-xy10-release.py --full`, plus other cross-set preflight checks. Test after clean extract into current successfully built Stage 3 source.
- GitHub Android APK build must still be confirmed after Termux push.
