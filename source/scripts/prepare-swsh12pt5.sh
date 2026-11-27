#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-swsh12-audit.sh
python3 scripts/build-swsh12pt5.py --prepare
python3 scripts/preflight-swsh12pt5-release.py --full
