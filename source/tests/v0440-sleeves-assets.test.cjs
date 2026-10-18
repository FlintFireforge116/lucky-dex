'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const verifier=path.join(root,'scripts','verify-sleeves-v0440.py');
const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
const python=process.env.LUCKYDEX_PYTHON||(fs.existsSync(bundled)?bundled:process.platform==='win32'?'python':'python3');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'luckydex-sleeve-audit-'));
const fixtureCode=String.raw`
from pathlib import Path
from PIL import Image
import hashlib,json,random,sys
root=Path(sys.argv[1]); assets=root/'app/src/main/assets'; data=root/'scripts/data'; qa=root/'qa/v0440/physical'
data.mkdir(parents=True);qa.mkdir(parents=True);(assets/'cosmetics/sleeves').mkdir(parents=True)
families={'physical':(114,'Physical TCG'),'pocket':(78,'TCG Pocket'),'original':(10,'LuckyDex Original')}
registry=[];physical=[];rng=random.Random(440)
for family,(count,label) in families.items():
 rows=[]
 for i in range(count):
  sid=f'{family}-{i}'; art=f'cosmetics/sleeves/{sid}.webp';target=assets/art
  image=Image.new('RGB',(8,11));image.putdata([(rng.randrange(256),rng.randrange(256),rng.randrange(256)) for _ in range(88)])
  image.save(target,'WEBP',lossless=True); raw=target.read_bytes()
  row={'id':sid,'sourceFamily':label,'artPath':art,'themes':['fixture'],'sha256':hashlib.sha256(raw).hexdigest(),'width':8,'height':11,'bytes':len(raw)}
  if family=='physical':
   # 114 designs account for 113 distinct products plus a second design in one pack.
   row['referenceUrl']='https://www.pokemoncenter.com/en-gb/product/'+str(min(i,112))
   if i<14:row['alternateReferences']=[{'referenceUrl':'https://www.pokemoncenter.com/en-gb/product/alternate-'+str(i)}]
   physical.append(row)
  rows.append(row)
  registry.append(dict(row,sourceId=sid,rewardGroup='fixture:group'))
 (data/f'sleeves-{family}-v0440.json').write_text(json.dumps({'sleeves':rows} if family!='physical' else rows))
(data/'sleeves-legacy-v0431.json').write_text(json.dumps(registry[:30]))
(assets/'cosmetics-catalog-v0413.js').write_text('module.exports='+json.dumps({'CATALOGUE':registry})+';')
(assets/'cosmetics/sleeves/manifest-v0440.json').write_text(json.dumps({'sleeves':registry}))
products=[{'referenceUrl':'https://www.pokemoncenter.com/en-gb/product/'+str(i),'slug':'fixture-'+str(i),'excludedReason':None} for i in range(113)]
products += [{'referenceUrl':'https://www.pokemoncenter.com/en-gb/product/alternate-'+str(i),'slug':'fixture-alternate-'+str(i),'excludedReason':None} for i in range(14)]
products += [{'referenceUrl':'https://www.pokemoncenter.com/en-gb/product/playmat-'+str(i),'slug':'fixture-'+str(i)+'-playmat','excludedReason':'Playmat'} for i in range(3)]
(qa/'catalogue-enumeration.json').write_text(json.dumps({'displayedProductCount':130,'pageRanges':[[1,32],[33,64],[65,96],[97,128],[129,130]],'products':products}))
`;
const prepare=spawnSync(python,['-c',fixtureCode,fixture],{cwd:root,encoding:'utf8'});
assert.equal(prepare.status,0,prepare.stderr);
const dataPath=path.join(fixture,'scripts/data/sleeves-physical-v0440.json');
const cataloguePath=path.join(fixture,'app/src/main/assets/cosmetics-catalog-v0413.js');
const originalData=fs.readFileSync(dataPath,'utf8'),originalCatalogue=fs.readFileSync(cataloguePath,'utf8');
const run=()=>{
 const output=path.join(fixture,'audit.json');
 const result=spawnSync(python,[verifier,'--root',fixture,'--node',process.execPath,'--output',output],{cwd:root,encoding:'utf8'});
 assert.ok(fs.existsSync(output),result.stderr||result.stdout);
 return {status:result.status,report:JSON.parse(fs.readFileSync(output,'utf8'))};
};
try{
 let result=run();assert.equal(result.status,0,JSON.stringify(result.report.errors));
 assert.equal(result.report.images.decodedPaths,202);assert.equal(result.report.physicalEnumeration.sleeveProductsAccountedFor,127);
 let rows=JSON.parse(originalData);rows[0].sha256='0'.repeat(64);fs.writeFileSync(dataPath,JSON.stringify(rows));
 result=run();assert.equal(result.status,1);assert.ok(result.report.errors.some(e=>e.includes('decoded sha256')));
 fs.writeFileSync(dataPath,originalData);
 const registry=JSON.parse(originalCatalogue.slice('module.exports='.length,-1));
 registry.CATALOGUE[0].artPath='https://example.invalid/sleeve.webp';fs.writeFileSync(cataloguePath,'module.exports='+JSON.stringify(registry)+';');
 result=run();assert.equal(result.status,1);assert.ok(result.report.errors.some(e=>e.includes('unsafe or remote artPath')));
 fs.writeFileSync(cataloguePath,originalCatalogue);
 registry.CATALOGUE[0].artPath=JSON.parse(originalData)[0].artPath;registry.CATALOGUE[0].sourceId='pocket-0';
 fs.writeFileSync(cataloguePath,'module.exports='+JSON.stringify(registry)+';');
 result=run();assert.equal(result.status,1);assert.ok(result.report.sourceCoverage.physical.missing.includes('physical-0'));
 fs.writeFileSync(cataloguePath,originalCatalogue);
 const first=path.join(fixture,'app/src/main/assets/cosmetics/sleeves/physical-0.webp');
 const unused=path.join(fixture,'app/src/main/assets/cosmetics/sleeves/unused.webp');fs.copyFileSync(first,unused);
 result=run();assert.equal(result.status,1);assert.ok(result.report.images.unusedPaths.some(p=>p.endsWith('/unused.webp')));fs.unlinkSync(unused);
 const second=path.join(fixture,'app/src/main/assets/cosmetics/sleeves/physical-1.webp');
 const secondData=fs.readFileSync(second);fs.copyFileSync(first,second);
 result=run();assert.equal(result.status,1);assert.ok(result.report.images.duplicateEncodedArtwork.length);assert.ok(result.report.images.duplicateDecodedArtwork.length);
 fs.writeFileSync(second,secondData);
 assert.equal(run().status,0,'Fixture should pass again after each corruption is repaired');
 console.log('PASS sleeve asset validator: complete registry, corrupt hash, remote path, missing source design, unused file, duplicated artwork');
}finally{
 // The directory is generated solely for this test and has no user data.
 const resolvedFixture=fs.realpathSync(fixture);
 assert.equal(path.dirname(resolvedFixture),fs.realpathSync(os.tmpdir()));
 assert.ok(path.basename(resolvedFixture).startsWith('luckydex-sleeve-audit-'));
 fs.rmSync(resolvedFixture,{recursive:true,force:true});
}
