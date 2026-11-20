#!/usr/bin/env python3
from pathlib import Path
r=Path(__file__).resolve().parents[1];a=r/'app/src/main/assets'
def rep(file,old,new,once=True):
 p=a/file;s=p.read_text();n=s.count(old)
 assert n>0 and (not once or n==1),(file,old[:100],n)
 p.write_text(s.replace(old,new,1 if once else -1))
rep('tcg-classic-battle-data.js',"  const bw6=typeof module==='object'&&module.exports?require('./tcg-classic-dragons-exalted.js'):root.LuckyDexClassicTCGBW6;", "  const bw6=typeof module==='object'&&module.exports?require('./tcg-classic-dragons-exalted.js'):root.LuckyDexClassicTCGBW6;\n  const bw7=typeof module==='object'&&module.exports?require('./tcg-classic-boundaries-crossed.js'):root.LuckyDexClassicTCGBW7;")
rep('tcg-classic-battle-data.js','bw5,bw6,lental,sv1','bw5,bw6,bw7,lental,sv1',False)
rep('tcg-classic-battle-data.js','...bw5.CARDS,...bw6.CARDS,...lental.CARDS','...bw5.CARDS,...bw6.CARDS,...bw7.CARDS,...lental.CARDS')
rep('tcg-classic-battle-data.js','||bw5.cardById(id)||bw6.cardById(id)||lental.cardById(id)','||bw5.cardById(id)||bw6.cardById(id)||bw7.cardById(id)||lental.cardById(id)')
p=a/'tcg-classic-battle-data.js';s=p.read_text();i=s.index('function bw6ProjectedCard(owned){');part='''function bw7ProjectedCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const set=String(owned.setId||owned.set||owned._librarySetId||'').toLowerCase(),name=String(owned.setName||owned.expansion||'').toLowerCase(),key=String(owned.setKey||'').toLowerCase();
 if(!(['bw7','library:bw7'].includes(set)||key==='bw7'||name==='boundaries crossed'))return null;
 for(const id of [owned.gameplayId,owned.id,owned.cardId,owned._libraryCanonicalId]){const c=bw7.cardById(id);if(c)return c;}
 for(const raw of [owned.number,owned.localId,owned.id]){const m=String(raw??'').match(/^(?:bw7[-_:])?0*(\\d{1,3})(?:\\s*\\/\\s*(?:149|153))?$/i);if(m){const n=Number(m[1]);if(n>=1&&n<=153)return bw7.cardById('bw7-'+n);}}
 return null;
}
''';s=s[:i]+part+s[i:];s=s.replace('||bw6ProjectedCard(owned)||ownedLentalCard(owned)','||bw6ProjectedCard(owned)||bw7ProjectedCard(owned)||ownedLentalCard(owned)');s=s.replace('dragonsExalted:bw6.coverage(),lental:', 'dragonsExalted:bw6.coverage(),boundariesCrossed:bw7.coverage(),lental:');s=s.replace('bw5.SET,bw6.SET,...lental.SETS','bw5.SET,bw6.SET,bw7.SET,...lental.SETS');p.write_text(s)
rep('tcg-classic-set-picker.js',"['bw6','Dragons Exalted','Black & White'],", "['bw6','Dragons Exalted','Black & White'],['bw7','Boundaries Crossed','Black & White'],")
for f in ['tcg-classic-deck-builder.js','tcg-classic-opponents.js']:
 p=a/f;s=p.read_text();s=s.replace("'bw5','bw6','SNAPFLORIO'","'bw5','bw6','bw7','SNAPFLORIO'");s=s.replace("'bw5','bw6'].includes(allowed[0])","'bw5','bw6','bw7'].includes(allowed[0])");p.write_text(s)
rep('index.html','  <script src="tcg-classic-dragons-exalted.js"></script>','  <script src="tcg-classic-dragons-exalted.js"></script>\n  <script src="tcg-classic-boundaries-crossed.js"></script>')
print('bw7 registered')
