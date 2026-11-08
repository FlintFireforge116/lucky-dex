'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const set=require(path.join(A,'tcg-classic-ruby-sapphire.js'));
const data=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const opp=require(path.join(A,'tcg-classic-opponents.js'));
const C=n=>set.cardById('ex1-'+n);
function slot(n,uid){return core.makePokemonSlot('ex1-'+n,2,uid||'unit-'+n);}
function state(){const d=opp.generate({sets:['ex1'],seed:33});assert.ok(d.ok,d.error);const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness'],seed:33,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;s.sides.player.active=slot(14,'attacker');s.sides.opponent.active=slot(72,'defender');s.sides.player.bench=[];s.sides.opponent.bench=[];return s;}
function resolve(s,n,i,heads=true){const ctx={...core.effectContext(s,'player',{},s.sides.player.active),random:()=>heads?0.1:0.9,isAttack:true};const out=fx.resolveAttack(C(n).attacks[i],ctx);for(const eff of out.pendingEffects)fx.applyEffect(eff,ctx);return out;}
function effect(s,rule,heads=true){return fx.applyEffect({type:'neoRule',rule:'ex1:'+rule},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>heads?0.1:0.9,isAbility:true});}
function choose(s,match){const side=s.choiceSide,actions=core.legalActions(s,side);const action=actions.find(match)||actions[0];assert.ok(action,`No choice ${s.pendingChoice?.kind}`);core.applyAction(s,side,action);return action;}

test('109/109 prints are registered, original 8 ex award two Prizes, and no unresolved effect remains',()=>{
 assert.equal(set.CARDS.length,109);assert.equal(set.coverage().battleEnabled,109);
 for(const c of set.CARDS)assert.equal(c.support.reasons.length,0,c.id+' '+c.support.reasons);
 assert.equal(set.CARDS.filter(c=>c.pokemonEx).length,8);
 for(const c of set.CARDS)for(const a of c.attacks||[])assert.ok(fx.supportsEffect(a.effect),`${c.id}: ${a.name}`);
});
test('newly completed attacks use Energy counts, actual statuses and chosen damage formulas',()=>{
 const s=state();s.sides.player.active=slot(5);s.sides.player.active.energy={Fire:2};assert.equal(resolve(s,5,0).damage,20);
 const g=state();g.sides.player.active=slot(7);g.sides.player.active.energy={Psychic:3};g.sides.opponent.active.energy={Water:2};assert.equal(resolve(g,7,0).damage,50);
 const r=state();r.sides.player.active=slot(17);r.sides.opponent.active.damage=20;assert.equal(resolve(r,17,0).damage,40);
 const l=state();l.sides.player.active=slot(68);l.sides.player.active.energy={Psychic:2};l.sides.opponent.active.energy={Grass:1};assert.equal(resolve(l,68,1).damage,10);
 const c=state();c.sides.player.active=slot(11);c.sides.player.active.energy={Grass:4};resolve(c,11,0);assert.ok(c.sides.opponent.active.conditions.sleep);assert.ok(c.sides.opponent.active.conditions.burn);assert.ok(c.sides.opponent.active.conditions.poison);
});
test('Fire Spin requires 2 attached Basic Energy and offers exactly Camerupt Energy to discard',()=>{
 const no=state();no.sides.player.active=slot(4);no.sides.player.active.energy={Fire:1};assert.equal(resolve(no,4,1).damage,0);
 const s=state();s.sides.player.active=slot(4);s.sides.player.active.energy={Fire:2};s.sides.player.bench=[slot(73,'different')];s.sides.player.bench[0].benchSlot=0;s.sides.player.bench[0].energy={Water:5};
 assert.equal(resolve(s,4,1).damage,100);assert.equal(s.phase,'effectChoice');
 let acts=core.legalActions(s,s.choiceSide);assert.ok(acts.every(x=>x.choiceCardId==='ex1-4'));
 choose(s,x=>x.effectEnergyType==='Fire');assert.equal(s.sides.player.active.energy.Fire,1);
 choose(s,x=>x.effectEnergyType==='Fire');assert.equal(s.sides.player.active.energy.Fire,0);
 assert.equal(s.sides.player.bench[0].energy.Water,5);
});
test('Psy Shadow adds Psychic Energy and 20 damage to selected target',()=>{
 const s=state();s.sides.player.active=slot(7);s.sides.player.bench=[slot(66)];s.sides.player.bench[0].benchSlot=0;
 effect(s,'psyShadow');assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceTarget==='bench');
 assert.equal(s.sides.player.bench[0].energy.Psychic,1);assert.equal(s.sides.player.bench[0].damage,20);
});
test('Firestarter uses discarded Fire Energy and targets only Bench',()=>{
 const s=state();s.sides.player.active=slot(3);s.sides.player.bench=[slot(73)];s.sides.player.bench[0].benchSlot=0;s.sides.player.energyDiscard.Fire=2;
 effect(s,'firestarter');let acts=core.legalActions(s,s.choiceSide);assert.ok(acts.every(x=>x.choiceTarget==='bench'));
 choose(s,()=>true);assert.equal(s.sides.player.bench[0].energy.Fire,1);assert.equal(s.sides.player.energyDiscard.Fire,1);
});
test('Energy Trans moves selected Grass Energy between Pokemon, not the first arbitrary type',()=>{
 const s=state();s.sides.player.active=slot(20);s.sides.player.active.energy={Grass:2,Fire:3};s.sides.player.bench=[slot(75)];s.sides.player.bench[0].benchSlot=0;
 effect(s,'energyTrans');assert.equal(s.pendingChoice.kind,'energySource');choose(s,a=>a.choiceTarget==='active'&&a.effectEnergyType==='Grass');choose(s,a=>a.choiceTarget==='bench');
 assert.equal(s.sides.player.active.energy.Grass,1);assert.equal(s.sides.player.active.energy.Fire,3);assert.equal(s.sides.player.bench[0].energy.Grass,1);
});
test('Energy Restore offers exact discard Energy types rather than picking first',()=>{
 const s=state();s.sides.player.energyDiscard={Fire:2,Water:2};effect(s,'energyRestore',true);
 assert.equal(s.phase,'effectChoice');assert.ok(s.pendingChoice.options.includes('Water'));
 choose(s,a=>a.choiceLabel==='Water');assert.equal(s.sides.player.energyDiscard.Water,1);
});
test('Energy Search supplies one Basic Energy into hand outside the draw deck',()=>{
 const s=state(),before=s.sides.player.deck.length;effect(s,'basicSearch1');choose(s,a=>a.choiceLabel==='Fire');
 assert.ok(s.sides.player.hand.some(ref=>ref.cardId==='ex1-108'));assert.equal(s.sides.player.deck.length,before);
});
test('Mewtwo ex recovers selected discarded Basic Energy and Special Energy',()=>{
 const s=state();s.sides.player.active=slot(101);s.sides.player.energyDiscard={Psychic:1,Fire:1};
 s.sides.player.discard.push({uid:'senergy',cardId:'ex1-93'});
 effect(s,'energyAbsorption');assert.equal(s.pendingChoice.kind,'option');
 choose(s,a=>a.choiceLabel==='Psychic');assert.equal(s.sides.player.active.energy.Psychic,1);
 choose(s,a=>a.choiceLabel==='Special Energy');assert.equal(s.pendingChoice.kind,'discardCard');
 choose(s,a=>a.choiceCardId==='ex1-93');assert.equal(s.sides.player.active.specialEnergy[0].cardId,'ex1-93');
});
test('Rainbow Energy provides one adaptable unit and inflicts 10 on attachment from hand',()=>{
 const s=state();s.sides.player.active=slot(101);s.sides.player.hand.unshift({uid:'rainbow',cardId:'ex1-95'});
 const a=core.legalActions(s,'player').find(x=>x.type==='attachSpecial'&&x.cardId==='ex1-95'&&x.target==='active');assert.ok(a,'Rainbow Energy must be attachable');core.applyAction(s,'player',a);
 assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.player.active.specialEnergy.length,1);
 const pool=core.effectiveEnergy(s,'player',s.sides.player.active);assert.equal(pool.Miracle,1);assert.equal(Object.values(pool).reduce((v,n)=>v+(Number(n)||0),0),1);
});
test('EX Powers, Tool berries and original ex cards are present, not card placeholders',()=>{
 for(const [n,name] of [[3,'Firestarter'],[5,'Energy Draw'],[7,'Psy Shadow'],[20,'Energy Trans'],[12,'Lazy'],[22,'Rough Skin'],[26,'Hard Cocoon'],[46,'Drive Off']])assert.equal(C(n).abilities[0].name,name);
 for(const n of [80,81,82,83,84,85,88,90])assert.ok(C(n).effect);
 for(const n of [93,94,95])assert.equal(C(n).effect.type,'specialEnergy');
});

test('Slaking Lazy blocks opposing Poké-Powers, not opposing Poké-Bodies',()=>{
 const s=state();s.sides.opponent.active=slot(12);s.sides.player.active=slot(7);
 assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById),true);
 s.sides.player.active=slot(6);assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById),false);
 s.sides.opponent.active.conditions={sleep:true};s.sides.player.active=slot(7);
 assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById),false);
});

test('EX-era Water Call attaches selected hand Energy to Active, not generated turn Energy',()=>{
 const s=state();s.sides.player.active=slot(13);s.sides.player.hand.push({cardId:'ex1-106',uid:'water-basic',zoneGenerated:true});
 effect(s,'waterCall');assert.equal(s.pendingChoice.kind,'handCard');choose(s,a=>a.choiceCardId==='ex1-106');
 assert.equal(s.pendingChoice.kind,'pokemon');choose(s,a=>a.choiceTarget==='active');
 assert.equal(s.sides.player.active.energy.Water,1);
 assert.ok(!s.sides.player.hand.some(x=>x.uid==='water-basic'));
});

test('EX-era Energy Trans handles attached Special Grass Energy as an actual card',()=>{
 const s=state();s.sides.player.active=slot(20);s.sides.player.active.specialEnergy.push({uid:'grass-special',cardId:'ex1-95'});
 s.sides.player.bench=[slot(75,'target')];s.sides.player.bench[0].benchSlot=0;
 effect(s,'energyTrans');const acts=core.legalActions(s,s.choiceSide);assert.ok(acts.some(x=>x.effectSpecialEnergyUid==='grass-special'));
 choose(s,x=>x.effectSpecialEnergyUid==='grass-special');choose(s,x=>x.choiceTarget==='bench');
 assert.equal(s.sides.player.active.specialEnergy.length,0);assert.equal(s.sides.player.bench[0].specialEnergy[0].uid,'grass-special');
});

test('Original Darkness Energy grants +10 before Weakness, and Metal reduces only Metal Pokemon after matchup',()=>{
 const a=state();a.sides.player.active=slot(64);a.sides.player.active.energy={Darkness:3};a.sides.player.active.specialEnergy=[{uid:'d',cardId:'ex1-93'}];
 a.sides.opponent.active=slot(66); // Ralts: Fighting weakness? Original has Psychic weakness, Darkness attacker no weakness
 const strike=core.legalActions(a,'player').find(x=>x.type==='attack'&&x.attackIndex===1);
 assert.ok(strike);core.applyAction(a,'player',strike);assert.ok(a.log.some(x=>x.type==='attack'&&x.damage>=30));
 const b=state();b.sides.player.active=slot(14);b.sides.player.active.energy={Water:5};b.sides.opponent.active=slot(1);b.sides.opponent.active.specialEnergy=[{uid:'metal',cardId:'ex1-94'}];
 const surf=core.legalActions(b,'player').find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(surf);core.applyAction(b,'player',surf);
 assert.ok(b.log.some(x=>x.type==='attack'&&x.damage===60));
});

test('Hard Cocoon flips an explicit defensive coin after an incoming attack',()=>{
 const s=state();s.sides.player.active=slot(14);s.sides.player.active.energy={Water:5};s.sides.opponent.active=slot(26);
 const surf=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(surf);core.applyAction(s,'player',surf);
 assert.ok(s.log.some(e=>e.type==='coin'&&e.reason==='Hard Cocoon'));
});

test('Rough Skin retaliates for 10 on Carvanha and 20 on Sharpedo on direct attack damage',()=>{
 for(const [n,amount] of [[51,10],[22,20]]){
  const s=state();s.sides.player.active=slot(14);s.sides.player.active.energy={Water:5};s.sides.opponent.active=slot(n);
  const attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(attack);core.applyAction(s,'player',attack);
  assert.equal(s.sides.player.active.damage,amount);assert.ok(s.log.some(e=>e.type==='ex1RoughSkin'&&e.amount===amount));
 }
});

test('Lum Berry and Oran Berry trigger at checkup, consume tool, and keep attached Pokemon',()=>{
 const s=state();s.sides.player.active=slot(14);s.sides.player.active.conditions={poison:{amount:10}};s.sides.player.active.tool={uid:'lum',cardId:'ex1-84'};
 s.sides.player.bench=[slot(59,'bench-berry')];s.sides.player.bench[0].benchSlot=0;s.sides.player.bench[0].damage=40;s.sides.player.bench[0].tool={uid:'oran',cardId:'ex1-85'};
 const end=core.legalActions(s,'player').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'player',end);
 assert.deepEqual(s.sides.player.active.conditions,{});assert.equal(s.sides.player.bench[0].damage,20);
 assert.equal(s.sides.player.active.tool,null);assert.equal(s.sides.player.bench[0].tool,null);
 assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex1-84'));assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex1-85'));
});

test('Stockpile changes next-turn Spit Up damage to 70 but not the current turn',()=>{
 const s=state();s.sides.player.active=slot(19);s.sides.player.active.energy={Water:2,Colorless:2};
 const one=resolve(s,19,0);assert.equal(one.damage,0);assert.equal(s.sides.player.active.ex1StockpileUntil,s.turnNumber+2);
 s.turnNumber+=2;s.sides.player.turnCount++;
 const sp=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(sp);core.applyAction(s,'player',sp);
 assert.ok(s.log.some(x=>x.type==='attack'&&x.attack==='Spit Up'&&x.damage===70));
});

test('EX Era Trainer / utility effect handlers do not throw on both coin outcomes',()=>{
 const rules=['energyRemoval2','energyRestore','energySwitch','ladyOuting','basicSearch1','pokeNav','basicSearch2','energyCall','charge','healingEgg','smokescreen','energyAbsorption','repulsion','invisibleHand','driveOff'];
 for(const rule of rules)for(const heads of [true,false]){const s=state();s.sides.player.active=slot(101);s.sides.opponent.active=slot(1);
  assert.doesNotThrow(()=>effect(s,rule,heads),`${rule} ${heads?'heads':'tails'}`);
 }
});

test('Hariyama Super Slap Push deals its printed 20 damage in the single-Active format',()=>{
 const s=state();s.sides.player.active=slot(8);s.sides.opponent.active=slot(60);
 assert.equal(resolve(s,8,0).damage,20,'The printed 20 is in attack text, not in the numeric attack damage field');
});

test('Mewtwo ex Energy Absorption honours Done instead of recursively asking for another Energy',()=>{
 const s=state();s.sides.player.active=slot(101);s.sides.player.energyDiscard={Psychic:2};
 effect(s,'energyAbsorption');assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceSkip===true);
 assert.equal(s.phase,'battle');assert.equal(s.sides.player.active.energy.Psychic||0,0);
});

test('Energy Restore Done stops recovery and does not silently collect an Energy',()=>{
 const s=state();s.sides.player.energyDiscard={Fire:2,Water:2};
 effect(s,'energyRestore');assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceSkip===true);
 assert.equal(s.phase,'battle');assert.equal(s.sides.player.energyDiscard.Fire,2);assert.equal(s.sides.player.energyDiscard.Water,2);
});

test('Scyther ex Agility creates an attack-effects guard on heads, not just a damage bonus',()=>{
 const a=state();a.sides.player.active=slot(102);a.sides.opponent.active=slot(67);
 resolve(a,102,0,true);assert.ok(a.sides.player.active.attackGuard?.effects);
 const b=state();b.sides.player.active=slot(102);b.sides.opponent.active=slot(67);
 resolve(b,102,0,false);assert.ok(!b.sides.player.active.attackGuard);
});
