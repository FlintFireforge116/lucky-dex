# LuckyDex v0.69.373 — Ancient Origins complete (XY7)

## Source and release

- Incremental patch **over v0.69.372**, Android `versionCode 7373`, `versionName 0.69.373`.
- Canonical source is the pinned PokémonTCG `xy7.json` Git blob `4c7169ef5ef7e30f38fb074b2ee2b4009581fab4`, verified at Git commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`.
- All **101 printed XY7 identities** (1–100 plus 75a) have explicit, tested descriptors for their attacks, Abilities and relevant Trainers/Energy. The final seven previously gated prints are enabled. The asset generator is unchanged and creates the authenticated catalogue during APK CI; a placeholder catalogue in the source tree does **not** represent final build coverage.
- `auditXY7ForApk` now runs the new stage-completion test **after** `generateXY7ForApk`, and checks that the final generated catalogue contains exactly **101 battle-ready / 101 prints, no gates**. This full-catalogue assertion is deliberately skipped locally when only the build-time placeholder exists.

## Last seven cards

1. **Bellossom #4 — Flower Tornado:** optional repeated selection to move eligible Grass Energy (including Special Energy providing Grass) between distinct friendly Active/Bench Pokémon; no silent auto-movement. Uses shared `redistributeEnergy` mechanic.
2. **Magikarp #19 — Epic Splash:** exactly two visible coin flips; **both heads** are required for 30 damage. If either is tails, deal no attack damage.
3. **Golurk #41 — Dig Out:** mills the real top physical draw-deck card, with one finite ordered Basic Energy Zone unit sampled as a documented Classic hybrid adaptation when that physical card was not itself Basic Energy. Attaches a genuinely sampled Fighting Energy or moves non-Fighting Energy to the Basic discard ledger. Never creates an extra Energy unit. If the top physical card already is Basic Energy, do not double-sample the Zone.
4. **Sableye #44 — Bewitching Eyes:** presents only Supporters in the **opponent's actual discard** to choose; executes the selected Supporter's effect as this attack (not playing a Supporter from hand) while leaving that card in the opponent's discard. No stuck selection if none exists. Copy-depth protected.
5. **Goodra #60 — Liquid Blow / Shining Breath:** select a specific opponent Active or Benched Pokémon; hit for 20 per point of that Pokémon's printed/modified Retreat Cost (not attached Energy), bypassing Bench Weakness/Resistance. Shining Breath protects its user from Special Conditions through the following opponent turn; the protection expires, and switching/evolving clears it normally.
6. **Porygon #64 — Data Check:** view the genuine physical draw deck as a selectable card list, inspect as many as desired, and choose Done to shuffle. The attack cannot access the opposing player's private deck.
7. **Lucky Helmet #77:** real Pokémon Tool triggers exactly **two draws** when its holder is the Active and suffers positive attack damage from an opposing Pokémon, **even if it is knocked out**. Does not trigger on Bench damage, prevented damage, or non-attack damage. Obeys existing Tool-suppression rules and deck exhaustion behavior.

## Tests and audit boundaries

- Dedicated: `node --test tests/v07373-ancient-origins-completion.test.cjs` — covers attacks, choice UI, finite Energy resource accounting, knockout timing and catalogue eligibility.
- All XY7 stage/CI regressions: `node --test tests/v0736*.cjs tests/v0737*.cjs`.
- Cross-set regression selected: `node --test tests/v0735*.cjs tests/v07361*.cjs tests/v07362*.cjs`.
- Local XY7 stage suite: **124 passed, 0 failed, 5 skipped** (including a generated-catalogue check that runs in GitHub CI). Local selected cross-set suite: **98 passed, 0 failed, 6 skipped**.
- The patch ZIP does not include the build-generated official XY7 asset or normalized source JSON; **GitHub APK build remains unverified until push**. CI regenerates it from the pinned official Git blob and runs the 101/101 coverage assertion before packaging. No claim of a successful APK build is made here.

## Termux installation

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.373_ANCIENT_ORIGINS_COMPLETE.zip -d source
git add source
git commit -m "LuckyDex v0.69.373 Ancient Origins complete"
git push origin main
```
