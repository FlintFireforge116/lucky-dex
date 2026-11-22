# Steam Siege XY11 — Independent audit v0.69.395

This audit uses the actual v0.69.394 completion overlay applied over the
previous Steam Siege source, together with the immutable pinned official
English XY11 compact catalogue. It is **not** a re-use of the release author's
assertions alone.

## Source coverage

- Official **116/116** prints are enabled and present.
- Exact printed **161 attack names and energy costs** match the pinned source.
- The numeric bases for all 161 attacks (including calculated-damage attacks)
  match the printed values after normalizing `+`, `-`, and `×` notation.
- Seven BREAK and 12 dual-type prints remain registered.
- Existing completion, integration, and Classic-deck tests remain mandatory.

## Independently reproduced and corrected defects

1. **Pokémon Ranger vs Electroweb**: the generic attack `lock` handler did not
   record attack provenance, so Ranger left attack-created retreat locks in
   place. The fix tags generic attack locks and retains non-attack locks.
   The same provenance marking now applies to `preventDamage`, so Ranger
   preserves protection conferred by unrelated sources while clearing attack
   guards. Existing untagged legacy guards retain previous save handling.
2. **Wicked Wind / Stadium replacement crash**: the action builder checked
   the *suppressed* Stadium object and accessed `.name` on `null` while a
   Stadium was physically in play. This crashed the legal-actions menu. The
   fix uses the physical Stadium to enforce the same-name restriction and
   permits a different named replacement.
3. **Dark Burn Energy choices**: only prefix combinations of attached
   Darkness Energy were shown. When both Basic Darkness and Darkness-providing
   Special Energy were attached, players could not choose to discard only
   the latter. The fix offers all combinations up to seven physical Energy
   cards, plus individual/pair/group selections for larger boards. Effects
   discard only the chosen attached cards, not the Basic Energy Zone.

## Regression coverage and limits

`tests/v07395-steam-siege-independent-audit.test.cjs` covers source-metadata
reconciliation, seven BREAK parent relationships, live core Stadium play
actions during Wicked Wind, Pokémon Ranger's attack-lock/protection provenance,
and chosen physical Dark Burn Special Energy.

Outstanding modelling boundary: extremely dense Dark Burn boards (eight or
more attached Darkness Energy cards across the board) currently expose a
bounded menu, not every combinatorial subset. Arbitrary large multiselection
will need a dedicated choice UI. Ranger's legacy cross-expansion
attack-specific flags remain a useful target for future adversarial testing.

The independent audit test is included in both Gradle and the `--full`
XY11 preflight. The required cross-set deck-quality gate is unchanged.

**GitHub APK status:** only the actual GitHub Actions result can confirm
success; local source tests do not constitute an Android build.
