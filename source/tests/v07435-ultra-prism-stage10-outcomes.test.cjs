'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage10_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[n]})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage10-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage10-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage10-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage10-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage10-metal','Metal Energy','Metal'],['sm5-stage10-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage10-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage10-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage10-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage10-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage10-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
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


test('Stage 10 descriptors validate without fallback effects',()=>{
 assert.deepEqual([Object.keys(fixture.attacks).length,Object.keys(fixture.abilities).length,Object.keys(fixture.trainers).length],[6,2,1]);
 for(const [n,v] of Object.entries(fixture.attacks))assert.deepEqual(fx.validateEffect(v),[],n);
 for(const [n,v] of Object.entries(fixture.abilities))assert.deepEqual(fx.validateEffect(v.effect),[],n);
 for(const [n,v] of Object.entries(fixture.trainers))assert.deepEqual(fx.validateEffect(v[1]),[],n);
});
test('Timeless-GX gives the SAME player a genuine next turn, with draw and no checkup',()=>{
 const h=setup([['Timeless-GX',150]]);try{
 const s=h.state,p=s.sides.player,o=s.sides.opponent;p.active.energy={Metal:6};p.active.conditions={poison:true};o.active.conditions={poison:true};
 const draw=p.deck[0].uid,turn=s.turnNumber,opHand=o.hand.length,opDeck=o.deck.length;
 attack(h,'Timeless-GX');drain(h);
 assert.equal(s.activeSide,'player');assert.equal(s.turnNumber,turn+1);assert.ok(p.hand.some(x=>x.uid===draw));
 assert.equal(o.deck.length,opDeck);assert.equal(o.hand.length,opHand);assert.equal(p.active.damage,0);
 assert.equal(o.active.damage,150,'no poison between-turn damage');assert.equal(p.gxAttackUsed,true);
 }finally{h.restore();}
});
test('Timeless-GX works on CPU and opponent does not receive intervening turn',()=>{
 const h=setup([['Timeless-GX',150]]);try{const s=h.state;s.sides.opponent.active=slot(h.a.id,'cpu',{Metal:6});s.sides.player.active=slot(h.d.id,'target');s.activeSide='opponent';s.sides.opponent.deck=[ref('sm4-1','cpu-draw')];const current=s.turnNumber;
 attack(h,'Timeless-GX','opponent');drain(h);assert.equal(s.activeSide,'opponent');assert.equal(s.turnNumber,current+1);assert.ok(s.sides.opponent.hand.some(r=>r.uid==='cpu-draw'));
 }finally{h.restore();}
});
test('Zero Vanish-GX transfers all opposing physical special Energy to deck, no copies',()=>{
 const h=setup([['Zero Vanish-GX',150]]);try{const o=h.state.sides.opponent;o.active.energy={Water:2};o.bench[0].energy={Metal:1};o.active.specialEnergy=[ref('sm5-stage10-unit','special-1')];o.bench[1].specialEnergy=[ref('sm5-stage10-unit','special-2')];const before=o.deck.length;attack(h,'Zero Vanish-GX');drain(h);
 assert.deepEqual(o.active.energy,{});assert.deepEqual(o.bench[0].energy,{});assert.equal(o.active.specialEnergy.length+o.bench[1].specialEnergy.length,0);
 assert.equal(o.deck.length+o.hand.length,before+5);assert.ok(o.deck.some(r=>r.uid==='special-1'));assert.ok(o.deck.some(r=>r.uid==='special-2'));assert.equal(o.discard.length,0);
 assert.equal(h.state.sides.player.active.energy.Metal,5);
 }finally{h.restore();}
});
test('Zero Vanish-GX does not remove our Energy and works on CPU side',()=>{
 const h=setup([['Zero Vanish-GX',150]]);try{const s=h.state;s.sides.opponent.active=slot(h.a.id,'cpu',{Water:8});s.sides.player.active=slot(h.d.id,'target',{Grass:2});s.activeSide='opponent';attack(h,'Zero Vanish-GX','opponent');drain(h);assert.deepEqual(s.sides.player.active.energy,{});assert.equal(s.sides.opponent.active.energy.Water,8);
 }finally{h.restore();}
});
test('Sol Burst-GX attaches actual physical Special Energy to chosen Pokémon',()=>{
 const h=setup([['Sol Burst-GX']]);try{const p=h.state.sides.player;p.deck=[ref('sm5-stage10-unit','real-unit'),ref('sm5-stage10-sup1','trainer')];p.energySupply=[];attack(h,'Sol Burst-GX');assert.equal(h.state.phase,'effectChoice');choose(h,0);assert.equal(h.state.phase,'effectChoice');choose(h,0);if(h.state.phase==='effectChoice')stop(h);drain(h);
 assert.equal(p.active.specialEnergy.length,1);assert.equal(p.active.specialEnergy[0].uid,'real-unit');assert.equal(p.deck.some(r=>r.uid==='real-unit'),false);assert.equal(p.deck.some(r=>r.uid==='trainer'),true);
 }finally{h.restore();}
});
test('Sol Burst-GX respects Zone search coin flips, never creates new Energy from empty Zone',()=>{
 const h=setup([['Sol Burst-GX']]);try{const p=h.state.sides.player;p.deck=[ref('sm5-stage10-sup1','not-energy')];p.energySupply=['Water'];attack(h,'Sol Burst-GX');choose(h,0);choose(h,0);stop(h);drain(h);const flips=h.state.log.filter(r=>r.type==='coin'&&r.reason==='Hybrid Basic Energy deck search');assert.equal(flips.length,1);assert.equal(p.active.energy.Water,5+(flips[0].heads?1:0));assert.equal(p.energySupply.length,flips[0].heads?0:1);assert.equal(p.deck.some(r=>r.uid==='not-energy'),true);
 }finally{h.restore();}
});
test('Sol Burst-GX can stop immediately with no Energy attached',()=>{
 const h=setup([['Sol Burst-GX']]);try{const p=h.state.sides.player;p.energySupply=['Water'];p.deck=[ref('sm5-stage10-unit','real-unit')];attack(h,'Sol Burst-GX');choose(h,2);assert.equal(h.state.phase,'battle');assert.equal(p.active.specialEnergy.length,0);assert.ok(p.deck.some(r=>r.uid==='real-unit'));}finally{h.restore();}
});
test('Spatial Control moves chosen Basic and Special Energy from Bench onto attacker',()=>{
 const h=setup([['Spatial Control']]);try{const p=h.state.sides.player;p.active.energy={Water:1};p.bench[0].energy={Metal:2};p.bench[0].specialEnergy=[ref('sm5-stage10-unit','unit')];attack(h,'Spatial Control');assert.equal(h.state.phase,'effectChoice');choose(h,0); // first listed Basic
 stop(h);drain(h);assert.equal(p.active.energy.Metal,1);assert.equal(p.bench[0].energy.Metal,1);
 }finally{h.restore();}
});
test('Spatial Control can move two basic units and then Stop without losing Energy',()=>{
 const h=setup([['Spatial Control']]);try{const p=h.state.sides.player;p.active.energy={Water:1};p.bench[0].energy={Metal:2};attack(h,'Spatial Control');choose(h,0);assert.equal(h.state.phase,'effectChoice');choose(h,0);assert.equal(p.active.energy.Metal,2);assert.equal(p.bench[0].energy.Metal,0);assert.equal(h.state.phase,'battle');
 }finally{h.restore();}
});
test('Spatial Control moves physical Special Energy without changing its UID',()=>{
 const h=setup([['Spatial Control']]);try{const p=h.state.sides.player;p.active.energy={Water:1};p.bench[0].energy={};p.bench[0].specialEnergy=[ref('sm5-stage10-unit','physical-unit')];attack(h,'Spatial Control');choose(h,0);assert.equal(p.active.specialEnergy[0]?.uid,'physical-unit');assert.equal(p.bench[0].specialEnergy.length,0);assert.equal(h.state.phase,'battle');
 }finally{h.restore();}
});
test('Psychic Transfer moves one real attached Psychic Energy and is repeatable',()=>{
 const h=setup([],['Psychic Transfer'],{id:'sm5-172'});try{const s=h.state,p=s.sides.player;p.active.energy={Psychic:2};p.bench[0].energy={};const a=core.legalActions(s,'player').find(x=>x.type==='ability');assert.ok(a,'active Psychic Transfer ability');core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');choose(h,0);choose(h,0);assert.equal(p.active.energy.Psychic,1);assert.equal(p.bench[0].energy.Psychic,1);assert.ok(core.legalActions(s,'player').some(x=>x.type==='ability'),'not once-per-turn');
 }finally{h.restore();}
});
test('Psychic Transfer not advertised with no source or no other Pokémon',()=>{
 const h=setup([],['Psychic Transfer'],{id:'sm5-172'});try{const s=h.state,p=s.sides.player;p.active.energy={};p.bench[0].energy={};assert.ok(!core.legalActions(s,'player').some(x=>x.type==='ability'));p.bench=[];p.active.energy={Psychic:2};assert.ok(!core.legalActions(s,'player').some(x=>x.type==='ability'));
 }finally{h.restore();}
});
test('Blessings of Frost recovers one discarded Water Energy only when evolving from HAND',()=>{
 const h=setup();try{const s=h.state,p=s.sides.player;p.active.cardId='sm5-stage10-base';h.cards.set('sm5-stage10-base',mon('sm5-stage10-base','Snover',[],[],{stage:'Basic'}));h.cards.set('sm5-stage10-abomasnow',mon('sm5-stage10-abomasnow','Abomasnow',[],['Blessings of the Frost'],{stage:'Stage 1',evolvesFrom:'Snover'}));p.hand=[ref('sm5-stage10-abomasnow','evo-ref')];p.active.energy={};p.energyDiscard.Water=1;
 const a=core.legalActions(s,'player').find(x=>x.type==='evolve');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');choose(h,0);assert.equal(p.active.energy.Water,1);assert.equal(p.energyDiscard.Water,0);assert.equal(p.energySupply.includes('Water'),true);
 }finally{h.restore();}
});
test('Happy Turn asks before return, preserves Special Energy UID',()=>{
 const h=setup([['Happy Turn',60]]);try{const p=h.state.sides.player;p.active.specialEnergy=[ref('sm5-stage10-unit','happy-unit')];attack(h,'Happy Turn');assert.equal(h.state.phase,'effectChoice');choose(h,1);drain(h);assert.ok(p.deck.some(r=>r.uid==='happy-unit'));assert.ok(!p.active);assert.ok(core.legalActions(h.state,'player').some(a=>a.type==='promote')); 
 }finally{h.restore();}
});
test('Fire Blaster pays exactly two attached Energy cards for +80',()=>{
 const h=setup([['Fire Blaster',80]]);try{const s=h.state,p=s.sides.player;p.active.energy={Fire:2};const choices=core.legalActions(s,'player').filter(x=>x.type==='attack');assert.ok(choices.some(x=>String(x.effectSelection||'').startsWith('boost:')));const boost=choices.find(x=>String(x.effectSelection||'').startsWith('boost:'));core.applyAction(s,'player',boost);assert.equal(s.sides.opponent.active.damage,160);assert.equal(p.active.energy.Fire,0);assert.equal(p.energyDiscard.Fire,2);
 }finally{h.restore();}
});
test('Ancient Crystal reduces Regigigas damage by 30 after weakness, not unrelated Pokemon',()=>{
 for(const [name,expect] of [['Regigigas',70],['Pikachu',100]]){const h=setup([['Hit',100]]);try{h.d.name=name;h.state.sides.opponent.active.tool=ref('sm5-118','crystal');h.cards.set('sm5-118',{id:'sm5-118',name:'Ancient Crystal',kind:'trainer',trainerType:'Pokémon Tool',effect:fixture.trainers['Ancient Crystal'][1],battleEnabled:true});attack(h,'Hit');assert.equal(h.state.sides.opponent.active.damage,expect);}finally{h.restore();}}
});
