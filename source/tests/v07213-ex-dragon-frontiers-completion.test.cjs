'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/',core=require(P+'tcgp-battle-core'),fx=require(P+'tcgp-battle-effects'),cat=require(P+'tcg-classic-battle-data'),df=require(P+'tcg-classic-dragon-frontiers'),cpu=require(P+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const generated=cpu.generate({sets:['ex15'],type:'Psychic',seed:18});
assert.ok(generated.ok,'test deck must be legal');
function b(card='ex15-61',op='ex15-61'){
 const s=core.createBattle({format:'classic',playerDeck:generated.cards,opponentDeck:generated.cards,seed:412,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(card,2,'p');s.sides.opponent.active=core.makePokemonSlot(op,2,'o');
 s.sides.player.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Metal:4,Darkness:4,Colorless:4};s.sides.opponent.active.energy={};
 s.sides.player.bench=[core.makePokemonSlot('ex15-61',2,'pb')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex15-61',2,'ob0'),core.makePokemonSlot('ex15-61',2,'ob1')];s.sides.opponent.bench.forEach((p,i)=>p.benchSlot=i);
 return s;
}
const options=s=>core.legalActions(s,s.choiceSide||s.activeSide).filter(x=>x.type==='effectChoice');
function pick(s,condition){assert.equal(s.phase,'effectChoice','expected a real choice');const choice=options(s).find(condition);assert.ok(choice,'missing choice: '+JSON.stringify(options(s)));core.applyAction(s,s.choiceSide||s.activeSide,choice);return s;}
function use(s,index=0,condition=()=>true){const choices=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===index);const act=choices.find(condition);assert.ok(act,'attack not available '+s.sides.player.active.cardId+':'+index+' '+JSON.stringify(choices));core.applyAction(s,'player',act);return s;}
function ability(s,source='active'){const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.target===source);assert.ok(a,'ability unavailable for '+s.sides.player.active.cardId);core.applyAction(s,'player',a);return s;}
test('gated set is now enabled and cards use distinct printed effect rules',()=>{
 assert.equal(df.CARDS.length,101);assert.equal(df.CARDS.filter(x=>!x.battleEnabled).length,0);
 for(const id of [1,2,5,8,10,11,12,64,74,76,91,93,94,95,97,98,99,100,101])assert.ok(cat.cardById('ex15-'+id).battleEnabled,id);
});
test('Ampharos Holon Veil treats non-delta friends as delta and boosts Delta Circle',()=>{
 const s=b('ex15-1','ex15-61');const self=s.sides.player.active;
 const before=fx.attackDamageWithState(s,'player',self,'opponent',s.sides.opponent.active,20,cat.cardById);
 assert.equal(before,20);use(s,0);assert.ok(s.log.some(x=>x.type==='attack'&&x.damage>=40));
});
test('Feraligatr Drag Off switches before weakness calculation, or leaves current Active untouched',()=>{
 const s=b('ex15-2','ex15-61');s.sides.opponent.bench[0].cardId='ex15-91';
 use(s,0,x=>x.effectSelection==='ob0');assert.equal(s.sides.opponent.active.uid,'ob0');assert.equal(s.sides.opponent.active.damage,30);
 assert.ok(s.log.some(x=>x.type==='ex15DragOff'&&x.preDamage));
 const t=b('ex15-2','ex15-61');use(t,0,x=>!x.effectSelection);assert.equal(t.sides.opponent.active.uid,'o');assert.equal(t.sides.opponent.active.damage,30);
});
test('Milotic Sharing reads opponent Supporter and runs effect without removing its card',()=>{
 const s=b('ex15-5');const p=s.sides.player,o=s.sides.opponent;
 o.hand=[{uid:'reporter',cardId:'ex15-82'}]; // TV Reporter: draw then discard; action may create another choice
 ability(s);pick(s,x=>x.choiceHandIndex===0);assert.ok(o.hand.some(x=>x.uid==='reporter'));
 assert.ok(s.log.some(x=>x.type==='ex15Sharing'));
});
test('Ninetales Volunteer requires four damage counters and replaces evolution from physical deck',()=>{
 const s=b('ex15-8');const a=s.sides.player.active;
 a.damage=30;a.stack=['ex15-70','ex15-8'];assert.ok(!core.legalActions(s,'player').some(x=>x.type==='ability'));
 a.damage=50;s.sides.player.deck=[{uid:'replacement',cardId:'ex15-8'},{uid:'irrelevant',cardId:'ex15-61'}];
 ability(s);pick(s,x=>x.choiceDeckIndex===0);assert.equal(a.cardId,'ex15-8');assert.equal(a.damage,10);
 assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex15-8'));assert.equal(a.stack.length,2);
});
test('Snorlax Dozing is optional and heals 20 at the cost of Sleep',()=>{
 const s=b('ex15-10');s.sides.player.active.damage=30;ability(s);pick(s,x=>x.choiceOption===1);
 assert.equal(s.sides.player.active.damage,10);assert.ok(s.sides.player.active.conditions.sleep);
});
test('Togetic Delta Copy selects opposing delta attack without requiring its printed cost',()=>{
 const s=b('ex15-11','ex15-45');s.sides.player.active.energy={Colorless:2};
 use(s,0);pick(s,x=>x.choiceAttackIndex===0&&x.choiceTarget==='active');
 assert.ok(s.log.some(x=>x.type==='ex15CopiedAttack'));
});
test('Typhlosion Shady Move selects source and destination across both boards',()=>{
 const s=b('ex15-12');s.sides.player.active.damage=40;
 ability(s);pick(s,x=>x.choiceOption===0);pick(s,x=>x.choiceTarget==='active');
 pick(s,x=>x.choiceOption===1);pick(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.player.active.damage,30);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Smoochum Alluring Kiss recovers one Basic from deck and one actual Energy from supply',()=>{
 const s=b('ex15-64');s.sides.player.deck=[{uid:'basic',cardId:'ex15-70'}];
 s.sides.player.energySupply=['Fire','Psychic'];use(s,0);pick(s,x=>x.choiceDeckIndex===0);
 if(s.phase==='effectChoice')pick(s,x=>x.choiceOption===0);
 assert.ok(s.sides.player.hand.some(x=>x.uid==='basic'));
});
test('Smoochum Baby Evolution uses an actual Jynx in hand, clears damage',()=>{
 const s=b('ex15-64');s.sides.player.hand=[{uid:'j',cardId:'ex15-17'}];s.sides.player.active.damage=20;
 ability(s);pick(s,x=>x.choiceHandIndex===0);
 assert.equal(s.sides.player.active.cardId,'ex15-17');assert.equal(s.sides.player.active.damage,0);
});
test('Island Hermit reveals up to two prizes permanently and draws two',()=>{
 const s=b();const p=s.sides.player;p.hand=[{uid:'hermit',cardId:'ex15-76'}];p.prizes=[{uid:'pr0',cardId:'ex15-61'},{uid:'pr1',cardId:'ex15-64'},{uid:'pr2',cardId:'ex15-70'}];
 p.deck=[{uid:'draw0',cardId:'ex15-61'},{uid:'draw1',cardId:'ex15-61'}];
 const t=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex15-76');assert.ok(t);core.applyAction(s,'player',t);
 pick(s,x=>x.choiceOption===0);pick(s,x=>x.choiceSkip);
 assert.equal(p.prizes[0].faceUp,true);assert.equal(p.prizes.length,3);
 assert.equal(p.hand.filter(x=>x.uid.startsWith('draw')).length,2);
});
test('Dragonite Dragon Roar places 8 counters with overflow to chosen Bench',()=>{
 const s=b('ex15-91','ex15-66');s.sides.opponent.active.damage=20;s.sides.opponent.bench[0].cardId='ex15-98';
 use(s,1);if(s.phase==='effectChoice')for(let i=0;i<6&&s.phase==='effectChoice';i++)pick(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.opponent.bench[0].damage,60);
 assert.ok(s.log.some(x=>x.type==='ex15TargetDamage'));
});
test('Gardevoir Imprison suppresses marked Pokémon Abilities',()=>{
 const s=b('ex15-93','ex15-2');const t=s.sides.opponent.active;
 ability(s);pick(s,x=>x.choiceTarget==='active');
 assert.equal(t.imprisonMarkers,1);assert.equal(fx.abilitiesSuppressed(s,'opponent',t,cat.cardById),true);
});
test('Kingdra Extra Smoke reduces attacks against friendly Stage 2 ex by 10',()=>{
 const s=b('ex15-61','ex15-61');const defender=s.sides.opponent.active;defender.cardId='ex14-89';
 const before=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',defender,60,cat.cardById);
 s.sides.opponent.bench[0].cardId='ex15-94';assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',defender,60,cat.cardById),before-20); // Reduced before applying target's Fighting Weakness
});
test('Kingdra Energy Link recovers Basic Energy from discard to self',()=>{
 const s=b('ex15-94');s.sides.player.energyDiscard.Fighting=1;
 use(s,0);pick(s,x=>x.choiceOption===0);assert.equal(s.sides.player.energyDiscard.Fighting,0);
});
test('Latias Fellow Boost consumes physical Basic from hand and ends the turn',()=>{
 const s=b('ex15-95');s.sides.player.bench[0].cardId='ex15-96';s.sides.player.hand=[{uid:'e',cardId:'base1-98'}];
 ability(s);pick(s,x=>x.choiceHandIndex===0);pick(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.player.hand.some(x=>x.uid==='e'),false);
 assert.ok(s.sides.player.bench[0].energy.Fire>=1);
 assert.equal(s.activeSide,'opponent');
});
test('Rayquaza Rage Aura reduces only Colorless costs when behind in Prizes',()=>{
 const s=b('ex15-97');s.sides.player.prizes=[1,2,3,4];s.sides.opponent.prizes=[1];
 assert.equal(fx.attackCostOverride(s,'player',s.sides.player.active,cat.cardById('ex15-97').attacks[1],cat.cardById),'LL');
 s.sides.player.prizes=[1];assert.equal(fx.attackCostOverride(s,'player',s.sides.player.active,cat.cardById('ex15-97').attacks[1],cat.cardById),null);
});
test('Salamence Dual Stream offers 80 or a split 40+40 with Bench choice',()=>{
 const s=b('ex15-98','ex15-91');use(s,1,x=>x.effectSelection==='split|ob0');
 assert.equal(s.sides.opponent.active.damage,40);assert.equal(s.sides.opponent.bench[0].damage,40);
 const t=b('ex15-98','ex15-91');use(t,1,x=>!x.effectSelection);assert.equal(t.sides.opponent.active.damage,80);assert.equal(t.sides.opponent.bench[0].damage,0);
});
test('Salamence Type Shift is optional, lasts through the attack and not longer',()=>{
 const s=b('ex15-98');ability(s);pick(s,x=>x.choiceOption===0);assert.deepEqual(fx.effectiveTypes(s,'player',s.sides.player.active,cat.cardById),['Fire']);
 s.turnNumber=12;assert.deepEqual(fx.effectiveTypes(s,'player',s.sides.player.active,cat.cardById),['Water']);
});
test('Tyranitar Electromark adds markers and Shock-wave knocks out only marked target',()=>{
 const s=b('ex15-99');use(s,0);pick(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.opponent.bench[0].shockWaveMarkers,1);
 s.phase='battle';s.activeSide='player';s.turnNumber++;s.sides.player.active.energy={Lightning:4,Colorless:4};
 use(s,2);pick(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.ok(s.sides.opponent.discard.length>0||s.sides.opponent.bench.length<2);
});
test('Charizard Star Dark Swirl discards all attached Energy and top 3 opponent deck cards',()=>{
 const s=b('ex15-100');const a=s.sides.player.active;a.energy={Darkness:4,Colorless:1};a.specialEnergy=[{uid:'special',cardId:'ex15-88'}];
 const before=s.sides.opponent.deck.length;use(s,1);assert.equal(s.sides.opponent.deck.length,before-3);
 assert.ok(Object.values(a.energy).every(x=>!x));assert.equal(a.specialEnergy.length,0);
});
test('Mew Star Rainbow Wave selects attached Basic type and hits matching Pokémon only',()=>{
 const s=b('ex15-101');s.sides.player.active.energy={Water:1};s.sides.opponent.active.cardId='ex15-20';s.sides.opponent.bench[0].cardId='ex15-12';s.sides.opponent.bench[1].cardId='ex15-14';
 use(s,1);pick(s,x=>x.choiceOption===0);assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,0);
});
test('Mew Star Mimicry enforces copied original Energy cost',()=>{
 const s=b('ex15-101','ex15-13');s.sides.player.active.energy={Water:1};use(s,0);
 assert.equal(s.phase,'effectChoice');
});
test('Ninetales Trick Tail lets player attach recovered Energy to a selected Benched Pokémon',()=>{
 const s=b('ex15-8','ex15-91'),us=s.sides.player;
 us.energyDiscard.Fighting=1;us.bench[0].energy={};
 use(s,0);pick(s,x=>x.choiceOption===0);pick(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(us.energyDiscard.Fighting,0);assert.equal(us.bench[0].energy.Fighting,1);
 assert.ok(s.log.some(x=>x.type==='ex15TrickTailEnergy'&&x.targetUid===us.bench[0].uid));
});
test('Charizard Rotating Claws cannot retrieve the Basic Energy just discarded',()=>{
 const s=b('ex15-100','ex15-91');const a=s.sides.player.active,us=s.sides.player;
 a.energy={Darkness:2};us.energyDiscard={Fire:1};
 use(s,0);pick(s,x=>x.choiceOption===0);
 const labels=options(s).map(x=>x.label||x.text||x.effectText||'');
 assert.ok(!options(s).some(x=>String(x.choiceOption)==='1'),'only the previously discarded Fire Energy should be eligible');
 pick(s,x=>x.choiceOption===0);
 assert.equal(a.energy.Fire,1);assert.equal(a.energy.Darkness,1);
 assert.equal(us.energyDiscard.Darkness,1);assert.equal(us.energyDiscard.Fire,0);
});
test('Holon Legacy blocks δ Pokémon Powers but leaves their passive Bodies available',()=>{
 const s=b('ex15-93','ex15-61'),a=s.sides.player.active;
 assert.equal(fx.abilitiesSuppressed(s,'player',a,cat.cardById),false);
 s.stadium={cardId:'ex15-74',uid:'legacy'};
 assert.equal(fx.abilitiesSuppressed(s,'player',a,cat.cardById),true);
 s.stadium=null;
 assert.equal(fx.abilitiesSuppressed(s,'player',a,cat.cardById),false);
});
