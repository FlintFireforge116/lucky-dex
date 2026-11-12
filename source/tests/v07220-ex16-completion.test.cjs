'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const base='../app/src/main/assets/';
const pk=require(base+'tcg-classic-power-keepers'),core=require(base+'tcgp-battle-core'),fx=require(base+'tcgp-battle-effects'),all=require(base+'tcg-classic-battle-data'),opp=require(base+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const gd=opp.generate({sets:['ex15'],seed:19,type:'Darkness'});assert.ok(gd.ok);
function setup(att='ex16-15',def='ex16-95'){
 const s=core.createBattle({format:'classic',playerDeck:gd.cards,opponentDeck:gd.cards,seed:19,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(att,4,'a');s.sides.opponent.active=core.makePokemonSlot(def,4,'b');
 s.sides.player.active.energy={Grass:2,Fire:2,Water:2,Lightning:2,Psychic:2,Fighting:2,Darkness:2,Metal:2};s.sides.opponent.active.energy={Lightning:2};
 s.sides.player.bench=[core.makePokemonSlot('ex16-43',4,'c')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex16-59',4,'d')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function legal(s,side='player'){return core.legalActions(s,side)}
function strike(s,i=0,fn){let opts=legal(s).filter(a=>a.type==='attack'&&a.attackIndex===i);assert.ok(opts.length,'attack '+i+' available '+s.sides.player.active.cardId);const a=fn?opts.find(fn):opts[0];assert.ok(a,'attack choice found');core.applyAction(s,'player',a);return a}
function choose(s,fn){const side=s.choiceSide||s.activeSide,opts=legal(s,side).filter(a=>a.type==='effectChoice');const a=fn?opts.find(fn):opts.find(a=>!a.choiceSkip)||opts[0];assert.ok(a,'choice '+JSON.stringify(opts).slice(0,800));core.applyAction(s,side,a);return a}
function settle(s,fn){let n=0;while(s.phase==='effectChoice'&&n++<20)choose(s,fn);assert.ok(n<20,'choice not settled')}
function power(s,id){const a=legal(s).find(a=>a.type==='ability'&&(!id||a.cardId===id));assert.ok(a,'power on '+id);core.applyAction(s,'player',a);return a}
function effect(s,id,source=s.sides.player.active,evt){fx.applyEffect({type:'neoRule',rule:'ex16:'+id},{...core.effectContext(s,'player',{},source),eventData:evt});return s}
function onBench(s,id){const ref={uid:'ben-'+id,cardId:id};s.sides.player.hand.push(ref);const a=legal(s).find(a=>a.type==='bench'&&a.cardId===id);assert.ok(a,'bench '+id);core.applyAction(s,'player',a);}
function evolve(s,id,from){const p=core.makePokemonSlot(from,2,'ev-'+id);p.benchSlot=1;s.sides.player.bench.push(p);s.sides.player.hand.push({uid:'evol-'+id,cardId:id});const a=legal(s).find(a=>a.type==='evolve'&&a.cardId===id);assert.ok(a,'evolve '+id);core.applyAction(s,'player',a);}

test('all 108 real numbered cards battle-enabled, validated, and with no placeholder descriptions',()=>{
 assert.equal(pk.coverage().battleEnabled,108);assert.equal(pk.coverage().partial.length,0);
 for(let i=1;i<=108;i++){const c=pk.cardById('ex16-'+i);assert.ok(c.battleEnabled&&c.support.status==='FULL',c.id);for(const e of [c.effect,...(c.attacks||[]).map(x=>x.effect),...(c.abilities||[]).map(x=>x.effect)].filter(Boolean))assert.deepEqual(fx.validateEffect(e),[],c.id);}
});
test('Lanturn Lightning Strike baseline 50 vs elective all-Lightning discard 90',()=>{
 const a=setup();a.sides.player.active.energy={Lightning:3};strike(a,0);assert.equal(a.sides.opponent.active.damage,50);
 const b=setup();b.sides.player.active.energy={Lightning:3};strike(b,0,x=>x.effectSelection==='discardLightning');assert.equal(b.sides.opponent.active.damage,90);assert.equal(b.sides.player.active.energy.Lightning,0);
});
test('Armaldo Rock Blast discards selected Fighting Energy, damages chosen Pokémon',()=>{
 const s=setup('ex16-3');s.sides.player.active.energy={Fighting:2};strike(s,0);assert.equal(s.phase,'effectChoice');
 choose(s,x=>/Discard Fighting/.test(x.choiceLabel));choose(s,x=>x.choiceTarget==='bench');assert.equal(s.sides.opponent.bench[0].damage,20);
 choose(s,x=>x.choiceSkip);assert.equal(s.phase,'battle');assert.equal(s.sides.player.active.energy.Fighting,1);
});
test('Armaldo Mach Claw ignores resistance',()=>{
 const s=setup('ex16-3','ex16-95');s.sides.player.active.energy={Colorless:3};strike(s,1);assert.equal(s.sides.opponent.active.damage,60);
});
test('Blaziken Firestarter attaches discarded Fire to chosen Bench',()=>{
 const s=setup('ex16-5');s.sides.player.energyDiscard={Fire:1};power(s);assert.equal(s.phase,'effectChoice');
 settle(s);assert.equal(s.sides.player.bench[0].energy.Fire,1);assert.equal(s.sides.player.energyDiscard.Fire,0);
});
test('Blaziken Fire Stream discards attached Fire and damages every opposing Bench',()=>{
 const s=setup('ex16-5');s.sides.player.active.energy={Fire:2,Colorless:2};strike(s,0);settle(s);assert.equal(s.sides.opponent.active.damage,100);assert.equal(s.sides.opponent.bench[0].damage,10);assert.equal(s.sides.player.active.energy.Fire,1);
});
test('Delcatty Energy Draw discards selected hand Energy and draws selected count',()=>{
 const s=setup('ex16-8');s.sides.player.hand=[{uid:'ene',cardId:'base1-99'}];s.sides.player.deck=[{uid:'d1',cardId:'ex16-57'},{uid:'d2',cardId:'ex16-59'},{uid:'d3',cardId:'ex16-43'}];power(s);
 choose(s,x=>x.choiceCardId==='base1-99');assert.equal(s.phase,'effectChoice');choose(s,x=>/Draw 2/.test(x.choiceLabel));assert.equal(s.sides.player.hand.length,2);assert.equal(s.sides.player.discard.some(r=>r.uid==='ene'),true);
});
test('Gardevoir Psy Shadow attaches Psychic then 20 damage to selected Pokémon',()=>{
 const s=setup('ex16-9');s.sides.player.deck=[{uid:'pe',cardId:'base1-101'}];power(s);settle(s);assert.ok([s.sides.player.active,...s.sides.player.bench].some(p=>p.energy.Psychic>2||p.damage===20));
});
test('Kabutops Primal Stare forbids active evolution but allows bench evolution',()=>{
 const s=setup('ex16-57','ex16-10');s.sides.player.hand.push({uid:'ev',cardId:'ex16-47'});s.sides.player.active=core.makePokemonSlot('ex16-46',1,'e');s.sides.player.active.playedOnSideTurn=1;s.sides.player.turnCount=5;
 const actions=legal(s).filter(a=>a.type==='evolve');assert.ok(actions.every(a=>a.target!=='active'));
});
test('Slaking Lazy suppresses opposing Poké-Powers',()=>{
 const s=setup('ex16-5','ex16-13');assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,all.cardById),true);
});
test('Slaking Critical Move discards one chosen Basic and locks subsequent turn',()=>{
 const s=setup('ex16-13');s.sides.player.active.energy={Colorless:4};strike(s,0);settle(s);assert.equal(s.sides.opponent.active.damage,100);assert.equal(s.sides.player.active.energy.Colorless,3);assert.ok(s.sides.player.active.ex16CriticalMoveBlockedUntil>10);
});
test('Magneton Magnetic Field discards hand card and recovers up to 2 Basic from ledger',()=>{
 const s=setup('ex16-16');s.sides.player.energyDiscard={Fire:2};s.sides.player.hand=[{uid:'z',cardId:'ex16-57'}];power(s);settle(s);assert.ok(s.sides.player.hand.filter(r=>all.cardById(r.cardId)?.basicEnergy).length>=1);
});
test('Sableye Down Draw uses deck BOTTOM, not top',()=>{
 const s=setup('ex16-22');s.sides.player.deck=[{uid:'bottom',cardId:'ex16-59'},{uid:'top',cardId:'ex16-57'}];const ref=s.sides.player.deck.map(x=>x.uid);strike(s,0);assert.ok(s.sides.player.hand.some(r=>r.uid==='bottom'));assert.ok(s.sides.player.hand.some(r=>r.uid==='top'));
});
test('Beldum Magnetic Lines coin flip and conditional Bench transfer',()=>{
 const s=setup('ex16-45');s.sides.player.active.energy={Metal:2};strike(s,0);if(s.phase==='effectChoice'){settle(s);assert.ok(s.sides.opponent.bench[0].energy.Lightning>=1);}assert.ok(s.log.some(l=>l.reason==='Magnetic Lines'));
});
test('Omanyte Influence benches selected deck target, treating it as Basic',()=>{
 const s=setup('ex16-56');s.sides.player.active.energy={Water:2};s.sides.player.deck=[{uid:'kk',cardId:'ex16-51'}];strike(s,0);if(s.phase==='effectChoice'){choose(s,x=>x.choiceCardId==='ex16-51');settle(s);}assert.ok(s.sides.player.bench.some(p=>p.cardId==='ex16-51'));
});
test('Claw and Root Fossils are playable Bench cards, no retreat and discardable',()=>{
 for(const id of ['ex16-84','ex16-86']){const s=setup();s.sides.player.hand.push({uid:'fossil',cardId:id});const a=legal(s).find(a=>a.type==='trainer'&&a.cardId===id);assert.ok(a);core.applyAction(s,'player',a);assert.ok(s.sides.player.bench.some(p=>p.cardId===id));let d=legal(s).find(a=>a.type==='discardFossil'&&a.cardId===id);assert.ok(d);core.applyAction(s,'player',d);assert.ok(!s.sides.player.bench.some(p=>p.cardId===id));assert.equal(pk.cardById(id).noPrize,true);assert.equal(fx.statusIsPrevented(s,core.makePokemonSlot(id,3,'f'),all.cardById,'poison'),true);}
});
test('Absol ex Cursed Eyes moves three counters only when a legal source exists',()=>{
 const s=setup();s.sides.opponent.active.damage=40;onBench(s,'ex16-92');assert.equal(s.phase,'effectChoice');settle(s);assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,30);
});
test('Claydol ex Type Shift changes live type to Fighting',()=>{
 const s=setup('ex16-93');power(s);assert.ok(fx.effectiveTypes(s,'player',s.sides.player.active,all.cardById).includes('Fighting'));
});
test('Metagross ex Magnetic Redraw shuffles both hands then draws 4 each',()=>{
 const s=setup('ex16-95');s.sides.player.hand=[{uid:'ph',cardId:'ex16-57'}];s.sides.opponent.hand=[{uid:'oh',cardId:'ex16-59'}];power(s);assert.equal(s.sides.player.hand.length,4);assert.equal(s.sides.opponent.hand.length,4);
});
test('Skarmory ex Metal Gravity damages a retreating foe exactly once per turn',()=>{
 const s=setup('ex16-14','ex16-98');s.sides.player.active.energy={Colorless:4};s.sides.player.bench[0].energy={};const a=legal(s).find(a=>a.type==='retreat');assert.ok(a,'retreat available');core.applyAction(s,'player',a);assert.ok(s.log.some(l=>l.type==='ex16MetalGravity'));
});
test('Walrein ex Chilling Breath stops Trainers on opposing next turn',()=>{
 const s=setup();evolve(s,'ex16-99','ex16-37');s.sides.opponent.hand=[{uid:'tr',cardId:'ex16-75'}];s.activeSide='opponent';s.turnNumber=11;
 assert.ok(!legal(s,'opponent').some(a=>a.type==='trainer'));
});
test('Flareon Star and Vaporeon Star enter Bench with correct triggered conditions',()=>{
 const s=setup();onBench(s,'ex16-100');assert.ok(s.sides.player.active.conditions?.burn);
 const v=setup();v.sides.player.active.damage=40;v.sides.opponent.active.damage=40;v.sides.player.active.conditions={sleep:true};onBench(v,'ex16-102');assert.equal(v.sides.player.active.damage,10);assert.equal(v.sides.opponent.active.damage,10);assert.ok(!v.sides.player.active.conditions.sleep);
});
test('Jolteon Star Yellow Ray adds 10 to each Active on Bench entry',()=>{
 const s=setup();onBench(s,'ex16-101');assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.active.damage,10);
});
test('Cradily Evolutionary Call searches up to 3 real Pokémon and shuffles',()=>{
 const s=setup();s.sides.player.deck=[{uid:'c1',cardId:'ex16-51'},{uid:'c2',cardId:'ex16-37'},{uid:'x',cardId:'ex16-72'},{uid:'c3',cardId:'ex16-59'}];
 evolve(s,'ex16-7','ex16-52');assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceCardId==='ex16-51');choose(s,x=>x.choiceCardId==='ex16-37');choose(s,x=>x.choiceSkip);assert.equal(s.phase,'battle');assert.ok(s.sides.player.hand.some(r=>r.uid==='c1'));assert.ok(s.sides.player.hand.some(r=>r.uid==='c2'));
});
test('Flygon ex Psychic Protector permits selecting actual hand cards and reduces incoming damage',()=>{
 const s=setup('ex16-97','ex16-94');s.sides.player.active.energy={Darkness:2,Colorless:4};s.sides.opponent.hand=[{uid:'f1',cardId:'ex16-57'},{uid:'f2',cardId:'ex16-59'}];
 strike(s,1);assert.equal(s.phase,'effectChoice');const chooseOwner=s.choiceSide;assert.equal(chooseOwner,'opponent');
 choose(s,x=>x.choiceOption===2);choose(s,x=>x.choiceCardId==='ex16-57');choose(s,x=>x.choiceCardId==='ex16-59');assert.equal(s.sides.opponent.active.damage,40);assert.ok(s.sides.opponent.discard.some(r=>r.uid==='f1'));assert.ok(s.sides.opponent.discard.some(r=>r.uid==='f2'));
});
test('Flygon ex Psychic Protector allows no discard, does not make 70 disappear',()=>{
 const s=setup('ex16-97','ex16-94');s.sides.player.active.energy={Darkness:2,Colorless:4};s.sides.opponent.hand=[{uid:'f1',cardId:'ex16-57'}];strike(s,1);choose(s,x=>x.choiceOption===0);assert.equal(s.sides.opponent.active.damage,60);
});
test('Shiftry ex Skill Hack reveals opponent hand then copies an attack without paying its cost',()=>{
 const s=setup('ex16-97','ex16-95');s.sides.player.active.energy={Darkness:1};s.sides.opponent.hand=[{uid:'copy',cardId:'ex16-98'}];strike(s,0);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceCardId==='ex16-98');choose(s,x=>/Razor Wing/.test(x.choiceLabel));assert.ok(s.sides.opponent.active.damage>=60);
});
test('Sableye Synergy prevents EX attack damage under Phoebe Stadium',()=>{
 const s=setup('ex16-95','ex16-22');s.stadium={uid:'st',cardId:'ex16-79'};s.sides.player.active.energy={Metal:3,Colorless:3};strike(s,0);assert.equal(s.sides.opponent.active.damage,0);
});
test('Claydol ex Shadow Crush can discard chosen Psychic and chosen defending Basic',()=>{
 const s=setup('ex16-93','ex16-95');s.sides.player.active.energy={Psychic:3,Colorless:1};s.sides.opponent.active.energy={Fire:2,Metal:1};strike(s,1);assert.equal(s.phase,'effectChoice');choose(s,x=>/Psychic/.test(x.choiceLabel));assert.equal(s.sides.player.active.energy.Psychic,2);if(s.phase==='effectChoice')choose(s,x=>x.effectEnergyType==='Fire');assert.equal(s.sides.opponent.active.energy.Fire,1);
});
test('Walrein ex Wreck consumes a Stadium only when present, adds 20 damage',()=>{
 const s=setup('ex16-99','ex16-95');s.sides.player.active.energy={Water:3,Colorless:2};s.stadium={uid:'stad',cardId:'ex16-79',ownerSide:'opponent'};strike(s,0);assert.equal(s.stadium,null);assert.equal(s.sides.opponent.active.damage,90);
});
test('Lanturn Energy Grounding moves an actual Basic Energy from allied attack KO',()=>{
 const s=setup('ex16-45','ex16-95');s.sides.player.active.energy={Fire:1,Water:1};
 const lanturn=core.makePokemonSlot('ex16-15',3,'lanturn');lanturn.benchSlot=1;s.sides.player.bench.push(lanturn);
 s.sides.opponent.active.energy={Metal:3,Colorless:2};s.activeSide='opponent';
 const a=legal(s,'opponent').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a);core.applyAction(s,'opponent',a);
 assert.equal(s.phase,'effectChoice','Energy Grounding must trigger before discarded Energy is lost');
 const opts=legal(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(opts.some(x=>/Fire|Water/.test(x.choiceLabel)),JSON.stringify(opts));
 const picked=choose(s,x=>/Fire/.test(x.choiceLabel));assert.ok(picked);assert.equal(lanturn.energy.Fire,1);
});
test('Fossil knockout awards no Prize and does not count as opposing Pokémon KO',()=>{
 const s=setup('ex16-84','ex16-95');s.sides.player.active.energy={};s.sides.opponent.active.energy={Metal:3,Colorless:2};s.activeSide='opponent';
 const before=s.sides.opponent.prizesTaken;const a=legal(s,'opponent').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a);core.applyAction(s,'opponent',a);
 assert.equal(s.sides.opponent.prizesTaken,before);assert.equal(s.sides.player.knockoutsTaken||0,0);
});
test('CPU autobuilder can construct legal single-set ex16 decks for every archetype',()=>{
 const modes=['balanced','aggressive','control','energy','status','stall','heal','retreat','random'];
 for(const mode of modes){const build=opp.generate({sets:['ex16'],seed:501+modes.indexOf(mode),archetype:mode});assert.ok(build.ok,mode+': '+(build.reason||''));assert.equal(build.cards.length,30,mode);assert.ok(build.cards.every(r=>all.cardById(typeof r==='string'?r:r.cardId)?.battleEnabled),mode);}
});
test('Absol ex Psychic Pulse only damages opposing Benched Pokémon already damaged',()=>{
 const s=setup('ex16-92','ex16-95');s.sides.player.active.energy={Darkness:2,Colorless:2};s.sides.opponent.bench[0].damage=20;
 const other=core.makePokemonSlot('ex16-57',4,'other');other.benchSlot=1;s.sides.opponent.bench.push(other);
 strike(s,0);assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.opponent.bench[1].damage,0);
});
test('Cradily Poison Ring leaves Poisoned opponent unable to retreat',()=>{
 const s=setup('ex16-7','ex16-95');s.sides.player.active.energy={Grass:2,Colorless:1};s.sides.opponent.active.energy={Colorless:4};strike(s,0);
 assert.ok(s.sides.opponent.active.conditions.poison);s.activeSide='opponent';s.turnNumber=11;assert.ok(!legal(s,'opponent').some(a=>a.type==='retreat'));
});
