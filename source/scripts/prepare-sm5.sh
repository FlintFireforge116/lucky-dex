#!/bin/sh
# Run from any directory. Downloads SHA-pinned official Ultra Prism prints once,
# builds the 178-card offline catalogue, and runs the mandatory release gate.
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-sm5.py --prepare
python3 scripts/preflight-sm5-release.py --full
