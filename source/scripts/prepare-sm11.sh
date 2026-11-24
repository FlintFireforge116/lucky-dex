#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-sm11.py
python3 scripts/preflight-sm11-release.py --full
