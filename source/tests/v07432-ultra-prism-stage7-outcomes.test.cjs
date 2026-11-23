'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage7_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[n]})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage7-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage7-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage7-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage7-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage7-metal','Metal Energy','Metal'],['sm5-stage7-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage7-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage7-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage7-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage7-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage7-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
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
function drain(h){let i=0;while(h.state.phase==='effectChoice'&&i++<12)choose(h,0);assert.ok(i<12,'stuck in choice loop');}
function action(h,type,cardId){const s=h.state;const x=core.legalActions(s,s.activeSide).find(x=>x.type===type&&(!cardId||x.cardId===cardId));assert.ok(x,`Missing ${type} ${cardId||''}`);core.applyAction(s,s.activeSide,x);return x;}

test('Stage 7 new descriptors validate against battle schema',()=>{
 assert.deepEqual([Object.keys(fixture.attacks).length,Object.keys(fixture.trainers).length],[13,1]);
 for(const [name,e] of Object.entries(fixture.attacks))assert.deepEqual(fx.validateEffect(e),[],name);
 for(const [name,entry] of Object.entries(fixture.trainers))assert.deepEqual(fx.validateEffect(entry[1]),[],name);
});
test('Quick Dive deals 50 to CHOSEN opposing Pokemon, no double Active damage',()=>{
 const h=setup([['Quick Dive']]);try{attack(h,'Quick Dive');drain(h);const total=h.state.sides.opponent.active.damage+h.state.sides.opponent.bench.reduce((n,p)=>n+p.damage,0);assert.equal(total,50);}finally{h.restore();}
});
test('Psywave counts opposing attached Energy not attacker Energy or Zone',()=>{
 const h=setup([['Psywave']]);try{h.state.sides.opponent.active.energy={Water:3};h.state.sides.opponent.energySupply=['Metal','Metal'];attack(h,'Psywave');assert.equal(h.state.sides.opponent.active.damage,60);}finally{h.restore();}
});
test('Rumbling Wires mills opposing physical top card, preserves UID',()=>{
 const h=setup([['Rumbling Wires',100]]);try{const o=h.state.sides.opponent,top=o.deck[0];attack(h,'Rumbling Wires');assert.equal(o.discard.some(r=>r.uid===top.uid),true);assert.equal(o.deck.some(r=>r.uid===top.uid),false);assert.equal(o.discard.filter(r=>r.uid===top.uid).length,1);}finally{h.restore();}
});
test('Dragon Pulse mills exactly two own cards',()=>{
 const h=setup([['Dragon Pulse',100]]);try{const p=h.state.sides.player,top=p.deck.slice(0,2).map(r=>r.uid);attack(h,'Dragon Pulse');assert.equal(p.deck.length,12);assert.equal(p.discard.filter(r=>top.includes(r.uid)).length,2);}finally{h.restore();}
});
test('Rocket Fall counts defender retreat cost, not own retreat',()=>{
 const h=setup([['Rocket Fall',30]]);try{h.state.sides.opponent.active.cardId=h.b.id;attack(h,'Rocket Fall');assert.equal(h.state.sides.opponent.active.damage,120);}finally{h.restore();}
});
test('Evil Admonition counts opposing Pokemon with Abilities only',()=>{
 const h=setup([['Evil Admonition']]);try{h.state.sides.opponent.active.cardId=h.gx.id;h.state.sides.opponent.bench[0].cardId=h.gx.id;attack(h,'Evil Admonition');assert.equal(h.state.sides.opponent.active.damage,100);}finally{h.restore();}
});
test('Spinning Fan damages Active and all opposing Bench for 20 each',()=>{
 const h=setup([['Spinning Fan']]);try{attack(h,'Spinning Fan');assert.equal(h.state.sides.opponent.active.damage,20);assert.deepEqual(h.state.sides.opponent.bench.map(p=>p.damage),[20,20]);}finally{h.restore();}
});
test('Toss Aside discards RANDOM opponent hand references down to 3',()=>{
 const h=setup([['Toss Aside',60]]);try{const o=h.state.sides.opponent;o.hand=Array.from({length:6},(_,i)=>ref('sm5-stage7-sup1','hand-'+i));const uids=o.hand.map(r=>r.uid);attack(h,'Toss Aside');assert.equal(o.discard.filter(r=>uids.includes(r.uid)).length,3);assert.equal(o.hand.filter(r=>uids.includes(r.uid)).length,3);}finally{h.restore();}
});
test('Swagger only removes enemy Energy on heads, not our Energy',()=>{
 const h=setup([['Swagger',10]]);try{h.state.sides.opponent.active.energy={Water:2};attack(h,'Swagger');drain(h);assert.ok([1,2].includes(h.state.sides.opponent.active.energy.Water));assert.equal(h.state.sides.player.active.energy.Grass,5);}finally{h.restore();}
});
test('Lunar Payback consumes 1 Energy then swaps damage counters',()=>{
 const h=setup([['Lunar Payback']]);try{const p=h.state.sides.player.active,o=h.state.sides.opponent.active;p.damage=90;o.damage=40;const original=p.energy.Grass;attack(h,'Lunar Payback');drain(h);assert.equal(p.damage,40);assert.equal(o.damage,90);assert.equal(p.energy.Grass,original-1);assert.ok(Number(h.state.sides.player.energyDiscard?.Grass||0)>0);}finally{h.restore();}
});
test('Lunar Payback with no Energy does not exchange damage',()=>{
 const h=setup([['Lunar Payback']]);try{const p=h.state.sides.player.active,o=h.state.sides.opponent.active;p.energy={};p.specialEnergy=[];p.damage=90;o.damage=40;assert.ok(!core.legalActions(h.state,'player').some(a=>a.type==='attack'&&a.attackIndex===0),'Energy cost should block impossible attacks');}finally{h.restore();}
});
test('Peeking Red Card asks before hand redraw and preserves hand count',()=>{
 const h=setup();try{const t={id:'sm5-stage7-peek',name:'Peeking Red Card',kind:'trainer',trainerType:'Item',effect:fixture.trainers['Peeking Red Card'][1],battleEnabled:true};h.cards.set(t.id,t);const p=h.state.sides.player,o=h.state.sides.opponent;p.hand=[ref(t.id,'peek')];o.hand=Array.from({length:4},(_,i)=>ref('sm5-stage7-sup1','opp-'+i));const before=new Set(o.hand.map(r=>r.uid));action(h,'trainer',t.id);assert.ok(h.state.log.some(x=>x.type==='revealHand'),'must reveal their hand even when the user declines a redraw');assert.equal(h.state.phase,'effectChoice');choose(h,0);drain(h);assert.equal(o.hand.length,4);assert.ok(o.hand.some(r=>!before.has(r.uid)),'hand should have been replaced from the deck');}finally{h.restore();}
});

test('Rip and Run discards one RANDOM opponent hand card and switches own attacker',()=>{
 const h=setup([['Rip and Run']]);try{const o=h.state.sides.opponent;o.hand=[ref('sm5-stage7-sup1','one'),ref('sm5-stage7-sup1','two')];attack(h,'Rip and Run');drain(h);assert.equal(o.discard.filter(r=>['one','two'].includes(r.uid)).length,1);assert.equal(h.state.sides.player.active.uid,'pb');}finally{h.restore();}
});
test('Wind Wheel forces defending player to choose their new Active',()=>{
 const h=setup([['Wind Wheel',80]]);try{attack(h,'Wind Wheel');drain(h);assert.notEqual(h.state.sides.opponent.active.uid,'oa');}finally{h.restore();}
});
test('Damage Transport moves up to four counters from EACH own Pokemon',()=>{
 const h=setup([['Damage Transport']]);try{h.state.sides.player.active.damage=60;h.state.sides.player.bench[0].damage=20;attack(h,'Damage Transport');assert.equal(h.state.sides.player.active.damage,20);assert.equal(h.state.sides.player.bench[0].damage,0);assert.equal(h.state.sides.opponent.active.damage,60);}finally{h.restore();}
});
test('Rock Hiding removes only own retreat cost with actual attached Fighting Energy',()=>{
 const h=setup([],['Rock Hiding']);try{const p=h.state.sides.player.active;assert.equal(fx.modifierAmount(h.state,'player',p,'retreatCost',data.cardById),0);p.energy.Fighting=1;assert.ok(fx.modifierAmount(h.state,'player',p,'retreatCost',data.cardById)<-100);assert.equal(fx.modifierAmount(h.state,'player',h.state.sides.player.bench[0],'retreatCost',data.cardById),0);}finally{h.restore();}
});
test('Lunar Payback also works when CPU is the attacker',()=>{
 const h=setup([['Lunar Payback']]);try{
  const player=h.state.sides.player,opp=h.state.sides.opponent;
  player.active=slot(h.d.id,'human',{});player.active.damage=30;
  opp.active=slot(h.a.id,'cpu',{Psychic:2});opp.active.damage=90;
  h.state.activeSide='opponent';h.state.turnNumber=6;
  attack(h,'Lunar Payback','opponent');drain(h);
  assert.equal(opp.active.damage,30);assert.equal(player.active.damage,90);
  assert.equal(opp.active.energy.Psychic,1);
  assert.ok(Number(opp.energyDiscard?.Psychic||0)>=1);
 }finally{h.restore();}
});
test('Peeking Red Card allows decline without replacing opponent hand',()=>{
 const h=setup();try{
  const t={id:'sm5-stage7-peek',name:'Peeking Red Card',kind:'trainer',trainerType:'Item',effect:fixture.trainers['Peeking Red Card'][1],battleEnabled:true};h.cards.set(t.id,t);
  h.state.sides.player.hand=[ref(t.id,'peek2')];
  const opp=h.state.sides.opponent;
  opp.hand=[ref('sm5-stage7-sup1','stillOne'),ref('sm5-stage7-sup2','stillTwo')];
  action(h,'trainer',t.id);choose(h,1);drain(h);
  assert.ok(opp.hand.some(x=>x.uid==='stillOne')&&opp.hand.some(x=>x.uid==='stillTwo'));
  assert.ok(!opp.deck.some(x=>['stillOne','stillTwo'].includes(x.uid)));
 }finally{h.restore();}
});
