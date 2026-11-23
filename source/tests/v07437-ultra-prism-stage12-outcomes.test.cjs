'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage12_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[n]})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage12-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage12-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage12-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage12-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage12-metal','Metal Energy','Metal'],['sm5-stage12-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage12-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage12-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage12-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage12-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage12-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
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



test('Stage 12 descriptors are pinned and validated, with no placeholder effects',()=>{
 assert.equal(Object.keys(fixture.attacks).length,2);
 assert.equal(Object.keys(fixture.abilities).length,1);
 assert.equal(Object.keys(fixture.trainers).length,1);
 for(const e of [...Object.values(fixture.attacks),...Object.values(fixture.abilities).map(a=>a.effect),...Object.values(fixture.trainers)])
   assert.deepEqual(fx.validateEffect(e),[]);
});
test('Volt Bolt attacks chosen Active and discards only Lightning Energy',()=>{
 const h=setup([['Volt Bolt',0]]);try{
  const s=h.state,p=s.sides.player;p.active.energy={Lightning:2,Metal:2};
  const actions=core.legalActions(s,'player').filter(a=>a.type==='attack');
  assert.ok(actions.some(a=>a.target==='opponentActive'||a.target===undefined));
  attack(h,'Volt Bolt');
  assert.equal(s.sides.opponent.active.damage,150);
  assert.equal(p.active.energy.Lightning,0);assert.equal(p.active.energy.Metal,2);
  assert.equal(p.energyDiscard.Lightning,2);
 }finally{h.restore();}
});
test('Volt Bolt can select opposing Bench and preserves attached Special Energy card identities',()=>{
 const h=setup([['Volt Bolt',0]]);try{
  const s=h.state,p=s.sides.player,o=s.sides.opponent;
  const id='sm5-stage12-lightning-unit';h.cards.set(id,{id,kind:'energy',name:'Unit Energy LPM',specialEnergy:true,effect:{type:'specialEnergy',provides:{Lightning:1,Psychic:1,Metal:1}}});
  p.active.energy={Lightning:1,Metal:2};p.active.specialEnergy=[ref(id,'special-lpm')];
  const moves=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.target==='opponentBench');assert.ok(moves.length,'Benched opponent targets must be offered');
  const action=moves[0];core.applyAction(s,'player',action);
  assert.equal(o.bench.find(x=>Number(x.benchSlot)===Number(action.benchIndex)).damage,150);
  assert.equal(p.active.energy.Lightning,0);assert.equal(p.active.energy.Metal,2);
  assert.equal(p.active.specialEnergy.length,0);assert.ok(p.discard.some(x=>x.uid==='special-lpm'));
 }finally{h.restore();}
});
test('Exeggutor\'s Paradise evolves two eligible Benched Exeggcute using chosen physical deck refs',()=>{
 const h=setup([["Exeggutor's Paradise",0]]);try{
  const s=h.state,p=s.sides.player;
  h.cards.set('sm5-stage12-egg',{id:'sm5-stage12-egg',name:'Exeggcute',kind:'pokemon',battleEnabled:true,stage:'Basic',types:['Grass']});
  h.cards.set('sm5-stage12-alolan',{id:'sm5-stage12-alolan',name:'Alolan Exeggutor',kind:'pokemon',battleEnabled:true,stage:'Stage 1',evolvesFrom:'Exeggcute'});
  h.cards.set('sm5-stage12-alolan-gx',{id:'sm5-stage12-alolan-gx',name:'Alolan Exeggutor-GX',kind:'pokemon',battleEnabled:true,stage:'Stage 1',evolvesFrom:'Exeggcute'});
  p.bench=[slot('sm5-stage12-egg','egg1'),slot('sm5-stage12-egg','egg2')];p.bench.forEach((x,i)=>x.benchSlot=i);
  p.deck=[ref('sm5-stage12-alolan','evo1'),ref('sm5-stage12-alolan-gx','evo2')];
  attack(h,"Exeggutor's Paradise");
  assert.equal(s.phase,'effectChoice');choose(h,0);assert.equal(p.bench[0].cardId,'sm5-stage12-alolan');
  assert.equal(s.phase,'effectChoice');choose(h,0);assert.equal(p.bench[1].cardId,'sm5-stage12-alolan-gx');
  assert.equal(p.deck.length,0);assert.ok(s.log.some(x=>x.type==='sm5ExeggutorsParadise'&&x.uid==='evo2'));
 }finally{h.restore();}
});
test('Exeggutor\'s Paradise never evolves unrelated Basic Pokémon or duplicates deck cards',()=>{
 const h=setup([["Exeggutor's Paradise",0]]);try{
  const s=h.state,p=s.sides.player;
  h.cards.set('sm5-stage12-egg',{id:'sm5-stage12-egg',name:'Exeggcute',kind:'pokemon',stage:'Basic'});
  h.cards.set('sm5-stage12-ordinary',{id:'sm5-stage12-ordinary',name:'Exeggutor',kind:'pokemon',stage:'Stage 1',evolvesFrom:'Exeggcute'});
  p.bench=[slot('sm5-stage12-egg','egg1'),slot(h.b.id,'other')];p.bench.forEach((x,i)=>x.benchSlot=i);
  p.deck=[ref('sm5-stage12-ordinary','wrong-evo')];
  attack(h,"Exeggutor's Paradise");assert.equal(s.phase,'battle');assert.equal(p.bench[0].cardId,'sm5-stage12-egg');
  assert.equal(p.deck[0].uid,'wrong-evo');
 }finally{h.restore();}
});
function clover(h){const id='sm5-129';h.cards.set(id,{id,name:'Missing Clover',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:fixture.trainers['Missing Clover']});return id;}
test('One Missing Clover shows the actual top card but does not move it',()=>{
 const h=setup();try{
  const id=clover(h),s=h.state,p=s.sides.player;p.hand=[ref(id,'clover1')];p.deck=[ref('sm5-stage12-d','deck-top')];
  const m=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId===id);
  assert.equal(m.length,1);assert.equal(m[0].effectSelection,'one');core.applyAction(s,'player',m[0]);
  assert.equal(p.discard.length,1);assert.equal(p.discard[0].uid,'clover1');assert.equal(p.deck[0].uid,'deck-top');
  assert.ok(s.log.some(x=>x.type==='inspectTop'&&x.cards[0]==='sm5-stage12-d'));
  assert.equal(p.prizesTaken,0);
 }finally{h.restore();}
});
test('Four Missing Clover copies are spent together, and award one selected Prize',()=>{
 const h=setup();try{
  const id=clover(h),s=h.state,p=s.sides.player;
  p.hand=Array.from({length:4},(_,i)=>ref(id,'clover'+i));p.prizes=[ref('sm5-stage12-d','prize-a'),ref('sm5-stage12-b','prize-b')];
  const m=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId===id);
  assert.ok(m.some(a=>a.effectSelection==='four'));
  core.applyAction(s,'player',m.find(a=>a.effectSelection==='four'));
  assert.deepEqual(new Set(p.discard.map(r=>r.uid)),new Set(['clover0','clover1','clover2','clover3']));
  assert.equal(p.hand.length,0);assert.equal(s.phase,'effectChoice');
  assert.equal(s.pendingChoice.kind,'prizeCard');choose(h,1);
  assert.equal(p.prizesTaken,1);assert.ok(p.hand.some(r=>r.uid==='prize-b'));
  assert.equal(p.prizes.length,1);
 }finally{h.restore();}
});
test('Three Missing Clover copies cannot be submitted as a four-card action',()=>{
 const h=setup();try{
  const id=clover(h),s=h.state,p=s.sides.player;p.hand=Array.from({length:3},(_,i)=>ref(id,'clover'+i));
  assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId===id&&a.effectSelection==='four'));
 }finally{h.restore();}
});
test('Flaming Fighter increases only opposing burn damage, without stacking multiple Infernape',()=>{
 for(const copies of [1,2]){const h=setup();try{
  const s=h.state,p=s.sides.player,o=s.sides.opponent;
  h.cards.set('sm5-23',{id:'sm5-23',name:'Infernape',kind:'pokemon',stage:'Stage 2',hp:150,types:['Fire'],abilities:[{name:'Flaming Fighter',...fixture.abilities['Flaming Fighter']}],battleEnabled:true});
  p.bench=Array.from({length:copies},(_,i)=>slot('sm5-23','inferno'+i));p.bench.forEach((x,i)=>x.benchSlot=i);
  o.active.conditions={burn:true};p.active.conditions={burn:true};
  const foeBefore=o.active.damage,selfBefore=p.active.damage;
  core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='endTurn'));
  assert.equal(o.active.damage-foeBefore,60);assert.equal(p.active.damage-selfBefore,20);
 }finally{h.restore();}}
});
test('Flaming Fighter has no effect when Infernape is not in play',()=>{
 const h=setup();try{const s=h.state;s.sides.opponent.active.conditions={burn:true};
  core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='endTurn'));
  assert.equal(s.sides.opponent.active.damage,20);
 }finally{h.restore();}
});
test('Stage 12 printed rule mismatches are gated, including alternate print Trainers',()=>{
 const h=setup();try{
  const out=JSON.parse(execFileSync('python3',['-c',"import sys,json;sys.path.insert(0,'scripts');import sm5_stage12_verified as v;print(json.dumps([v.attack(None,['Volt Bolt',[],'','wrong']),v.ability(None,['Flaming Fighter','Ability','wrong']),v.trainer(['999','Missing Clover','Trainer',['Item'],None,[],None,[],[],None,None,0,'', ['wrong']])]))"],{cwd:root,encoding:'utf8'}));
  assert.deepEqual(out,[null,null,null]);
 }finally{h.restore();}
});

test('CPU can play four Missing Clover and takes one actual Prize automatically',()=>{
 const h=setup();try{
  const id=clover(h),s=h.state,o=s.sides.opponent;s.activeSide='opponent';
  o.hand=Array.from({length:4},(_,i)=>ref(id,'cpu-clover'+i));
  o.prizes=[ref('sm5-stage12-d','cpu-prize1'),ref('sm5-stage12-d','cpu-prize2')];
  const move=core.legalActions(s,'opponent').find(a=>a.type==='trainer'&&a.cardId===id&&a.effectSelection==='four');
  assert.ok(move);core.applyAction(s,'opponent',move);
  assert.equal(o.prizes.length,1);assert.equal(o.prizesTaken,1);assert.equal(o.discard.filter(x=>x.cardId===id).length,4);
  assert.equal(o.hand.length,1);assert.ok(o.hand[0].uid.startsWith('cpu-prize'));
  assert.equal(s.phase,'battle');
 }finally{h.restore();}
});
test('Missing Clover can take the last Prize and triggers the normal win result',()=>{
 const h=setup();try{
  const id=clover(h),s=h.state,p=s.sides.player;p.hand=Array.from({length:4},(_,i)=>ref(id,'last-clover'+i));
  p.prizes=[ref('sm5-stage12-d','last-prize')];p.prizesTaken=4;
  const move=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===id&&a.effectSelection==='four');
  core.applyAction(s,'player',move);assert.equal(s.phase,'effectChoice');choose(h,0);
  assert.equal(p.prizesTaken,5);assert.equal(s.winner,'player');
 }finally{h.restore();}
});
test('Flaming Fighter is ignored when a blocking Ability effect is active',()=>{
 const h=setup();try{
  const s=h.state,p=s.sides.player,o=s.sides.opponent;
  h.cards.set('sm5-23',{id:'sm5-23',name:'Infernape',kind:'pokemon',stage:'Stage 2',types:['Fire'],abilities:[{name:'Flaming Fighter',...fixture.abilities['Flaming Fighter']}],battleEnabled:true});
  p.bench=[slot('sm5-23','inferno')];p.bench[0].benchSlot=0;o.active.conditions={burn:true};
  s.xy7HexManiacUntil=s.turnNumber+1;
  core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='endTurn'));
  assert.equal(o.active.damage,20);
 }finally{h.restore();}
});
test('Exeggutor\'s Paradise supports skipping one egg while evolving the next',()=>{
 const h=setup([["Exeggutor's Paradise",0]]);try{
  const s=h.state,p=s.sides.player;
  h.cards.set('sm5-stage12-egg',{id:'sm5-stage12-egg',name:'Exeggcute',kind:'pokemon',stage:'Basic'});
  h.cards.set('sm5-stage12-alolan',{id:'sm5-stage12-alolan',name:'Alolan Exeggutor',kind:'pokemon',stage:'Stage 1',evolvesFrom:'Exeggcute',battleEnabled:true});
  p.bench=[slot('sm5-stage12-egg','egg1'),slot('sm5-stage12-egg','egg2')];p.bench.forEach((x,i)=>x.benchSlot=i);
  p.deck=[ref('sm5-stage12-alolan','single-evo')];attack(h,"Exeggutor's Paradise");
  const offered=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');choose(h,offered.length-1);
  assert.equal(p.bench[0].cardId,'sm5-stage12-egg');assert.equal(s.phase,'effectChoice');
  choose(h,0);assert.equal(p.bench[1].cardId,'sm5-stage12-alolan');assert.equal(p.deck.length,0);
 }finally{h.restore();}
});
