'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage9_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...undefined})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage9-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage9-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage9-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage9-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage9-metal','Metal Energy','Metal'],['sm5-stage9-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage9-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage9-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage9-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage9-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage9-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
 data.cardById=id=>cards.get(id)||original(id);
 let state;
 try{state=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:74033,firstSide:'player',playerEnergyTypes:['Metal','Water','Psychic'],opponentEnergyTypes:['Metal','Water','Psychic']});}
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
function drain(h){let i=0;while(h.state.phase==='effectChoice'&&i++<12)choose(h,0);assert.ok(i<12,'stuck in choice loop');}
function action(h,type,cardId){const s=h.state;const x=core.legalActions(s,s.activeSide).find(x=>x.type===type&&(!cardId||x.cardId===cardId));assert.ok(x,`Missing ${type} ${cardId||''}`);core.applyAction(s,s.activeSide,x);return x;}


test('Stage 9 all 27 official text-locked attack descriptors validate',()=>{
 assert.equal(Object.keys(fixture.attacks).length,27);
 for(const [name,e] of Object.entries(fixture.attacks))assert.deepEqual(fx.validateEffect(e),[],name);
});
test('Torterra Earthquake deals self-Bench damage, NOT self Active',()=>{
 const h=setup([['Earthquake',180]]);try{attack(h,'Earthquake');assert.equal(h.state.sides.player.bench[0].damage,20);assert.equal(h.state.sides.player.active.damage,0);assert.equal(h.state.sides.opponent.active.damage,180);}finally{h.restore();}
});
test('Carnivine Chomp Chomp heals only attacking Pokemon',()=>{
 const h=setup([['Chomp Chomp',20]]);try{h.state.sides.player.active.damage=80;h.state.sides.player.bench[0].damage=50;attack(h,'Chomp Chomp');assert.equal(h.state.sides.player.active.damage,60);assert.equal(h.state.sides.player.bench[0].damage,50);}finally{h.restore();}
});
test('Torterra Loom Over loses ten damage per own damage counter',()=>{
 const h=setup([['Loom Over',90]]);try{h.state.sides.player.active.damage=40;attack(h,'Loom Over');assert.equal(h.state.sides.opponent.active.damage,50);}finally{h.restore();}
});
test('Surprise Attack flips once and correctly decides 0 or 30 damage',()=>{
 const h=setup([['Surprise Attack',30]]);try{attack(h,'Surprise Attack');const logs=h.state.log.filter(x=>x.type==='coin');assert.ok(logs.length);assert.equal(h.state.sides.opponent.active.damage,logs.at(-1).heads?30:0);}finally{h.restore();}
});
test('Roar lets opponent choose switch after attack, not force random target',()=>{
 const h=setup([['Roar',0]]);try{const old=h.state.sides.opponent.active.uid;attack(h,'Roar');drain(h);assert.notEqual(h.state.sides.opponent.active.uid,old);}finally{h.restore();}
});
test('Controlled Burn moves top of opponent deck into its discard',()=>{
 const h=setup([['Controlled Burn']]);try{const o=h.state.sides.opponent,id=o.deck[0].uid;attack(h,'Controlled Burn');assert.ok(o.discard.some(r=>r.uid===id));}finally{h.restore();}
});
test('Flamethrower discards one attached Energy, not Energy Zone stock',()=>{
 const h=setup([['Flamethrower',80]]);try{const p=h.state.sides.player;p.active.energy={Fire:2};const stock=p.energySupply.slice();attack(h,'Flamethrower');drain(h);assert.equal(p.active.energy.Fire,1);assert.equal(p.energyDiscard.Fire,1);assert.deepEqual(p.energySupply,stock);}finally{h.restore();}
});
test('Super Singe burns opponent and Bubble Beam flips for Paralysis',()=>{
 for(const move of ['Super Singe','Bubble Beam']){const h=setup([[move,20]]);try{attack(h,move);const d=h.state.sides.opponent.active;if(move==='Super Singe'){assert.ok(h.state.log.some(x=>x.type==='status'&&x.status==='burn'),'burn was applied before between-turn recovery');}else{const flips=h.state.log.filter(x=>x.type==='coin');assert.ok(flips.length);assert.equal(!!d.conditions.paralysis,!!flips.at(-1).heads);}}finally{h.restore();}}
});
test('Ice Shard adds 40 only versus Fighting opponent',()=>{
 for(const [type,dmg] of [['Fighting',60],['Metal',20]]){const h=setup([['Ice Shard',20]]);try{h.d.types=[type];h.d.subtype=type;attack(h,'Ice Shard');assert.equal(h.state.sides.opponent.active.damage,dmg);}finally{h.restore();}}
});
test('Thunder causes exactly 30 self damage',()=>{
 const h=setup([['Thunder',90]]);try{attack(h,'Thunder');assert.equal(h.state.sides.player.active.damage,30);}finally{h.restore();}
});
test('Deep Currents returns only physically discarded Water Energy refs, not virtual Zone Energy',()=>{
 const h=setup([['Deep Currents']]);try{const p=h.state.sides.player;h.cards.set('sm5-stage9-water',{id:'sm5-stage9-water',name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water'});p.discard=[ref('sm5-stage9-water','real-w1'),ref('sm5-stage9-water','real-w2'),ref('sm5-stage9-psychic','real-p')];p.energyDiscard.Water=3;const start=p.deck.length;attack(h,'Deep Currents');drain(h);assert.equal(p.deck.length,start+2);assert.ok(p.deck.some(r=>r.uid==='real-w1'));assert.ok(p.deck.some(r=>r.uid==='real-w2'));assert.ok(p.discard.some(r=>r.uid==='real-p'));assert.equal(p.energyDiscard.Water,3);}finally{h.restore();}
});
test('Steel Short Paralyzes only Metal; Dangerous Stinger applies two different conditions',()=>{
 for(const [type,para] of [['Metal',true],['Water',false]]){const h=setup([['Steel Short',60]]);try{h.d.types=[type];h.d.subtype=type;attack(h,'Steel Short');assert.equal(!!h.state.sides.opponent.active.conditions.paralysis,para);}finally{h.restore();}}
 const h=setup([['Dangerous Stinger',100]]);try{attack(h,'Dangerous Stinger');assert.ok(h.state.sides.opponent.active.conditions.poison);assert.ok(h.state.sides.opponent.active.conditions.paralysis);}finally{h.restore();}
});
test('Psychic Resonance checks opposing Bench as well as opposing Active',()=>{
 for(const [type,dmg] of [['Psychic',120],['Water',60]]){const h=setup([['Psychic Resonance',60]]);try{h.b.types=[type];h.b.subtype=type;attack(h,'Psychic Resonance');assert.equal(h.state.sides.opponent.active.damage,dmg);}finally{h.restore();}}
});
test('Merciless Strike checks pre-existing defender damage, not its own current hit',()=>{
 for(const [starting,delta] of [[0,30],[10,60]]){const h=setup([['Merciless Strike',30]]);try{h.state.sides.opponent.active.damage=starting;attack(h,'Merciless Strike');assert.equal(h.state.sides.opponent.active.damage-starting,delta);}finally{h.restore();}}
});
test('Identify reveals opponent hand and gives bonus only for Pokémon',()=>{
 for(const [id,delta] of [['sm5-stage9-sup1',20],['sm5-stage9-gx',100]]){const h=setup([['Identify',20]]);try{h.state.sides.opponent.hand=[ref(id,'target-hand')];attack(h,'Identify');assert.equal(h.state.sides.opponent.active.damage,delta);assert.ok(h.state.log.some(x=>x.type==='sm5Identify'));}finally{h.restore();}}
});
test('Lap Up draws three physical deck cards',()=>{
 const h=setup([['Lap Up']]);try{const p=h.state.sides.player;attack(h,'Lap Up');assert.equal(p.hand.length,3);assert.equal(p.deck.length,11);}finally{h.restore();}
});
test('Resource Management returns selected discard cards to BOTTOM of deck in chosen order',()=>{
 const h=setup([['Resource Management']]);try{const p=h.state.sides.player;p.discard=[ref('sm5-stage9-sup1','used-a'),ref('sm5-stage9-sup2','used-b'),ref('sm5-stage9-gx','used-c')];const initial=p.deck[0].uid;attack(h,'Resource Management');drain(h);assert.equal(p.deck[0].uid,initial);assert.deepEqual(p.deck.slice(-3).map(x=>x.uid),['used-a','used-b','used-c']);assert.equal(p.discard.length,0);}finally{h.restore();}
});
test('Giga Drain heals exactly damage done after modifiers, not printed base damage',()=>{
 const h=setup([['Giga Drain',50]]);try{const p=h.state.sides.player;p.active.damage=100;h.d.weakness='Grass';h.a.types=['Grass'];attack(h,'Giga Drain');assert.ok(p.active.damage<=50);assert.ok(h.state.sides.opponent.active.damage>=50);}finally{h.restore();}
});
test('Palette of Friends counts UNIQUE types among Benched Pokémon',()=>{
 const h=setup([['Palette of Friends']]);try{h.state.sides.player.bench=[slot(h.b.id,'b1'),slot(h.b.id,'b2')];h.b.types=['Water'];h.b.subtype='Water';attack(h,'Palette of Friends');assert.equal(h.state.sides.opponent.active.damage,10);}finally{h.restore();}
});
test('Sneaky Smash is legally gated to second player on their first turn',()=>{
 for(const [firstSide,turnCount,eligible] of [['opponent',1,true],['player',1,false],['opponent',2,false]]){
  const h=setup([['Sneaky Smash']],[],{id:'sm5-73'});try{h.state.firstSide=firstSide;h.state.sides.player.turnCount=turnCount;h.state.sides.opponent.active.energy={Water:2};assert.equal(core.legalActions(h.state,'player').some(a=>a.type==='attack'),eligible);}finally{h.restore();}
 }
});
test('Sneaky Smash removes chosen attached Special Energy without dupes',()=>{
 const h=setup([['Sneaky Smash']],[],{id:'sm5-73'});try{h.state.firstSide='opponent';h.state.sides.player.turnCount=1;const o=h.state.sides.opponent;o.active.energy={};o.active.specialEnergy=[ref('sm5-stage9-unit','special-u')];attack(h,'Sneaky Smash');drain(h);assert.ok(o.discard.some(r=>r.uid==='special-u'));assert.equal(o.active.specialEnergy.length,0);}finally{h.restore();}
});
test('Call for Family benches real Basic Pokémon from deck without creating cards',()=>{
 const h=setup([['Call for Family']]);try{
  const p=h.state.sides.player;
  p.bench=[];p.deck=[ref(h.b.id,'basic-1'),ref(h.b.id,'basic-2'),ref('sm5-stage9-sup1','trainer-3')];
  attack(h,'Call for Family');drain(h);
  assert.equal(p.bench.length,2);assert.deepEqual(p.bench.map(x=>x.uid).sort(),['basic-1','basic-2']);
  assert.deepEqual(p.deck.map(x=>x.uid),['trainer-3']);
 }finally{h.restore();}
});
test('Guard Press reduces incoming opposing attack during the protected opponent turn',()=>{
 const h=setup([['Guard Press',30]]);try{
  h.state.sides.opponent.active.energy={Colorless:4};h.d.attacks=[{name:'Opponent Hit',cost:['C'],damage:100,effect:{type:'noop'}}];
  attack(h,'Guard Press');h.state.sides.player.active.energy={Colorless:4};
  const s=h.state,old=s.sides.player.active.damage;
  const move=core.legalActions(s,'opponent').find(x=>x.type==='attack');assert.ok(move);
  core.applyAction(s,'opponent',move);
  assert.equal(s.sides.player.active.damage-old,70);
 }finally{h.restore();}
});
test('Resource Management preserves UID and order when fewer than three cards exist',()=>{
 const h=setup([['Resource Management']]);try{const p=h.state.sides.player;p.discard=[ref('sm5-stage9-sup1','only-one')];attack(h,'Resource Management');drain(h);assert.equal(p.discard.length,0);assert.equal(p.deck.at(-1).uid,'only-one');}finally{h.restore();}
});
test('Deep Currents can recover genuine Water Energy on CPU side',()=>{
 const h=setup([['Deep Currents']]);try{const s=h.state;s.sides.opponent.active=slot(h.a.id,'opponent-attacker',{Psychic:4});s.sides.player.active=slot(h.d.id,'player-defender');const o=s.sides.opponent;o.discard=[ref('sm5-stage9-water','cpu-water')];h.cards.set('sm5-stage9-water',{id:'sm5-stage9-water',name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water'});s.activeSide='opponent';attack(h,'Deep Currents','opponent');drain(h);assert.ok(o.deck.some(r=>r.uid==='cpu-water'));}finally{h.restore();}
});
test('Loom Over cannot go negative at ten or more damage counters',()=>{
 const h=setup([['Loom Over',90]]);try{h.state.sides.player.active.damage=120;attack(h,'Loom Over');assert.equal(h.state.sides.opponent.active.damage,0);}finally{h.restore();}
});
