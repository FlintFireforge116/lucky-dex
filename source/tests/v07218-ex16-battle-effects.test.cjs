'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const base='../app/src/main/assets/';
const cards=require(base+'tcg-classic-power-keepers'),core=require(base+'tcgp-battle-core'),effects=require(base+'tcgp-battle-effects'),opp=require(base+'tcg-classic-opponents');
const seed=opp.generate({sets:['ex15'],seed:19,type:'Darkness'});assert.ok(seed.ok);
function setup(att='ex16-17',def='ex16-58'){
 const state=core.createBattle({format:'classic',playerDeck:seed.cards,opponentDeck:seed.cards,seed:17,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 state.phase='battle';state.turnNumber=10;state.activeSide='player';
 state.sides.player.turnCount=5;state.sides.opponent.turnCount=5;
 state.sides.player.active=core.makePokemonSlot(att,4,'a');state.sides.opponent.active=core.makePokemonSlot(def,4,'b');
 state.sides.player.active.energy={Grass:3,Fire:3,Water:3,Lightning:3,Psychic:3,Fighting:3,Darkness:3,Metal:3};
 state.sides.opponent.active.energy={Lightning:2};
 state.sides.player.bench=[core.makePokemonSlot('ex16-43',4,'c')];state.sides.player.bench[0].benchSlot=0;
 state.sides.opponent.bench=[core.makePokemonSlot('ex16-59',4,'d')];state.sides.opponent.bench[0].benchSlot=0;
 return state;
}
function takeChoice(s,pred){let n=0;while(s.phase==='effectChoice'&&n++<10){const side=s.choiceSide||s.activeSide,cs=core.legalActions(s,side).filter(a=>a.type==='effectChoice');assert.ok(cs.length,'missing action '+JSON.stringify(s.pendingChoice));const x=pred?cs.find(pred)||cs.find(a=>!a.choiceSkip)||cs[0]:cs.find(a=>!a.choiceSkip)||cs[0];core.applyAction(s,side,x);}assert.ok(n<11,'choice never settled');}
function attack(s,i=0){const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);assert.ok(act,'attack '+i+' not legal '+s.sides.player.active.cardId);core.applyAction(s,'player',act);}
function item(s,id){s.sides.player.hand.push({uid:'hand'+id,cardId:id});const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===id);assert.ok(act,'item not playable '+id);core.applyAction(s,'player',act);}
function attach(s,id,target='active',benchIndex=undefined){s.sides.player.hand.push({uid:'hand'+id,cardId:id});const act=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId===id&&a.target===target&&(benchIndex==null||a.benchIndex===benchIndex));assert.ok(act,'hand Energy not attachable '+id);core.applyAction(s,'player',act);}
test('promoted EX16 cards are fully covered in metadata and effects validated',()=>{
 for(const n of [17,27,29,51,74,87,88,89,90,91]){const c=cards.cardById('ex16-'+n);assert.equal(c.battleEnabled,true,c.id);assert.equal(c.support.status,'FULL');for(const x of [...(c.attacks||[]),...(c.abilities||[]),c].filter(x=>x.effect))assert.deepEqual(effects.validateEffect(x.effect),[],c.id+' '+x.name);}
});
test('Mawile Call for Family provides explicit Bench choice',()=>{const s=setup('ex16-17');s.sides.player.deck=[{uid:'basic',cardId:'ex16-57'},{uid:'stage1',cardId:'ex16-12'}];attack(s,0);assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,'player');assert.ok(choices.some(a=>a.choiceCardId==='ex16-57'));assert.ok(!choices.some(a=>a.choiceCardId==='ex16-12'));takeChoice(s,a=>a.choiceCardId==='ex16-57');assert.equal(s.sides.player.bench.some(x=>x.cardId==='ex16-57'),true);});
test('Mawile Pull Away makes defending player choose the cards to discard',()=>{
 const s=setup('ex16-17');s.sides.opponent.hand=Array.from({length:6},(_,i)=>({uid:'d'+i,cardId:i===1?'ex16-48':'ex16-57'}));
 attack(s,1);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 let opts=core.legalActions(s,'opponent').filter(a=>a.type==='effectChoice');assert.equal(opts.length,6);
 const target=opts.find(a=>a.choiceHandIndex===1);core.applyAction(s,'opponent',target);
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='d1'),'opponent-selected card discarded');
 assert.equal(s.choiceSide,'opponent');opts=core.legalActions(s,'opponent').filter(a=>a.type==='effectChoice');
 core.applyAction(s,'opponent',opts.find(a=>a.choiceHandIndex===0));
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='d0'));
 assert.equal(s.sides.opponent.hand.length,5,'four remain, plus next-turn automatic draw');
});
test('Cacturne Poison Structure activates only with Sidney Stadium and printed Pin Missile rolls four coins',()=>{const s=setup('ex16-27');const p=cards.cardById('ex16-27');assert.equal(p.attacks[0].effect.coins,4);assert.equal(p.abilities[0].effect.condition.cardId,'ex16-82');s.stadium={uid:'stad',cardId:'ex16-82'};const act=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.abilityIndex===0);assert.ok(act,'Poison Structure should be offered');core.applyAction(s,'player',act);assert.ok(s.sides.opponent.active.conditions.poison);});
test('Combusken Natural Cure triggers on hand-attached Fire Energy, not the zone',()=>{const s=setup('ex16-29');s.sides.player.active.conditions={burn:true,confusion:true};attach(s,'ex16-104');assert.deepEqual(s.sides.player.active.conditions,{});assert.ok(s.log.some(x=>x.type==='ex16NaturalCure'));});
test('Kabuto Fast Evolution searches evolution cards and not Basics',()=>{const s=setup('ex16-51');s.sides.player.deck=[{uid:'x',cardId:'ex16-57'},{uid:'y',cardId:'ex16-12'}];attack(s,0);assert.equal(s.phase,'effectChoice');const cs=core.legalActions(s,'player');assert.ok(cs.some(a=>a.choiceCardId==='ex16-12'));assert.ok(!cs.some(a=>a.choiceCardId==='ex16-57'));takeChoice(s,a=>a.choiceCardId==='ex16-12');assert.ok(s.sides.player.hand.some(r=>r.cardId==='ex16-12'));});
test('Energy Removal 2 has a genuine heads/tails roll and offers selectable defending Pokémon',()=>{const s=setup();item(s,'ex16-74');const flips=s.log.filter(x=>x.type==='coin');assert.ok(flips.length,'coin not rolled');if(flips.at(-1).heads){assert.equal(s.phase,'effectChoice');assert.ok(core.legalActions(s,'player').filter(a=>a.type==='effectChoice').length);takeChoice(s);}});
test('Cyclone from hand forces opponent Bench choice, Warp from hand chooses own Bench',()=>{
 for(const [energy,source] of [['ex16-90','opponent'],['ex16-91','player']]){const s=setup();attach(s,energy);assert.equal(s.phase,'effectChoice',energy);const legal=core.legalActions(s,s.choiceSide||'player').filter(a=>a.type==='effectChoice');assert.ok(legal.length,energy);takeChoice(s);assert.equal(s.phase,'battle',energy);assert.equal(s.sides[source].active.uid,source==='opponent'?'d':'c',energy);}
});

// EX-era Special Energy reprints must be functionally identical, not just readable cards.
test('Darkness Energy 87 adds +10 before matchup to Darkness but not other Pokémon',()=>{
 const duel=(pokemon,attached)=>{const s=setup(pokemon,'ex16-48');s.sides.player.active.specialEnergy=attached?[{uid:'drk',cardId:'ex16-87'}]:[];attack(s);return s.sides.opponent.active.damage;};
 assert.equal(duel('ex16-18',true)-duel('ex16-18',false),10);
 assert.equal(duel('ex16-48',true)-duel('ex16-48',false),0);
});
test('Metal Energy 88 prevents 10 only on Metal defenders after matchup',()=>{
 const incoming=(pokemon,attached)=>{const s=setup('ex16-14',pokemon);s.sides.opponent.active.specialEnergy=attached?[{uid:'met',cardId:'ex16-88'}]:[];attack(s);return s.sides.opponent.active.damage;};
 assert.equal(incoming('ex16-17',false)-incoming('ex16-17',true),10);
 assert.equal(incoming('ex16-58',false)-incoming('ex16-58',true),0);
});
test('Multi Energy 89 provides all types only when no other Special Energy is attached',()=>{
 const s=setup('ex16-6');s.sides.player.active.energy={};s.sides.player.active.specialEnergy=[{uid:'mu',cardId:'ex16-89'}];
 let energy=core.effectiveEnergy(s,'player',s.sides.player.active);assert.equal(energy.Miracle,1);assert.equal(energy.Colorless||0,0);
 s.sides.player.active.specialEnergy.push({uid:'cycl',cardId:'ex16-90'});energy=core.effectiveEnergy(s,'player',s.sides.player.active);assert.equal(energy.Miracle||0,0);assert.equal(energy.Colorless,2);
});
test('Energy Removal 2 heads lets trainer owner target opposing Active or Bench',()=>{
 let s;for(let trial=1;trial<50;trial++){s=setup();s.rngState=trial;
  s.sides.opponent.bench[0].energy={Grass:1};s.sides.opponent.active.energy={Fire:1};
  item(s,'ex16-74');if(s.log.filter(x=>x.type==='coin').at(-1).heads)break;}
 assert.equal(s.log.filter(x=>x.type==='coin').at(-1).heads,true);assert.equal(s.choiceSide,'player');
 const choices=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.ok(choices.some(a=>a.choiceTarget==='active'||a.choiceTarget==='opponentActive'));
 assert.ok(choices.some(a=>a.choiceTarget==='bench'||a.choiceTarget==='opponentBench'));
 const bench=choices.find(a=>a.choiceTarget==='bench'||a.choiceTarget==='opponentBench');core.applyAction(s,'player',bench);
 assert.equal(s.sides.opponent.bench[0].energy.Grass,0);assert.equal(s.sides.opponent.active.energy.Fire,1);
});
test('Cacturne cannot activate Poison Structure without Sidney Stadium',()=>{
 const s=setup('ex16-27');assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.abilityIndex===0));
});

test('Energy Removal 2 explicitly chooses Basic versus Special Energy on selected defender',()=>{
 let s;for(let trial=1;trial<50;trial++){s=setup();s.rngState=trial;s.sides.opponent.active.energy={Metal:1,Fire:1};
  s.sides.opponent.active.specialEnergy=[{uid:'spec',cardId:'ex16-89'}];item(s,'ex16-74');if(s.log.filter(x=>x.type==='coin').at(-1).heads)break;}
 assert.equal(s.choiceSide,'player');
 const active=core.legalActions(s,'player').filter(a=>a.type==='effectChoice').find(a=>a.choiceTarget==='active'||a.choiceTarget==='opponentActive');assert.ok(active);
 core.applyAction(s,'player',active);assert.equal(s.phase,'effectChoice');
 const choices=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.ok(choices.some(a=>/Special Energy|Multi Energy/.test(a.choiceLabel||'')));
 const pick=choices.find(a=>/Multi Energy/.test(a.choiceLabel||''))||choices.at(-1);core.applyAction(s,'player',pick);
 assert.equal(s.sides.opponent.active.specialEnergy.length,0);assert.equal(s.sides.opponent.active.energy.Metal,1);assert.equal(s.sides.opponent.active.energy.Fire,1);
});
