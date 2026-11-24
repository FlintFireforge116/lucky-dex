#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-sm12.py
sh scripts/prepare-sm115.sh
python3 scripts/preflight-sm12-release.py --full
