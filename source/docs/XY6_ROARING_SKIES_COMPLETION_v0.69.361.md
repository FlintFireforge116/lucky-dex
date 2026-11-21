# LuckyDex v0.69.361 — XY Roaring Skies completion / independent cross-era check

## Scope and baseline

This patch builds directly on v0.69.360 (GitHub APK run #649: success). Roaring Skies `xy6` uses the pinned official source Git blob `5eab0c0148a5cb52dd7005628aa61c793ec0d930`. The catalogue has **112 distinct prints** (#1–110 plus #77a and #92a), 147 printed attacks, 15 printed Abilities and 12 Ancient Traits. Stages 1–8 already integrated the distinct artwork prints, Δ rules, Sky Field, Double Dragon Energy, and the battle engine's other Roaring Skies interactions.

This final pass enables the remaining previously gated effects. **The official generated-catalogue check runs in GitHub**, since this source ZIP does not contain the downloaded official XY6 catalogue or Android APK. On the build runner the check must report exactly 112 battle-enabled/deck-eligible prints with no gated cards; otherwise the APK build fails.

## Newly completed gameplay

- **Banette #31 — Tool Concealment**: while a non-suppressed Banette is in play, the effects of **all Pokémon Tool cards on both sides** are blank. They remain physically attached (occupy Tool slots, can be discarded/moved, count as attached for printed checks). Shared passive modifier, damage reduction, weakness, resistance, retreat, trigger, Wide Lens, Healing Scarf, Spirit Link, and older special Tool paths now honour global suppression. Removing/suppressing Banette restores Tool effects. Ordinary Pokémon Abilities, attacks, Stadiums and Special Energy are not themselves disabled by Tool Concealment. A Garbotoxin Ability with its required physical Tool attachment is able to suppress Banette, even when that Tool has no effect; the attached Tool is not silently discarded.
- **Togetic #44 — Go Fetch**: recycles **up to three real Basic Energy units/cards** from its owner's discard into the separate ordered Energy Zone. Each selectable Energy type is backed by an actual discarded unit; no Energy is manufactured and no Special Energy is counted as Basic Energy. Remaining discarded Energy and the Special Energy card identity are preserved. The Energy Zone is shuffled after the choices, and the next Zone Energy is refreshed.
- **Autobuilder**: avoids automatically adding Pokémon Tools to a constructed deck already containing Banette #31; manually selected cards are retained. This is a targeted synergy safeguard, not a prohibition against players using their own Tool cards.
- **Battle choice UI test maintenance**: corrects a stale older assertion so the regression suite checks the current accessible choice-label fallback rather than a removed HTML implementation detail. No choice functionality is removed.

## Validation

`tests/v07361-roaring-skies-completion.test.cjs` checks physical Tool attachment vs active Tool effects, Wide Lens and Healing Scarf suppression, Mega Spirit Link turn-ending, selected physical Basic Energy recovery, deckbuilder gating and generated-catalogue completeness. The Gradle task `auditXY6CompletionForApk` depends on Stage 8's existing chain and runs during the APK build, after official card data is generated.

A combined local Node test selection covering all Roaring Skies stages plus historic Tool, Energy, Prize, choice UI and deck quality suites produced **131 passed, 0 failed, 4 skipped** (the skipped checks need build-generated card catalogue assets). JavaScript/Python syntax and ZIP integrity checks should also be performed on final packaging. The full GitHub APK for v0.69.361 remains **unverified** until pushed.

## Installation (Termux)

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.361_ROARING_SKIES_COMPLETION.zip -d source
git add source
git commit -m "LuckyDex v0.69.361 Roaring Skies complete and Tool audit"
git push origin main
```

## Future independent audit

Passing all current mapped-effect tests confirms coverage within the project's existing test harness, not that every conceivable cross-era card combination has been simulated. After a successful APK build, sample manual matches should include Banette vs modern and early-era Tools, Togetic with multiple Basic Energy types in discard, and CPU decks built around Sky Field/Dragon Energy. Do not enable any new set before its own build checks are added.
