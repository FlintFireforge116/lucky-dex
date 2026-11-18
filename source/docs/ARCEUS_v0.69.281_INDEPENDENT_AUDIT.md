# Platinum—Arceus independent audit — v0.69.281

Basis: v0.69.280 successful GitHub APK run 44372981093; original official
English 111-print archive checked by its authenticated SHA; code review of the
merged Arceus generator, effect engine, deck builder and manual editor.

## Confirmed by previous GitHub build
- Build v0.69.280 succeeded; canonical collector prints 111/111; 111/111
  were battle-enabled, 0 gated.
- Printed names, attacks, energy costs, and 30 abilities were compared against
  the immutable original data in the v07275 tests (18/18 Arceus tests).
- The build also passed the previous Supreme Victors test suite 51/51.

## New independent audit findings and fixes
1. HIGH: the manual deck editor and draft-save validator capped all Arceus
   prints at 4 by name, despite the printed special unlimited-copy rule.
   The autobuilder handled these copies in one path but its 30-card preflight
   still under-counted a collection containing only unlimited Arceus.
   Fixed all three copy-limit paths; normal Pokémon retain four-copy rule.
2. MEDIUM: card synergy metadata was based on finding the bare words
   'attach' and 'remove'. This misclassified Energy-discard attacks as ramp,
   and devolution or Lost Zone attacks as healing. The role classifier now
   reads mapped effects and explicit printed actions, with false-positive
   fixtures for Charizard, Pikachu, Omastar and Arceus.
3. REVIEW: Arceus AR5 Ripple Swell requires six differently typed Arceus
   in play. Classic normally has a 3-Pokémon Bench, so the attack cannot be
   activated in a default Arceus-only battle. It may be used with a compatible
   five-Bench expansion Stadium; the card's Sky Spear remains usable without
   that. Avoid assuming a six-Arceus strategy works without Bench expansion.
4. COVERAGE GAP: v0.69.280 had full printed-data/schema checks but only 18
   Arceus-specific behavioral tests. The independent per-card 111-print
   two-sided attack/Trainer smoke run is not yet a confirmed GitHub check.
   The generic standalone audit is available from the repository via:
   node scripts/audit-classic-set.cjs --set pl4 --smoke --no-write
   Treat that as a review/smoke check, not proof of every effect or UI flow.

## v0.69.281 local validation (prebuild)
- Manual Arceus unlimited-copy + ordinary-copy + ownership tests: 4/4.
- Metadata classifier: 10 targeted assertion scenarios.
- Existing Arceus interaction and Fossil test files: local regression suite.
- Gradle, boot JavaScript and HTML version labels synchronized at 0.69.281;
  versionCode advanced 7266 -> 7267 for Android update handling.

No unsupported mechanics were silently changed or any build audit disabled.
Full generated 111-print validation and APK compilation must run when the
patch is applied to a working Termux checkout or through GitHub Actions.
