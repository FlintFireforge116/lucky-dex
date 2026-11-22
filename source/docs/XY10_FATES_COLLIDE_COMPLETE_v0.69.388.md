# XY10 Fates Collide complete — LuckyDex v0.69.388

- Baseline: v0.69.387 Stage 5 GitHub success run 45051296127.
- Immutable official dataset: `xy10`, blob `aa097c8da85e960a5afa4f3b96312f64dcbec871`.
- Prints: **129** (including 43a, 54a, 105a, 111a); attacks **147**; Abilities **21**; Pokémon BREAK **5**.
- This patch enables the final 24 print mappings in one release: 9, 17, 18, 24, 25, 29, 31, 37, 38, 49, 56, 62, 64, 76, 77, 82, 94, 96, 102, 106, 108, 117, 120, 125.
- Shared implementation: Restored Fossil Items, delayed effects, event-driven evolution Abilities, attack borrowing, Tool-granted attacks, damage counter transfer, selectable Energy discards and damage, two-sided oriented Stadium, Energy-source search, knockout/retreat timing.
- Updated source contract: `scripts/xy10_release_contract.json` stage `complete`, minimum 129 enabled; `tests/v07388-fates-collide-complete.test.cjs` part of source-only and strict generated-catalogue audit tasks.
- This is a complete **first-pass integration**. Independent gameplay and CPU/deck-building audit is the next requested work; assertions passing do not guarantee every combination is bug-free.

## Before pushing

```bash
cd ~/lucky-dex
python3 source/scripts/check-gradle-source.py --self-test
(cd source && python3 scripts/preflight-xy10-release.py --full)
```

The `--full` check needs network for the pinned official dataset. It must pass on Termux before the commit. The full APK build is not verified until GitHub Actions succeeds.
