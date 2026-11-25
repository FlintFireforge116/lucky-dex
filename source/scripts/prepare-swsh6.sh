#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh6.py
sh scripts/prepare-swsh5.sh
python3 scripts/preflight-swsh6-release.py --full
