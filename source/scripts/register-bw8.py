#!/usr/bin/env python3
"""Integrate a prepared BW8 catalogue with every Classic TCG entry point.

Safe to re-run. Run after scripts/build-bw8.py.
"""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; A=ROOT/'app/src/main/assets'
def update(name, transforms):
 p=A/name;s=p.read_text(encoding='utf-8')
 for old,new in transforms:
  if new in s:continue
  if old not in s:raise RuntimeError(f'{name}: missing anchor {old[:80]}')
  s=s.replace(old,new)
 p.write_text(s,encoding='utf-8')
update('tcg-classic-battle-data.js',[
 ("  const bw7=typeof module==='object'&&module.exports?require('./tcg-classic-boundaries-crossed.js'):root.LuckyDexClassicTCGBW7;",
  "  const bw7=typeof module==='object'&&module.exports?require('./tcg-classic-boundaries-crossed.js'):root.LuckyDexClassicTCGBW7;\n  const bw8=typeof module==='object'&&module.exports?require('./tcg-classic-plasma-storm.js'):root.LuckyDexClassicTCGBW8;"),
 ('bw6,bw7,lental,sv1','bw6,bw7,bw8,lental,sv1'),
 ('...bw6.CARDS,...bw7.CARDS,...lental.CARDS','...bw6.CARDS,...bw7.CARDS,...bw8.CARDS,...lental.CARDS'),
 ('||bw6.cardById(id)||bw7.cardById(id)||lental.cardById(id)','||bw6.cardById(id)||bw7.cardById(id)||bw8.cardById(id)||lental.cardById(id)'),
 ("function bw7ProjectedCard(owned){",'''function bw8ProjectedCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const set=String(owned.setId||owned.set||owned._librarySetId||'').toLowerCase(),name=String(owned.setName||owned.expansion||'').toLowerCase(),key=String(owned.setKey||'').toLowerCase();
 if(!(['bw8','library:bw8'].includes(set)||key==='bw8'||name==='plasma storm'))return null;
 for(const id of [owned.gameplayId,owned.id,owned.cardId,owned._libraryCanonicalId]){const c=bw8.cardById(id);if(c)return c;}
 for(const raw of [owned.number,owned.localId,owned.id]){const m=String(raw??'').match(/^(?:bw8[-_:])?0*(\\d{1,3})(?:\\s*\\/\\s*(?:135|138))?$/i);if(m){const n=Number(m[1]);if(n>=1&&n<=138)return bw8.cardById('bw8-'+n);}}
 return null;
}
function bw7ProjectedCard(owned){'''),
 ('||bw7ProjectedCard(owned)||ownedLentalCard(owned)','||bw7ProjectedCard(owned)||bw8ProjectedCard(owned)||ownedLentalCard(owned)'),
 ('boundariesCrossed:bw7.coverage(),lental:','boundariesCrossed:bw7.coverage(),plasmaStorm:bw8.coverage(),lental:'),
 ('bw6.SET,bw7.SET,...lental.SETS','bw6.SET,bw7.SET,bw8.SET,...lental.SETS')
])
update('tcg-classic-set-picker.js',[("['bw7','Boundaries Crossed','Black & White'],", "['bw7','Boundaries Crossed','Black & White'],['bw8','Plasma Storm','Black & White'],")])
for fname in ('tcg-classic-deck-builder.js','tcg-classic-opponents.js'):
 update(fname,[("'bw6','bw7','SNAPFLORIO'","'bw6','bw7','bw8','SNAPFLORIO'")])
update('index.html',[("  <script src=\"tcg-classic-boundaries-crossed.js\"></script>","  <script src=\"tcg-classic-boundaries-crossed.js\"></script>\n  <script src=\"tcg-classic-plasma-storm.js\"></script>")])
print('Registered BW8 Plasma Storm in runtime, set picker, owned-card projection and deck pools')
