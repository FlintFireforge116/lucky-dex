#!/bin/sh
# LuckyDex v0.69.316 Plasma Blast pinned source generation.
# This fetches a single verified source blob exactly once and then runs offline.
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-bw10.py
# Offline preparation generates prints only; APK/Gradle runs the full
# v0.69.316 and v0.69.317 regression suites after generation.
if [ "${LUCKYDEX_BW10_TESTS:-0}" = 1 ]; then
  node --test tests/v07316-plasma-blast.test.cjs tests/v07317-plasma-blast-completion.test.cjs
fi
