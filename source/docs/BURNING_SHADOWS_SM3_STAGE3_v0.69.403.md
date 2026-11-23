# Burning Shadows SM3 — Stage 3 (v0.69.403)

## Coverage
- 177 pinned offline collector prints; 274 printed attacks; 27 Abilities; 40 GX prints; no source fetch at APK build.
- 151/177 battle-enabled (up from 114), 26 explicitly gated pending further work.
- Shared implementations apply across collector variants, with exact printed text checks.

## Highlights
- GX families: Ho-Oh-GX Eternal Flame, Gardevoir-GX Secret Spring, Tapu Fini-GX Tapu Storm, Tapu Bulu-GX Nature's Judgment, Necrozma-GX Black Ray/Prismatic Burst.
- Attacks and passives: Vileplume Disgusting Pollen, Heracross Guts, Wimpod Wimp Out, Alolan Ninetales Luminous Barrier, Seviper More Poison, Lunatone Heal Block, Weavile Rule of Evil, Bruxish Synchronoise, Shiinotic Strength Sap, and more.
- Trainer effects: Acerola (damaged Pokémon and attachments), Guzma (opponent then self switch), Tormenting Spray (random Supporter removal).
- Corrected Tornado Shot Active + Bench damage routing and GX/EX targeting without expanding historical EX-only matches.

## Mandatory regression
- `tests/v07416-burning-shadows-stage3.test.cjs`: 29 targeted tests including player/CPU action resolution where applicable, actual outcomes, hand/discard Energy, choice/promotion, passive status modifiers.
- `python3 scripts/preflight-sm3-release.py --full` and `python3 scripts/preflight-xy10-release.py --full` before APK release.
- Unsupported remaining 26 are explicitly recorded in `docs/SM3_BUILD_COVERAGE.json`.

No change to app versionCode/versionName. GitHub APK build not locally verified.
