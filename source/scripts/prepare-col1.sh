#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
python3 "$ROOT/scripts/build-col1.py"
node --test "$ROOT/tests/v07294-call-of-legends.test.cjs"
