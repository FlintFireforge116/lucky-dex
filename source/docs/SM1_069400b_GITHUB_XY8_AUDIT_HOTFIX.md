# LuckyDex v0.69.400b — GitHub XY8 legacy audit compatibility fix

GitHub run #695 (`50a71cba6fec9455ee3ca5951790a49b10283dbd`) failed `:app:auditXY8ForApk` before reaching the Sun & Moon tests. The exact failing source-code-text assertion searched for `'xy8-152'].includes(card.id)` in `tcgp-battle-core.js`. Adding SM1 Rainbow Energy `sm1-137` to that shared valid damage hook invalidated the suffix.

The gameplay hook itself is **unchanged**; this is not a reason to undo SM1 Rainbow Energy. The revised XY8 audit checks that the relevant hook contains both IDs and verifies that actual physical attachments of both XY8 and SM1 Rainbow Energy deal 10 damage and supply one flexible Energy unit. The SM1 `--full` preflight also runs the legacy XY8 audit so this is caught locally next time.

## Tests

Run in `source/`:

```sh
python3 scripts/check-gradle-source.py --self-test
python3 scripts/preflight-sm1-release.py --full
node --test tests/v07374-breakthrough-mechanic-first.test.cjs tests/v07374-breakthrough-lvx-reuse.test.cjs tests/v07375-breakthrough-shared-mechanics.test.cjs tests/v07376-breakthrough-complete.test.cjs tests/v07377-breakthrough-audit.test.cjs
python3 scripts/preflight-xy12-release.py --full
python3 scripts/preflight-xy11-release.py --full
python3 scripts/preflight-xy10-release.py --full
```

Overlay uses `-d source` from `~/lucky-dex`. It does not alter the app's release version or battle engine.
