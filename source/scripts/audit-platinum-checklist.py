#!/usr/bin/env python3
"""Audit all 133 authentic Platinum prints against the generated battle catalogue.

Checks data provenance, printed stats/attacks/abilities, gating, and effect map
presence. Does NOT pretend that every possible card interaction was simulated.
"""
import argparse
import hashlib
import importlib.util
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/classic/pl1-print-source.json'
GENERATED = ROOT / 'app/src/main/assets/tcg-classic-platinum.js'
EXPECTED_BLOB_SHA = '594032984905672db5cc37fce0e9405bebb30f45'
EXPECTED_NUMBERS = {str(n) for n in range(1, 131)} | {'SH4', 'SH5', 'SH6'}
SYMBOL = {'Grass': 'G', 'Fire': 'R', 'Water': 'W', 'Lightning': 'L', 'Psychic': 'P',
          'Fighting': 'F', 'Darkness': 'D', 'Metal': 'M', 'Colorless': 'C'}


def git_blob_sha(path):
    raw = path.read_bytes()
    return hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()


def audit():
    errors = []
    blob = git_blob_sha(SOURCE)
    if blob != EXPECTED_BLOB_SHA:
        errors.append('Official archive mismatch: expected exact original git blob ' + EXPECTED_BLOB_SHA + ', got ' + blob)
    original = json.loads(SOURCE.read_text('utf-8'))
    numbers = [str(x.get('number')) for x in original]
    if len(numbers) != 133 or set(numbers) != EXPECTED_NUMBERS or len(set(numbers)) != 133:
        errors.append('Archive must have 133 distinct collector numbers (1..130, SH4..SH6)')
    raw_js = GENERATED.read_text('utf-8')
    found = re.search(r'const CARDS=Object\.freeze\((\[[\s\S]*?\])\.map\(c=>Object\.freeze\(c\)\)\);', raw_js)
    if not found:
        errors.append('Cannot find exported generated CARDS array')
        return [], errors, blob
    generated = json.loads(found.group(1))
    lookup = {c['id']: c for c in generated}
    if len(generated) != 133 or len(lookup) != 133:
        errors.append('Generated catalogue does not contain exactly 133 unique prints')
    lines = []
    for original_card in original:
        num = str(original_card['number'])
        card = lookup.get('pl1-' + num)
        errs = []
        if not card:
            errors.append('Missing generated pl1-' + num)
            continue
        for k, actual in [('name', original_card['name']), ('setId', 'pl1'), ('number', num),
                          ('rarity', original_card.get('rarity') or '')]:
            if card.get(k) != actual:
                errs.append(k + ' mismatch')
        kind = {'Pokémon': 'pokemon', 'Trainer': 'trainer', 'Energy': 'energy'}[original_card['supertype']]
        if card.get('kind') != kind:
            errs.append('kind mismatch')
        if not card.get('battleEnabled') or not card.get('deckEligible'):
            errs.append('disabled/gated in combat or autobuilder')
        if kind == 'pokemon':
            checks = [('hp', int(original_card['hp'])), ('types', original_card.get('types') or ['Colorless']),
                      ('stage', (original_card.get('subtypes') or ['Basic'])[0]),
                      ('retreat', original_card.get('convertedRetreatCost') or 0),
                      ('evolvesFrom', original_card.get('evolvesFrom') or (original_card['name'].removesuffix(' LV.X') if 'Level-Up' in original_card.get('subtypes', []) else None)),
                      ('isPokemonSP', 'SP' in original_card.get('subtypes', []))]
            for k, actual in checks:
                if card.get(k) != actual:
                    errs.append(k + ' mismatch')
            if (card.get('weaknesses') or []) != (original_card.get('weaknesses') or []):
                errs.append('weakness mismatch')
            if (card.get('resistances') or []) != (original_card.get('resistances') or []):
                errs.append('resistance mismatch')
            original_attacks = original_card.get('attacks') or []
            compiled = card.get('attacks') or []
            if len(compiled) != len(original_attacks):
                errs.append('attack count mismatch')
            for a, b in zip(original_attacks, compiled):
                if a['name'] != b.get('name') or (a.get('text') or '') != b.get('text'):
                    errs.append('attack name/text mismatch: ' + a['name'])
                if ''.join(SYMBOL[x] for x in a.get('cost') or []) != b.get('cost'):
                    errs.append('Energy cost mismatch: ' + a['name'])
                if (a.get('damage') or '') != (b.get('damageText') or ''):
                    errs.append('printed damage mismatch: ' + a['name'])
                if not b.get('effect') or (a.get('text') and b['effect'].get('type') == 'noop'):
                    errs.append('unmapped nontrivial attack: ' + a['name'])
            original_abilities = original_card.get('abilities') or []
            compiled_abilities = card.get('abilities') or []
            if len(compiled_abilities) != len(original_abilities):
                errs.append('ability count mismatch')
            for a, b in zip(original_abilities, compiled_abilities):
                if a['name'] != b.get('name') or a['text'] != b.get('text'):
                    errs.append('ability name/text mismatch: ' + a['name'])
                if b.get('printedPowerType') != ('power' if a['type'] == 'Poké-Power' else 'body'):
                    errs.append('ability Power/Body classification mismatch: ' + a['name'])
                if not b.get('effect'):
                    errs.append('unmapped ability: ' + a['name'])
        elif kind == 'trainer':
            if card.get('text') != '\n'.join(original_card.get('rules') or []):
                errs.append('trainer printed rules mismatch')
            if not card.get('effect'):
                errs.append('unmapped Trainer')
            if num in {'119', '120'}:
                if card.get('hp') != 50 or not card.get('fossil'):
                    errs.append('playable Fossil stats mismatch')
                if [(p.get('name'), p.get('text')) for p in (card.get('abilities') or [])] != [
                    (p['name'], p['text']) for p in (original_card.get('abilities') or [])]:
                    errs.append('Fossil Stone text mismatch')
        elif kind == 'energy':
            if card.get('text') != '\n'.join(original_card.get('rules') or []):
                errs.append('Special Energy rules mismatch')
            if not card.get('specialEnergy') or not card.get('effect'):
                errs.append('unmapped Special Energy')
        if errs:
            errors.extend('pl1-' + num + ' ' + original_card['name'] + ': ' + e for e in errs)
        lines.append({'id': 'pl1-' + num, 'name': original_card['name'], 'kind': kind,
                      'attacks': len(original_card.get('attacks') or []),
                      'abilities': len(original_card.get('abilities') or []),
                      'staticCheck': 'FAIL' if errs else 'PASS', 'issues': errs})
    return lines, errors, blob


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--report', help='Write per-card Markdown checklist to this file')
    args = parser.parse_args()
    try:
        lines, errors, blob = audit()
    except (OSError, ValueError, KeyError) as err:
        print('Platinum audit could not run: ' + str(err), file=sys.stderr)
        sys.exit(1)
    if args.report:
        report = pathlib.Path(args.report)
        report.parent.mkdir(parents=True, exist_ok=True)
        content = ['# Platinum: 133-print source and static implementation checklist', '',
                   'Static verification only. **Passing does not guarantee 133 outcome-tested battles or perfect CPU decisions.**', '',
                   'Official source blob: `' + blob + '`', '',
                   '| Card | Name | Type | Attacks | Powers/Bodies | Printed metadata / mapping |',
                   '| --- | --- | --- | ---: | ---: | --- |']
        for row in lines:
            content.append('| {id} | {name} | {kind} | {attacks} | {abilities} | {staticCheck} |'.format(**row))
        content.extend(['', '## Errors', ''])
        content.extend(['- ' + e for e in errors] if errors else ['None in this static check.'])
        report.write_text('\n'.join(content) + '\n', 'utf-8')
    print('Platinum static checklist: {}/133 pass; {} issues; official source {}'.format(
        sum(x['staticCheck']=='PASS' for x in lines), len(errors), 'MATCH' if blob == EXPECTED_BLOB_SHA else 'MISMATCH'))
    for error in errors[:50]:
        print('FAIL:', error)
    return 0 if len(lines) == 133 and not errors else 1


if __name__ == '__main__':
    sys.exit(main())
