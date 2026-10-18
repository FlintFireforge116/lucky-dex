# Lucky Dex v0.16.9 Test Report

## Scope
Global Link Trade catalogue correctness and trade-browser UI rebuild.

## Changes verified
- Android metadata: versionCode 169 / versionName 0.16.9.
- Visible LuckyDex version strings: v0.16.9.
- Marketplace version: v169-exact-global-market-1 (forces stale board replacement).
- Market size: 24 live listings; featured view: 5.
- Trade page contains no native select filters.
- View controls: Featured / All / Can Trade / Spares.
- Source controls: All / Physical / Pocket.
- Search spans trainer, offered card, requested card, set and rarity.
- Physical TCG full-set resolution uses LuckyDexCardArt exact catalogue first.
- Owned-card set fallback removed.
- Ownership does not participate in offer selection.
- All JavaScript syntax checks pass.
- HTML IDs are unique and explicit v0.16.9 trade DOM references exist.

## Runtime note
Final Android compilation is performed by the repository GitHub Actions APK workflow after replacing LuckyDex_source.zip.
