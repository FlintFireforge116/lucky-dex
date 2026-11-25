#!/bin/sh
# Fast, read-only verification of a previously tested packaged release.
set -eu
cd "$(dirname "$0")/.."
exec python3 -B scripts/release_manifest.py "$@"
