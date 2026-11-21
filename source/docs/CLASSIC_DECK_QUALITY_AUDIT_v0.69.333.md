# LuckyDex v0.69.333 — Classic deckbuilder quality audit

## Findings

- Reviewed the **shared** Classic builder and its Trainer role metadata across Base, Gym, Neo, e-Card, EX, Diamond & Pearl, Platinum, HGSS, Black & White and newer locally populated sets.
- Old fallback selected generic Trainers by static score, commonly as unrelated four-copy playsets; legacy `neoRule` effects often had poor draw/search metadata.
- Gym owner-dependent Trainers, Heavy Ball, Apricorn Maker, Rare Candy, ACE SPEC, Miracle Energy and generic Special Energy fillers needed additional dependency/quantity filtering.
- Some Bench-only Dragon Frontiers partners were mistakenly treated as attackers by Energy-type analysis.

## Changes

- Dynamic marginal Trainer scoring and role saturation penalties; prefer useful varied 1–2 copy Trainer packages before a 3/4-copy emergency fallback.
- Preserve deliberate manual four-copy card choices. Allow larger Pokémon cores only for unusually sparse single-set Trainer pools.
- Check printed owner/dependency constraints. Avoid surplus Special Energy filler and enforce limited-card rules.
- Expand printed-rule Trainer roles and exempt specific Stage 2 ex support-only Bench partners from unnecessary attack-energy splashes.
- Add a permanent preBuild legality/synergy regression test across the locally available catalogue.

## Verification and limits

- 59 populated single-set Classic IDs × 2 styles/seeds = **118** full-deck samples, all legal with compatible Energy. The persistent test also checks **10 mixed-era decks**, **8 CPU-generated decks**, six targeted Trainer-diversity builds, a Bench-only support sample and saved four-copy choices.
- The standalone cross-era sweep had 118/118 legal builds and no dead-effect Trainer entries reported. The permanent test additionally verifies manual retention and tailored dependency checks.
- **BW11, XY1 and XY2** contain build-time data placeholders in the uploaded snapshot and are covered by the pinned set generators and separate build checks, not claimed as tested in the offline 59-set sweep.
- Limited early print pools still sometimes REQUIRE multiple four-copy Trainer lines to make a 30-card deck. A universal two-copy ban would be incorrect.
- Full Android APK build not run locally; GitHub build must still pass. CPU battle decisions and long-match performance were not measured by this automated audit.

Run: `node --test tests/v07333-classic-deck-quality.test.cjs`.
