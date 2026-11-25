# Shining Fates and Shiny Vault independent audit — v0.69.498

73/73 main and 122/122 Vault prints remain enabled. No changes to catalogue mappings or deck eligibility.

Official Japanese V Transformation FAQ: https://www.pokemon-card.com/rules/faq/search.php?freeword=V%E3%81%B8%E3%82%93%E3%81%92&regulation_header_search_item1=all

- Fixed a once-per-turn collision when Ditto V becomes a different Pokemon V: named Ability history is now recorded in addition to the legacy index-based history. The transformed slot consults its named history for the remainder of its controller's turn. Indeedee V can use Watch Over, while transforming into another Ditto does not reset V Transformation. Ordinary non-transformed slots retain their legacy index-based checks.
- Fixed loss of the underlying card stack when Ditto V is itself on top of an older Pokemon (e.g. Boundaries Crossed Ditto). Discard the underlying cards as well as Ditto V, using the existing normalisation of Prism Star discard into Lost Zone. Preserve all attachments, damage, slot UID, effects and time in play.
- Bilateral tests cover both Ditto prints, Watch Over once per turn, same-Ability reuse prevention, underlying card conservation, absence of an unwanted Dark Asset hand-play trigger and legal same-turn evolution after transformation. The existing copied-attack, Rusted Tool and shiny reprint tests remain unchanged. A literal-ID scan of exact reprints against core/effects/AI found no unmatched literal predecessor references; this is not proof of exhaustive cross-era rule equivalence.
- Exact `sh scripts/prepare-swsh45.sh` exit 0, 1429/1429 test invocations, 0 failed/skipped/cancelled, 27/27 source gates. Current-set suites 61/61 (54 main including shared outcome/audit tests, 7 Vault). New tests 8/8. Android APK compilation and exhaustive historical interaction coverage remain unverified; exotic chained replacement and historical copied attacks retain existing safety constraints.
