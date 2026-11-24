#!/bin/sh
# SM7 single pass: pin official 187-print source, build, run full audit and tests.
# No Github push occurs if a command here fails.
set -eu
cd "$(dirname "$0")/.."
if [ -s data/classic/sm7-print-compact.json ] && [ -s docs/SM7_CANONICAL_SOURCE.json ]; then
  python3 scripts/build-sm7.py
else
  python3 scripts/build-sm7.py --prepare
fi
python3 scripts/preflight-sm7-release.py --full
