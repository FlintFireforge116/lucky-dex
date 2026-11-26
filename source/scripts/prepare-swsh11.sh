#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh10.sh
python3 scripts/build-swsh11.py
python3 scripts/preflight-swsh11-release.py --full
