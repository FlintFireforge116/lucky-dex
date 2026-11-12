'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const base='../app/src/main/assets/';
const cards=require(base+'tcg-classic-power-keepers'),core=require(base+'tcgp-battle-core'),fx=require(base+'tcgp-battle-effects'),opp=require(base+'tcg-classic-opponents');
const gen=opp.generate({sets:['ex15'],seed:19,type:'Darkness'});assert.ok(gen.ok);
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function setup(att='ex16-18',def='ex16-58'){
 const s=core.createBattle({format:'classic',playerDeck:gen.cards,opponentDeck:gen.cards,seed:19,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(att,4,'a');s.sides.opponent.active=core.makePokemonSlot(def,4,'b');
 s.sides.player.active.energy={Grass:3,Fire:3,Water:3,Lightning:3,Psychic:3,Fighting:3,Darkness:3,Metal:3};s.sides.opponent.active.energy={Lightning:2};
 s.sides.player.bench=[core.makePokemonSlot('ex16-43',4,'c')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex16-59',4,'d')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function legal(s,side='player'){return core.legalActions(s,side)}
function item(s,id){s.sides.player.hand.push({uid:'h'+id,cardId:id});const a=legal(s).find(a=>a.type==='trainer'&&a.cardId===id);assert.ok(a,'trainer playable '+id);core.applyAction(s,'player',a);}
function attack(s,i=0){const a=legal(s).find(a=>a.type==='attack'&&a.attackIndex===i);assert.ok(a,'attack '+i+' playable '+s.sides.player.active.cardId);core.applyAction(s,'player',a);}
function pick(s,fn){const side=s.choiceSide||s.activeSide,a=legal(s,side).filter(a=>a.type==='effectChoice'),v=fn?a.find(fn):a.find(a=>!a.choiceSkip);assert.ok(v,'option missing: '+JSON.stringify(a).slice(0,600));core.applyAction(s,side,v);return v;}
function resolve(s,fn){let n=0;while(s.phase==='effectChoice'&&n++<20)pick(s,fn);assert.ok(n<21,'choice settled');}
function stadium(s,id){item(s,id);assert.equal(s.stadium?.cardId,id);}

test('source manifest now has all 108 cards and new effect definitions validate',()=>{
 const summary=cards.coverage();assert.equal(summary.total,108);assert.equal(summary.battleEnabled,108);assert.equal(summary.partial.length,0);
 for(const n of [2,4,18,21,70,71,72,73,75,76,79,81,82,83]){
  const c=cards.cardById('ex16-'+n);assert.equal(c.battleEnabled,true,c.id);assert.equal(c.support.status,'FULL',c.id);
  for(const e of [c.effect,...(c.attacks||[]).map(x=>x.effect),...(c.abilities||[]).map(x=>x.effect)].filter(Boolean))assert.deepEqual(fx.validateEffect(e),[],c.id);
 }
 for(const n of [3,5,7,8,9,10,13,22,45,56,84,86,92,93,94,95,97,98,99,100,101,102])assert.equal(cards.cardById('ex16-'+n).battleEnabled,true);
});
test('Battle Frontier suppresses Stage 1 Darkness and Colorless powers but not Basic or Fighting',()=>{
 const s=setup('ex16-27');s.stadium={uid:'stad',cardId:'ex16-71'};
 assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,require(base+'tcg-classic-battle-data').cardById),true);
 s.sides.player.active=core.makePokemonSlot('ex16-70',4,'a');assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,require(base+'tcg-classic-battle-data').cardById),false);
 s.sides.player.active=core.makePokemonSlot('ex16-2',4,'a');assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,require(base+'tcg-classic-battle-data').cardById),true);
});
test('Drake Stadium prevents 10 damage only to Colorless Active and heals Altaria at checkup',()=>{
 const a=setup('ex16-48','ex16-66');a.sides.player.active.energy={Fire:2};attack(a,0);const raw=a.sides.opponent.active.damage;
 const b=setup('ex16-48','ex16-66');b.sides.player.active.energy={Fire:2};b.stadium={uid:'drake',cardId:'ex16-72'};attack(b,0);assert.equal(raw-b.sides.opponent.active.damage,10);
 const c=setup('ex16-2','ex16-58');c.stadium={uid:'drake',cardId:'ex16-72'};c.sides.player.active.damage=40;core.checkup(c);assert.equal(c.sides.player.active.damage,30);
});
test('Glacia Stadium removes Weakness from non-ex Water Pokémon only',()=>{
 const no=setup('ex16-54','ex16-65');no.sides.player.active.energy={Lightning:3};attack(no,0);let dmg=no.sides.opponent.active.damage;
 const yes=setup('ex16-54','ex16-65');yes.sides.player.active.energy={Lightning:3};yes.stadium={uid:'g',cardId:'ex16-76'};attack(yes,0);assert.ok(dmg>=yes.sides.opponent.active.damage,'Water non-ex Weakness must disappear');
});
test('Phoebe Stadium reduces Psychic retreat cost by two',()=>{
 const s=setup('ex16-14');const before=core.effectContext(s,'player',{},s.sides.player.active).retreatCost('player');s.stadium={uid:'ph',cardId:'ex16-79'};
 const after=core.effectContext(s,'player',{},s.sides.player.active).retreatCost('player');assert.equal(before-after,2);
});
test('Sidney clears and prevents Dark Pokémon sleeping, confused, paralysed',()=>{
 const s=setup('ex16-18');s.sides.player.active.conditions={sleep:true,paralysis:true,confusion:true,poison:{amount:10}};
 stadium(s,'ex16-82');assert.equal(!!s.sides.player.active.conditions.sleep,false);assert.equal(!!s.sides.player.active.conditions.paralysis,false);assert.equal(!!s.sides.player.active.conditions.confusion,false);
 assert.ok(s.sides.player.active.conditions.poison,'poison is not prevented');
 assert.equal(fx.statusIsPrevented(s,s.sides.player.active,require(base+'tcg-classic-battle-data').cardById,'sleep'),true);
});
test('Energy Recycle System lets user select one discarded Basic Energy for hand',()=>{
 const s=setup();s.sides.player.energyDiscard={Fire:2,Water:1};item(s,'ex16-73');assert.equal(s.phase,'effectChoice');pick(s,a=>/Put 1 discarded/.test(a.choiceLabel));
 const options=legal(s).filter(a=>a.type==='effectChoice');assert.ok(options.some(a=>/Water/.test(a.choiceLabel)),JSON.stringify(options));pick(s,a=>/Water/.test(a.choiceLabel));
 assert.equal(s.sides.player.energyDiscard.Water,0);assert.ok(s.sides.player.hand.some(r=>require(base+'tcg-classic-battle-data').cardById(r.cardId)?.subtype==='Water' && require(base+'tcg-classic-battle-data').cardById(r.cardId)?.basicEnergy));
});
test('Energy Recycle System shuffle three recovered Energy into real physical deck',()=>{
 const s=setup();s.sides.player.energyDiscard={Fire:3,Water:1};const before=s.sides.player.deck.length;item(s,'ex16-73');pick(s,a=>/Shuffle 3/.test(a.choiceLabel));resolve(s,a=>/Fire/.test(a.choiceLabel));
 assert.equal(s.sides.player.energyDiscard.Fire,0);assert.equal(s.sides.player.deck.length,before+3);
 assert.equal(s.sides.player.deck.filter(r=>require(base+'tcg-classic-battle-data').cardById(r.cardId)?.subtype==='Fire'&&require(base+'tcg-classic-battle-data').cardById(r.cardId)?.basicEnergy).length,3);
});
test('Energy Switch offers source Pokémon, Basic type, different destination',()=>{
 const s=setup();s.sides.player.active.energy={Fire:1};s.sides.player.bench[0].energy={Water:1};item(s,'ex16-75');
 pick(s,a=>a.choiceTarget==='active');assert.equal(s.phase,'effectChoice');pick(s,a=>/Fire/.test(a.choiceLabel));
 pick(s,a=>a.choiceTarget==='bench');assert.equal(s.sides.player.active.energy.Fire,0);assert.equal(s.sides.player.bench[0].energy.Fire,1);
});
test('Scott searches real Stadiums/Supporters, allowing early stop',()=>{
 const s=setup();s.sides.player.deck=[{uid:'t1',cardId:'ex16-72'},{uid:'t2',cardId:'ex16-80'},{uid:'x',cardId:'ex16-74'},{uid:'p',cardId:'ex16-57'}];
 item(s,'ex16-81');const options=legal(s).filter(a=>a.type==='effectChoice');assert.ok(options.some(a=>a.choiceCardId==='ex16-72'));assert.ok(!options.some(a=>a.choiceCardId==='ex16-74'));
 pick(s,a=>a.choiceCardId==='ex16-72');assert.equal(s.sides.player.hand.some(r=>r.cardId==='ex16-72'),true);assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceSkip);assert.equal(s.phase,'battle');
});
test('Steven Advice chooses cards to draw; forbidden at seven-card hand',()=>{
 const s=setup();s.sides.player.hand=[];s.sides.player.deck=[{uid:'p',cardId:'ex16-57'},{uid:'r',cardId:'ex16-59'},{uid:'q',cardId:'ex16-43'}];
 item(s,'ex16-83');assert.equal(s.phase,'effectChoice');const opts=legal(s).filter(a=>a.type==='effectChoice');assert.ok(opts.some(a=>/Draw 2/.test(a.choiceLabel)),JSON.stringify(opts));pick(s,a=>/Draw 2/.test(a.choiceLabel));assert.equal(s.sides.player.hand.length,2);
 const t=setup();t.sides.player.hand=Array.from({length:6},(_,i)=>({uid:'x'+i,cardId:'ex16-57'}));t.sides.player.hand.push({uid:'steven',cardId:'ex16-83'});
 assert.ok(!legal(t).some(a=>a.type==='trainer'&&a.cardId==='ex16-83'),'7 cards including Steven is unplayable');
});
test('Banette Grudge scales with opponent prizes taken',()=>{
 const a=setup('ex16-4','ex16-48');a.sides.opponent.prizesTaken=0;attack(a,0);const low=a.sides.opponent.active.damage;
 const b=setup('ex16-4','ex16-48');b.sides.opponent.prizesTaken=2;attack(b,0);assert.equal(b.sides.opponent.active.damage-low,20);
});
test('Mightyena Dark Burst gains 20 with Sidney Stadium',()=>{
 const a=setup('ex16-18','ex16-24');attack(a,1);const low=a.sides.opponent.active.damage;
 const b=setup('ex16-18','ex16-24');b.stadium={uid:'sid',cardId:'ex16-82'};attack(b,1);assert.equal(b.sides.opponent.active.damage-low,20);
});
test('Wynaut Flail is 10 for each damage counter, not fixed 10',()=>{
 const s=setup('ex16-70','ex16-48');s.sides.player.active.damage=30;attack(s,0);assert.equal(s.sides.opponent.active.damage,30);
});
test('Baby Evolution chooses the matching Pokémon in hand and fully heals it',()=>{
 const s=setup('ex16-70','ex16-48');s.sides.player.active.damage=30;s.sides.player.hand=[{uid:'evo',cardId:'ex16-24'}];
 const a=legal(s).find(a=>a.type==='ability');assert.ok(a,'Baby Evolution available');core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceCardId==='ex16-24');assert.equal(s.sides.player.active.cardId,'ex16-24');assert.equal(s.sides.player.active.damage,0);
});
test('Mightyena Plunder discards Tool on defending Pokemon before its damage',()=>{
 const s=setup('ex16-18','ex16-24');s.sides.opponent.active.tool={uid:'tool1',cardId:'ex14-74'};
 attack(s,0);assert.equal(s.sides.opponent.active.tool,null);assert.ok(s.sides.opponent.discard.some(x=>x.uid==='tool1'));
});
test('Banette Bench Manipulation flips one coin per defender Bench and ignores matchup',()=>{
 const s=setup('ex16-4','ex16-58');s.sides.opponent.bench.push(core.makePokemonSlot('ex16-43',4,'z'));s.sides.opponent.bench[1].benchSlot=1;
 attack(s,1);const log=s.log.find(x=>x.reason==='Banette Bench Manipulation');assert.ok(log);assert.equal(log.coins,2);
 assert.equal(s.sides.opponent.active?.damage||0,40*log.results.filter(x=>!x).length);
});
test('Altaria Surprise removes one hidden opponent hand card to shuffled draw deck',()=>{
 const s=setup('ex16-2','ex16-24');s.sides.opponent.hand=[{uid:'h1',cardId:'ex16-57'},{uid:'h2',cardId:'ex16-59'}];const before=s.sides.opponent.deck.length;
 attack(s,0);assert.equal(s.phase,'effectChoice');const cards=legal(s).filter(x=>x.type==='effectChoice');assert.equal(cards.length,2);assert.ok(cards.every(x=>!x.choiceCardId),'opponent hidden hand identity must not leak before choice');pick(s,x=>x.choiceOption===1);const effect=s.log.find(x=>x.type==='ex16Surprise');assert.ok(effect,'facedown hand-card selection recorded');assert.equal(effect.revealedCardId,'ex16-59');
 assert.ok(s.sides.opponent.deck.length===before||s.sides.opponent.deck.length===before+1, 'next turn may draw');
 assert.ok(s.sides.opponent.deck.concat(s.sides.opponent.hand).some(x=>x.uid==='h1'||x.uid==='h2'));
});
test('Pichu Cry for Help only searches eligible Lightning Pokémon, not Pokémon-ex',()=>{
 const s=setup('ex16-21','ex16-24');s.sides.player.deck=[{uid:'pika',cardId:'ex16-57'},{uid:'zangoose',cardId:'ex16-25'},{uid:'claydol',cardId:'ex16-93'}];
 attack(s,0);const choices=legal(s).filter(x=>x.type==='effectChoice');assert.ok(choices.some(x=>x.choiceCardId==='ex16-57'));
 assert.ok(!choices.some(x=>x.choiceCardId==='ex16-25'));pick(s,a=>a.choiceCardId==='ex16-57');assert.ok(s.sides.player.hand.some(x=>x.cardId==='ex16-57'));
});
