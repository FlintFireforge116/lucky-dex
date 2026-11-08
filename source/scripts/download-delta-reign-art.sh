#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required. On Termux run: pkg install curl" >&2; exit 1
fi
DIR=source/app/src/main/assets/delta-reign-cards
mkdir -p "$DIR"
count=0
trap 'rm -f "$DIR"/*.part' EXIT
while IFS='|' read -r number filename; do
  [ -n "$filename" ] || continue
  out="$DIR/$filename"
  # Preserve local filenames used by LuckyDex; some source-host URLs differ.
  remote="$filename"
  case "$number" in
    092) remote="me06-092_emcees_hype.webp" ;;
    102) remote="me06-102_tate_lizas_training.webp" ;;
    103) remote="me06-103_zinnias_trust.webp" ;;
    115) remote="me06-115_azurill.webp" ;;
    128) remote="me06-128_emcees_hype_ur.webp" ;;
    130) remote="me06-130_tate_lizas_training_ur.webp" ;;
    131) remote="me06-131_zinnias_trust_ur.webp" ;;
    140) remote="me06-140_zinnias_trust_sir.webp" ;;
  esac
  if [ -f "$out" ] && [ "$(wc -c < "$out")" -gt 8000 ] && [ "$(head -c 4 "$out")" = RIFF ]; then
    :
  else
    tmp="$out.part"
    echo "[$number/141] $filename"
    curl --fail --location --silent --show-error --retry 3 --connect-timeout 15 --max-time 60 \
      --user-agent 'Mozilla/5.0 (compatible; LuckyDexCardArtImporter/1.0)' \
      "https://billsarchive.com/assets/delta-reign/small/$remote" -o "$tmp"
    if [ "$(wc -c < "$tmp")" -le 8000 ] || [ "$(head -c 4 "$tmp")" != RIFF ]; then
      echo "Invalid or incomplete WebP: $filename" >&2;exit 1
    fi
    mv "$tmp" "$out"
  fi
  count=$((count+1))
done < source/scripts/delta-reign-art-download.txt
if [ "$count" -ne 141 ]; then echo "Only $count/141 files listed; refusing partial import" >&2; exit 1; fi
echo "Verified all 141 locally bundled Delta Reign card images."
