'use strict';
// Fates Collide: independent immutable-source and release-order checks.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const xy10=require('../app/src/main/assets/tcg-classic-fates-collide.js');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const contract=require('../scripts/xy10_release_contract.json');
function cost(c){if(Array.isArray(c))return c.join('');if(typeof c==='string')return c;throw new Error('Bad attack cost shape');}
test('XY10 is loaded and selectable in all five player/CPU/deck paths',()=>{
 const data=read('app/src/main/assets/tcg-classic-battle-data.js');
 const html=read('app/src/main/assets/index.html');
 const builder=read('app/src/main/assets/tcg-classic-deck-builder.js');
 const opponents=read('app/src/main/assets/tcg-classic-opponents.js');
 const picker=read('app/src/main/assets/tcg-classic-set-picker.js');
 const gradle=read('app/build.gradle');
 assert.match(data,/LuckyDexClassicTCGXY10/);assert.match(data,/\.\.\.xy10.CARDS/);
 assert.match(data,/xy10\.cardById/);assert.match(data,/xy10\.SET/);
 assert.match(html,/tcg-classic-fates-collide\.js/);
 for(const s of [builder,opponents,picker])assert.match(s,/'xy10'/);
 for(const task of ['preflightXY10ContractForApk','generateXY10ForApk','auditXY10ForApk'])assert.ok(gradle.includes(task));
 assert.match(gradle,/dependsOn tasks\.named\('auditXY9ForApk'\)/);
 assert.equal(xy10.SET.id,'xy10');assert.equal(xy10.SET.printedTotal,129);
});
test('XY10 version is consistent with versionCode, title, boot and release contract',()=>{
 const gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html');
 const boot=read('app/src/main/assets/app-v0167.js');
 const name=gradle.match(/versionName ['"]([^'"]+)['"]/)[1];
 const code=Number(gradle.match(/versionCode (\d+)/)[1]);
 assert.equal(code,7000+Number(name.split('.').at(-1)));
 assert.equal(contract.release,name);assert.ok(html.includes(`id="titleBuildVersion">v${name}`));
 assert.ok(html.includes(`LUCKY DEX · v${name}`));assert.ok(boot.includes(`window.__LUCKYDEX_BUILD='${name}'`));
 assert.ok(read('scripts/build-xy10.py').includes('aa097c8da85e960a5afa4f3b96312f64dcbec871'));
});
test('XY10 generated official prints are never silently replaced with noops',()=>{
 const script=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import importlib.util
sp=importlib.util.spec_from_file_location('build_xy10',sys.argv[2]);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def row(n,name,kind,sub,atks=None,abilities=None,ancient=None):return [n,name,kind,sub,130 if kind=='Pokémon' else None,['Psychic'] if kind=='Pokémon' else [],None,atks or [],abilities or [],None,None,1,'Rare',[],None,ancient]
rs=[row('5','Snivy','Pokémon',['Basic'],[['Blot',['G'],'10','Heal 10 damage from this Pokémon.']]),row('14','Delphox BREAK','Pokémon',['BREAK'],[],[['Flare Witch','Ability','Search and attach a Fire Energy']]),row('90','Alakazam Spirit Link','Trainer',['Pokémon Tool']),row('114','Double Colorless Energy','Energy',['Special']),row('17','Omanyte','Pokémon',['Restored'],[['Water Gun',['W'],'30','']])]
cs=m.generate(rs)
print(json.dumps([{'id':c['id'],'enabled':c['battleEnabled'],'reasons':c['support']['reasons'],'kind':c['kind'],'evolution':c.get('upgradeInheritance')} for c in cs]))`;
 const res=spawnSync('python3',['-c',script,path.join(root,'scripts'),path.join(root,'scripts/build-xy10.py')],{encoding:'utf8'});
 assert.equal(res.status,0,res.stderr);
 const out=JSON.parse(res.stdout);
 assert.deepEqual(out.map(x=>x.id),['xy10-5','xy10-14','xy10-90','xy10-114','xy10-17']);
 assert.deepEqual(out.map(x=>x.enabled),[true,false,true,true,false]);
 assert.equal(out[1].evolution,'previous');
 assert.match(out[1].reasons.join(' '),/Flare Witch/);
 assert.match(out[4].reasons.join(' '),/Restored/);
});
const generated=fs.existsSync(path.join(root,'data/classic/xy10-print-compact.json'));
test('Pinned Fates Collide official 129-print catalogue and constructed CPU/player decks', {skip:!generated&&process.env.GITHUB_ACTIONS!=='true'},()=>{
 const rows=JSON.parse(read('data/classic/xy10-print-compact.json'));
 const numbers=[...Array.from({length:43},(_,i)=>String(i+1)),'43a',...Array.from({length:11},(_,i)=>String(i+44)),'54a',...Array.from({length:51},(_,i)=>String(i+55)),'105a',...Array.from({length:6},(_,i)=>String(i+106)),'111a',...Array.from({length:14},(_,i)=>String(i+112))];
 assert.equal(numbers.length,129);assert.deepEqual(rows.map(r=>String(r[0])),numbers);
 assert.equal(rows.reduce((s,r)=>s+r[7].length,0),147);assert.equal(rows.reduce((s,r)=>s+r[8].length,0),21);
 assert.equal(rows.filter(r=>r[3].includes('BREAK')).length,5);
 assert.equal(xy10.CARDS.length,129,'Pinned source generator never populated XY10');
 assert.equal(new Set(xy10.CARDS.map(c=>c.id)).size,129);
 for(let i=0;i<rows.length;i++){
  const row=rows[i],card=xy10.CARDS[i];assert.equal(card.id,'xy10-'+row[0]);assert.equal(card.name,row[1]);
  assert.equal(classic.cardById(card.id),card);assert.equal(card.battleEnabled,card.deckEligible);
  assert.deepEqual(card.attacks.map(x=>cost(x.cost)),row[7].map(x=>x[1].join('')));
  for(const a of card.attacks)if(card.battleEnabled)assert.deepEqual(fx.validateEffect(a.effect),[],card.id+'/'+a.name);
  if(card.battleEnabled){assert.equal(card.support.status,'FULL');if(card.kind==='trainer')assert.deepEqual(fx.validateEffect(card.effect),[],card.id);}
  else assert.ok(card.support.reasons.length,card.id+' gated without a reason');
 }
 assert.ok(xy10.coverage().battleEnabled>=contract.expectedPlayableMinimum,'Unexpected drop in verified print coverage');
 for(const n of contract.requiredEnabledNumbers){const card=xy10.cardById('xy10-'+n);assert.ok(card?.battleEnabled,`Verified printed effect unexpectedly gated for xy10-${n}: ${(card?.support?.reasons||[]).join('; ')}`);}
 assert.equal(xy10.coverage().battleEnabled+xy10.coverage().gated.length,129);
 const build=require('../app/src/main/assets/tcg-classic-deck-builder.js'),decks=require('../app/src/main/assets/tcg-classic-decks.js');
 const owned=xy10.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [style,randomSeed] of [['competitive',3],['random',24]]){
  const result=build.buildDeck(owned,{sets:['xy10'],style,randomSeed});
  assert.equal(result.ok,true,'Fates Collide '+style+' deck: '+(result.errors||[]).join('; '));
  assert.equal(result.cards.length,30);assert.equal(decks.validateDraft(result.cards,owned,{requireFull:true}).ok,true);
  assert.deepEqual(decks.analyzeDeck(result.cards,result.energyTypes).missingEnergyTypes,[]);
 }
});
