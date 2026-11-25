# Rebel Clash continuation — v0.69.473

Baseline: v0.69.472 (147 of 209 playable prints). This release enables 42 additional prints, bringing coverage to 189/209. The canonical set data is unchanged. The 20 remaining gated prints are enumerated in `SWSH2_CURRENT_GAP_LEDGER.md`; this is not the completion audit.

## Implementation
- Added full-signature mappings for new attacks, Abilities, Trainers, Tools and Stadium actions. Reuse shared choice, counter, discard-recovery, attachment and attack-resolution paths rather than parallel set-specific battle systems.
- New mechanics include Berry Picking, Apple Drop, Delicious Aroma, Ground Burn, Reignite, Counter, Spiral Jet, Raid, Counterattack, Perish Body, Psychic Assault, Sand Sink, Dripping Grudge, Decorate, Phantom Force, Infiltrator, Max Phantom, Meteor Assault, Spreading Spite, Hand Press, Gathering Food, Chirp, Mining Rush, Big Throw, Warming Up, Mind Hat and Tar Generator.
- Added Burning Scarf, Cursed Shovel, Milo, Oleana, Scoop Up Net, Tool Scrapper, Training Court and Turffield Stadium. Tools respect shared suppression; reactive triggers depend on opposing attack damage, not arbitrary counters or conditions.
- CPU prioritizes opponent Tools when scrapping, avoids sacrificing its final Pokémon with Apple Drop, and limits Scoop Up Net to useful low-energy damaged targets. Player Scoop Up Net excludes a lone Active with no replacement as a conservative hybrid-rule guard. Keep this deviation explicit for the completion audit.
- Physical Energy and discard-ledger recovery are separate from new Energy Zone supply; count Energy units where the printed wording requires them. Preserve pending choice ownership, optional stopping, actual damage provenance, and selected discard payments.

## Verification
- 70/70 Rebel Clash integration, attack-smoke and outcome tests (38 new bilateral outcome cases).
- 429/429 recent historical tests: Sword & Shield, Cosmic Eclipse, Hidden Fates and associated subsets.
- 22/22 historical/new static source gates; 18/18 shared set-picker, narrow-pool and performance tests.
- Historical gates/regressions ran concurrently with the final small AI and Gathering Food refinements; the final Rebel Clash test run covered the resulting source. Full nested Termux prepare, complete APK regression, GitHub build and device behavior are not confirmed locally.
- Do not treat smoke execution as an independent outcome audit. Remaining work includes Top Entry, copied attacks, Ability suppression, Special Energy, and the other gated signatures in the ledger. Review reactive Tools and cross-era damage provenance during the final audit.
