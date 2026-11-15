#!/usr/bin/env python3
"""Detect generated-versus-offline Legends Awakened attack effect drift.

Runs fully offline, before prepare fetches archival metadata. The individual
PRINTS tuples are exact archived print snapshots, not invented effect text.
"""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import importlib.util
spec = importlib.util.spec_from_file_location(
    'build_legends_awakened', ROOT / 'scripts/build-legends-awakened.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
build_cards, simple_effect = mod.build_cards, mod.simple_effect
from dp6_extra_print_snapshots import PRINTS  # noqa: E402
from dp6_batch4_verified import ABILITIES as BATCH4_ABILITIES

TYPE = {'G': 'Grass', 'R': 'Fire', 'W': 'Water', 'L': 'Lightning',
        'P': 'Psychic', 'F': 'Fighting', 'D': 'Darkness', 'M': 'Metal',
        'C': 'Colorless'}


def make_prints():
    # The builder mandates a complete numbered 146-print set; untested slots are
    # non-playable Trainer placeholders purely for this narrow generator unit test.
    upstream = [{'id': f'dp6-{n}', 'number': str(n), 'name': f'Test placeholder {n}',
                 'supertype': 'Trainer', 'subtypes': ['Item'], 'rules': []}
                for n in range(1, 147)]
    for n, record in PRINTS.items():
        (name, stage, hp, typing, evolved, weak, weakval,
         resist, resval, retreat, rarity, moves) = record
        card = {'id': f'dp6-{n}', 'number': str(n), 'name': name,
                'supertype': 'Pokémon', 'subtypes': [stage], 'hp': str(hp),
                'types': [typing], 'convertedRetreatCost': retreat,
                'rarity': rarity,
                'attacks': [{'name': name, 'cost': [TYPE[t] for t in cost],
                             'damage': damage, 'text': text}
                            for name, cost, damage, text in moves]}
        if n in BATCH4_ABILITIES:
            ability = BATCH4_ABILITIES[n]
            card['abilities'] = [{'name': ability['name'],
                                  'type': 'Poké-Power' if ability.get('printedPowerType')=='power' else 'Poké-Body',
                                  'text': 'Archived printed triggered ability'}]
        if evolved:
            card['evolvesFrom'] = evolved
        if weak:
            card['weaknesses'] = [{'type': weak, 'value': weakval}]
        if resist:
            card['resistances'] = [{'type': resist, 'value': resval}]
        upstream[n - 1] = card
    return upstream


def main():
    catalog_path = ROOT / 'app/src/main/assets/tcg-classic-legends-awakened.js'
    source = catalog_path.read_text(encoding='utf-8')
    prefix = 'const CARDS=Object.freeze('
    start = source.index(prefix) + len(prefix)
    end = source.index('.map(c=>Object.freeze(c)))', start)
    fallback = json.loads(source[start:end])
    assert len(fallback) == 146

    result = build_cards(make_prints())
    assert len(result) == 146
    # This broad pattern must not approve an incorrect partial effect.
    assert simple_effect('Remove 1 damage counter from each of your Pokémon.',
                         'Bellossom')[1] is False
    assert result[19]['attacks'][0]['effect'] == {
        'type': 'heal', 'target': 'selfAll', 'amount': 10}

    for n in PRINTS:
        new, old = result[n - 1], fallback[n - 1]
        assert new['id'] == old['id'] == f'dp6-{n}'
        assert new['battleEnabled'] is True, f'generator gated verified dp6-{n}'
        assert old['battleEnabled'] is True, f'offline gated verified dp6-{n}'
        assert len(new['attacks']) == len(old['attacks']), f'dp6-{n} attack count drift'
        for i, (attack, cached) in enumerate(zip(new['attacks'], old['attacks'])):
            assert attack['name'] == cached['name'], f'dp6-{n} attack {i} name'
            assert attack['effect'] == cached['effect'], (
                f'dp6-{n} {attack["name"]} effect drift:\n'
                f'generated={attack["effect"]}\n'
                f'bundled={cached["effect"]}')
    print(f'PASS DP6 regenerated effects match all {len(PRINTS)} exact print snapshots; '
          'Bellossom heals each ally, not just itself')


if __name__ == '__main__':
    main()
