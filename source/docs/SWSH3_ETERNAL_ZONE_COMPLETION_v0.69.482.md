# v0.69.482 — Darkness Ablaze completion

201/201 prints enabled, including swsh3-117 and swsh3-192. The generator uses the exact printed Eternal Zone signature and the validated continuous-rule descriptor. Release contract is complete and the full preflight requires zero gated prints. Existing tests now exercise the production catalogue rather than overriding battleEnabled.

## Compatibility changes
- Prize-triggered Jirachi placement, Dolls, Lt. Surge's Secret Plan and Lt. Surge's hand replacement consult live placement legality. The latter respects all physical slots, not only the original three.
- Ninja Boy, Floral Path, Transform, Legend Box, and additional evolution/revival candidates consult the same rule.
- Additional old search and forced-placement handlers, including Target Whistle, Darkness Restore, Fin Luster, Revival, Restore, Call Energy, Dark Invitation, Brigette, Pokémon March, Challenge!, Playground, Strike and Run, Team Assembly, Manipulate, EX Emerald search and BW Revive, filter legal candidates before consuming a card. Ordinary searches to hand remain unchanged.
- Ten additional bilateral outcome tests exercise actual catalogue enablement and targeted legacy placement paths, including Prize claims, replacement and concealed placement.

## Evidence and limits
- Full SWSH3 release preflight: 135/135.
- SWSH1/SWSH2/Sky Field/deck-performance regression: 296/296 (before final two narrow legacy-handler edits).
- Complete Sun & Moon historical Gradle gameplay gate: 48/48.
- Selected affected historical suites (Gym, Phantom Forces, Steam Siege, Celestial Storm): 103/103.
- APK compilation and exhaustive historical gameplay sweep not performed. v481 documented pre-existing extended-suite failures; no attempt to hide or relax those tests.
- Production enablement is not an independent audit. Remaining bespoke historical placement/evolution handlers, continuous-type changes and simultaneous Stadium/Ability interactions still need the cross-era audit. Some legacy handlers may offer a prohibited choice or consume a source card before the shared allocator rejects it. Do not claim universal legacy correctness based on the current outcome coverage. Retain the hybrid three-slot default and five-slot post-Eternal Zone convention pending explicit design review.
