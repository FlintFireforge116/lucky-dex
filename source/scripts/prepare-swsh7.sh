#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh7.py
sh scripts/prepare-swsh6.sh
python3 scripts/preflight-swsh7-release.py --full
