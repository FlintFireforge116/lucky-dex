'use strict';
// Fates Collide XY10 Stage 5 — real physical/Zone Energy, once-per-turn powers,
// Devolution Spray, Energy Pouch knockout and Scorched Earth parity.
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const code=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy10_verified as m
print(json.dumps({'attacks':{n+':'+t:e for (n,t),e in m.ATK.items()},'abilities':m.ABILITIES,'trainers':{n:v[1] for n,v in m.TRAINERS.items()}}))`;
const out=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(out.status,0,out.stderr);const m=JSON.parse(out.stdout);
function scene(){
 const cards={
  carb:{id:'carb',name:'Carbink BREAK',kind:'pokemon',stage:'BREAK',types:['Fighting'],hp:120},
  delph:{id:'delph',name:'Delphox BREAK',kind:'pokemon',stage:'BREAK',types:['Fire'],hp:180},
  base:{id:'base',name:'Basic',kind:'pokemon',stage:'Basic',types:['Fighting'],hp:120},
  evo:{id:'evo',name:'Evolution',kind:'pokemon',stage:'Stage 1',types:['Fighting'],hp:150},
  foe:{id:'foe',name:'Foe',kind:'pokemon',stage:'Basic',types:['Colorless'],hp:170},
  fire:{id:'fire',name:'Fire Energy',kind:'energy',basicEnergy:true,energyType:'Fire',subtype:'Fire'},
  water:{id:'water',name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water'},
  dce:{id:'dce',name:'Double Colorless Energy',kind:'energy',specialEnergy:true,text:'Provides ColorlessColorless Energy',effect:{type:'specialEnergy',provides:{Colorless:2}}},
  pouch:{id:'xy10-97',name:'Energy Pouch',kind:'trainer',trainerType:'Tool',effect:m.trainers['97']},
 };
 const slot=(id,uid,benchSlot=null)=>({uid,cardId:id,stack:[id],benchSlot,energy:{},specialEnergy:[],conditions:{},damage:0,tool:null});
 const p={active:slot('base','a'),bench:[],hand:[],discard:[],deck:[],energySupply:[],energyDiscard:{},turnCount:3,prizes:[]},
   o={active:slot('foe','o'),bench:[],hand:[],discard:[],deck:[],energySupply:[],energyDiscard:{},turnCount:3,prizes:[]};
 const state={format:'classic',turnNumber:8,activeSide:'player',phase:'battle',sides:{player:p,opponent:o},log:[]};
 const choices=[],ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id]||null,
   requestChoice:c=>choices.push(c),shuffle:()=>{},random:()=>.1,isAbility:true};
 const continueWith=(e,action)=>fx.applyEffect(e,{...ctx,resolvingChoice:true,action});
 return {cards,slot,p,o,state,choices,ctx,continueWith};
}
test('Stage 5 mappings and nested Stadium action validate against the shared DSL',()=>{
 for(const n of ['14','51','95','97','98','110']){
  const e=n==='14'?m.abilities['Flare Witch'].effect:n==='51'?m.attacks['51:Diamond Gift']:m.trainers[n];
  assert.ok(e,`missing print ${n}`);assert.deepEqual(fx.validateEffect(e),[],`print ${n}`);
 }
 assert.equal(m.abilities['Flare Witch'].oncePerTurn,true);
 assert.equal(m.trainers['110'].effect.rule,'xy5:scorchedEarth');
});
test('Flare Witch attaches exactly one Fire Energy Zone unit to a chosen Bench target, not to the caster automatically',()=>{
 const s=scene();s.p.active=s.slot('delph','d');s.ctx.attacker=s.p.active;
 s.p.bench=[s.slot('base','b',0)];s.p.energySupply=['Water','Fire','Water'];
 const e=m.abilities['Flare Witch'].effect;fx.applyEffect(e,s.ctx);
 assert.equal(s.choices.at(-1).kind,'pokemon');assert.equal(s.p.energySupply.length,3);
 s.continueWith({...e,stage:'target',source:'zone'},{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(s.p.bench[0].energy.Fire,1);assert.deepEqual(s.p.energySupply,['Water','Water']);
 assert.equal(s.p.active.energy.Fire||0,0);
});
test('Flare Witch chooses and consumes the precise physical Fire Energy from deck; a non-Fire card cannot be forged',()=>{
 const s=scene(),e=m.abilities['Flare Witch'].effect;s.p.energySupply=[];
 s.p.deck=[{uid:'w',cardId:'water'},{uid:'f',cardId:'fire'}];fx.applyEffect(e,s.ctx);
 assert.equal(s.choices.at(-1).kind,'deckCard');
 s.continueWith({...e,stage:'deck'},{choiceDeckIndex:0});assert.equal(s.choices.at(-1).kind,'deckCard','wrong-type selection cannot advance');
 s.continueWith({...e,stage:'deck'},{choiceDeckIndex:1});assert.equal(s.choices.at(-1).kind,'pokemon');
 s.continueWith({...e,stage:'target',source:'deck',sourceUid:'f'},{choiceTarget:'active'});
 assert.equal(s.p.active.energy.Fire,1);assert.deepEqual(s.p.deck.map(x=>x.uid),['w']);
});
test('Carbink BREAK Diamond Gift attaches two chosen discarded Energy cards to ONE Fighting Pokemon, including physical Special Energy',()=>{
 const s=scene(),e=m.attacks['51:Diamond Gift'];s.p.active=s.slot('carb','c');s.ctx.attacker=s.p.active;
 s.p.energyDiscard={Water:1};s.p.discard=[{uid:'dce-physical',cardId:'dce'}];
 fx.applyEffect(e,s.ctx);assert.equal(s.choices.at(-1).kind,'pokemon');
 s.continueWith({...e,stage:'target'},{choiceTarget:'active'});
 assert.equal(s.choices.at(-1).kind,'option');
 s.continueWith({...e,stage:'energy',targetUid:'c',remaining:2},{choiceOption:0});
 assert.equal(s.p.active.energy.Water,1);assert.equal(s.p.energyDiscard.Water,0);
 s.continueWith({...e,stage:'energy',targetUid:'c',remaining:1},{choiceOption:0});
 assert.deepEqual(s.p.active.specialEnergy.map(x=>x.uid),['dce-physical']);
 assert.equal(s.p.discard.length,0);
 const damage=fx.resolveAttack({name:'Diamond Gift',damage:20,effect:e},s.ctx);
 assert.equal(damage.damage,20,'energy acceleration does not replace attack base damage');
});
test('Carbink BREAK cannot choose a non-Fighting recipient and does not create Energy from nothing',()=>{
 const s=scene();s.p.active=s.slot('foe','f');s.ctx.attacker=s.p.active;
 s.p.discard=[{uid:'dce',cardId:'dce'}];const e=m.attacks['51:Diamond Gift'];
 fx.applyEffect(e,s.ctx);assert.equal(s.choices.length,0);
 const clean=scene();clean.p.active=clean.slot('carb','c');clean.ctx.attacker=clean.p.active;
 fx.applyEffect(e,clean.ctx);assert.equal(clean.choices.length,0);
});
test('Devolution Spray returns ONLY the top Evolution to hand, retains attachments, and blocks same-turn re-evolution',()=>{
 const s=scene(),e=m.trainers['95'];s.p.active={...s.slot('evo','ev'),stack:['base','evo'],energy:{Water:2},specialEnergy:[{uid:'d',cardId:'dce'}],damage:50};
 s.p.active.conditions={poison:{}};s.ctx.attacker=s.p.active;fx.applyEffect(e,s.ctx);assert.equal(s.choices.at(-1).kind,'pokemon');
 s.continueWith(e,{choiceTarget:'active'});
 assert.deepEqual(s.p.active.stack,['base']);assert.equal(s.p.active.cardId,'base');
 assert.deepEqual(s.p.hand.map(x=>x.cardId),['evo']);assert.equal(s.p.active.damage,50);
 assert.equal(s.p.active.energy.Water,2);assert.equal(s.p.active.specialEnergy[0].uid,'d');
 assert.deepEqual(s.p.active.conditions,{},'devolving clears Special Conditions and attack effects');
 assert.equal(s.p.active.playedOnSideTurn,s.p.turnCount);
});
test('Energy Reset selectively returns Basic and physical Special Energy from all owned Pokemon, but does not touch unused supply',()=>{
 const s=scene(),e=m.trainers['98'];s.p.active.energy={Water:1};s.p.active.specialEnergy=[{uid:'dce-1',cardId:'dce'}];
 s.p.energySupply=['Fire'];fx.applyEffect(e,s.ctx);assert.equal(s.choices.at(-1).kind,'option');
 s.continueWith(e,{choiceOption:0});assert.equal(s.p.active.energy.Water,0);
 assert.equal(s.p.hand.length,1);assert.equal(s.p.energySupply.length,1);
 s.continueWith(e,{choiceOption:0});assert.equal(s.p.active.specialEnergy.length,0);
 assert.ok(s.p.hand.some(x=>x.uid==='dce-1'));assert.deepEqual(s.p.energySupply,['Fire']);
});
test('Scorched Earth XY10 uses exactly the working XY5 Stadium action: discards physical Fire/Fighting from hand and draws 2',()=>{
 const s=scene(),e=m.trainers['110'].effect;s.p.hand=[{uid:'water-phys',cardId:'water'},{uid:'fire-phys',cardId:'fire'}];
 s.p.deck=[{uid:'draw1',cardId:'base'},{uid:'draw2',cardId:'base'}];
 s.ctx.drawCard=ss=>{const ref=ss.deck.shift();if(ref)ss.hand.push(ref);return ref;};
 fx.applyEffect(m.trainers['110'],s.ctx);assert.equal(s.choices.at(-1).kind,'option');
 fx.applyEffect(s.choices.at(-1).effect,{...s.ctx,resolvingChoice:true,action:{choiceOption:0}});
 assert.deepEqual(s.p.discard.map(x=>x.uid),['fire-phys']);
 assert.deepEqual(s.p.hand.map(x=>x.uid),['water-phys','draw1','draw2']);
 assert.deepEqual(s.p.energySupply,[]);
});
test('Energy Pouch returns only Basic Energy from a real opponent-attack KO; attachments discard and Prize still awarded',()=>{
 const core=require('../app/src/main/assets/tcgp-battle-core.js'),opponents=require('../app/src/main/assets/tcg-classic-opponents.js');
 const deck=opponents.generate({sets:['base1'],seed:381,type:'Water'});assert.equal(deck.ok,true);
 const battle=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:381,firstSide:'opponent',playerEnergyTypes:['Water'],opponentEnergyTypes:['Colorless']});
 battle.phase='battle';battle.activeSide='opponent';battle.turnNumber=8;battle.log=[];
 for(const who of ['player','opponent']){const b=battle.sides[who];b.turnCount=3;b.hand=[];b.discard=[];b.bench=[];b.energyDiscard={};b.supporterUsed=false;}
 const p=battle.sides.player,o=battle.sides.opponent;
 p.active=core.makePokemonSlot('base1-35',3,'pouch-pokemon');p.active.energy={Water:2};p.active.specialEnergy=[{uid:'attached-special',cardId:'xy9-113',provides:{Water:1}}];
 p.active.tool={uid:'real-pouch',cardId:'xy10-97'};
 p.bench=[core.makePokemonSlot('base1-41',3,'seel')];p.bench[0].benchSlot=0;
 o.active=core.makePokemonSlot('base1-3',3,'chansey');o.active.energy={Colorless:4};
 const prizes=o.prizes.length,attack=core.legalActions(battle,'opponent').find(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(attack);core.applyAction(battle,'opponent',attack);
 assert.equal(p.hand.filter(ref=>ref.cardId==='neo1-111').length,2);
 assert.equal(p.energyDiscard.Water||0,0,'no duplicate discarded Basic Energy');
 assert.ok(p.discard.some(ref=>ref.uid==='real-pouch'));
 assert.ok(p.discard.some(ref=>ref.uid==='attached-special'),'Special Energy is not rescued');
 assert.equal(o.prizes.length,prizes-1);assert.ok(battle.log.some(x=>x.type==='xy10EnergyPouch'));
});
test('Stage 5 generated catalogues enable all six prints and enable the completed Restored family',()=>{
 const py=String.raw`import sys,json,importlib.util;sys.path.insert(0,sys.argv[1]);sp=importlib.util.spec_from_file_location('b',sys.argv[2]);b=importlib.util.module_from_spec(sp);sp.loader.exec_module(b)
def p(n,name,stage,atk=[],ab=[]):return [n,name,'Pokémon',[stage],140,['Fighting'],None,atk,ab,'Grass',None,1,'Rare',[],None,None]
def t(n,name,stage='Item'):return [n,name,'Trainer',[stage],None,[],None,[],[],None,None,0,'Uncommon',[],None,None]
rows=[p('14','Delphox BREAK','BREAK',[],[['Flare Witch','Ability','Search for a Fire Energy and attach it']]),p('51','Carbink BREAK','BREAK',[['Diamond Gift',['F'],'20','Attach 2 Energy from discard to Fighting Pokemon']]),t('95','Devolution Spray'),t('97','Energy Pouch','Pokémon Tool'),t('98','Energy Reset'),t('110','Scorched Earth','Stadium'),p('17','Omanyte','Restored',[['Water Gun',['W'],'30','']])]
cs=b.generate(rows);print(json.dumps([(c['number'],c['battleEnabled']) for c in cs]))`;
 const r=spawnSync('python3',['-c',py,path.join(root,'scripts'),path.join(root,'scripts/build-xy10.py')],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(r.stdout),[['14',true],['51',true],['95',true],['97',true],['98',true],['110',true],['17',true]]);
});
