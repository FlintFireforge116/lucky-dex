#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-det1.py
python3 scripts/preflight-det1-release.py --full
