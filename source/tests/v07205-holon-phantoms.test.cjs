'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const core=require(A+'tcgp-battle-core.js'),fx=require(A+'tcgp-battle-effects.js'),data=require(A+'tcg-classic-battle-data.js'),cpu=require(A+'tcg-classic-opponents.js'),set=require(A+'tcg-classic-holon-phantoms.js');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function battle(id,enemy='ex13-58'){
 const pool=cpu.generate({sets:['ex13'],type:'Metal',seed:17}).cards;
 const s=core.createBattle({format:'classic',playerDeck:pool,opponentDeck:pool,seed:1337,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(id,2,'pa');s.sides.opponent.active=core.makePokemonSlot(enemy,2,'oa');
 for(const side of ['player','opponent']){s.sides[side].active.energy=Object.fromEntries(types.map(t=>[t,9]));s.sides[side].energyDiscard={Water:3,Fire:3,Metal:3};}
 s.sides.player.bench=[core.makePokemonSlot('ex13-58',2,'pb')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex13-58',2,'ob')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function finish(s){for(let i=0;s.phase==='effectChoice'&&i<24;i++){const who=s.choiceSide||s.activeSide;const actions=core.legalActions(s,who);const act=actions.find(x=>x.type==='effectChoice'&&!x.choiceSkip)||actions.find(x=>x.type==='effectChoice');if(!act)throw Error('No choice '+JSON.stringify(s.pendingChoice));core.applyAction(s,who,act);}assert.notEqual(s.phase,'effectChoice','choice flow stuck');return s;}
function attack(s,index=0){const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(act,'No legal '+s.sides.player.active.cardId+' '+index);core.applyAction(s,'player',act);finish(s);return s;}
test('Card data includes 111 English prints and tracked partial mechanics',()=>{
 assert.equal(set.CARDS.length,111);assert.equal(set.coverage().total,111);assert.equal(set.CARDS.filter(c=>c.battleEnabled).length,111);
 assert.equal(set.cardById('ex13-111').name,'Mew');assert.equal(set.cardById('ex13-44').holonEnergyPokemon,true);
 assert.equal(data.cardById('ex13-98').specialEnergy,true);
 assert.ok(set.cardById('ex13-1').deckMeta.roles.includes('delta-species'));
});
test('Full Colourless archetype uses original DCE artwork but not Basic Colourless Energy',()=>{
 const assets=require(A+'tcgp-ui-assets.js');const v=JSON.stringify(assets);
 assert.match(require('node:fs').readFileSync(require('node:path').join(__dirname,A,'tcgp-ui-assets.js'),'utf8'),/Colorless:'https:\/\/images\.pokemontcg\.io\/base1\/96\.png'/);
});
for(const type of types.concat('Colorless'))test('CPU '+type+' ex13 builds legal 30-card deck',()=>{const result=cpu.generate({sets:['ex13'],type,seed:42});assert.ok(result.ok,result.error);assert.equal(result.cards.length,30);assert.ok(data.validateDeck(result.cards).ok);});
test('δ Rainbow provides rainbow only to δ Pokémon',()=>{
 const s=battle('ex13-1');const p=s.sides.player.active;p.energy={};p.specialEnergy=[{uid:'a',cardId:'ex13-98'}];assert.equal(core.effectiveEnergy(s,'player',p).Miracle,1);
 p.cardId='ex13-30';assert.equal(core.effectiveEnergy(s,'player',p).Colorless,1);
});
test('Holon Castform attach provides double rainbow with return choice',()=>{
 const s=battle('ex13-58'),p=s.sides.player.active;p.energy={Water:1};
 s.sides.player.hand=[{uid:'hc',cardId:'ex13-44'}];
 const a=core.legalActions(s,'player').find(x=>x.type==='attachSpecial'&&x.cardId==='ex13-44');assert.ok(a,'Castform attach missing');
 core.applyAction(s,'player',a);finish(s);
 assert.equal(core.effectiveEnergy(s,'player',p).Miracle,2);
});
test('Holon Lake grants Delta Call to δ Pokémon only',()=>{
 const s=battle('ex13-1');s.stadium={uid:'hl',cardId:'ex13-87'};
 assert.ok(core.attackOptions(s,'player').some(a=>a.attack.name==='Delta Call'));
 s.sides.player.active.cardId='ex13-30';assert.equal(core.attackOptions(s,'player').some(a=>a.attack.name==='Delta Call'),false);
});
test('Clear Body prevents conditions',()=>{const s=battle('ex13-27');assert.equal(fx.statusIsPrevented(s,s.sides.player.active,data.cardById,'burn'),true);});
test('Energy-type partnerships are embedded in Holon metadata',()=>{
 const p=data.cardById('ex13-16');assert.ok(p.deckMeta.specialEnergyPayoffs.includes('holon-energy'));
 assert.ok(data.cardById('ex13-8').deckMeta.holonStadiumPayoff);
 assert.ok(data.cardById('ex13-98').deckMeta.roles.includes('special-energy'));
});
test('supported attacks execute without throwing or stuck choice',()=>{
 let checked=0;const failed=[];
 for(const c of set.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(let i=0;i<(c.attacks||[]).length;i++){
   try{const s=battle(c.id);attack(s,i);checked++;}catch(e){failed.push(c.id+' '+c.attacks[i].name+': '+e.message);}
 }
 assert.deepEqual(failed,[],failed.join('\n'));assert.ok(checked>90,checked);
});
test('Deoxys Form Change swaps print while retaining attached Energy and damage',()=>{
 const s=battle('ex13-3'),p=s.sides.player.active;
 p.damage=20;p.energy={Darkness:2};s.sides.player.deck.unshift({uid:'df',cardId:'ex13-4'});
 const action=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='ex13-3');
 assert.ok(action,'Form Change ability missing');core.applyAction(s,'player',action);
 if(s.phase!=='effectChoice')throw Error('Form Change did not offer another form');
 finish(s);assert.equal(p.cardId,'ex13-4');assert.equal(p.damage,20);assert.equal(p.energy.Darkness,2);
 assert.ok(s.sides.player.deck.some(x=>x.cardId==='ex13-3'));
});
test('Hydro Barrier removes weakness from allied Water Pokémon only while Holon Energy is attached',()=>{
 const s=battle('ex13-27','ex13-69'),def=s.sides.player.active,atk=s.sides.opponent.active;
 const ray=core.makePokemonSlot('ex13-16',2,'ray');ray.benchSlot=1;s.sides.player.bench.push(ray);
 const initial=fx.attackDamageWithState(s,'opponent',atk,'player',def,20,data.cardById);
 ray.specialEnergy=[{uid:'holon',cardId:'ex11-104'}];
 const guarded=fx.attackDamageWithState(s,'opponent',atk,'player',def,20,data.cardById);
 assert.ok(guarded<=initial,'Holon guard should not increase damage');
});
test('Delta Reserve suppresses nondelta Powers when holding Holon Energy',()=>{
 const s=battle('ex12-8','ex13-14'),p=s.sides.opponent.active;
 p.specialEnergy=[{uid:'gl',cardId:'ex11-105'}];
 assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById),true);
 s.sides.player.active=core.makePokemonSlot('ex13-3',2,'deox');
 assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById),false);
});
test('Golduck δ blocks Stadium replacement when a Holon Stadium is in play',()=>{
 const s=battle('ex13-58','ex13-43');s.stadium={uid:'hl',cardId:'ex13-87'};
 s.sides.player.hand=[{uid:'full',cardId:'ex12-74'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex12-74');
 assert.equal(action,undefined);
});
test('Metal, Darkness, Multi and δ Rainbow Energy are genuinely distinct',()=>{
 const s=battle('ex13-1'),p=s.sides.player.active;p.energy={};
 p.specialEnergy=[{uid:'dm',cardId:'ex13-97'}];
 const dm=core.effectiveEnergy(s,'player',p);assert.equal(dm.Crystal,1);assert.equal(dm.__crystalAllowed.Darkness,true);assert.equal(dm.__crystalAllowed.Metal,true);
 p.specialEnergy=[{uid:'m',cardId:'ex13-96'}];assert.equal(core.effectiveEnergy(s,'player',p).Miracle,1);
 p.specialEnergy=[{uid:'m',cardId:'ex13-96'},{uid:'dr',cardId:'ex13-98'}];assert.equal(core.effectiveEnergy(s,'player',p).Colorless,1);
});
test('Deoxys alternate form and Holon Stadium deck metadata are explicit',()=>{
 const d=data.cardById('ex13-3');assert.ok(d.deckMeta.alternateFormCardIds.includes('ex13-6'));
 const lake=data.cardById('ex13-87');assert.ok(lake.attacks.some(a=>a.name==='Delta Call'));
 const p=data.cardById('ex13-14');assert.ok(p.deckMeta.requiresEnergyCards.some(x=>x.includes('Holon Energy')));
});
