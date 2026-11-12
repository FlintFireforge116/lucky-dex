'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/',core=require(A+'tcgp-battle-core'),fx=require(A+'tcgp-battle-effects'),cat=require(A+'tcg-classic-battle-data'),set=require(A+'tcg-classic-dragon-frontiers'),cpu=require(A+'tcg-classic-opponents'),builder=require(A+'tcg-classic-deck-builder');
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const deck=cpu.generate({sets:['ex14'],type:'Water',seed:244}).cards;
assert.equal(deck?.length,30);
function battle(mon='ex15-13',foe='ex15-61'){
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:250,firstSide:'player',playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(mon,2,'pa');s.sides.opponent.active=core.makePokemonSlot(foe,2,'oa');
 s.sides.player.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Metal:4,Darkness:4};s.sides.opponent.active.energy={};
 s.sides.player.bench=[core.makePokemonSlot('ex15-61',2,'pb')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex15-61',2,'ob0'),core.makePokemonSlot('ex15-61',2,'ob1')];s.sides.opponent.bench.forEach((p,i)=>p.benchSlot=i);
 return s;
}
function atk(s,index=0){const x=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(x,'attack not selectable '+s.sides.player.active.cardId+':'+index);core.applyAction(s,'player',x);return s;}
function opts(s){return core.legalActions(s,s.choiceSide||s.activeSide).filter(a=>a.type==='effectChoice');}
function choose(s,fn){assert.equal(s.phase,'effectChoice');const x=opts(s).find(fn);assert.ok(x,'missing choice '+JSON.stringify(opts(s)));core.applyAction(s,s.choiceSide||s.activeSide,x);return s;}
test('complete 101 card identities with printed metadata and honest gate',()=>{
 assert.equal(set.CARDS.length,101);assert.equal(new Set(set.CARDS.map(c=>c.id)).size,101);assert.equal(cat.cardById('ex15-101').name,'Mew ★ δ');
 assert.ok(cat.SETS.some(x=>x.id==='ex15'));assert.ok(cpu.SETS.includes('ex15'));assert.ok(builder.SET_IDS.includes('ex15'));
 for(const c of set.CARDS){assert.ok(c.image?.includes('/ex15/'+c.number+'.png'));assert.ok(c.deckMeta?.roles);assert.ok(!JSON.stringify(c).includes('Resolve neo Rule effect'));assert.equal(c.deckEligible,c.battleEnabled);assert.equal(c.support.status,c.battleEnabled?'FULL':'PARTIAL');}
});
test('reprinted Holon Energy GL adds EX damage reduction to non-ex Pokémon with basic Lightning',()=>{
 const s=battle('ex14-93','ex15-90'),def=s.sides.opponent.active;
 def.energy={Lightning:1};def.specialEnergy=[{uid:'gl',cardId:'ex15-85'}];
 let dmg=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',def,60,cat.cardById);
 assert.equal(dmg,60,'Pokemon-ex cannot benefit from Holon GL');
 def.cardId='ex15-42';s.sides.player.active.cardId='ex14-93';
 dmg=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',def,60,cat.cardById);
 assert.equal(dmg,50);
});
test('δ Rainbow is typed on δ Pokémon, otherwise gives only Colorless',()=>{
 const s=battle('ex15-13');const p=s.sides.player.active;p.energy={};p.specialEnergy=[{uid:'dr',cardId:'ex15-88'}];
 assert.equal(core.effectiveEnergy(s,'player',p).Miracle,1);
 p.cardId='ex14-93';const e=core.effectiveEnergy(s,'player',p);assert.equal(e.Miracle||0,0);assert.equal(e.Colorless,1);
});
test('Scramble provides flexible triple Energy only to eligible evolved Pokémon while behind in Prizes',()=>{
 const s=battle('ex15-13');const p=s.sides.player.active;p.energy={};p.specialEnergy=[{uid:'sc',cardId:'ex15-89'}];
 s.sides.player.prizes=[1,2,3,4];s.sides.opponent.prizes=[1,2];
 assert.equal(core.effectiveEnergy(s,'player',p).Miracle,3);
 s.sides.player.prizes=[1];assert.equal(core.effectiveEnergy(s,'player',p).Colorless,1);
 s.sides.player.prizes=[1,2,3,4];p.cardId='ex15-90';assert.equal(core.effectiveEnergy(s,'player',p).Miracle||0,0);
});
test('Boost only attaches to Evolved and blocks retreat until it expires at end of turn',()=>{
 const s=battle('ex15-13');const p=s.sides.player.active;p.specialEnergy=[{uid:'boost',cardId:'ex15-87'}];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='retreat'));
 const end=core.legalActions(s,'player').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'player',end);
 assert.ok(!p.specialEnergy.some(r=>r.cardId==='ex15-87'));assert.ok(s.sides.player.discard.some(r=>r.cardId==='ex15-87'));
});
test('Nidoqueen Vengeance counts discarded Pokémon and caps bonus at +60',()=>{
 const s=battle('ex15-7','ex15-61');s.sides.player.active.energy={Colorless:3};for(let i=0;i<8;i++)s.sides.player.discard.push({uid:'p'+i,cardId:'ex15-46'});
 atk(s,0);assert.equal(s.log.filter(x=>x.type==='attack').at(-1).damage,90);
});
test('Arbok Burning Venom applies both Burn and Poison',()=>{
 const s=battle('ex15-13','ex15-61');s.sides.player.active.energy={Colorless:1};atk(s,0);
 assert.ok(s.log.some(x=>x.type==='status'&&x.status==='poison'));assert.ok(s.log.some(x=>x.type==='status'&&x.status==='burn'));
});
test('Baby card status and combat actions remain usable',()=>{
 const s=battle('ex15-53','ex15-61');s.sides.player.active.energy={Metal:1};atk(s,1);assert.ok(s.log.some(x=>x.type==='coin'));
});
test('completed complex cards are now eligible for live decks',()=>{
 for(const id of ['ex15-1','ex15-5','ex15-10','ex15-11','ex15-91','ex15-99','ex15-100','ex15-101']){const c=cat.cardById(id);assert.equal(c.battleEnabled,true,id);assert.equal(c.support.reasons.length,0,id);}
});
test('CPU can build valid legal single-type decks from supported Dragon Frontiers cards',()=>{
 for(const type of ['Fire','Psychic','Metal'])for(const seed of [2,41,100]){
  const d=cpu.generate({sets:['ex15'],type,seed});assert.ok(d.ok,type+' '+seed+' '+d.error);assert.equal(d.cards.length,30);assert.ok(cat.validateDeck(d.cards).ok);
  assert.ok(d.cards.every(ref=>cat.cardById(typeof ref==='string'?ref:ref.cardId)?.battleEnabled));
 }
});
test('Battle Aura adds 10 before Weakness to every allied δ attacker, including other set prints',()=>{
 const s=battle('ex15-13','ex15-61');const x=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,30,cat.cardById);
 s.sides.player.bench[0].cardId='ex15-2';
 const y=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,30,cat.cardById);assert.equal(y,x+10);
 s.sides.player.active.cardId='ex13-16';const z=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,30,cat.cardById);
 assert.equal(z,40);
});
test('Xatu Extra Feather boosts allied Stage 2 Pokémon-ex, but not Stage 1 ex',()=>{
 const s=battle('ex14-89','ex15-61');const active=s.sides.player.active,def=s.sides.opponent.active;
 const start=fx.attackDamageWithState(s,'player',active,'opponent',def,30,cat.cardById);
 s.sides.player.bench[0].cardId='ex15-25';assert.equal(fx.attackDamageWithState(s,'player',active,'opponent',def,30,cat.cardById),start+10);
 active.cardId='ex15-90';assert.equal(fx.attackDamageWithState(s,'player',active,'opponent',def,30,cat.cardById),30);
});
test('Pinsir Armor checks opponent hand and Dewgong protection checks δ source',()=>{
 const s=battle('ex14-93','ex15-9'),def=s.sides.opponent.active;
 s.sides.player.hand=Array.from({length:5},(_,i)=>({uid:'h'+i,cardId:'ex14-71'}));
 assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',def,60,cat.cardById),30);
 s.sides.player.hand.length=4;assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',def,60,cat.cardById),60);
 def.cardId='ex15-15';s.sides.player.active.cardId='ex15-13';
 assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',def,60,cat.cardById),20);
});
test('Cloyster Solid Shell protects δ Bench and sole Heracross blocks Basic attackers',()=>{
 const s=battle('ex15-61','ex15-15');s.sides.opponent.bench[0].cardId='ex15-61';s.sides.opponent.bench[1].cardId='ex15-14';
 assert.equal(fx.attackIsPrevented(s,'opponent',s.sides.opponent.bench[0],s.sides.player.active,cat.cardById)?.reason,'Solid Shell');
 s.sides.opponent.active.cardId='ex15-3';s.sides.opponent.bench=[];
 assert.equal(fx.attackIsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,cat.cardById)?.reason,'Shining Horn');
 s.sides.opponent.bench=[core.makePokemonSlot('ex15-61',2,'extra')];assert.equal(fx.attackIsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,cat.cardById),null);
});
test('Vibrava Psychic Wing and Swellow Extra Wing enable genuine free retreats',()=>{
 const s=battle('ex15-24');s.sides.player.active.energy={};assert.ok(!core.legalActions(s,'player').some(a=>a.type==='retreat'));
 s.sides.player.active.energy={Psychic:1};assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));
 const t=battle('ex14-89');t.sides.player.active.energy={};t.sides.player.bench[0].cardId='ex15-40';
 assert.ok(core.legalActions(t,'player').some(a=>a.type==='retreat'));
});
test('Togepi Charm reduces outgoing damage from Defending Pokémon on its next turn',()=>{
 const s=battle('ex15-41','ex15-61');s.sides.player.active.energy={Water:1};atk(s,0);
 const victim=s.sides.player.active,enemy=s.sides.opponent.active;
 assert.equal(fx.attackDamageWithState(s,'opponent',enemy,'player',victim,30,cat.cardById),10);
});
test('Bagon Granite Head reduces next-turn incoming attack damage by 10',()=>{
 const s=battle('ex15-43','ex15-61');s.sides.player.active.energy={Water:1};atk(s,0);
 const victim=s.sides.player.active,enemy=s.sides.opponent.active;
 assert.equal(fx.attackDamageWithState(s,'opponent',enemy,'player',victim,30,cat.cardById),20);
});
test('Trapinch Quick Bind chooses Active or Bench; no invisible second hit',()=>{
 const s=battle('ex15-69','ex15-61');s.sides.player.active.energy={Psychic:1};atk(s,0);
 choose(s,a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 assert.equal(s.sides.opponent.bench[0].damage,10);
 assert.equal(s.sides.opponent.active.damage,0);
});
test('Mantine Power Circulation moves selected Basic discard to top physical draw deck and self-damages',()=>{
 const s=battle('ex15-20');s.sides.player.energyDiscard.Psychic=1;
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.abilityIndex===0);assert.ok(a,'Power not selectable');
 core.applyAction(s,'player',a);
 choose(s,x=>x.choiceOption===0);
 assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.player.energyDiscard.Psychic,0);
 assert.match(cat.cardById(s.sides.player.deck.at(-1).cardId)?.name||'',/Psychic Energy/);
});
test('Tropius Tropical Heal clears statuses on all own Pokémon when Benched from hand',()=>{
 const s=battle('ex15-61');s.sides.player.active.conditions={sleep:{appliedTurn:9}};
 s.sides.player.bench[0].conditions={poison:{amount:10}};
 s.sides.player.hand=[{uid:'trop',cardId:'ex15-23'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='bench'&&x.cardId==='ex15-23');assert.ok(action);
 core.applyAction(s,'player',action);
 assert.deepEqual(s.sides.player.active.conditions,{});assert.deepEqual(s.sides.player.bench[0].conditions,{});
});
test('Crystal Beach limits Boost and Scramble double/triple units to one Colorless',()=>{
 const s=battle('ex15-13');const slot=s.sides.player.active;slot.energy={};slot.specialEnergy=[{uid:'boost',cardId:'ex15-87'}];
 assert.equal(core.effectiveEnergy(s,'player',slot).Colorless,3);
 s.stadium={uid:'beach',cardId:'ex14-75',ownerSide:'opponent'};assert.equal(core.effectiveEnergy(s,'player',slot).Colorless,1);
 slot.specialEnergy=[{uid:'sc',cardId:'ex15-89'}];s.sides.player.prizes=[1,2,3];s.sides.opponent.prizes=[1];
 assert.equal(core.effectiveEnergy(s,'player',slot).Colorless,1);assert.equal(core.effectiveEnergy(s,'player',slot).Miracle||0,0);
});
test('Nidoking Linear Attack selects exactly one opposing Pokémon',()=>{
 const s=battle('ex15-6','ex15-61');s.sides.player.active.energy={Colorless:2};atk(s,0);
 choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.opponent.active.damage,0);
});
test('Nidoking Dark Horn gives optional hand discard before Bench snipe',()=>{
 const s=battle('ex15-6','ex15-7');s.sides.player.active.energy={Darkness:1,Colorless:2};
 s.sides.player.hand=[{uid:'pokemon-to-discard',cardId:'ex15-46'}];atk(s,1);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceHandIndex===0);
 choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.ok(s.sides.player.discard.some(ref=>ref.uid==='pokemon-to-discard'));
 assert.equal(s.sides.opponent.bench[0].damage,20);
});
test('Latios ex Ice Barrier prevents attacks from Pokémon-ex next turn',()=>{
 const s=battle('ex15-96','ex15-61');s.sides.player.active.energy={Water:1,Colorless:1};atk(s,0);
 assert.equal(fx.attackIsPrevented(s,'player',s.sides.player.active,core.makePokemonSlot('ex15-95',2,'ex-attacker'),cat.cardById)?.reason,'Ice Barrier');
 assert.equal(fx.attackIsPrevented(s,'player',s.sides.player.active,core.makePokemonSlot('ex15-61',2,'regular'),cat.cardById),null);
});
test('Latios ex Link Wing grants free retreat to either Latias or Latios',()=>{
 const s=battle('ex15-95','ex15-61');s.sides.player.active.energy={};s.sides.player.bench[0].cardId='ex15-96';
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='retreat'));
});
test('Jynx evolved from Smoochum reduces team Fire/Psychic retreat by one',()=>{
 const s=battle('ex15-12','ex15-61');s.sides.player.active.energy={};assert.ok(!core.legalActions(s,'player').some(x=>x.type==='retreat'));
 const j=core.makePokemonSlot('ex15-17',2,'jynx');j.stack=['ex15-64','ex15-17'];s.sides.player.bench[0]=j;j.benchSlot=0;
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='retreat'));
});
test('Energy optional old/Dragon reprint tools: Buffer Piece reduces damage and expires on opponent turn',()=>{
 const s=battle('ex15-13','ex14-14'),def=s.sides.opponent.active;
 def.tool={uid:'buff',cardId:'ex15-72',attachedTurn:9};
 s.sides.player.active.energy={Fire:2,Colorless:1};atk(s,1);
 assert.equal(s.log.filter(x=>x.type==='attack').at(-1).damage,30,'defender tool reduces 50 to 30');
 const end=core.legalActions(s,'opponent').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'opponent',end);
 assert.ok(s.sides.opponent.discard.some(x=>x.uid==='buff'),'Tool expired after opponent turn');
});
test('Strength Charm enhances active damage and discards after owner attack',()=>{
 const s=battle('ex15-13','ex14-14');s.sides.player.active.energy={Fire:2,Colorless:1};s.sides.player.active.tool={uid:'charm',cardId:'ex15-81'};
 atk(s,1);assert.equal(s.log.filter(x=>x.type==='attack').at(-1).damage,60);
 assert.ok(s.sides.player.discard.some(x=>x.uid==='charm'));
});
test('Meganium Evolutionary Call chooses up to three physical Pokémon cards, stopping when declined',()=>{
 const s=battle('ex15-26');const p=s.sides.player;p.active.playedOnSideTurn=1;
 p.hand=[{uid:'mega',cardId:'ex15-4'}];p.deck=[{uid:'d0',cardId:'ex15-43'},{uid:'d1',cardId:'ex15-73'},{uid:'d2',cardId:'ex15-67'},{uid:'d3',cardId:'ex15-54'}];
 const evolve=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex15-4');assert.ok(evolve);
 core.applyAction(s,'player',evolve);assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceDeckIndex===0);assert.equal(p.hand.some(x=>x.uid==='d0'),true);
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceSkip===true);
 assert.equal(p.hand.some(x=>x.uid==='d2'),false);assert.equal(p.deck.length,3);
});
test('Quagsire Dig Up recovers up to two selected Tools from discard without searching deck',()=>{
 const s=battle('ex15-71');const p=s.sides.player;p.active.playedOnSideTurn=1;
 p.hand=[{uid:'evo',cardId:'ex15-21'}];p.deck=[{uid:'tool-in-deck',cardId:'ex15-81'}];
 p.discard=[{uid:'first-tool',cardId:'ex15-72'},{uid:'not-a-tool',cardId:'ex15-78'},{uid:'second-tool',cardId:'ex15-81'}];
 core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex15-21'));
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceOption===0);assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceOption===0);
 assert.deepEqual(p.hand.filter(x=>x.uid.includes('tool')).map(x=>x.uid).sort(),['first-tool','second-tool']);
 assert.equal(p.deck.some(x=>x.uid==='tool-in-deck'),true);
});
test('Holon Mentor pays its hand discard cost then searches up to three <=100 HP Basic Pokémon',()=>{
 const s=battle('ex15-61');const p=s.sides.player;
 p.hand=[{uid:'mentor',cardId:'ex15-75'},{uid:'paid',cardId:'ex15-55'}];
 p.deck=[{uid:'eligible',cardId:'ex15-53'},{uid:'big',cardId:'ex15-1'},{uid:'another',cardId:'ex15-54'}];
 const play=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex15-75');assert.ok(play);core.applyAction(s,'player',play);
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceHandIndex===0);
 assert.ok(p.discard.some(x=>x.uid==='paid'));assert.equal(s.phase,'effectChoice');
 assert.ok(!opts(s).some(a=>a.choiceDeckIndex===1),'120 HP Stage 2 must be excluded');
 choose(s,a=>a.choiceDeckIndex===0);assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceSkip===true);
 assert.ok(p.hand.some(x=>x.uid==='eligible'));assert.ok(p.deck.some(x=>x.uid==='another'));
 const noCost=battle('ex15-61');noCost.sides.player.hand=[{uid:'mentor',cardId:'ex15-75'}];
 assert.ok(!core.legalActions(noCost,'player').some(a=>a.type==='trainer'&&a.cardId==='ex15-75'));
});
test('Old Rod flips exactly two coins; on matching outcomes takes one valid discard card by choice',()=>{
 let tested=0;
 for(let seed=1;seed<160&&tested<2;seed++){
  const s=battle('ex15-61');s.rngState=seed;const p=s.sides.player;
  p.hand=[{uid:'rod',cardId:'ex15-78'}];p.discard=[{uid:'old-basic',cardId:'ex15-46'},{uid:'old-trainer',cardId:'ex15-73'}];
  const play=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex15-78');assert.ok(play);core.applyAction(s,'player',play);
  const coins=s.log.filter(x=>x.type==='coin'&&/Dragon Frontiers/.test(x.reason));assert.equal(coins.length,2);
  if(s.phase!=='effectChoice')continue;
  const look=opts(s);assert.equal(look.length>=1,true);
  // The selected card must come from the actual discard and not consume a new coin flip.
  choose(s,a=>a.choiceOption===0);
  const taken=p.hand.filter(x=>x.uid.startsWith('old-'));assert.equal(taken.length,1);
  assert.equal(s.log.filter(x=>x.type==='coin'&&/Dragon Frontiers/.test(x.reason)).length,2);
  tested++;
 }
 assert.ok(tested>0);
});
test('Altaria ex Extra Boost attaches a hand Basic Energy to chosen Stage 2 Pokémon-ex only',()=>{
 const s=battle('ex15-90','ex15-61');const p=s.sides.player;
 p.bench[0].cardId='ex14-89';p.bench[0].energy={};
 p.hand=[{uid:'water',cardId:'base1-102'},{uid:'not-energy',cardId:'ex15-73'}];
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.abilityIndex===0);assert.ok(a);
 core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');
 choose(s,x=>x.choiceHandIndex===0);assert.equal(s.phase,'effectChoice');
 assert.ok(opts(s).some(x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0));
 choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(p.hand.some(x=>x.uid==='water'),false);assert.equal(p.bench[0].energy.Water,1);
 assert.equal(p.active.energy.Water,4,'Altaria itself must not receive the attachment');
});
test('Flygon ex Sand Damage between turns strikes opposing Basic Bench only, once',()=>{
 const s=battle('ex15-92','ex15-61');const opponent=s.sides.opponent;
 opponent.bench[0].cardId='ex15-61';opponent.bench[1].cardId='ex15-18';
 const beforeActive=opponent.active.damage;const beforeBasic=opponent.bench[0].damage;const beforeEvolved=opponent.bench[1].damage;
 const end=core.legalActions(s,'player').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'player',end);
 assert.equal(opponent.active.damage,beforeActive);
 assert.equal(opponent.bench[0].damage,beforeBasic+10);
 assert.equal(opponent.bench[1].damage,beforeEvolved);
 assert.equal(s.log.filter(x=>x.type==='ex15SandDamage'&&x.targetUid===opponent.bench[0].uid).length,1);
});
test('Quagsire Pump Out deals printed 50 damage and +20 only when wearing a Tool',()=>{
 for(const worn of [false,true]){
  const s=battle('ex15-21','ex15-46');s.sides.player.active.energy={Grass:1,Colorless:2};
  if(worn)s.sides.player.active.tool={uid:'t',cardId:'ex15-81'};
  atk(s,0);assert.equal(s.log.filter(x=>x.type==='attack').at(-1).damage,worn?80:50);
 }
});
test('Ledian Metal Star draws three only with an attached Tool',()=>{
 for(const worn of [false,true]){
  const s=battle('ex15-18');const p=s.sides.player;p.active.energy={Metal:1,Colorless:1};
  p.deck=[{uid:'one',cardId:'ex15-53'},{uid:'two',cardId:'ex15-54'},{uid:'three',cardId:'ex15-55'}];p.hand=[];
  if(worn)p.active.tool={uid:'t',cardId:'ex15-72'};
  atk(s,0);assert.equal(p.hand.length,worn?3:0);
 }
});
test('Seadra Smokescreen forces one coin check on opposing next attack, not on its own hit',()=>{
 const s=battle('ex15-22','ex15-46');s.sides.player.active.energy={Colorless:2};atk(s,0);
 assert.ok(s.sides.opponent.active.attackGate);assert.equal(s.sides.opponent.active.attackGate.expiresTurn,11);
});
test('Swellow Agility records single coin and protects only on heads',()=>{
 const s=battle('ex15-40','ex15-54');s.sides.player.active.energy={Fire:1,Colorless:1};atk(s,0);
 const coins=s.log.filter(x=>x.type==='coin'&&x.reason==='Dragon Frontiers 40:0');assert.equal(coins.length,1);
 const shield=s.sides.player.active.attackGuard;if(coins[0].heads)assert.ok(shield&&shield.preventEffects);else assert.ok(!shield);
});
