# LuckyDex v0.24.0 — Trade Market + Pack Browser

## Trade

- Replaced per-mode/per-source live board caches with one persisted four-hour `state.trade.market` snapshot.
- Legacy `state.trade.boards` remains tolerated/preserved but is no longer the live source of listings.
- Market listings carry source and Same/Across metadata so UI controls filter synchronously.
- Empty/transient catalogue failures are not persisted as a valid market; a previous valid market is retained on refresh failure.
- Failed refreshes retry on a bounded 15-second interval instead of every one-second countdown tick.
- A snapshot is only accepted when every eligible Same/Across source bucket produced coverage, preventing a partially loaded catalogue from freezing an empty Across Sets view for the four-hour slot.
- Opening a previously undiscovered set registers it and can deterministically append listings involving that set without deleting current listings or accepted flags.
- Same Set / Across Sets, All / Physical / Pocket, Featured / All / Can Trade / Spares and search operate on the same listing array.
- Removed the large Trade explainer panel and condensed the pre-list status to `live · featured · ready`.

## Packs

- Added live set search by set name or id/code.
- Added sort keys: Release Date, Name, Set Size, Completion %, Packs Opened, Recently Opened.
- Added a separate ascending/descending arrow toggle.
- Added additive `state.ui.packBrowser` preferences and per-set `state.ui.packMetrics`.
- Added a compact scrollable set browser; the existing hidden `#setSelect` remains the compatibility value for the established pack engine.
- Real committed packs increment per-set open metrics; debug/cancelled packs do not pass through the real commit wrapper.

## Compatibility

- `com.example.luckydex` unchanged.
- `luckyDexSave` unchanged.
- GitHub signing-secret/keystore contract unchanged.
- versionCode 240 / versionName 0.24.0.

## Verification limitation

The local archive environment does not currently have Node Playwright installed and dependency restoration timed out, so browser-dependent tests and phone screenshots are deferred to GitHub CI/device verification. All available non-browser contracts, JS syntax, duplicate-ID and offline asset audits pass; see `TEST_REPORT_v0.24.0.md`.
