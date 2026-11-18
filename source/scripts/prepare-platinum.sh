#!/bin/sh
# Platinum's 133 archived printed records, then offline generated game assets.
# Run once in Termux after extracting the patch; the generated asset and source
# catalogue are both committed under source/ for reproducible later builds.
set -eu
cd "$(dirname "$0")/.."
mkdir -p data/classic
if [ ! -s data/classic/pl1-print-source.json ]; then
  curl --fail --location --retry 3 --output data/classic/pl1-print-source.json \
    https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/pl1.json
fi
python3 scripts/build-platinum.py
python3 scripts/audit-platinum-checklist.py --report docs/PLATINUM_CARD_CHECKLIST.md
if command -v node >/dev/null 2>&1; then
  node --test tests/v07263-platinum-catalog.test.cjs tests/v07263-blissey-cpu-energy-absorption.test.cjs tests/v07264-platinum-stage2-effects.test.cjs tests/v07265-platinum-completion.test.cjs tests/v07266-platinum-checklist-regressions.test.cjs tests/v07266-platinum-all-attacks-smoke.test.cjs
else
  printf '%s\n' 'Node.js not installed in Termux; regenerated Platinum cards, but the local JS checks were skipped.'
fi
