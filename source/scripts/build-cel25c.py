#!/usr/bin/env python3
"""Offline Classic Collection, with reviewed historical effect reuse and unique print keys."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/cel25c-print-compact.json'
PIN='3de4dd54bb073113773f4797d3bb13f23c311038'
SHA='8b370521dee5eaf56b79ecb29ed45d3e61d690b42daaed140978a37ea39b99af'
assert hashlib.sha256(SRC.read_bytes()).hexdigest()==SHA,'Classic Collection canonical checksum mismatch'
rows=json.loads(SRC.read_text());assert len(rows)==25 and len({r[0] for r in rows})==25
assert sum(len(r[7]) for r in rows)==31 and sum(len(r[8]) for r in rows)==13
cards=json.loads(subprocess.check_output(['node','scripts/cel25c-reprints.cjs'],cwd=ROOT,text=True))
assert len(cards)==25
out=ROOT/'app/src/main/assets/tcg-classic-celebrations-collection.js'
hdr="""/* CEL25C Classic Collection; exact print identities and reviewed historical mechanics. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGCEL25C=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'cel25c',name:'Celebrations: Classic Collection',series:'Sword & Shield',releaseDate:'2021-10-08',cardCount:25,printedTotal:25});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
"""
out.write_text(hdr.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))))
report={'printed':25,'battleReady':sum(c['battleEnabled'] for c in cards),'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},'attacks':31,'abilities':13,'sourceGitBlob':PIN}
(ROOT/'docs/CEL25C_BUILD_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
(ROOT/'docs/CEL25C_CANONICAL_SOURCE.json').write_text(json.dumps({'set':'cel25c','sourceGitBlob':PIN,'compactSha256':SHA,'printedTotal':25,'transferFNV1a32':226455872},indent=2)+'\n')
print(f'CEL25C: {report["battleReady"]}/25 playable; {len(report["gated"])} explicitly gated')
