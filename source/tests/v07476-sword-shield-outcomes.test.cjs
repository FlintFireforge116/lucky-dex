'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm12-4'){
 const old=data.cardById,dummy={id:'sm6-dummy',name:'Test target',kind:'pokemon',stage:'Basic',hp:1000,types:['Colorless'],subtype:'Colorless',retreat:1,battleEnabled:true,deckEligible:true,attacks:[{name:'Tap',cost:[],damage:10,effect:{type:'noop'}}],abilities:[]};data.cardById=x=>x===dummy.id?dummy:old(x);
 const s=structuredClone(baseBattle||(baseBattle=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:32132,firstSide:'player',playerEnergyTypes:['Psychic','Fighting'],opponentEnergyTypes:['Psychic','Fighting']})));s.phase='battle';s.activeSide=side;s.turnNumber=7;
 const foe=side==='player'?'opponent':'player';
 for(const name of ['player','opponent']){let b=s.sides[name];b.turnCount=4;b.hand=[];b.deck=Array.from({length:15},(_,i)=>ref('sm6-1',name+'d'+i));b.prizes=Array.from({length:5},(_,i)=>ref('sm6-1',name+'p'+i));b.discard=[];b.energyDiscard={};b.energySupply=['Psychic','Fighting','Psychic'];b.active=slot(name===side?id:dummy.id,name+'a',{Grass:3,Psychic:3,Fighting:3,Metal:3,Colorless:3});b.bench=[slot(dummy.id,name+'b')];b.bench[0].benchSlot=0;}
 return {s,side,foe,us:s.sides[side],them:s.sides[foe],done:()=>data.cardById=old};
}
function use(h,type,find=()=>true){const a=core.legalActions(h.s,h.s.choiceSide||h.side).find(x=>x.type===type&&find(x));assert.ok(a,`${type}: ${JSON.stringify(core.legalActions(h.s,h.s.choiceSide||h.side))}`);core.applyAction(h.s,h.s.choiceSide||h.side,a);return a;}
function attack(h,name){const idx=data.cardById(h.us.active.cardId).attacks.findIndex(a=>a.name===name);return use(h,'attack',a=>a.attackIndex===idx);}
function choice(h,pred){return use(h,'effectChoice',pred);}
function trainer(h,id){h.us.hand.push(ref(id,'trainer'));return use(h,'trainer',a=>a.cardId===id);}
const sets=[require('../app/src/main/assets/tcg-classic-sword-shield.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Sword & Shield attack executes',()=>{
  let count=0;const failures=[];for(const c of sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];attack(h,a.name);resolve(h);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}

for(const side of ['player','opponent']){
 test(side+' VMAX evolves from matching V, not ordinary Pokemon; preserves damage and energy',()=>{const h=setup(side,'swsh1-79');try{assert.ok(data.cardById('swsh1-79').battleEnabled);assert.ok(data.cardById('swsh1-80').battleEnabled);h.us.active.damage=30;h.us.active.energy={Lightning:2};h.us.hand=[ref('swsh1-80','vmax')];assert.equal(core.legalActions(h.s,side).filter(a=>a.type==='evolve').length,1);h.us.active.cardId='swsh1-78';assert.equal(core.legalActions(h.s,side).filter(a=>a.type==='evolve').length,0);h.us.active.cardId='swsh1-79';use(h,'evolve');assert.equal(h.us.active.cardId,'swsh1-80');assert.equal(h.us.active.damage,30);assert.equal(h.us.active.energy.Lightning,2);}finally{h.done();}});
 test(side+' V and VMAX KO awards 2 and 3 Prizes',()=>{for(const [id,expected] of [['swsh1-79',2],['swsh1-80',3]]){const h=setup(side,'sm115-9');try{h.us.active.energy={Fire:4,Colorless:4};h.them.active=slot(id,'foe');h.them.active.damage=data.cardById(id).hp-10;attack(h,'Flamethrower');resolve(h);assert.equal(h.us.prizesTaken,expected);}finally{h.done();}}});
 test(side+' Snorlax VMAX G-Max Fall counts own bench, not opposing bench',()=>{const h=setup(side,'swsh1-142');try{h.us.active.energy={Colorless:3};h.us.bench.push({...slot('sm6-dummy','second'),benchSlot:1});attack(h,'G-Max Fall');resolve(h);assert.equal(h.them.active.damage,120);}finally{h.done();}});
 test(side+' Keldeo V Secret Sword counts Water, not Colorless',()=>{const h=setup(side,'swsh1-53');try{h.us.active.energy={Water:3,Colorless:2};attack(h,'Secret Sword');resolve(h);assert.equal(h.them.active.damage,140);}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Dauntless Shield blocks VMAX damage but not ordinary V attacks',()=>{for(const id of ['swsh1-80','swsh1-79']){const h=setup(side,id);try{h.us.active.energy={Lightning:4,Colorless:4};h.them.active=slot('swsh1-139','shield');attack(h,id==='swsh1-80'?'Max Discharge':'Spark');resolve(h);assert.equal(h.them.active.damage,id==='swsh1-80'?0:20);}finally{h.done();}}});
 test(side+' Evolution Incense can retrieve a VMAX but not a Basic V',()=>{const h=setup(side,'swsh1-79');try{h.us.deck=[ref('swsh1-79','v'),ref('swsh1-80','vmax')];trainer(h,'swsh1-163');resolve(h);assert.deepEqual(h.us.hand.map(r=>r.uid),['vmax']);}finally{h.done();}});
 test(side+' Potion heals only the selected friendly Pokemon',()=>{const h=setup(side,'swsh1-79');try{h.us.active.damage=40;h.us.bench[0].damage=50;h.us.hand.push(ref('swsh1-177','potion'));use(h,'trainer',a=>a.cardId==='swsh1-177'&&a.target==='bench');resolve(h);assert.equal(h.us.active.damage,40);assert.equal(h.us.bench[0].damage,20);}finally{h.done();}});
 test(side+' Pokemon Catcher chooses the opposing bench on heads',()=>{const h=setup(side,'swsh1-79');try{h.s.rngState=1;const uid=h.them.bench[0].uid;trainer(h,'swsh1-175');assert.equal(h.s.phase,'effectChoice');assert.equal(h.s.choiceSide||side,side);resolve(h);assert.equal(h.them.active.uid,uid);}finally{h.done();}});
 test(side+' Crushing Hammer discards one chosen opposing attachment',()=>{const h=setup(side,'swsh1-79');try{h.s.rngState=1;h.them.active.energy={Fire:2};h.them.bench[0].energy={Water:2};trainer(h,'swsh1-159');assert.equal(h.s.phase,'effectChoice');assert.equal(h.s.choiceSide||side,side);resolve(h,a=>a.choiceTarget==='bench');assert.equal(h.them.active.energy.Fire,2);assert.equal(h.them.bench[0].energy.Water,1);}finally{h.done();}});
 test(side+' Big Charm and Air Balloon affect their own holder only',()=>{const h=setup(side,'swsh1-79');try{h.us.active.tool=ref('swsh1-158','charm');h.us.bench[0].tool=ref('swsh1-156','balloon');assert.equal(fx.modifierAmount(h.s,side,h.us.active,'maxHp',data.cardById),30);assert.equal(fx.modifierAmount(h.s,side,h.us.bench[0],'maxHp',data.cardById),0);assert.equal(fx.modifierAmount(h.s,side,h.us.bench[0],'retreatCost',data.cardById),-2);}finally{h.done();}});
}
