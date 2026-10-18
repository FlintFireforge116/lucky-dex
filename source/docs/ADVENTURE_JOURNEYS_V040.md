# Adventure 3.0 persistent journeys — v0.40.0

`adventure-journeys.js` owns the authored geography for Kanto, Johto and Hoenn. It uses the existing registry's Gym cities, teams and encounter pools; it does not create campaigns for later regions. Each Gym chapter has four or five named sections. A short Victory Road chapter follows the eighth Gym, then four Elite Four battles and the Champion. Seeded randomness chooses local Pokémon, rare sightings, event outcomes, shiny rolls and typed TMs; it never changes the sequence of main locations.

## Save ownership

`adventureRegional.schema` is 2. Its `journeys` map contains independent `kanto`, `johto` and `hoenn` journeys or `null`. `activeRegion` selects one. `active` is a compatibility alias for `journeys[activeRegion]`; `ensureSave` rebinds the alias after JSON serialization. `records` and `last` retain existing historical information.

Each journey records `chapterIndex`, `sectionIndex`, main-section `depth`, `location`, `checkpoint` (`id`, `name`, `chapterIndex`), permanent `completedBadges`, numeric `badges`, `completedCheckpoints`, `completedLocations`, permanent visited IDs in `completed`, current traversal IDs in `traversalCompleted`, persistent `claims`, result `resolutions`, `finaleProgress`, `eliteWins`, `completedAt`, and `rewardClaimed`. `party`, `reserveParty`, `leadKey`, `battle`, seeded nodes and remaining HP/PP/status are serialized. `loot` is a ledger of already committed rewards, rather than a purse paid on departure.

The main next section and its local detours share a depth. Advancing a main section increments depth. Advancing an optional discovery leaves depth unchanged. Claim flags survive defeat, replay and reload. Required battle rewards, Gym TMs, supplied items and the Champion clear reward are paid once per journey. Legitimate repeated captures still add owned copies and their existing duplicate-capture EXP.

`completed` records permanent exploration. `traversalCompleted` reflects the current trip: replay clears it, and defeat removes this chapter's traversal. Map progress derives from current depth. Badges and historical completion remain visible independently of traversal.

## Migration

Migration does not call progression normalization on permanent Pokémon. It constructs battle members from copied owned data, preserving existing currencies, inventory, Pokémon levels/EXP/counts, TMs, settings, cards, achievements and Arcade state. An active schema-1 regional journey moves to the safe town of its last earned badge, at the start of the following authored chapter. Zero badges use the starting town. Eight badges use the eighth Gym city and the Victory Road chapter; partial old Elite Four progress restarts from there. Old battle/generated traversal is discarded. Earned badge chapters are marked visited and claimed without grants. Old `loot`, timestamps, records and `last` remain available; records alone do not skip the new campaign.

`adventureV2.activeExpedition` is copied to `retiredExpedition` if no archive exists, then set to `null`. No clear payout is granted. Existing destinations, Wild Hunt chains and historical records are preserved. The model may perform the same retirement first at startup; both paths are idempotent.

## Engine boundary

The shared battle reducer still owns turns, captures and team combat. The regional engine owns journey traversal, rewards and checkpoint recovery. Existing signatures remain: `ensureSave(save)`, `start(save, region, seed)`, `available(journey)`, `current(journey)`, `enter(save, nodeId)`, `resolveNode(save, choice)`, `act(save, command, args)`, `settleBattle(save)`, and `advance(save)`.

Additional methods:

- `resume(save, region)` selects an existing independent journey; `start` resumes an existing journey without overwriting it. Switching regions is blocked during an active encounter.
- `journey(save, region)` reads one journey; `chapter(journey)` returns its authored chapter or `null` during the League.
- `summary(journey)` returns `currentLocation`, `name`, `nextObjective`, `nextDestination`, percentage `progress`, chapter title `chapter`, `chapterIndex`, `sectionIndex`, total chapter `sections`, `badges`, `totalBadges`, checkpoint name and available `detours`.
- `levelCap(journey)` returns `min(50, 8 + chapterIndex × 4)`; `member(owned, key, cap)` creates a copied battle member with explicit `ownedLevel`.
- `syncParty(save)` applies owned team changes outside battle while preserving journey move slots, remaining PP, status and HP ratio. Removed members remain in `reserveParty`, so removal and re-addition do not heal them.
- `defeat(save)` heals the party and reserves, resets traversal to the current safe checkpoint, and stores `recovery.text` for the UI. It preserves permanent EXP, badges, owned catches and committed rewards. League defeat restarts the League at its safe Center without repeating route chapters.
- `replay(save, region)` reopens a completed campaign's traversal while retaining claims and completion records. No one-time rewards can repeat.
- Compatibility `retreat(save)` preserves the journey; `restart(save)` deselects it rather than deleting progress.

Wild Hunt detour nodes include `habitat`. The UI opens the atmospheric Wild Hunt scene directly, retaining the journey location/depth. Shopping uses the shared Poké Mart transactions; battle remains locked against Party or move changes.

## Verification

Explicit migration and journey tests were observed failing against schema 1 before production edits. Migration fixtures cover Kanto zero/one badge, Johto three badges and Hoenn eight badges; they verify literal safe towns, unchanged unrelated state, no reward duplication, retired Expedition state and idempotence. Additional programs cover all three Champions, seeded encounters and authored topology, independent region resume, battle serialization, persistent cache claims, defeat/reload, capped duplicate catches, separate move slots and removal/re-addition injury, flee and completed campaign replay. Actual battle balance evidence is in `artifacts/v0400/regional-balance.json` and `ADVENTURE_BALANCE_V040.md`.
