'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'app/src/main/assets');
const data=require(path.join(dir,'tcg-classic-battle-data.js'));
const effects=require(path.join(dir,'tcgp-battle-effects.js'));
const core=require(path.join(dir,'tcgp-battle-core.js'));
const picker=require(path.join(dir,'tcg-classic-set-picker.js'));
const bw3=require(path.join(dir,'tcg-classic-noble-victories.js'));
const ui=require(path.join(dir,'tcgp-battle-ui.js'));
const uiSource=fs.readFileSync(path.join(dir,'tcgp-battle-ui.js'),'utf8');
const xy1=require(path.join(dir,'tcg-classic-xy-base.js'));
const xy2=require(path.join(dir,'tcg-classic-flashfire.js'));
const slot=cardId=>({uid:cardId,cardId,stack:[cardId],energy:{},specialEnergy:[],conditions:{},damage:0,locks:[]});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:8,sides:{player:{active:slot('bw1-26'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Fire','Grass'],turnCount:3,prizes:[]},opponent:{active:slot('bw3-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Fire','Grass'],turnCount:3,prizes:[]}},log:[],rngState:17});

test('all three original 130 HP Reshiram print attacks have canonical costs and payable Fire',()=>{
 for(const id of ['bw1-26','bw1-113','bw4-21']){
  const c=data.cardById(id);assert.equal(c?.hp,130,id);
  assert.deepEqual(c.attacks.map(a=>[a.name,a.cost,a.damage]),[['Outrage','CC',20],['Blue Flare','RRC',120]],id);
  assert.equal(effects.canPayCost({Fire:2},'CC'),true,id+' 2 Fire covers 2 Colorless');
  assert.equal(effects.canPayCost({Fire:2},'RRC'),false,id+' requires three units');
  assert.equal(effects.canPayCost({Fire:3},'RRC'),true,id+' three Fire covers both red + Colorless');
  assert.equal(effects.canPayCost({Fire:2,Water:1},'RRC'),true,id+' mixed non-Fire covers Colorless');
  const s=scene();s.sides.player.active=slot(id);s.sides.player.active.energy={Fire:2};
  assert.equal(core.attackAvailability(s,'player',0).cost,'CC',id);
  assert.equal(core.attackAvailability(s,'player',1).cost,'RRC',id);
  assert.equal(core.effectiveEnergy(s,'player',s.sides.player.active).Fire,2,id);
 }
});


test('array-form legacy attack symbols never create comma Energy or block legal Fire payments',()=>{
 assert.equal(effects.canPayCost({Fire:2},['C','C']),true);
 assert.equal(effects.canPayCost({Fire:3},['R','R','C']),true);
 assert.equal(core.energyCostLabel(['R','R','C']),'2 Fire + 1 Colourless');
 const html=ui._test.energyCostHtml(['R','R','C']);
 assert.equal((html.match(/tcgp-energy-icon cost/g)||[]).length,3);
 assert.ok(!html.includes('data-energy=","'), 'comma must never become an Energy icon');
 const card=data.cardById('bw1-26'),printed=card.attacks[0].cost;
 try{
  card.attacks[0].cost=['C','C'];
  const s=scene();s.sides.player.active.energy={Fire:2};
  assert.equal(core.attackAvailability(s,'player',0).cost,'CC');
  assert.equal(core.attackAvailability(s,'player',0).reason,'Ready');
 }finally{card.attacks[0].cost=printed;}
});

test('Vanilluxe Double Freeze resolves both damage and normal visible two-coin log',()=>{
 const c=bw3.cardById('bw3-29'),a=c.attacks[0];
 assert.equal(a.name,'Double Freeze');assert.equal(a.cost,'WC');
 assert.deepEqual(a.effect,{type:'coinDamageStatus',coins:2,amount:40,minHeads:1,status:'paralysis'});
 assert.deepEqual(effects.validateEffect(a.effect),[]);
 for(const [results,damage,paralyzed] of [ [[false,false],0,false],[[false,true],40,true],[[true,true],80,true] ]){
  const s=scene();s.sides.player.active=slot('bw3-29');
  let i=0;const r=effects.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,
    defender:s.sides.opponent.active,cardById:data.cardById,random:()=>results[i++]?.2:.8,isAttack:true});
  assert.equal(r.damage,damage,results.join(','));
  const toss=s.log.filter(x=>x.type==='coin');assert.equal(toss.length,1);assert.deepEqual(toss[0].results,results);
  assert.equal(r.pendingEffects.some(e=>e.type==='status'&&e.status==='paralysis'),paralyzed);
 }
 assert.match(uiSource,/entries\.filter\(e=>e\.type==='coin'\)/,'real logged coin events are animated');
});

test('Flash Claw has a real defending-player discard choice (not Scratch)',()=>{
 // This reuses a battle-ready print as a controlled fixture because XY
 // catalogues are only generated in the GitHub Gradle build pipeline.
 const card=data.cardById('bw1-26'),attack=card.attacks[0],saved={effect:attack.effect,damage:attack.damage};
 try{
  attack.effect={type:'neoRule',rule:'xy2:flashClaw'};attack.damage=0;
  const s=scene();s.sides.player.active.energy={Fire:2};
  s.sides.opponent.hand=[{uid:'hand-1',cardId:'bw1-26'},{uid:'hand-2',cardId:'bw1-113'}];
  const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
  assert.ok(action);core.applyAction(s,'player',action);
  assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
  const choices=core.legalActions(s,'opponent');assert.equal(choices.length,2);
  core.applyAction(s,'opponent',choices[1]);
  assert.deepEqual(s.sides.opponent.discard.map(x=>x.uid),['hand-2']);
  assert.deepEqual(s.sides.opponent.hand.map(x=>x.uid),['hand-1']);
 }finally{attack.effect=saved.effect;attack.damage=saved.damage;}
});

test('XY is an actual visible era in both player and opponent selectors',()=>{
 assert.ok(picker.eras?.includes('XY')||picker.html({ids:['xy1','xy2'],selected:['xy1','xy2']}).includes('data-set-era="XY"'));
 for(const mode of ['classic','opponent']){
  const h=picker.html({ids:['xy1','xy2'],selected:['xy1','xy2'],mode});
  assert.match(h,/data-set-era="XY"/);assert.match(h,/data-set-choice="xy1"/);assert.match(h,/data-set-choice="xy2"/);
 }
});

test('APK must embed real XY sets and not ship empty build-time placeholders',()=>{
 assert.equal(xy1.CARDS.length,146,'XY Base must be present in packaged APK assets');
 assert.equal(xy2.CARDS.length,110,'Flashfire must be present in packaged APK assets');
 assert.ok(data.cardById('xy1-1'),'XY Base in Classic registry');
 assert.ok(data.cardById('xy2-1'),'Flashfire in Classic registry');
});
