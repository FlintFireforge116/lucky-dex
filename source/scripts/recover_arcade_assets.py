#!/usr/bin/env python3
"""Recover authentic scenes and original-alpha crops. No generated replacements."""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
import hashlib
import io
import json
from pathlib import Path
import urllib.request
from fetch_arcade_v0200_assets import ASSETS, ROOT, OUT, UA, valid_image

SHEETS = {
    "amie_backgrounds_sheet": ("amie/backgrounds-sheet.png", ("https://www.spriters-resource.com/media/assets/59/62308.png",)),
    "amie_berry-picker_sheet": ("amie/berry-picker-sheet.png", ("https://www.spriters-resource.com/media/assets/61/64165.png",)),
    "amie_head-it_sheet": ("amie/head-it-sheet.png", ("https://www.spriters-resource.com/media/assets/61/64166.png",)),
}
TILEMAPS = {
    name: (f"berry-blender/{name}.bin", (f"https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/{name}.bin",))
    for name in ("center_map", "outer_map")
}
BLENDER_OUTPUTS = ("center-composed", "outer-composed", "center-display", "outer-display", "arrow-frame")
CROPS = {
    "berry-picker-backdrop": ("berry-picker-sheet.png", (0, 347, 320, 587)),
    "head-it-backdrop": ("head-it-sheet.png", (0, 966, 320, 1206)),
    "head-it-upper-backdrop": ("head-it-sheet.png", (0, 726, 400, 966)),
    "tile-puzzle-backdrop": ("tile-puzzle.jpg", (215, 548, 385, 657)),
    "yarn-pink": ("head-it-sheet.png", (0, 1213, 59, 1296)),
    "yarn-blue": ("head-it-sheet.png", (0, 1393, 59, 1476)),
    "yarn-yellow": ("head-it-sheet.png", (0, 1572, 61, 1656)),
    "yarn-purple": ("head-it-sheet.png", (0, 1753, 59, 1836)),
    "yarn-bonus": ("head-it-sheet.png", (0, 1894, 126, 2089)),
}
MINING_CROPS = {
    "rock-tile": ("underground-digging.jpg", (162, 65, 205, 108)),
    "wall-texture": ("underground-digging.jpg", (666, 455, 710, 499)),
    "soil-tile": ("underground-digging.jpg", (474, 367, 514, 406)),
}

MANIFEST = OUT / "manifest.json"
PREFIX = "arcade/authentic-v0200/"

def records():
    return {r["path"]: r for r in json.loads(MANIFEST.read_text(encoding="utf-8"))} if MANIFEST.exists() else {}

def format_matches(path, data):
    return ((path.suffix == ".bin" and len(data) > 0)
            or (path.suffix == ".png" and data.startswith(b"\x89PNG\r\n\x1a\n"))
            or (path.suffix == ".jpg" and data.startswith(b"\xff\xd8\xff"))
            or (path.suffix == ".webp" and data.startswith(b"RIFF") and data[8:12] == b"WEBP"))

def existing_valid(path, record):
    if not path.exists():
        return False
    data = path.read_bytes()
    return (path.suffix == ".bin" or valid_image(data)) and format_matches(path, data) and hashlib.sha256(data).hexdigest() == record.get("sha256")

def check():
    rows = records()
    paths = [relative for relative, _ in (ASSETS | SHEETS | TILEMAPS).values()]
    paths += [f"amie/{name}.png" for name in CROPS]
    paths += [f"mining/{name}.png" for name in MINING_CROPS]
    paths += [f"berry-blender/{name}.png" for name in BLENDER_OUTPUTS]
    failures = [relative for relative in paths if not existing_valid(OUT / relative, rows.get(PREFIX + relative, {}))]
    for relative in failures:
        print("Missing/invalid/checksum mismatch authentic asset:", relative)
    if not failures:
        print(f"All {len(paths)} authentic scenes, sheets and crops pass encoding/checksum validation.")
    return 2 if failures else 0

def install(force=False):
    old = records()
    OUT.mkdir(parents=True, exist_ok=True)
    def get(row):
        key, (relative, urls) = row
        dest = OUT / relative
        path = PREFIX + relative
        if not force and existing_valid(dest, old.get(path, {})):
            return old[path]
        failures = []
        for url in urls:
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=18) as response:
                    raw = response.read()
                if dest.suffix == ".bin":
                    if len(raw) != (1024 if key == "center_map" else 2048):
                        raise ValueError("Unexpected original tilemap size")
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_bytes(raw)
                    return {"key": key, "path": path, "source_url": url, "format": "BINARY", "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
                from PIL import Image
                with Image.open(io.BytesIO(raw)) as image:
                    source_format = image.format
                    frames = getattr(image, "n_frames", 1)
                    image.seek(0)
                    image.load()
                    target = {".jpg": "JPEG", ".png": "PNG", ".webp": "WEBP"}[dest.suffix]
                    data = raw
                    if source_format != target or frames > 1:
                        buffer = io.BytesIO()
                        image.convert("RGB" if target == "JPEG" else "RGBA").save(buffer, format=target)
                        data = buffer.getvalue()
                    record = {"key": key, "path": path, "source_url": url, "source_sha256": hashlib.sha256(raw).hexdigest(),
                              "source_format": source_format, "format": target, "width": image.width, "height": image.height,
                              "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
                    if frames > 1:
                        record["transformation"] = {"frame": 0, "description": "Static first frame, re-encoded to match filename"}
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(data)
                print("GET", key, len(data))
                return record
            except Exception as exc:
                failures.append(f"{url}: {exc}")
        print("FAIL", key)
        return {"key": key, "path": path, "missing": True, "errors": failures}
    with ThreadPoolExecutor(max_workers=8) as pool:
        result = list(pool.map(get, (ASSETS | SHEETS | TILEMAPS).items()))
    by_path = {r["path"]: r for r in result}
    for group, name, source, box in ([("amie", name, source, box) for name, (source, box) in CROPS.items()] + [("mining", name, source, box) for name, (source, box) in MINING_CROPS.items()]):
        source_path = PREFIX + group + "/" + source
        path = PREFIX + f"{group}/{name}.png"
        dest = OUT / group / f"{name}.png"
        source_record = by_path.get(source_path, {})
        if source_record.get("missing"):
            result.append({"path": path, "missing": True, "errors": ["Source sheet unavailable"]})
            continue
        record = old.get(path, {})
        if force or not existing_valid(dest, record):
            from PIL import Image
            with Image.open(OUT / group / source) as im:
                im.crop(box).save(dest)
            data = dest.read_bytes()
            record = {"key": name, "path": path, "source_url": source_record["source_url"], "derived_from": source_path,
                      "transformation": {"crop": list(box), "description": "Unretouched original crop; no generated pixels"},
                      "format": "PNG", "width": box[2] - box[0], "height": box[3] - box[1],
                      "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
        result.append(record)
    result.extend(materialize_blender(result, old, force))
    MANIFEST.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return check()

def materialize_blender(source_rows, old, force=False):
    """Decode original affine/regular GBA tile maps; retain original palette/alpha."""
    import struct
    by_path = {r["path"]: r for r in source_rows}
    source_names = ("center.png", "outer.png", "arrow.png", "center_map.bin", "outer_map.bin")
    if any(by_path.get(PREFIX + "berry-blender/" + name, {}).get("missing") for name in source_names):
        return [{"path": PREFIX + f"berry-blender/{name}.png", "missing": True} for name in BLENDER_OUTPUTS]
    if not force and all(existing_valid(OUT / "berry-blender" / f"{name}.png", old.get(PREFIX + f"berry-blender/{name}.png", {})) for name in BLENDER_OUTPUTS):
        return [old[PREFIX + f"berry-blender/{name}.png"] for name in BLENDER_OUTPUTS]
    from PIL import Image
    outputs = []
    def transparent(im):
        indices = im.copy()
        rgba = im.convert("RGBA")
        alpha = Image.new("L", indices.size)
        alpha.putdata([0 if index == 0 else 255 for index in indices.getdata()])
        rgba.putalpha(alpha)
        return rgba
    def record(name, image, derived, operation):
        path = PREFIX + f"berry-blender/{name}.png"
        dest = OUT / "berry-blender" / f"{name}.png"
        image.save(dest)
        data = dest.read_bytes()
        outputs.append({"key": name, "path": path, "source_url": by_path[PREFIX + "berry-blender/" + derived[0]]["source_url"],
                        "derived_from": [PREFIX + "berry-blender/" + item for item in derived],
                        "transformation": operation, "format": "PNG", "width": image.width, "height": image.height,
                        "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
    for name, word, crop in (("center", False, (72, 32, 168, 128)), ("outer", True, (0, 0, 240, 160))):
        source = transparent(Image.open(OUT / "berry-blender" / f"{name}.png"))
        data = (OUT / "berry-blender" / f"{name}_map.bin").read_bytes()
        values = struct.unpack("<" + ("H" if word else "B") * (len(data) // (2 if word else 1)), data)
        image = Image.new("RGBA", (256, 256))
        cols = source.width // 8
        for i, value in enumerate(values):
            tile_id = value & 1023 if word else value
            if tile_id >= source.width * source.height // 64:
                raise ValueError("Invalid tile index")
            tile = source.crop(((tile_id % cols) * 8, (tile_id // cols) * 8, (tile_id % cols + 1) * 8, (tile_id // cols + 1) * 8))
            if word and value & 1024:
                tile = tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if word and value & 2048:
                tile = tile.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
            image.paste(tile, ((i % 32) * 8, (i // 32) * 8))
        derived = [f"{name}.png", f"{name}_map.bin"]
        record(name + "-composed", image, derived, {"description": "Original GBA tilemap assembly, palette index 0 transparent; no invented pixels"})
        record(name + "-display", image.crop(crop), derived, {"crop": list(crop), "description": "Original GBA tilemap assembly and display-region crop"})
    record("arrow-frame", transparent(Image.open(OUT / "berry-blender/arrow.png")).crop((0, 0, 32, 32)), ["arrow.png"], {"crop": [0, 0, 32, 32], "description": "First original arrow sprite frame, palette index 0 transparent"})
    return outputs

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    raise SystemExit(check() if args.check else install(args.force))
