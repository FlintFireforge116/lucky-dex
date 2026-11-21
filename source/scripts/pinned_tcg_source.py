#!/usr/bin/env python3
"""Download canonical Pokémon TCG set JSON without the GitHub REST API quota.

The source URL is pinned to an immutable upstream Git commit. Every downloaded
byte is checked against the individual Git blob SHA already fixed in each
set generator. Neither changing upstream master nor shared REST rate limits
can silently alter an APK catalogue.
"""
from __future__ import annotations
import hashlib
import json
import urllib.request

PINNED_COMMIT = "90f27d0e14cefe48ccb2b8922a7a356b2fcf0072"
RAW_PREFIX = f"https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/{PINNED_COMMIT}/cards/en"


def load_pinned_set(set_id: str, expected_blob_sha: str, timeout: int = 75):
    if not set_id or not all(c.isalnum() for c in set_id):
        raise ValueError("Unexpected TCG set identifier")
    if len(expected_blob_sha) != 40 or any(c not in "0123456789abcdef" for c in expected_blob_sha):
        raise ValueError("Expected canonical 40-character Git blob SHA")
    url = f"{RAW_PREFIX}/{set_id}.json"
    request = urllib.request.Request(
        url, headers={"User-Agent": "LuckyDex-verified-card-catalogue", "Accept": "application/json"}
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read()
    actual_sha = hashlib.sha1(f"blob {len(raw)}\0".encode("ascii") + raw).hexdigest()
    if actual_sha != expected_blob_sha:
        raise RuntimeError(
            f"{set_id} source Git blob mismatch: expected {expected_blob_sha}, got {actual_sha}"
        )
    return json.loads(raw)
