'use strict';
// BREAKpoint: independent build/release/catalogue integration checks.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const xy9=require(path.join(assets,'tcg-classic-breakpoint.js'));
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const releaseContract=require(path.join(root,'scripts/xy9_release_contract.json'));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function printedCost(cost){if(Array.isArray(cost))return cost.join('');if(typeof cost==='string')return cost;throw Error('Unexpected printed cost format');}
test('XY9 is visible in all required set, deck, opponent and asset loading paths',()=>{
 const data=read('app/src/main/assets/tcg-classic-battle-data.js');
 const html=read('app/src/main/assets/index.html');
 const scripts=read('app/build.gradle');
 const picker=read('app/src/main/assets/tcg-classic-set-picker.js');
 const builder=read('app/src/main/assets/tcg-classic-deck-builder.js');
 assert.match(data,/LuckyDexClassicTCGXY9/);
 assert.match(html,/tcg-classic-breakpoint\.js/);
 assert.match(scripts,/generateXY9ForApk/);assert.match(scripts,/auditXY9ForApk/);
 assert.match(scripts,/dependsOn tasks\.named\('generateXY9ForApk'\)/);
 assert.match(builder,/'xy9'/);
 assert.match(picker,/'xy9'/);
 assert.equal(xy9.SET.id,'xy9');assert.equal(xy9.SET.printedTotal,126);
});
test('Gradle/UI/boot versions agree and pinned XY9 source is immutable',()=>{
 const gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html');
 const boot=read('app/src/main/assets/app-v0167.js');
 const m=gradle.match(/versionName\s+["']([^"']+)["']/);assert.ok(m);
 assert.ok(html.includes('v'+m[1]));assert.ok(boot.includes(m[1]));
 const generator=read('scripts/build-xy9.py');
 assert.ok(generator.includes('dcfa9ec1b6b0ff6a0b446114c9d567c598cf71ce'));
 assert.ok(generator.includes('len(rows)!=126'));
 assert.ok(generator.includes('!=159'));
 assert.ok(generator.includes('!=14'));
});
test('Generator admits only complete mapped printed rules, preserving distinct identities',()=>{
 const {spawnSync}=require('node:child_process');
 const program=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import importlib.util
spec=importlib.util.spec_from_file_location('xy9builder',sys.argv[2]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(num,name,kind,sub,attacks=None,abilities=None):
 return [num,name,kind,sub,140 if kind=='Pokémon' else None,['Water'] if kind=='Pokémon' else [],None,attacks or [],abilities or [],None,None,1,'Rare',[],None,None]
rows=[row('18','Golduck BREAK','Pokémon',['BREAK'],[],[['Hyper Transfer','Ability','Move Energy']]),row('20','Slowbro','Pokémon',['Stage 1'],[['Walk-Off Homer',['W'],'','If you use this attack when you have only 1 Prize card left, you win this game.']]),row('100','Great Ball','Trainer',['Item']),row('113','Splash Energy','Energy',['Special'])]
cards=m.generate(rows)
print(json.dumps([{'id':c['id'],'enabled':c['battleEnabled'],'kind':c['kind']} for c in cards]))`;
 const result=spawnSync('python3',['-c',program,path.join(root,'scripts'),path.join(root,'scripts/build-xy9.py')],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const rows=JSON.parse(result.stdout);
 assert.deepEqual(rows.map(r=>r.enabled),[true,true,true,true]);
 assert.deepEqual(rows.map(r=>r.id),['xy9-18','xy9-20','xy9-100','xy9-113']);
});

test('BREAKpoint reuses predecessor inheritance and matching Spirit Links',()=>{
 const core=read('app/src/main/assets/tcgp-battle-core.js');
 const builder=read('app/src/main/assets/tcg-classic-deck-builder.js');
 for(const code of ['xy9-101','xy9-111']){assert.ok(core.includes(code));assert.ok(builder.includes(code));}
 assert.ok(core.includes('xy9-27'));assert.ok(core.includes('xy9-77'));
 assert.ok(read('scripts/build-xy9.py').includes("upgradeInheritance='previous'"));
});
const generated=fs.existsSync(path.join(root,'data/classic/xy9-print-compact.json'));
test('GitHub build MUST verify the pinned 126 prints and every enabled printed effect',{skip:!generated&&process.env.GITHUB_ACTIONS!=='true'},()=>{
 const rows=JSON.parse(read('data/classic/xy9-print-compact.json'));
 const expected=[...Array.from({length:98},(_,i)=>String(i+1)),'98a','98b',...Array.from({length:9},(_,i)=>String(i+99)),'107a',...Array.from({length:16},(_,i)=>String(i+108))];
 assert.deepEqual(rows.map(r=>String(r[0])),expected);
 assert.equal(rows.length,126);
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),159);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),14);
 assert.equal(rows.filter(r=>r[3].includes('BREAK')).length,5);
 assert.equal(xy9.CARDS.length,126,'XY9 generated catalogue missing from APK');
 assert.equal(new Set(xy9.CARDS.map(c=>c.id)).size,126);
 for(let i=0;i<rows.length;i++){
  const row=rows[i],card=xy9.CARDS[i];
  assert.equal(card.id,'xy9-'+row[0]);assert.equal(card.name,row[1]);
  assert.equal(classic.cardById(card.id),card);
  assert.deepEqual((card.attacks||[]).map(a=>printedCost(a.cost)),row[7].map(a=>a[1].join('')));
  assert.equal(card.battleEnabled,card.deckEligible);
  if(card.battleEnabled){assert.equal(card.support.status,'FULL');for(const a of card.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],card.id+' / '+a.name);
   if(card.kind==='trainer')assert.deepEqual(fx.validateEffect(card.effect),[],card.id);
  }
 }
 const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
 const synergy=require(path.join(assets,'tcg-deck-synergy.js'));
 const decks=require(path.join(assets,'tcg-classic-decks.js'));
 const owned=xy9.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [style,randomSeed] of [['competitive',3],['random',24]]){
  const result=builder.buildDeck(owned,{sets:['xy9'],style,randomSeed});
  assert.equal(result.ok,true,'XY9 auto-builder '+style+': '+(result.errors||[]).join('; '));
  assert.equal(result.cards.length,30);
  assert.equal(decks.validateDraft(result.cards,owned,{requireFull:true}).ok,true,'XY9 deck legality '+style);
  assert.deepEqual(decks.analyzeDeck(result.cards,result.energyTypes).missingEnergyTypes,[],'XY9 Energy compatibility '+style);
  assert.deepEqual(synergy.report(result.cards.map(classic.cardById),result.energyTypes,'any').dead,[],'XY9 Trainer synergy '+style);
 }
 assert.equal(xy9.coverage().battleEnabled,releaseContract.expectedPlayable,'XY9 release coverage disagrees with the centralized contract');
 assert.deepEqual(xy9.coverage().gated.slice().sort(),releaseContract.expectedGated.map(id=>'xy9-'+id).sort(),'XY9 release gated identities disagree with the centralized contract');
 for(const id of releaseContract.stage1BreakPlayable)assert.equal(xy9.cardById('xy9-'+id).battleEnabled,true,'Shared BREAK inheritance failed for '+id);
 for(const id of releaseContract.expectedGated)assert.equal(xy9.cardById('xy9-'+id).battleEnabled,false,'Unfinished printed effect must stay gated: '+id);
});
