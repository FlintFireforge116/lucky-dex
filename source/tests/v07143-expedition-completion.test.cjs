'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const expedition=require(path.join(A,'tcg-classic-expedition.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const by=n=>classic.cardById('ecard1-'+n);
function slot(n,uid){return core.makePokemonSlot('ecard1-'+n,1,uid||'slot-'+n);}
function state(seed=25){
 const deck=opponents.generate({sets:['ecard1'],seed});assert.ok(deck.ok,deck.error);
 const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Grass','Lightning','Psychic','Fire'],opponentEnergyTypes:['Grass','Lightning','Psychic','Fire'],firstSide:'player',seed});
 s.phase='battle';s.activeSide='player';s.turnNumber=5;s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;
 s.sides.player.active=slot(93,'me');s.sides.opponent.active=slot(133,'foe');
 s.sides.player.bench=[];s.sides.opponent.bench=[];s.sides.player.hand=[];s.sides.opponent.hand=[];
 return s;
}
const choices=(s,who='player')=>core.legalActions(s,who);
const step=(s,type,pred=()=>true)=>{const a=choices(s).find(x=>x.type===type&&pred(x));assert.ok(a,'missing '+type+' action');core.applyAction(s,'player',a);return a;};
test('all 165 Expedition cards enabled; holo and non-holo retain independent identities',()=>{
 assert.equal(expedition.coverage().total,165);assert.equal(expedition.coverage().battleEnabled,165);
 assert.deepEqual(expedition.coverage().partial,[]);
 for(const n of [1,2,30,33,34,68,144,150]){
  const c=by(n);assert.equal(c.battleEnabled,true,c.name);assert.equal(c.support.status,'FULL');assert.equal(c.deckEligible,true);
 }
 assert.equal(by(144).trainerType,'Tool');assert.equal(by(144).attacks[0].name,'Paralyzing Gaze');
 assert.equal(by(150).trainerType,'Tool');assert.equal(by(150).effect.stat,'postWeaknessAttackDamage');
});
test('version synchronized in Android Gradle, app JS and both visible title labels',()=>{
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8'),js=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 assert.match(gradle,/versionName '0\.69\.143'/);assert.match(gradle,/versionCode 7123/);
 assert.match(js,/window\.__LUCKYDEX_BUILD='0\.69\.143'/);
 assert.equal(html.split('v0.69.143').length-1,2);
});
test('Lightning Strike normal 40 or optional 80 and loss of attached Lightning energy',()=>{
 for(const boosted of [false,true]){
  const s=state();s.sides.player.active=slot(2,'ampharos');s.sides.player.active.energy={Lightning:4};
  s.sides.opponent.active=slot(16,'machamp');s.sides.opponent.active.energy={Grass:1};
  const actions=choices(s).filter(a=>a.type==='attack'&&a.attackIndex===0);
  assert.deepEqual(actions.map(a=>a.effectSelection).sort(),['','discard']);
  core.applyAction(s,'player',actions.find(a=>a.effectSelection===(boosted?'discard':'')));
  assert.equal(s.sides.opponent.active.damage,boosted?80:40);
  assert.equal(s.sides.player.active.energy.Lightning,boosted?0:4);
  if(boosted)assert.equal(s.sides.player.energyDiscard.Lightning,4);
 }
});
test('Psymimic chooses attacks from opposing Active or Bench and uses their printed costs',()=>{
 const s=state();s.sides.player.active=slot(1,'alakazam');s.sides.player.active.energy={Psychic:2,Colorless:1};
 s.sides.opponent.active=slot(96,'caterpie');s.sides.opponent.bench=[slot(109,'gastly')];s.sides.opponent.bench[0].benchSlot=0;
 const acts=choices(s).filter(a=>a.type==='attack');
 assert.ok(acts.some(a=>a.attackCardId==='ecard1-96'&&a.attackIndex===0),'opponent Active attack offered');
 assert.ok(acts.some(a=>a.attackCardId==='ecard1-109'&&a.attackIndex===0),'opponent Bench attack offered');
 step(s,'attack',a=>a.attackCardId==='ecard1-96'&&a.attackIndex===0);
 assert.equal(s.sides.opponent.active.damage,10);
 assert.ok(s.log.some(e=>e.type==='attack'&&e.cardId==='ecard1-1'&&e.attack==='Headbutt'));
});
test('Psymimic disallowed under Special Conditions without blocking normal attacks',()=>{
 for(const cond of ['sleep','confusion','paralysis']){
  const s=state();s.sides.player.active=slot(33,'alakazam');s.sides.player.active.energy={Psychic:3};
  s.sides.opponent.active=slot(96,'caterpie');s.sides.player.active.conditions={[cond]:true};
  assert.ok(!choices(s).some(a=>a.type==='attack'&&a.attackCardId==='ecard1-96'),cond);
  if(cond==='confusion')assert.ok(choices(s).some(a=>a.type==='attack'&&a.attackCardId==='ecard1-33'),'normal attack while confused');
 }
});
test('Harvest Bounty from a Benched Venusaur attaches next exact Energy Zone entry when accepted',()=>{
 const s=state();s.sides.player.active=slot(93,'abra');s.sides.player.bench=[slot(30,'venusaur')];s.sides.player.bench[0].benchSlot=0;
 const me=s.sides.player;me.energyType='Grass';me.energyAvailable=true;me.energyUsed=false;me.energySupply=['Fire','Psychic','Water'];
 step(s,'attach',a=>a.target==='active');
 assert.equal(s.phase,'effectChoice');assert.deepEqual(choices(s).map(a=>a.choiceOption),[0,1]);
 step(s,'effectChoice',a=>a.choiceOption===1);
 assert.equal(me.active.energy.Grass,1);assert.equal(me.active.energy.Fire,1);assert.deepEqual(me.energySupply,['Psychic','Water']);
 assert.equal(me.nextEnergyType,'Psychic');assert.equal(me.bench[0].harvestBountyUsedTurn,s.turnNumber);
});
test('Harvest Bounty allows skip, respects special conditions, and only consumes one bonus per Venusaur per turn',()=>{
 const s=state();const me=s.sides.player;me.active=slot(93,'abra');me.bench=[slot(68,'venusaur')];me.bench[0].benchSlot=0;
 me.energyType='Grass';me.energyAvailable=true;me.energyUsed=false;me.energySupply=['Fire','Psychic','Water'];
 step(s,'attach',a=>a.target==='active');step(s,'effectChoice',a=>a.choiceOption===0);
 assert.equal(me.active.energy.Fire||0,0);assert.deepEqual(me.energySupply,['Fire','Psychic','Water']);
 me.hand=[{uid:'spec',cardId:'ecard1-158'}];
 step(s,'attachSpecial',a=>a.target==='active');assert.equal(s.phase,'effectChoice');
 step(s,'effectChoice',a=>a.choiceOption===1);
 assert.equal(me.active.energy.Fire,1);
 me.hand=[{uid:'spec2',cardId:'ecard1-159'}];step(s,'attachSpecial',a=>a.target==='active');assert.equal(s.phase,'battle');
 const t=state();t.sides.player.active=slot(93,'abra');t.sides.player.bench=[slot(30,'v')];t.sides.player.bench[0].benchSlot=0;t.sides.player.bench[0].conditions={sleep:true};
 t.sides.player.energyType='Grass';t.sides.player.energyAvailable=true;t.sides.player.energyUsed=false;t.sides.player.energySupply=['Fire'];
 step(t,'attach',a=>a.target==='active');assert.equal(t.phase,'battle');
});
test('Multi Technical Machine 01 attaches as Tool, grants attack then expires at end of own turn',()=>{
 const s=state();const me=s.sides.player;me.active=slot(93,'abra');me.active.energy={Colorless:1};
 me.hand=[{uid:'machine',cardId:'ecard1-144'}];s.sides.opponent.active=slot(93,'foe');
 step(s,'trainer',a=>a.cardId==='ecard1-144'&&a.target==='active');
 assert.equal(me.active.tool.cardId,'ecard1-144');
 const attacks=choices(s).filter(a=>a.type==='attack');assert.ok(attacks.some(a=>a.attackCardId==='ecard1-144'));
 step(s,'attack',a=>a.attackCardId==='ecard1-144');
 assert.ok(s.sides.opponent.active.conditions.paralysis);
 assert.equal(me.active.tool,null);assert.ok(me.discard.some(r=>r.cardId==='ecard1-144'));
});
test('Technical Machine also expires unused; opponent turn does not remove own machine',()=>{
 const s=state();const me=s.sides.player;me.active=slot(93,'abra');me.hand=[{uid:'machine',cardId:'ecard1-144'}];
 step(s,'trainer',a=>a.cardId==='ecard1-144'&&a.target==='active');
 step(s,'endTurn');assert.equal(me.active.tool,null);assert.ok(me.discard.some(r=>r.cardId==='ecard1-144'));
});
test('Strength Charm applies 10 after weakness, discards only if attack actually damages',()=>{
 const s=state();const me=s.sides.player;me.active=slot(93,'abra');me.active.energy={Psychic:1,Colorless:1};
 s.sides.opponent.active=slot(93,'foe');me.hand=[{uid:'charm',cardId:'ecard1-150'}];
 step(s,'trainer',a=>a.cardId==='ecard1-150'&&a.target==='active');
 step(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.sides.opponent.active.damage,30,'10 base -> 20 weakness + 10 charm');
 assert.ok(me.discard.some(r=>r.cardId==='ecard1-150'));
 assert.equal(me.active.tool,null);
 const t=state();t.sides.player.active=slot(93,'abra');t.sides.player.active.energy={Psychic:1};
 t.sides.player.hand=[{uid:'charm',cardId:'ecard1-150'}];step(t,'trainer',a=>a.cardId==='ecard1-150'&&a.target==='active');
 step(t,'endTurn');assert.equal(t.sides.player.active.tool.cardId,'ecard1-150','not discarded unused');
});
test('Expedition restricted AI deck generation draws from newly playable cards legally',()=>{
 for(const seed of [1,2,3,4,5,6]){
  const built=opponents.generate({sets:['ecard1'],seed});assert.ok(built.ok,built.error);
  assert.ok(classic.validateDeck(built.cards).ok);assert.ok(built.cards.every(id=>by(+id.split('-')[1]).battleEnabled));
 }
});
test('Harvest Bounty with two Venusaur offers both powers and obeys top-of-zone order',()=>{
 const s=state(),me=s.sides.player;me.active=slot(93,'abra');me.bench=[slot(30,'v1'),slot(68,'v2')];me.bench[0].benchSlot=0;me.bench[1].benchSlot=1;
 me.energyType='Grass';me.energyUsed=false;me.energyAvailable=true;me.energySupply=['Fire','Psychic','Water'];
 step(s,'attach',a=>a.target==='active');assert.equal(s.phase,'effectChoice');
 step(s,'effectChoice',a=>a.choiceOption===1);assert.equal(s.phase,'effectChoice','second Venusaur offers its Power');
 assert.match(s.pendingChoice.options[1],/Psychic/);
 step(s,'effectChoice',a=>a.choiceOption===1);
 assert.equal(s.phase,'battle');assert.deepEqual(me.energySupply,['Water']);
 assert.deepEqual(me.active.energy,{Grass:1,Fire:1,Psychic:1});
 assert.equal(me.bench[0].harvestBountyUsedTurn,5);assert.equal(me.bench[1].harvestBountyUsedTurn,5);
});
test('Psymimic and Harvest Bounty are disabled by Poison and Burn, not just Sleep',()=>{
 for(const cond of ['poison','burn']){
  const s=state();s.sides.player.active=slot(1,'alakazam');s.sides.player.active.energy={Psychic:3};
  s.sides.opponent.active=slot(96,'caterpie');s.sides.player.active.conditions={[cond]:true};
  assert.ok(!choices(s).some(a=>a.type==='attack'&&a.attackCardId==='ecard1-96'),cond);
  const t=state();t.sides.player.bench=[slot(30,'venusaur')];t.sides.player.bench[0].benchSlot=0;t.sides.player.bench[0].conditions={[cond]:true};
  t.sides.player.energyType='Grass';t.sides.player.energyAvailable=true;t.sides.player.energyUsed=false;t.sides.player.energySupply=['Fire'];
  step(t,'attach',a=>a.target==='active');assert.equal(t.phase,'battle','no Power while '+cond);
 }
});
test('Lightning Strike discards all special Lightning-providing Energy when boosted',()=>{
 const s=state();s.sides.player.active=slot(34,'ampharos');s.sides.player.active.energy={Lightning:2,Colorless:2};
 s.sides.player.active.specialEnergy=[{uid:'specialL',cardId:'ecard1-158',provides:{Lightning:1}}];
 s.sides.opponent.active=slot(16,'machamp');
 step(s,'attack',a=>a.attackCardId==='ecard1-34'&&a.effectSelection==='discard');
 assert.equal(s.sides.player.active.energy.Lightning,0);assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.ok(s.sides.player.discard.some(r=>r.uid==='specialL'));
 assert.equal(s.sides.opponent.active.damage,90,'Darkness Energy adds its own +10 before being discarded');
});
test('Strength Charm boosts attacks targeting an opposing Bench and is discarded afterward',()=>{
 const s=state();s.sides.player.active=slot(81,'lee');s.sides.player.active.energy={Fighting:2,Colorless:1};
 s.sides.opponent.active=slot(16,'machamp');s.sides.opponent.bench=[slot(133,'tauros')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.hand=[{uid:'charm',cardId:'ecard1-150'}];
 step(s,'trainer',a=>a.cardId==='ecard1-150'&&a.target==='active');
 const attack=choices(s).find(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(attack,'Stretch Kick selectable');core.applyAction(s,'player',attack);
 assert.equal(s.sides.opponent.bench[0].damage,40);
 assert.ok(s.sides.player.discard.some(r=>r.cardId==='ecard1-150'));
});
