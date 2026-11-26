# Astral Radiance stage 9 — v0.69.553

216 pinned prints imported; 212 playable (+4), four gated. All 208 previous playable descriptors compare deeply equal with stage 8.

- Grant (144, 185, 203): a normal Supporter adds 30 damage per resolved Grant to attacks from Fighting Pokémon against the opponent's Active, before Weakness/Resistance, during the current turn only. Recovery is a separate discard-zone action, available even after a Supporter has been played. Choose two distinct non-Grant cards from hand; no mutation until both choices have been made. Cancel leaves all cards in their original zones. Preserve the actual recovered Grant UID and route discarded Basic Energy to the hybrid discard ledger. Discard UI exposes the action. CPU only seeks recovery when a Fighting Active can use Grant, it has not used a Supporter or Grant this turn and has no Grant in hand; it completes valid recovery choices rather than looping.
- Regigigas: Gigaton Break adds 150 damage only versus VMAX. Ancient Wisdom requires all five other named Regis in play; no relaxation of the printed condition for the hybrid three-slot Bench. Expanded Bench effects such as Sky Field make the condition attainable. Choose one recipient and optionally attach up to three actual discarded Energy cards/ledger units, including Special Energy, with no redistribution and no fresh Zone supply. Uses the ordinary once-per-turn Ability lifecycle.
- Four outstanding gates: Eevee (Resonant Evolution), Hoothoot (Stand Sentry), Jirachi V (Wish Connector and Hypnostrike), Double Turbo Energy (shared legacy outgoing damage coverage). No new galleries or promos.

Focused tests: 166 total (eight new bilateral outcome tests plus three attack and CPU checks, passed across the focused runs). Android APK/device verification remains separate.

Full historical preparation: 2479/2479 gameplay invocations; final focused suite 166/166; manifest tests 12/12.
