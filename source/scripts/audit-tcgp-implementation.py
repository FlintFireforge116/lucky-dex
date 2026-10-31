"""Account for every initially non-FULL identity against the supplied baseline ZIP."""
import hashlib
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def catalogue(raw):
    match = re.search(r'return (\{.*\});\}\);\s*$', raw, re.S)
    assert match, 'Unknown generated catalogue wrapper'
    return json.loads(match[1])


def effect_types(value):
    if isinstance(value, list):
        return set().union(*(effect_types(x) for x in value)) if value else set()
    if not isinstance(value, dict):
        return set()
    return ({value['type']} if 'type' in value else set()) | set().union(*(effect_types(x) for x in value.values()))


def detail(c):
    return dict(cardIdentity=c['id'], name=c['name'], set=c['setId'],
                status=c['support']['status'], reasons=c['support']['reasons'],
                mechanicText=dict(attacks=[dict(name=a['name'], cost=a['cost'], damage=a['damage'], text=a.get('text', ''), mechanic=a.get('effect')) for a in c.get('attacks', [])],
                                  abilities=c.get('abilities', []), trainer=c.get('text'), ruleBoxes=c.get('ruleBoxes', [])),
                effectTypes=sorted(effect_types(c)))


def main(baseline):
    with zipfile.ZipFile(baseline) as z:
        before = catalogue(z.read('source/app/src/main/assets/tcgp/generated/catalogue.js').decode('utf-8'))
    after = catalogue((ROOT/'app/src/main/assets/tcgp/generated/catalogue.js').read_text(encoding='utf-8'))
    cards = {c['id']: c for c in after['cards']}
    prints = {p['id']: p['gameplayId'] for p in after['prints']}
    assert len(before['cards']) == len(after['cards']) == 2319
    assert {p['id'] for p in before['prints']} == set(prints)
    results = []
    for old in before['cards']:
        c = cards[prints.get(old['id'], old['id'])]
        if old['support']['status'] == 'FULL':
            assert c['support']['status'] == 'FULL', 'Previously FULL card regressed: '+old['id']
            continue
        result = detail(c)
        result.update(originalIdentity=old['id'], originalStatus=old['support']['status'],
                      originalReasons=old['support']['reasons'], finalValidationStatus=c['support']['status'],
                      prints=[p['id'] for p in after['prints'] if p['gameplayId'] == c['id']])
        types = effect_types(c)
        if c['support']['status'] != 'FULL':
            resolution = 'unresolved/human review'
        elif types & {'discardTop', 'damageFromDamage'} or 'selfAll' in json.dumps(c):
            resolution = 'new reusable mechanic'
        elif 'sequence' in types or 'coinFlip' in types:
            resolution = 'composition of existing mechanics'
        else:
            resolution = 'existing mechanic'
        result.update(resolution=resolution, structuredSourceRecovered=old['support']['status']=='UNSUPPORTED',
                      humanReviewRequired=c['support']['status']!='FULL')
        results.append(result)
    counts = lambda data: {s: sum(c['support']['status'] == s for c in data['cards']) for s in ['FULL', 'PARTIAL', 'UNSUPPORTED']}
    report = dict(baselineSha256=hashlib.sha256(baseline.read_bytes()).hexdigest(),
                  cutoff=after['cutoff'], identities=len(after['cards']), before=counts(before), after=counts(after),
                  initiallyNonFull=len(results), resolved=sum(r['finalValidationStatus']=='FULL' for r in results),
                  resolutionCounts=dict(Counter(r['resolution'] for r in results)), cards=results)
    out = ROOT/'generated/tcgp-implementation-audit-v06935.json'
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='')
    remaining = dict(cutoff=after['cutoff'], count=sum(c['support']['status']!='FULL' for c in after['cards']),
                     cards=[detail(c) for c in after['cards'] if c['support']['status']!='FULL'])
    (ROOT/'generated/tcgp-human-review-v06935.json').write_text(json.dumps(remaining, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='')
    print(json.dumps({k:v for k,v in report.items() if k!='cards'}))


if __name__ == '__main__':
    main(Path(sys.argv[1]).resolve(strict=True))
