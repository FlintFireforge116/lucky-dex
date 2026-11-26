# Lost Origin stage 3 — v0.69.563

217/217 main-set prints imported; 136 playable, 81 gated. Added 72 verified Pokemon prints, including alternate arts, using the same pinned source blob `157da08c0435be1c0692faac35e3a7580e638afb`. Expanded packet FNV-1a 3538490719. All 94 prior playable records compare byte-for-byte as JSON with stage 2.

New mechanics: exact text descriptors for Fighting Headbutt (ignore weakness, bonus vs V), retreat cost damage, hand size damage, own prizes taken, Tool-dependent damage and confusion, Darkness Energy search, Water hand attachment, damaged-Pokemon count, own damage subtraction, and shared four-card/two-choice Abyss Seeking. Moisture Star, Phantom Star and Hazard Star consume the common VSTAR Power marker. Giratina VSTAR remains gated, as do other unsupported effects. Variants reuse the same exact source signatures.

Focused suite: 62/62 passed, including every enabled attack smoke test on both sides and 16 new exact bilateral checks. Static Lost Origin release parity passed. Android APK/device not verified.

Full offline preparation: 2890/2890 standard test invocations, exit 0. Manifest tests 12/12. Both builders generated legal scoped decks for the six additional tested types.
