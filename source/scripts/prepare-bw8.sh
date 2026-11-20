#!/bin/sh
# Run from source root or repository root; fetch pinned BW8 data on first use.
set -eu
if [ -f source/scripts/build-bw8.py ]; then cd source; fi
python3 scripts/build-bw8.py
node --test tests/v07312-plasma-mechanics.test.cjs tests/v07312-plasma-storm.test.cjs
