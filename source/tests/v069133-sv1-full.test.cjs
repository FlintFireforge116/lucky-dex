const {test}=require('node:test'),assert=require('node:assert/strict');
const base='../app/src/main/assets/';
const sv=require(base+'tcg-classic-scarlet-violet.js');
const core=require(base+'tcgp-battle-core.js');
const effects=require(base+'tcgp-battle-effects.js');
const dat=require(base+'tcg-classic-battle-data.js');
const deck=[...Array(4).fill('sv1-30'),...Array(4).fill('sv1-32'),...Array(4).fill('sv1-33'),...Array(4).fill('sv1-36'),...Array(4).fill('sv1-188'),...Array(4).fill('sv1-180'),...Array(4).fill('sv1-189'),...Array(2).fill('sv1-194')];
const EN={Grass:6,Fire:6,Water:6,Lightning:6,Psychic:6,Fighting:6,Darkness:6,Metal:6,Colorless:6};
function slot(id,uid,energy={}){return {...core.makePokemonSlot(id,0,uid),energy:{...energy}};}
function make(own='sv1-32',foe='sv1-32'){
 const st=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:8104,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 st.phase='battle';st.activeSide='player';st.turnNumber=3;st.sides.player.turnCount=2;
 st.sides.player.active=slot(own,'pactive',EN);st.sides.opponent.active=slot(foe,'oactive',EN);
 st.sides.player.bench=[slot('sv1-30','pbench',{Psychic:2}),slot('sv1-84','psybench')].map((v,i)=>({...v,benchSlot:i}));
 st.sides.opponent.bench=[slot('sv1-30','obench'),slot('sv1-68','obench2')].map((v,i)=>({...v,benchSlot:i}));
 st.sides.player.energySupply=['Psychic','Water','Lightning','Fighting','Psychic','Fire','Fire'];
 st.sides.player.energyDiscard={Psychic:4,Fighting:4,Fire:4,Water:4,Lightning:4};
 return st;
}
function use(st,pick,side='player'){
 const acts=core.legalActions(st,side),a=acts.find(pick);assert.ok(a,'Missing action from '+acts.length+': '+JSON.stringify(acts.slice(0,7)));core.applyAction(st,side,a);return a;
}
function resolve(st,choice=(acts)=>acts.find(a=>!a.choiceSkip)||acts[0]){let n=0;while(st.phase==='effectChoice'&&n++<28){const side=st.choiceSide||'player',acts=core.legalActions(st,side);assert.ok(acts.length,JSON.stringify(st.pendingChoice));const act=choice(acts,st);assert.ok(act,'No suitable choice '+JSON.stringify(st.pendingChoice));core.applyAction(st,side,act);}assert.notEqual(st.phase,'effectChoice','Pending unresolved choice');}
function attack(st,i=0){use(st,a=>a.type==='attack'&&a.attackIndex===i);resolve(st);}
function ability(st,name){return use(st,a=>a.type==='ability'&&dat.cardById(a.cardId)?.abilities?.some(x=>x.name===name));}

test('SV1 has 258 registered prints; 256 non-Energy battle ready; alternate print mapping',()=>{
 assert.equal(sv.CARDS.length,258);assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length,256);
 for(const n of [223,228,243,245,253])assert.equal(sv.CARDS[n-1].battleEnabled,true);
 for(const n of [257,258])assert.equal(sv.CARDS[n-1].deckEligible,false);
});
test('Gardevoir ex Psychic Embrace attaches discarded Energy and adds 20 damage without KO',()=>{
 const st=make('sv1-86');const t=st.sides.player.bench[1];t.damage=0;
 ability(st,'Psychic Embrace');assert.equal(st.phase,'effectChoice');
 const opts=core.legalActions(st,'player');assert.ok(opts.some(a=>a.choiceCardId==='sv1-84'&&a.effectEnergyType==='Psychic'));
 use(st,a=>a.choiceCardId==='sv1-84'&&a.effectEnergyType==='Psychic');
 assert.equal(t.energy.Psychic,1);assert.equal(t.damage,20);assert.equal(st.sides.player.energyDiscard.Psychic,3);
});
test('Gardevoir ex cannot knock out a Pokémon with Psychic Embrace',()=>{
 const st=make('sv1-86');st.sides.player.bench[1].damage=60;// Ralts 70HP, 20 more would KO
 ability(st,'Psychic Embrace');const options=core.legalActions(st,'player');
 assert.equal(options.some(x=>x.choiceCardId==='sv1-84'),false);
 resolve(st);assert.equal(st.sides.player.bench[1].damage,60);
});
test('Koraidon ex Dino Cry attaches discarded Fighting Energy and ends its turn',()=>{
 const st=make('sv1-125');const t=st.sides.player.bench[0];t.cardId='sv1-123';t.energy={};
 ability(st,'Dino Cry');assert.equal(st.phase,'effectChoice');
 use(st,a=>a.choiceCardId==='sv1-123'&&a.effectEnergyType==='Fighting');
 if(st.phase==='effectChoice')use(st,a=>a.choiceCardId==='sv1-123'&&a.effectEnergyType==='Fighting');
 assert.equal(t.energy.Fighting,2);assert.equal(st.activeSide,'opponent');
});
test('Magnezone ex Energy Crush counts physical attached Energy rather than double-valued energy',()=>{
 const st=make('sv1-65','sv1-32');st.sides.opponent.active.energy={Fire:1};st.sides.opponent.bench[0].energy={Water:1};st.sides.opponent.bench[1].energy={};
 st.stadium={uid:'founja',cardId:'SNAPFOUNJA-080'};
 attack(st,0);assert.equal(st.sides.opponent.active.damage,100);
});
test('Cetitan Sweeping Tackle loses 20 per damage counter',()=>{
 const st=make('sv1-60','sv1-86');st.sides.player.active.damage=30;
 attack(st,1);assert.equal(st.sides.opponent.active.damage,140);
});
test('Florges Blooming Garden prevents Weakness for allies while in play',()=>{
 const st=make('sv1-46','sv1-30');st.sides.opponent.bench[0].cardId='sv1-93';
 const before=effects.attackDamageWithState(st,'player',st.sides.player.active,'opponent',st.sides.opponent.active,30,dat.cardById);assert.equal(before,30);
 st.sides.opponent.bench[0].cardId='sv1-33';
 const after=effects.attackDamageWithState(st,'player',st.sides.player.active,'opponent',st.sides.opponent.active,30,dat.cardById);assert.equal(after,60);
});
test('Dachsbun Well-Baked Body prevents Fire attack and Burn',()=>{
 const st=make('sv1-30','sv1-99');const guard=effects.attackIsPrevented(st,'opponent',st.sides.opponent.active,st.sides.player.active,dat.cardById);
 assert.equal(guard?.reason,'Well-Baked Body');assert.equal(effects.statusIsPrevented(st,st.sides.opponent.active,dat.cardById,'burn'),true);
});
test('Beach Court reduces Basic retreat costs and Defiance Band requires prize disadvantage',()=>{
 const st=make('sv1-30','sv1-32');const original=core.legalActions(st,'player').some(x=>x.type==='retreat');
 st.stadium={uid:'st1',cardId:'sv1-167'};
 assert.ok(core.legalActions(st,'player').some(x=>x.type==='retreat'));
 const band=dat.cardById('sv1-169'); st.sides.player.active.tool={uid:'band',cardId:band.id};
 st.sides.player.prizes=[{uid:'a'},{uid:'b'}];st.sides.opponent.prizes=[{uid:'c'}];
 assert.equal(effects.modifierAmount(st,'player',st.sides.player.active,'attackDamage',dat.cardById),30);
 st.sides.player.prizes=[{uid:'a'}];st.sides.opponent.prizes=[{uid:'c'},{uid:'d'}];
 assert.equal(effects.modifierAmount(st,'player',st.sides.player.active,'attackDamage',dat.cardById),0);
});
test('Skeledirge Passionate Singing attaches at most two Basic Energy with no endless choices',()=>{
 const st=make('sv1-38');st.sides.player.bench[0].energy={};
 attack(st,0); assert.equal(st.sides.opponent.active.damage,50);
 assert.equal(Object.values(st.sides.player.bench[0].energy).reduce((a,b)=>a+b,0)+Object.values(st.sides.player.bench[1].energy).reduce((a,b)=>a+b,0)+Object.values(st.sides.player.active.energy).reduce((a,b)=>a+b,0),Object.values(EN).reduce((a,b)=>a+b,0)+2);
});
test('Drifblim Curse Spreading allocates exactly eight counters and stops',()=>{
 const st=make('sv1-90');attack(st,1);assert.equal(st.sides.opponent.active.damage,80);
});
test('Hawlucha Flying Entry chooses opposing Bench targets',()=>{
 const st=make('sv1-30');st.sides.player.hand.unshift({uid:'hawk',cardId:'sv1-118'});
 use(st,a=>a.type==='bench'&&a.cardId==='sv1-118');assert.equal(st.phase,'effectChoice');
 const opts=core.legalActions(st,'player');assert.ok(opts.some(x=>x.choiceCardId==='sv1-68'));
 use(st,a=>a.choiceCardId==='sv1-68');resolve(st);
 assert.equal(st.sides.opponent.bench[0].damage,10);assert.equal(st.sides.opponent.bench[1].damage,10);
});
test('Squawkabilly Fly deals zero damage on a Tails and protects on Heads',()=>{
 let damages=new Set();for(let seed=1;seed<12;seed++){
  const st=make('sv1-162');st.rngState=(seed*123456789)>>>0;attack(st,1);damages.add(st.sides.opponent.active.damage);
 }assert.ok(damages.has(0));assert.ok(damages.has(60));
});
test('Exp. Share transfers one Basic Energy before ally Active knockout discard',()=>{
 const st=make('sv1-30','sv1-32');st.activeSide='opponent';st.sides.player.active.energy={Fire:1};st.sides.player.active.damage=50;
 st.sides.player.bench[0].tool={uid:'exp-share',cardId:'sv1-174'};st.sides.player.bench[0].energy={};
 st.sides.opponent.active.energy={Fire:5};
 const mv=core.legalActions(st,'opponent').find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(mv);
 core.applyAction(st,'opponent',mv);resolve(st);
 assert.equal(st.sides.player.bench[0].energy.Fire,1);
 assert.equal(st.sides.player.energyDiscard.Fire||0,4); // four pre-existing discarded Fire remain unchanged
});
test('Energy Carnival adds Energy to a selected Pokémon without consuming ordinary attachment',()=>{
 const st=make('sv1-54');st.sides.player.energySupply=['Water','Fire'];
 ability(st,'Energy Carnival');assert.equal(st.phase,'effectChoice');
 use(st,a=>a.choiceTarget==='bench'&&a.choiceCardId==='sv1-30'&&a.effectEnergyType==='Water');
 assert.equal(st.sides.player.bench[0].energy.Water,1);
 assert.equal(st.sides.player.energyUsed,false);
 assert.equal(st.sides.player.energySupply[0],'Fire');
});
test('Poison Sacs Muk keeps opposing Poisoned Pokémon poisoned through evolution',()=>{
 const st=make('sv1-30','sv1-30');st.sides.opponent.bench[0].cardId='sv1-127';st.sides.player.active.conditions.poison={amount:10};
 st.sides.player.active.cardId='sv1-30';st.sides.player.active.stack=['sv1-30'];
 // Evolution can only occur if card evolves from Growlithe, and a fresh turn has passed.
 st.sides.player.hand.unshift({uid:'evolve',cardId:'sv1-32'});st.sides.player.active.playedOnSideTurn=0;
 use(st,a=>a.type==='evolve'&&a.cardId==='sv1-32'&&a.target==='active');
 assert.ok(st.sides.player.active.conditions.poison);
});
test('Energy Retrieval reclaims two Energy from the separate discard into hand',()=>{
 const st=make();st.sides.player.energyDiscard={Psychic:2};st.sides.player.discard=[];st.sides.player.hand.unshift({uid:'retrieval',cardId:'sv1-171'});
 use(st,a=>a.type==='trainer'&&a.cardId==='sv1-171');resolve(st);
 const psychic=st.sides.player.hand.filter(r=>dat.cardById(r.cardId)?.basicEnergy&&dat.cardById(r.cardId).subtype==='Psychic');
 assert.ok(psychic.length>=2);assert.equal(st.sides.player.energyDiscard.Psychic,0);
});
test('Electric Generator only examines next five Energy Zone cards',()=>{
 const st=make();st.sides.player.energySupply=['Water','Lightning','Water','Lightning','Grass','Lightning'];st.sides.player.bench[0].cardId='sv1-68';st.sides.player.bench[0].energy={};
 st.sides.player.hand.unshift({uid:'generator',cardId:'sv1-170'});
 use(st,a=>a.type==='trainer'&&a.cardId==='sv1-170');resolve(st);
 assert.equal(st.sides.player.bench[0].energy.Lightning,2);
 assert.deepEqual(st.sides.player.energySupply,['Water','Water','Grass','Lightning']);
});
test('Arboliva Enriching Oil asks which injured ally to heal upon evolution from hand',()=>{
 const st=make('sv1-30');st.sides.player.active.damage=50;
 const sprig=st.sides.player.bench[0];sprig.cardId='sv1-22';sprig.stack=['sv1-20','sv1-22'];sprig.playedOnSideTurn=0;
 st.sides.player.hand.unshift({uid:'olive',cardId:'sv1-23'});
 use(st,a=>a.type==='evolve'&&a.cardId==='sv1-23');assert.equal(st.phase,'effectChoice');
 const choices=core.legalActions(st,'player');assert.ok(choices.some(x=>x.choiceCardId==='sv1-30'));
 use(st,a=>a.choiceTarget==='active');assert.equal(st.sides.player.active.damage,0);
});
test('Penny returns Basic Pokémon, Tool, and Darkness/Metal Energy to hand',()=>{
 const st=make('sv1-30');st.sides.player.active.energy={Darkness:1,Metal:1};st.sides.player.active.tool={uid:'tool',cardId:'sv1-169'};
 st.sides.player.hand.unshift({uid:'penny',cardId:'sv1-183'});
 use(st,a=>a.type==='trainer'&&a.cardId==='sv1-183'&&(a.effectTarget==='active'||a.target==='active'));
 resolve(st);
 const cards=st.sides.player.hand.map(ref=>ref.cardId);
 assert.ok(cards.includes('sv1-30'));assert.ok(cards.includes('sv1-169'));assert.ok(cards.includes('lental-basic-darkness'));assert.ok(cards.includes('lental-basic-metal'));
});
