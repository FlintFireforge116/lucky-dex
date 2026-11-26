#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-cel25c.sh
python3 scripts/build-swsh8.py
python3 scripts/preflight-swsh8-release.py --full
