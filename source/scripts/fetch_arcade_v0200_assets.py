#!/usr/bin/env python3
"""Fetch the v0.20 Arcade's authentic reference/extracted assets before APK build.

The APK remains offline at runtime: everything fetched here is copied into
app/src/main/assets and packaged by Gradle. A required asset that cannot be
retrieved or validated aborts the build; there is deliberately no painted
fallback.
"""
from __future__ import annotations

import argparse
import hashlib
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "app/src/main/assets/arcade/authentic-v0200"
UA = "Mozilla/5.0 (LuckyDex personal fan app asset build; +https://github.com/)"

# key: (relative output, URLs tried in order)
ASSETS: dict[str, tuple[str, tuple[str, ...]]] = {
    # World / venue images â€” screenshots from the actual games/features.
    "venue_amie": ("venues/amie-garden.jpg", (
        "https://oraswiki.com/assets/images/mechanics/pokemon-amie/02-pokemon-oras-the-pokemon-amies-main-screen.jpg",
    )),
    "venue_goldenrod": ("venues/goldenrod-game-corner.jpg", (
        "https://static.guidestrats.com/images/02/13788/01-pokemon-hgss-outside-goldenrod-city-game-corner.jpg",
        "https://static.fandomspot.com/images/06/41430/01-goldenrod-game-corner-in-golden-city-pokemon-hgss-screenshot.jpg",
    )),
    "venue_celadon": ("venues/celadon-game-corner.jpg", (
        "https://static.guidestrats.com/images/12/7482/03-pokemon-hgss-player-arriving-in-front-of-the-celadon-game-corner.jpg",
    )),
    "venue_lilycove": ("venues/lilycove-contest-hall.jpg", (
        "https://static.oraswiki.com/assets/images/locations/towns-cities/lilycove-city/15-pokemon-oras-outside-lilycoves-contest-hall.jpg",
        "https://oraswiki.com/assets/images/locations/towns-cities/lilycove-city/15-pokemon-oras-outside-lilycoves-contest-hall.jpg",
    )),
    "venue_stadium": ("venues/stadium-classroom.webp", (
        "https://gameinformer.com/sites/default/files/styles/thumbnail/public/2023/04/04/7e3c97a1/pokemon_stadium_clefairy.png.webp",
        "https://giffiles.alphacoders.com/130/130925.gif",
    )),
    "venue_oreburgh": ("venues/oreburgh-museum.png", (
        "https://www.pokepedia.fr/images/thumb/f/f3/Mus%C3%A9e_Minier_de_Charbourg_DEPS.png/1200px-Mus%C3%A9e_Minier_de_Charbourg_DEPS.png",
    )),
    "venue_ruins": ("venues/ruins-of-alph.jpg", (
        "https://static.fandomspot.com/images/05/32822/13-grassy-area-containing-smeargle-and-antu-at-ruins-of-alph-pokemon-hgss-screenshot.jpg",
        "https://cdn-ak.f.st-hatena.com/images/fotolife/H/HimaJew/20210416/20210416233518.jpg",
    )),
    "venue_indigo": ("venues/indigo-plateau.jpg", (
        "https://www.fandomspot.com/images/05/14797/01-indigo-plateau-screenshot-pokemon-heartgold.jpg",
        "https://www.pokemontrash.com/images/heartgold-soulsilver/cartes/plateau-indigo.png",
    )),

    # PokÃ©mon-Amie retail screenshots and extracted sheets.
    "amie_berry_picker": ("amie/berry-picker.jpg", (
        "https://oraswiki.com/assets/images/mechanics/pokemon-amie/04-pokemon-oras-the-berry-picker-minigame.jpg",
    )),
    "amie_head_it": ("amie/head-it.jpg", (
        "https://oraswiki.com/assets/images/mechanics/pokemon-amie/05-pokemon-oras-the-head-it-minigame.jpg",
    )),
    "amie_tile_puzzle": ("amie/tile-puzzle.jpg", (
        "https://oraswiki.com/assets/images/mechanics/pokemon-amie/06-pokemon-oras-the-tile-puzzle-minigame.jpg",
    )),

    # Actual HGSS Voltorb Flip screenshot used as the dominant visual frame.
    "voltorb_screen": ("voltorb/screen.jpg", (
        "https://static.guidestrats.com/images/02/13788/06-pokemon-hgss-making-use-of-memos-in-voltorb-flip.jpg",
        "https://static.guidestrats.com/images/02/13788/03-pokemon-hgss-playing-voltorb-flip.jpg",
    )),

    # HGSS-faithful extracted/recreated source assets. These are tiny PNG assets
    # from a public faithful reconstruction of the original Voltorb Flip UI.
    "voltorb_blank": ("voltorb/blank.png", (
        "https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/blank.png",
    )),
    "voltorb_1": ("voltorb/1.png", (
        "https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/1.png",
    )),
    "voltorb_2": ("voltorb/2.png", (
        "https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/2.png",
    )),
    "voltorb_3": ("voltorb/3.png", (
        "https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/3.png",
    )),

    # Extracted PokÃ©mon Emerald Berry Blender graphics from pret/pokeemerald.
    "berry_blender_center": ("berry-blender/center.png", (
        "https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/center.png",
    )),
    "berry_blender_outer": ("berry-blender/outer.png", (
        "https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/outer.png",
    )),
    "berry_blender_arrow": ("berry-blender/arrow.png", (
        "https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/arrow.png",
    )),
    "berry_blender_screen": ("berry-blender/screen.jpg", (
        "https://assets.st-note.com/img/1719486905194-Ay3TlUL9a2.png?width=1200",
    )),

    # PokÃ©mon Stadium / Sinnoh actual game imagery.
    "clefairy_classroom": ("clefairy/clefairy-says.webp", (
        "https://gameinformer.com/sites/default/files/styles/thumbnail/public/2023/04/04/7e3c97a1/pokemon_stadium_clefairy.png.webp",
        "https://giffiles.alphacoders.com/130/130925.gif",
    )),
    "underground_digging": ("mining/underground-digging.jpg", (
        "https://images.cgames.de/images/gsgp/293/pok%C3%A9mon-diamantperl_6156377.jpg",
        "https://mcdn.pokemon.com/pokemon-prod/image/upload/c_limit%2Cw_1920/f_auto/v1/live/pcom-cms/static-assets/cms3/us/img/misc/tiles/2026/region-spotlight/sinnoh/inline/14-en.png",
    )),
}


def valid_image(data: bytes) -> bool:
    if len(data) < 90:
        return False
    return (
        data.startswith(b"\x89PNG\r\n\x1a\n")
        or data.startswith(b"\xff\xd8\xff")
        or data.startswith((b"GIF87a", b"GIF89a"))
        or data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    )


def fetch(url: str, attempts: int = 3) -> bytes:
    last: Exception | None = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"})
            with urllib.request.urlopen(req, timeout=35) as response:
                data = response.read()
            if not valid_image(data):
                raise RuntimeError(f"response is not a recognised image ({len(data)} bytes)")
            return data
        except Exception as exc:  # pragma: no cover - network path
            last = exc
            if attempt + 1 < attempts:
                time.sleep(1.0 + attempt)
    raise RuntimeError(str(last))


def install(force: bool = False) -> int:
    # Source acquisition is bounded/concurrent. Committed validated files need no
    # downloads and Pillow is only imported if a file must be recovered.
    from recover_arcade_assets import install as install_scenes
    from fetch_arcade_sprites import install as install_sprites
    scene_result = install_scenes(force)
    sprite_result = install_sprites(force)
    if scene_result or sprite_result:
        return 2
    from materialize_arcade_actors import install as install_actors
    return install_actors(force)


def check() -> int:
    from recover_arcade_assets import check as check_scenes
    from fetch_arcade_sprites import check as check_sprites
    scene_result = check_scenes()
    sprite_result = check_sprites()
    from materialize_arcade_actors import check as check_actors
    actor_result = check_actors()
    return 2 if scene_result or sprite_result or actor_result else 0


def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true',help='validate files without downloading')
    parser.add_argument('--force',action='store_true',help='redownload even when a valid local copy exists')
    args=parser.parse_args()
    return check() if args.check else install(args.force)

if __name__ == '__main__':
    raise SystemExit(main())
