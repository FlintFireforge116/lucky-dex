#!/usr/bin/env sh
# Exact upstream archive, reviewed against original English Platinum: Arceus prints.
set -eu
SOURCE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
FILE="$SOURCE_DIR/data/classic/pl4-print-source.json"
if [ ! -f "$FILE" ]; then
  TMP="$FILE.tmp.$$"
  trap 'rm -f "$TMP"' EXIT HUP INT TERM
  echo 'Fetching immutable Platinum Arceus printed card archive (111 original IDs)…'
  curl --fail --location --silent --show-error --retry 3 \
    'https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/cd8994de02bdd356dd2d2cb98fdf7b105a5f377d/cards/en/pl4.json' \
    --output "$TMP"
  mv "$TMP" "$FILE"
fi
python3 "$SOURCE_DIR/scripts/build-arceus.py"
python3 "$SOURCE_DIR/tests/pl4_generator_regression.py"

# Verify the actual generated 111-print archive and live effect interactions before staging.
node --test "$SOURCE_DIR/tests/v07275-arceus-stage1.test.cjs" "$SOURCE_DIR/tests/v07276-arceus-completion.test.cjs" "$SOURCE_DIR/tests/v07277-arceus-build-fixes.test.cjs"
