#!/bin/sh
# SM9 single pass: pin official 198-print source, build, run full audit and tests.
# No Github push occurs if a command here fails.
set -eu
cd "$(dirname "$0")/.."
if [ -s data/classic/sm9-print-compact.json ] && [ -s docs/SM9_CANONICAL_SOURCE.json ]; then
  python3 scripts/build-sm9.py
else
  python3 scripts/build-sm9.py --prepare
fi
python3 scripts/preflight-sm9-release.py --full
