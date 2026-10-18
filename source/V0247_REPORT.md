# LuckyDex v0.24.7

This release moves duplicate Dust conversion to a manual Trade-screen workflow, adds Promo Vault search, and fixes Promo rarity matching in simulated trades.

Duplicates now remain in the binder when packs are opened. Trade > Dust Exchange lists cards with spare copies and their rarity-based Dust value, with Convert 1 and Convert All Spares controls. The final copy is never eligible for conversion. The 100 Dust -> 1 Ticket exchange lives in the same panel.

Promo Vault now supports searching the selected promo series by card name, number, or rarity.

Trading now has a dedicated Promo rarity class. Promo requests can only be paired with Promo offers, achievement-only rewards are excluded, and the market snapshot version is bumped so stale Promo/Common listings are regenerated.

Android package ID and permanent signing identity are unchanged. VersionCode is 247 and versionName is 0.24.7.
