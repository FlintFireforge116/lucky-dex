# LuckyDex v0.24.6 — Card Acquisition Routing

v0.24.6 closes the gap between “promo set” routing and actual card-level acquisition.

## What changed
- Added `card-acquisition-v0246.js` as the shared policy for physical cards.
- Physical boosters now filter individual cards through `boosterEligible`, including offline cached packs.
- Promo Vault filters individual cards through `promoVaultEligible` rather than assuming every card in a surfaced set is purchasable.
- Special distribution buckets — Miscellaneous, Victory Medals, Poké Card Creator Pack, and World Collection — cannot appear as normal retail booster choices.
- Their ordinary cards remain collectible through Promo Vault.
- Ancient Mew is awarded by full Kanto Pokédex completion.
- One Victory Medal is awarded by Game Corner Ace (10,000 Arcade coins).
- Achievement-card grants are queued if their source catalogue/art is not currently available and fulfilled later without replacing existing owned copies.
- Achievement cards display under a virtual `Achievement Rewards` collection group while retaining original IDs/source metadata.

## Release/update identity
- Android package: `com.example.luckydex`
- versionCode: `246`
- versionName: `0.24.6`
- Canonical signing keystore unchanged.

See `TEST_REPORT_v0.24.6.md` for verification evidence and environment limitations.
