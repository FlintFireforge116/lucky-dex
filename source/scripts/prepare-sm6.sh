#!/bin/sh
# SM6 single pass: pin official 150-print source, build, run full audit and tests.
# No Github push occurs if a command here fails.
set -eu
cd "$(dirname "$0")/.."
if [ -s data/classic/sm6-print-compact.json ] && [ -s docs/SM6_CANONICAL_SOURCE.json ]; then
  python3 scripts/build-sm6.py
else
  python3 scripts/build-sm6.py --prepare
fi
python3 scripts/preflight-sm6-release.py --full
