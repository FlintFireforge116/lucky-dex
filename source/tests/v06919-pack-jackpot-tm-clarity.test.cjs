const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Policy=require('../app/src/main/assets/pack-policy-v0343.js');
const Rarity=require('../app/src/main/assets/card-rarity-v0253.js');
const Tools=require('../app/src/main/assets/adventure/adventure-tools.js');
const Progress=require('../app/src/main/assets/adventure/adventure-progression.js');

const classify=(card,set)=>Rarity.classify(card,set);
const pitch={id:'me5',name:'Pitch Black',series:'Mega Evolution',releaseDate:'2026-07-17',cards:[
  {id:'rare',name:'Regular Rare',rarity:'Rare'},
  {id:'sir',name:'Illustration Hit',rarity:'Special Illustration Rare'},
  {id:'hyper',name:'Mega Darkrai ex',rarity:'Mega Hyper Rare'}
]};

test('physical secret jackpot gate keeps jackpot cards to one sixth of secret opportunities',()=>{
  assert.equal(Policy.PHYSICAL_JACKPOT_SECRET_SHARE,1/6);
  const descriptor=Policy.slotPlan(pitch,{source:'tcg'}).find(row=>row.id==='foil-2');
  const jackpot=Policy.refinePhysicalTargetPlan(pitch,descriptor,pitch.cards,['secret'],classify,()=>0);
  assert.equal(jackpot.secretMode,'jackpot');
  assert.equal(Policy.targetPlanMatches(pitch.cards[2],jackpot,pitch,classify),true);
  assert.equal(Policy.targetPlanMatches(pitch.cards[1],jackpot,pitch,classify),false);

  const normal=Policy.refinePhysicalTargetPlan(pitch,descriptor,pitch.cards,['secret'],classify,()=>0.5);
  assert.equal(normal.secretMode,'downgraded');
  assert.deepEqual(normal.targets,['special-illustration']);
  assert.equal(Policy.targetPlanMatches(pitch.cards[1],normal,pitch,classify),true);
  assert.equal(Policy.targetPlanMatches(pitch.cards[2],normal,pitch,classify),false);
});

test('ordinary Secret Rares remain the default secret hit when a set also has a jackpot secret',()=>{
  const set={...pitch,cards:[...pitch.cards,{id:'secret',name:'Ordinary Secret',rarity:'Secret Rare'}]};
  const descriptor=Policy.slotPlan(set,{source:'tcg'}).find(row=>row.id==='foil-2');
  const plan=Policy.refinePhysicalTargetPlan(set,descriptor,set.cards,['secret'],classify,()=>0.5);
  assert.equal(plan.secretMode,'ordinary');
  assert.equal(Policy.targetPlanMatches(set.cards[3],plan,set,classify),true);
  assert.equal(Policy.targetPlanMatches(set.cards[2],plan,set,classify),false);
});

test('TM Case explains that TMs are shared and permanent across Collection and Journey',()=>{
  const save={pokemon:{'25:n':{id:25,name:'Pikachu',count:1,level:30,moves:[84],tmLearned:[]}},team:['25:n'],profile:{coins:0,xp:0},inventory:{},tmInventory:{85:1},adventureRegional:{active:{phase:'map',leadKey:'25:n',party:[{key:'25:n',id:25,name:'Pikachu',level:20,moves:[84],pendingMoves:[],tmLearned:[],hp:50,maxHp:50,pp:{84:20}}]}}};
  Progress.ensureSave(save);
  const html=Tools.markup(save,'moves',{key:'25:n',moveTab:'tm'});
  assert.match(html,/shared/i);
  assert.match(html,/permanent/i);
  assert.match(html,/Collection/i);
  assert.match(html,/Journey/i);
  assert.match(Tools.learningScopeLabel({tm:true,scope:'owned'}),/Collection \+ Journey/i);
});

test('physical pack picker applies the refined jackpot target plan',()=>{
  const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(app,/refinePhysicalTargetPlan/);
  assert.match(app,/targetPlanMatches/);
});
