# LuckyDex v0.69.212 — EX Dragon Frontiers (ex15) staged release

Source baseline: v0.69.211. 12 November 2026.

**Verification:** 38 EX Dragon Frontiers-focused tests and 143/143 combined adjacent EX/deck-builder regression tests passed; CPU generated 63/63 legal example decks across nine archetypes. Node tests do not substitute for Android playtesting.

Registered 101 English cards; 82 battle-enabled; 19 clearly flagged PARTIAL and excluded from automatic/live decks. Full collector-number ledger and exact blockers in `docs/EX_DRAGON_FRONTIERS_v0.69.212_RULES_AUDIT.md`.

Includes ex15 Holon Energy reprints FF/GL/WP, δ Rainbow, Boost, Scramble, Crystal Beach compatibility, optional card searches, Trainer choices, responsive Bench effects, ability use, attack restrictions and CPU/type-aware deck metadata. 30-card Classic decks retain separate Basic Energy Zone; don't conflate physical Energy with this zone.

Conservative release gate: Among the 19 partials, notable outstanding mechanics include Feraligatr δ pre-damage Drag Off switch, Ampharos δ global identity, Milotic δ's opponent Supporter copy, Snorlax delayed status, Dragonite ex selective damage, Gardevoir ex Imprison and Mew ★ copied attack rules. These are not advertised as fully working.

Previous Crystal Guardians partials Delcatty ex, Swampert ex, Alakazam ★, Celebi ★ remain unresolved. No Android handset testing performed, no GitHub push performed.

## Install incremental patch

Download `LuckyDex_patch_v0.69.212.zip` and unzip its paths relative to `~/lucky-dex/source`:

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.212.zip -d source
grep 'versionName' source/app/build.gradle
git add source
git commit -m 'LuckyDex v0.69.212 EX Dragon Frontiers'
git push origin main
```

You must have v0.69.211 already applied. To use an older source, use `LuckyDex_full_source_v0.69.212.zip` instead.
