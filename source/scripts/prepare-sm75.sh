#!/bin/sh
# SM75 single pass: pin official 80-print source, build, run full audit and tests.
# No Github push occurs if a command here fails.
set -eu
cd "$(dirname "$0")/.."
if [ -s data/classic/sm75-print-compact.json ] && [ -s docs/SM75_CANONICAL_SOURCE.json ]; then
  python3 scripts/build-sm75.py
else
  python3 scripts/build-sm75.py --prepare
fi
python3 scripts/preflight-sm75-release.py --full
