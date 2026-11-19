'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(A+'/tcgp-battle-core.js'),fx=require(A+'/tcgp-battle-effects.js'),data=require(A+'/tcg-classic-battle-data.js'),opponents=require(A+'/tcg-classic-opponents.js');
const generated=opponents.generate({sets:['ecard3'],seed:125,type:'Water'});
assert.ok(generated.ok);
let serial=0;
function scene(){
 const state=core.createBattle({format:'classic',playerDeck:generated.cards,opponentDeck:generated.cards,seed:300+serial++,firstSide:'player',playerEnergyTypes:['Water','Fire','Grass','Lightning','Darkness','Metal'],opponentEnergyTypes:['Fire','Grass']});
 state.phase='battle';state.activeSide='player';state.turnNumber=8;
 for(const side of ['player','opponent']){const p=state.sides[side];p.turnCount=3;p.active=core.makePokemonSlot('ecard3-54',3,side+'-active');p.hand=[];p.discard=[];p.energyDiscard={};p.supporterUsed=false;}
 return state;
}
function cast(s,e){fx.applyEffect(e,core.effectContext(s,'player',{},s.sides.player.active));}
function picks(s){assert.equal(s.phase,'effectChoice','expected a visible recovery choice');return core.legalActions(s,s.choiceSide);}
function choose(s,where){const choices=picks(s),act=choices.find(where);assert.ok(act,'desired recovery choice missing: '+JSON.stringify(choices));core.applyAction(s,s.choiceSide,act);return act;}
function recoveredTypes(s){return s.sides.player.hand.map(ref=>data.cardById(ref.cardId)?.subtype).filter(Boolean);}
const fisherman=data.cardById('ecard3-125').effect;

test('Skyridge Fisherman chooses actual Basic Energy from attachment discard ledger, not fresh Zone',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Water:2,Grass:1,Fire:1};const energySupply=p.energySupply.slice(),foe={...s.sides.opponent.energyDiscard};
 cast(s,fisherman);assert.equal(picks(s).filter(a=>a.effectEnergyType).length,3);
 choose(s,a=>a.effectEnergyType==='Water');assert.equal(p.energyDiscard.Water,1);
 choose(s,a=>a.effectEnergyType==='Water');assert.equal(p.energyDiscard.Water,0);
 choose(s,a=>a.effectEnergyType==='Grass');choose(s,a=>a.effectEnergyType==='Fire');
 assert.equal(s.phase,'battle');assert.deepEqual(recoveredTypes(s).sort(),['Fire','Grass','Water','Water']);
 assert.deepEqual(p.energyDiscard,{Water:0,Grass:0,Fire:0});assert.deepEqual(p.energySupply,energySupply);assert.deepEqual(s.sides.opponent.energyDiscard,foe);
});

test('Recovery can mix physical Basic Energy refs with discarded attachment ledger and never duplicates',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Water:1,Grass:1};p.discard=[{uid:'real-fire',cardId:'neo1-107'},{uid:'not-energy',cardId:'ecard3-125'}];
 cast(s,fisherman);let options=picks(s);assert.ok(options.some(a=>a.choiceDiscardIndex===0));assert.ok(options.some(a=>a.effectEnergyType==='Water'));
 choose(s,a=>a.choiceDiscardIndex===0);choose(s,a=>a.effectEnergyType==='Water');choose(s,a=>a.effectEnergyType==='Grass');
 assert.equal(s.phase,'battle');assert.deepEqual(recoveredTypes(s).sort(),['Fire','Grass','Water']);
 assert.equal(p.discard.length,1);assert.equal(p.discard[0].uid,'not-energy');assert.equal(p.hand[0].uid,'real-fire');
});

test('HGSS Fisherman shares fixed discard recovery and stops when available Energy is exhausted',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Lightning:2};cast(s,data.cardById('hgss1-92').effect);
 choose(s,a=>a.effectEnergyType==='Lightning');choose(s,a=>a.effectEnergyType==='Lightning');
 assert.equal(s.phase,'battle');assert.equal(recoveredTypes(s).length,2);assert.equal(p.energyDiscard.Lightning,0);
});

test('DP2 Gabite Gather Up recovers two types and does not draw from ordered supply',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Fire:1,Water:1};const before=p.energySupply.slice();
 const e=data.cardById('dp2-48').attacks.find(a=>a.name==='Gather Up').effect;
 cast(s,e);choose(s,a=>a.effectEnergyType==='Fire');choose(s,a=>a.effectEnergyType==='Water');
 assert.equal(s.phase,'battle');assert.deepEqual(recoveredTypes(s).sort(),['Fire','Water']);assert.deepEqual(p.energySupply,before);
});

test('Platinum Rising Rivals Snorlax Pick and Collect recovers all four ledger Energy',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Grass:2,Metal:2};
 const e=data.cardById('pl2-33').attacks.find(a=>a.name==='Pick and Collect').effect;
 cast(s,e);for(let i=0;i<2;i++)choose(s,a=>a.effectEnergyType==='Metal');for(let i=0;i<2;i++)choose(s,a=>a.effectEnergyType==='Grass');
 assert.equal(s.phase,'battle');assert.deepEqual(recoveredTypes(s).sort(),['Grass','Grass','Metal','Metal']);
});

test('Fisherman does not manufacture discard Energy when only fresh Energy Zone has cards',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={};p.discard=[];const before=p.energySupply.slice();
 cast(s,fisherman);assert.equal(s.phase,'battle');assert.equal(p.hand.length,0);assert.deepEqual(p.energySupply,before);
});

test('Discard recovery respects 8-card Classic hand cap without deleting excess discarded Energy',()=>{
 const s=scene(),p=s.sides.player;p.hand=Array.from({length:7},(_,i)=>({uid:'h'+i,cardId:'ecard3-125'}));p.handLimit=8;p.energyDiscard={Fire:4};
 cast(s,fisherman);choose(s,a=>a.effectEnergyType==='Fire');
 assert.equal(s.phase,'battle');assert.equal(p.hand.length,8);assert.equal(p.energyDiscard.Fire,3);
});

test('Fisherman has no selection access to opponent Energy and zero-count ledger entries',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Water:1,Grass:0};s.sides.opponent.energyDiscard={Fire:5};
 cast(s,fisherman);const options=picks(s);assert.equal(options.length,1);assert.equal(options[0].effectEnergyType,'Water');
 choose(s,a=>a.effectEnergyType==='Water');assert.equal(s.phase,'battle');assert.equal(s.sides.opponent.energyDiscard.Fire,5);
});

test('Physical discard retrieval of non-Energy cards remains unchanged',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Fire:5};p.discard=[{uid:'old-card',cardId:'ecard3-54'}];
 cast(s,{type:'searchChosen',source:'discard',amount:1,filter:{kind:'pokemon'}});
 const actions=picks(s);assert.equal(actions.length,1);assert.equal(actions[0].choiceDiscardIndex,0);
 choose(s,a=>a.choiceDiscardIndex===0);assert.equal(p.hand[0].uid,'old-card');assert.equal(p.energyDiscard.Fire,5);
});

test('Real play of Fisherman as a Supporter opens the ledger recovery menu',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Grass:2,Water:1};p.hand=[{uid:'fish-in-hand',cardId:'ecard3-125'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ecard3-125');
 assert.ok(action,'Fisherman must be a playable Supporter');core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.effectEnergyType==='Grass');choose(s,a=>a.effectEnergyType==='Water');choose(s,a=>a.effectEnergyType==='Grass');
 assert.equal(s.phase,'battle');assert.equal(p.supporterUsed,true);assert.equal(recoveredTypes(s).length,3);
});

test('Energy physically discarded by a live attack effect is retrievable immediately afterward',()=>{
 const s=scene(),p=s.sides.player;p.active.energy={Water:2};
 fx.applyEffect({type:'discardEnergyCard',target:'selfActive',amount:1},core.effectContext(s,'player',{},p.active));
 assert.equal(p.active.energy.Water,1);assert.equal(p.energyDiscard.Water,1);
 cast(s,fisherman);choose(s,a=>a.effectEnergyType==='Water');
 assert.equal(p.energyDiscard.Water,0);assert.equal(recoveredTypes(s).includes('Water'),true);
});

test('Advanced CPU can resolve a Fisherman ledger selection without getting stuck',()=>{
 const ai=require(A+'/tcgp-battle-ai.js');const s=scene(),p=s.sides.player;p.energyDiscard={Water:2,Fire:1};
 cast(s,data.cardById('hgss1-92').effect);
 let steps=0;while(s.phase==='effectChoice'&&steps++<6){const a=ai.chooseAction(s,'player','Advanced',steps);const act=a?.action||a;assert.ok(act?.type==='effectChoice');core.applyAction(s,'player',act);}
 assert.equal(s.phase,'battle');assert.equal(p.hand.length,3);assert.equal(p.energyDiscard.Water,0);assert.equal(p.energyDiscard.Fire,0);
});
