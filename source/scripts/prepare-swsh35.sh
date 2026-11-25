#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh35.py
sh scripts/prepare-swsh3.sh
python3 scripts/preflight-swsh35-release.py --full
