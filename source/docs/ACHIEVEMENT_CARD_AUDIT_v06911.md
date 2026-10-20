# LuckyDex v0.69.11 — Achievement & Card Availability Audit

## Scope

This pass audited the live achievement definitions and reward references, plus the complete physical TCG artwork/catalogue snapshot used for the card-rarity review.

- Static/core/expansion achievement definitions audited: 349 unique IDs before legacy binder compatibility rows and runtime-generated set achievements.
- Catalogue sleeve rewards with `sourceAchievementId`: 26; unresolved IDs: 0.
- Physical TCG catalogue audited: 199 sets / 21,337 cards.
- Card catalogue missing entries: 0 in the audited index.

## Achievement fixes and availability

- `unown_perfect_5` (the achievement used by the Darkrai catalogue reward) now requires 5 consecutive correct Unown messages on **Normal** difficulty. Easy does not contribute. The best Normal streak is saved immediately after each correct answer, so cashing out is not required.
- `safari_50`, legacy `safari_ten`, legacy `unown_perfect`, and `v0413_retreats_10` are retained for old save/claim history but marked legacy-hidden because their original mechanics/counters no longer have a current earning route.
- `haunted_visit` remains live. Current Wild Hunt destination entry now records `visitedLocations`, and prior Lavender Wild Hunt encounter history is also accepted.
- `haunted_clear` remains live by mapping the retired Haunted House wording to the current Kanto **Pokémon Tower** Regional Adventure leg. Existing old `firstClears.haunted` progress remains accepted.
- The telemetry-only achievements (`battle:one-hp-win`, `catch:first-throw`, `voltorb:gift-cleared`, `voltorb:gift-lost`, `berry:golden-perfect`, `pack:god-no-new`) were checked against live event writers; all have current producers.
- Direct persisted achievement metric families were checked for live writers. The only obsolete families found are the Safari, old Unown-perfect and expedition-retreat counters above; they are now legacy-only.
- Runtime-generated physical set achievements are based on non-empty catalogue sets. The audited physical index contains 199 non-empty sets and 21,337 cards.

## Reward-card availability

- Ancient Mew — `Miscellaneous` — **available** (3 catalogue variants found).
- Victory Medal — `Victory Medals` — **available** (9 catalogue variants found).
- Celestial Storm — set `SM7` — **200 cards — available**.
- All 26 catalogue cosmetic rewards that reference an achievement resolve to an existing achievement ID. Darkrai's `unown_perfect_5` source is now earnable again.

## Rarity repair

The old resolver sent 743 cards with explicit, meaningful source rarity labels to LuckyDex's Unknown class. v0.69.11 maps every one of those labels to an existing LuckyDex rarity family. After this pass, **0 cards with an explicit physical rarity label remain unresolved as Unknown**.

- Black White Rare: 4 cards → `secret`
- Futuristic Rare: 2 cards → `secret`
- Holo Rare V: 235 cards → `ultra`
- Holo Rare VMAX: 86 cards → `ultra`
- Holo Rare VSTAR: 34 cards → `ultra`
- Mega Attack Rare: 7 cards → `secret`
- RGB Rare: 3 cards → `secret`
- Rare Holo Star: 25 cards → `historic-chase`
- Rare Prism Star: 27 cards → `ultra`
- Rare Shiny GX: 35 cards → `special-illustration`
- Shiny Rare: 269 cards → `ultra`
- Shiny Rare V or VMAX: 16 cards → `special-illustration`

The full 743-card change list is in `docs/CARD_RARITY_CHANGES_v06911.csv`.

## Deliberate No Rarity handling

The source index contains 824 cards labelled `No Rarity`. These were not guessed upward from artwork. After existing set/card-specific normalisation, 818 remain intentionally in the broad internal unknown/no-rarity class but display **NO RARITY**, emit no unknown-rarity diagnostic, and are not treated as missing metadata. The other 6 are already deterministically identified by existing product/card rules (five Promo-family cases and one Dragon Vault secret-card case).

This distinction is intentional: v0.69.11 fixes cards whose source rarity was known but unsupported; it does not manufacture rarities for genuinely rarity-less products.
