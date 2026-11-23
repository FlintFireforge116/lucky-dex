'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage8_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[n]})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage8-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage8-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage8-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage8-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage8-metal','Metal Energy','Metal'],['sm5-stage8-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage8-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage8-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage8-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage8-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage8-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
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


test('Stage 8 exact mappings all validate (and never use unsupported placeholder)',()=>{
 assert.equal(Object.keys(fixture.attacks).length,9);
 assert.equal(Object.keys(fixture.abilities).length,4);
 assert.equal(Object.keys(fixture.trainers).length,3);
 for(const [name,e] of Object.entries(fixture.attacks))assert.deepEqual(fx.validateEffect(e),[],name);
 for(const [name,e] of Object.entries(fixture.abilities))assert.deepEqual(fx.validateEffect(e.effect),[],name);
 for(const [name,e] of Object.entries(fixture.trainers))assert.deepEqual(fx.validateEffect(e),[],name);
});
test('Empoleon Total Command counts ALL Benched Pokémon, not either Active',()=>{
 const h=setup([['Total Command']]);try{attack(h,'Total Command');assert.equal(h.state.sides.opponent.active.damage,60);}finally{h.restore();}
});
test('Empoleon Whirlpool removes exactly one opposing attached Energy',()=>{
 const h=setup([['Whirlpool',90]]);try{h.state.sides.opponent.active.energy={Water:3};attack(h,'Whirlpool');drain(h);assert.equal(h.state.sides.opponent.active.energy.Water,2);assert.equal(h.state.sides.player.active.energy.Water,5);assert.equal(h.state.sides.opponent.active.damage,90);}finally{h.restore();}
});
test('Alolan Dugtrio Gold Rush discards CHOSEN actual Metal Energy from HAND only',()=>{
 const h=setup([['Gold Rush']]);try{const p=h.state.sides.player;
  p.hand=[ref('sm5-stage8-metal','metal-one'),ref('sm5-stage8-metal','metal-two'),ref('sm5-stage8-psychic','psychic-one')];
  const moves=core.legalActions(h.state,'player').filter(a=>a.type==='attack');assert.ok(moves.length>=4);
  const exactlyTwo=moves.find(a=>String(a.effectSelection||'').split(',').filter(Boolean).length===2);
  assert.ok(exactlyTwo,'Gold Rush must offer discard 0/1/2 Metal choices');core.applyAction(h.state,'player',exactlyTwo);drain(h);
  assert.equal(p.hand.length,1);assert.equal(p.hand[0].uid,'psychic-one');assert.deepEqual(p.discard.map(x=>x.uid).sort(),['metal-one','metal-two']);
  assert.equal(h.state.sides.opponent.active.damage,60);assert.equal(p.energyDiscard.Metal||0,0,'not from Zone');
 }finally{h.restore();}
});
test('Royal Blades grants +100 only for Cynthia played THIS turn',()=>{
 for(const [when,expect] of [[null,100],[4,100],[5,200]]){
  const h=setup([['Royal Blades',100]]);try{h.state.sides.player.sm5CynthiaTurn=when;attack(h,'Royal Blades');assert.equal(h.state.sides.opponent.active.damage,expect);}finally{h.restore();}
 }
});
test('Outrage adds one HP for each existing self-damage HP, not 10x',()=>{
 const h=setup([['Outrage',20]]);try{h.state.sides.player.active.damage=80;attack(h,'Outrage');assert.equal(h.state.sides.opponent.active.damage,100);}finally{h.restore();}
});
test('Eleventh Hour Tackle gets +130 only with three or fewer physical DECK cards',()=>{
 for(const [cards,expected] of [[4,50],[3,180],[0,180]]){
  const h=setup([['Eleventh Hour Tackle',50]]);try{
   h.state.sides.player.deck=Array.from({length:cards},(_,i)=>ref('sm4-1','actual-deck-'+i));
   attack(h,'Eleventh Hour Tackle');assert.equal(h.state.sides.opponent.active.damage,expected);
  }finally{h.restore();}
 }
});
test('Royal Blades Cynthia bonus is triggered by actually playing Cynthia as Supporter',()=>{
 const h=setup([['Royal Blades',100]]);try{
  h.cards.set('sm5-119',{id:'sm5-119',name:'Cynthia',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:{type:'handShuffle',draw:6}});
  h.state.sides.player.hand=[ref('sm5-119','cynthia-real')];
  h.state.sides.player.supporterUsed=false;
  action(h,'trainer','sm5-119');drain(h);
  assert.equal(h.state.sides.player.sm5CynthiaTurn,h.state.turnNumber);
  attack(h,'Royal Blades');assert.equal(h.state.sides.opponent.active.damage,200);
 }finally{h.restore();}
});
test('Blaster-GX reveals own remaining Prize cards and consumes GX usage',()=>{
 const h=setup([['Blaster-GX',180]]);try{attack(h,'Blaster-GX');assert.equal(h.state.sides.player.gxAttackUsed,true);assert.equal(h.state.sides.player.prizes.every(p=>p.faceUp===true),true);assert.equal(h.state.sides.opponent.prizes.every(p=>!p.faceUp),true);}finally{h.restore();}
});
test('Lighting-GX chooses a real opposing HAND card and sets it face-down in that side Prize zone',()=>{
 const h=setup([['Lighting-GX']]);try{const o=h.state.sides.opponent;
  o.hand=[ref('sm5-stage8-sup1','target-a'),ref('sm5-stage8-sup2','target-b')];
  const count=o.prizes.length;attack(h,'Lighting-GX');assert.equal(h.state.phase,'effectChoice');const legal=core.legalActions(h.state,h.state.choiceSide).filter(x=>x.type==='effectChoice');assert.equal(legal.length,2);
  choose(h,1);drain(h);assert.equal(o.prizes.length,count+1);assert.ok(!o.hand.some(p=>p.uid==='target-b'));assert.ok(o.hand.some(p=>p.uid==='target-a'));
  const moved=o.prizes.find(p=>p.uid==='target-b');assert.ok(moved);assert.equal(moved.faceUp,false);assert.equal(h.state.sides.player.gxAttackUsed,true);
 }finally{h.restore();}
});
test('Grand Bloom-GX evolves EACH eligible Benched Basic using physical printed deck refs',()=>{
 const h=setup([['Grand Bloom-GX']]);try{
  h.cards.set('sm5-stage8-evo',{...mon('sm5-stage8-evo','Evolution',[],[],{stage:'Stage 1',evolvesFrom:'Benched'}),battleEnabled:true});
  const p=h.state.sides.player;
  p.bench=[slot(h.b.id,'bench-1'),slot(h.b.id,'bench-2')];p.bench.forEach((x,i)=>{x.benchSlot=i;x.energy={Grass:1};});
  p.deck=[ref('sm5-stage8-evo','evo-1'),ref('sm5-stage8-evo','evo-2'),ref(h.b.id,'non-evo')];
  attack(h,'Grand Bloom-GX');drain(h);
  assert.equal(p.bench.every(x=>x.cardId==='sm5-stage8-evo'),true);assert.equal(p.deck.length,1);
  assert.equal(p.bench.reduce((n,x)=>n+x.energy.Grass,0),2);
  assert.deepEqual(p.bench.map(x=>x.uid),['bench-1','bench-2']);
 }finally{h.restore();}
});
test('Weather Guard prevents Grass teammate Weakness against Fire, until Cherrim is suppressed',()=>{
 for(const [suppressed,expected] of [[false,50],[true,100]]){
  const h=setup([['Flame',50]],[],{attacker:{types:['Fire'],subtype:'Fire'}});
  try{
   const grass=mon('sm5-stage8-grass','Grass Defender',[],[],{types:['Grass'],subtype:'Grass',weakness:'Fire',weaknessValue:'×2'});
   const cherry=mon('sm5-11','Cherrim',[],['Weather Guard'],{types:['Grass'],subtype:'Grass'});
   h.cards.set(grass.id,grass);h.cards.set(cherry.id,cherry);
   h.state.sides.opponent.active.cardId=grass.id;
   h.state.sides.opponent.bench[0].cardId=cherry.id;
   if(suppressed)h.state.sides.opponent.bench[0].abilitySuppressed=true;
   attack(h,'Flame');assert.equal(h.state.sides.opponent.active.damage,expected);
  }finally{h.restore();}
 }
});
test('Incandescent Body burns attacking opposing Active when damaged',()=>{
 const h=setup([],['Incandescent Body']);try{
  h.state.activeSide='opponent';
  h.state.sides.opponent.active=slot(h.b.id,'opp-attacker',{Colorless:3});
  h.state.sides.opponent.active.cardId=h.cards.set('sm5-stage8-oppa',mon('sm5-stage8-oppa','Attacker',[['Smack',40]],[],{})).get('sm5-stage8-oppa').id;
  h.state.sides.player.active.cardId=h.a.id;
  const moves=core.legalActions(h.state,'opponent').filter(x=>x.type==='attack');
  assert.ok(moves.length);core.applyAction(h.state,'opponent',moves[0]);drain(h);
  assert.ok(h.state.sides.opponent.active.conditions?.burn,'attacking Pokémon burned');
 }finally{h.restore();}
});
test('Incandescent Body still burns attacker when Magmortar is knocked out by its attack',()=>{
 const h=setup([],['Incandescent Body']);try{
  h.a.hp=30;
  h.state.activeSide='opponent';
  h.state.sides.opponent.active=slot('sm5-stage8-oppa','opp-attacker',{Colorless:3});
  h.cards.set('sm5-stage8-oppa',mon('sm5-stage8-oppa','Attacker',[['Smack',40]],[],{}));
  const moves=core.legalActions(h.state,'opponent').filter(x=>x.type==='attack');
  assert.ok(moves.length);core.applyAction(h.state,'opponent',moves[0]);drain(h);
  assert.ok(h.state.sides.opponent.active.conditions?.burn,'burn must apply even after knockout');
  assert.ok(h.state.sides.player.active?.cardId!==h.a.id,'original defender must be knocked out');
 }finally{h.restore();}
});
test('Evolutionary Advantage is restricted to the player going second',()=>{
 const h=setup([],['Evolutionary Advantage'],{attacker:{name:'Shinx'}});try{
  h.a.name='Shinx';h.state.sides.player.active.cardId=h.a.id;
  h.cards.set('sm5-stage8-luxio',mon('sm5-stage8-luxio','Luxio',[],[],{stage:'Stage 1',evolvesFrom:'Shinx'}));
  const s=h.state,p=s.sides.player;p.hand=[ref('sm5-stage8-luxio','evo')];p.turnCount=1;p.active.playedOnSideTurn=0;s.turnNumber=2;s.firstSide='opponent';
  assert.ok(core.legalActions(s,'player').some(a=>a.type==='evolve'));
  s.firstSide='player';assert.ok(!core.legalActions(s,'player').some(a=>a.type==='evolve'));
 }finally{h.restore();}
});
test('Change Clothes returns original physical attached Tool to HAND, no duplicate',()=>{
 const h=setup([],['Change Clothes'],{id:'sm5-91'});try{
  h.cards.set('sm5-91',h.a);
  h.state.sides.player.bench[0].tool=ref('sm5-stage8-tool','tool-original');
  h.state.sides.player.hand=[];
  action(h,'ability');drain(h);
  assert.equal(h.state.sides.player.bench[0].tool,null);
  assert.ok(h.state.sides.player.hand.some(r=>r.uid==='tool-original'));
  assert.equal(h.state.sides.player.hand.filter(r=>r.uid==='tool-original').length,1);
 }finally{h.restore();}
});
test('Change Clothes allows choosing either Tool on an eligible multi-Tool Pokemon',()=>{
 const h=setup([],['Change Clothes'],{id:'sm5-91'});try{
  const p=h.state.sides.player;
  p.bench=[slot(h.b.id,'only-2-tools')];
  p.bench[0].tool=ref('sm5-stage8-tool','first-tool');
  p.bench[0].extraTools=[ref('sm5-stage8-tool','second-tool')];
  action(h,'ability');
  const legal=core.legalActions(h.state,h.state.choiceSide).filter(x=>x.type==='effectChoice');
  assert.equal(legal.length,2,'both Tools must be offered');
  choose(h,1);drain(h);
  assert.ok(p.hand.some(x=>x.uid==='second-tool'));
  assert.equal(p.bench[0].tool.uid,'first-tool');
  assert.equal(p.bench[0].extraTools.length,0);
 }finally{h.restore();}
});
test('Escape Board lowers retreat by one and permits Asleep retreat when attached',()=>{
 const h=setup();try{
  h.cards.set('sm5-122',{id:'sm5-122',name:'Escape Board',kind:'trainer',trainerType:'Pokémon Tool',effect:fixture.trainers['Escape Board'],battleEnabled:true});
  const p=h.state.sides.player;p.active.energy={Colorless:1};p.active.conditions={sleep:true};p.active.tool=ref('sm5-122','escape-tool');
  
  assert.equal(fx.modifierAmount(h.state,'player',p.active,'retreatCost',data.cardById),-1);
  assert.ok(core.legalActions(h.state,'player').some(a=>a.type==='retreat'),'can retreat even while asleep');
 }finally{h.restore();}
});
test('Electric and Fire Memories change ONLY attached Silvally-GX types',()=>{
 for(const [id,type] of [['sm5-121','Lightning'],['sm5-123','Fire']]){
  const h=setup();try{h.a.name='Silvally-GX';h.state.sides.player.active.tool=ref(id,id+'-ref');
   h.cards.set(id,{id,name:type+' Memory',kind:'trainer',trainerType:'Pokémon Tool',effect:fixture.trainers[id==='sm5-121'?'Electric Memory':'Fire Memory'],battleEnabled:true});
   assert.deepEqual(fx.effectiveTypes(h.state,'player',h.state.sides.player.active,data.cardById),[type]);
   assert.notDeepEqual(fx.effectiveTypes(h.state,'player',h.state.sides.player.bench[0],data.cardById),[type]);
  }finally{h.restore();}
 }
});
