'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage6_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Metal:5,Colorless:5};
function mon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:2,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,attacks:attacks.map(([n,dmg=0])=>({name:n,damage:dmg,cost:['C'],gxAttack:n.endsWith('-GX'),effect:fixture.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[n]})),...extra};}
function setup(attacks=[],abilities=[],options={}){
 const cards=new Map(),original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const a=add(mon(options.id||'sm5-stage6-a','User',attacks,abilities,{hp:500,...options.attacker}));
 const d=add(mon('sm5-stage6-d','Defender',[],[],{hp:500,...options.defender}));
 const b=add(mon('sm5-stage6-b','Benched',[],[],{hp:500,retreat:3,...options.bench}));
 const gx=add(mon('sm5-stage6-gx','GX Target',[],[],{hp:500,pokemonGX:true,abilities:[{name:'GX Power',type:'activated',printedPowerType:'ability',effect:{type:'noop'}}]}));
 for(const [id,name,type] of [['sm5-stage6-metal','Metal Energy','Metal'],['sm5-stage6-psychic','Psychic Energy','Psychic']])add({id,name,kind:'energy',subtype:type,energyType:type,basicEnergy:true});
 add({id:'sm5-stage6-unit',name:'Unit Energy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}}});
 add({id:'sm5-stage6-sup1',name:'Supporter A',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage6-sup2',name:'Supporter B',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'},battleEnabled:true});
 add({id:'sm5-stage6-pal',name:'Pal Pad',kind:'trainer',trainerType:'Item',effect:fixture.trainers['Pal Pad'],battleEnabled:true});
 add({id:'sm5-stage6-tool',name:'A Tool',kind:'trainer',trainerType:'Pokémon Tool',effect:{type:'noop'},battleEnabled:true});
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

test('Stage 6 descriptors validate; no unsupported or silent noop mappings',()=>{
 assert.deepEqual([Object.keys(fixture.attacks).length,Object.keys(fixture.abilities).length,Object.keys(fixture.trainers).length],[10,6,1]);
 for(const [group,entries] of Object.entries(fixture))for(const [name,value] of Object.entries(entries))assert.deepEqual(fx.validateEffect(group==='abilities'?value.effect:group==='trainers'?value[1]:value),[],name);
});
test('Frost Bullet hits defending Active and a specifically chosen Bench target',()=>{
 const h=setup([['Frost Bullet',90]]);try{attack(h,'Frost Bullet');drain(h);assert.equal(h.state.sides.opponent.active.damage,90);assert.equal(h.state.sides.opponent.bench.reduce((n,p)=>n+p.damage,0),30);}finally{h.restore();}
});
test('Wash Arrow hits a chosen Bench Pokémon without touching Active',()=>{
 const h=setup([['Wash Arrow']]);try{attack(h,'Wash Arrow');drain(h);assert.equal(h.state.sides.opponent.active.damage,0);assert.equal(h.state.sides.opponent.bench.reduce((n,p)=>n+p.damage,0),50);}finally{h.restore();}
});
test('Frost Crush sums opposing in-play attached Energy, not fresh Energy Zone',()=>{
 const h=setup([['Frost Crush',10]]);try{h.state.sides.opponent.active.energy={Water:2};h.state.sides.opponent.bench[0].energy={Grass:3};h.state.sides.opponent.energySupply=['Grass','Grass','Grass'];attack(h,'Frost Crush');assert.equal(h.state.sides.opponent.active.damage,110);}finally{h.restore();}
});
test('Rebel-GX counts only opposing Bench Pokémon and consumes GX use',()=>{
 const h=setup([['Rebel-GX']]);try{attack(h,'Rebel-GX');assert.equal(h.state.sides.opponent.active.damage,100);assert.equal(h.state.sides.player.gxAttackUsed,true);}finally{h.restore();}
});
test('Flickering Spores sleeps opponent; Cresselia Psychic counts defender energy',()=>{
 for(const [attackName,base] of [['Flickering Spores',30],['Psychic',60]]){const h=setup([[attackName,base]]);try{h.state.sides.opponent.active.energy={Psychic:2};attack(h,attackName);if(attackName==='Psychic')assert.equal(h.state.sides.opponent.active.damage,100);else assert.ok(h.state.sides.opponent.active.conditions.sleep);}finally{h.restore();}}
});
test('Moongeist Beam creates temporary healing lock (not a validating no-op)',()=>{
 const h=setup([['Moongeist Beam',120]]);try{h.state.sides.opponent.active.damage=100;attack(h,'Moongeist Beam');assert.ok(Number(h.state.sides.opponent.active.healingBlockedUntil)>=6);const target=h.state.sides.opponent.active;fx.applyEffect({type:'heal',target:'opponentActive',amount:200},{state:h.state,side:'player',foeSide:'opponent',attacker:h.state.sides.player.active,defender:target,cardById:data.cardById});assert.ok(target.damage>=220,'healing blocked during opponent turn');}finally{h.restore();}
});
test('Push Down offers optional switch controlled by opponent',()=>{
 const h=setup([['Push Down',110]]);try{attack(h,'Push Down');assert.equal(h.state.phase,'effectChoice');choose(h,0);drain(h);assert.equal(h.state.sides.opponent.active.uid,'ob');}finally{h.restore();}
});
test('Lunar Fall-GX offers only Basic non-GX targets and performs KO',()=>{
 const h=setup([['Lunar Fall-GX']]);try{h.state.sides.opponent.active=slot(h.gx.id,'GXactive');h.state.sides.opponent.bench=[slot(h.gx.id,'GXbench'),slot(h.b.id,'basicBench')];h.state.sides.opponent.bench.forEach((p,i)=>p.benchSlot=i);attack(h,'Lunar Fall-GX');drain(h);assert.equal(h.state.sides.player.gxAttackUsed,true);assert.equal(h.state.sides.opponent.active.uid,'GXactive');assert.equal(h.state.sides.opponent.bench.some(p=>p.uid==='GXbench'),true);assert.equal(h.state.sides.opponent.bench.some(p=>p.uid==='basicBench'),false,'Only the legal non-GX Basic may be knocked out');}finally{h.restore();}
});
test('Special Mow discards one physical Special Energy and leaves Basic Energy untouched',()=>{
 const h=setup([['Special Mow',60]]);try{const opp=h.state.sides.opponent;opp.active.energy={Grass:3};opp.active.specialEnergy=[ref('sm5-stage6-unit','actual-unit')];attack(h,'Special Mow');drain(h);assert.equal(opp.active.energy.Grass,3);assert.equal(opp.active.specialEnergy.length,0);assert.ok(opp.discard.some(r=>r.uid==='actual-unit'));assert.equal(opp.active.damage,60);}finally{h.restore();}
});
test('Invasion switches the source Benched Pokémon into Active; never offered Active',()=>{
 const h=setup([],['Invasion']);try{h.state.sides.player.active=slot(h.b.id,'oldActive');h.state.sides.player.bench=[slot(h.a.id,'invasionBench')];action(h,'ability');assert.equal(h.state.sides.player.active.uid,'invasionBench');assert.equal(h.state.sides.player.bench[0].uid,'oldActive');assert.ok(!core.legalActions(h.state,'player').some(x=>x.type==='ability'&&x.cardId===h.a.id));}finally{h.restore();}
});
test('Ultra Road switches with chosen Bench and marks once-per-turn use',()=>{
 const h=setup([],['Ultra Road']);try{action(h,'ability');drain(h);assert.equal(h.state.sides.player.active.uid,'pb');}finally{h.restore();}
});
test('Gyro Unit gives all allied Basics zero retreat, not evolved Pokémon',()=>{
 const h=setup([],['Gyro Unit']);try{const second=slot(h.b.id,'secondBasic');h.state.sides.player.active=second;h.state.sides.player.bench=[slot(h.a.id,'gyroSource')];const value=fx.modifierAmount(h.state,'player',second,'retreatCost',data.cardById);assert.ok(value<=-3,'Basic ally should receive free retreat');h.b.stage='Stage 1';const changed=fx.modifierAmount(h.state,'player',second,'retreatCost',data.cardById);assert.equal(changed,0,'non-Basic should not get free retreat');}finally{h.restore();}
});
test('Magnetic Circuit consumes physical Metal from hand, repeatedly, never the Zone',()=>{
 const h=setup([],['Magnetic Circuit']);try{const s=h.state.sides.player;s.hand=[ref('sm5-stage6-metal','hand-M1'),ref('sm5-stage6-metal','hand-M2')];const before=s.active.energy.Metal;action(h,'ability');drain(h);assert.equal(s.hand.length,1);assert.equal(s.active.energy.Metal,before+1);action(h,'ability');drain(h);assert.equal(s.hand.length,0);assert.ok(!core.legalActions(h.state,'player').some(x=>x.type==='ability'));}finally{h.restore();}
});
test('Roto Motor requires 9 discarded Tool CARD refs and no suppression',()=>{
 const h=setup([['Frost Crush',10]],['Roto Motor']);try{const s=h.state.sides.player;const testAtk=h.a.attacks[0];const check=()=>fx.attackCostOverride(h.state,'player',s.active,testAtk,data.cardById);for(let i=0;i<8;i++)s.discard.push(ref('sm5-stage6-tool','tool-'+i));assert.equal(check(),null);s.discard.push(ref('sm5-stage6-tool','tool-8'));assert.equal(check(),'');s.active.abilitySuppressed={duration:'whileInPlay'};assert.equal(check(),null);}finally{h.restore();}
});
test('Freezing Gaze suppresses opposing GX but not ordinary Pokémon or own side',()=>{
 const h=setup([],['Freezing Gaze'],{attacker:{name:'Glaceon-GX',pokemonGX:true}});try{const enemy=h.state.sides.opponent.active;enemy.cardId=h.gx.id;assert.equal(fx.abilitiesSuppressed(h.state,'opponent',enemy,data.cardById),true);enemy.cardId=h.b.id;assert.equal(fx.abilitiesSuppressed(h.state,'opponent',enemy,data.cardById),false);enemy.cardId=h.gx.id;h.state.sides.player.active.abilitySuppressed={duration:'whileInPlay'};assert.equal(fx.abilitiesSuppressed(h.state,'opponent',enemy,data.cardById),false);}finally{h.restore();}
});
test('Pal Pad returns precisely chosen physical Supporter refs to deck; not a redraw',()=>{
 const h=setup();try{const s=h.state.sides.player;s.hand=[ref('sm5-stage6-pal','pal')];s.discard=[ref('sm5-stage6-sup1','supOne'),ref('sm5-stage6-sup2','supTwo')];const before=s.deck.length;action(h,'trainer','sm5-stage6-pal');drain(h);assert.equal(s.deck.length,before+2);assert.equal(s.discard.some(r=>r.uid==='supOne'||r.uid==='supTwo'),false);assert.equal(s.deck.some(r=>r.uid==='supOne'),true);assert.equal(s.deck.some(r=>r.uid==='supTwo'),true);}finally{h.restore();}
});
test('Freezing Gaze suppresses Darkrai-GX Restoration in the opponent discard zone, then restores legality',()=>{
 const h=setup([],['Freezing Gaze'],{attacker:{name:'Glaceon-GX',pokemonGX:true}});
 try{
   const state=h.state,op=state.sides.opponent;
   state.activeSide='opponent';
   op.discard=[ref('sm3-88','darkrai-actual-ref')];
   const abilityActions=()=>core.legalActions(state,'opponent').filter(x=>x.type==='abilityDiscard'&&x.sourceUid==='darkrai-actual-ref');
   assert.equal(abilityActions().length,0,'Freezing Gaze must suppress GX Abilities in discard');
   state.sides.player.active.abilitySuppressed={duration:'whileInPlay'};
   assert.equal(abilityActions().length,1,'restored GX discard Ability must be offered once the Gaze is suppressed');
 }finally{h.restore();}
});
test('Moongeist Beam healing prevention expires after the opponent turn',()=>{
 const h=setup([['Moongeist Beam',120]]);
 try{
  h.state.sides.opponent.active.damage=100;
  attack(h,'Moongeist Beam');
  const target=h.state.sides.opponent.active;
  const effect={type:'heal',target:'opponentActive',amount:50};
  const ctx={state:h.state,side:'player',foeSide:'opponent',attacker:h.state.sides.player.active,defender:target,cardById:data.cardById};
  fx.applyEffect(effect,ctx);assert.equal(target.damage,220,'blocked heal before expiry');
  h.state.turnNumber=7;fx.applyEffect(effect,ctx);
  assert.equal(target.damage,170,'healing must resume after opponent turn');
 }finally{h.restore();}
});
