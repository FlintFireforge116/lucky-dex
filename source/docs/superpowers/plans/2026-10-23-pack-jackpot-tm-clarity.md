# Pack Jackpot + TM Clarity Implementation Plan

**Goal:** Make jackpot-grade physical TCG pulls meaningfully rarer without making LuckyDex realistic-to-a-fault, and make shared/permanent TM behavior obvious in the Adventure move UI.

**Architecture:** Preserve existing pack rarity classes and TM inventory semantics. Add a second-stage physical `secret` target refinement that gates jackpot-labelled secrets to one sixth of existing secret-hit opportunities and downgrades to the best available non-jackpot hit when a set contains only jackpot secrets. Keep one shared TM inventory and surface its Collection/Journey permanence in the TM list and confirmation copy.

**Tech Stack:** Vanilla JavaScript, Node `node:test`, Android WebView assets.

**Global Constraints:** Preserve saves; no new TM inventory; do not alter Pocket collation; no changes to Adventure battle/move-learning mechanics beyond explanatory UI; bump release metadata consistently.

### Task 1: Jackpot-grade physical secret gate
- Write failing policy tests for jackpot vs ordinary Secret targeting and single-jackpot downgrade.
- Add deterministic target refinement/matching helpers to `pack-policy-v0343.js`.
- Use the refined target plan in `app-v0167.js` physical pack selection.
- Run pack collation regressions.

### Task 2: TM permanence clarity
- Write failing Adventure-tools tests for shared/permanent TM copy.
- Add explanatory TM Case copy and explicit confirmation scope wording.
- Run progression/tools regressions.

### Task 3: Release
- Bump to v0.69.19 and Android versionCode.
- Run release consistency, syntax, pack, Adventure move tests, ZIP integrity.
