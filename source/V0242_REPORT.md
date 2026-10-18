# LuckyDex v0.24.2 changes

## Packs UI
- Replaced the permanently visible, tiny scrolling set list with a collapsible set accordion.
- Selected set + year remain visible when collapsed.
- Expanded picker owns the available selector-card height and contains Search, Sort, reverse direction and the full set list.
- Pack format is now title-only; removed rarity recipe copy and circular 10/5/4 badge.
- Added concise Dust explanation and kept the existing 100 Dust -> 1 Pack Ticket action.

## Chronology
- Release Date view migrates to descending/newest-first on first v0.24.2 run.
- Browser sort and authoritative hidden set ordering both use corrected physical-set dates.
- Pinned official chronology overrides:
  - 30th Celebration: 2026-09-16
  - 30th Celebration Classic Collection: 2026-09-16
  - Scarlet & Violet—151: 2023-09-22

## Dust behavior
- Existing duplicate-pull conversion is unchanged: an already-owned card adds Dust based on rarity tier.
- Existing exchange is unchanged: 100 Dust -> 1 Pack Ticket.
- There is still no manual card-destruction conversion flow.

## Compatibility
- applicationId remains `com.example.luckydex`
- save key remains `luckyDexSave`
- versionCode/versionName: `242` / `0.24.2`
- established GitHub signing-secret contract remains unchanged.
