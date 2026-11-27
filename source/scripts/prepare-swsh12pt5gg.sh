#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh12pt5.sh
node --test tests/v07602-galarian-gallery.test.cjs
node scripts/audit-classic-set.cjs --set swsh12pt5gg --strict-smoke --no-write
