'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage13_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[n]})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage13-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage13-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage13-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage13-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage13-metal','Metal Energy','Metal'],['sm5-stage13-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage13-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage13-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage13-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage13-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage13-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
 data.cardById=id=>cards.get(id)||original(id);
 let state;
 try{state=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:74022,firstSide:'player',playerEnergyTypes:['Metal','Water','Psychic'],opponentEnergyTypes:['Metal','Water','Psychic']});}
 catch(e){data.cardById=original;throw e;}
 state.phase='battle';state.activeSide='player';state.turnNumber=5;
 for(const who of ['player','opponent']){const s=state.sides[who];s.hand=[];s.discard=[];s.energyDiscard={};s.deck=Array.from({length:14},(_,i)=>ref('sm4-1',`${who}-deck-${i}`));s.prizes=Array.from({length:5},(_,i)=>ref('sm4-1',`${who}-prize-${i}`));s.turnCount=3;s.handEnergyUsed=true;s.energyUsed=true;s.supporterUsed=false;}
 state.sides.player.active=slot(a.id,'pa',energy);state.sides.player.bench=[slot(b.id,'pb')];
 state.sides.opponent.active=slot(d.id,'oa',{});state.sides.opponent.bench=[slot(b.id,'ob'),slot(b.id,'ob2')];
 for(const who of ['player','opponent'])state.sides[who].bench.forEach((p,i)=>p.benchSlot=i);
 return {state,cards,a,d,b,gx,restore:()=>{data.cardById=original;}};
}
function attack(h,name,side='player',index=0){const s=h.state;s.activeSide=side;const moves=core.legalActions(s,side).filter(x=>x.type==='attack'&&(!name||h.a.attacks[x.attackIndex]?.name===name));assert.ok(moves.length,`No legal ${name} attack: ${JSON.stringify(core.attackAvailability(s,side,0))}`);assert.ok(moves[index],`Missing ${name} attack choice ${index}: ${JSON.stringify(moves)}`);core.applyAction(s,side,moves[index]);return moves;}
function choose(h,index=0){const s=h.state;assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(choices[index],`No effectChoice ${index}: ${JSON.stringify(choices)}`);core.applyAction(s,s.choiceSide,choices[index]);return choices[index];}
function stop(h){const s=h.state;const moves=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(moves.length);choose(h,moves.length-1);}
function drain(h){let i=0;while(h.state.phase==='effectChoice'&&i++<12)choose(h,0);assert.ok(i<12,'stuck in choice loop');}
function action(h,type,cardId){const s=h.state;const x=core.legalActions(s,s.activeSide).find(x=>x.type===type&&(!cardId||x.cardId===cardId));assert.ok(x,`Missing ${type} ${cardId||''}`);core.applyAction(s,s.activeSide,x);return x;}




test('Stage 13 official mappings are explicit and all descriptors validate',()=>{
  assert.equal(Object.keys(fixture.attacks).length,6);
  for(const desc of Object.values(fixture.attacks))assert.deepEqual(fx.validateEffect(desc),[]);
});
test('Fury Swipes uses exactly three coins and damage for heads, both owners',()=>{
  for(const side of ['player','opponent']){const h=setup([['Fury Swipes',0]]);try{
    if(side==='opponent'){h.state.sides.opponent.active.cardId=h.a.id;h.state.sides.opponent.active.energy={Colorless:5};}
    attack(h,'Fury Swipes',side);const coin=h.state.log.filter(x=>x.type==='coin').at(-1);
    assert.ok(coin);assert.equal(coin.results.length,3);
    const recipient=h.state.sides[side==='player'?'opponent':'player'].active;
    assert.equal(recipient.damage,coin.heads*10);
  }finally{h.restore();}}
});
test('Slam uses two coins, not a 50 flat damage default',()=>{
  const h=setup([['Slam',0]]);try{attack(h,'Slam');const coin=h.state.log.filter(x=>x.type==='coin').at(-1);assert.equal(coin.results.length,2);assert.equal(h.state.sides.opponent.active.damage,50*coin.heads);}finally{h.restore();}
});
test('Splatter can hit the opponent Active or selected Bench without bench Weakness',()=>{
  for(const target of ['opponentActive','opponentBench']){const h=setup([['Splatter',0]]);try{
    const s=h.state;h.d.weakness='Colorless';h.b.weakness='Colorless';
    const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.target===target);
    assert.ok(action,'Expected '+target+' as a legal target');core.applyAction(s,'player',action);
    if(target==='opponentActive')assert.equal(s.sides.opponent.active.damage,40);
    else {assert.equal(s.sides.opponent.bench.find(p=>p.benchSlot===action.benchIndex).damage,20);assert.equal(s.sides.opponent.active.damage,0);}
  }finally{h.restore();}}
});
test('Agility rolls one coin and grants prevention only on heads',()=>{
  const h=setup([['Agility',30]]);try{
    attack(h,'Agility');const coin=h.state.log.filter(x=>x.type==='coin').at(-1);
    assert.equal(coin.results.length,1);assert.equal(h.state.sides.opponent.active.damage,30);
    assert.equal(!!h.state.sides.player.active.attackGuard,coin.heads);
  }finally{h.restore();}
});
test('Turbo Drive attaches a discarded physical Basic Energy to chosen Bench, never creates one',()=>{
  const h=setup([['Turbo Drive',120]]);try{
    const s=h.state,ss=s.sides.player;
    ss.discard=[ref('sm5-stage13-metal','actual-basic-uid')];ss.energyDiscard={};
    ss.energySupply=['Metal','Metal'];ss.bench=[slot(h.b.id,'benched-target')];ss.bench[0].benchSlot=0;
    attack(h,'Turbo Drive');assert.equal(s.sides.opponent.active.damage,120);
    assert.equal(s.phase,'effectChoice');
    let choices=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');
    assert.ok(choices.every(x=>x.choiceTarget==='bench'||x.choiceSkip),'Only benched targets are legal');
    choose(h,choices.findIndex(x=>x.choiceTarget==='bench'));
    assert.equal(s.phase,'effectChoice');choose(h,0);
    assert.equal(ss.bench[0].energy.Metal,1);assert.equal(ss.discard.length,0);
    assert.equal(ss.energySupply.length,2);
    assert.ok(s.log.some(x=>x.type==='sm5TurboDrive'&&x.uid==='actual-basic-uid'));
  }finally{h.restore();}
});
test('Turbo Drive can use the discarded Basic Energy ledger without dipping into the Zone',()=>{
  const h=setup([['Turbo Drive',120]]);try{
    const s=h.state,p=s.sides.player;p.discard=[];p.energyDiscard={Water:1};p.energySupply=['Water','Water'];
    attack(h,'Turbo Drive');choose(h,0);choose(h,0);
    assert.equal(p.bench[0].energy.Water,1);assert.equal(p.energyDiscard.Water,0);assert.equal(p.energySupply.length,2);
  }finally{h.restore();}
});
test('Turbo Drive never invents an Energy if only fresh Zone supply exists',()=>{
  const h=setup([['Turbo Drive',120]]);try{
    const p=h.state.sides.player;p.discard=[];p.energyDiscard={};p.energySupply=['Water','Metal'];
    attack(h,'Turbo Drive');assert.equal(h.state.phase,'battle');assert.deepEqual(p.bench[0].energy,{});
    assert.equal(h.state.sides.opponent.active.damage,120);
  }finally{h.restore();}
});
test('Turbo Drive CPU can choose its Bench and discarded energy',()=>{
  const h=setup([['Turbo Drive',120]]);try{
    const s=h.state,o=s.sides.opponent;
    o.active.cardId=h.a.id;o.active.energy={Colorless:5};o.discard=[ref('sm5-stage13-metal','cpu-basic')];
    attack(h,'Turbo Drive','opponent');assert.equal(s.phase,'effectChoice');
    choose(h,0);choose(h,0);
    assert.equal(o.bench[0].energy.Metal,1);assert.ok(s.log.some(x=>x.type==='sm5TurboDrive'&&x.uid==='cpu-basic'));
  }finally{h.restore();}
});
test('Fast Raid is allowed first turn when going first; other SM5 attacks stay restricted',()=>{
  const h=setup([['Fast Raid',30],['Fury Swipes',0]],[],{id:'sm5-140'});try{
    const s=h.state,p=s.sides.player;s.firstSide='player';s.activeSide='player';s.turnNumber=1;p.turnCount=1;
    const legal=core.legalActions(s,'player').filter(x=>x.type==='attack');
    assert.ok(legal.some(x=>x.attackIndex===0),'Fast Raid must be offered');
    assert.ok(!legal.some(x=>x.attackIndex===1),'Normal SM5 attack must not be offered');
    core.applyAction(s,'player',legal[0]);assert.equal(s.sides.opponent.active.damage,30);
  }finally{h.restore();}
});
test('Second player can attack with normal SM5 moves on its first turn',()=>{
  const h=setup([['Fury Swipes',0]],[],{id:'sm5-21'});try{
    const s=h.state,o=s.sides.opponent;o.active.cardId=h.a.id;o.active.energy={Colorless:5};
    s.firstSide='player';s.activeSide='opponent';s.turnNumber=2;o.turnCount=1;
    assert.ok(core.legalActions(s,'opponent').some(x=>x.type==='attack'));
  }finally{h.restore();}
});
test('Mismatched printed text remains gated rather than silently becoming a similar effect',()=>{
  const result=JSON.parse(require('node:child_process').execFileSync('python3',['-c',"import sys,json;sys.path.insert(0,'scripts');import sm5_stage13_verified as v;print(json.dumps([v.attack(None,['Fast Raid',[],'30','Fast raid can be used whenever']),v.attack(None,['Turbo Drive',[],'120','Attach from Zone instead of discard'])]))"],{cwd:root,encoding:'utf8'}));
  assert.deepEqual(result,[null,null]);
});
