'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), path=require('node:path');
const dir=path.resolve(__dirname,'../app/src/main/assets');
const core=require(dir+'/tcgp-battle-core.js'), fx=require(dir+'/tcgp-battle-effects.js');
const data=require(dir+'/tcg-classic-battle-data.js'), set=require(dir+'/tcg-classic-delta-species.js'),cpu=require(dir+'/tcg-classic-opponents.js');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness'];
let serial=0;
const ref=(cardId,uid)=>({cardId,uid});
function slot(id,uid,benchSlot){const p=core.makePokemonSlot(id,3,uid);p.benchSlot=benchSlot;p.energy={};return p;}
function game(id='ex11-1',enemy='ex11-57'){
 const d=cpu.generate({sets:['ex11'],seed:11}).cards;
 const s=core.createBattle({format:'classic',playerDeck:d,opponentDeck:d,seed:19600+(++serial),firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;s.sides.player.turnCount=4;s.sides.opponent.turnCount=4;
 s.sides.player.active=slot(id,'pa',-1);s.sides.opponent.active=slot(enemy,'oa',-1);s.sides.player.bench=[slot('ex11-57','pb',0)];s.sides.opponent.bench=[slot('ex11-57','ob',0)];
 return s;
}
function pick(s,fn){assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));const acts=core.legalActions(s,s.choiceSide||s.activeSide),a=acts.find(fn||((a)=>!a.choiceSkip));assert.ok(a,'choice missing '+JSON.stringify(acts).slice(0,800));core.applyAction(s,s.choiceSide||s.activeSide,a);return a;}
function finish(s){let n=0;while(s.phase==='effectChoice'&&n++<90)pick(s);assert.notEqual(s.phase,'effectChoice','choice softlock');}
function effect(s,r){return fx.applyEffect({type:'neoRule',rule:r},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.02});}

test('All 114 printed identities are implemented and eligible for legal constructed decks',()=>{
 assert.equal(set.CARDS.length,114);assert.equal(new Set(set.CARDS.map(c=>c.id)).size,114);assert.equal(set.coverage().battleEnabled,114);assert.equal(set.coverage().partial.length,0);
 for(const c of set.CARDS){assert.equal(data.cardById(c.id)?.id,c.id);assert.ok(c.name);assert.equal(c.battleEnabled,true);assert.equal(c.deckEligible,true);assert.equal(c.support.status,'FULL');}
 assert.equal(data.cardById('ex11-14')?.evolvesFrom,'Shelgon');assert.deepEqual(data.cardById('ex11-14')?.types,['Fire','Metal']);
});
test('Complete Fire, Grass, Darkness and Water delta evolution decks and matching Energy types',()=>{
 const cores=[['Fire','ex11-58','ex11-53','ex11-14'],['Grass','ex11-56','ex11-86','ex11-32'],['Darkness','ex11-79','ex11-24'],['Water','ex11-84','ex11-15']];
 for(const [type,...line] of cores){const d=cpu.generate({sets:['ex11'],type,seed:3});assert.ok(d.ok,type+' '+d.error);assert.equal(d.cards.length,30);assert.ok(data.validateDeck(d.cards).ok,type);for(const card of line)assert.ok(d.cards.includes(card),type+' missing '+card);for(const needed of data.cardById(line.at(-1)).attacks.flatMap(a=>[...(a.cost||'')]).map(x=>({R:'Fire',G:'Grass',L:'Lightning',M:'Metal',W:'Water',D:'Darkness',P:'Psychic',F:'Fighting'})[x]).filter(Boolean))assert.ok(d.energyTypes.includes(needed),`${type} missing ${needed}`);}
});
test('Holon Energy FF removes Weakness with a basic Fire Energy, but not without it',()=>{
 const s=game('ex11-5','ex11-1'),a=s.sides.player.active,d=s.sides.opponent.active;
 const base=fx.attackDamageWithState(s,'player',a,'opponent',d,20,data.cardById);
 d.specialEnergy=[ref('ex11-104','ff')];const noBasic=fx.attackDamageWithState(s,'player',a,'opponent',d,20,data.cardById);
 d.energy.Fire=1;const withFire=fx.attackDamageWithState(s,'player',a,'opponent',d,20,data.cardById);
 assert.equal(noBasic,base);assert.ok(withFire<base,`${withFire} should reduce ${base}`);
});
test('Holon Energy GL requires Grass to prevent status and never grants ex immunity',()=>{
 const s=game('ex11-1'),p=s.sides.player.active;
 p.specialEnergy=[ref('ex11-105','gl')];assert.equal(fx.statusIsPrevented(s,p,data.cardById,'burn'),false);
 p.energy.Grass=1;assert.equal(fx.statusIsPrevented(s,p,data.cardById,'burn'),true);
 p.cardId='ex11-108';assert.equal(fx.statusIsPrevented(s,p,data.cardById,'burn'),false);
});
test('Holon Supporters needing a discard cannot be played as the only card in hand',()=>{
 for(const id of ['ex11-93','ex11-95','ex11-97']){
  const s=game(),p=s.sides.player;p.hand=[ref(id,'holon')];
  assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId===id),id+' illegally playable without cost');
  p.hand.push(ref('ex11-57','cost'));
  assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId===id),id+' should be playable with a cost');
 }
});
test('Starmie Metal Navigation draws a Basic Metal from ordered Energy Zone and attaches it, not from discard',()=>{
 const s=game('ex11-15'),p=s.sides.player;p.energySupply=['Water','Metal','Fighting'];p.deck=[ref('ex11-57','not-metal')];p.energyDiscard={Metal:2};
 effect(s,'ex11:power:15');pick(s,a=>a.choiceOption===0);finish(s);
 assert.equal(p.active.energy.Metal,1);assert.deepEqual(p.energySupply,['Water','Fighting']);assert.equal(p.energyDiscard.Metal,2);
});
test('Starmie Metal Navigation offers physical Metal Energy in deck as an alternate source',()=>{
 const s=game('ex11-15'),p=s.sides.player;p.energySupply=['Metal','Water'];p.deck=[ref('ex11-107','physical-metal')];
 effect(s,'ex11:power:15');pick(s,a=>a.choiceOption===1);pick(s,a=>a.choiceDeckIndex===0);finish(s);
 assert.equal(p.active.specialEnergy?.[0]?.cardId,'ex11-107');assert.equal(p.deck.some(x=>x.uid==='physical-metal'),false);assert.ok(p.energySupply.includes('Metal'));
});
test('Discard recovery attaches a physical discarded Basic Energy as Basic, never as Special',()=>{
 const s=game('ex11-14'),p=s.sides.player;p.discard=[ref('ex9-102','fire-physical')];p.energyDiscard={};p.active.energy.Fire=2;
 effect(s,'ex11:14:0');pick(s,a=>a.choiceTarget==='active');pick(s,a=>a.choiceOption===0);finish(s);
 assert.equal(p.active.energy.Fire,3);assert.equal(p.active.specialEnergy?.length||0,0);assert.ok(!p.discard.some(x=>x.uid==='fire-physical'));
});
test('EX Delta Species uses an 8-card Classic hand cap; Pocket rules are isolated',()=>{
 const s=game();assert.equal(s.rules.handLimit,8);assert.equal(s.sides.player.handLimit,8);assert.equal(s.sides.opponent.handLimit,8);
});
test('All supported EX Delta Species Pokémon attacks execute and resolve every prompted choice',()=>{
 let count=0;
 for(const c of set.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(let i=0;i<c.attacks.length;i++){
  const s=game(c.id,'ex11-57');s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,8]));s.sides.player.bench[0].energy={Water:1};s.sides.player.energyDiscard=Object.fromEntries(types.map(t=>[t,3]));s.sides.player.deck=[ref('ex11-57','available-basic'),...s.sides.player.deck];
  try{const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);assert.ok(a,'attack unavailable');core.applyAction(s,'player',a);finish(s);count++;}
  catch(e){throw new Error(c.id+' '+c.attacks[i].name+': '+e.message);}
 }
 assert.equal(count,147);
});
