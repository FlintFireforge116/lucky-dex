#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh3.py
sh scripts/prepare-swsh2.sh
python3 scripts/preflight-swsh3-release.py --full
