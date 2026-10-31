"""Offline import of exact missing prints from one pinned MIT source archive.

Download the immutable archive URL in data/tcgp/import/vociferix-provenance.json,
then pass its local path. Reviewed TCGdex records are never replaced.
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'data/tcgp/import'
REVISION = '2ab3fbb5c606dc6a5ca7fbb8e190c2a051505f69'
SHA256 = '22e894079516360ff97b15bc4839b351a105d8446985e9a8ed70919cca1e65fd'


def load(name):
    return json.loads((DEST / name).read_text(encoding='utf-8'))


def pid(v):
    return v['set'] + '-' + str(v['number']).zfill(3)


def adapt(c, identity, source_path, digest):
    result = dict(id=identity, setId=identity.rsplit('-', 1)[0], name=c['name'],
                  category='Pokemon' if c['card_type'] == 'pokemon' else 'Trainer',
                  sourcePath=source_path, sourceSha256=digest, sourceAbstractId=c['id'])
    text = lambda s: re.sub(r'\[([GRWLPFDMC])\]', r'{\1}', s or '')
    if c['card_type'] == 'pokemon':
        result.update(hp=c['hp'], types=[c['element']], stage=c['stage'].replace(' ', ''),
                      retreat=c['retreat_cost'], attacks=[dict(name=a['name'], cost=a['cost'],
                      damage=str(a['damage']) + a.get('damage_suffix', ''),
                      **({'effect': text(a['effect'])} if a.get('effect') else {})) for a in c['attacks']],
                      weaknesses=[dict(type=c['weakness'], value='+20')] if c.get('weakness') else [])
        if c.get('evolves_from'):
            result['evolveFrom'] = c['evolves_from']
        if c.get('is_ex'):
            result['suffix'] = 'EX'
        if c.get('ability'):
            result['abilities'] = [dict(name=c['ability']['name'], effect=text(c['ability']['effect']))]
    else:
        result.update(trainerType=c['trainer_kind'], effect=text(c['trainer_effect']))
    return result


def main(archive):
    assert hashlib.sha256(archive.read_bytes()).hexdigest() == SHA256, 'Pinned archive hash mismatch'
    evidence = load('identity-evidence.json')['prints']
    cutoff = load('cutoff.json')
    known = load('tcgdex-pocket-cards.json') + load('tcgdex-A4b-cards.json')
    known_keys = {evidence[c['id']] for c in known if c['id'] in evidence}
    missing_keys = set(evidence.values()) - known_keys
    sets = {s['id'] for s in cutoff['sets'] if s['releaseDate'] <= cutoff['cutoff']}
    excluded = set(cutoff['excludedPrintIds'])
    result, seen, matched = [], set(), set()
    with zipfile.ZipFile(archive) as z:
        prefix = z.namelist()[0].split('/')[0] + '/'
        assert {s['code']: s['card_count'] for s in json.loads(z.read(prefix+'data/sets.json'))} == {s['id']: s['printCount'] for s in cutoff['sets']}
        for path in sorted(z.namelist()):
            if not path.startswith(prefix+'data/cards/') or not path.endswith('.json'):
                continue
            raw = z.read(path)
            c = json.loads(raw)
            keys = {evidence.get(pid(v)) for v in c['versions']}
            assert len(keys) == 1 and None not in keys, 'Conflicting source design identity'
            for v in c['versions']:
                identity = pid(v)
                assert identity not in seen
                seen.add(identity)
                version = json.loads(z.read(prefix+'data/card_versions/'+v['set']+'/'+str(v['number']).zfill(3)+'.json'))
                assert version['card_id'] == c['id'] and pid(version) == identity
                if v['set'] in sets and identity not in excluded and evidence[identity] in missing_keys:
                    result.append(adapt(c, identity, path[len(prefix):], hashlib.sha256(raw).hexdigest()))
                    matched.add(evidence[identity])
        assert len(seen) == cutoff['knownPrintCount'] and matched == missing_keys
        assert len(result) == 1140 and len(matched) == 631
        (DEST/'Vociferix-LICENSE-MIT.txt').write_bytes(z.read(prefix+'LICENSE'))
    # LF output is deterministic on every host; comparison never relies on names.
    with (DEST/'vociferix-missing-mechanics.json').open('w', encoding='utf-8', newline='') as out:
        out.write(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(dict(revision=REVISION, matchedDesigns=len(matched), detailedPrints=len(result))))


if __name__ == '__main__':
    main(Path(sys.argv[1]).resolve(strict=True))
