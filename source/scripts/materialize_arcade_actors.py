#!/usr/bin/env python3
"""Trim transparent sprite padding without resizing, repainting or replacing pixels."""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "app/src/main/assets"
SPRITES = ASSET_ROOT / "arcade/sprites"
OUT = SPRITES / "actors"
MANIFEST = OUT / "manifest.json"
SOURCES = [(f"pokemon/{variant}{i}.png", f"pokemon/{variant}{i}.png")
           for i in range(1, 1026) for variant in ("", "shiny/")]
SOURCES += [(f"pokemon/unown/{letter}.png", f"unown/{letter}.png")
            for letter in list("abcdefghijklmnopqrstuvwxyz") + ["exclamation", "question"]]
PNG = b"\x89PNG\r\n\x1a\n"

def records(path):
    return {row["path"]: row for row in json.loads(path.read_text(encoding="utf-8"))} if path.exists() else {}

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def check():
    rows = records(MANIFEST)
    sources = records(SPRITES / "manifest.json")
    errors = []
    for source_relative, target_relative in SOURCES:
        source_key = "arcade/sprites/" + source_relative
        target_key = "arcade/sprites/actors/" + target_relative
        source = SPRITES / source_relative
        target = OUT / target_relative
        row = rows.get(target_key, {})
        if not source.exists() or not target.exists():
            errors.append(target_relative + ": missing source/actor")
            continue
        if not target.read_bytes().startswith(PNG) or digest(target) != row.get("sha256"):
            errors.append(target_relative + ": invalid PNG/output checksum")
        source_hash = digest(source)
        if row.get("source_sha256") != source_hash or source_hash != sources.get(source_key, {}).get("sha256"):
            errors.append(target_relative + ": source checksum mismatch")
        if row.get("derived_from") != source_key or row.get("transformation", {}).get("operation") != "alpha-bounds-crop":
            errors.append(target_relative + ": missing exact source/trim provenance")
    for error in errors:
        print("FAIL", error)
    if not errors:
        print(f"All {len(SOURCES)} unretouched Arcade actors pass source/output PNG/checksum validation.")
    return 2 if errors else 0

def install(force=False):
    sources = records(SPRITES / "manifest.json")
    old = records(MANIFEST)
    OUT.mkdir(parents=True, exist_ok=True)
    def trim(pair):
        source_relative, target_relative = pair
        source_key = "arcade/sprites/" + source_relative
        target_key = "arcade/sprites/actors/" + target_relative
        source = SPRITES / source_relative
        target = OUT / target_relative
        source_hash = digest(source)
        source_row = sources.get(source_key, {})
        if source_hash != source_row.get("sha256"):
            raise ValueError(f"Source checksum mismatch: {source_relative}")
        row = old.get(target_key, {})
        if not force and target.exists() and row.get("source_sha256") == source_hash and digest(target) == row.get("sha256"):
            return row
        from PIL import Image
        with Image.open(source) as image:
            image.load()
            bounds = image.convert("RGBA").getchannel("A").getbbox()
            full = (0, 0, image.width, image.height)
            target.parent.mkdir(parents=True, exist_ok=True)
            if bounds is None or bounds == full:
                target.write_bytes(source.read_bytes())
            else:
                image.crop(bounds).save(target, format="PNG")
            crop = bounds or full
            return {"path": target_key, "source_url": source_row["source_url"], "derived_from": source_key,
                    "source_sha256": source_hash,
                    "transformation": {"operation": "alpha-bounds-crop", "crop": list(crop),
                                       "source_size": [image.width, image.height], "alpha_empty": bounds is None,
                                       "description": "Exact visible alpha bounds; original pixels/alpha preserved, no resize or repaint"},
                    "format": "PNG", "width": crop[2] - crop[0], "height": crop[3] - crop[1],
                    "sha256": digest(target), "bytes": target.stat().st_size}
    with ThreadPoolExecutor(max_workers=4) as pool:
        result = list(pool.map(trim, SOURCES))
    MANIFEST.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    empty = [r["path"] for r in result if r["transformation"]["alpha_empty"]]
    print(f"Materialized {len(result)} authentic actors; {sum(r['bytes'] for r in result)} bytes; empty alpha: {len(empty)}")
    for path in empty:
        print("EMPTY ALPHA — original kept:", path)
    return check()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    raise SystemExit(check() if args.check else install(args.force))
