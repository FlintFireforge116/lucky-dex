# LuckyDex v0.28.0 test report

## Scope
Collection browser upgrade from v0.27.9:
- separate TCG and TCGP Card Binder tabs;
- independent per-source search/sort/filter/set state;
- search by card name, set name/ID, card number and rarity;
- sort by release date, set name, card name, card number, rarity and quantity owned;
- release/set ordering reuses the Pack Shop set cache/catalogue data;
- existing Rare Hits and Spare Copies filters remain source-scoped.

## Verification
- 104 runnable non-browser test programs: PASS
- 19 Playwright/browser programs: not runnable in this environment because the Playwright module is not installed
- `node --check app/src/main/assets/collection-browser-v0280.js`: PASS
- Arcade authentic-scene/sprite checksum audit: PASS
- Arcade venue audit: PASS
- Adventure asset audit: PASS (829 images / 1025 species)
- Fossil Museum asset audit: PASS (42 images)
- Android identity: `com.example.luckydex`, versionCode 280, versionName 0.28.0
