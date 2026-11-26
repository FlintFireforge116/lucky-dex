#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
sh scripts/prepare-cel25.sh
python3 scripts/build-cel25c.py
python3 scripts/preflight-cel25c-release.py --full
