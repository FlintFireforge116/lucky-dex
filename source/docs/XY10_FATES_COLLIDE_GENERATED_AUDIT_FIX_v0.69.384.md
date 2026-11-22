# Fates Collide v0.69.384 — generated catalogue audit repair

GitHub Actions run #45042878867 failed in `:app:auditXY10ForApk` after
actual XY10 generation. Cause: the full-audit test accessed
`card.attacks.map` on a Trainer/Energy card. Those runtime card types do not
require `.attacks`; even Power Memory with a printed attack is a Tool, not
a Pokémon with normal attacks.

The audit now compares printed attack costs only for Pokémon, checks
Pokémon `.attacks` really exists, and separately checks Trainers and Energy.
The official full-catalogue and deck checks remain mandatory. A new fixture
tests all three card kinds including Power Memory.

## Mandatory Termux pre-push gate

```bash
cd ~/lucky-dex/source
python3 scripts/check-gradle-source.py --self-test
python3 scripts/preflight-xy10-release.py --full
```

The `--full` mode **generates the official pinned data and executes the same
post-generation Node tests as GitHub**. Do not push if this fails. Requires
Python and Node.js and an available pinned-source download (unless cached).

App version intentionally unchanged at 0.69.384; no gameplay changes.
