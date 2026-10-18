# LuckyDex v0.25.3 — Rarity, Museum, and Tile Puzzle Design

## Purpose

v0.25.3 is a focused quality pass across three existing LuckyDex systems:

1. make card rarity/finish classification authoritative and make Secret Rare pulls feel appropriately exceptional;
2. turn the Oreburgh Museum into a genuine fullscreen pixel-art scene rather than a landscape webpage containing a museum image;
3. replace the Tile Puzzle's synthetic/random composite pictures with a curated library of coherent Pokémon pixel-art scenes.

The three changes ship together, but remain separate internally so rarity logic does not depend on Arcade UI code and Arcade assets do not affect card-economy behavior.

## 1. Canonical card rarity and finish model

### Problem

The current app uses fuzzy text matching (`rarityTier()` and `classifyPullImpact()`) for too many decisions. It can therefore conflate printed rarity with finish, understate Secret Rare cards, and incorrectly infer rarity when source metadata is available.

### Source of truth

For every card, LuckyDex must model these concepts separately:

- **printed rarity** — the source-provided rarity label, normalized into a stable rarity class;
- **finish** — normal, holo, reverse holo, textured/special foil when known;
- **chase traits** — secret-numbered, Gold, Rainbow, Hyper, Crown, Special Illustration, etc.

The source card/set metadata is authoritative whenever present. Regex/name inference is a fallback only for incomplete source rows. A small explicit override table may correct known bad/ambiguous upstream records.

A Common Reverse Holo remains **Common** with a **Reverse Holo finish**. A holo finish alone must never upgrade the printed rarity.

### Stable rarity classes

The normalized card classification must expose enough information for pack generation, reveal effects, Rare Hits, Dust, trading, collection badges, and search/filtering without each system inventing its own regex.

At minimum:

- common
- uncommon
- rare
- double-rare
- ultra / full-art class
- illustration class
- special-illustration / rainbow class
- secret
- jackpot/chase style traits (gold/hyper/crown) layered on top
- promo remains a separate acquisition/trade class, not silently collapsed into Common/Rare

Era-specific labels can map into these stable classes while preserving the original printed text for UI.

### Secret Rare treatment

Secret Rare is one of the top chase classes and must receive **maximum-impact reveal treatment**.

A plain Secret Rare gets:

- `SECRET RARE` reveal label;
- maximum reveal timing/intensity;
- strong haptic impact;
- high particle/ray treatment;
- persistent special border/glow after reveal;
- explicit Secret Rare wording in Rare Hits and card badges.

If a Secret Rare is also Gold/Hyper/Crown, the visual style remains appropriate to that trait, but the wording preserves the Secret classification, e.g. `GOLD SECRET RARE — JACKPOT`.

Impact hierarchy:

1. Common
2. Uncommon
3. Rare / Holo
4. Double Rare
5. Illustration / Ultra / Full Art
6. Special Illustration / Rainbow
7. Secret Rare / Gold / Hyper / Crown jackpot

The exact card rarity remains separate from the impact tier.

### Downstream behavior

All systems that currently call fuzzy `rarityTier()` directly should consume one shared normalized classification API instead. Dust values, trade matching, pack targeting, Rare Hits, collection badges, and reveal animation should agree on the same card classification.

Existing save records must remain readable. New normalized fields may be derived at runtime and do not require destructive save migration.

## 2. Fullscreen authentic Oreburgh Museum

### Problem

The Museum currently rotates to landscape but still looks like a webpage: a permanent text column and margins surround the room. It also mixes authentic DS-era pixel graphics with larger LuckyDex-generated/HD-looking object art, causing style clashes and overlapping exhibits.

### Fullscreen scene

Entering Museum Collection continues to rotate Android to landscape, but the museum scene itself becomes the primary surface:

- the authentic Oreburgh room fills the usable landscape area as far as aspect ratio allows;
- there is no permanent left information column;
- only small unobtrusive overlay controls remain (Back and exhibit count);
- tapping an exhibit opens a temporary plaque overlay/bottom sheet over the room;
- closing the plaque returns to the unobstructed room;
- leaving Museum restores portrait orientation.

No controllable avatar is added.

### Authentic pixel assets only

Museum and excavation representations must use authentic Pokémon pixel/item sprites where an appropriate asset exists. Avoid painterly replacements, HD relic art, anti-aliased enlargement, or stylistically inconsistent substitutes.

Pixel sprites scale with nearest-neighbour rendering / integer-like scaling so they remain crisp.

The size of an excavation footprint is independent of the source sprite resolution: a 30×30 Star Piece sprite can still occupy a 3×3 buried footprint without being redrawn as a giant image.

### Exhibit placement

Museum displays use the real Oreburgh furniture only:

- 3 rear cabinets;
- 3 right-side cases;
- 2 inner cases;
- central pedestal.

No invented case is added.

Each real case owns fixed **case-relative slots**. Slots define position, maximum visual size, and z-order. Exhibits are assigned to these slots by collection group. Slots must prevent overlap and keep sprites visibly on the glass/display surface.

Empty displays render absolutely nothing until the first corresponding discovery is banked.

Odd Keystone remains a prominent central exhibit.

### Plaques

A discovered exhibit is tappable. Its overlay shows:

- item name;
- short LuckyDex flavour text;
- excavated count.

The plaque should not permanently consume museum screen space.

## 3. Tile Puzzle curated image library

### Problem

The current Tile Puzzle generates artificial scenes by compositing unrelated Pokémon/item sprites over backdrops. The result often looks incoherent and is not visually satisfying as a jigsaw/sliding puzzle.

### New image pool

Remove the random composite scene generator from Tile Puzzle.

Replace it with a curated offline image library chosen specifically because the whole image reads well when divided into puzzle tiles. Suitable categories include:

- recognizable Pokémon towns/routes;
- Pokémon Center / Gym / landmark interiors;
- iconic game scenes;
- region/map art where it remains legible;
- legendary/event scenes;
- coherent sprite scenes.

Images should be from a consistent Pokémon/game-art aesthetic where possible. Avoid stretched, blurry, low-information, text-heavy, or visually noisy images.

### Mechanics

The underlying Tile Puzzle mechanics remain intentionally stable for this release:

- preview before starting;
- Easy / Normal / Hard continue using the existing board-size progression (4×5 / 5×6 / 6×8 unless current code uses an equivalent orientation);
- each new puzzle chooses from the curated pool rather than synthesizing a picture;
- image choice should avoid immediate repetition when practical.

This release does not add a new puzzle ruleset, timer economy, or reward structure.

## 4. Offline and update requirements

- All new museum and Tile Puzzle visual assets required at runtime must ship inside the APK; no runtime network dependency.
- Preserve `applicationId 'com.example.luckydex'`.
- Preserve the permanent signing keystore unchanged.
- Release target: **v0.25.3 / versionCode 253**.
- Existing saves, cards, museum discoveries, and Arcade records must remain compatible.

## 5. Verification requirements

The implementation must include regression tests for:

- source rarity taking precedence over regex fallback;
- Common Reverse Holo remaining Common while retaining Reverse Holo finish;
- Secret Rare receiving top-impact classification and explicit Secret Rare label;
- Gold/Hyper/Crown + Secret preserving both trait and Secret wording;
- Promo remaining a separate trade/acquisition class;
- pack selection, Dust, Rare Hits, and collection badges consuming the shared classification rather than diverging regex tables;
- Museum entering/leaving landscape orientation correctly;
- fullscreen museum markup having no permanent side text panel;
- exhibit slots belonging only to the 3 rear + 3 right + 2 inner + central real displays, with no slot overlaps;
- pixel-rendering CSS on museum/item sprites;
- Tile Puzzle drawing only from the curated image manifest and not the retired random-composite generator;
- offline asset manifest integrity;
- versionCode 253 and unchanged signer/application ID.

Visual sanity checks should render:

1. the museum with all exhibits visible simultaneously to inspect overlap/placement;
2. a contact sheet of excavation/museum item sprites to catch style mismatches;
3. representative Tile Puzzle images at the three board sizes to confirm they remain readable when sliced.

## Non-goals

- No achievement system work in this release.
- No new museum walking/avatar system.
- No redesign of Fossil Dig reward/cave-in mechanics beyond preserving v0.25.2 behavior.
- No new Tile Puzzle gameplay mode.
- No change to promo acquisition economy except where shared rarity classification must preserve existing promo behavior.
