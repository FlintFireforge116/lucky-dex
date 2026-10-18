# Cosmetics progression audit and contract — v0.44.0

## Baseline and preservation

Audited the supplied v0.43.1 source copied into `LuckyDex_v0.44.0`; filenames ending in `v0413` identify the cosmetics subsystem, not an older release baseline. This pass extends `cosmetics-core-v0413.js` and keeps its registry, public API, achievement reconciliation, pending recognition summary, and card-back renderer.

All 30 existing sleeve IDs remain the catalogue owner's responsibility to retain. The core continues accepting every registered legacy owned ID, preserves an equipped legacy owned sleeve, removes only IDs absent from the registry, and safely falls back to `luckydex-default` for an invalid or locked active ID. Normalisation also preserves unknown fields inside `cosmetics` so future or unrelated saved metadata survives. Existing `discoveredSecrets` and `claimedCosmeticRewards` retain their values, with duplicate string values normalised as before.

The existing four free LuckyDex entries remain free. New rows with `rewardGroup` are locked until evidence qualifies; merely having no `sourceAchievementId` no longer makes them free. `alwaysUnlocked: true` explicitly opts a visible entry into the initial selection. Unknown or malformed progression groups remain locked.

## Evidence audited

| System | Authoritative saved evidence | Deliberately not inferred |
| --- | --- | --- |
| Achievement claims | `profile.achievementClaims` existing stable IDs; existing achievement progress functions in the original reconciliation | New claims, currencies, XP, cards, tickets, or other non-sleeve achievement rewards |
| Regional Adventure | `adventureRegional.records.kanto/johto/hoenn.clears` written after the completed journey's award | A current journey, badges, visited locations, aggregate `adventureClears`, or unsupported later regions |
| Pokémon | `pokemon` values with valid national species IDs; distinct IDs for a dex/family; recorded `types`; shiny records and `stats.shinies` | Duplicate copies counting as multiple dex species; generation labels without every species; event histories reconstructed from ownership |
| TCG / Pocket | `cards`: source, set ID, distinct card ID, and positive finite integer set total | A set without a known total, duplicate card identities, set names alone, or card metadata without identity |
| Packs | Finite positive `stats.packs`, `stats.godPacks`, or matching existing achievement claims | A God Pack reconstructed from owned rare cards or rarity metadata |
| Arcade | Valid recorded recent entries in `arcade.records.games.*.recent` for sampler; `museum.exhibits.*.discovered`; Impact Trial `fullClears` | Aggregate plays or a high score as proof of a full clear; historical results absent from the save |
| Goldenrod | Four saved event IDs: `dash`, `powerTrial`, `impactTrial`, `targetRange`; `divisionTrophies` and `typeTrophies[type][division]` | Merely unlocking a division or Type Cups; invented event/division names; non-medal strings |
| Legacy Dash | `arcade.dash.leagueRecords[type][easy/normal/hard/expert].trophy === 'gold'` | A race win or podium counter as proof of a particular Type Cup gold |
| Secret events | Existing source-achievement reconciliation and existing secret evidence | Reconstructing lost Voltorb gifts, Golden Berry perfect runs, or no-new-card God Packs from unrelated counters |

Goldenrod medals are restricted to `bronze`, `silver`, or `gold`, and divisions to `rookie`, `poke`, `great`, `ultra`, or `master`. Type groups accept the existing 18 Pokémon types. A Type Cup sleeve needs a gold, rather than simply any trophy. This includes Impact Trial's newer durable trophy state without modifying its gameplay, stats, records, or settlement.

Relevant source audited: `cosmetics-catalog-v0413.js`, `cosmetics-core-v0413.js`, `achievements-v0341.js`, `achievements-expansion-v0413.js`, `achievement-telemetry-v0413.js`, `app-v0167.js`, `arcade-goldenrod-state.js`, `arcade-records.js`, `arcade-records-core.js`, and `adventure/adventure-regional-engine.js`.

## Registry rewardGroup contract

| Group | Requirement |
| --- | --- |
| `region:kanto`, `region:johto`, `region:hoenn` | Saved regional clear or corresponding `regional_<region>` claim |
| `dex:1` through `dex:9` | All distinct species in that generation's established achievement range, or `dex_gen_<n>` claim |
| `type:<type>` | Own 10 distinct species whose saved types include that type |
| `collection:species:<national-id>` | Own that valid species; intended for rare/legendary themed designs |
| `collection:family:<id>-<id>[-<id>...]` | Own every specified family member; at least two IDs |
| `collection:starters` | Own species 1, 4, and 7, or existing `v0413_secret_kanto_starters` claim |
| `collection:eevee-family` | Own 133, 134, 135, 136, 196, 197, 470, 471, 700, or existing `v0413_secret_eevee_family` claim |
| `shiny:1`, `shiny:10`, `shiny:25` | Recorded shiny total or currently owned shiny copies reaches the threshold; existing matching shiny claims also qualify |
| `tcg:sets:1/5/10`, `tcgp:sets:1/5/10` | Complete that many sets of the matching source; existing `sets_tcg_10` / `sets_tcgp_5` claims qualify at their exact matching thresholds |
| `packs:50`, `packs:250` | Saved pack counter or existing matching `packs_<n>` claim |
| `god-pack:1` | Saved God Pack counter or existing `god_pack_1` claim |
| `arcade:sampler:8` | Completed recent records in eight games, or existing `v0413_arcade_sampler_8` claim |
| `arcade:museum:20` | Twenty discovered museum exhibits, or existing `museum_exhibits_20` claim |
| `arcade:impact-clear` | Saved Impact Trial full clear, or existing `impact_trial_full_clear` claim |
| `goldenrod:podium` | Any valid recorded Goldenrod medal, or existing `goldenrod_first_podium` claim |
| `goldenrod:division-gold` | Recorded Division Cup gold, or existing `goldenrod_division_champion` claim |
| `goldenrod:master-gold` | Recorded Master Division Cup gold, or existing `goldenrod_master_champion` claim |
| `goldenrod:type:<type>` | Recorded Type Cup gold for that type in a supported Goldenrod event, or a supported legacy Dash league gold |

The slash notation in the table abbreviates distinct literal group strings, e.g. `tcg:sets:1`, `tcg:sets:5`, `tcg:sets:10`.

A row may belong to multiple visual themes, but its single `rewardGroup` identifies the durable unlock rule. Multiple rows may share one group. Group evidence is evaluated once per reconciliation; no new achievement definitions are created.

## Grant, privacy, and recognition behavior

The original achievement-to-sleeve pass remains intact. The added pass reads only persisted evidence and mutates only `state.cosmetics`. It never claims an achievement or applies its coins, dust, fragments, tickets, cards, fixed products, or XP.

A normal progression row uses `progression:v0440:<rewardGroup>:sleeve:<id>` as its stable token. A row bound to an existing achievement uses the original `achievement:<achievementId>:sleeve:<id>` token so both passes share the same identity. Existing ownership and tokens remain valid; repeated reconciliation produces no new grant or token.

Hidden grouped rows must provide `sourceAchievementId`. Existing claims or discoveries remain authoritative. The two family secret groups can discover only their exact existing hidden achievement ID when the actual family condition is satisfied. An arbitrary hidden row never reveals itself from an unrelated group completion. Existing UI secrecy remains keyed by the same source achievement; no hidden condition needs exposing in the catalogue.

Every new sleeve joins the existing `pendingRecognition.sleeves` collection and any legitimately discovered secret joins its achievement collection. The existing summary consumer emits one compact recognition message and consumes it once. The normal locked equip guard remains in force; the pre-existing development-only session unlock behavior is unchanged.

## Focused verification

`tests/v0440-cosmetics-progression.test.cjs` uses the real browser-form core in an isolated VM with the original catalogue and explicit small additional registry fixtures. This makes group behavior testable independently of the concurrent content expansion.

Thirteen focused tests were observed failing before their implementing changes: no-evidence locking, grouped regional grants and idempotence, Goldenrod/Impact/legacy Dash evidence, false historical evidence, physical/Pocket set completeness, species/type/dex/shiny evidence, secret discovery privacy, durable claims, malformed saved data, legacy migration preservation, complete family requirements, malformed group suffix rejection, and rejection of boolean/array counters and species IDs.

The focused command below passed all 36 tests at implementation handoff:

```text
node --test tests/v0440-cosmetics-progression.test.cjs tests/v0413-cosmetics-core.test.cjs tests/v0413-achievements.test.cjs tests/v0430-goldenrod-type-trophies.test.cjs tests/v0436-impact-trial.test.cjs
```

The release owner runs the complete project suite and browser verification after integrating catalogue, UI, and assets. This document does not claim those release-wide checks have completed.


## Card-back integration audit and browser regression

The complete current JavaScript/HTML/CSS search for card-back, face-back, unrevealed, and face-down surfaces found these genuine TCG backs:

- Cinematic pack reveal: `.pack-face-back` and `.pack-unrevealed-cover`, created by `LuckyDexPack.mountReveal`.
- Static/recovered pack reveal: `.pack-face-back`, created by `LuckyDexPack.mountFallbackReveal`.
- Trade exchange: both outgoing and received `.trade-fx-back` faces, created through the existing `fxCardBack()` shared helper.

The pack runtime deliberately keeps its original fallback emblem markup. Its existing `cosmetics-v0413.css` pseudo-element overlay applies `--luckydex-active-sleeve` to both pack back selectors. Actual Chromium computed styles and image decoding confirmed this works on the cinematic back, unrevealed cover, and recovered/static back. No pack or Trade source change, new observer, or front-card overlay was needed.

A real-browser failing test confirmed one API issue: after a Trade animation had mounted the shared helper's image, calling `equipSleeve` updated the pack CSS variable but left the existing Trade back images and sleeve IDs stale. `applyActiveSleeveCss` now refreshes only mounted `.lucky-sleeve-back-inner` wrappers: their stable sleeve ID and image source track the active registry entry. Their fallback layer remains intact; an image removed by an earlier load error can be recreated. This uses the same existing hooks: `equipSleeve` calls `applyActiveSleeveCss`, and bridge installation/application load can call it directly. No gameplay hooks, transaction logic, save writes, or animations were changed.

`tests/v0440-card-backs-browser.test.cjs` runs the actual application in Chromium at 360 × 800, with only local assets routed and external requests blocked. It exercises the actual pack mount APIs and the actual Trade accept → in-app confirmation → receive animation flow with a small offline trade fixture. It verifies decoded selected art, immediate switching, no changes to face-up card images, a rejected locked equip, exactly one committed trade, and the normal cover hide after reveal.

A separate browser context also loads a serialized v0.43.1-shaped save through the real app startup path. It preserves all 30 legacy owned IDs, equipped `already-got-em`, prior tokens/discoveries, nested sentinels in cosmetics/profile/inventory/stats/Arcade/Goldenrod event records/Regional Adventure/telemetry, and actual Impact Trial stats/trophies and currencies. Impact Trial's baseline normalizer intentionally keeps its declared stats rather than arbitrary unknown per-game fields; the regression checks its real saved fields without modifying that normalizer.

The stale Trade test was observed RED with both mounted IDs remaining `luckydex-midnight` after equipping `luckydex-pixel`, then GREEN after the minimal core refresh. The pack cases characterized the already-working CSS integration. All five browser cases pass. On this host the test uses bundled Playwright via `NODE_PATH=C:/Users/sjwal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules` and the existing recovery-browser launcher.
