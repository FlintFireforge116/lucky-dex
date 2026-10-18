# LuckyDex v0.25.1 — Fossil Dig + Museum polish

v0.25.1 is a focused polish release for the v0.25.0 Oreburgh Fossil Dig and Museum overhaul.

## Fossil Dig
- Rock layers at depths 4, 3 and 2 are now fully opaque, so buried objects cannot be read through intact rock.
- Depth 1 remains visibly chipped/semi-open so finds begin to appear only when genuinely close to excavation.
- Added an explicit `END DIG` action beneath the excavation tools.
- `END DIG` opens an in-app confirmation panel with `KEEP DIGGING` and `END & COLLECT`; no browser `confirm()` dialog is used.
- Manual finish recovers only finds already fully excavated and uses a distinct `DIG ENDED` result state.

## Oreburgh Mining Museum
- The museum room renders closer to the phone edges for a larger presentation.
- Added corrected `oreburgh-museum-dppt-empty-v0251.png` room art.
- The added small glass case that previously overlapped the lower entrance has been moved to clear floor space above the central display.
- Thunder Stone, Leaf Stone and Moon Stone exhibit slots move with that case, so no artifact remains positioned over the doorway.
- The original authentic Oreburgh room, blank-until-discovered exhibit behaviour, tappable plaques and persistent collection state are preserved.

## Save/update compatibility
- No save schema changes are required from v0.25.0.
- `applicationId` remains `com.example.luckydex`.
- Android release identity is `versionCode 251` / `versionName 0.25.1`.
- The permanent LuckyDex signing keystore and certificate are unchanged.
