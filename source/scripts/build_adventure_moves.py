"""Build Adventure's offline move bundle from the pinned public PokeAPI CSV cache.

No network is used by the builder. Run from any directory with Python 3.10+.
The source manifest hashes every CSV so accidental cache edits fail loudly.
"""
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "data/adventure-moves"
OUTPUT = ROOT / "app/src/main/assets/adventure/adventure-move-data.js"
MANIFEST = CACHE / "manifest.json"
SNAPSHOT = "2fe95532d27a9bf340575253aff50868319d8182"
# Conventional main-series games with traditional move/PP and level semantics.
# Newest available per Pokemon, never a union of incompatible versions/forms.
VERSION_PREFERENCE = [27, 26, 25, 23, 22, 21, 20, 18, 17, 16, 15, 14, 11,
                      10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
TM_IDS = [182, 92, 86, 14, 156, 526, 332, 317, 523, 555, 577, 94, 247,
          53, 57, 85, 58, 412, 337, 280, 188, 430, 404, 399, 605, 503,
          157, 89, 369, 206]
# These are distinctive actual level-up moves; preserve species identity even
# when a status-only opening requires the battle engine's Struggle fallback.
SPECIAL_BASICS = {11: 106, 14: 106, 63: 100, 129: 150, 132: 144, 201: 237,
                  202: 68, 225: 217, 235: 166, 266: 106, 268: 106, 349: 150,
                  360: 150, 789: 150, 790: 322}
SIMPLE_EARLY = [52, 55, 84, 22, 71, 141, 16, 64, 40, 51, 181, 209,
                122, 310, 425, 33, 10, 1, 98, 183, 232, 210, 343, 574]
# Recognisable defensive moves whose PokeAPI category is "unique" rather than
# a direct stat increase. The engine may adapt them to a temporary defence buff.
DEFENSIVE_BUFFS = {54, 112, 113, 115, 164, 182, 197, 203, 219, 469, 578, 588, 661}


def rows(name):
    with (CACHE / name).open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def integer(value):
    return int(value) if value != "" else None


def main():
    files = sorted(CACHE.glob("*.csv"))
    hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    if MANIFEST.exists():
        old = json.loads(MANIFEST.read_text(encoding="utf-8"))
        if old["snapshot"] != SNAPSHOT or old["sha256"] != hashes:
            raise ValueError("Pinned PokeAPI source cache differs from manifest")
    else:
        manifest = {"source": "https://github.com/PokeAPI/pokeapi", "snapshot": SNAPSHOT,
                    "retrieved": "2026-10-09", "sha256": hashes}
        MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    defaults = {int(r["species_id"]): r for r in rows("pokemon.csv")
                if r["is_default"] == "1" and int(r["species_id"]) <= 1025}
    types = {int(r["id"]): r["identifier"] for r in rows("types.csv")}
    pokemon_types = defaultdict(list)
    for r in rows("pokemon_types.csv"):
        pokemon_types[int(r["pokemon_id"])].append(types[int(r["type_id"])])
    source_moves = {int(r["id"]): r for r in rows("moves.csv")}
    names = {int(r["move_id"]): r["name"] for r in rows("move_names.csv")
             if r["local_language_id"] == "9"}
    meta = {int(r["move_id"]): r for r in rows("move_meta.csv")}
    ailments = {int(r["id"]): r["identifier"] for r in rows("move_meta_ailments.csv")}
    versions = {int(r["id"]): r["identifier"] for r in rows("version_groups.csv")}
    changes = defaultdict(list)
    for r in rows("move_meta_stat_changes.csv"):
        changes[int(r["move_id"])].append({"statId": int(r["stat_id"]),
                                            "change": int(r["change"])})

    # Keep only actual default Pokemon form records for the bundled National Dex.
    pokemon_ids = {int(r["id"]) for r in defaults.values()}
    learnsets = defaultdict(lambda: defaultdict(list))
    for r in rows("pokemon_moves.csv"):
        pid, version = int(r["pokemon_id"]), int(r["version_group_id"])
        if pid in pokemon_ids and version in VERSION_PREFERENCE and r["pokemon_move_method_id"] in ("1", "4"):
            learnsets[pid][version].append(r)

    used = {165, *TM_IDS}
    species = {}
    special_notes = {}
    for sid in range(1, 1026):
        pokemon = defaults[sid]
        pid = int(pokemon["id"])
        version = next((v for v in VERSION_PREFERENCE
                        if any(r["pokemon_move_method_id"] == "1" for r in learnsets[pid][v])), None)
        if version is None:
            raise ValueError(f"No traditional level-up data for {sid}")
        current = learnsets[pid][version]
        levels = {}
        for r in current:
            if r["pokemon_move_method_id"] == "1":
                mid, level = int(r["move_id"]), int(r["level"])
                # Evolution/relearner entries at level 0 are available at level 1.
                levels[mid] = min(levels.get(mid, 101), max(1, level))
        level_up = sorted(({"level": level, "moveId": mid} for mid, level in levels.items()),
                          key=lambda r: (r["level"], r["moveId"]))
        damaging = [mid for mid in levels if source_moves[mid]["damage_class_id"] != "1"
                    and integer(source_moves[mid]["power"]) is not None
                    and int(source_moves[mid]["power"]) > 0]
        low = [mid for mid in damaging if int(source_moves[mid]["power"]) <= 40]
        basic_version = version
        basic_levels = levels
        # Current stone-evolution/relearner lists can lose appropriate basic
        # moves. An earlier verified default-form level-up association remains
        # preferable to an invented move or an initial 90-power attack.
        if not low and sid not in SPECIAL_BASICS:
            for older in VERSION_PREFERENCE[VERSION_PREFERENCE.index(version) + 1:]:
                old_levels = {int(r["move_id"]): max(1, int(r["level"]))
                              for r in learnsets[pid][older]
                              if r["pokemon_move_method_id"] == "1"}
                old_low = [mid for mid in old_levels if source_moves[mid]["damage_class_id"] != "1"
                           and integer(source_moves[mid]["power"]) is not None
                           and 0 < int(source_moves[mid]["power"]) <= 40]
                if old_low:
                    low, basic_levels, basic_version = old_low, old_levels, older
                    special_notes[sid] = "Verified earlier default-form basic move; progression uses current learnset"
                    break

        def basic_rank(mid):
            move = source_moves[mid]
            stab = types[int(move["type_id"])] in pokemon_types[pid]
            # Do not start with a late-game move solely to obtain STAB.
            early = basic_levels[mid] <= 12
            simple = SIMPLE_EARLY.index(mid) if mid in SIMPLE_EARLY else len(SIMPLE_EARLY)
            return (not early, not stab, basic_levels[mid], simple, -int(move["power"]), mid)

        if sid in SPECIAL_BASICS and SPECIAL_BASICS[sid] in levels:
            basic = SPECIAL_BASICS[sid]
            special_notes[sid] = "Distinctive canonical starting move"
        elif low:
            basic = min(low, key=basic_rank)
        elif damaging:
            # Some species have no damaging <=40 move: actual least-powerful
            # early level-up move wins rather than fabricating a weak STAB move.
            early_damage = [mid for mid in damaging if levels[mid] <= 12]
            pool = early_damage or damaging
            basic = min(pool, key=lambda mid: (int(source_moves[mid]["power"]), basic_rank(mid)))
            special_notes[sid] = "No suitable damaging level-up move at power 40 or below"
        else:
            basic = min(levels, key=lambda mid: (levels[mid], mid))
            special_notes[sid] = "Status-only learnset: canonical move plus Struggle fallback"
        tm = sorted({int(r["move_id"]) for r in current
                     if r["pokemon_move_method_id"] == "4" and int(r["move_id"]) in TM_IDS})
        species[sid] = {"pokemonId": pid, "form": pokemon["identifier"],
                        "versionGroup": version, "basicMoveId": basic,
                        "basicVersionGroup": basic_version, "basicLevel": basic_levels[basic],
                        "levelUp": level_up, "tm": tm}
        used.update(levels)
        used.add(basic)

    moves = {}
    for mid in sorted(used):
        src = source_moves[mid]
        detail = meta.get(mid, {})
        damage_class = {1: "status", 2: "physical", 3: "special"}[int(src["damage_class_id"])]
        category = integer(detail.get("meta_category_id", ""))
        if damage_class != "status":
            role = "damage"
        elif category == 3 or int(detail.get("healing", "0") or 0) > 0:
            role = "heal"
        elif category in (1, 5):
            role = "status"
        elif mid in DEFENSIVE_BUFFS:
            role = "buff"
        elif category == 2 or changes[mid]:
            role = "debuff" if int(src["target_id"]) in (10, 11) else "buff"
        else:
            role = "no-op"
        moves[mid] = {"id": mid, "name": names[mid], "type": types[int(src["type_id"])],
                      "power": integer(src["power"]), "accuracy": integer(src["accuracy"]),
                      "pp": integer(src["pp"]), "priority": int(src["priority"]), "damageClass": damage_class, "role": role,
                      "effectId": integer(src["effect_id"]), "targetId": int(src["target_id"])}
        if detail:
            effect = {"ailment": ailments.get(int(detail["meta_ailment_id"]), "unknown"),
                      "ailmentChance": int(detail["ailment_chance"]),
                      "healing": int(detail["healing"]), "drain": int(detail["drain"]),
                      "flinchChance": int(detail["flinch_chance"]),
                      "statChance": int(detail["stat_chance"]), "statChanges": changes[mid]}
            for src_key, out_key in (("min_hits", "minHits"), ("max_hits", "maxHits")):
                if detail[src_key]:
                    effect[out_key] = int(detail[src_key])
            moves[mid]["effect"] = effect
    value = {"version": 1, "sourceSnapshot": SNAPSHOT, "fallbackMoveId": 165,
             "tmIds": TM_IDS, "versionGroups": {v: versions[v] for v in VERSION_PREFERENCE},
             "moves": moves, "species": species, "basicExceptions": special_notes}
    text = ("/* Generated offline PokeAPI move data. See docs/ADVENTURE_MOVE_SOURCES.md. */\n"
            "(function(root,factory){'use strict';const value=factory();"
            "if(typeof module==='object'&&module.exports)module.exports=value;"
            "if(root)root.LuckyDexMoveData=value;})(typeof window!=='undefined'?window:null,function(){"
            "'use strict';return " + json.dumps(value, ensure_ascii=False, separators=(",", ":")) + ";});\n")
    OUTPUT.write_text(text, encoding="utf-8")
    print(json.dumps({"species": len(species), "moves": len(moves), "tmCatalog": len(TM_IDS),
                      "levelUpEntries": sum(len(s["levelUp"]) for s in species.values()),
                      "compatibilityEntries": sum(len(s["tm"]) for s in species.values()),
                      "basicPowerAbove40": sum((moves[s["basicMoveId"]]["power"] or 0) > 40 for s in species.values()),
                      "statusBasics": sum(moves[s["basicMoveId"]]["damageClass"] == "status" for s in species.values()),
                      "versions": dict(Counter(versions[s["versionGroup"]] for s in species.values())),
                      "bytes": len(text.encode("utf-8"))}, indent=2))


if __name__ == "__main__":
    main()
