# LuckyDex v0.69.216 — Classic deckbuilder and choice popup corrections

**Date:** 12 November 2026  
**Baseline:** v0.69.215, patched over the provided v0.69.214 repo source  
**Format:** source-relative changed-files-only ZIP; unzip with `-d source` from `~/lucky-dex`.

## User screenshots reproduced and root cause

1. **Choice popup duplicate Energy description** — the artwork and text fallback were both rendered because a CSS `display:grid` selector overrode the native `hidden` attribute on `.tcgp-live-choice-placeholder`. CSS now explicitly hides `[hidden]` placeholders/images. The label remains accessible and appears only when art is missing or broken. For true action choices with no print artwork, retain readable text.
2. **Lightning Feraligatr with Fighting Meganium** — ex15-2 Feraligatr's `preferredPartners` includes ex15-4 Meganium, but the optional in-play partner path ignored the actual selected Energy. Meganium's attacks need Fighting. The builder now requires normal metadata-only partners to fit the attacking Energy plan; genuine printed *in-play* dependencies remain eligible as Bench-only off-type support where justified. Tested with full EX15 pool and seeds 0, 3, 19, 31, 100: mono-Lightning Feraligatr decks no longer contain Fighting Meganium, and attack costs fit the Zone.
3. **Darkness Charizard Star and Xatu with no Stage 2 ex** — Charizard ★ δ (ex15-100) is a Basic Pokémon, so Xatu's Extra Feather does nothing for it. The normal two-card partner candidate path admitted Xatu because its Darkness attack matched, and random Natu selection then evolved into Xatu despite the lack of a beneficiary. The builder now suppresses such partners, blocks unusable support-only random cores at both endpoint and pre-evolution stages, and returns an informative error for impossible explicit Xatu-only + Darkness + EX15 selections. With an unrestricted EX15 Xatu focus, it still builds a complete Stage 2 Pokémon-ex beneficiary evolution line. Gardevoir ex δ Fire focus still receives Xatu and Swellow lines.

## Verification

- `node --test tests/v07216-classic-builder-choices.test.cjs` — **6/6 passed**, with focused player/CPU deck composition and static artwork fallback checks.
- Selected broader adjacent EX set tests `v07203` + `v07205` through `v07216` — **211/211 passed**, including the earlier 83 EX15 focused-deck and 128 attack-action smoke checks carried forward from v215.
- `node --check app/src/main/assets/tcg-classic-deck-builder.js` — passed.
- Old `v07167` + `v07168` cohesion tests: **9/12 pass**, three failures reproduced independently in unmodified earlier versions; they cover older EX2/EX3 mixed-energy expectations and optimizer scoring, and are not claimed resolved by v216.
- No physical Android device rendering, long advanced/expert CPU matches, APK compile, or GitHub push was performed. This patch does not alter collections, saved decks or battle resolution. Existing saved decks are not automatically rebuilt; use Auto build again to see the new selection.

## Handset checks

1. Test Lab -> EX Dragon Frontiers only -> Lightning -> Competitive -> Feraligatr δ. Its alternate evolution partner should use Lightning, not Meganium δ's Fighting line; the Energy Zone remains Lightning.
2. EX15 only -> Darkness -> Charizard ★ δ. The builder must not insert Xatu, Swellow or Altaria ex without Stage 2-ex in the deck. A randomly built Darkness-only Natu/Xatu should no longer be chosen.
3. EX15 only -> no locked Energy type -> explicitly focus Xatu δ. You should see a complete Basic / Stage 1 / Stage 2 Pokémon-ex recipient. EX15 + Darkness-only + Xatu focus deliberately gives a clear incompatibility message; remove the Darkness restriction to let the builder supply a Stage 2-ex attacker.
4. In a card/Basic Energy choice popup, artwork should fill its tile and there should be **no second name/description box below it**. When art fails, the fallback name should still appear.
