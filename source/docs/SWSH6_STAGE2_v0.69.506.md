# Chilling Reign stage 2 — v0.69.506

169/233 playable (44 newly enabled); 64 explicitly gated. No canonical source changes. Both deck builders continue using the same generated eligibility.

- Shared staged payments: Ice Rider Calyrex VMAX Max Lance discards up to two attached physical Energy cards; Rillaboom Raging Repeated Strike may discard from any friendly Pokémon. Copied attacks retain the existing declaration/Confusion/payment sequence. CPU stops when estimated damage suffices.
- All three Special Energy prints: Impact and Spiral provide a single flexible unit, enforce Strike eligibility on attachment and continuous cleanup, remove only their printed condition, respect Spectral Breach. Lucky Energy draws for positive opposing attack damage to Active, including KO, per attached unsuppressed copy.
- Rapid/Single Strike Scrolls use the existing persistent attack source enumerator and compatible CPU recipient filter. Gravdrop scales with opposing Energy; Bullet Breakthrough ignores Weakness, Resistance and defender effects.
- Supporters/Items: Agatha, Caitlin, Flannery, Fog Crystal (shared typed deck/Zone search), Honey, Karen's Conviction, Melony, Siebold. Dyna Tree Hill and Path to the Peak are live Stadium effects; Galarian Chestplate is holder-filtered.
- Pokémon: all four Castform forms, Cinderace, Abomasnow, Zarude, Ampharos, Cresselia and Shaymin. Remaining advanced and reactive mechanics are tracked in the regenerated gap ledger. Further audit should cover alternate historical attachment paths, cross-era rules/KO ordering, copied staged payments, and CPU selection quality. APK/device testing separate.

Validation: full prepare-swsh6.sh exit 0, 1586/1586 test invocations, 29/29 source gates, zero failures/skips/cancellations. Chilling Reign 43/43 and Python manifest tests 12/12. APK and device tests not run.
