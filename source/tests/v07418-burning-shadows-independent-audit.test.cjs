'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const sm3=require('../app/src/main/assets/tcg-classic-burning-shadows.js');
const original=data.cardById;
const dummy={id:'v07418-dummy',kind:'pokemon',name:'Audit test Pokémon',hp:4000,stage:'Basic',types:['Colorless'],battleEnabled:true,attacks:[{name:'Hit',damage:50,cost:'C',effect:{type:'noop'}}]};
function withDummy(fn){data.cardById=id=>id===dummy.id?dummy:original(id);try{return fn();}finally{data.cardById=original;}}
function slot(id,uid,energy={}){return{uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1};}
function state(id='sm3-63',side='player'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:9,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Fairy'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Fairy']});
 s.phase='battle';s.activeSide=side;s.turnNumber=7;
 for(const [who,p] of Object.entries(s.sides)){p.turnCount=4;p.hand=[];p.deck=[{uid:who+'d',cardId:'sm3-1'}];p.discard=[];p.bench=[];p.energySupply=['Fire','Grass','Fire'];p.energyDiscard={};p.energyUsed=true;p.handEnergyUsed=true;p.supporterUsed=false;}
 const other=side==='player'?'opponent':'player';s.sides[side].active=slot(id,side+'a',{Grass:3,Fire:4,Water:4,Psychic:3,Fighting:3,Darkness:3,Fairy:3});s.sides[side].bench=[slot('sm3-1',side+'b')];s.sides[other].active=slot(dummy.id,other+'a',{Water:2});s.sides[other].bench=[slot(dummy.id,other+'b')];return s;
}
function choose(s,side,pred){const options=core.legalActions(s,side),a=options.find(pred);assert.ok(a,'no action '+side+' '+s.phase+' '+JSON.stringify(options.slice(0,10)));core.applyAction(s,side,a);return a;}
function resolve(s){for(let i=0;i<40&&s.phase==='effectChoice';i++)choose(s,s.pendingChoice?.side||s.activeSide,()=>true);assert.notEqual(s.phase,'effectChoice');}
function attack(s,side,name){const idx=sm3.cardById(s.sides[side].active.cardId).attacks.findIndex(a=>a.name===name);assert.ok(idx>=0);choose(s,side,a=>a.type==='attack'&&a.attackIndex===idx);resolve(s);return s;}
test('Black Ray-GX deals 100 unmodified damage to GX with matching Psychic weakness and resistance',()=>withDummy(()=>{
 const s=state();s.sides.opponent.active=slot('sm3-64','weak');s.sides.opponent.bench=[slot('sm3-84','resistant'),slot('sm3-1','normal')];attack(s,'player','Black Ray-GX');
 assert.equal(s.sides.opponent.active.damage,100);assert.equal(s.sides.opponent.bench[0].damage,100);assert.equal(s.sides.opponent.bench[1].damage,0);
}));
test('Crimson Storm discards only three Fire-providing sources and preserves unrelated Water',()=>withDummy(()=>{
 const s=state('sm3-20');s.sides.player.active.energy={Fire:2,Water:2};s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'sm1-137',provides:{Miracle:1}}];attack(s,'player','Crimson Storm');
 assert.equal(s.sides.player.active.energy.Fire,0);assert.equal(s.sides.player.active.energy.Water,2);assert.equal(s.sides.player.active.specialEnergy.length,0);
}));
test('Po Town affects evolution on the opponent turn too, but not a normal Bench placement',()=>withDummy(()=>{
 const s=state('sm3-1','opponent');s.stadium={uid:'po',cardId:'sm3-121',ownerSide:'player'};
 s.sides.opponent.active=slot('sm3-1','opp-base',{Grass:2});s.sides.opponent.hand=[{uid:'evo',cardId:'sm3-2'}];choose(s,'opponent',a=>a.type==='evolve'&&a.cardId==='sm3-2');resolve(s);
 assert.equal(s.sides.opponent.active.damage,30);
}));
test('Necrozma-GX Prismatic Burst counts a Rainbow special Energy as Psychic-providing and discards it',()=>withDummy(()=>{
 const s=state('sm3-63');s.sides.player.active.energy={Psychic:1,Grass:1};s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'sm1-137',provides:{Miracle:1}}];attack(s,'player','Prismatic Burst');
 assert.equal(s.sides.opponent.active.damage,130);assert.equal(s.sides.player.active.energy.Psychic,0);assert.equal(s.sides.player.active.energy.Grass,1);assert.equal(s.sides.player.active.specialEnergy.length,0);
}));
test('Golisopod-GX Crossing Cut GX attack requires actual available friendly bench for switching',()=>withDummy(()=>{
 const s=state('sm3-17');s.sides.player.bench=[];const options=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===2);assert.equal(options.length,1);
 core.applyAction(s,'player',options[0]);resolve(s);assert.equal(s.sides.opponent.active.damage,150);
}));
test('Hydro Shot discards Water Basic plus Rainbow Special as two Water Energy, never unrelated Grass',()=>withDummy(()=>{
 const s=state('sm3-39');s.sides.player.active.energy={Water:1,Grass:1};s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'sm1-137',provides:{Miracle:1}}];
 attack(s,'player','Hydro Shot');
 assert.equal(s.sides.player.active.energy.Water,0);assert.equal(s.sides.player.active.energy.Grass,1);
 assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.equal(s.sides.player.discard.some(r=>r.uid==='rainbow'),true);
 assert.equal(s.sides.opponent.active.damage+s.sides.opponent.bench[0].damage,120);
}));
test('Necrozma-GX Prismatic Burst counts two Rainbow Energy as exactly two cards and spends them',()=>withDummy(()=>{
 const s=state('sm3-63');s.sides.player.active.energy={Grass:1};s.sides.player.active.specialEnergy=[{uid:'rain1',cardId:'sm1-137',provides:{Miracle:1}},{uid:'rain2',cardId:'sm1-137',provides:{Miracle:1}}];
 attack(s,'player','Prismatic Burst');assert.equal(s.sides.opponent.active.damage,130);assert.equal(s.sides.player.active.specialEnergy.length,0);assert.equal(s.sides.player.discard.filter(r=>r.cardId==='sm1-137').length,2);assert.equal(s.sides.player.active.energy.Grass,1);
}));
test('Weakness Policy prevents Fire weakness on opposing Golisopod-GX without preventing attack damage',()=>withDummy(()=>{
 function run(tool){const s=state('sm3-24');s.sides.player.active.energy={Fire:3};s.sides.opponent.active=slot('sm3-17','grass');if(tool)s.sides.opponent.active.tool={uid:'policy',cardId:'sm3-126'};attack(s,'player','Searing Flame');return s.sides.opponent.active.damage;}
 const normal=run(false),guarded=run(true);assert.equal(normal,140);assert.equal(guarded,80);
}));
test('Lana heals Rainbow-attached Pokémon as Water and leaves non-Water Pokémon unchanged',()=>withDummy(()=>{
 const s=state('sm3-17');s.sides.player.active.energy={Grass:1};s.sides.player.active.damage=70;
 s.sides.player.bench=[slot('sm3-17','rainbow-only')];s.sides.player.bench[0].damage=80;s.sides.player.bench[0].specialEnergy=[{uid:'rain',cardId:'sm1-137',provides:{Miracle:1}}];
 s.sides.player.hand=[{uid:'lana',cardId:'sm3-117'}];choose(s,'player',a=>a.type==='trainer'&&a.cardId==='sm3-117');resolve(s);
 assert.equal(s.sides.player.active.damage,70);assert.equal(s.sides.player.bench[0].damage,30);
}));
test('Necrozma-GX Prismatic Burst treats Prism Energy as Psychic while attached to a Basic',()=>withDummy(()=>{
 const s=state('sm3-63');s.sides.player.active.energy={Grass:2};s.sides.player.active.specialEnergy=[{uid:'prism',cardId:'bw4-93',provides:{Colorless:1}}];attack(s,'player','Prismatic Burst');
 assert.equal(s.sides.opponent.active.damage,70);assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.equal(s.sides.player.discard.filter(ref=>ref.uid==='prism').length,1);
}));
test('Tapu Fini Hydro Shot spends Blend Water and Water Basic, not unrelated Grass',()=>withDummy(()=>{
 const s=state('sm3-39');s.sides.player.active.energy={Water:1,Grass:1};s.sides.player.active.specialEnergy=[{uid:'blend',cardId:'bw6-118',provides:{Colorless:1}}];attack(s,'player','Hydro Shot');
 assert.equal(s.sides.player.active.energy.Water,0);assert.equal(s.sides.player.active.energy.Grass,1);
 assert.equal(s.sides.player.active.specialEnergy.length,0);assert.equal(s.sides.player.discard.some(ref=>ref.uid==='blend'),true);
}));
test('Prism Energy on a Stage 2 Pokémon is Colorless and not a typed Fire discard',()=>withDummy(()=>{
 const s=state('sm3-20');s.sides.player.active.energy={Fire:3,Water:2};s.sides.player.active.specialEnergy=[{uid:'prism',cardId:'bw4-93',provides:{Colorless:1}}];
 attack(s,'player','Crimson Storm');
 assert.equal(s.sides.player.active.energy.Fire,0);
 assert.equal(s.sides.player.active.energy.Water,2);
 assert.equal(s.sides.player.active.specialEnergy.length,1);
 assert.equal(s.sides.player.active.specialEnergy[0].uid,'prism');
}));
test('Blend WaterLightningFightingMetal on a Fire attacker is not incorrectly spent as Fire',()=>withDummy(()=>{
 const s=state('sm3-20');s.sides.player.active.energy={Fire:3,Water:2};s.sides.player.active.specialEnergy=[{uid:'blend',cardId:'bw6-118',provides:{Colorless:1}}];
 attack(s,'player','Crimson Storm');
 assert.equal(s.sides.player.active.energy.Fire,0);
 assert.equal(s.sides.player.active.energy.Water,2);
 assert.equal(s.sides.player.active.specialEnergy.length,1);
 assert.equal(s.sides.player.active.specialEnergy[0].uid,'blend');
}));
