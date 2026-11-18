'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const db=require('../app/src/main/assets/tcg-classic-battle-data.js');
function getFixture(id, type){
  const cards={
    'pl4-92':{id:'pl4-92',name:'Dome Fossil',kind:'trainer'},
    'pl4-93':{id:'pl4-93',name:'Helix Fossil',kind:'trainer'},
    'pl4-67':{id:'pl4-67',name:'Kabuto',evolvesFrom:'Dome Fossil',kind:'pokemon',battleEnabled:true},
    'pl4-70':{id:'pl4-70',name:'Omanyte',evolvesFrom:'Helix Fossil',kind:'pokemon',battleEnabled:true},
    'pl4-99':{id:'pl4-99',name:'Tangrowth',kind:'pokemon',battleEnabled:true}
  };
  const fossil={cardId:id,uid:'fossil-a',stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{}};
  const player={active:{cardId:'pl4-99',uid:'active-a',stack:['pl4-99'],energy:{}},bench:[fossil],deck:[{uid:'evo-k',cardId:'pl4-67'},{uid:'evo-o',cardId:'pl4-70'}],discard:[],turnCount:2};
  const opponent={active:{cardId:'pl4-99',uid:'active-b',stack:['pl4-99'],energy:{}},bench:[],deck:[],discard:[]};
  const state={format:'classic',turnNumber:5,activeSide:'player',sides:{player,opponent},log:[]};let pending=null;
  const ctx={state,side:'player',foeSide:'opponent',attacker:fossil,defender:opponent.active,eventData:{fromHand:true,energyType:type},cardById:cardId=>cards[cardId]||null,requestChoice:choice=>{pending=choice;},shuffle:()=>{}};
  return {ctx,player,fossil,pending:()=>pending};
}
test('Fossil reaction only offers compatible direct evolution on correct energy from hand',()=>{
 const f=getFixture('pl4-92','Fighting');fx.applyEffect({type:'neoRule',rule:'pl4:fossilReaction'},f.ctx);
 const choice=f.pending();assert.deepEqual(choice.options,['Do not evolve Fossil','Evolve into Kabuto']);
 fx.applyEffect(choice.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:1}});
 assert.deepEqual(f.fossil.stack,['pl4-92','pl4-67']);assert.equal(f.player.deck.length,1);
});
test('Fossil reaction does not offer wrong type or Zone-attachment evolutions',()=>{
 const bad=getFixture('pl4-93','Fighting');fx.applyEffect({type:'neoRule',rule:'pl4:fossilReaction'},bad.ctx);assert.equal(bad.pending(),null);
 const zone=getFixture('pl4-93','Water');zone.ctx.eventData.fromHand=false;fx.applyEffect({type:'neoRule',rule:'pl4:fossilReaction'},zone.ctx);assert.equal(zone.pending(),null);
});
test('Owned collector quantities are not truncated to 1',()=>{
 const owned=db.projectOwnedCards([{source:'tcg',setId:'pl3',number:'1',quantity:3},{source:'tcg',setId:'pl3',number:'2',quantity:2}]);
 assert.equal(owned.find(x=>x.gameplayId==='pl3-1')?.quantity,3);
 assert.equal(owned.find(x=>x.gameplayId==='pl3-2')?.quantity,2);
 // The authenticated pl4 projection is checked separately by v07275 after generation.
});
test('Fossils are mapped to real printed passive and attachment-triggered abilities',()=>{
 const src=fs.readFileSync(path.join(root,'scripts/pl4_completion.py'),'utf8');
 assert.match(src,/\('89','Hard Amber'\)/);assert.match(src,/\('92','Rock Reaction'\)/);assert.match(src,/\('93','Aqua Reaction'\)/);
 assert.equal(fx.validateEffect({type:'modifier',stat:'retreatCost',amount:-10,scope:'self',duration:'nextOwnTurn'}).length,0);
});
