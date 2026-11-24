# Hidden Fates and Shiny Vault — v0.69.458

| Set | Canonical prints | Enabled | Gated |
|---|---:|---:|---:|
| Hidden Fates (sm115) | 69 | 54 | 15 |
| Shiny Vault (sma) | 94 | 92 | 2 |
| Total | 163 | 146 | 17 |

Both official sources are pinned and shipped locally. All enabled cards retain their printed attack costs and rules. Shiny Vault reprints reuse complete earlier mechanics only after matching the full printed signature; their collector IDs remain distinct. Both sets are available separately in the player and CPU set filters. The v451 deck-building performance regression remains part of the release tests.

## Local checks
- Full `sh scripts/prepare-sm115.sh`: exit 0.
- 19 release-source gates passed, 462 release runtime tests passed, including 30 new tests; additional historical audit suite: 79 passed, no failures or skips.
- The broad 213-file APK test-list sweep was not rerun for this revision. Actual GitHub APK build and Android gameplay remain unverified.

## Remaining work
See `SM115_CURRENT_GAP_LEDGER.md` and `SMA_CURRENT_GAP_LEDGER.md`. Roadblock is gated because the older implementation has a no-op descriptor. The two sets are not yet complete; cross-era independent audit follows completion.
