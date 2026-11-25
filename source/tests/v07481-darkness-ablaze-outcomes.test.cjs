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
const sets=[require('../app/src/main/assets/tcg-classic-darkness-ablaze.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Darkness Ablaze attack executes',()=>{
  let count=0;const failures=[];for(const c of sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];attack(h,a.name);resolve(h);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}

for(const side of ['player','opponent']){
 test(side+' Mad Party counts discarded Pokémon with the named attack',()=>{const h=setup(side,'swsh3-78');try{h.us.discard=[ref('swsh3-78','d1'),ref('swsh3-150','d2'),ref('swsh3-3','d3')];attack(h,'Mad Party');resolve(h);assert.equal(h.them.active.damage,40);}finally{h.done();}});
 test(side+' X Ball counts Energy provided by both active Pokémon',()=>{const h=setup(side,'swsh3-69');try{h.us.active.energy={Psychic:2};h.them.active.energy={Water:1};h.them.active.specialEnergy=[{...ref('sm1-136','dce'),provides:{Colorless:2}}];attack(h,'X Ball');resolve(h);assert.equal(h.them.active.damage,150);}finally{h.done();}});
 test(side+' Bright Heal heals all friendly Pokémon only',()=>{const h=setup(side,'swsh3-39');try{h.us.active.damage=50;h.us.bench[0].damage=10;h.them.active.damage=60;use(h,'ability');resolve(h);assert.equal(h.us.active.damage,30);assert.equal(h.us.bench[0].damage,0);assert.equal(h.them.active.damage,60);}finally{h.done();}});
 test(side+' Capture Energy reprint retains physical attachment and benches selected Basic',()=>{const h=setup(side,'swsh3-69');try{h.us.hand=[ref('swsh3-201','capture')];h.us.deck.unshift(ref('swsh3-3','chosen'));use(h,'attachSpecial',a=>a.target==='active');choice(h,a=>a.choiceCardId==='swsh3-3');resolve(h);assert.ok(h.us.bench.some(p=>p.uid==='chosen'));assert.equal(h.us.active.specialEnergy[0].uid,'capture');}finally{h.done();}});
 test(side+' Cape of Toughness distinguishes Basic V, GX and evolved Pokémon',()=>{const h=setup(side,'swsh3-19');try{h.us.active.tool=ref('swsh3-160','cape');for(const [id,bonus] of [['swsh3-19',50],['swsh3-3',50],['sm12-4',0],['swsh3-20',0]]){h.us.active.cardId=id;assert.equal(core.maxHp(h.s,side,h.us.active),data.cardById(id).hp+bonus,id);}}finally{h.done();}});
 test(side+' Swoop Across damages active and every opposing bench',()=>{const h=setup(side,'swsh3-143');try{h.us.active.energy={Colorless:3};h.them.bench.push(slot('sm6-dummy','extra'));attack(h,'Swoop Across');resolve(h);assert.equal(h.them.active.damage,30);assert.deepEqual(h.them.bench.map(p=>p.damage),[30,30]);}finally{h.done();}});
 test(side+' Power Whip counts double Energy on attacker and hits one selected target',()=>{const h=setup(side,'swsh3-16');try{h.us.active.energy={Grass:1};h.us.active.specialEnergy=[{...ref('sm1-136','dce'),provides:{Colorless:2}}];attack(h,'Power Whip');resolve(h);assert.equal(h.them.active.damage+h.them.bench[0].damage,60);}finally{h.done();}});
}
