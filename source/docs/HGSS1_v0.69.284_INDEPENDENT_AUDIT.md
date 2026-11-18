# LuckyDex v0.69.284 — HeartGold & SoulSilver independent gameplay audit

Date: 2026-11-18. This audit is against the complete v0.69.283 source and the locked 124-print HGSS Base transcription.

## Scope and verified baseline
- Latest GitHub Actions run for v0.69.283 (`44389495850`) **succeeded**, including APK artifact production.
- HGSS Base source has 124 original collector prints (numbers 1–123 and secret ONE); 99 Pokémon, 15 Trainer cards, 10 Energy artwork prints. All 124 are mechanically mapped; 116 are deck-eligible under the Classic game, and the eight Basic Energy artwork prints use the separate Energy Zone.
- `audit-classic-set.cjs --set hgss1 --smoke --no-write` reports 124/124 enabled, zero schema errors, zero warnings, zero review flags, and 352/356 synthetic checks exercised. Its four skipped cases are effects without their required discard setup, not claimed independent successes.

## Independent confirmed defects and corrections
1. **Sunkern #85 Cure Kernels** incorrectly healed Active by default. It now explicitly asks the attacker to choose an eligible damaged allied Pokémon, including one on the Bench.
2. **Jumpluff #6 Mass Attack and Phanpy #77 Flail** each added 10 extra base damage from printed `10×` notation. The generator now stores zero base for every multiplication damage expression and lets the corresponding executable rule calculate the full amount; all multiplicative attacks are covered by regression.
3. **Exeggutor #18 Energy Absorption and Blissey #36 Energy Link** previously lost physical choice semantics (including Special Energy recovery); Energy Absorption could silently fail with discard Energy available. New choice-driven HGSS resolver supports up to two independently selected physical discard/zone Energy and correct physical Special Energy attachments.
4. **Discard attacks** that can remove different Energy cards must choose correctly. Dedicated choice screens now cover Gyarados Hyper Beam, Typhlosion Fire Spin, Corsola Recover, Quilava Flamethrower, Vulpix Ember (on tails), Ampharos Prime Lightning Crush (on tails), Typhlosion Prime Flare Destroy (one choice on each side), and both Ho-Oh LEGEND Bright Wing prints. Each discard updates the *correct owner*'s discard or Basic Energy discard-zone counters.
5. **Prime power availability**: the action list no longer offers unusable Roast Reveal, Rain Dance, Leaf Trans or Afterburner when required hand Energy, discard Energy, board targets, or Energy sources are absent. These Powers remain repeatable/once-per-turn exactly as printed when executable.
6. **Rainbow Energy as an attached wildcard**: the physical Energy-choice selector accepts a Rainbow Energy card as an eligible Fire/Water/Lightning type as appropriate. It can satisfy one printed discard per physical card, never three at once. Dedicated Corsola Recover and Lugia Elemental Blast regressions protect this.
7. **Deck synergy metadata** is explicitly assigned for opaque HGSS-specific rules (e.g. Ampharos Acceleration Bolt, Exeggutor Energy Absorption, Feraligatr Rain Dance), rather than mistaking an Energy *discard* for acceleration.
8. **Release-test stability**: v07282's pinned version 0.69.283 check is updated to compare the current Gradle version dynamically against the app UI and JavaScript; the full new v07284 audit is included in the mandatory Gradle APK gates.

## Tests / remaining limits
- The 23 new v07284 independent tests (40 HGSS tests combined), plus 47 selected cross-set regressions, all pass locally. The new v07284 independent audit validates real battle-engine target choices, damage totals, physical discard and attachment, Trainer selection, Pichu Playground, Metapod Green Shield, Rainbow Energy, new CPU Energy-choice execution across Beginner/Advanced/Expert, and sampled legal evolution chains/paired LEGEND halves.
- Additional CPU audit: 320 set-only builds (8 type choices × 40 seeds), all 30 cards and without orphan evolution lines or unmatched LEGEND halves. Metal-only decks are unavailable from HGSS Base, which has no Metal Pokémon; Darkness can build a legitimate Persian payoff line.
- After the audit fixes the independent synthetic preflight reports **124/124 enabled, zero errors, zero warnings, zero review flags, 356/356 smoke actions executed (0 skipped)**; its synthetic scenarios do not guarantee correct damage or choices without the focused tests above.
- The independent static/synthetic auditor cannot establish correct animation timing or every live battle outcome. Hardware play and **the new 0.69.284 GitHub APK build** remain unverified until you push the patch and test it.

## Handoff
Apply only the source-relative patch ZIP on top of v0.69.283 using the user's preferred `unzip -o ... -d source` then `git add source` / `git commit` / `git push origin main` steps. Do not skip Gradle tests.
