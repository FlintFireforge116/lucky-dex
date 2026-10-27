const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const deck=data.BEGINNER_IVYSAUR_DECK;
function fixture(){const s=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:93});for(const side of ['player','opponent']){s.sides[side].active=core.makePokemonSlot('A1-001',0,side);s.sides[side].bench=[];}return s;}
function context(s,action={}){return {state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,action,cardById:data.cardById,random:core.random,shuffle:core.shuffle,drawCard:core.drawCard};}
function patchCard(id,patch,fn){const card=data.cardById(id),saved={...card};Object.assign(card,patch);try{return fn(card);}finally{for(const key of Object.keys(card))delete card[key];Object.assign(card,saved);}}

test('registry rejects unknown and malformed nested effects instead of allowing flat fallback',()=>{
 assert.equal(effects.supportsEffect({type:'heal',amount:20,target:'selfPokemon'}),true);
 assert.equal(effects.supportsEffect({type:'unknownFutureRule'}),false);
 assert.ok(effects.validateEffect({type:'sequence',effects:[{type:'unknownFutureRule'}]}).length);
 assert.ok(effects.validateEffect({type:'damage',amount:-20,target:'opponentActive'}).length);
 assert.ok(effects.validateEffect({type:'heal',amount:20,target:'inventedTarget'}).length);
 assert.throws(()=>effects.applyEffect({type:'unknownFutureRule'},context(fixture())),/Unsupported/);
});

test('selected physical Bench target receives healing and generated typed Energy only',()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'bench');bench.benchSlot=2;bench.damage=30;s.sides.player.bench=[bench];
 effects.applyEffect({type:'sequence',effects:[{type:'heal',target:'selfPokemon',amount:20},{type:'attachEnergy',target:'selfPokemon',energyType:'Water',amount:2}]},context(s,{target:'bench',benchIndex:2}));
 assert.equal(bench.damage,10);assert.deepEqual(bench.energy,{Water:2});assert.deepEqual(s.sides.player.active.energy,{});
 effects.applyEffect({type:'discardEnergy',target:'selfPokemon',energyType:'Water',amount:1},context(s,{target:'bench',benchIndex:2}));assert.deepEqual(bench.energy,{Water:1});
});

test('damage families count Energy, Bench, conditions and seeded coin flips before weakness',()=>{
 const s=fixture();s.sides.player.active.energy={Grass:4};s.sides.player.active.damage=10;s.sides.player.bench=[{cardId:'A1-014',energy:{},damage:0,benchSlot:2}];
 const ctx=context(s);ctx.random=()=>0.25;
 const attack={damage:10,effect:{type:'sequence',effects:[{type:'bonusDamage',amount:20,condition:{type:'selfDamaged'}},{type:'energyDamage',amount:10,source:'self',extraAbove:2},{type:'benchCountDamage',amount:10,side:'self'},{type:'coinDamage',coins:2,amount:20,mode:'add'}]}};
 const result=effects.resolveAttack(attack,ctx);
 assert.equal(result.damage,100);assert.equal(s.sides.opponent.active.damage,0);
 effects.applyEffect({type:'coinFlip',heads:{type:'selfDamage',amount:20},tails:{type:'selfDamage',amount:50}},ctx);assert.equal(s.sides.player.active.damage,30);
});

test('draw and deterministic filtered search/recovery move real card references and respect hand limit',()=>{
 const s=fixture();s.sides.player.hand=[];s.sides.player.deck=[{uid:'a',cardId:'A1-002'},{uid:'b',cardId:'A1-014'},{uid:'c',cardId:'A1-021'}];
 effects.applyEffect({type:'search',filter:{kind:'pokemon',stage:'Basic'},amount:1,source:'deck',random:true},context(s));
 assert.equal(s.sides.player.hand.length,1);assert.equal(data.cardById(s.sides.player.hand[0].cardId).stage,'Basic');
 s.sides.player.discard=[{uid:'recovery',cardId:'A1-029'}];effects.applyEffect({type:'search',filter:{kind:'pokemon'},amount:1,source:'discard',random:true},context(s));assert.ok(s.sides.player.hand.some(r=>r.uid==='recovery'));
 effects.applyEffect({type:'draw',amount:10},context(s));assert.equal(s.sides.player.hand.length,4);assert.equal(s.sides.player.deck.length,0);
});

test('Supporter limit and trainer target enumeration keep physical Bench indices',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Supporter',effect:{type:'heal',amount:20,target:'selfPokemon'}},()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'bench');bench.benchSlot=2;bench.damage=30;s.sides.player.bench=[bench];s.sides.player.active.damage=20;s.sides.player.hand=[{uid:'one',cardId:'BASIC-POKE-BALL'},{uid:'two',cardId:'BASIC-POKE-BALL'}];
 const choices=core.legalActions(s,'player').filter(a=>a.type==='trainer');assert.ok(choices.some(a=>a.target==='bench'&&a.benchIndex===2));assert.equal(choices.some(a=>a.benchIndex===0),false);
 core.applyAction(s,'player',choices.find(a=>a.target==='bench'));assert.equal(bench.damage,10);assert.equal(core.legalActions(s,'player').some(a=>a.type==='trainer'),false);
}));

test('activated Bench ability is once per turn and targets another own Pokemon',()=>patchCard('A1-014',{ability:{name:'Supply',type:'activated',oncePerTurn:true,effect:{type:'attachEnergy',target:'selfPokemon',energyType:'Grass',amount:1}}},()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'ability-owner');bench.benchSlot=2;s.sides.player.bench=[bench];
 const action=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.target==='bench'&&a.benchIndex===2&&a.effectTarget==='active');assert.ok(action);core.applyAction(s,'player',action);assert.equal(s.sides.player.active.energy.Grass,1);assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'),false);
}));

test('Poison and Burn check both Active Pokemon at turn boundaries; paralysis lasts affected own turn',()=>{
 const s=fixture();s.sides.player.active.conditions={poison:{amount:10}};s.sides.opponent.active.conditions={poison:{amount:10},burn:true,paralysis:{appliedTurn:1}};
 core.applyAction(s,'player',{type:'endTurn'});assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.active.damage,30);assert.ok(s.sides.opponent.active.conditions.paralysis);
 assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='attack'||a.type==='retreat'),false);core.applyAction(s,'opponent',{type:'endTurn'});assert.equal(!!s.sides.opponent.active.conditions.paralysis,false);
});

test('recoil and Bench damage resolve all KOs simultaneously and preserve queued manual promotions',()=>patchCard('A1-001',{attacks:[{name:'Crash',cost:'',damage:80,effect:{type:'sequence',effects:[{type:'selfDamage',amount:80},{type:'benchDamage',amount:80,side:'opponent',all:true}]}}]},()=>{
 const s=fixture(),own=core.makePokemonSlot('A1-014',0,'own'),foe=core.makePokemonSlot('A1-014',0,'foe'),foe2=core.makePokemonSlot('A1-014',0,'foe2');own.benchSlot=2;foe.benchSlot=0;foe2.benchSlot=2;s.sides.player.bench=[own];s.sides.opponent.bench=[foe,foe2];
 core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.sides.player.points,3);assert.equal(s.sides.opponent.points,1);assert.equal(s.winner,'player');assert.equal(s.sides.opponent.bench.length,0);
}));

test('Tool passive reductions and Stadium modifiers cease when their source leaves play',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Tool',effect:{type:'modifier',stat:'damageReduction',amount:20,duration:'whileInPlay'}},()=>{
 const s=fixture();s.sides.player.hand=[{uid:'tool',cardId:'BASIC-POKE-BALL'}];core.applyAction(s,'player',{type:'trainer',handIndex:0,target:'active'});assert.equal(s.sides.player.active.tool.cardId,'BASIC-POKE-BALL');
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='trainer'),false);s.sides.opponent.active.energy={Grass:2};core.applyAction(s,'player',{type:'endTurn'});core.applyAction(s,'opponent',{type:'attack',attackIndex:0});assert.equal(s.sides.player.active.damage,20);
}));

test('healthy self-healing attack remains legal; zero-damage status attacks receive no flat damage bonus',()=>{
 patchCard('A1-001',{attacks:[{name:'Recovering hit',cost:'',damage:10,effect:{type:'healSelf',amount:20}}]},()=>{const s=fixture();assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'));});
 patchCard('A1-001',{attacks:[{name:'Sleep',cost:'',damage:0,effect:{type:'status',status:'sleep',target:'opponentActive'}}]},()=>{const s=fixture();effects.applyEffect({type:'modifier',stat:'attackDamage',amount:10,duration:'turn',scope:'team'},context(s));core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.sides.opponent.active.damage,0);});
});

test('turn team and current Active modifiers follow switches and expire at proper turn boundary',()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'new-active');bench.benchSlot=2;bench.energy={Grass:2};s.sides.player.bench=[bench];
 effects.applyEffect({type:'modifier',stat:'attackDamage',amount:10,duration:'turn',scope:'team'},context(s));
 effects.applyEffect({type:'modifier',stat:'retreatCost',amount:-1,duration:'turn',scope:'active'},context(s));
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));core.applyAction(s,'player',{type:'retreat',benchIndex:2});assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),10);
 assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'retreatCost',data.cardById),-1);core.applyAction(s,'player',{type:'endTurn'});assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),0);
});

test('registry validation reports malformed child containers and status descriptors without throwing',()=>{
 for(const e of [{type:'sequence',effects:{}},{type:'sequence',effects:[null]},{type:'statusDamage',amount:20,status:'frozen'},{type:'bonusDamage',amount:20,condition:{type:'selfEnergyAtLeast',energyType:'Unknown'}},{type:'status',status:'sleep',target:'selfBench'}]){assert.doesNotThrow(()=>effects.validateEffect(e));assert.ok(effects.validateEffect(e).length);}
});

test('Confusion tails fails attack, ends turn, and inflicts no TCG-style self damage',()=>{
 const s=fixture();s.rngState=8192;s.sides.player.active.energy={Grass:2};s.sides.player.active.conditions={confusion:true};
 // xorshift(8192)/2^32 = 0.51569188, therefore tails.
 core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.activeSide,'opponent');assert.equal(s.sides.player.active.damage,0);assert.equal(s.sides.opponent.active.damage,0);assert.ok(s.log.some(e=>e.type==='attackFailed'));
});

test('simultaneous Active knockouts pause for both physical promotions before a single turn transition',()=>patchCard('A1-001',{attacks:[{name:'Recoil',cost:'',damage:80,effect:{type:'selfDamage',amount:80}}]},()=>{
 const s=fixture(),own=core.makePokemonSlot('A1-014',0,'own'),foe=core.makePokemonSlot('A1-014',0,'foe');own.benchSlot=2;foe.benchSlot=1;s.sides.player.bench=[own];s.sides.opponent.bench=[foe];core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.phase,'promote');assert.equal(s.promotionSide,'player');core.applyAction(s,'player',{type:'promote',benchIndex:2});assert.equal(s.phase,'promote');assert.equal(s.promotionSide,'opponent');assert.equal(s.turnNumber,1);core.applyAction(s,'opponent',{type:'promote',benchIndex:1});assert.equal(s.phase,'battle');assert.equal(s.turnNumber,2);assert.equal(s.activeSide,'opponent');
}));

test('simultaneous win conditions choose draw or winner by total conditions, never traversal order',()=>patchCard('A1-001',{attacks:[{name:'Recoil',cost:'',damage:80,effect:{type:'selfDamage',amount:80}}]},()=>{
 const s=fixture();s.sides.player.points=2;s.sides.opponent.points=2;core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.winner,'draw');assert.equal(s.sides.player.points,3);assert.equal(s.sides.opponent.points,3);
}));

test('multi Energy Zone selects only configured types using seeded RNG, preserving legacy one-type behavior',()=>{
 const a=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:182,playerEnergyTypes:['Grass','Water','Metal']}),b=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:182,playerEnergyTypes:['Grass','Water','Metal']});
 assert.deepEqual(a.sides.player.energyTypes,['Grass','Water','Metal']);for(let i=0;i<10;i++){core.applyAction(a,a.activeSide,{type:'endTurn'});core.applyAction(b,b.activeSide,{type:'endTurn'});assert.deepEqual(a,b);assert.ok(['Grass','Water','Metal'].includes(a.sides.player.energyType));}
 for(const types of [[],['Unknown'],['Grass','Water','Metal','Fire'],['Grass','Grass']])assert.throws(()=>core.createBattle({playerDeck:deck,opponentDeck:deck,seed:1,playerEnergyTypes:types}),/Energy/);
});

test('an attack with additional selected Bench damage still works when the opposing Bench is empty',()=>patchCard('A1-001',{attacks:[{name:'Splash',cost:'',damage:20,effect:{type:'benchDamage',amount:10,side:'opponent',all:false}}]},()=>{
 const s=fixture();const a=core.legalActions(s,'player').find(a=>a.type==='attack');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.sides.opponent.active.damage,20);
}));

test('moving to Bench clears status and temporary attack effects, while global turn modifiers stay',()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'bench');bench.benchSlot=2;s.sides.player.bench=[bench];s.sides.player.active.conditions={poison:{amount:10},confusion:true};
 effects.applyEffect({type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn'},context(s));effects.applyEffect({type:'modifier',stat:'attackDamage',amount:10,duration:'turn',scope:'team'},context(s));
 effects.applyEffect({type:'switch',side:'self'},context(s,{target:'bench',benchIndex:2}));const old=s.sides.player.bench[0];assert.deepEqual(old.conditions,{});assert.equal(effects.modifierAmount(s,'player',old,'damageReduction',data.cardById),0);assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),10);
});

test('passive conditional modifiers are re-evaluated rather than always being active',()=>patchCard('A1-001',{ability:{name:'Guard',type:'passive',effect:{type:'modifier',stat:'damageReduction',amount:20,duration:'whileInPlay',condition:{type:'selfDamaged'}}}},()=>{
 const s=fixture();assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'damageReduction',data.cardById),0);s.sides.player.active.damage=10;assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'damageReduction',data.cardById),20);
}));

test('all multiple activated abilities use their own usage counter and abilityIndex',()=>patchCard('A1-001',{abilities:[{name:'One',type:'activated',oncePerTurn:true,effect:{type:'attachEnergy',target:'self',energyType:'Grass',amount:1}},{name:'Two',type:'activated',oncePerTurn:true,effect:{type:'attachEnergy',target:'self',energyType:'Water',amount:1}}]},()=>{
 const s=fixture();const first=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.abilityIndex===0);core.applyAction(s,'player',first);const second=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.abilityIndex===1);assert.ok(second);core.applyAction(s,'player',second);assert.deepEqual(s.sides.player.active.energy,{Grass:1,Water:1});assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'),false);
}));

test('replacing a Stadium discards its source and removes its previous passive modifier',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Stadium',effect:{type:'modifier',stat:'damageReduction',amount:20,duration:'whileInPlay',scope:'team'}},()=>{
 const s=fixture();s.sides.player.hand=[{uid:'stadium',cardId:'BASIC-POKE-BALL'}];core.applyAction(s,'player',{type:'trainer',handIndex:0});assert.equal(effects.modifierAmount(s,'opponent',s.sides.opponent.active,'damageReduction',data.cardById),20);s.stadium=null;assert.equal(effects.modifierAmount(s,'opponent',s.sides.opponent.active,'damageReduction',data.cardById),0);
}));

test('retreat and attack locks expire after the specified next turn and clear on switch',()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'bench');bench.benchSlot=2;s.sides.opponent.bench=[bench];s.sides.opponent.active.energy={Grass:2};
 effects.applyEffect({type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},context(s));core.applyAction(s,'player',{type:'endTurn'});assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='retreat'),false);core.applyAction(s,'opponent',{type:'endTurn'});core.applyAction(s,'player',{type:'endTurn'});assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='retreat'),true);
 effects.applyEffect({type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'},context(s));assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='attack'),true);
});

test('selected attack damage targets physical Bench and ignores weakness and Active-only boosts there',()=>patchCard('A1-001',{attacks:[{name:'Snipe',cost:'',damage:0,effect:{type:'selectedDamage',target:'opponentPokemon',amount:30,filter:{damaged:true}}}]},()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'target');bench.benchSlot=2;bench.damage=10;s.sides.opponent.bench=[bench];effects.applyEffect({type:'modifier',stat:'attackDamage',amount:10,duration:'turn',scope:'team'},context(s));const choices=core.legalActions(s,'player').filter(a=>a.type==='attack');assert.deepEqual(choices.map(a=>[a.target,a.benchIndex]),[['opponentBench',2]]);core.applyAction(s,'player',choices[0]);assert.equal(bench.damage,40);assert.equal(s.sides.opponent.active.damage,0);
}));

test('attack prevention blocks damage, status and Energy removal while allowing attacker self heal',()=>patchCard('A1-001',{attacks:[{name:'Debuff',cost:'',damage:40,effect:{type:'sequence',effects:[{type:'status',status:'poison',target:'opponentActive'},{type:'discardEnergy',target:'opponentActive',amount:1},{type:'healSelf',amount:10}]}}]},()=>{
 const s=fixture();s.sides.player.active.damage=20;s.sides.opponent.active.energy={Grass:1};const ctx=context(s);ctx.attacker=s.sides.opponent.active;
 effects.applyEffect({type:'preventDamage',target:'self',duration:'opponentTurn',effects:true},ctx);core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.sides.opponent.active.damage,0);assert.deepEqual(s.sides.opponent.active.conditions,{});assert.equal(s.sides.opponent.active.energy.Grass,1);assert.equal(s.sides.player.active.damage,10);
}));

test('random Energy discards choose seeded individual units and until-tails effects stop at first tails',()=>{
 const s=fixture();s.sides.opponent.active.energy={Grass:2,Water:1};const ctx=context(s);const flips=[0.1,0.9,0.9,0.1,0.9];ctx.random=()=>flips.shift();
 effects.applyEffect({type:'coinUntilTails',effect:{type:'discardEnergy',target:'opponentActive',amount:1,random:true}},ctx);assert.deepEqual(s.sides.opponent.active.energy,{Grass:2,Water:0});assert.equal(flips.length,2);
 const coins=[0.1,0.1,0.9];ctx.random=()=>coins.shift();assert.equal(effects.resolveAttack({damage:10,effect:{type:'coinDamage',coins:'untilTails',amount:20,mode:'add'}},ctx).damage,50);
});

test('extra Energy, attached Tool and Supporter conditions apply exact bonus damage',()=>{
 const s=fixture();s.sides.player.active.energy={Grass:4};s.sides.player.active.tool={cardId:'BASIC-POKE-BALL'};s.sides.player.supporterUsed=true;const attack={damage:10,cost:'GG',effect:{type:'sequence',effects:[{type:'bonusDamage',amount:20,condition:{type:'selfExtraEnergyAtLeast',amount:2,energyType:'Grass'}},{type:'bonusDamage',amount:30,condition:{type:'selfHasTool'}},{type:'bonusDamage',amount:40,condition:{type:'supporterPlayed'}}]}};assert.equal(effects.resolveAttack(attack,context(s)).damage,100);
});

test('end-turn and Checkup triggered abilities use their owner, and retaliation can cause simultaneous KO',()=>patchCard('A1-014',{ability:{name:'Draw',type:'triggered',event:'endTurn',activeOnly:true,effect:{type:'draw',amount:1}}},()=>{
 const s=fixture();s.sides.player.active=core.makePokemonSlot('A1-014',0,'trigger');s.sides.player.hand=[];s.sides.player.deck=[{uid:'draw',cardId:'A1-021'}];core.applyAction(s,'player',{type:'endTurn'});assert.equal(s.sides.player.hand.length,1);
}));

test('a Tool max HP modifier prevents premature KO and is included by effective HP API',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Tool',effect:{type:'modifier',stat:'maxHp',amount:20,duration:'whileInPlay'}},()=>{
 const s=fixture();s.sides.opponent.active.tool={uid:'tool',cardId:'BASIC-POKE-BALL'};s.sides.opponent.active.damage=40;s.sides.player.active.energy={Grass:2};assert.equal(core.maxHp(s,'opponent',s.sides.opponent.active),90);core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.sides.opponent.active.damage,80);assert.equal(s.phase,'battle');
}));

test('Bench-source switching ability moves its source rather than arbitrarily selecting another Bench slot',()=>patchCard('A1-014',{ability:{name:'Step in',type:'activated',oncePerTurn:true,benchOnly:true,effect:{type:'switch',side:'self',source:true}}},()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'source');bench.benchSlot=2;s.sides.player.bench=[bench];const action=core.legalActions(s,'player').find(a=>a.type==='ability');assert.ok(action);core.applyAction(s,'player',action);assert.equal(s.sides.player.active.uid,'source');
}));


test('Checkup triggered damage and retaliation both award simultaneous KOs with physical promotions',()=>{
 patchCard('A1-014',{ability:{name:'Checkup poison',type:'triggered',event:'checkup',activeOnly:true,effect:{type:'damage',target:'opponentActive',amount:10}}},()=>{const s=fixture();s.sides.player.active=core.makePokemonSlot('A1-014',0,'ability');s.sides.opponent.active.damage=60;core.applyAction(s,'player',{type:'endTurn'});assert.equal(s.winner,'player');assert.equal(s.sides.player.points,1);});
 patchCard('A1-014',{ability:{name:'Rough Skin',type:'triggered',event:'damagedByAttack',activeOnly:true,effect:{type:'damage',target:'opponentActive',amount:20}}},()=>{const s=fixture();s.sides.player.active.damage=60;s.sides.player.active.energy={Grass:2};s.sides.opponent.active=core.makePokemonSlot('A1-014',0,'rough');s.sides.opponent.active.damage=40;core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.winner,'draw');assert.equal(s.sides.player.points,1);assert.equal(s.sides.opponent.points,1);});
});

test('damaging Bench attack effects honor passive attack protection and damage reduction',()=>patchCard('A1-014',{ability:{name:'Guard',type:'passive',effect:{type:'preventDamage',duration:'whileInPlay',condition:{type:'opponentEx'}}}},()=>patchCard('A1-001',{points:2,attacks:[{name:'Splash',cost:'',damage:10,effect:{type:'benchDamage',amount:20,side:'opponent',all:true}}]},()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'protected');bench.benchSlot=2;s.sides.opponent.bench=[bench];core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(bench.damage,0);assert.equal(s.sides.opponent.active.damage,10);
})));

test('max HP aura source KO immediately resolves any newly lethal damage on its allies',()=>patchCard('A1-014',{ability:{name:'Vitality',type:'passive',effect:{type:'modifier',stat:'maxHp',scope:'team',amount:20,duration:'whileInPlay'}}},()=>patchCard('A1-001',{attacks:[{name:'Bench hit',cost:'',damage:0,effect:{type:'benchDamage',amount:100,side:'opponent',all:true}}]},()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'aura');bench.benchSlot=2;s.sides.opponent.active.damage=80;s.sides.opponent.bench=[bench];core.applyAction(s,'player',{type:'attack',attackIndex:0});assert.equal(s.winner,'player');assert.equal(s.sides.player.points,2);assert.equal(s.sides.opponent.active,null);
})));

test('damage prevention expires when the protected Pokemon moves to Bench',()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'switch');bench.benchSlot=2;s.sides.player.bench=[bench];effects.applyEffect({type:'preventDamage',target:'self',duration:'opponentTurn',effects:true},context(s));effects.applyEffect({type:'switch',side:'self'},context(s,{target:'bench',benchIndex:2}));assert.equal(effects.attackIsPrevented(s,'player',s.sides.player.bench[0],s.sides.opponent.active,data.cardById),null);
});

test('max HP aura loss resolves lethal allies before continuing an activated ability turn',()=>patchCard('A1-014',{ability:{name:'Vitality',type:'passive',effect:{type:'modifier',stat:'maxHp',scope:'team',amount:20,duration:'whileInPlay'}}},()=>patchCard('A1-001',{ability:{name:'Bench damage',type:'activated',effect:{type:'benchDamage',amount:100,side:'opponent',all:true}}},()=>{
 const s=fixture(),bench=core.makePokemonSlot('A1-014',0,'aura');bench.benchSlot=2;s.sides.opponent.active.damage=80;s.sides.opponent.bench=[bench];const action=core.legalActions(s,'player').find(a=>a.type==='ability');core.applyAction(s,'player',action);assert.equal(s.phase,'finished');assert.equal(s.winner,'player');assert.equal(s.sides.player.points,2);
})));

test('typed extra Energy counts both typed and total surplus after the complete attack cost',()=>{
 const s=fixture();s.sides.player.active.energy={Water:3};const attack={damage:10,cost:'WCC',effect:{type:'bonusDamage',amount:60,condition:{type:'selfExtraEnergyAtLeast',amount:2,energyType:'Water'}}};assert.equal(effects.resolveAttack(attack,context(s)).damage,10);s.sides.player.active.energy.Water=5;assert.equal(effects.resolveAttack(attack,context(s)).damage,70);
});

test('opponent-target attack damage debuffs belong to the defending side through their next turn',()=>{
 const s=fixture();effects.applyEffect({type:'modifier',target:'opponentActive',stat:'attackDamage',amount:-20,duration:'opponentTurn'},context(s));assert.equal(effects.modifierAmount(s,'opponent',s.sides.opponent.active,'attackDamage',data.cardById),-20);assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),0);
});

test('Stadium global modifiers filter each beneficiary on both sides and replacement resolves reduced HP KOs',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Stadium',effect:{type:'modifier',stat:'maxHp',scope:'both',filter:{stage:'Basic'},amount:20,duration:'whileInPlay'}},()=>{
 const s=fixture();s.sides.player.hand=[{uid:'stadium',cardId:'BASIC-POKE-BALL'}];assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'));core.applyAction(s,'player',{type:'trainer',handIndex:0});assert.equal(core.maxHp(s,'player',s.sides.player.active),90);assert.equal(core.maxHp(s,'opponent',s.sides.opponent.active),90);
 s.sides.player.active=core.makePokemonSlot('A1-002',0,'stage1');assert.equal(core.maxHp(s,'player',s.sides.player.active),90);s.stadium=null;assert.equal(core.maxHp(s,'opponent',s.sides.opponent.active),70);
}));

test('Stadium stage and type filters apply bonus damage and retreat costs to both sides',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Stadium',effect:{type:'sequence',effects:[{type:'modifier',stat:'attackDamage',scope:'both',filter:{stage:'Stage 1'},amount:10,duration:'whileInPlay'},{type:'modifier',stat:'retreatCost',scope:'both',filter:{subtype:'Psychic'},amount:-2,duration:'whileInPlay'}]}},()=>{
 const s=fixture();s.stadium={cardId:'BASIC-POKE-BALL',ownerSide:'player'};s.sides.opponent.active=core.makePokemonSlot('A1-002',0,'evolved');assert.equal(effects.modifierAmount(s,'opponent',s.sides.opponent.active,'attackDamage',data.cardById),10);assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),0);
 patchCard('A1-001',{subtype:'Psychic'},()=>assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'retreatCost',data.cardById),-2));
}));

test('Fossil Items enter chosen physical Bench slot but never satisfy opening Basic or retreat',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Item',hp:40,subtype:'Colorless',stage:'Basic',points:1,retreat:0,attacks:[],effect:{type:'playFossil',hp:40,subtype:'Colorless',canRetreat:false},ability:{name:'Discard',type:'activated',effect:{type:'discardSelf'}}},()=>{
 const s=fixture();s.sides.player.hand=[{uid:'fossil',cardId:'BASIC-POKE-BALL'}];const choices=core.legalActions(s,'player').filter(a=>a.type==='trainer');assert.deepEqual(choices.map(a=>a.benchIndex),[0,1,2]);core.applyAction(s,'player',{type:'trainer',handIndex:0,target:'bench',benchIndex:2});assert.equal(core.benchSlotAt(s.sides.player,2).cardId,'BASIC-POKE-BALL');assert.equal(s.sides.player.discard.length,0);assert.throws(()=>core.createBattle({playerDeck:Array(20).fill('BASIC-POKE-BALL'),opponentDeck:deck,seed:9}),/Basic/);
 const fossil=s.sides.player.bench.pop();s.sides.player.bench=[s.sides.player.active];s.sides.player.bench[0].benchSlot=2;fossil.benchSlot=null;s.sides.player.active=fossil;assert.equal(core.legalActions(s,'player').some(a=>a.type==='retreat'),false);
}));

test('voluntary Fossil discard gives no points and Active promotion resumes the same turn',()=>patchCard('BASIC-POKE-BALL',{trainerType:'Item',hp:40,subtype:'Colorless',stage:'Basic',points:1,retreat:0,attacks:[],effect:{type:'playFossil',hp:40,subtype:'Colorless',canRetreat:false},ability:{name:'Discard',type:'activated',effect:{type:'discardSelf'}}},()=>{
 const s=fixture(),incoming=s.sides.player.active;incoming.benchSlot=2;s.sides.player.bench=[incoming];s.sides.player.active=core.makePokemonSlot('BASIC-POKE-BALL',0,'fossil');const action=core.legalActions(s,'player').find(a=>a.type==='ability');assert.ok(action);core.applyAction(s,'player',action);assert.equal(s.sides.opponent.points,0);assert.equal(s.phase,'promote');core.applyAction(s,'player',{type:'promote',benchIndex:2});assert.equal(s.turnNumber,1);assert.equal(s.activeSide,'player');assert.equal(s.sides.player.active.uid,'player');assert.equal(s.sides.player.discard.at(-1).cardId,'BASIC-POKE-BALL');
 const last=fixture();last.sides.player.active=core.makePokemonSlot('BASIC-POKE-BALL',0,'last-fossil');core.applyAction(last,'player',core.legalActions(last,'player').find(a=>a.type==='ability'));assert.equal(last.phase,'finished');assert.equal(last.winner,'opponent');assert.equal(last.sides.opponent.points,0);
}));

test('Energy movement conserves typed Energy and only enumerates qualifying physical Bench sources',()=>{
 const s=fixture(),a=core.makePokemonSlot('A1-014',0,'a'),b=core.makePokemonSlot('A1-021',0,'b');a.benchSlot=0;b.benchSlot=2;a.energy={Psychic:2,Water:1};b.energy={Water:2};s.sides.player.bench=[a,b];const effect={type:'moveEnergy',source:'selfBench',target:'selfActive',energyType:'Psychic',amount:'all'};
 assert.deepEqual(effects.choicesForEffect(effect,context(s)),[{target:'bench',benchIndex:0}]);effects.applyEffect(effect,context(s,{target:'bench',benchIndex:0}));assert.deepEqual(a.energy,{Psychic:0,Water:1});assert.deepEqual(s.sides.player.active.energy,{Psychic:2});
});

test('hand shuffle snapshots both hand sizes before seeded shuffling and redrawing',()=>{
 const s=fixture();s.sides.player.hand=[{uid:'p',cardId:'A1-014'}];s.sides.player.deck=[{uid:'pd',cardId:'A1-021'}];s.sides.opponent.hand=[{uid:'o1',cardId:'A1-014'},{uid:'o2',cardId:'A1-029'}];s.sides.opponent.deck=[];
 effects.applyEffect({type:'handShuffle',side:'both',draw:'same'},context(s));assert.equal(s.sides.player.hand.length,1);assert.equal(s.sides.opponent.hand.length,2);assert.deepEqual([...s.sides.player.hand,...s.sides.player.deck].map(r=>r.uid).sort(),['p','pd']);assert.equal(s.sides.player.discard.length,0);
});

test('passive status immunity works for Pokemon and Tool sources, and Tool onAttach recovery is explicit',()=>patchCard('A1-001',{ability:{name:'Immunity',type:'passive',effect:{type:'preventStatus',duration:'whileInPlay'}}},()=>{
 const s=fixture();effects.applyEffect({type:'status',status:'poison',target:'opponentActive'},context(s));assert.deepEqual(s.sides.opponent.active.conditions,{});
 patchCard('BASIC-POKE-BALL',{trainerType:'Tool',effect:{type:'preventStatus',duration:'whileInPlay'},onAttach:{type:'removeStatus',target:'self'}},()=>{const t=fixture();t.sides.player.active.conditions={poison:{amount:10}};t.sides.player.hand=[{uid:'immunity-tool',cardId:'BASIC-POKE-BALL'}];core.applyAction(t,'player',{type:'trainer',handIndex:0,target:'active'});assert.deepEqual(t.sides.player.active.conditions,{});});
}));

test('legacy saved promotion states safely finish the attacking turn without new continuation fields',()=>{
 const s=fixture(),incoming=core.makePokemonSlot('A1-014',0,'legacy');incoming.benchSlot=2;s.phase='promote';s.promotionSide='opponent';s.sides.opponent.active=null;s.sides.opponent.bench=[incoming];delete s.pendingAfterPromotion;delete s.promotionQueue;core.applyAction(s,'opponent',{type:'promote',benchIndex:2});assert.equal(s.activeSide,'opponent');assert.equal(s.turnNumber,2);
});

test('registry refuses selected own attack targets and malformed movement source filters',()=>{
 assert.ok(effects.validateEffect({type:'selectedDamage',target:'selfPokemon',amount:20}).length);assert.ok(effects.validateEffect({type:'moveEnergy',source:'selfBench',target:'selfActive',amount:'all',sourceFilter:'Psychic'}).length);
});

test('FULL Hitmonlee Stretch Kick never falls back from an empty opposing Bench to the Active Pokemon',()=>{
 const card=data.cardById('A1-154');assert.equal(card.support.status,'FULL');const s=fixture();s.sides.player.active=core.makePokemonSlot(card.id,0,'hitmonlee');s.sides.player.active.energy={Fighting:1};assert.equal(core.legalActions(s,'player').some(a=>a.type==='attack'),false);
 const result=effects.resolveAttack(card.attacks[0],{...context(s),isAttack:true});assert.equal(result.damage,0);assert.equal(result.damageTarget,null);
 const bench=core.makePokemonSlot('A1-014',0,'bench-target');bench.benchSlot=2;s.sides.opponent.bench=[bench];const action=core.legalActions(s,'player').find(a=>a.type==='attack');assert.equal(action.target,'opponentBench');assert.equal(action.benchIndex,2);core.applyAction(s,'player',action);assert.equal(bench.damage,30);assert.equal(s.sides.opponent.active.damage,0);
});
