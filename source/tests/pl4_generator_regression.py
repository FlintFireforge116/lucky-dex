#!/usr/bin/env python3
"""Guard the Arceus print serializer independent of the network-sourced archive.

The production 111-print Git-blob and exact printed-text comparison still run
separately in prepare-arceus.sh; this fixture only tests the exporter shape.
"""
import hashlib
import importlib.util
import json
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'scripts'))
spec = importlib.util.spec_from_file_location('pl4_builder_regression', root / 'scripts/build-arceus.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# Exact ability classes in the pinned authentic 111-print archive; all 30
# abilities are checked, not just the first failing printed card.
abilities = '''
1|Fire Formation|body
2|Snow Gift|power
7|Competitiveness|body
8|Top Accelerator|power
13|Unearth|power
15|Cloudy Sky|body
16|Curse|power
21|Relaxing Shower|power
25|Baby Evolution|power
26|Dowsing Code|power
28|Wild Guard|body
30|Green Breath|body
32|Keystone Seal|body
41|Hidden Poison|body
56|Cloak Evolution|body
57|Cloak Evolution|body
58|Cloak Evolution|body
89|Hard Amber|body
92|Rock Reaction|body
93|Aqua Reaction|body
94|Multi-type|body
94|Omniscient|body
95|Multitype|body
96|Multitype|body
97|Level-Down|power
98|Double Fall|power
99|Healing Growth|power
SH10|Star Barrier|body
SH11|Star Barrier|body
SH12|Star Barrier|body
'''
expected = {}
for row in abilities.strip().splitlines():
    number, name, kind = row.split('|')
    expected.setdefault(number, []).append((name, kind))

fossil_names = {'89': 'Old Amber', '92': 'Dome Fossil', '93': 'Helix Fossil'}
nums = [str(i) for i in range(1, 100)] + [f'AR{i}' for i in range(1, 10)] + [f'SH{i}' for i in range(10, 13)]
source = []
for num in nums:
    fossil = num in fossil_names
    name = fossil_names.get(num, 'Sceptile' if num == '30' else 'Arceus LV.X' if num in ('94', '95', '96') else f'Fixture {num}')
    is_level_x = num in ('94', '95', '96', '97', '98', '99')
    source.append({
        'id': f'pl4-{num}', 'number': num, 'name': name,
        'supertype': 'Trainer' if fossil else 'Pokémon',
        'subtypes': ['Item'] if fossil else ['Level-Up' if is_level_x else 'Basic'],
        'hp': None if fossil else '60',
        'types': [] if fossil else ['Colorless'],
        'attacks': [], 'rarity': 'Common',
        'abilities': [
            {'name': ability_name, 'type': 'Poké-Body' if kind == 'body' else 'Poké-Power', 'text': 'Synthetic serialization test text.'}
            for ability_name, kind in expected.get(num, [])
        ],
    })

with tempfile.TemporaryDirectory() as d:
    src = Path(d) / 'pl4-synthetic-fixture.json'
    raw = json.dumps(source, ensure_ascii=False).encode()
    src.write_bytes(raw)
    # Only override the expected hash on this private in-memory module fixture.
    # Never weaken the production pinned archive SHA.
    module.SRC = src
    module.EXPECTED_GIT_BLOB = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
    rows = module.build()
    assert len(rows) == 111
    for card in rows:
        want = expected.get(card['number'], [])
        got = [(a['name'], a['printedPowerType']) for a in card.get('abilities', [])]
        assert got == want, f"{card['id']} ability serialization: {got} != {want}"
        for ability in card.get('abilities', []):
            assert ability['disabledByStatus'] == (ability['printedPowerType'] == 'power'), card['id']
        if card['number'] in fossil_names:
            assert card['kind'] == 'trainer'
            assert card['effect']['type'] == 'playFossil'
            assert card['battleEnabled'] and card['deckEligible'], card['id']
            assert len(card['abilities']) == 1
            assert card['abilities'][0]['effect']['type'] in ('preventDamage', 'neoRule')
    print('Arceus serializer regression: 111 synthetic records, all 30 printed ability types, all 3 playable Fossils: PASS')
