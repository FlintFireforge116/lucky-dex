# LuckyDex v0.69.303 — Noble Victories independent audit

**Base:** v0.69.302 Noble Victories patch. **Output:** v0.69.303 source-relative ZIP.

## Independent results

- **102/102 Noble Victories prints remain enabled**, with all 153 attacks and 12 Abilities registered and the correct print identities retained.
- **322/322 synthetic Noble Victories smoke scenarios executed**, no skips and no resolution exceptions; zero catalog/schema errors and warnings.
- **16/16 static sampled CPU decks valid** in the set audit. A separate **810-deck generation sweep** (9 archetypes × 90 seeds) found no orphan Restored/Fossil combinations or inaccessible V-create-only prints after correction.
- **196/196 cross-era Node regression tests passed**, from Triumphant through Noble Victories. These include five new independent test groups. All 33 dedicated Noble Victories tests passed.
- **37 existing static review flags remain** for specialised interactions. Passing synthetic tests is not proof of every live effect, user choice, CPU turn or mobile presentation.

## Confirmed defects corrected

### 1. Orphan Fossil Items and unbuildable Restored lines

Before this audit, the general Trainer filler could include **Cover Fossil (#90)** and **Plume Fossil (#93)** without any matching Pokémon, while focusing on **Tirtouga (#25), Carracosta (#26), Archen (#66), or Archeops (#67)** could fail to form an evolution family. The builder recognised older `playFossil` cards as roots but did not recognise these two new `neoRule` Fossil Items.

The shared builder now treats Cover Fossil → Tirtouga → Carracosta and Plume Fossil → Archen → Archeops as complete prerequisites. It inserts the proper Item with its line and rejects orphan Fossil Items and orphan Restored Pokémon. We verified focused builds for all six cards and sampled 810 CPU decks after the fix.

### 2. Victini V-create cannot function with the default three-slot Bench

**Victini (#15)** has the printed attack **V-create**, which deals damage only with **five** friendly Benched Pokémon. LuckyDex Classic's default battle board currently allows **three**. Before this audit, the CPU builder could put this single-attack Victini into ordinary BW3-only decks, making it an unusable attacker. The builder now prevents this in ordinary generated decks and gives a clear explanatory error on focus attempts without an explicit five-slot Bench route. The attack itself remains unchanged to preserve its printed condition.

**Unresolved design question:** The project's master rules already flag the disagreement between the historical five-Bench design and current three-Bench implementation. This patch does **not** silently change the battle format or rewrite V-create into a three-Bench attack. Live UI and rules verification is needed before changing that global limit.

### 3. Mysterious Evolution was missing its decline affordance

**Karrablast (#8)** and **Shelmet (#11)** say that, with the counterpart in play, they can search their deck and evolve. Their deck search now explicitly supports declining the optional selection rather than forcing the player to pick an evolution card. The new regression checks actual physical deck selection and preservation of the evolved card ID.

### 4. Inconsistent Android and JavaScript version markers

The latest Gradle version was v0.69.302, but `app-v0167.js` still declared the v0.69.301 build. This failed an older cross-era integration test when checked against the updated build version. `app/build.gradle`, `index.html` and `app-v0167.js` now consistently declare **v0.69.303**. The older test passes again.

## Files changed

- `app/build.gradle` — versionCode 7303; mandatory new independent test in `auditBW3ForApk`.
- `app/src/main/assets/tcg-classic-deck-builder.js` — Restored Pokémon/Fossil lineage and usable V-create selection.
- `app/src/main/assets/tcgp-battle-effects.js` — optional Mysterious Evolution deck-card choice.
- `app/src/main/assets/index.html` and `app/src/main/assets/app-v0167.js` — matching visible and runtime version markers.
- `tests/v07303-noble-victories-independent-audit.test.cjs` — reproducible regression coverage.
- `docs/LUCKYDEX_MASTER_RULES.txt` — the printed-rule and unresolved Bench-format distinctions.
- This audit report, also included at `docs/NOBLE_VICTORIES_v0.69.303_INDEPENDENT_AUDIT.md`.

## Verification limits

This is a **source-level** independent audit. The actual GitHub Actions build, install/signature status, and on-device battle UI have **not** been tested. The 37 static review flags require further targeted gameplay verification; the audit does not establish exhaustive card-by-card correctness.

## Termux

```bash
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.303_BW3_NOBLE_VICTORIES_AUDIT.zip -d source

git add source
git commit -m "LuckyDex v0.69.303 Noble Victories independent audit"
git push origin main
```
