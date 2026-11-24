# Dragon Majesty — v0.69.427 integration

The pinned catalogue has 80 prints, including 40a and 60a. Generated coverage is 67 playable and 13 gated. See SM75_CURRENT_GAP_LEDGER.md for the exact unresolved rules. The compact source is bundled for offline CI and checked against the source attestation.

Integration includes set selection, player and CPU deck generation, classic battle registry and shared handlers for Dragonporter-GX, Fire Energy distribution, field-wide damage, Wela Volcano Park, Lance Prism Star, Blaine's Last Stand and Switch Raft. Existing full-signature mechanics cover additional cards. The 39-test SM75 preflight includes 206 side-specific attack smoke paths and focused outcomes. Water-only generation remains a completion-pass issue (one fixed-seed player fixture yields 29/30); Fire player and Dragon CPU fixtures pass. CI APK/device testing is separate from local source validation.
