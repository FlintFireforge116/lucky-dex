#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-sm10.py
python3 scripts/preflight-sm10-release.py --full
