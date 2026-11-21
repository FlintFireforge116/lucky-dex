# LuckyDex v0.69.349 — XY5 Primal Clash Stage 7: six remaining non-Ω Barrier prints

## Source and release scope

Based on the previous v0.69.348 source and its pinned, official 164-print `xy5` catalogue. This patch does **not** embed a fabricated catalogue or replace the official source. At APK build time, `scripts/build-xy5.py` regenerates `tcg-classic-primal-clash.js` from the verified source; then the XY5 audit suite gates asset merge.

**Newly implemented and deck-eligible (six prints):**

| Print | Card | Printed mechanic and implementation |
| --- | --- | --- |
| xy5-3 | Beedrill | Allergic Shock: mark the Defending Pokémon; on the attacker's *next turn*, any positive attack damage to that same Pokémon knocks it out. Switching or evolving clears the effect; prevented/zero damage does not trigger it. |
| xy5-29, xy5-146 | Camerupt-EX | Explosive Jet: choose a count of *actual* Fire-providing Energy cards attached to **any allied Pokémon** before attack damage, 50 damage per chosen card; then choose and discard each actual card. Basic Energy uses its real typed Energy Zone discard ledger; Special Energy is removed from the slot into physical discard. The zero-card choice remains legal. |
| xy5-91, xy5-152 | Sharpedo-EX | Hunt: choose an actual enemy Benched Pokémon, switch it into Active **before** the 30 attack damage and its weakness/resistance calculation. No invented target or uncontrolled switch. |
| xy5-128 | Exp. Share | Triggered by an opponent attack knocking out your Active. Before the knocked-out Energy is discarded, optionally move one Basic Energy to a Benched Pokémon with Exp. Share, keeping the Tool attached. Reuses the Next Destinies `bw4:expShare` continuation and existing physical Energy handling. |

**Remaining intentionally gated (six prints):** `xy5-9`, `xy5-24`, `xy5-60`, `xy5-77`, `xy5-86`, `xy5-151` have the **Ω Barrier** Ancient Trait. Generic Item/Supporter-target protection exists but bespoke handlers for all legacy Trainer eras have not been conclusively audited. The engine must not turn them battle-ready or let the CPU build decks with them until every legacy target-changing Trainer handler respects Ω Barrier.

Expected catalogue **after the pinned official source is generated:** 158 battle-ready out of 164 printed. The source is not cached inside the downloadable patch; 158/164 must be confirmed by the GitHub build's `generateXY5ForApk` and `auditXY5ForApk` jobs. Never treat a skipped catalogue test in an offline environment as a CI result.

## Engine, CPU and deck-building implications

- `scripts/xy5_verified.py`: map the exact new printed attacks and Exp. Share Tool; alternate art uses its own card ID and matching rule.
- `tcgp-battle-effects.js`: explicit target/card-count choices, discard Energy from the real owner, delayed Beedrill marker, and Hunt pre-damage target selection.
- `tcgp-battle-core.js`: knock-out-phase Exp. Share option and Beedrill delayed KO; keep all ordinary prize/turn sequencing in place.
- `tcgp-battle-ai.js`: distinguish attack actions with different `effectSelection`/`copiedEffectSelection`; score Camerupt's chosen variable damage on Beginner; the other AI levels use actual future-state evaluation.
- Generated card `battleEnabled` and `deckEligible` flags are derived from descriptor and Ancient Trait implementation, so they permit the six completed prints and keep all six Ω Barrier prints out of autobuild.
- Do **not** add speculative damage/deck synergy metadata to the pinned print catalogue. No raw deck search for Basic Energy: the existing Energy Zone conventions remain authoritative.

## Regression evidence and build requirements

Local `node --test` XY5 suites (`v07343` through `v07349`) and existing cross-set suites (`v07329`, `v07333`–`v07336`, `v07339`, `v07341`, `v07342`) passed. The new `v07349` suite covers exact descriptors, delayed knockouts, choices, transferred/retained physical Energy, alternative prints, target switching, and CPU action identity. Tests that need the generated official 164-print source are **skipped offline**; their assertions run during GitHub's pinned source generation before the APK asset merge. No Android APK or GitHub Actions build was executed locally.

## Termux update (unzip into `source`, not repository root)

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.349_PRIMAL_CLASH_STAGE7.zip -d source
git add source
git commit -m "LuckyDex v0.69.349 Primal Clash Stage 7"
git push origin main
```

Once the GitHub APK build succeeds, check the generated coverage report `docs/XY5_BUILD_COVERAGE.json` for 164 total / 158 battle-ready / precisely the six Ω Barrier IDs gated. Next stage: systematically audit every older Trainer effect path and release the remaining Ω Barrier prints only after passing those regression tests.
