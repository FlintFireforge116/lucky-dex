'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm6-56'){
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
const set=require('../app/src/main/assets/tcg-classic-forbidden-light.js');
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));
for(const side of ['player','opponent']){
 test(side+' every printed attack executes and exits effect choice with real catalogue cards',()=>{
  let count=0;const failures=[];
  for(const c of set.CARDS.filter(c=>c.kind==='pokemon'))for(const [idx,a] of c.attacks.entries()){
   const h=setup(side,c.id);try{
    h.us.active.energy={...allEnergy};h.us.prizes.length=h.them.prizes.length=3;
    h.us.bench=['sm6-1','sm6-21','sm6-36'].map((id,i)=>({...slot(id,side+'b'+i,{Water:1}),benchSlot:i}));
    h.us.hand=[ref('sm6-108','judge'),ref('neo1-111','water'),ref('sm6-1','grass')];
    h.us.discard=[ref('sm6-112','tool'),ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];
    h.us.energyDiscard={Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;
    h.them.hand=[ref('sm6-108','foe-judge'),ref('sm6-112','foe-tool')];
    h.them.bench[0].specialEnergy=[ref('sm6-118','foe-unit')];
    if(a.name==='Psychic Abduction'){h.s.firstSide=h.foe;h.us.turnCount=1;h.s.turnNumber=2;}
    const actions=core.legalActions(h.s,side).filter(x=>x.type==='attack'&&x.attackIndex===idx);
    assert.ok(actions.length,'no legal attack');core.applyAction(h.s,side,actions[0]);
    let steps=0;while(h.s.phase==='effectChoice'&&steps++<40){const who=h.s.choiceSide||side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length,'empty choice');core.applyAction(h.s,who,choices.find(x=>!x.choiceSkip)||choices[0]);}
    assert.notEqual(h.s.phase,'effectChoice','stuck effect choice');count++;
   }catch(e){failures.push(`${c.id} ${a.name}: ${e.message}`);}finally{h.done();}
  }
  assert.deepEqual(failures,[]);assert.equal(count,211);
 });
 test(side+' Act Tough recognises Darkness provided by an attached Unit Energy',()=>{const h=setup(side,'sm6-65');try{h.us.active.energy={Fighting:1};h.us.active.specialEnergy=[ref('sm6-118','unit')];attack(h,'Act Tough');assert.equal(h.them.active.damage,40);}finally{h.done();}});
 test(side+' Hyperspace Ring can search a printed Item Tool, but not Supporter',()=>{const h=setup(side,'sm6-54');try{h.us.deck=[ref('sm6-112','pan'),ref('sm6-106','item'),ref('sm6-108','judge')];attack(h,'Hyperspace Ring');const choices=core.legalActions(h.s,side);assert.ok(choices.some(a=>a.choiceCardId==='sm6-112'));assert.ok(!choices.some(a=>a.choiceCardId==='sm6-108'));choice(h,a=>a.choiceCardId==='sm6-112');assert.ok(h.us.hand.some(r=>r.uid==='pan'));}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Overrun requires a Bench target when available and still deals 20 Active damage when there is none',()=>{
  const h=setup(side,'sm6-90');try{h.us.active.energy.Fairy=1;attack(h,'Overrun');assert.equal(h.them.active.damage,20);const cs=core.legalActions(h.s,side);assert.ok(cs.some(a=>a.choiceTarget==='bench'));assert.ok(!cs.some(a=>a.choiceSkip));choice(h,a=>a.choiceTarget==='bench');assert.equal(h.them.bench[0].damage,20);}finally{h.done();}
  const j=setup(side,'sm6-90');try{j.us.active.energy.Fairy=1;j.them.bench=[];attack(j,'Overrun');assert.equal(j.them.active.damage,20);assert.notEqual(j.s.phase,'effectChoice');}finally{j.done();}
 });
 test(side+' Act Tough does not boost on unrelated Unit Energy or basic Fighting alone',()=>{const h=setup(side,'sm6-65');try{h.us.active.energy={Fighting:1};h.us.active.specialEnergy=[ref('sm5-137','unit')];attack(h,'Act Tough');assert.equal(h.them.active.damage,10);}finally{h.done();}});
}
