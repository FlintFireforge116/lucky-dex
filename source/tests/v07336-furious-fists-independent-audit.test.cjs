'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const furious=require(path.join(assets,'tcg-classic-furious-fists.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const synergy=require(path.join(assets,'tcg-deck-synergy.js'));
const printPath=path.join(root,'data/classic/xy3-print-compact.json');
const generated=fs.existsSync(printPath)&&furious.CARDS.length===114;
const R=key=>({type:'neoRule',rule:'xy3:'+key});

function scene(){
 const board=()=>({active:{cardId:'base1-1',uid:'p',stack:['base1-1'],energy:{},specialEnergy:[],conditions:{},damage:0,tool:null,extraTools:[]},bench:[],hand:[],deck:[],discard:[],prizes:[],energyDiscard:{},energySupply:[],turnCount:5,handLimit:8,benchLimit:3});
 const state={format:'classic',phase:'battle',activeSide:'player',turnNumber:9,rngState:3,log:[],sides:{player:board(),opponent:board()},modifiers:[]};
 state.sides.opponent.active.uid='o';return state;
}
const ref=(cardId,uid)=>({cardId,uid});

// Keep this test independent of generated XY3 assets and their offline
// placeholders. Use the same live Classic battle engine with real choices.
test('Hypno Hand Control: opposing physical Supporter is played from its owner, while attacker controls every nested selection',()=>{
 const fake={
  'audit-korrina':{id:'audit-korrina',name:'Korrina',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:R('korrina')},
  'audit-fighter':{id:'audit-fighter',name:'Lucario-EX',kind:'pokemon',stage:'Basic',types:['Fighting'],hp:170,battleEnabled:true},
  'audit-item':{id:'audit-item',name:'Energy Switch',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'noop'}},
  'audit-grass':{id:'audit-grass',name:'Bellsprout',kind:'pokemon',stage:'Basic',types:['Grass'],hp:50,battleEnabled:true}
 };
 const old=data.cardById;data.cardById=id=>fake[id]||old(id);
 try{
  const s=scene(),us=s.sides.player,foe=s.sides.opponent;
  us.deck=[ref('audit-grass','your-deck-stays-put')];
  foe.hand=[ref('audit-korrina','opp-supporter')];
  foe.deck=[ref('audit-fighter','opp-fighter'),ref('audit-item','opp-item'),ref('audit-grass','opp-grass')];
  effects.applyEffect(R('handControl'),core.effectContext(s,'player',{},us.active));
  assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
  assert.deepEqual(s.pendingChoice.options,['Make opponent play Korrina','Do not play a Supporter']);
  s.pendingChoice.resume='attack';s.pendingChoice.isAttack=true;
  core.applyAction(s,'player',{type:'effectChoice',choiceOption:0});
  assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player','attacker chooses opponent Korrina search');
  assert.equal(s.pendingChoice.originSide,'opponent','effect must originate from Supporter owner');
  assert.deepEqual(s.pendingChoice.options,['Take Lucario-EX','Skip']);
  const first=core.legalActions(s,'player');
  assert.ok(first.some(a=>a.choiceOption===0));
  core.applyAction(s,'player',{type:'effectChoice',choiceOption:0});
  assert.equal(s.choiceSide,'player');assert.deepEqual(s.pendingChoice.options,['Take Energy Switch','Skip']);
  core.applyAction(s,'player',{type:'effectChoice',choiceOption:0});
  assert.deepEqual(foe.hand.slice(0,2).map(x=>x.uid),['opp-fighter','opp-item'],'real opponent deck cards move into opponent hand');
  assert.deepEqual(foe.discard.map(x=>x.uid),['opp-supporter'],'real Supporter is discarded');
  assert.deepEqual(us.deck.map(x=>x.uid),['your-deck-stays-put'],'attacker deck remains untouched');
  assert.equal(s.activeSide,'opponent','the ATTACKER turn must end after the forced Supporter choices');
  assert.equal(s.xy3ForcedSupporter,undefined,'choice-controller override must be cleared');
 }finally{data.cardById=old;}
});

test('Hypno Hand Control: an empty opponent hand, declining, or an unusable Supporter is safe',()=>{
 const s=scene();effects.applyEffect(R('handControl'),core.effectContext(s,'player',{},s.sides.player.active));
 assert.equal(s.phase,'battle');assert.equal(s.pendingChoice,undefined);
 assert.ok(s.log.some(x=>x.rule==='handControl'&&Array.isArray(x.revealedOpponentHand)));
 const old=data.cardById;
 data.cardById=id=>id==='audit-unsupported'?{id,name:'Unsupported Supporter',trainerType:'Supporter',battleEnabled:false,effect:{type:'unsupported'}}:old(id);
 try{
  const p=scene();p.sides.opponent.hand=[ref('audit-unsupported','bad')];
  effects.applyEffect(R('handControl'),core.effectContext(p,'player',{},p.sides.player.active));
  assert.equal(p.phase,'battle','do not allow a fake force-play that silently ignores printed rules');
 }finally{data.cardById=old;}
});

test('Furious Fists complete printed catalogue, energy symbols, all mandatory effects, and alt-print parity',{skip:!generated},()=>{
 const rows=JSON.parse(fs.readFileSync(printPath,'utf8'));
 assert.equal(rows.length,114);assert.equal(furious.CARDS.length,114);
 assert.equal(rows.reduce((s,x)=>s+x[7].length,0),159);
 assert.equal(rows.reduce((s,x)=>s+x[8].length,0),14);
 const ok=new Set('G R W L P F D M Y C'.split(' '));
 const genders=new Set(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless','Dragon']);
 for(const [index,row] of rows.entries()){
  const c=furious.CARDS[index],id='xy3-'+row[0];
  assert.equal(c.id,id);assert.equal(c.name,row[1]);assert.equal(c.kind,{'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[row[2]]);
  assert.equal(data.cardById(id),c,id+' registered');
  assert.equal(c.battleEnabled,c.deckEligible,id+' no unimplemented card in deck builder');
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(row[4]),id+' HP');assert.equal(c.retreat,Number(row[11]),id+' retreat');
   assert.deepEqual(c.types,row[5],id+' printed types');
   assert.ok(c.types.every(t=>genders.has(t)),id+' legal printed type');
   assert.equal(c.attacks.length,row[7].length,id+' attack count');
   for(const [j,a] of row[7].entries()){
    const actual=c.attacks[j];
    assert.equal(actual.name,a[0],id+' attack name');assert.deepEqual(actual.cost,a[1],id+' cost');
    assert.ok(a[1].every(s=>ok.has(s)),id+' valid Energy symbols');
    assert.equal(actual.damageText,a[2]||null,id+' printed damage text');
    assert.equal(actual.text,a[3],id+' printed effect');
   }
   assert.equal(c.evolvesFrom,row[6],id+' stage chain');
   if(c.pokemonEX)assert.equal(c.prizeCards,2,id+' EX prize count');
  }
  if(!c.battleEnabled){assert.ok(c.support.reasons.length>0,id+' gated reason');continue;}
  assert.equal(c.support.status,'FULL',id+' declared complete');
  for(const a of c.attacks||[]){assert.equal(a.effect.type==='unsupported',false,id+' '+a.name);assert.deepEqual(effects.validateEffect(a.effect),[],id+' '+a.name);}
  for(const a of c.abilities||[])assert.deepEqual(effects.validateEffect(a.effect),[],id+' '+a.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],id+' trainer');
 }
 const twins=[['4','105'],['5','112'],['20','106'],['54','107'],['55','55a'],['55','113'],['74','108'],['88','109'],['92','110'],['95','111']];
 for(const [a,b] of twins){const x=furious.cardById('xy3-'+a),y=furious.cardById('xy3-'+b);
   assert.ok(x&&y,`${a}/${b} missing reprint`);assert.equal(x.name,y.name,`${a}/${b} reprint name`);
   assert.deepEqual(x.attacks?.map(q=>[q.name,q.cost,q.damageText,q.text,q.effect]),y.attacks?.map(q=>[q.name,q.cost,q.damageText,q.text,q.effect]),`${a}/${b} same printed moves`);
   if(x.kind==='trainer')assert.deepEqual(x.effect,y.effect,`${a}/${b} same Trainer effect`);
 }
 assert.equal(furious.cardById('xy3-36').battleEnabled,true,'Hand Control ungated');
});

test('full XY3 single-set & cross-era deckbuilding audit checks both player and CPU candidate pools',{skip:!generated},()=>{
 const sets=[['xy3'],['xy1','xy2','xy3'],['bw10','bw11','xy1','xy2','xy3']];
 for(const selected of sets){
  const owned=data.CARDS.filter(c=>selected.includes(c.setId)&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
  assert.ok(owned.length>0,'nonempty owned pool');
  for(const [style,seed] of [['competitive',1],['random',3],['competitive',19],['random',29]]){
   const deck=builder.buildDeck(owned,{sets:selected,style,randomSeed:seed});
   assert.equal(deck.ok,true,`${selected}/${style}/${seed}: ${JSON.stringify(deck.errors||deck.error)}`);
   assert.equal(deck.cards.length,30,'30-card format');
   assert.equal(decks.validateDraft(deck.cards,owned,{requireFull:true}).ok,true,'valid owned cards');
   assert.deepEqual(decks.analyzeDeck(deck.cards,deck.energyTypes).missingEnergyTypes,[],'all attack Energy types present');
   assert.deepEqual(synergy.report(deck.cards.map(data.cardById),deck.energyTypes,'any').dead,[],'no known dead Trainers');
   assert.deepEqual(deck.cards.filter(id=>data.cardById(id)?.battleEnabled===false),[],'no gated cards');
  }
 }
});

test('run pinned generator in synthetic mode: Hypno and all printed Trainer cases are schema-valid',()=>{
 const script=String.raw`
import json,sys
sys.path.insert(0,sys.argv[1])
import importlib.util
spec=importlib.util.spec_from_file_location("build_xy3", sys.argv[1]+"/build-xy3.py")
B=importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)
row=['36','Hypno','Pokémon',['Stage 1'],'90',['Psychic'],'Drowzee',
 [['Hand Control',['P','C'],'','Your opponent reveals his or her hand. You may choose a Supporter card you find there. If you do, your opponent plays that Supporter card. However, you make all decisions for that card. (That Supporter card is discarded.)'],
  ['Hypnoblast',['P','C'],'60','Your opponent\'s Active Pokémon is now Asleep.']],[],None,None,2,'Uncommon',[],None]
print(json.dumps(B.generate([row])[0]))
`;
 const proc=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8'});
 assert.equal(proc.status,0,proc.stderr);
 const hypno=JSON.parse(proc.stdout);
 assert.equal(hypno.battleEnabled,true,JSON.stringify(hypno.support?.reasons));
 assert.equal(hypno.attacks[0].effect.rule,'xy3:handControl');
 assert.deepEqual(effects.validateEffect(hypno.attacks[0].effect),[]);
 const contents=fs.readFileSync(path.join(root,'scripts/xy3_verified.py'),'utf8');
 assert.match(contents,/\('36','Hand Control'\)/,'mapping for Hypno is real');
 assert.match(contents,/GATE.pop\(_recent,None\)/,'rule gate lift is explicit');
 assert.match(fs.readFileSync(path.join(assets,'tcgp-battle-effects.js'),'utf8'),/if\(k==='handControl'\)/,'battle engine has Hand Control handler');
 assert.match(fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8'),/xy3ControlledSupporter/,'attacker choice ownership routing is installed');
});

test('Accelgor Raid gets exactly +40 only on the turn it evolves',()=>{
 const s=scene(),a=s.sides.player.active;
 const attack={name:'Raid',damage:20,effect:{type:'bonusDamage',amount:40,condition:{type:'evolvedThisTurn'}}};
 a.evolvedOnTurn=s.turnNumber;
 const ctx={...core.effectContext(s,'player',{},a),isAttack:true,attack};
 assert.equal(effects.resolveAttack(attack,ctx).damage,60);
 a.evolvedOnTurn=s.turnNumber-2;
 assert.equal(effects.resolveAttack(attack,ctx).damage,20);
});

test('Watchog Thorough Crunch flips two visible coins then discards selected opponent Energy units',()=>{
 const s=scene(),def=s.sides.opponent.active;
 def.energy={Water:1,Fire:1};
 const ctx={...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.1,isAttack:true};
 effects.applyEffect(R('thoroughCrunch'),ctx);
 assert.equal(s.phase,'effectChoice');
 assert.equal(s.pendingChoice.kind,'option');
 assert.equal(s.log.filter(q=>q.type==='coin'&&q.reason==='Thorough Crunch').length,1);
 assert.deepEqual(s.log.find(q=>q.reason==='Thorough Crunch').results,[true,true]);
 assert.equal(s.pendingChoice.options.length,2);
 core.applyAction(s,'player',{type:'effectChoice',choiceOption:0});
 assert.equal(Object.values(def.energy).reduce((a,b)=>a+b,0),1);
 assert.equal(s.phase,'effectChoice','second Energy selection must still be offered');
 core.applyAction(s,'player',{type:'effectChoice',choiceOption:0});
 assert.equal(Object.values(def.energy).reduce((a,b)=>a+b,0),0);
 assert.equal((s.sides.opponent.energyDiscard.Fire||0)+(s.sides.opponent.energyDiscard.Water||0),2);
});

test('source-side mapped Fury Fists attack, ability, and Trainer schemas have no silent invalid effects',()=>{
 const script=String.raw`
import json,sys
sys.path.insert(0,sys.argv[1])
import xy3_verified as V
print(json.dumps([list(V.ATTACKS.values()),[obj['effect'] for obj in V.ABILITIES.values()],[obj[1] for obj in V.TRAINERS.values()],V.GATE]))`;
 const p=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);
 const [attacks,abilities,trainers,gates]=JSON.parse(p.stdout);
 assert.equal(attacks.length,111);
 assert.equal(abilities.length,13);
 assert.equal(trainers.length,18);
 assert.deepEqual(gates,{},'no predeclared Furious Fists print may be silently disabled');
 for(const [section,arr] of [['attack',attacks],['ability',abilities],['trainer',trainers]])
  for(const [i,e] of arr.entries())assert.deepEqual(effects.validateEffect(e),[],section+' #'+i+' '+JSON.stringify(e));
});

test('CPU-side Hypno Hand Control retains decision ownership on the attacking side',()=>{
 const fake={
  'audit-cpu-supporter':{id:'audit-cpu-supporter',name:'Korrina',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:R('korrina')},
  'audit-cpu-fighter':{id:'audit-cpu-fighter',name:'Hawlucha',kind:'pokemon',stage:'Basic',types:['Fighting'],hp:70},
  'audit-cpu-item':{id:'audit-cpu-item',name:'Focus Sash',kind:'trainer',trainerType:'Item',effect:{type:'noop'}}
 };
 const old=data.cardById;data.cardById=id=>fake[id]||old(id);
 try{
  const s=scene();s.activeSide='opponent';s.sides.player.hand=[ref('audit-cpu-supporter','p-support')];
  s.sides.player.deck=[ref('audit-cpu-fighter','p-fight'),ref('audit-cpu-item','p-item')];
  effects.applyEffect(R('handControl'),core.effectContext(s,'opponent',{},s.sides.opponent.active));
  assert.equal(s.choiceSide,'opponent');s.pendingChoice.resume='attack';s.pendingChoice.isAttack=true;
  core.applyAction(s,'opponent',{type:'effectChoice',choiceOption:0});
  assert.equal(s.choiceSide,'opponent');assert.equal(s.pendingChoice.originSide,'player');
  core.applyAction(s,'opponent',{type:'effectChoice',choiceOption:0});
  assert.equal(s.choiceSide,'opponent');
  core.applyAction(s,'opponent',{type:'effectChoice',choiceOption:0});
  assert.equal(s.activeSide,'player');
  assert.deepEqual(s.sides.player.discard.map(x=>x.uid),['p-support']);
  assert.deepEqual(s.sides.player.hand.slice(0,2).map(x=>x.uid),['p-fight','p-item']);
 }finally{data.cardById=old;}
});
