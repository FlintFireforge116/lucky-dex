#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-sm115.py
python3 scripts/build-sma.py
python3 scripts/preflight-all-release-sources.py
node --test tests/v07399-sun-moon-integration.test.cjs
python3 scripts/preflight-sm11-release.py --full
python3 scripts/preflight-sm115-release.py --full
python3 scripts/audit-expansion-readiness.py --set sma --check-release --report docs/SMA_CURRENT_GAP_LEDGER.md
