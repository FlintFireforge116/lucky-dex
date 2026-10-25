"""Build and independently audit a source-relative, changed-files-only release ZIP.

Usage: python scripts/package-tcgp-patch.py BASELINE_ZIP OUTPUT_DIRECTORY
The supplied GitHub export is the only comparison input; no Git history is used.
"""
import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "lucky-dex-main/source/"
RELEASE = "v0.69.29"
EXCLUDED_DIRS = {".git", ".gradle", "node_modules", "__pycache__", "artifacts"}


def included(name):
    parts = Path(name).parts
    return (not any(p in EXCLUDED_DIRS for p in parts)
            and not name.startswith("app/build/")
            and name != "local.properties")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def file_digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def main():
    baseline = Path(sys.argv[1]).resolve(strict=True)
    output = Path(sys.argv[2]).resolve()
    output.mkdir(parents=True, exist_ok=True)
    patch = output / f"LuckyDex_patch_{RELEASE}.zip"
    current = {p.relative_to(ROOT).as_posix(): p for p in ROOT.rglob("*")
               if p.is_file() and included(p.relative_to(ROOT).as_posix())}
    with zipfile.ZipFile(baseline) as original:
        assert original.testzip() is None, "Baseline archive CRC failure"
        entries = {i.filename[len(PREFIX):]: i for i in original.infolist()
                   if i.filename.startswith(PREFIX) and not i.is_dir()
                   and included(i.filename[len(PREFIX):])}
        assert entries and "app/src/main/assets/tcgp-battle-core.js" in entries
        before = {n: digest(original.read(i)) for n, i in entries.items()}
        after = {n: file_digest(p) for n, p in current.items()}
        changed = sorted(n for n in after if n in before and after[n] != before[n])
        added = sorted(n for n in after if n not in before)
        deleted = sorted(set(before) - set(after))
        runtime_allowlist = {"tcgp-battle-ui.js", "tcgp-battle.css", "tcgp-battle-layout.js", "index.html", "app-v0167.js"}
        assert all(not n.startswith("app/src/main/assets/") or n.removeprefix("app/src/main/assets/") in runtime_allowlist
                   for n in changed + added + deleted), "Unrelated runtime asset changed"
        preserved = ["tcgp-battle-" + n + ".js" for n in
                     ["core", "ai", "data", "decks", "effects", "solo", "progress"]]
        preserved += ["achievements-tcgp-battle-v06920.js"]
        for name in preserved:
            name = "app/src/main/assets/" + name
            assert before[name] == after[name], "Protected module changed: " + name
        assert before["app/luckydex-dev.keystore"] == after["app/luckydex-dev.keystore"]
        app = "app/src/main/assets/app-v0167.js"
        assert original.read(entries[app]).replace(b"__LUCKYDEX_BUILD='0.69.28'", b"__LUCKYDEX_BUILD='0.69.29'") == current[app].read_bytes(), "App shell changed beyond version marker"
        workflow = ROOT.parent / ".github/workflows/build-apk.yml"
        assert original.read("lucky-dex-main/.github/workflows/build-apk.yml") == workflow.read_bytes()

    with zipfile.ZipFile(patch, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in sorted(changed + added):
            assert not name.startswith(("source/", "/")) and ".." not in Path(name).parts
            info = zipfile.ZipInfo(name, date_time=(2026, 10, 25, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, current[name].read_bytes())
    # Simulate unzip over the supplied source using independent entry hashes.
    reconstructed = {n: h for n, h in before.items() if n not in deleted}
    with zipfile.ZipFile(patch) as z:
        assert z.testzip() is None, "Patch CRC failure"
        assert sorted(z.namelist()) == sorted(changed + added)
        for name in z.namelist():
            value = digest(z.read(name))
            assert value != before.get(name), "Unchanged file in patch: " + name
            reconstructed[name] = value
    assert reconstructed == after, "Patch does not reconstruct the working source"
    if deleted:
        (output / f"LuckyDex_delete_{RELEASE}.txt").write_text("\n".join(deleted) + "\n", encoding="utf-8")
    else:
        assert not (output / f"LuckyDex_delete_{RELEASE}.txt").exists(), "Unexpected stale deletion list"

    apk = ROOT / "app/build/outputs/apk/debug/app-debug.apk"
    embedded = ["tcgp-battle-ui.js", "tcgp-battle.css", "tcgp-battle-layout.js", "index.html", "app-v0167.js"] + preserved
    with zipfile.ZipFile(apk) as z:
        for name in embedded:
            assert z.read("assets/" + name) == (ROOT / "app/src/main/assets" / name).read_bytes(), "Stale APK asset: " + name
    report = {"baseline": str(baseline), "baseline_sha256": file_digest(baseline),
              "patch": str(patch), "patch_sha256": file_digest(patch), "bytes": patch.stat().st_size,
              "changed": changed, "added": added, "deleted": deleted,
              "unchanged_source_files": len(set(before) & set(after)) - len(changed),
              "reconstructed_source_matches": True, "protected_modules_and_signer_unchanged": True,
              "app_shell_only_version_marker_changed": True, "canonical_workflow_unchanged": True,
              "apk_assets_match_current_source": True, "apk_sha256": file_digest(apk)}
    (output / f"LuckyDex_patch_audit_{RELEASE}.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
