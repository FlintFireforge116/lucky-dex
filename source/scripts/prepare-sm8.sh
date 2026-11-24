#!/bin/sh
# SM8 single pass: pin official 240-print source, build, run full audit and tests.
# No Github push occurs if a command here fails.
set -eu
cd "$(dirname "$0")/.."
if [ -s data/classic/sm8-print-compact.json ] && [ -s docs/SM8_CANONICAL_SOURCE.json ]; then
  python3 scripts/build-sm8.py
else
  python3 scripts/build-sm8.py --prepare
fi
python3 scripts/preflight-sm8-release.py --full
