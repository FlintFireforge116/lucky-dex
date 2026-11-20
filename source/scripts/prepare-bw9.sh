#!/bin/sh
# LuckyDex v0.69.314 Plasma Freeze: pinned offline card data is included in patch.
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-bw9.py
node --test tests/v07314-plasma-freeze.test.cjs
