'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const base='../app/src/main/assets/';
const data=require(base+'tcg-classic-battle-data.js'),builder=require(base+'tcg-classic-deck-builder.js'),meta=require(base+'tcg-deck-synergy.js'),cpu=require(base+'tcg-classic-opponents.js'),core=require(base+'tcgp-battle-core.js'),fx=require(base+'tcgp-battle-effects.js');
const HOLON=['ex11-104','ex11-105','ex11-106'];
const rows=data.CARDS.filter(c=>c.setId==='ex11'&&c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
const get=id=>data.cardById(id);
const deck=(focusCardId,types)=>builder.buildDeck(rows,{focusCardId,types,sets:['ex11'],style:'competitive',randomSeed:7});
const energyCards=d=>(d.cards||[]).filter(id=>HOLON.includes(id));
function game(attacker='ex11-13',defender='ex11-57'){
 const d=cpu.generate({sets:['ex11'],type:'Lightning',seed:7});
 assert.ok(d.ok,d.error);
 const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Lightning','Metal'],opponentEnergyTypes:['Lightning','Metal'],seed:72000,firstSide:'player'});
 s.phase='battle';s.activeSide='player';s.turnNumber=6;s.sides.player.turnCount=4;
 s.sides.player.active=core.makePokemonSlot(attacker,3,'player');s.sides.opponent.active=core.makePokemonSlot(defender,3,'opponent');
 s.sides.player.active.energy={};s.sides.opponent.active.energy={};return s;
}
test('Holon cards have actual per-basic-trigger metadata and do not masquerade as type energy',()=>{
 const expectations={
  'ex11-104':[['Fire','no-weakness'],['Fighting','ignore-resistance']],
  'ex11-105':[['Grass','prevent-special-conditions'],['Lightning','reduce-pokemon-ex-damage-10']],
  'ex11-106':[['Water','prevent-opponent-attack-effects'],['Psychic','free-retreat']]
 };
 for(const [id,conditions] of Object.entries(expectations)){
  const c=get(id),m=meta.metadata(c);assert.equal(c.effect.provides.Colorless,1);
  assert.deepEqual(m.specialEnergyConditions.map(x=>[x.basicEnergy,x.benefit]),conditions);
  assert.deepEqual(m.basicEnergyTriggers,conditions.map(x=>x[0]));
  assert.ok(m.specialEnergyConditions.every(x=>x.excludePokemonEx));
 }
});
test('Holon Energy dependencies are first-class on Rayquaza and Castform, searches on three Eeveelutions',()=>{
 for(const id of ['ex11-13','ex11-26','ex11-29','ex11-34']){
  assert.ok(get(id).deckMeta.specialEnergyPayoffs.includes('holon-energy'),id);
  assert.ok(meta.metadata(get(id)).specialEnergyPayoffs.includes('holon-energy'),id);
 }
 for(const id of ['ex11-5','ex11-7','ex11-18','ex11-31'])
  assert.ok(meta.metadata(get(id)).specialEnergySearches.includes('holon-energy'),id);
});
test('Focused Rayquaza chooses two GL, which activates both its printed payoff and Lightning trigger',()=>{
 const d=deck('ex11-13',['Lightning','Metal']);assert.ok(d.ok,d.errors?.join(' '));
 assert.deepEqual(energyCards(d),['ex11-105','ex11-105']);
 assert.deepEqual(d.energyTypes,['Lightning','Metal']);
});
test('Every Holon type selects its correct Energy, before staple Trainers fill the deck',()=>{
 for(const [id,types,energy] of [
  ['ex11-5',['Fire','Metal'],'ex11-104'],['ex11-111',['Fighting'],'ex11-104'],
  ['ex11-3',['Lightning','Metal'],'ex11-105'],['ex11-26',['Water'],'ex11-106'],
  ['ex11-18',['Water','Metal'],'ex11-106'],['ex11-23',['Psychic'],'ex11-106']]){
   const d=deck(id,types);assert.ok(d.ok,id+': '+d.errors?.join(' '));
   assert.ok(energyCards(d).includes(energy),id+': '+energyCards(d).join(','));
   assert.ok(data.validateDeck(d.cards).ok,id+' generated illegal deck');
  }
});
test('Pokémon-ex never receives unusable protective Holon Energy merely because of its Eevee',()=>{
 for(const id of ['ex11-108','ex11-109','ex11-110']){
  const d=deck(id);assert.ok(d.ok,id+': '+d.errors?.join(' '));
  assert.deepEqual(energyCards(d),[],id+' does not benefit from Holon bonuses');
 }
});
test('No unrelated Holon Energy, ownership and set filtering remain enforced',()=>{
 for(const id of ['ex11-55','ex11-79']){
  const d=deck(id,['Metal']);if(d.ok)assert.deepEqual(energyCards(d),[],id);
 }
 const missing=rows.filter(r=>r.gameplayId!=='ex11-105');
 const d=builder.buildDeck(missing,{sets:['ex11'],types:['Lightning','Metal'],focusCardId:'ex11-13'});
 assert.ok(d.ok,d.errors?.join(' '));assert.ok(!d.cards.includes('ex11-105'));
 const baseRows=data.CARDS.filter(c=>c.battleEnabled&&c.setId==='base1').map(c=>({gameplayId:c.id,quantity:4}));
 const baseDeck=builder.buildDeck(baseRows,{sets:['base1'],types:['Fire']});
 assert.ok(baseDeck.ok,baseDeck.errors?.join(' '));assert.equal(energyCards(baseDeck).length,0);
});
test('CPU type decks draw fitting Holon variants rather than arbitrary special-energy filler',()=>{
 for(const [type,id] of [['Fire','ex11-104'],['Fighting','ex11-104'],['Grass','ex11-105'],['Lightning','ex11-105'],['Water','ex11-106'],['Psychic','ex11-106']]){
  const d=cpu.generate({sets:['ex11'],type,seed:3});assert.ok(d.ok,type+': '+d.error);
  assert.ok(energyCards(d).includes(id),type+' CPU omitted '+id);assert.ok(data.validateDeck(d.cards).ok);
 }
 for(const type of ['Metal','Darkness']){
  const d=cpu.generate({sets:['ex11'],type,seed:3});assert.ok(d.ok,d.error);
  assert.deepEqual(energyCards(d),[],type+' should not select an inactive Holon effect');
 }
});
test('Delta Guard really prevents Lightning Storm self-damage with any variant of Holon Energy',()=>{
 for(const id of [null,...HOLON]){
  const s=game(),a=s.sides.player.active;
  if(id)a.specialEnergy=[{uid:'holon',cardId:id}];
  fx.applyEffect({type:'neoRule',rule:'ex11:13:1'},core.effectContext(s,'player',{},a));
  assert.equal(a.damage,id?0:70,'Delta Guard with '+(id||'no Holon'));
 }
});
test('Holon FF, GL and WP printed battle effects remain active only with the matching basic Energy',()=>{
 // FF: Fire plus FF cancels defender's Water weakness.
 const s=game('ex11-110','ex11-5'),d=s.sides.opponent.active,a=s.sides.player.active;
 assert.equal(fx.attackDamageWithState(s,'player',a,'opponent',d,40,get),80);
 d.specialEnergy=[{uid:'ff',cardId:'ex11-104'}];assert.equal(fx.attackDamageWithState(s,'player',a,'opponent',d,40,get),80);
 d.energy={Fire:1};assert.equal(fx.attackDamageWithState(s,'player',a,'opponent',d,40,get),40);
 // GL: Lightning plus GL reduces Pokémon-ex damage by 10, not non-ex damage.
 const g=game('ex11-110','ex11-13'),gd=g.sides.opponent.active;
 gd.specialEnergy=[{uid:'gl',cardId:'ex11-105'}];gd.energy={Lightning:1};
 assert.equal(fx.attackDamageWithState(g,'player',g.sides.player.active,'opponent',gd,50,get),10); // Rayquaza also resists Water by 30
 g.sides.player.active.cardId='ex11-19';assert.equal(fx.attackDamageWithState(g,'player',g.sides.player.active,'opponent',gd,50,get),20); // Same Water resistance, but no GL reduction
 // WP: Water + WP prevents effects other than damage; Grass + GL prevents status.
 const w=game(),wd=w.sides.opponent.active;wd.specialEnergy=[{uid:'wp',cardId:'ex11-106'}];
 assert.equal(fx.attackEffectsPrevented(w,'opponent',wd,w.sides.player.active,get),false);
 wd.energy={Water:1};assert.equal(fx.attackEffectsPrevented(w,'opponent',wd,w.sides.player.active,get),true);
 wd.specialEnergy=[{uid:'gl',cardId:'ex11-105'}];wd.energy={Grass:1};
 assert.equal(fx.statusIsPrevented(w,wd,get,'sleep'),true);
 });
test('CPU attachments prefer a Holon-powered Rayquaza over an unrelated Active on all difficulty levels',()=>{
 const ai=require(base+'tcgp-battle-ai.js'),s=game('ex11-19','ex11-57');
 s.activeSide='player';const p=s.sides.player;
 p.bench=[core.makePokemonSlot('ex11-13',3,'rayquaza')];p.bench[0].benchSlot=0;
 p.active.energy={Water:2};p.bench[0].energy={Lightning:1,Metal:1};
 p.hand=[{uid:'holon-gl',cardId:'ex11-105'}];p.handEnergyUsed=false;
 p.energyAvailable=false;p.energyUsed=true;
 for(const difficulty of ai.DIFFICULTIES){
  const a=ai.chooseAction(s,'player',difficulty);
  assert.equal(a.type,'attachSpecial',difficulty+' failed to attach the Holon card');
  assert.equal(a.target,'bench',difficulty+' failed to target Rayquaza');
  assert.equal(a.benchIndex,0);
 }
});
