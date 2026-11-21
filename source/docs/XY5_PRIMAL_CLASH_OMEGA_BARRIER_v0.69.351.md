# XY5 Primal Clash — Stage 8 / v0.69.351: Ω Barrier completion

Baseline: public GitHub Actions #639 (v0.69.350) completed successfully. This patch does not reintroduce external GitHub API downloads; pinned catalogue sourcing remains unchanged.

Final six previously gated prints: xy5-9 Sceptile, xy5-24 Magcargo, xy5-60 Electrike, xy5-77 Rhyperior, xy5-86 Primal Groudon-EX and xy5-151 alternate art. Their existing attacks are already represented by strict verified mappings. The Ω Barrier Ancient Trait is now declared supported, making them eligible for battles and the automatic deck builder.

### Protection and semantics

Item/Supporter *played by an opponent* cannot modify this Pokémon, regardless of whether the card uses a generic effect, one of the many era-specific legacy handlers, or a continuation after a choice. The engine rejects direct target paths, retains original protected slot identity and cards, and guards against accidental legacy writes. Forced switches, random damage/Energy effects, selected Bench damage and Energy movement have explicit guards. Normal nonprotected Pokémon remain valid Trainer targets. Opposing Pokémon Tools and Stadiums and Pokémon attacks are unaffected by Ω Barrier. Own Trainer effects remain unaffected.

The engine does not blanket-disable the opponent's Trainer cards or their unrelated deck, hand or self-Pokémon effects. A choice that would have no valid unprotected target is suppressed instead of presenting an empty effect modal.

### Tests and build

`tests/v07351-primal-clash-omega-barrier-audit.test.cjs` checks all six printed IDs, authentic descriptors, mixed target lists, opposing Items/Supporters vs exempt Trainers, and no impossible forced-switch prompts. Gradle `auditXY5ForApk` runs this alongside the corrected historical Primal Clash suites. Coverage will be 164/164 only after GitHub generates from pinned official prints; no fabricated source data added.

The prior stage documents are retained as historical release notes. This document supersedes their statements that Ω Barrier remained gated.

### Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.351_PRIMAL_CLASH_OMEGA_BARRIER.zip -d source
git add source
git commit -m "LuckyDex v0.69.351 Primal Clash Omega Barrier completion"
git push origin main
```
