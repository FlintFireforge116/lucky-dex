'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const set=require(path.join(assets,'tcg-classic-ancient-origins.js'));
const picker=require(path.join(assets,'tcg-classic-set-picker.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const generated=fs.existsSync(path.join(root,'data/classic/xy7-print-compact.json'));
const numbers=[...Array.from({length:75},(_,i)=>String(i+1)),'75a',...Array.from({length:25},(_,i)=>String(i+76))];

test('Ancient Origins registry, player/CPU deck sets and browser load order',()=>{
 assert.equal(set.SET.id,'xy7');assert.equal(set.SET.cardCount,100);assert.equal(set.SET.printedTotal,101);
 assert.equal(picker.names.xy7,'Ancient Origins');assert.ok(data.SETS.some(s=>s.id==='xy7'));
 assert.ok(builder.SET_IDS.includes('xy7'));assert.ok(cpu.SETS.includes('xy7'));
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 assert.match(html,/<script src="tcg-classic-ancient-origins\.js"><\/script>/);
 assert.ok(html.indexOf('tcg-classic-ancient-origins.js')<html.indexOf('tcg-classic-battle-data.js'));
});

test('XY7 source is pinned and generated before Android mergeAssets',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8'),
  version=gradle.match(/versionName '([^']+)'/)?.[1],code=Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
 assert.match(version,/^0\.69\.\d+$/);assert.equal(code,7000+Number(version.split('.')[2]));
 assert.match(gradle,/tasks\.register\('generateXY7ForApk'/);
 assert.match(gradle,/tasks\.register\('auditXY7ForApk'/);
 assert.match(gradle,/dependsOn tasks\.named\('auditXY7ForApk'\)/);
 assert.match(gradle,/dependsOn tasks\.named\('auditXY6IndependentForApk'\)/);
 const generator=fs.readFileSync(path.join(root,'scripts/build-xy7.py'),'utf8');
 assert.match(generator,/load_pinned_set\('xy7'/);
 assert.match(generator,/4c7169ef5ef7e30f38fb074b2ee2b4009581fab4/);
 assert.match(generator,/len\(rows\)!=101/);assert.match(generator,/!=130/);assert.match(generator,/!=14/);assert.match(generator,/!=15/);
 assert.match(generator,/tcg-classic-ancient-origins\.js/);
 assert.ok(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8').includes(`window.__LUCKYDEX_BUILD='${version}'`));
});

test('Every Stage 1 mapped descriptor is accepted by the shared effect validator',()=>{
 const script=String.raw`
import json,sys
sys.path.insert(0,sys.argv[1]);import xy7_verified as V
print(json.dumps([[k,v] for k,v in V.ATTACKS.items()]+[['Trainer '+k,v[1]] for k,v in V.TRAINERS.items()]))`;
 const r=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
 const mapped=JSON.parse(r.stdout);assert.ok(mapped.length>=70);
 for(const [key,effect] of mapped)assert.deepEqual(effects.validateEffect(effect),[],JSON.stringify(key));
});

test('Print-specific generator preserves EX rarity, costs and still gates unmapped Abilities and Special Energy effects',()=>{
 const script=String.raw`
import importlib.util,json,sys
p=sys.argv[1];sys.path.insert(0,p)
spec=importlib.util.spec_from_file_location('buildxy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(n,name,at=None,abl=None,trait=None,typ='Pokémon',sub=None,rules=None):
 return [str(n),name,typ,sub or (['Basic'] if typ=='Pokémon' else ['Item']),140,['Psychic'] if typ=='Pokémon' else [],None,at or [],abl or [],'Darkness',None,1,'Rare',rules or [],None,trait]
r=[
 row(1,'Oddish',[['Trip Over',['C'],'10+','Flip a coin. If heads, this attack does 10 more damage.']]),
 row(7,'Sceptile-EX',[['Sleep Poison',['G'],'10',"Flip a coin. If heads, your opponent's Active Pokémon is now Asleep and Poisoned."],['Unseen Claw',['G','C','C'],'60+','If your opponent\'s Active Pokémon is affected by a Special Condition, this attack does 70 more damage.']],sub=['Basic','EX']),
 row(8,'M Sceptile-EX',[['Jagged Saber',['G','G','C'],'100','You may attach up to 2 Grass Energy cards from your hand to your Benched Pokémon in any way you like. If you attached Energy to a Pokémon in this way, heal all damage from that Pokémon.']],trait={'name':'θ Stop','text':'Immune to opposing Abilities'},sub=['MEGA','EX']),
 row(28,'M Ampharos-EX',[['Exavolt',['L','L','C','C'],'120+','You may do 50 more damage and leave your opponent\'s Active Pokémon Paralyzed. If you do, this Pokémon does 30 damage to itself.']],sub=['MEGA','EX']),
 row(30,'Unown',[['Hidden Power',['P'],'10','']],[['Farewell Letter','Ability','Bench discard to draw 1']]),
 row(43,'M Tyranitar-EX',[['Destroyer King',['D','D','C','C'],'110+','This attack does 60 more damage for each damage counter on your opponent\'s Active Pokémon.']],trait={'name':'θ Double','text':'Two Tools'},sub=['MEGA','EX']),
 row(70,'Ampharos Spirit Link',typ='Trainer',sub=['Pokémon Tool']),
 row(75,'Hex Maniac',typ='Trainer',sub=['Supporter']),
 row('75a','Hex Maniac',typ='Trainer',sub=['Supporter']),
 row(78,'Lysandre',typ='Trainer',sub=['Supporter']),
 row(82,'Dangerous Energy',typ='Energy',sub=['Special']),
 row(83,'Flash Energy',typ='Energy',sub=['Special']),
 row(84,'Sceptile-EX',[['Sleep Poison',['G'],'10',"Flip a coin. If heads, your opponent's Active Pokémon is now Asleep and Poisoned."],['Unseen Claw',['G','C','C'],'60+','If your opponent\'s Active Pokémon is affected by a Special Condition, this attack does 70 more damage.']],sub=['Basic','EX']),
 row(96,'Primal Kyogre-EX',[['Tidal Storm',['W','W','W','C'],'150','Move 2 Energy from this Pokémon to 1 of your Benched Pokémon.']],trait={'name':'θ Max','text':'Heal all on evolution'},sub=['MEGA','EX']),
 row(100,"Trainers' Mail",typ='Trainer',sub=['Item']),
]
print(json.dumps(m.generate(r)))`;
 const r=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:4*1024*1024});
 assert.equal(r.status,0,r.stderr||r.stdout);
 const cards=Object.fromEntries(JSON.parse(r.stdout).map(c=>[c.id,c]));
 for(const n of ['1','7','28','70','78','84','100'])assert.equal(cards['xy7-'+n].battleEnabled,true,'expected battle enabled xy7-'+n+': '+cards['xy7-'+n].support.reasons);
 assert.equal(cards['xy7-8'].battleEnabled,true,'Mega Sceptile Jagged Saber has its own audited Stage 5 handler');
 for(const n of ['75','75a','82','83'])assert.equal(cards['xy7-'+n].battleEnabled,true,'Stage 4 audited print '+n);
 for(const n of ['43','96'])assert.equal(cards['xy7-'+n].battleEnabled,true,'audited θ trait '+n);
 assert.equal(cards['xy7-7'].prizeCards,2);
 assert.deepEqual(cards['xy7-7'].attacks[1].cost,['G','C','C']);
 assert.equal(cards['xy7-28'].megaEvolution,true);
 assert.equal(cards['xy7-75a'].id,'xy7-75a');
 assert.equal(cards['xy7-83'].deckEligible,true);
 for(const c of Object.values(cards).filter(x=>x.battleEnabled)){
  for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+' '+a.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
 }
});

test('Autobuilder never adds unmatched Ancient Origins Spirit Links',()=>{
 const s=fs.readFileSync(path.join(assets,'tcg-classic-deck-builder.js'),'utf8');
 for(const pair of [['xy7-70','xy7-28'],['xy7-80','xy7-8'],['xy7-81','xy7-43']]){
  assert.ok(s.includes(`'${pair[0]}'`),pair.join(':'));
  assert.ok(s.includes(`'${pair[1]}'`),pair.join(':'));
 }
 const core=fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
 for(const id of ['xy7-28','xy7-70','xy7-80','xy7-81'])assert.ok(core.includes(id),'core Spirit Link '+id);
});

test('Full official Ancient Origins catalogue, costs, choices and all 101 printed identities',{skip:!generated},()=>{
 const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy7-print-compact.json'),'utf8'));
 assert.deepEqual(rows.map(r=>String(r[0])),numbers);
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),130);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),14);
 assert.equal(rows.filter(r=>r[15]).length,15);
 assert.equal(set.CARDS.length,101,'APK cannot package build-time placeholder');
 assert.equal(new Set(set.CARDS.map(c=>c.id)).size,101);
 for(let i=0;i<rows.length;i++){
  const r=rows[i],c=set.CARDS[i];
  assert.equal(c.id,'xy7-'+r[0]);assert.equal(c.name,r[1]);
  assert.deepEqual((c.attacks||[]).map(a=>Array.isArray(a.cost)?a.cost.join(''):a.cost),r[7].map(a=>a[1].join('')));
  assert.equal(data.cardById(c.id),c);
  assert.equal(c.deckEligible,c.battleEnabled);
  if(c.battleEnabled){
   for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+' '+a.name);
   if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
  }
 }
 assert.ok(set.coverage().battleEnabled>=30,'Stage 1 should have a substantial playable starting set');
 for(const n of ['67'])
  assert.equal(set.cardById('xy7-'+n).battleEnabled,false,'incomplete non-trait printed mechanic '+n);
 for(const n of ['11','15','18','32','43','50','92','96','97','98'])
  assert.equal(set.cardById('xy7-'+n).battleEnabled,true,'audited theta Trait '+n);
});

test('Collection projection keeps Hex Maniac 75a as a distinct print',{skip:!generated},()=>{
 const projected=data.projectOwnedCards([{setId:'xy7',number:'75',quantity:1},{setId:'xy7',number:'75a',quantity:1}]);
 assert.ok(projected.some(c=>c.gameplayId==='xy7-75'));
 assert.ok(projected.some(c=>c.gameplayId==='xy7-75a'));
});
