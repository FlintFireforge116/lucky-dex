# LuckyDex v0.69.413 — Ultra Prism Stage 9 integration and audit

Cumulative source patch over the working Stage 8 v0.69.412 ZIP. The earlier Stage 5 Prism Star release-gate fix, Stage 4 Special Energy rules, and all Stage 1–8 functionality remain included.

## 27 new exact-text-locked attack mappings

**Torterra:** Earthquake and Giga Drain; **Carnivine:** Chomp Chomp and Loom Over; **Cherubi:** Surprise Attack; **Alolan Vulpix:** Roar; **Magmar:** Controlled Burn and Flamethrower; **Monferno:** Super Singe; **Prinplup:** Bubble Beam; **Snover:** Ice Shard; **Electabuzz:** Thunder; **Manaphy:** Deep Currents; **Electivire:** Steel Short; **Drifloon:** Creepy Wind; **Drapion:** Dangerous Stinger; **Bronzor:** Hypnosis; **Heatran:** Guard Press and Boiling Impact; **Bronzong:** Psychic Resonance; **Type: Null:** Merciless Strike; **Gumshoos:** Identify; **Lickitung:** Lap Up; **Shaymin:** Call for Family; **Oranguru:** Resource Management; **Sneasel:** Sneaky Smash; **Eevee:** Palette of Friends.

The mappings are matched by complete canonical printed rules text, not attack title alone, in `scripts/sm5_stage9_verified.py`; the official SHA-pinned 178-print audit enforces this match before Termux/Gradle generation. Partial cards remain gated if any other printed attack/Ability or Trainer effect is unsupported. This release does **not** claim 178/178 playability.

## Functional safeguards

- **Deep Currents** recovers genuine physical Water Energy card refs from discard into deck. It cannot fabricate Basic Energy from the Energy Zone or steal another type. Water Energy book-keeping is preserved.
- **Resource Management** chooses up to three actual discarded cards and places them on the **bottom** of the deck in chosen order, never shuffling them and never duplicating references.
- **Sneaky Smash** is available only during the first turn of the player who went second; choices include specific opposing Pokémon and an actual attached Basic or Special Energy. Both player and CPU use the same legal-action gate.
- **Giga Drain** heals damage actually dealt after applicable attack prevention; **Loom Over** decreases by ten per own existing damage counter and floors at zero.
- **Guard Press** expires after the opponent's next turn; **Ice Shard** and **Psychic Resonance** use effective defender/team Types rather than printed-only Types; **Merciless Strike** checks damage from before the hit.
- **Call for Family** benches actual Basic Pokémon from the deck, rather than generating cards. **Earthquake** damages your own Bench only. **Identify** reveals a real opposing hand and gains its bonus only when a Pokémon is there.
- Standalone status effects, Energy discard, coin flips and physical top-of-deck discards are validated in live turn transitions.

## Regression results (local source)

| Check | Result |
|---|---|
| Stage 9 actual gameplay tests | **27/27 pass** |
| SM5 Stage 2–9 combined outcomes | **159/159 pass** |
| SM4 Crimson Invasion full gate | **124/124 pass**; all 126 playable |
| SM3 Burning Shadows full gate | **146/146 pass** |
| SM2 Guardians Rising full gate | **114/114 pass** |
| SM1 Sun & Moon full gate | **64/64 pass** |
| XY12 Evolutions full gate | **38/38 + 9/9 pass** |
| JavaScript/Python syntax and Gradle source self-test | **Pass** |
| Cumulative ZIP content integrity | **Pass** |
| Full SM5 178-print pinned-source preflight | **Still requires Termux prepare-sm5.sh**; canonical SM5 compact unavailable in local container |
| GitHub Android APK build | **Not observed** |

All release contracts and preflight version assertions were updated from 0.69.412 to **0.69.413**, with the mandatory `v07434-ultra-prism-stage9-outcomes.test.cjs` wired into both Gradle's release gate and the SM5 preflight. The pinned official source remains Git blob `66cbd13b706b789de3b8cce2f5c9fc95135a33b0`.

## Termux

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.413_SM5_ULTRA_PRISM_STAGE9.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.413 Ultra Prism stage 9" && \
git push origin main
```

If the full preflight fails, do not push; provide the exact Termux output so the generator/test mismatch can be corrected without weakening the release gate.
