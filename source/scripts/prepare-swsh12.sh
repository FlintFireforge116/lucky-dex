#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh11.sh
python3 scripts/build-swsh12.py
python3 scripts/preflight-swsh12-release.py --full
