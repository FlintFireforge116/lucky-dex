'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const picker=require(path.join(assets,'tcg-classic-set-picker.js'));
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const xy8=require(path.join(assets,'tcg-classic-breakthrough.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const generated=fs.existsSync(path.join(root,'data/classic/xy8-print-compact.json'));
function runPy(src){const r=spawnSync('python3',['-c',src,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:10*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
test('XY8 registration: human, CPU, deck editor, collection and script order',()=>{
 assert.equal(xy8.SET.id,'xy8');assert.equal(xy8.SET.name,'BREAKthrough');
 assert.equal(xy8.SET.printedTotal,165);assert.equal(picker.names.xy8,'BREAKthrough');
 assert.ok(classic.SETS.some(s=>s.id==='xy8'));assert.ok(cpu.SETS.includes('xy8'));assert.ok(builder.SET_IDS.includes('xy8'));
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 assert.ok(html.indexOf('tcg-classic-breakthrough.js')>html.indexOf('tcg-classic-ancient-origins.js'));
 assert.ok(html.indexOf('tcg-classic-breakthrough.js')<html.indexOf('tcg-classic-battle-data.js'));
});
test('Pinned XY8 generator and mandatory Gradle audit, source rules documented',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.match(gradle,/versionCode 7374/);assert.match(gradle,/versionName '0\.69\.374'/);
 assert.match(gradle,/tasks\.register\('generateXY8ForApk'/);
 assert.match(gradle,/tasks\.register\('auditXY8ForApk'/);
 assert.match(gradle,/dependsOn tasks\.named\('auditXY8ForApk'\)/);
 const py=fs.readFileSync(path.join(root,'scripts/build-xy8.py'),'utf8');
 assert.match(py,/load_pinned_set\('xy8'/);assert.match(py,/951db4c259e70ca2fbd4daa2705e797af19fa25c/);
 assert.match(py,/len\(rows\)!=165/);assert.match(py,/!=220/);assert.match(py,/!=19/);
 const master=fs.readFileSync(path.join(root,'docs/LUCKYDEX_MASTER_RULES.txt'),'utf8');
 assert.match(master,/MECHANIC-FIRST SET DELIVERY CONTRACT/);
 assert.match(master,/Do NOT enable a\s+card with unsupported printed effects/);
 assert.ok(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8').includes("window.__LUCKYDEX_BUILD='0.69.374'"));
});
test('All mapped attacks, Trainers and abilities validate via existing battle effect contract',()=>{
 const mapped=runPy(String.raw`import json,sys;sys.path.insert(0,sys.argv[1]);import xy8_verified as v
print(json.dumps([[str(k),e] for k,e in v.ATTACKS.items()]+[[k,e[1]] for k,e in v.TRAINERS.items()]+[[k,e['effect']] for k,e in v.ABILITIES.items()]))`);
 assert.ok(mapped.length>110);
 for(const [k,e] of mapped)assert.deepEqual(effects.validateEffect(e),[],k);
});
test('No silent noop for unmapped printed attacks, unhandled Abilities, BREAK or Energy',()=>{
 const cards=runPy(String.raw`import json,sys,importlib.util
p=sys.argv[1];sys.path.insert(0,p);spec=importlib.util.spec_from_file_location('xy8',p+'/build-xy8.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(n,name,typ='Pokémon',sub=None,att=None,abs=None):return[str(n),name,typ,sub or (['Basic'] if typ=='Pokémon' else ['Item']),100,['Grass'],None,att or [],abs or [],None,None,1,'Common',[],None,None]
rows=[row('1','Paras',att=[['Blot',['G'],'10','Heal 10 damage from this Pokémon.']]),row('2','Parasect',sub=['Stage 1'],att=[['Colorful Spores',['G'],'','Search your deck for three types of energy and attach them to different Pokémon.']]),row('12','Chesnaught BREAK',sub=['BREAK'],att=[['Tough Hammer',['G'],'120','This Pokémon does 30 damage to itself.']]),row('33','Octillery',sub=['Stage 1'],att=[['Hug',['C'],'30','The Defending Pokémon can\'t retreat during your opponent\'s next turn.']],abs=[['Abyssal Hand','Ability','Once per turn draw until 5']]),row('151','Burning Energy',typ='Energy',sub=['Special']),row('145','Parallel City',typ='Trainer',sub=['Stadium'])]
print(json.dumps(m.generate(rows)))`);
 const by=Object.fromEntries(cards.map(c=>[c.id,c]));
 assert.equal(by['xy8-1'].battleEnabled,true);
 for(const id of ['xy8-2','xy8-12','xy8-151','xy8-145']){assert.equal(by[id].battleEnabled,false,id);assert.equal(by[id].deckEligible,false,id);assert.ok(by[id].support.reasons.length,id)}
 assert.equal(by['xy8-12'].breakEvolution,true);
 assert.equal(by['xy8-33'].abilities[0].name,'Abyssal Hand');
 assert.deepEqual(effects.validateEffect(by['xy8-33'].abilities[0].effect),[]);
});
test('Pinned XY8 runtime retains complete official catalogue and no fake enabled descriptors',{skip:!generated},()=>{
 const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy8-print-compact.json'),'utf8'));
 const ids=[...Array.from({length:146},(_,i)=>String(i+1)),'146a',...Array.from({length:18},(_,i)=>String(i+147))];
 assert.deepEqual(rows.map(r=>String(r[0])),ids);
 assert.equal(rows.length,165);assert.equal(rows.reduce((n,r)=>n+r[7].length,0),220);assert.equal(rows.reduce((n,r)=>n+r[8].length,0),19);assert.equal(rows.filter(r=>r[3].includes('BREAK')).length,6);
 assert.equal(xy8.CARDS.length,165,'XY8 build-time catalogue was not packaged');
 assert.equal(new Set(xy8.CARDS.map(c=>c.id)).size,165);
 for(let i=0;i<rows.length;i++){
   const row=rows[i],card=xy8.CARDS[i];
   assert.equal(card.id,'xy8-'+row[0]);assert.equal(card.name,row[1]);assert.equal(classic.cardById(card.id),card);
   assert.deepEqual(card.attacks?.map(a=>a.cost.join(''))||[],row[7].map(a=>a[1].join('')));
   assert.equal(card.battleEnabled,card.deckEligible);
   if(card.battleEnabled){assert.equal(card.support.status,'FULL');for(const a of card.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],card.id+':'+a.name);if(card.kind==='trainer')assert.deepEqual(effects.validateEffect(card.effect),[],card.id)}
 }
 assert.ok(xy8.coverage().battleEnabled>=60,'Mechanic-first pass must deliver substantial real playable coverage');
 assert.equal(xy8.cardById('xy8-146a').name,"Professor's Letter");
 for(const id of ['xy8-12','xy8-50','xy8-79','xy8-92','xy8-104','xy8-113'])assert.equal(xy8.cardById(id).battleEnabled,false,'No fabricated BREAK inheritance');
});

test('Mechanic reuse uses Energy UNITS, preserves physical top-deck cards and truly discards opponent hand',()=>{
 const entries=runPy(String.raw`import json,sys;sys.path.insert(0,sys.argv[1]);import xy8_verified as v
print(json.dumps({n:v.ATTACKS[(number,title)] for n,number,title in [('thunder','55','Thunder Lance'),('shatter','62','Shatter Shot'),('mini','19','Mini Eruption'),('massive','20','Massive Eruption'),('punch','86','Pompous Punch')]}))`);
 const cards={
  energy:{id:'energy',name:'Basic Fire Energy',kind:'energy',basicEnergy:true,energyType:'Fire'},
  item:{id:'item',name:'Potion',kind:'trainer',trainerType:'Item'},
  monster:{id:'monster',name:'Pokémon',kind:'pokemon',hp:180},
 };
 const me={uid:'a',cardId:'monster',energy:{Lightning:3,Psychic:4,Colorless:2},conditions:{},damage:0};
 const defender={uid:'b',cardId:'monster',energy:{},conditions:{},damage:0};
 const ref=(name,i)=>({uid:`${name}-${i}`,cardId:name});
 const state={sides:{player:{active:me,bench:[],hand:[],deck:[],discard:[]},opponent:{active:defender,bench:[],hand:[],deck:[],discard:[]}},log:[],turnNumber:5};
 const ctx={state,side:'player',foeSide:'opponent',attacker:me,defender,cardById:id=>cards[id],isAttack:true,random:()=>0.1,
   shuffle:(_s,_d)=>{}};
 assert.equal(effects.resolveAttack({name:'Thunder Lance',damage:50,effect:entries.thunder},ctx).damage,110);
 assert.equal(effects.resolveAttack({name:'Shatter Shot',damage:0,effect:entries.shatter},ctx).damage,120);
 state.sides.player.deck=[ref('energy',0),ref('item',1)];
 const mini=effects.resolveAttack({name:'Mini Eruption',damage:30,effect:entries.mini},ctx);
 assert.equal(mini.damage,60);assert.equal(state.sides.player.discard.length,1);
 assert.equal(state.sides.player.discard[0].cardId,'energy');
 state.sides.player.deck=[ref('energy',2),ref('item',3),ref('energy',4),ref('energy',5),ref('item',6)];
 const massive=effects.resolveAttack({name:'Massive Eruption',damage:0,effect:entries.massive},ctx);
 assert.equal(massive.damage,240);
 for(const effect of massive.pendingEffects)effects.applyEffect(effect,ctx);
 assert.equal(state.sides.player.deck.length,0);assert.equal(state.sides.player.discard.length,6);
 state.sides.opponent.hand=[ref('item',7),ref('item',8)];
 effects.applyEffect(entries.punch,ctx);
 assert.equal(state.sides.opponent.hand.length,1);
 assert.equal(state.sides.opponent.discard.length,1);
 assert.equal(state.sides.opponent.deck.length,0);
});

test('Risky near-miss mappings remain gated instead of misusing similar effects',()=>{
 const unsupported=runPy(String.raw`import json,sys;sys.path.insert(0,sys.argv[1]);import xy8_verified as v
names=[('22','Inferno Fang'),('35','Cryo Mouth'),('49','Thunderclap Shot'),('63','Vanishing Strike'),('82','Primordial Boom'),('107','Rainbow Force')]
print(json.dumps({'attacks':[v.ATTACKS.get(k) for k in names],'reservedTicket':v.TRAINERS.get('147'),'punch':v.ATTACKS.get(('86','Pompous Punch'))}))`);
 assert.deepEqual(unsupported.attacks,[null,null,null,null,null,null]);
 assert.equal(unsupported.reservedTicket,null);
 assert.equal(unsupported.punch.type,'discardHand');
});
