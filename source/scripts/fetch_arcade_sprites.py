#!/usr/bin/env python3
"""Package Arcade sprites from PokeAPI; runtime never needs these source URLs.

PokeAPI default sprites include retail extracts and community Gen5-style sprites
for later generations. These are sourced assets, never AI-generated substitutes.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import io
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "app/src/main/assets/arcade/sprites"
BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/"
ITEMS = ("cheri", "chesto", "pecha", "rawst", "aspear", "leppa", "oran", "razz", "bluk", "pinap", "wepear", "magost", "durin", "nomel")
ASSETS = [(f"pokemon/{variant}{i}.png", BASE + f"pokemon/{variant}{i}.png")
          for i in range(1, 1026) for variant in ("", "shiny/")]
ASSETS += [(f"items/{item}-berry.png", BASE + f"items/{item}-berry.png") for item in ITEMS]
ASSETS += [("items/poke-ball.png", BASE + "items/poke-ball.png")]
ASSETS += [(f"items/{name}.png", BASE + f"items/{name}.png") for name in ("helix-fossil", "dome-fossil", "old-amber", "armor-fossil", "skull-fossil")]
ASSETS += [(f"pokemon/unown/{letter}.png", BASE + ("pokemon/201.png" if letter == "a" else f"pokemon/201-{letter}.png"))
           for letter in "abcdefghijklmnopqrstuvwxyz"]
ASSETS += [(f"pokemon/unown/{letter}.png", BASE + f"pokemon/201-{letter}.png") for letter in ("exclamation", "question")]

def check() -> int:
    manifest_path = OUT / "manifest.json"
    if not manifest_path.exists():
        print("Missing Arcade sprite manifest")
        return 2
    manifest = {r["path"]: r for r in json.loads(manifest_path.read_text(encoding="utf-8"))}
    errors = []
    for rel, _ in ASSETS:
        path = OUT / rel
        record = manifest.get("arcade/sprites/" + rel, {})
        if not path.exists():
            errors.append(rel + ": missing")
            continue
        data = path.read_bytes()
        if not data.startswith(b"\x89PNG\r\n\x1a\n") or hashlib.sha256(data).hexdigest() != record.get("sha256"):
            errors.append(rel + ": invalid/checksum mismatch")
    for error in errors:
        print("FAIL", error)
    if not errors:
        print(f"All {len(ASSETS)} offline Arcade sprites pass PNG/checksum validation.")
    return 2 if errors else 0

def install(force: bool = False, workers: int = 16) -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    old_path = OUT / "manifest.json"
    old = {r["path"]: r for r in json.loads(old_path.read_text(encoding="utf-8"))} if old_path.exists() else {}
    def fetch(row):
        rel, url = row
        dest = OUT / rel
        key = "arcade/sprites/" + rel
        errors = []
        if dest.exists() and not force:
            data = dest.read_bytes()
            if data.startswith(b"\x89PNG\r\n\x1a\n") and hashlib.sha256(data).hexdigest() == old.get(key, {}).get("sha256"):
                return old[key]
        for _ in range(2):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "LuckyDex offline asset recovery"}), timeout=15) as response:
                    data = response.read()
                if not data.startswith(b"\x89PNG\r\n\x1a\n"):
                    raise ValueError("Expected PNG")
                # Pillow is needed only when downloading, never for offline --check.
                from PIL import Image
                with Image.open(io.BytesIO(data)) as im:
                    im.load()
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(data)
                return {"path": key, "source_url": url, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
            except Exception as exc:
                errors.append(str(exc))
        return {"path": key, "source_url": url, "missing": True, "errors": errors}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        results = list(pool.map(fetch, ASSETS))
    old_path.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    missing = [r for r in results if r.get("missing")]
    print(f"Packaged {len(results) - len(missing)}/{len(results)} offline sprites ({sum(r.get('bytes', 0) for r in results)} bytes)")
    for row in missing:
        print("FAIL", row["path"], row["errors"])
    return 2 if missing else 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    raise SystemExit(check() if args.check else install(args.force))
