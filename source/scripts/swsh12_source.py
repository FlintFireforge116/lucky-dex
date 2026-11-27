#!/usr/bin/env python3
"""Silver Tempest pinned source packets for the gameplay generator.

Compact rows transferred from the pinned PokemonTCG upstream commit via
GitHub. The upstream blob ID and FNV-1a packet checksums were captured before
local transfer; check each packet before using it to generate card definitions.
"""
import json
from pathlib import Path

PIN = 'a57779d463a4f8ddf2bc21ad4ae66e9f4c3eaac2'
PINNED_COMMIT = '90f27d0e14cefe48ccb2b8922a7a356b2fcf0072'
PRINTED_TOTAL = 215
ATTACK_PRINTS = 280
ABILITY_PRINTS = 38
TRAINER_PRINTS = 35
ENERGY_PRINTS = 3
PACKETS = (
    ('swsh12-stage1-pokemon-a.jsonl', 3834687902),
    ('swsh12-stage1-pokemon-b.jsonl', 3868267172),
    ('swsh12-stage1-support.jsonl', 2770570990),
    ('swsh12-stage3-pokemon-c.jsonl', 4004781684),
)

def rows():
    root = Path(__file__).resolve().parents[1] / 'data/classic'
    result = []
    for filename, expected in PACKETS:
        data = (root / filename).read_bytes()
        h = 2166136261
        for b in data:
            h = ((h ^ b) * 16777619) & 0xffffffff
        if h != expected:
            raise ValueError('Silver Tempest source transfer checksum mismatch: ' + filename)
        result.extend(json.loads(line) for line in data.splitlines())
    numbers = [int(r[0]) for r in result]
    expected_ids = set(range(1, 96)) | set(range(151, 170)) | set(range(188, 196)) | set(range(203, 210)) | set(range(212, 216))
    if len(numbers) != 133 or set(numbers) != expected_ids:
        raise ValueError('Silver Tempest staged print ID inventory mismatch')
    if sum(r[2] == 'Trainer' for r in result) != TRAINER_PRINTS or sum(r[2] == 'Energy' for r in result) != ENERGY_PRINTS:
        raise ValueError('Silver Tempest staged support print inventory mismatch')
    if any(len(r) != 16 for r in result):
        raise ValueError('Silver Tempest invalid compact row shape')
    return sorted(result, key=lambda r: int(r[0]))

if __name__ == '__main__':
    print(f'Silver Tempest: {len(rows())}/{PRINTED_TOTAL} source prints prepared; packet checksums PASS.')
