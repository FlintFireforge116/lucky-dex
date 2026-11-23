# LuckyDex — next-expansion fast track (23 November 2026)

The full rules are in `docs/LUCKYDEX_MASTER_RULES.txt` v2.79. This page is a short operational checklist, not a replacement for the existing gameplay contract.

## Target delivery cadence

**One substantial implementation release, one independent audit/fix release.** Further stages only for genuine, named engine blockers; never split by arbitrary card count. The existing 30-card Classic and Energy-Zone adaptations are unchanged.

## Before implementation

1. Start from the latest supplied/installed source and existing master TXT.
2. Pin the authoritative official complete print file and its hash; generate the entire set first, including alternate collector IDs.
3. Generate a card-level coverage JSON and a grouped backlog before mapping effects. Run the generic helper after your set-specific canonical preparation:

   ```sh
   python3 scripts/audit-expansion-readiness.py --set sm5 --report docs/SM5_CURRENT_GAP_LEDGER.md
   ```

   Substitute the next set's ID and output filename as appropriate. The helper deliberately fails if the canonical source is missing or out of sync.
4. Categorise every unique effect as A (already supported), B (composition), C (parameter), D (new reusable mechanic), E (true exception). List ALL affected card prints under each D blocker, rather than revisiting the set in numerical card order.

## Implementation

- Map **all** A/B/C in one pass; implement each shared D once and then map all users; add E with exact text-locked effect contracts.
- Allow reuse only when target, ownership, coin behaviour, conditional gate, physical UID, Energy source, expiry, choices and CPU follow-through match printed text.
- Test new mechanics in actual battles before marking a card enabled. All printed actions, Abilities, Trainers, Tools and Special Energy must work; catalogue coverage alone is insufficient.
- Use focused outcome tests while coding. Run the older expansion release gates **at the final set boundary** and after any substantial shared-engine alteration, not after every minor mapping.

## Before any release ZIP / push

Run static test/build parity early (works without generated source):

```sh
python3 scripts/audit-expansion-readiness.py --set sm5 --release-only
```

This fails for missing Termux/Gradle test paths, inconsistent test lists, wrong global app version, wrong build dependency order, or older release-contract versions. Fix errors before packaging. Also inspect old gate assertions for any cards now enabled: update them to test the implemented behaviour rather than asserting those cards remain gated.

Run the expansion's real source preparation and full generated-catalogue test. Then regenerate the exact coverage ledger:

```sh
sh scripts/prepare-sm5.sh
python3 scripts/audit-expansion-readiness.py --set sm5 --check-release \
  --report docs/SM5_CURRENT_GAP_LEDGER.md
```

For a claimed complete set, add `--require-complete` to fail if even one print remains gated. These example commands are for **SM5**; future sets need their own pinned generator/preflight and release contract using the same conventions.

## Handoff / truthful release status

Report unique printed cards, playable and gated counts and every blocker group; list the full test results actually run and distinguish local preflight, GitHub APK CI and phone tests. Do not assert completion when the official compact file or its attestation was unavailable. Once an issue fails in CI, investigate its root cause and patch the shared build process rather than repeating near-identical release ZIPs.
