const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');

function battle(){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:47,firstSide:'player'});
 b.phase='battle';b.activeSide='player';b.turnNumber=5;b.sides.player.turnCount=3;b.sides.opponent.turnCount=3;
 b.sides.player.active=C.makePokemonSlot('A1-001',1,'p-active');
 b.sides.opponent.active=C.makePokemonSlot('A1-001',1,'o-active');
 b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.bench=[];b.sides.opponent.bench=[];return b;
}
function bench(side,cardId,uid,index){const s=C.makePokemonSlot(cardId,1,uid);s.benchSlot=index;side.bench.push(s);return s;}

test('top-deck reorder removes already selected cards and commits requested order',()=>{
 const b=battle();b.sides.player.deck=[{uid:'d1',cardId:'A1-001'},{uid:'d2',cardId:'A1-002'},{uid:'d3',cardId:'A1-003'}];
 E.applyEffect({type:'reorderTop',deckSide:'self',count:3},C.effectContext(b,'player'));
 let actions=C.legalActions(b,'player');assert.equal(actions.length,3);
 C.applyAction(b,'player',actions.find(a=>a.choiceCardId==='A1-003'));
 actions=C.legalActions(b,'player');assert.equal(actions.length,2);assert.ok(!actions.some(a=>a.choiceCardId==='A1-003'));
 C.applyAction(b,'player',actions.find(a=>a.choiceCardId==='A1-001'));
 actions=C.legalActions(b,'player');assert.equal(actions.length,1);C.applyAction(b,'player',actions[0]);
 assert.deepEqual(b.sides.player.deck.slice(0,3).map(x=>x.uid),['d3','d1','d2']);
});

test('Team Rocket Boss choices come from opponent hand and can bench multiple Basics',()=>{
 const b=battle();b.sides.opponent.hand=[{uid:'oh1',cardId:'A1-014'},{uid:'oh2',cardId:'A1-021'}];
 E.applyEffect({type:'benchBasicsFromOpponentHand'},C.effectContext(b,'player'));
 let actions=C.legalActions(b,'player');assert.equal(b.choiceSide,'player');assert.equal(actions.filter(a=>!a.choiceSkip).length,2);
 const first=actions.find(a=>a.choiceCardId==='A1-014');assert.ok(first);C.applyAction(b,'player',first);
 assert.equal(b.sides.opponent.bench.length,1);assert.equal(b.sides.opponent.bench[0].cardId,'A1-014');
 actions=C.legalActions(b,'player');assert.ok(actions.some(a=>a.choiceCardId==='A1-021'));C.applyAction(b,'player',actions.find(a=>a.choiceCardId==='A1-021'));
 assert.equal(b.sides.opponent.bench.length,2);assert.equal(b.sides.opponent.hand.length,0);
});

test('Delcatty redistribution exposes energy source choices and moves chosen energy',()=>{
 const b=battle();const p=b.sides.player,src=p.active,dst=bench(p,'A1-014','dst',0);src.energy={Water:1,Lightning:1};dst.energy={};
 E.applyEffect({type:'redistributeEnergy'},C.effectContext(b,'player'));
 let actions=C.legalActions(b,'player');assert.ok(actions.some(a=>a.choiceTarget==='active'&&a.effectEnergyType==='Water'));
 C.applyAction(b,'player',actions.find(a=>a.choiceTarget==='active'&&a.effectEnergyType==='Water'));
 actions=C.legalActions(b,'player');const toBench=actions.find(a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);assert.ok(toBench);C.applyAction(b,'player',toBench);
 assert.equal(src.energy.Water,0);assert.equal(dst.energy.Water,1);
 actions=C.legalActions(b,'player');const done=actions.find(a=>a.choiceOption===1);assert.ok(done);C.applyAction(b,'player',done);assert.equal(b.phase,'battle');
});

test('Professor Sada exposes distinct discarded Energy choices and attaches three different types',()=>{
 const b=battle(),p=b.sides.player;const ancient=p.active;ancient.cardId='B3a-036'; // an Ancient card in catalogue
 const second=bench(p,'B3a-034','ancient2',0);p.energyDiscard={Fire:1,Water:1,Fighting:1,Grass:1};
 E.applyEffect({type:'distributeDiscardEnergyDistinct',amount:3,filter:{tag:'Ancient'}},C.effectContext(b,'player'));
 for(const type of ['Fire','Water','Fighting']){
   const actions=C.legalActions(b,'player');const pick=actions.find(a=>a.effectEnergyType===type&&a.choiceTarget==='active')||actions.find(a=>a.effectEnergyType===type);assert.ok(pick,`missing ${type} choice`);C.applyAction(b,'player',pick);
 }
 assert.equal((ancient.energy.Fire||0)+(ancient.energy.Water||0)+(ancient.energy.Fighting||0)+(ancient.energy.Grass||0),3);
 assert.equal(Object.values(p.energyDiscard).reduce((a,n)=>a+n,0),1);
 assert.equal(b.phase,'battle');assert.ok(second);
});

test('effectSelection participates in legal action matching for discard-for-bonus attacks',()=>{
 const b=battle(),p=b.sides.player;p.active=C.makePokemonSlot('A4-045',1,'gyarados');p.active.energy={Water:2};bench(p,'A1-053','b1',0);bench(p,'A1-057','b2',1);
 const attacks=C.legalActions(b,'player').filter(a=>a.type==='attack');const choice=attacks.find(a=>String(a.effectSelection||'').split(',').filter(Boolean).length===1);assert.ok(choice);
 C.applyAction(b,'player',choice);assert.equal(p.bench.length,1);
});

test('Revavroom can physically hold two Tool cards and offers the second attachment',()=>{
 const b=battle(),p=b.sides.player;p.active=C.makePokemonSlot('B4-115',1,'rev');p.hand=[{uid:'t1',cardId:'A2-148'},{uid:'t2',cardId:'A3a-065'}];
 let attach=C.legalActions(b,'player').find(a=>a.type==='trainer'&&a.cardId==='A2-148'&&a.target==='active');assert.ok(attach);C.applyAction(b,'player',attach);
 attach=C.legalActions(b,'player').find(a=>a.type==='trainer'&&a.cardId==='A3a-065'&&a.target==='active');assert.ok(attach,'second Tool should still be attachable');C.applyAction(b,'player',attach);
 assert.equal(p.active.tool.cardId,'A2-148');assert.deepEqual((p.active.extraTools||[]).map(x=>x.cardId),['A3a-065']);
});

test('Passimian KO trigger pauses removal, moves all Fighting Energy, then completes KO',()=>{
 const b=battle(),p=b.sides.player,o=b.sides.opponent;b.activeSide='opponent';
 p.active=C.makePokemonSlot('A3-104',1,'pass');p.active.energy={Fighting:2};p.active.damage=C.maxHp(b,'player',p.active)-10;const target=bench(p,'A1-001','receiver',0);
 o.active=C.makePokemonSlot('A1-001',1,'atk');o.active.energy={Grass:1,Colorless:1};
 const attack=C.legalActions(b,'opponent').find(a=>a.type==='attack');assert.ok(attack);C.applyAction(b,'opponent',attack);
 assert.equal(b.phase,'effectChoice');assert.equal(b.choiceSide,'player');assert.equal(p.active.uid,'pass','KO source must remain until its trigger resolves');
 const move=C.legalActions(b,'player').find(a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);assert.ok(move);C.applyAction(b,'player',move);
 assert.equal(target.energy.Fighting,2);assert.equal(o.points,2);assert.ok(!p.active||p.active.uid!=='pass');
});

test('Electrical Cord moves two Lightning Energy to two distinct Benched Pokemon before KO completes',()=>{
 const b=battle(),p=b.sides.player,o=b.sides.opponent;b.activeSide='opponent';
 p.active=C.makePokemonSlot('A1-053',1,'corded');p.active.tool={uid:'cord',cardId:'A3a-065'};p.active.energy={Lightning:2};p.active.damage=C.maxHp(b,'player',p.active)-10;
 const one=bench(p,'A1-057','one',0),two=bench(p,'A1-059','two',1);
 o.active=C.makePokemonSlot('A1-001',1,'atk');o.active.energy={Grass:1,Colorless:1};
 C.applyAction(b,'opponent',C.legalActions(b,'opponent').find(a=>a.type==='attack'));
 assert.equal(b.phase,'effectChoice');let choices=C.legalActions(b,'player');assert.equal(choices.filter(a=>a.choiceTarget==='bench').length,2);
 C.applyAction(b,'player',choices.find(a=>a.choiceBenchIndex===0));choices=C.legalActions(b,'player');assert.ok(!choices.some(a=>a.choiceBenchIndex===0));C.applyAction(b,'player',choices.find(a=>a.choiceBenchIndex===1));
 assert.equal(one.energy.Lightning,1);assert.equal(two.energy.Lightning,1);assert.equal(o.points,1);
});

test('Mega Kangaskhan applies its second 40-damage attack when the first hit does not KO',()=>{
 const b=battle(),p=b.sides.player,o=b.sides.opponent;p.active=C.makePokemonSlot('B2-127',1,'kang');p.active.energy={Colorless:3};o.active=C.makePokemonSlot('A1-003',1,'tank');
 const attack=C.legalActions(b,'player').find(a=>a.type==='attack');assert.ok(attack);C.applyAction(b,'player',attack);
 assert.equal(o.active.damage,120);assert.equal(b.activeSide,'opponent');assert.equal(b.phase,'battle');
});

test('Mega Kangaskhan waits for promotion before applying its second 40-damage attack',()=>{
 const b=battle(),p=b.sides.player,o=b.sides.opponent;p.active=C.makePokemonSlot('B2-127',1,'kang');p.active.energy={Colorless:3};o.active=C.makePokemonSlot('A1-001',1,'fragile');o.active.damage=C.maxHp(b,'opponent',o.active)-20;const incoming=bench(o,'A1-003','incoming',0);
 C.applyAction(b,'player',C.legalActions(b,'player').find(a=>a.type==='attack'));
 assert.equal(b.phase,'promote');assert.equal(b.promotionSide,'opponent');assert.equal(incoming.damage,0);
 C.applyAction(b,'opponent',C.legalActions(b,'opponent')[0]);
 assert.equal(o.active.uid,'incoming');assert.equal(o.active.damage,40);assert.equal(b.activeSide,'opponent');assert.equal(b.phase,'battle');
});

test('Victini offers a real keep-or-reroll decision after a Fire Pokemon attack coin flip',()=>{
 const b=battle(),p=b.sides.player,o=b.sides.opponent;b.rngState=32;p.active=C.makePokemonSlot('A1-046',1,'moltres');p.active.energy={Fire:1,Colorless:2};bench(p,'P-B-049','victini',0);o.active=C.makePokemonSlot('A1-003',1,'target');
 C.applyAction(b,'player',C.legalActions(b,'player').find(a=>a.type==='attack'));
 assert.equal(b.phase,'effectChoice');assert.equal(b.choiceSide,'player');let opts=C.legalActions(b,'player');assert.deepEqual(opts.map(x=>x.choiceLabel),['Keep results','Reroll']);
 C.applyAction(b,'player',opts.find(x=>x.choiceLabel==='Reroll'));
 assert.equal(b.phase,'battle');assert.equal(b.activeSide,'opponent');assert.equal(b.sides.player.coinRerollUsedTurn?.attack,5);
});

test('Gholdengo offers a real keep-or-reroll decision for Trainer coin effects',()=>{
 const b=battle(),p=b.sides.player;b.rngState=32;p.active=C.makePokemonSlot('B4a-051',1,'gold');p.hand=[{uid:'master',cardId:'B4a-070'}];
 const trainer=C.legalActions(b,'player').find(a=>a.type==='trainer'&&a.cardId==='B4a-070');assert.ok(trainer);C.applyAction(b,'player',trainer);
 assert.equal(b.phase,'effectChoice');assert.equal(b.choiceSide,'player');const opts=C.legalActions(b,'player');assert.deepEqual(opts.map(x=>x.choiceLabel),['Keep results','Reroll']);
 C.applyAction(b,'player',opts.find(x=>x.choiceLabel==='Reroll'));
 assert.equal(b.phase,'battle');assert.equal(b.sides.player.coinRerollUsedTurn?.trainer,5);assert.ok(b.sides.player.discard.some(x=>x.cardId==='B4a-070'));
});
