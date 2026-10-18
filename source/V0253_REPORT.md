# LuckyDex v0.25.3 Implementation Report

## 1. Authoritative rarity / finish model
Added `card-rarity-v0253.js` as the shared card classification layer. Printed rarity is kept separate from foil/finish state; canonical source rarity wins whenever present and legacy inference is fallback-only. Pack reveal impact, app rarity tiers/Dust, Rare Hits and trade matching consume the shared result.

Secret Rare is now a top-impact chase classification with explicit Secret Rare presentation. Gold/Hyper/Crown Secret variants retain their chase styling without discarding the Secret classification. Common Reverse Holo remains Common with reverse-holo finish.

## 2. Oreburgh Museum + mining visuals
Museum Collection is now a fullscreen landscape scene rather than a page with a permanent side information column. Back/count/plaque UI is overlaid on the authentic Oreburgh room. Exhibit placement remains restricted to the genuine three rear cabinets, three right cases, two inner cases and central pedestal.

Active museum/mining item references were moved to the v0.25.3 coherent pixel-art namespace. v0.25.2 painterly stand-ins are no longer used. Nearest-neighbour rendering preserves pixel-art character at enlarged display sizes.

Existing v0.25.2 mining mechanics—unbanked haul, cave-in loss, End Dig, reward banking and museum persistence—remain intact.

## 3. Tile Puzzle image refresh
Removed the synthetic Tile Puzzle composition that combined random Pokémon participants and berry/item props over a backdrop. Tile Puzzle now chooses from an eight-scene curated offline library of recognisable Pokémon game locations. Existing board mechanics, difficulty grid sizes, scoring and rewards were intentionally preserved.

## 4. Compatibility work
Historical regression assertions that explicitly required retired museum side-column classes, old coordinate bands, or the removed synthetic Tile Puzzle backdrop arrays were updated to protect the replacement behavior instead. Cave-in, reward routing, orientation, genuine-case safety, Promo economy/trading and permanent-signing checks remain enforced.

## 5. Verification summary
- 60 `.cjs` test programs checked on the final implementation tree
- 45 runnable passes
- 0 runnable failures
- 15 Playwright dependency skips (Playwright package absent locally)
- modified JavaScript syntax checks passed
- offline Adventure / venue / Fossil-Museum / v0.25.3 scene-asset verification passed
- permanent keystore SHA and certificate fingerprint unchanged
- applicationId unchanged
- release metadata: versionCode 253 / versionName 0.25.3

No local APK was built because this extracted workspace has neither a Gradle wrapper nor system Gradle. GitHub Actions remains the intended APK build environment.
