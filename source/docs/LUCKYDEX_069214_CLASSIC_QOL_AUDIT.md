# LuckyDex v0.69.214 — Classic battle and deck-builder audit

Source baseline: v0.69.213 (EX Dragon Frontiers complete).

## Behaviours corrected

- Swellow δ EX Dragon Frontiers Extra Wing now receives Stage 2 Pokémon-ex support pairing in the shared auto deck builder, with complete evolution prerequisites and Energy-fit checks. Reverse pairing in a compatible Stage 2 ex-focused build is also tested. The Body's printed retreat effect was already implemented; this patch changes deck planning, not its printed rules.
- Battle card selection with artwork no longer repeats card names/labels below the image. Non-art text-only choice options remain readable. Printed Poké-Body/Poké-Power identities are displayed accurately.
- CPU Snorlax δ Dozing: trigger and Heal + Sleep choice now selected across all four difficulty levels when the active Pokémon is damaged.
- Latias ex δ Fellow Boost continues to attach only physical Basic Energy from hand and ends turn. When the hand has no Basic Energy, the inoperative Power is not shown as available. Printed-rule UI explains how to obtain hand Basic Energy; focused decks reserve Mr. Stone's Project from selected/owned sets. No direct Energy Zone substitution.
- Classic Test Lab autobuild preferences are persisted separately from ordinary deck editor/opponent options, with copying to avoid leaked mutable array references.
- Classic Prize collection now pauses after a KO, allows choosing face-down Prize positions, keeps revealed Prize cards face-up and accessible, supports successive two-Prize awards, CPU choices and last-Prize win processing. A compact Prize button opens a read-only preview. Island Hermit option labels do not prematurely disclose concealed identities. Pocket scoring is not modified.

## Tests

See tests/v07214-classic-prizes-and-synergy.test.cjs for new state-based checks: KO/prize choice, two-Prize ex, hidden/revealed display, win continuation, CPU prize selection, CPU Dozing, Stage 2 ex support lines, Latias hand-only activation, Test Lab saved settings, and printed ability labels/choice artwork. The v069132 SV1 historical test has been updated for explicit Prize choices; the v07199 artwork expectation now matches nonredundant labels; the v07203 catalogue count includes ex15.

## Verified test run

333/333 selected Node regression tests passed across Classic base/SV, earlier EX releases (including ex14/ex15), UI choices, CPU, Test Lab and newly added v07214 cases. This is automated simulation, not a device APK run.

## Not certified

- Physical Android device touch interactions and responsive layout were not observed in this build.
- Every cross-set simultaneous KO, delayed-effect or nonstandard Prize interaction has not been exhaustively simulated.
- The earlier four EX Crystal Guardians gated cards remain outside this release.
