#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh12.sh
python3 -B scripts/swsh12pt5_source.py
node scripts/audit-classic-set.cjs --set swsh12 --strict-smoke --no-write
