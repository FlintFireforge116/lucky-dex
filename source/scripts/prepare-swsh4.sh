#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh4.py
sh scripts/prepare-swsh35.sh
python3 scripts/preflight-swsh4-release.py --full
