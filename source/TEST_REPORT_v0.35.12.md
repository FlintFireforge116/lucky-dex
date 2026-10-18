# LuckyDex v0.35.12 Test Report

## Scope
Data-quality and pack-preparation repair after two tester reports:
- Dragon Vault cards displayed with no useful rarity.
- HS Trainer Kit—Gyarados could not be prepared/opened.

The pass also audited the physical pack catalogue and promo routing for other products with non-standard rarity distributions.

## Root causes
1. **Dragon Vault rarity source conflict** — the validated card-art snapshot can describe Dragon Vault as `No Rarity`, while the historical Pokémon TCG card dataset used for set/card matching classifies the Dragon Vault cards as `Rare Holo`. LuckyDex previously treated the weak `No Rarity` value as final.
2. **Strict booster collation applied to fixed/special products** — v0.34.3 historical collation expects normal Common / Uncommon / Rare slots. Trainer Kits and several other fixed/no-symbol products legitimately do not provide those rarity buckets, so preparation could exhaust its candidates and show `Could not prepare this set`.
3. **Promo-labelled mini products** — McDonald's Collection 2013 cards are labelled `Promo` in the validated snapshot even though LuckyDex intentionally offers McDonald's collections as small playable packs.
4. **Promo aliases without “Promo” in the display name** — Best of Game and the Pokémon Futsal Collection alias could remain visible as booster products even though their cards are promo-only, leaving dead pack-shop entries.

## Changes
- Added set-aware weak-rarity normalization:
  - Dragon Vault weak/no-rarity metadata resolves to `Rare Holo` for LuckyDex rarity/display/collation.
  - weak metadata in dedicated promo sets resolves to `Promo`.
  - genuine no-symbol products such as Trainer Kits remain `No Rarity` / `unknown` rather than having a fake printed rarity invented.
- Card-art hydration now applies the same set-aware rarity normalization before cards are displayed/saved.
- Added a flexible small-product pack policy for non-standard products, with pack size derived from set size and no impossible Common/Uncommon/Rare slot requirement.
- Flexible product families include Trainer Kits, McDonald's collections, My First Battle, Pokémon TCG Classic decks, Rumble, Southern Islands, Kalos Starter Set, Box Topper and standalone Energy collections.
- Flexible slots accept legitimate `unknown`, normal rarity classes and the `Promo` label used by the McDonald's 2013 snapshot.
- McDonald's mini-set cards stay booster-eligible even when their source rarity says `Promo`.
- Best of Game and Pokémon Futsal Collection are routed to the Promo Vault and removed from the booster catalogue.
- Standard authentic booster collation is unchanged; explicit regressions retain Jungle and HeartGold & SoulSilver behavior.

## Catalogue audit
- Pack-policy diagnostics: **233 physical catalogue rows**, **31 rarity labels**, **13 subset mappings** — PASS.
- Special/flexible registry coverage: **53 catalogue entries** across the non-standard product families above.
- Promo/special set-level audit: **24 promo/special registry rows** checked; **0** remained booster-eligible unexpectedly.

## TDD evidence
The new regression `tests/v03512-special-set-rarity-audit.test.cjs` was run before implementation and failed for the missing Dragon Vault normalization, missing flexible profiles and promo routing. A later strengthened assertion also failed on the McDonald's `Promo` label until flexible slots were corrected. A final promo audit assertion failed for the Pokémon Futsal Collection alias until that alias was routed out of boosters.

## Verification
### Focused regressions
The focused rarity / promo / pack-policy / release group completed with:
- **13 tests passed**
- **0 failed**

Covered:
- historical small-pack behavior;
- promo routing;
- canonical rarity classification;
- pack policy and collation;
- Dragon Vault normalization;
- no-rarity special products;
- McDonald's Promo-labelled cards;
- Best of Game and Futsal promo routing;
- v0.35.12 release metadata.

### Full project runner
`npm test` starts normally and passes `adventure-battle.test.cjs`, then stops at `adventure-core.test.cjs` because this extracted workspace does not have the declared Playwright package installed (`MODULE_NOT_FOUND: playwright`). Browser-suite success is therefore **not** claimed.

### Non-browser regression suite
Every test program that does not import Playwright / `recovery-browser.cjs` was run independently after the final source changes:
- **221 passed**
- **21 Playwright-dependent programs skipped**
- **0 failures**

### JavaScript syntax
- `card-rarity-v0253.js` — PASS
- `card-art-library-v0165.js` — PASS
- `pack-policy-v0343.js` — PASS
- `card-acquisition-v0246.js` — PASS

### Offline asset integrity
- Authentic Arcade scenes/sheets/crops: **44** — PASS
- Offline Arcade sprites: **2,098** — PASS
- Unretouched Arcade actors: **2,078** — PASS
- Local venue assets: **8** — PASS
- Adventure assets: **829 images / 1,025 species / 386 backs / 37 objects** — PASS
- Fossil Museum assets: **42 images** — PASS

## Release metadata
- applicationId: `com.example.luckydex`
- versionCode: **3512**
- versionName: **0.35.12**

No Android Gradle build success is claimed from this local environment. The release ZIP is packaged flat for the existing GitHub Actions Gradle build flow.
