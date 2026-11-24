#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/preflight-all-release-sources.py
python3 scripts/build-sm11.py
node --test tests/v07399-sun-moon-integration.test.cjs
python3 scripts/preflight-sm11-release.py --full
