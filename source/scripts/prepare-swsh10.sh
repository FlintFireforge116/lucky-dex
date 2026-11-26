#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh9.sh
python3 scripts/build-swsh10.py
python3 scripts/preflight-swsh10-release.py --full
