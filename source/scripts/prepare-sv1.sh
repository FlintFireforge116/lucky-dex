#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh12pt5gg.sh
node --test tests/v069132-scarlet-violet-slice.test.cjs tests/v069133-sv1-full.test.cjs tests/v069134-sv1-audit.test.cjs tests/v07604-sv1-stage1.test.cjs
node scripts/audit-classic-set.cjs --set sv1 --strict-smoke --no-write
