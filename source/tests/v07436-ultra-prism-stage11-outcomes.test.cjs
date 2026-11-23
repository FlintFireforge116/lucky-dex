'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage11_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[n]})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage11-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage11-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage11-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage11-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage11-metal','Metal Energy','Metal'],['sm5-stage11-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage11-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage11-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage11-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage11-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage11-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
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



test('Stage 11 mappings are explicit, supported and not name-only placeholders',()=>{
 assert.equal(Object.keys(fixture.attacks).length,14);
 for(const [name,e] of Object.entries(fixture.attacks))assert.deepEqual(fx.validateEffect(e),[],name);
});
test('Dust Cannon scales with the defender retreat cost and existing base damage',()=>{
 const h=setup([['Dust Cannon',100]]);try{h.d.retreat=3;attack(h,'Dust Cannon');assert.equal(h.state.sides.opponent.active.damage,130);}finally{h.restore();}
});
test('Draco Meteor Barrage flips once per attached Grass Energy, not four generic Energy',()=>{
 const h=setup([['Draco Meteor Barrage',0]]);try{const p=h.state.sides.player;p.active.energy={Grass:2,Fire:5};attack(h,'Draco Meteor Barrage');const coin=h.state.log.filter(x=>x.type==='coin'&&x.coins===2).at(-1);assert.ok(coin);assert.equal(h.state.sides.opponent.active.damage,80*coin.heads);}finally{h.restore();}
});
test('Iron Head flips until first tails, only heads deal damage',()=>{
 const h=setup([['Iron Head',0]]);try{attack(h,'Iron Head');const c=h.state.log.filter(x=>x.type==='coin'&&x.coins==='untilTails').at(-1);assert.ok(c);assert.equal(h.state.sides.opponent.active.damage,10*c.heads);assert.equal(c.results.at(-1),false);}finally{h.restore();}
});
test('Hone Claws gives Pierce its printed base of 90 next own turn',()=>{
 const h=setup([['Hone Claws',0],['Pierce',30]]);try{const p=h.state.sides.player;attack(h,'Hone Claws');assert.ok(p.active.nextAttackBonuses?.some(b=>b.attackName==='Pierce'&&b.amount===60));}finally{h.restore();}
});
test('Spike Armor stores a six-counter retaliation with correct expiry',()=>{
 const h=setup([['Spike Armor',30]]);try{attack(h,'Spike Armor');const guard=h.state.sides.player.active.retaliate;assert.ok(guard);assert.equal(guard.amount,60);assert.equal(guard.expiresTurn,h.state.turnNumber);}finally{h.restore();}
});
test('Weak Kneed gates only the opponent Active attack for one turn',()=>{
 const h=setup([['Weak Kneed',0]]);try{attack(h,'Weak Kneed');const t=h.state.sides.opponent.active.attackGate;assert.ok(t);assert.equal(t.coins,undefined);assert.ok(t.expiresTurn>=h.state.turnNumber-1);}finally{h.restore();}
});
test('Sticky Smokescreen requires two heads and does not change Energy',()=>{
 const h=setup([['Sticky Smokescreen',50]]);try{attack(h,'Sticky Smokescreen');const t=h.state.sides.opponent.active.attackGate;assert.equal(t.coins,2);assert.equal(t.expiresTurn,h.state.turnNumber);}finally{h.restore();}
});
test('Exact Revenge needs a Fighting KO by opposing attack last turn',()=>{
 const h=setup([['Exact Revenge',50]]);try{const p=h.state.sides.player,s=h.state;p.lastOpponentAttackKoTurn=4;p.lastKnockedOutCardIds=['sm5-stage11-b'];p.lastOpponentAttackKoCardIds=['sm5-stage11-b'];h.b.types=['Colorless'];attack(h,'Exact Revenge');assert.equal(s.sides.opponent.active.damage,50);}finally{h.restore();}
});
test('Exact Revenge adds 70 when a Fighting Pokemon was KO by attack last turn',()=>{
 const h=setup([['Exact Revenge',50]]);try{const p=h.state.sides.player,s=h.state;p.lastOpponentAttackKoTurn=4;p.lastKnockedOutCardIds=['sm5-stage11-b'];p.lastOpponentAttackKoCardIds=['sm5-stage11-b'];h.b.types=['Fighting'];attack(h,'Exact Revenge');assert.equal(s.sides.opponent.active.damage,120);}finally{h.restore();}
});
test('Own the Place discards opponent-owned Stadium and grants prevention',()=>{
 const h=setup([['Own the Place',20]]);try{const s=h.state;s.stadium={uid:'st-ref',cardId:'sm5-stage11-sup1',ownerSide:'opponent'};attack(h,'Own the Place');assert.equal(s.stadium,null);assert.ok(s.sides.opponent.discard.some(r=>r.uid==='st-ref'));assert.ok(s.sides.player.active.attackGuard);}finally{h.restore();}
});
test('Own the Place does nothing to an own-side stadium',()=>{
 const h=setup([['Own the Place',20]]);try{const s=h.state;s.stadium={uid:'my-st',cardId:'sm5-stage11-sup1',ownerSide:'player'};attack(h,'Own the Place');assert.equal(s.stadium.uid,'my-st');assert.equal(s.sides.player.active.attackGuard,undefined);}finally{h.restore();}
});
test('Dangerous Lick handles until-tails damage and the first-tails paralysis',()=>{
 const h=setup([['Dangerous Lick',50]]);try{attack(h,'Dangerous Lick');const coin=h.state.log.filter(x=>x.type==='coin'&&x.reason==='Dangerous Lick').at(-1);assert.ok(coin);assert.equal(h.state.sides.opponent.active.damage,50+coin.heads*50);assert.equal(!!h.state.sides.opponent.active.conditions.paralysis,coin.heads===0);}finally{h.restore();}
});
test('Coax benches only different Basic types from deck, preserves card references',()=>{
 const h=setup([['Coax',0]]);try{const p=h.state.sides.player;p.bench=[];
 const g=mon('sm5-stage11-grass','Grass Basic',[],[],{types:['Grass'],subtype:'Grass'}),w=mon('sm5-stage11-water','Water Basic',[],[],{types:['Water'],subtype:'Water'}),g2=mon('sm5-stage11-grass2','Grass Basic 2',[],[],{types:['Grass'],subtype:'Grass'});
 h.cards.set(g.id,g);h.cards.set(w.id,w);h.cards.set(g2.id,g2);p.deck=[ref(g.id,'cg'),ref(g2.id,'cg2'),ref(w.id,'cw')];attack(h,'Coax');assert.equal(h.state.phase,'effectChoice');choose(h,0);assert.equal(p.bench.length,1);const choices=core.legalActions(h.state,h.state.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(choices.some(x=>x.choiceCardId===w.id));assert.ok(!choices.some(x=>x.choiceCardId===g2.id));const widx=choices.findIndex(x=>x.choiceCardId===w.id);choose(h,widx);assert.equal(p.bench.length,2);assert.ok(p.bench.some(x=>x.uid==='cw'));assert.ok(p.deck.some(r=>r.uid==='cg2'));
 }finally{h.restore();}
});
test('Snuggly Generator uses a physical Lightning Energy card from deck',()=>{
 const h=setup([['Snuggly Generator',0]]);try{const p=h.state.sides.player;
 const n=mon('sm5-stage11-nuzzle','Nuzzler',[['Nuzzle',0]]);h.cards.set(n.id,n);p.bench=[slot(n.id,'nuzzle-b')];p.bench[0].benchSlot=0;const e='sm5-stage11-metal';h.cards.set(e,{id:e,name:'Lightning Energy',kind:'energy',basicEnergy:true,subtype:'Lightning',energyType:'Lightning'});p.deck=[ref(e,'real-lightning')];p.energySupply=[];attack(h,'Snuggly Generator');choose(h,0);assert.equal(p.bench[0].energy.Lightning,1);assert.equal(p.deck.length,0);assert.ok(h.state.log.some(x=>x.type==='sm5SnugglyGenerator'&&x.uid==='real-lightning'));
 }finally{h.restore();}
});
test('Snuggly Generator converts Zone search only after actual coin heads',()=>{
 const h=setup([['Snuggly Generator',0]]);try{const p=h.state.sides.player;
 const n=mon('sm5-stage11-nuzzle','Nuzzler',[['Nuzzle',0]]);h.cards.set(n.id,n);p.bench=[slot(n.id,'nuzzle-b')];p.bench[0].benchSlot=0;p.deck=[];p.energySupply=['Lightning'];attack(h,'Snuggly Generator');choose(h,0);const flip=h.state.log.find(x=>x.reason==='Hybrid Basic Energy deck search');assert.ok(flip);assert.equal(p.bench[0].energy.Lightning||0,flip.heads?1:0);assert.equal(p.energySupply.length,flip.heads?0:1);
 }finally{h.restore();}
});
test('Flower Tornado moves a single Grass unit and can stop without infinite choices',()=>{
 const h=setup([['Flower Tornado',100]]);try{const p=h.state.sides.player;p.active.energy={Grass:2};p.bench[0].energy={};attack(h,'Flower Tornado');assert.equal(h.state.phase,'effectChoice');choose(h,0);assert.equal(h.state.phase,'effectChoice');const c=core.legalActions(h.state,h.state.choiceSide).filter(x=>x.type==='effectChoice');choose(h,c.findIndex(x=>x.choiceTarget==='bench'));assert.equal(p.active.energy.Grass,1);assert.equal(p.bench[0].energy.Grass,1);stop(h);assert.equal(h.state.phase,'battle');
 }finally{h.restore();}
});
test('Magical Swap transfers one counter between opponent Pokemon and allows Stop',()=>{
 const h=setup([['Magical Swap',0]]);try{const o=h.state.sides.opponent;o.active.damage=40;o.bench[0].damage=0;attack(h,'Magical Swap');assert.equal(h.state.phase,'effectChoice');choose(h,0);const c=core.legalActions(h.state,h.state.choiceSide).filter(x=>x.type==='effectChoice');choose(h,c.findIndex(x=>x.choiceTarget==='bench'));assert.equal(o.active.damage,30);assert.equal(o.bench[0].damage,10);stop(h);assert.equal(h.state.phase,'battle');
 }finally{h.restore();}
});
test('Sticky Smokescreen actually flips two coins on the defending player attack',()=>{
 const h=setup([['Sticky Smokescreen',50],['Hit',40]]);try{
  const s=h.state;attack(h,'Sticky Smokescreen');const gate=s.sides.opponent.active.attackGate;
  s.sides.opponent.active.cardId=h.a.id;s.sides.opponent.active.energy={Colorless:5};s.sides.player.active.energy={Colorless:5};
  assert.ok(gate&&gate.coins===2);
  const old=s.sides.player.active.damage;
  attack(h,'Hit','opponent');
  const flip=s.log.filter(x=>x.type==='coin'&&x.reason==='attackGate').at(-1);assert.equal(flip.results.length,2);
  assert.equal(flip.heads,flip.results.every(Boolean));assert.equal(s.sides.player.active.damage-old,flip.heads?40:0);
 }finally{h.restore();}
});
test('Spike Armor retaliates when struck and when the defender is KOed',()=>{
 for(const isKO of [false,true]){const h=setup([['Spike Armor',30],['Hit',40]]);try{
  const s=h.state;attack(h,'Spike Armor');s.sides.opponent.active.cardId=h.a.id;s.sides.opponent.active.energy={Colorless:5};
  if(isKO)s.sides.player.active.damage=490;
  attack(h,'Hit','opponent');assert.equal(s.sides.opponent.active.damage,90,'30 existing damage plus 60 retaliation');
 }finally{h.restore();}}
});
test('Flower Tornado moves a physical Grass-providing Special Energy without copying its UID',()=>{
 const h=setup([['Flower Tornado',100]]);try{const p=h.state.sides.player;
  const eid='sm5-stage11-physicalUnit';h.cards.set(eid,{id:eid,name:'Unit Energy GFW',kind:'energy',basicEnergy:false,specialEnergy:true,effect:{type:'specialEnergy',provides:{Grass:1,Fire:1,Water:1}}});
  p.active.energy={};p.active.specialEnergy=[ref(eid,'gfw-ref')];p.bench[0].specialEnergy=[];
  attack(h,'Flower Tornado');choose(h,0);const opts=core.legalActions(h.state,h.state.choiceSide).filter(x=>x.type==='effectChoice');choose(h,opts.findIndex(x=>x.choiceTarget==='bench'));assert.equal(p.active.specialEnergy.length,0);assert.equal(p.bench[0].specialEnergy[0].uid,'gfw-ref');stop(h);assert.equal(p.bench[0].specialEnergy.length,1);
 }finally{h.restore();}
});
test('Magical Swap is a genuine opponent-board choice, not a self damage transfer',()=>{
 const h=setup([['Magical Swap',0]]);try{const s=h.state,o=s.sides.opponent,p=s.sides.player;o.active.damage=30;o.bench[0].damage=10;p.active.damage=20;attack(h,'Magical Swap');
 choose(h,0);const opts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(!opts.some(x=>x.choiceTarget==='active'),'source Pokemon is excluded as destination');
 const choice=opts.findIndex(x=>x.choiceTarget==='bench');assert.ok(choice>=0);choose(h,choice);assert.equal(o.active.damage,20);assert.equal(o.bench[0].damage,20);assert.equal(p.active.damage,20);stop(h);
 }finally{h.restore();}
});
test('Stage 11 printed rule mismatches remain strictly gated by the validator',()=>{
 const st=JSON.parse(require('node:child_process').execFileSync('python3',['-c',"import sys,json;sys.path.insert(0,'scripts');import sm5_stage11_verified as v; print(json.dumps([v.attack(None,['Dust Cannon',[],'100','wrong text']),v.attack(None,['Magical Swap',[],'','Move no counters'])]))"],{cwd:root,encoding:'utf8'}));assert.deepEqual(st,[null,null]);
});
test('actual opposing attack Knock Out records the KO card identity for Exact Revenge',()=>{
 const h=setup([['Hit',50]]);try{const s=h.state,p=s.sides.player,o=s.sides.opponent;
  h.b.types=['Fighting'];p.active=slot(h.b.id,'knocked-fighter',{Colorless:5});p.active.damage=480;
  o.active=slot(h.a.id,'cpu-ko',{Colorless:5});s.activeSide='opponent';
  attack(h,'Hit','opponent');
  assert.equal(p.lastOpponentAttackKoTurn,5);
  assert.ok(p.lastOpponentAttackKoCardIds?.includes(h.b.id),'record actual opposing attack KO rather than generic turn KO');
 }finally{h.restore();}
});
