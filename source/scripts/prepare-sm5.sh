#!/bin/sh
# Run from any directory. Downloads SHA-pinned official Ultra Prism prints once,
# builds the 178-card offline catalogue, and runs the mandatory release gate.
set -eu
cd "$(dirname "$0")/.."
if [ -s data/classic/sm5-print-compact.json ] && [ -s docs/SM5_CANONICAL_SOURCE.json ]; then
  # Reuse the already verified official source from Stage 1 (offline-safe).
  python3 scripts/build-sm5.py
else
  # On a first installation this pins and downloads the official source.
  python3 scripts/build-sm5.py --prepare
fi
python3 scripts/preflight-sm5-release.py --full
