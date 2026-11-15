#!/bin/sh
# v0.69.254 source-relative patch: unzip into ~/lucky-dex/source.
# Also invoked automatically by source/app/build.gradle during APK builds.
# Fetches exact archived 146-card printed data, builds offline runtime JS, stores
# source JSON for next card-outcome audits, and runs all three Legends Awakened integration suites.
set -eu
cd "$(dirname "$0")/.."
# Validate archived-print overrides against the offline fallback before a live
# download or APK asset packaging; this would have caught failed CI run #541.
python3 tests/test_dp6_build_pipeline.py
mkdir -p data/classic
url='https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/dp6.json'
if [ ! -s data/classic/dp6-print-source.json ]; then
  curl -fLSs --retry 3 --connect-timeout 20 "$url" -o data/classic/dp6-print-source.json.tmp
  mv data/classic/dp6-print-source.json.tmp data/classic/dp6-print-source.json
fi
python3 scripts/build-legends-awakened.py --input data/classic/dp6-print-source.json
node --test tests/v07251-legends-awakened-stage1.test.cjs tests/v07252-legends-awakened-expanded.test.cjs tests/v07254-legends-awakened-batch3.test.cjs
