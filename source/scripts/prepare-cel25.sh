#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-cel25.py
sh scripts/prepare-swsh7.sh
python3 scripts/preflight-cel25-release.py --full
