#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-sv2.sh
node --test tests/v07624-obsidian-flames.test.cjs tests/v07401b-sm1-deck-picker-availability.test.cjs tests/v07333-classic-deck-quality.test.cjs
node scripts/audit-classic-set.cjs --set sv3 --strict-smoke --no-write
