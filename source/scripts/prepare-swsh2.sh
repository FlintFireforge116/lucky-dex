#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh2.py
sh scripts/prepare-swsh1.sh
python3 scripts/preflight-swsh2-release.py --full
