# Lost Origin stage 14 — v0.69.575

217 imported, 215 playable, two gated. Orbeetle #20 and Thorton #167/#195/#210 enabled. Enamorus V #82/#178 remains gated because Guardian of Love requires an audit of legacy Ability effects and direct state mutations, not only shared effect paths.

- Jamming Attachment triggers on evolution from hand, not deck evolution. The evolving player may attach up to three Energy cards from the opposing discard (physical Basic/Special refs and the real Basic Energy discard ledger) to opposing Pokémon of their choice. No new Zone Energy, no hand attachment allowance; skipping either prompt consumes nothing. Opposing Ability-effect protections and attachment locks apply. CPU avoids feeding the opponent unless it sees a plausible immediate Mysterious Wave knockout; heuristic only.
- Thorton chooses a playable discarded Basic and an in-play Basic with a one-card stack. It changes the card and stack on the same stable slot, replacing the chosen discard ref with the previous Basic. All attachments, damage, conditions, turn markers and slot-targeted effects remain. No entry/evolution trigger. Existing placement restrictions apply. CPU scores improvements in remaining HP and attack readiness and avoids self-KO replacements. Stable slot identity, rather than physical reference identity, is the engine convention.
- 222 focused tests passed; 14 new bilateral tests including CPU and cancellation behavior. APK/device validation separate.

Full release preparation passed: 3051/3051 gameplay test invocations, including 512/512 exact Astral Radiance CI-equivalent tests and 222/222 Lost Origin tests; 12/12 manifest tests. APK/device verification separate.
