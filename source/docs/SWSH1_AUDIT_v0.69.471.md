# Sword & Shield completion and independent audit — v0.69.471

All 216 canonical prints enabled, including 277 attack prints, 25 Abilities, 42 Trainer prints and Aurora Energy. The generator and full preflight now require zero gated prints. V and VMAX metadata unchanged.

## Corrected mechanics
- Aurora Energy supplies one rainbow Energy unit. Normal hand attachment opens a mandatory, non-self discard selection before attachment; no legal action if it is the only card. Physical extra attachment paths use the same payment semantics and preserve the normal hand-attachment allowance. The Energy UID and selected payment UID are distinct, with selection and continuation preserved across effects. Recovery from discard and movement between slots are not hand attachments and require no payment. Legacy attack/Trainer/Ability paths reviewed for hand Energy eligibility; the Supporter being played is excluded as a payment candidate at legal-action generation.
- Snap Trap queues the defending owner's choice of an actual attachment on the attacker until other attack choices finish, before KO removal. Attacker UID follows switching effects. Discard uses the existing protected Energy discard path.
- New bilateral outcomes cover five older attacks, Brock's Training, normal attachment, no-payment cases, one-unit typed costs, recovery/movement, and two Snap Trap continuation cases. Existing hybrid Energy Zone rules remain in force. The test suite asserts all 216 prints enabled.

## Verification scope
154/154 SWSH1 tests (24 new), 275/275 Cosmic Eclipse and Hidden Fates/Shiny Vault tests. All 21 historical/new release-source gates and 18/18 shared picker/narrow-pool/performance tests passed (447 total runtime tests). Node syntax checked. Independent audit targets the remaining gaps and cross-era interactions, not an exhaustive proof of every possible interaction. Full nested prepare, full APK test sweep, Android compilation and on-device behavior not verified locally. GitHub v469 success confirmed; v470 not visible at last check.
