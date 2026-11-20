#!/bin/sh
# LuckyDex v0.69.316 Plasma Blast pinned source generation.
# This fetches a single verified source blob exactly once and then runs offline.
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-bw10.py
node --test tests/v07316-plasma-blast.test.cjs
