#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
node --test tests/v07636-pokemon-151.test.cjs tests/v07401b-sm1-deck-picker-availability.test.cjs tests/v07557-adaptive-trainers.test.cjs tests/v07333-classic-deck-quality.test.cjs
node scripts/audit-classic-set.cjs --set sv3pt5 --no-cpu --strict-smoke --no-write
python3 -B scripts/release_version.py
