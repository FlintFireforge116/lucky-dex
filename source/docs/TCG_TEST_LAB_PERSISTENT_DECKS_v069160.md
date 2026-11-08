# Test Lab saved decks — v0.69.160

Test Lab deck libraries now persist in the existing LuckyDex save file. Each has its own active selection:

```json
{
  "tcgTestLabDecks": {
    "schema": 1,
    "pocket": {"decks": [], "activeDeckId": null},
    "classic": {"decks": [], "activeDeckId": null}
  }
}
```

Only decks and active-deck identifiers are saved; Test Lab game statistics, fake ownership, opponent settings, and battle results remain transient. The normal `tcgpBattle` and `tcgClassicBattle` saved decks and actual `cards` collection are never replaced by this data.

Flow: open Test Lab → restore independent saved libraries into temporary battle state → open Pocket or Classic builder → **Save** → persist only both Test Lab libraries to `state.tcgTestLabDecks` → ordinary LuckyDex save. Leaving or reopening the lab restores active selections, drafts and card lists. Old saves without this object default to empty Test Lab libraries. Normal deck builder behaviour (owned card checks) is unchanged.

Device QA: create named Test Lab Pocket and Classic decks using cards you do not own, save both, exit Test Lab and verify the ordinary Decks panel is unchanged, reopen Test Lab, check both decks and active selections, restart app, check again, edit and save, duplicate/rename/delete, play a practice battle, verify no rewards or recorded wins.
