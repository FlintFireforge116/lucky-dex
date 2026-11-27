#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-sv1.sh
node --test tests/v07611-paldea-evolved.test.cjs tests/v07621-snap-shop.test.cjs
node scripts/audit-classic-set.cjs --set sv2 --strict-smoke --no-write
