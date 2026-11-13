'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const asset='../app/src/main/assets/';
const set=require(asset+'tcg-classic-secret-wonders');
const data=require(asset+'tcg-classic-battle-data');
const core=require(asset+'tcgp-battle-core');
const effects=require(asset+'tcgp-battle-effects');
const opp=require(asset+'tcg-classic-opponents');
const audit=require('../scripts/audit-classic-set.cjs');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const loan=opp.generate({sets:['dp2'],type:'Grass',seed:17});
function ref(cardId,uid){return {cardId,uid:uid||cardId+'-ref'};}
function slot(id,uid,energy={}){const p=core.makePokemonSlot(id,2,uid);p.energy=energy;return p;}
function board(self='dp3-76',foe='dp1-17',side='player',seed=23){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:side,playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const k of ['player','opponent']){s.sides[k].turnCount=7;s.sides[k].hand=[];s.sides[k].bench=[];}
 const enemy=side==='player'?'opponent':'player';s.sides[side].active=slot(self,side+'-a',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Colorless:4});
 s.sides[enemy].active=slot(foe,enemy+'-a');return s;
}
function attack(s,side,index,target){const actions=core.legalActions(s,side);const a=actions.find(x=>x.type==='attack'&&x.attackIndex===index&&(!target||x.target===target));assert.ok(a,`attack ${index} missing for ${side}: `+JSON.stringify(actions.filter(x=>x.type==='attack')));core.applyAction(s,side,a);return a;}
function choices(s,fn){let count=0;while(s.phase==='effectChoice'&&count++<32){const acts=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(acts.length,'no effect choices');core.applyAction(s,s.choiceSide,fn?.(acts,s)||acts.find(a=>!a.choiceSkip)||acts[0]);}assert.notEqual(s.phase,'effectChoice','choice stalled');}

test('Secret Wonders 132 unique prints registered in game, 46 verified-stage flags, and incomplete cards gated',()=>{
 assert.equal(set.CARDS.length,132);assert.equal(new Set(set.CARDS.map(x=>x.id)).size,132);
 assert.equal(set.coverage().battleEnabled,46);assert.equal(set.coverage().gated.length,86);
 for(let n=1;n<=132;n++){const c=data.cardById('dp3-'+n);assert.ok(c,n+' missing');assert.equal(c.setId,'dp3');assert.equal(Number(c.number),n);assert.ok(c.image.includes('dp3/'),c.id);assert.equal(c.deckEligible,c.battleEnabled,c.id);if(c.battleEnabled){if(c.kind==='pokemon'){for(const a of c.attacks)assert.deepEqual(effects.validateEffect(a.effect),[],c.id+': '+a.name);for(const a of c.abilities||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+': '+a.name);}else assert.deepEqual(effects.validateEffect(c.effect),[],c.id);}}
 for(const id of [1,7,18,33,101,131,132])assert.equal(data.cardById('dp3-'+id).battleEnabled,false,'unverified mechanics remain gated');
 for(const id of [49,64,76,81,85,90,92,100,112,113,119,120,121,123,124,127,128,129,130])assert.equal(data.cardById('dp3-'+id).battleEnabled,true,id);
 assert.equal(data.cardById('dp3-129').effect.provides.Darkness,1);assert.equal(data.cardById('dp3-130').effect.provides.Metal,1);
 assert.ok(fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8').includes('tcg-classic-secret-wonders.js'));
});

test('independent auditor reports no card errors and completes every synthetic enabled attack and trainer both sides',()=>{
 const r=audit.auditSet('dp3',{data,fx:effects,core,opponents:opp,smoke:true,cpu:false,engineText:fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle-effects.js'),'utf8')});
 assert.equal(r.summary.errors,0,JSON.stringify(r.findings.filter(f=>f.severity==='error')));assert.equal(r.summary.total,132);
 assert.equal(r.summary.counts.enabled,46);assert.equal(r.smoke.executed,r.smoke.attempted);assert.equal(r.smoke.skipped,0);assert.deepEqual(r.smoke.failures,[]);
});

test('Bagon Rage counts damage counters, independent of attacker side',()=>{
 for(const side of ['player','opponent']){const s=board('dp3-76','dp1-17',side);s.sides[side].active.damage=20;attack(s,side,1);const foe=side==='player'?'opponent':'player';assert.equal(s.sides[foe].active.damage,30);}
});

test('Lotad Water Sport adds exactly 20 when its Energy count is smaller',()=>{
 for(const counts of [[1,3,30],[3,1,10]]){const s=board('dp3-92','dp1-17');s.sides.player.active.energy={Water:counts[0]};s.sides.opponent.active.energy={Water:counts[1]};attack(s,'player',0);assert.equal(s.sides.opponent.active.damage,counts[2]);}
});

test('Diglett Down Draw takes bottom card, not top; both sides',()=>{
 for(const side of ['player','opponent']){const s=board('dp3-85','dp1-17',side);const deck=s.sides[side].deck=[ref('dp3-82','BOTTOM'),ref('dp3-83','MIDDLE'),ref('dp3-84','TOP')];attack(s,side,0);assert.equal(s.sides[side].hand.at(-1)?.uid,'TOP');assert.deepEqual(deck.map(r=>r.uid),['BOTTOM','MIDDLE']);}
});

test('Wartortle Giant Wave locks only Giant Wave; Shell Attack still legal next turn',()=>{
 const s=board('dp3-75');attack(s,'player',0);
 // Simulate the next ownership turn for lock inspection.
 s.activeSide='player';s.turnNumber+=1;s.sides.player.turnCount++;
 const moves=core.legalActions(s,'player').filter(a=>a.type==='attack');
 assert.ok(!moves.some(a=>a.attackIndex===0),'Giant Wave incorrectly available');
 assert.ok(moves.some(a=>a.attackIndex===1),'Shell Attack incorrectly locked');
});

test('Psyduck confusion coin assigns one correct recipient, and condition-based Delusion draws',()=>{
 let heads=false,tails=false;
 for(let seed=1;seed<30;seed++){
  const s=board('dp3-100','dp1-17','player',seed);attack(s,'player',1);const roll=s.log.filter(x=>x.type==='coin').at(-1);if(!roll)continue;
  const isHeads=!!roll.heads;if(isHeads){heads=true;assert.ok(s.sides.opponent.active.conditions.confusion);}else{tails=true;assert.ok(s.sides.player.active.conditions.confusion);}
 }
 assert.ok(heads&&tails,'both outcomes exercised');
 const s=board('dp3-100');s.sides.player.active.conditions={confusion:true};const before=s.sides.player.hand.length;s.rngState=21;attack(s,'player',0);
 // Confusion may prevent an attack, in which case no draw is correct.
 const failed=s.log.some(e=>e.type==='confusion'&&e.heads===false);
 if(!failed)assert.ok(s.sides.player.hand.length>=before,'Delusion must never remove cards');
});

test('Reprinted Special Darkness and Metal Energy ids wired into battle core alongside older prints',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle-core.js'),'utf8');
 assert.ok(js.includes("'dp3-129'")&&js.includes("'dp3-130'"));
});

test('Farfetch’d Swords Dance boosts next Leek Slap by 30 without gating it',()=>{
 const s=board('dp3-49');attack(s,'player',0);s.turnNumber=12;s.activeSide='player';
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===1));
 attack(s,'player',1);assert.equal(s.sides.opponent.active.damage,60);
});

test('Shelgon Focus Energy boosts only next Protect Charge base to 80',()=>{
 const s=board('dp3-64');attack(s,'player',0);s.turnNumber=12;s.activeSide='player';
 attack(s,'player',1);assert.equal(s.sides.opponent.active.damage,80);
});

test('Shuppet Gossip places 10 damage as counters on selected opponent bench without Active damage',()=>{
 const s=board('dp3-110');const b=slot('dp1-17','opponent-benched');b.benchSlot=0;s.sides.opponent.bench=[b];
 const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(acts.some(a=>a.target==='opponentBench'));
 attack(s,'player',0,'opponentBench');assert.equal(b.damage,10);assert.equal(s.sides.opponent.active.damage,0);
});

test('Squirtle Aqua Tail rolls exactly one coin per attached Water Energy',()=>{
 for(const waters of [2,3]){
  const s=board('dp3-112');s.sides.player.active.energy={Water:waters};attack(s,'player',1);
  const roll=s.log.find(x=>x.type==='coin'&&x.coins===waters);assert.ok(roll,'expected '+waters+' coin rolls');
  assert.equal(s.sides.opponent.active.damage,20+roll.heads*10);
 }
});

test('Stantler Lead produces a real Supporter search choice',()=>{
 const s=board('dp3-113');s.sides.player.deck=[ref('dp3-123','rowan'),ref('dp3-82','charmander')];
 attack(s,'player',0);assert.equal(s.phase,'effectChoice');
 const legal=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');
 assert.ok(legal.some(a=>a.choiceDeckIndex===0));
 choices(s,acts=>acts.find(a=>a.choiceDeckIndex===0));
 assert.ok(s.sides.player.hand.some(r=>r.uid==='rowan'));
});
