#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh8.sh
python3 scripts/build-swsh9.py
python3 scripts/preflight-swsh9-release.py --full
