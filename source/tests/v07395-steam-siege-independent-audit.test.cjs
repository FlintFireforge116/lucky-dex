'use strict';
// Independent adversarial regression pass on the completed XY11 catalogue.
// Important: these cases intentionally exercise multi-set interactions that
// weren't covered by the stage/completion test suites.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const xy=require('../app/src/main/assets/tcg-classic-steam-siege.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const rows=require('../data/classic/xy11-print-compact.json');
const deck=['xy11-96','xy11-94','xy11-95','xy11-6','xy11-1','xy11-3','xy11-76'].flatMap(id=>Array(4).fill(id)).concat(['xy11-114','xy11-114']);
const slot=(cardId,uid,benchSlot=0)=>({cardId,uid,benchSlot,stack:[cardId],energy:{},specialEnergy:[],conditions:{},locks:[],damage:0});
const board=active=>({active,bench:[],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},turnCount:1});
const fixture=()=>({format:'classic',turnNumber:8,firstSide:'player',activeSide:'player',sides:{player:board(slot('xy11-11','p')),opponent:board(slot('xy11-42','o'))},modifiers:[],log:[]});
const ctx=(state,side='player',more={})=>({state,side,foeSide:side==='player'?'opponent':'player',attacker:state.sides[side].active,defender:state.sides[side==='player'?'opponent':'player'].active,cardById:data.cardById,isAttack:true,random:()=>0.8,shuffle:()=>{},...more});
const attack=(number,name)=>xy.cardById('xy11-'+number).attacks.find(a=>a.name===name);
const item=n=>xy.cardById('xy11-'+n).effect;

test('all 116 exact print numbers, ordered attack names/cost symbols and numeric damage values match pinned catalogue',()=>{
 assert.equal(rows.length,116);
 assert.equal(xy.CARDS.length,116);
 for(const row of rows){
  const [num,name,supertype,,,,,attacks]=row,c=xy.cardById('xy11-'+num);
  assert.ok(c&&c.battleEnabled,'missing/disabled '+num);assert.equal(c.name,name);
  assert.equal(c.kind,supertype==='Pokémon'?'pokemon':'trainer','kind '+num);
  assert.equal(c.attacks?.length||0,attacks.length,'attack count '+num);
  for(let i=0;i<attacks.length;i++){
    const [n,cost,damage]=attacks[i],actual=c.attacks[i];
    assert.equal(actual.name,n,'attack name '+num+'/'+i);
    assert.equal(Array.isArray(actual.cost)?actual.cost.join(''):String(actual.cost),cost.join(''),'energy '+num+'/'+i);
    const expected=!damage||/[×x]$/.test(damage)?0:parseInt(damage,10);
    assert.equal(Number(actual.damage||0),expected,'base damage '+num+'/'+i);
  }
 }
});

test('Wicked Wind does not crash Stadium replacement; suppressed Stadium still counts as physically in play',()=>{
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:2});
 s.phase='battle';s.activeSide='player';s.sides.player.stadiumUsed=false;
 s.stadium={uid:'old-stadium',cardId:'bw8-126'};
 s.sides.player.hand=[{uid:'new-stadium',cardId:'xy10-94'}];
 s.xy11WickedWindUntil=s.turnNumber+1;
 assert.doesNotThrow(()=>core.legalActions(s,'player'));
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='xy10-94'), 'different Stadium can replace suppressed Stadium');
 s.stadium.cardId='xy10-94';
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='xy10-94'),false,'cannot play same-named Stadium over the physical one');
});

test('Pokémon Ranger removes Electroweb attack lock but preserves a non-attack lock',()=>{
 const s=fixture(),target=s.sides.player.active;
 effects.applyEffect(attack(42,'Electroweb').effect,ctx(s,'opponent'));
 assert.ok(target.locks.some(x=>x.action==='retreat'&&x.fromAttack===true));
 target.locks.push({action:'retreat',fromAttack:false,expiresTurn:s.turnNumber+1});
 effects.applyEffect(item(104),ctx(s,'player',{isAttack:false}));
 assert.equal(target.locks.length,1);
 assert.equal(target.locks[0].fromAttack,false);
});

test('Pokémon Ranger clears attack-created preventDamage but leaves another source of protection intact',()=>{
 const s=fixture(),me=s.sides.player.active;
 effects.applyEffect({type:'preventDamage',target:'self',duration:'opponentTurn'},ctx(s,'player'));
 assert.equal(me.attackGuard.fromAttack,true);
 effects.applyEffect(item(104),ctx(s,'opponent',{isAttack:false}));
 assert.equal(me.attackGuard,undefined);
 effects.applyEffect({type:'preventDamage',target:'self',duration:'opponentTurn'},ctx(s,'player',{isAttack:false}));
 assert.equal(me.attackGuard.fromAttack,false);
 effects.applyEffect(item(113),ctx(s,'opponent',{isAttack:false}));
 assert.equal(me.attackGuard?.fromAttack,false);
});

test('Dark Burn can select a specific physical Darkness Special Energy while leaving unrelated Basic attached',()=>{
 const s=fixture(),me=s.sides.player;me.active=slot('xy11-86','hydreigon');
 me.active.energy.Darkness=1;
 me.active.specialEnergy=[{uid:'special-dark',cardId:'neo1-104'}];
 const action={effectSelection:'hydreigon:special:special-dark'};
 const choices=effects.choicesForEffect(attack(86,'Dark Burn').effect,ctx(s));
 assert.ok(choices.some(x=>x.effectSelection===action.effectSelection),'must offer the Special Energy without forcing Basic Energy first');
 const result=effects.resolveAttack(attack(86,'Dark Burn'),ctx(s,'player',{action}));
 assert.equal(result.damage,50);
 for(const pending of result.pendingEffects)effects.applyEffect(pending,ctx(s));
 assert.equal(me.active.energy.Darkness,1,'Basic Darkness must remain attached');
 assert.equal(me.active.specialEnergy.length,0,'selected Special Darkness removed');
 assert.ok(me.discard.some(x=>x.uid==='special-dark'));
});

test('all seven BREAKs remain battle-enabled and inherit their previous stage, not a disconnected Basic',()=>{
 const names=['Yanmega','Talonflame','Pyroar','Clawitzer','Yveltal','Xerneas','Hydreigon'];
 for(const name of names){const c=xy.CARDS.find(x=>x.breakEvolution&&x.name===name+' BREAK');assert.ok(c,name);
  assert.ok(c.attacks?.length,name+' has a BREAK attack');
  assert.ok(xy.CARDS.some(p=>p.kind==='pokemon'&&p.name===name),'no previous stage '+name);
 }
});
