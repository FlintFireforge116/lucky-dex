from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
a=root/'app/src/main/assets'
def patch(name,needle,repl,once=True):
 p=a/name;s=p.read_text();n=s.count(needle)
 if (once and n!=1) or not n:raise AssertionError((name,needle[:95],n))
 p.write_text(s.replace(needle,repl,1 if once else -1))
p='tcg-classic-battle-data.js'
patch(p,"  const bw4=typeof module==='object'&&module.exports?require('./tcg-classic-next-destinies.js'):root.LuckyDexClassicTCGBW4;", "  const bw4=typeof module==='object'&&module.exports?require('./tcg-classic-next-destinies.js'):root.LuckyDexClassicTCGBW4;\n  const bw5=typeof module==='object'&&module.exports?require('./tcg-classic-dark-explorers.js'):root.LuckyDexClassicTCGBW5;")
patch(p,'bw3,bw4,lental,sv1','bw3,bw4,bw5,lental,sv1',False)
patch(p,'...bw3.CARDS,...bw4.CARDS,...lental.CARDS','...bw3.CARDS,...bw4.CARDS,...bw5.CARDS,...lental.CARDS')
patch(p,'||bw3.cardById(id)||bw4.cardById(id)||lental.cardById(id)', '||bw3.cardById(id)||bw4.cardById(id)||bw5.cardById(id)||lental.cardById(id)')
# distinguish collection prints and duplicate full art by printed ID
p1=a/p;s=p1.read_text();anchor='function bw4ProjectedCard(owned){';assert s.count(anchor)==1
index=s.index(anchor)
part='''function bw5ProjectedCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const set=String(owned.setId||owned.set||owned._librarySetId||'').toLowerCase(),name=String(owned.setName||owned.expansion||'').toLowerCase(),key=String(owned.setKey||'').toLowerCase();
 if(!(['bw5','library:bw5'].includes(set)||key==='bw5'||name==='dark explorers'))return null;
 for(const id of [owned.gameplayId,owned.id,owned.cardId,owned._libraryCanonicalId]){const c=bw5.cardById(id);if(c)return c;}
 for(const raw of [owned.number,owned.localId,owned.id]){const m=String(raw??'').match(/^(?:bw5[-_:])?0*(\\d{1,3})(?:\\s*\\/\\s*(?:108|111))?$/i);if(m){const n=Number(m[1]);if(n>=1&&n<=111)return bw5.cardById('bw5-'+n);}}
 return null;
}
'''
s=s[:index]+part+s[index:]
s=s.replace('||bw4ProjectedCard(owned)||ownedLentalCard(owned)','||bw4ProjectedCard(owned)||bw5ProjectedCard(owned)||ownedLentalCard(owned)')
s=s.replace('nextDestinies:bw4.coverage(),lental:','nextDestinies:bw4.coverage(),darkExplorers:bw5.coverage(),lental:')
s=s.replace('bw3.SET,bw4.SET,...lental.SETS','bw3.SET,bw4.SET,bw5.SET,...lental.SETS')
p1.write_text(s)
patch('tcg-classic-set-picker.js',"['bw4','Next Destinies','Black & White'],", "['bw4','Next Destinies','Black & White'],['bw5','Dark Explorers','Black & White'],")
for name in ['tcg-classic-opponents.js','tcg-classic-deck-builder.js']:
 p=a/name;s=p.read_text()
 for old,new in [("'bw3','bw4','SNAPFLORIO'","'bw3','bw4','bw5','SNAPFLORIO'"),("'bw3','bw4'].includes(allowed[0])","'bw3','bw4','bw5'].includes(allowed[0])")]:s=s.replace(old,new)
 # small search for other list arrays need explicit
 p.write_text(s)
patch('index.html','  <script src="tcg-classic-next-destinies.js"></script>', '  <script src="tcg-classic-next-destinies.js"></script>\n  <script src="tcg-classic-dark-explorers.js"></script>')
p=a/'app-v0167.js';s=p.read_text().replace("window.__LUCKYDEX_BUILD='0.69.305'","window.__LUCKYDEX_BUILD='0.69.306'");p.write_text(s)
p=a/'index.html';s=p.read_text().replace('v0.69.305','v0.69.306');p.write_text(s)
p=root/'app/build.gradle';s=p.read_text().replace("versionName '0.69.305'","versionName '0.69.306'");s=re.sub(r'(versionCode\s+)\d+',r'\g<1>7306',s,count=1);p.write_text(s)
print('BW5 set registration complete')
