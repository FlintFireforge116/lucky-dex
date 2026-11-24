'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm9-1'){
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
const set=require('../app/src/main/assets/tcg-classic-team-up.js');
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));
for(const side of ['player','opponent']){
 test(side+' every enabled attack executes and exits effect choice with real catalogue cards',()=>{
  let count=0;const failures=[];
  for(const c of set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const [idx,a] of c.attacks.entries()){
   const h=setup(side,c.id);try{
    h.us.active.energy={...allEnergy};h.us.prizes.length=h.them.prizes.length=3;
    h.us.bench=['sm6-1','sm6-21','sm6-36'].map((id,i)=>({...slot(id,side+'b'+i,{Water:1}),benchSlot:i}));
    h.us.hand=[ref('sm6-108','judge'),ref('neo1-111','water'),ref('sm6-1','grass')];
    h.us.discard=[ref('sm6-112','tool'),ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];
    h.us.energyDiscard={Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.bench[0].damage=10;
    h.them.hand=[ref('sm6-108','foe-judge'),ref('sm6-112','foe-tool')];
    h.them.bench[0].specialEnergy=[ref('sm6-118','foe-unit')];
    if(a.name==='Destiny Stinger')h.us.active.damage=10;
    if(['Psychic Abduction','Bawl','Secondary Chills'].includes(a.name)){h.s.firstSide=h.foe;h.us.turnCount=1;h.s.turnNumber=2;}
    const actions=core.legalActions(h.s,side).filter(x=>x.type==='attack'&&x.attackIndex===idx);
    assert.ok(actions.length,'no legal attack');core.applyAction(h.s,side,actions[0]);
    let steps=0;while(h.s.phase==='effectChoice'&&steps++<100){const who=h.s.choiceSide||side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length,'empty choice');core.applyAction(h.s,who,choices.find(x=>!x.choiceSkip)||choices[0]);}
    assert.notEqual(h.s.phase,'effectChoice','stuck effect choice');count++;
   }catch(e){failures.push(`${c.id} ${a.name}: ${e.message}`);}finally{h.done();}
  }
  assert.deepEqual(failures,[]);assert.equal(count,set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });

}
function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<40){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}

for(const side of ['player','opponent']){
 test(side+' Tag Bolt GX requires three additional Lightning units for Bench damage',()=>{for(const n of [5,6]){const h=setup(side,'sm9-33');try{h.us.active.energy={Lightning:n};attack(h,'Tag Bolt-GX');resolve(h);assert.equal(h.them.active.damage,200);assert.equal(h.them.bench[0].damage,n===6?170:0);}finally{h.done();}}});
 test(side+' Towering Splash GX requires seven extra Water units',()=>{for(const n of [7,8]){const h=setup(side,'sm9-160');try{h.us.active.energy={Water:n};attack(h,'Towering Splash-GX');resolve(h);assert.equal(h.them.bench[0].damage,n===8?100:0);}finally{h.done();}}});
 test(side+' Evergreen GX heals regardless of bonus and recycles discard only with extra Grass',()=>{for(const extra of [false,true]){const h=setup(side,'sm9-1');try{h.us.active.energy={Grass:3,Colorless:extra?2:1};h.us.active.damage=90;h.us.discard=[ref('sm6-1','recycle')];h.us.energyDiscard={Grass:2};attack(h,'Evergreen-GX');resolve(h);assert.equal(h.us.active.damage,0);assert.equal(h.us.deck.some(x=>x.uid==='recycle'),extra);assert.equal(h.us.discard.some(x=>x.uid==='recycle'),!extra);assert.equal(h.us.energyDiscard.Grass||0,extra?0:2);}finally{h.done();}}});
 test(side+' Full Blitz attaches selected physical Lightning Energy to one chosen recipient',()=>{const h=setup(side,'sm9-33');try{h.us.active.energy={Lightning:3};h.us.deck.unshift(...[0,1,2].map(i=>ref('neo1-109','light'+i)));attack(h,'Full Blitz');choice(h,a=>a.choiceTarget==='bench');choice(h,a=>a.choiceOption===2);resolve(h);assert.equal(h.us.active.energy.Lightning,3);assert.equal(h.us.bench[0].energy.Lightning,2);assert.equal(h.us.deck.filter(x=>x.uid.startsWith('light')).length,1);}finally{h.done();}});
 test(side+' actual TAG TEAM knockout awards three Prizes',()=>{const h=setup(side,'sm9-33');try{h.us.active.energy={Lightning:3};h.them.active={...slot('sm9-1','tag'),damage:100};const before=h.us.prizes.length;attack(h,'Tag Bolt-GX');resolve(h);assert.equal(h.us.prizes.length,before-3);}finally{h.done();}});
}
