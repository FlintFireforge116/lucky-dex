# LuckyDex v0.34.3 Release Design

## Goal

Ship one coherent v0.34.3 release from the verified v0.34.2 baseline that improves Pokémon Dash race feel/course identity, refreshes Trade every hour instead of every four hours, and replaces the rigid physical/Pocket pack generator with a data-driven collation + pricing + rarity/reveal model.

## Baseline and constraints

- Baseline source: `LuckyDex_source_v0.34.2.zip`.
- Keep Android application/package identity unchanged for in-place updates.
- Preserve all existing saves, collection ownership, sealed packs, currencies, achievements, Adventure progress, Arcade progress, and v0.34.1/v0.34.2 stability fixes.
- No online-only pack simulation: cached/installed sets must still open when the current code already supports them offline.
- No promo cards may become ordinary booster pulls unless the real product explicitly collates them into that pack.
- Existing Card Binder set-picker redesign remains unchanged.
- Current God Pack system remains a separate pack-level LuckyDex event; normal pack realism must not accidentally increase its frequency.

## Research basis for booster structure

LuckyDex should model the product structure first, then tune gameplay economy around it.

Authoritative/current rules used by the design:

- Current international Scarlet & Violet-era boosters contain 10 game cards: 4 commons, 3 uncommons, and 3 foil cards, with at least one rare-or-higher card; there is also a Basic Energy and code card, which LuckyDex does not need to add to the collectible card count unless the Energy belongs to a special set product.
- International Base Set through Neo Destiny boosters contained 11 cards.
- e-Card and EX Series boosters contained 9 cards.
- Diamond & Pearl onward standard boosters contain 10 game cards.
- Sun & Moon onward added a Basic Energy in the physical product, but LuckyDex should keep ordinary Energy outside the collectible pack result unless the set/product makes the Energy itself part of the collectible experience.
- Generations packs contained 10 cards, specifically 8 core-set cards plus 2 Radiant Collection cards.
- Dragon Vault packs contained 5 cards.
- Double Crisis packs contained 7 cards.
- Detective Pikachu packs contained 4 Holofoil cards.
- Celebrations packs contained 4 cards, with Classic Collection integrated into those packs rather than treated as a separate booster product.
- 30th Celebration packs contain 5 foil set cards plus 1 foil Basic Energy; the 30th Classic Collection is integrated into those packs.
- TCG Pocket uses position-specific offering rates and rare-pack behavior, so it must stay separate from physical-TCG collation logic.

Pull rates above guaranteed slot structure are not officially published for physical boosters. LuckyDex may use researched community-style rate families to make eras/sets feel distinct, but must label them internally as simulation profiles rather than “official odds.”

## Architecture

Create a single pack-policy module as the source of truth for:

- pack product/profile resolution;
- pack size shown in UI;
- Lucky Coin price;
- slot composition;
- subset/parent integration;
- high-rarity rate family;
- duplicate/parallel-printing policy;
- rarity reveal profile lookup.

The UI, purchase entitlement, sealed-pack opening, ordinary pack opening, God Pack card count, and pack-format text must consume this policy rather than each deriving their own card count or odds.

TCG Pocket keeps its own pack-policy branch because its five-card/four-card/bonus-card positional model is fundamentally different from physical TCG collation.

## Physical pack profiles

Every physical set resolves to exactly one profile. Resolution order:

1. Explicit set-ID/name exception override.
2. Explicit subset-to-parent mapping.
3. Era/series profile from release date and/or library series metadata.
4. Safe standard-modern fallback if metadata is incomplete.

### Standard era profiles

- `wotc_11`: Base Set through Neo Destiny — 11 collectible cards.
- `ecard_ex_9`: Expedition through EX Power Keepers — 9 collectible cards.
- `dp_bw_xy_10`: Diamond & Pearl through Evolutions — 10 collectible cards.
- `sm_swsh_10`: Sun & Moon through Crown Zenith — 10 collectible game cards; reverse/rare slot behavior reflects the era.
- `sv_10`: Scarlet & Violet onward standard expansions — 10 collectible game cards with 4 Common, 3 Uncommon, 3 foil/replacement slots.

### Explicit special products

- `dragon_vault_5`: 5 cards, all from Dragon Vault; holo-forward presentation.
- `double_crisis_7`: 7 cards.
- `detective_pikachu_4`: 4 Holofoil cards.
- `generations_10_rc`: 8 Generations core cards + 2 Radiant Collection slots.
- `celebrations_4`: 4 cards; Classic Collection is a replacement/subset outcome inside the parent pack.
- `30th_celebration_6`: 5 foil set cards + 1 foil Basic Energy; 30th Classic Collection is integrated into the parent pack.

Special-set profiles may be expanded when the library contains another genuinely non-standard English booster product, but should not be invented solely from set size.

## Subset integration

The following set rows must not behave as independent purchasable boosters when they are actually subsets of a parent product:

- Brilliant Stars Trainer Gallery -> Brilliant Stars
- Astral Radiance Trainer Gallery -> Astral Radiance
- Lost Origin Trainer Gallery -> Lost Origin
- Silver Tempest Trainer Gallery -> Silver Tempest
- Crown Zenith Galarian Gallery -> Crown Zenith
- Hidden Fates Shiny Vault -> Hidden Fates
- Celebrations Classic Collection -> Celebrations
- 30th Celebration Classic Collection -> 30th Celebration

The policy should be extensible for future subset mappings.

Subset cards remain visible/searchable in Collection as their own set identity if that is how the catalogue represents them. Only the booster-shop product and pack collation change.

## Slot model

Each pack profile yields an ordered list of slot descriptors. A slot descriptor defines:

- source pool: parent/core/subset/energy;
- allowed rarity classes;
- optional finish requirement (normal/reverse/holo/etc.);
- weighted replacement families;
- whether a same card ID may appear elsewhere in the pack as a different printing/finish;
- whether the slot is guaranteed to be rare-or-higher.

The pack builder chooses from eligible cards for that slot, not from a global numeric rarity target.

Normal same-print duplicates inside one pack should be avoided when possible. The same underlying card may appear twice only when one appearance is a legitimate parallel/finish variant (for example normal + reverse) and the data model can distinguish that presentation.

## Rarity classification and reveal hierarchy

Audit every rarity label currently present in the physical library and TCG Pocket datasets. Unknown labels must be surfaced by tests/diagnostics instead of silently dropping to a low tier.

The canonical classifier must distinguish at least:

- Common
- Uncommon
- Rare
- Holo Rare / reverse finishes
- Double Rare
- Ultra Rare / Full Art style rarities
- Illustration Rare
- Special Illustration Rare
- Secret Rare
- Hyper / Gold / Crown jackpot styles
- LEGEND
- Prime
- LV.X
- BREAK
- Shining
- Radiant Rare
- Amazing Rare
- ACE SPEC
- Character Rare / Trainer Gallery style art rarities
- Pocket 1–4 Diamond, 1–3 Star, Shiny tiers, Crown, and any current bonus-only symbols in the dataset

Historic classes do not have to collapse onto the same linear semantics if their identity is better represented by a dedicated reveal style.

### Required presentation ordering

At minimum:

- Double Rare gets a clear but restrained hit reveal.
- Ultra Rare is stronger than Double Rare.
- Illustration Rare is visually more special than Ultra Rare, with art-focused anticipation and payoff.
- Special Illustration Rare is a substantial jump above Illustration Rare.
- LEGEND is a top-end historical chase with a dedicated `LEGEND PULL` treatment, not an unknown rarity and not a generic Gold clone.
- Secret/Hyper/Gold/Crown remain jackpot-tier presentations.
- Finishes (reverse/holo/textured) decorate the reveal but do not incorrectly promote a low printed rarity into a higher printed-rarity class.
- God Pack remains a pack-level intro plus each card's own reveal treatment.

Reveal profiles should vary in motion, timing, rays/ribbons/particles, palette treatment, haptics, labels and payoff—not merely particle count.

## Physical high-rarity simulation

Guaranteed pack structure should be historically grounded. Above those guarantees, chase rarity frequency is a LuckyDex simulation informed by known/community pull-rate patterns.

Use named rate families, not one universal `hitTierForSource('tcg')` roll. Examples:

- classic/WotC rare-slot family;
- e-Card/EX family;
- DP/BW/XY family;
- SM/SWSH family;
- S&V standard family;
- S&V special/high-density family;
- special all-holo/celebration family;
- explicit HGSS LEGEND family.

Sets may override the era family when their product is known to differ materially.

LEGEND must no longer be reachable at generic unknown/low-tier frequency. Its profile should be a rare HGSS chase result and its exact LuckyDex simulation rate must be documented in code/tests.

## TCG Pocket

Keep Pocket separate from physical profiles.

- Preserve real positional behavior conceptually: cards 1–3 are low-rarity positions; card 4 and card 5 use richer offering tables.
- Preserve rare-pack/God-Pack-style Pocket behavior at its own pack-level probability rather than turning every position into the same weighted tier roll.
- Support known four-card Deluxe behavior and current bonus-card variants if they are represented by the local Pocket dataset.
- Pocket Crown/Star/Shiny/etc. use the same canonical reveal-profile service, but not the physical-TCG collation service.

## Pricing

Remove the global `PACK_COST.tcg = 600` assumption for physical packs.

Price is determined by the resolved pack profile and expected pack value, not set size alone.

Initial LuckyDex gameplay prices:

- `wotc_11`: 650 Lucky Coins
- `ecard_ex_9`: 550
- `dp_bw_xy_10`: 600
- `sm_swsh_10`: 600
- `sv_10`: 600
- `double_crisis_7`: 450
- `dragon_vault_5`: 400
- `detective_pikachu_4`: 325
- `generations_10_rc`: 650
- `celebrations_4`: 375
- `30th_celebration_6`: 500

The special-pack prices intentionally reflect foil/chase density as well as raw card count. A short all-foil pack can therefore cost more per card than an ordinary standard booster.

TCG Pocket keeps its own existing currency price unless the Pocket profile explicitly changes it in this release.

The Pack Shop must display the selected product's actual card count and actual Lucky Coin price before purchase.

Daily free packs and Pack Tickets should still work regardless of the selected profile; they waive the coin cost but do not change collation.

Sealed boosters already owned in Collection open using the correct profile for that set without charging coins/tickets.

## Pokémon Dash v0.34.3 gameplay pass

Keep Codex's Gen 3 asset/course-renderer foundation intact. This pass changes feel and authored course behavior, not visual authenticity.

Required changes:

- Reduce remaining high-frequency racer shake/bob.
- Make Left/Right input begin responding immediately and settle smoothly; no teleporting.
- Reduce racer clumping with small lateral/longitudinal separation logic that does not grant hidden speed bonuses.
- Improve overtaking readability and position-change feedback.
- Make berries phone-readable, remove them immediately on collection, and show a small pickup response.
- Keep road and immediate verge/scenery on the same world plane.
- Improve collision response and short grace/recovery so racers do not snag repeatedly on one obstacle.
- Tune sprint/stamina so optimal play is not simply hold-until-empty/release/repeat.
- Add authored section rhythm using the existing course-data renderer: straights, chicanes/narrowings, bridge/squeeze sections, boost sequences, hazard clusters, alternate/risk lines and environmental set pieces.
- Increase mechanical identity between the 18 Type League courses while preserving the same simple Left / Sprint / Right control scheme.
- Add environmental activity where performant: crossing Pokémon, moving scenery, terrain/weather moments, gates or similar course-specific events.
- Improve final-stretch/finish/close-win feedback without turning Dash into a weapon/item racer.

Strict speed-class eligibility remains unchanged: Pokémon outside the selected speed range must never enter that race.

## Trade refresh

Change the deterministic Global Link Trade market window from four hours to one hour.

- `REFRESH_HOURS = 1`.
- The countdown targets the next local clock-hour boundary.
- The deterministic market slot changes once per hour.
- Failed refresh retry throttling remains 15 seconds and must not create rapid retry loops.
- Existing saves containing a four-hour market are safely invalidated/migrated on first entry after update without deleting ownership or trade history.

## Save compatibility

No destructive save migration.

New policy/profile identifiers may be cached, but old saves without them must resolve profiles dynamically from set metadata.

Existing sealed pack inventory entries store set identity and therefore can resolve the new profile when opened.

Existing cards keep their IDs/counts/first-pulled timestamps and set identities.

## Diagnostics and auditability

Add development/test diagnostics for:

- every physical set resolving to a known pack profile;
- every subset resolving to its parent pack product or being explicitly marked standalone;
- every encountered rarity label resolving to a known canonical reveal profile;
- pack price/card count shown by the shop matching the pack builder;
- LEGEND never resolving as unknown;
- unknown future rarity labels being reported rather than quietly treated as ordinary Uncommon.

## Testing requirements

TDD for production changes.

At minimum add tests for:

1. Era pack sizes: WotC 11, e-Card/EX 9, modern standard 10.
2. Special sizes: Dragon Vault 5, Double Crisis 7, Detective Pikachu 4, Celebrations 4, 30th Celebration 6.
3. Generations produces 8 core + 2 Radiant Collection slots.
4. Trainer Gallery/Galarian Gallery/Shiny Vault/Classic Collection rows do not appear as independent purchasable boosters and are reachable through their parent pack.
5. Scarlet & Violet slot counts: 4 common + 3 uncommon + 3 foil/replacement slots.
6. Pack price follows profile rather than set card-count threshold.
7. Daily and ticket entitlements waive price but preserve selected pack profile.
8. Sealed packs open with the profile of their set and consume no shop currency.
9. LEGEND classification, pull eligibility and `LEGEND PULL` reveal profile.
10. Illustration Rare reveal impact is strictly greater/more elaborate than Ultra Rare and Double Rare.
11. All known physical/Pocket rarity labels in fixtures resolve to non-unknown profiles unless deliberately marked unsupported.
12. Pocket pack positional profiles remain separate from physical pack profiles.
13. Hourly Trade slot/countdown rollover and failed-refresh throttling.
14. Dash steering responsiveness, racer separation, berry despawn, collision grace, sprint/stamina and speed-class eligibility.
15. Full existing non-browser regression suite and asset validators.

Browser/WebView tests should be run when Playwright is available; if unavailable, report that explicitly rather than calling them passed.

## Versioning and deliverable

- Version name: `0.34.3`
- Version code: `343`
- Deliverable: `LuckyDex_source_v0.34.3.zip`
- Include `TEST_REPORT_v0.34.3.md` with exact commands/results and any unavailable browser/Android build checks.
- Preserve the user's versioned-ZIP workflow; do not overwrite older versioned archives.
