# LuckyDex v0.24.8

v0.24.8 refines the Promo Vault / Dust Exchange economy introduced in the preceding patches.

## Changes
- Promo cards no longer all share ordinary-card Dust values.
- Standard promos cost 350 Dust and salvage for 100 Dust per spare.
- EX / GX / V / BREAK / Lv.X promos cost 600 and salvage for 175.
- VMAX / VSTAR / V-UNION / TAG TEAM / Radiant / Shining promos cost 900 and salvage for 275.
- Gold / Hyper / Rainbow / Special Illustration / Secret / Crown promos cost 1300 and salvage for 450.
- Purchase and salvage values use one shared classifier, including subtype metadata when available.
- Promo purchases retain subtype/supertype metadata in the binder so later Dust valuation remains accurate.
- `Miscellaneous` is removed from Promo Vault and Trade discovery because its Ancient Mew content is Achievement Reward-only.
- Victory Medals remains available because non-trophy medals still route through Promo Vault; the specific Achievement Reward Victory Medal remains protected.
- Any future promo series that hydrates with zero purchasable promo cards removes itself from the Promo Vault list automatically.
- Trade market cache version is bumped so stale listings from hidden buckets are regenerated.

## Android update identity
- applicationId remains `com.example.luckydex`.
- versionCode: `248`.
- versionName: `0.24.8`.
- Permanent signer is unchanged.
