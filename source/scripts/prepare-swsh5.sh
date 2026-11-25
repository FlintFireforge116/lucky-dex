#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh5.py
sh scripts/prepare-swsh45.sh
python3 scripts/preflight-swsh5-release.py --full
