#!/bin/sh
# No live GitHub download. All 106 Stormfront archived printed records bundled.
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-stormfront.py
node --test tests/v07261-stormfront-catalog-and-combat.test.cjs
