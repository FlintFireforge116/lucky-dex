#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh1.py
sh scripts/prepare-sm12.sh
python3 scripts/preflight-swsh1-release.py --full
