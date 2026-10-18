# LuckyDex v0.25.2 — Fossil risk, accurate digging art & landscape museum

v0.25.2 is the second focused polish pass on the Oreburgh Fossil Dig / Museum overhaul. It changes reward timing, makes cave-ins meaningful, improves mining art/footprints and rebuilds museum placement/orientation around the authentic room.

## Unbanked haul and cave-in risk
- Excavating an item now marks it `RECOVERED · UNBANKED`; the strike path does not immediately grant anything.
- `bankRecoveredFind()` is the single reward-routing point and runs only at dig completion/manual cash-out/collapse resolution.
- Safe manual exit and full-site completion bank all recovered finds.
- Cave-in loss is resolved by `resolveCaveInHaul()` at a 60% per-find loss chance.
- A haul containing two or more recovered finds is guaranteed at least one survivor; a single recovered find can be lost.
- Lost finds are listed on the result sheet and never touch Museum state, Lucky Coins, Adventure inventory or the card binder.

## Excavation art and footprints
- Added offline mining-specific art under `arcade/fossil-museum-v0252/mining/` for the seven classic fossils, Odd Keystone, Star Piece, Rare Bone and selected geological stones.
- Classic fossil masks now match the intended excavation proportions instead of generic 2×2/3-cell shapes.
- Star Piece is visibly large and uses a 3×3 excavation footprint.
- A 5,000-wall generation fuzz run produced 3–6 finds on every board with zero overlaps/out-of-bounds cells after the larger masks were introduced.

## Authentic Oreburgh Museum landscape layout
- Added `arcade/fossil-museum-v0252/oreburgh-museum-dppt-landscape-v0252.png` as the active room.
- Earlier LuckyDex-added cases are removed; only genuine room furniture is used.
- Museum placement is case-based through `MUSEUM_CASES`, `MUSEUM_PLACEMENT` and `museumSlotFor()` rather than per-artifact arbitrary coordinates.
- The room model contains the genuine three rear cabinets, three outer-right cases, two inner-right cases and central pedestal.
- All 30 exhibits were visually sanity-checked simultaneously on those surfaces.
- Odd Keystone remains on the central pedestal.

## Museum-only orientation
- The web bridge exposes `setOrientation(mode)` to the Android JavaScript interface.
- `MainActivity.AndroidBridge.setOrientation()` maps museum entry to `SCREEN_ORIENTATION_LANDSCAPE` and exit/Fossil Dig to `SCREEN_ORIENTATION_PORTRAIT`.
- `android:configChanges="orientation|screenSize|keyboardHidden"` prevents the WebView activity being recreated during the switch.
- Manifest default remains portrait, so a normal app launch and every non-museum screen stay portrait.

## Save/update compatibility
- Existing museum save shape (`state.arcade.museum.exhibits`) is unchanged.
- No discovered museum exhibit or collection reward is reset by this release.
- `applicationId` remains `com.example.luckydex`.
- Android release identity is `versionCode 252` / `versionName 0.25.2`.
- Permanent LuckyDex signing keystore/certificate are unchanged.
