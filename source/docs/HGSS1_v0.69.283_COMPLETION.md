# LuckyDex v0.69.283 — HeartGold & SoulSilver Base Set completion

This patch is **additive** to the successful v0.69.282 Stage 1 source.

- All 124 original English collector prints remain present, including 1–123 and secret `ONE`.
- 116 non-Basic-Energy prints can be selected in decks; eight Basic Energy artwork prints remain supported by the separate Classic Energy Zone.
- Every printed attack, Pokémon Power/Body, Trainer and two special Energy effects has a mapped effect. The HGSS1 source fidelity regression enforces printed names, costs, damage text, weaknesses, card IDs and original card abilities.
- Ho-Oh LEGEND (111+112) and Lugia LEGEND (113+114) must be played as matching two-half physical pairs from hand; both halves become one Pokémon and award **two** Prizes on KO. Both halves reach discard when knocked out; neither half is treated as a stand-alone Basic. All CPU difficulties recognise paired placement.
- Lugia Ocean Grow and Elemental Blast operate on genuine physical Energy and exact required types; Ho-Oh Sacred Rainbow changes its effective attached Energy to Fire.
- Feraligatr Prime Rain Dance and Meganium Prime Leaf Trans remain repeatable within a turn. Ampharos Prime Conductivity fires only on opposing hand Energy attachments. Other printed powers use existing event/choice mechanics and/or new HGSS-specific rules.
- Explicit choices remain available for target Pokémon, hand/deck selection and attached Energy movements. Randomly generated CPU decks are 30-card legal, never contain unmatched LEGEND halves, and do not force absent Metal-only archetypes.
- Tests: HGSS source-fidelity + real battle/CPU completion tests, plus legacy Arceus and Supreme Victors regression checks. Independent `audit-classic-set.cjs --set hgss1 --smoke --no-write`: 124/124 enabled, 0 errors, 0 warnings, 0 review flags, 352/356 synthetic actions executed (four skips lacked discarded Energy prerequisite), 14/16 available CPU type/seed checks succeeded, 2 Metal-only combinations skipped because no Metal-type HGSS Pokémon exist.

The independent auditor's synthetic smoke checks are not full physical card QA, and Android UI play/actual GitHub APK compilation require verification after uploading this patch.

The patch is designed to be applied using the regular `unzip -o ... -d source`, followed by `git add source`, `git commit`, and `git push origin main`.
