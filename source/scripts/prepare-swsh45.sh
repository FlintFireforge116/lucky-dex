#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-swsh45.py
python3 scripts/build-swsh45sv.py
sh scripts/prepare-swsh4.sh
python3 scripts/preflight-swsh45sv-release.py --full
python3 scripts/preflight-swsh45-release.py --full
