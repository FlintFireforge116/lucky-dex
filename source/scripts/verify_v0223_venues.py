"""Verify packaged v0.22.3 venue artwork and unretouched source crops offline."""
import hashlib
import json
from pathlib import Path
from urllib.parse import quote

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "app/src/main/assets"
MANIFEST = ASSETS / "arcade/venues-v0223/manifest.json"
EXPECTED = {
    "amieGarden", "goldenrod", "celadonPrize", "lilycoveContest",
    "moonStage", "oreburghMuseum", "ruinsAlph", "indigoQuiz",
}


def local(path):
    file = (ASSETS / path).resolve()
    assert file.is_relative_to(ASSETS.resolve()), f"Nonlocal asset: {path}"
    assert file.is_file(), f"Missing asset: {path}"
    return file


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def verify():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert manifest["version"] == "0.22.3"
    venues = manifest["venues"]
    assert len(venues) == 8 and {v["id"] for v in venues} == EXPECTED
    for entry in venues + manifest["source_assets"]:
        file = local(entry["path"])
        assert digest(file) == entry["sha256"], f"Hash mismatch: {file.name}"
        assert file.stat().st_size == entry["bytes"]
        with Image.open(file) as image:
            assert image.size == (entry["width"], entry["height"])
            assert image.format == entry["format"]
            image.verify()
    for entry in venues:
        file = local(entry["path"])
        assert quote(file.name) == entry["encoded_filename"]
        assert entry["kind"] in {"background", "building", "location", "location-preview", "retained-scene"}
        assert all(0 <= float(x.rstrip("%")) <= 100 for x in entry["object_position"].split())
        if "crop" in entry:
            source_file = local(entry["derived_from"])
            assert digest(source_file) == entry["source_sha256"]
            with Image.open(source_file) as source, Image.open(file) as actual:
                expected = source.crop(tuple(entry["crop"])).convert("RGBA")
                assert expected.size == actual.size
                assert expected.tobytes() == actual.convert("RGBA").tobytes(), f"Altered source pixels: {file.name}"
        if entry["id"] == "moonStage":
            assert not entry["replaced"]
            assert digest(file) == digest(local(entry["previous_path"]))
    print("PASS: 8 local venue assets; encoding, hashes, sizes, source pixels and retained Moon Stage verified.")
    for entry in venues:
        print(f"  {entry['id']}: {entry['path']} ({entry['width']}x{entry['height']}, {entry['object_position']})")


if __name__ == "__main__":
    verify()
