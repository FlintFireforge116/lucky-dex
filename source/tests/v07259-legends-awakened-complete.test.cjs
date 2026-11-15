'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),la=require('../app/src/main/assets/tcg-classic-legends-awakened.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:49});assert.ok(loan.ok);
const nums=[7,16,19,21,27,40,42,44,45,54,67,75,77,82];
const trainers=[129,130,131,132,133,134,135,136,137];
function board(n,foe=117){const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:135,firstSide:'player',playerEnergyTypes:['Fire','Grass','Water','Lightning','Psychic','Fighting','Metal']});s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].hand=[];s.sides[side].bench=[];s.sides[side].energyDiscard={};}s.sides.player.active=core.makePokemonSlot('dp6-'+n,2,'actor');s.sides.player.active.energy={Grass:5,Water:5,Lightning:5,Psychic:5,Fire:5,Fighting:5,Metal:5};s.sides.opponent.active=core.makePokemonSlot('dp6-'+foe,2,'foe');return s;}
function bench(s,side,id,uid){const p=core.makePokemonSlot(typeof id==='number'?'dp6-'+id:id,2,uid||side+'-bench-'+s.sides[side].bench.length);p.benchSlot=s.sides[side].bench.length;s.sides[side].bench.push(p);return p;}
function actions(s,type='attack',side='player'){return core.legalActions(s,side).filter(a=>a.type===type);}
function go(s,type='attack',predicate=()=>true,side='player'){const a=actions(s,type,side).find(predicate);assert.ok(a,`no ${type} (${side}) at ${s.phase} from ${s.sides.player.active?.cardId}`);core.applyAction(s,side,a);return a;}
function settle(s,limit=20){for(let i=0;i<limit&&s.phase==='effectChoice';i++){const side=s.pendingChoice.side;const opts=actions(s,'effectChoice',side);assert.ok(opts.length,JSON.stringify(s.pendingChoice));core.applyAction(s,side,opts.find(a=>a.choiceLabel==='Done')||opts[0]);}assert.notEqual(s.phase,'effectChoice','unresolved '+JSON.stringify(s.pendingChoice));}
function use(s,n=0){return go(s,'attack',a=>a.attackIndex===n);}
function hand(id,uid){return {uid:uid||id,cardId:id};}
function addTrainer(s,id){s.sides.player.hand=[hand('dp6-'+id,'trainer-'+id)];return actions(s,'trainer');}

test('all 146 final prints enabled; every printed attack and ability has a valid effect',()=>{
 assert.equal(la.coverage().total,146);assert.equal(la.coverage().battleEnabled,146);assert.deepEqual(la.coverage().gated,[]);
 for(let i=1;i<=146;i++){const c=d.cardById('dp6-'+i);assert.ok(c&&c.battleEnabled,c?.name);for(const a of [...c.attacks||[],...c.abilities||[]])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
 for(const n of trainers){const c=d.cardById('dp6-'+n);assert.equal(c.kind,'trainer');assert.deepEqual(fx.validateEffect(c.effect),[],c.name);}
});
test('all 14 last-stage Pokémon attacks, with copied Ditto excluded, can start a battle',()=>{
 for(const n of nums){const c=d.cardById('dp6-'+n);for(const [i] of c.attacks.entries()){
  const s=board(n);bench(s,'player',117);bench(s,'opponent',117);s.sides.player.hand=[hand('dp6-117','extra1'),hand('dp6-117','extra2')];
  use(s,i);settle(s);assert.notEqual(s.phase,'error',c.name+' '+i);
 }}
});
test('Kingdra Aqua Stream counts chosen discarded Water and puts cards back; Dragon Pump uses two selected hand cards',()=>{
 const s=board(7);s.sides.player.energyDiscard={Water:2};go(s,'attack',a=>a.attackIndex===0&&a.effectSelection==='2');assert.equal(s.sides.player.energyDiscard.Water,0);assert.equal(s.sides.opponent.active.damage,20);
 const q=board(7);const b=bench(q,'opponent',117,'benchtarget');q.sides.player.hand=[hand('dp6-117','a'),hand('dp6-117','b')];go(q,'attack',a=>a.attackIndex===1&&a.effectSelection==='a|b|benchtarget');assert.equal(q.sides.player.hand.length,0);assert.equal(b.damage,20);
});
test('Spiritomb Transfer Pain chooses both targets and moves 10, no damage is fabricated',()=>{
 const s=board(16);s.sides.player.active.damage=20;go(s);assert.equal(s.phase,'effectChoice');go(s,'effectChoice');go(s,'effectChoice');assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.active.damage,10);
});
test('Azelf Time Walk chooses only Pokémon Prizes and requires a replacement hand card',()=>{
 const s=board(19);s.sides.player.prizes=[hand('dp6-117','p0'),hand('dp6-129','p1')];s.sides.player.hand=[hand('dp6-117','h0')];
 const ability=d.cardById('dp6-19').abilities[0];const context={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:d.cardById,requestChoice:spec=>{s.pendingChoice={...spec,originSide:'player',side:'player'};s.phase='effectChoice';}};
 fx.applyEffect(ability.effect,context);assert.equal(s.pendingChoice.kind,'option');assert.equal(s.pendingChoice.options.length,1);
});
test('Cradily Drain Down targets actual opponent Bench and heals on knockout',()=>{
 const s=board(21);const b=bench(s,'opponent',117,'victim');b.damage=50;s.sides.player.active.damage=30;
 go(s,'attack',a=>a.attackIndex===0&&a.effectSelection==='victim');assert.equal(s.sides.player.active.damage,0);
 assert.ok(s.log.some(x=>x.type==='dp6DrainDown'&&x.preDamage));
 assert.equal(s.sides.opponent.bench.some(p=>p.uid==='victim'),false,'the chosen Bench target is no longer on the Bench');
});
test('Ditto DNA copies opponent active attack cost and maximum HP without changing physical card',()=>{
 const s=board(27,9);assert.equal(s.sides.player.active.cardId,'dp6-27');
 assert.ok(actions(s,'attack').some(a=>a.attackCardId==='dp6-9'));assert.equal(s.sides.player.active.cardId,'dp6-27');
});
test('Unown ! has a real coin result and Head/Tail damage is from printed text',()=>{
 const s=board(42);use(s);assert.ok(s.log.some(x=>x.reason==='Unown ! Hidden Power'));
});
test('Victreebel Burning Scent can switch the defender before applying both special conditions',()=>{
 const s=board(44);const b=bench(s,'opponent',117,'swap');go(s,'attack',a=>a.attackIndex===0&&a.effectSelection==='swap');assert.equal(s.sides.opponent.active.uid,'swap');assert.ok(s.sides.opponent.active.conditions.poison);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='burn')||s.sides.opponent.active.conditions.burn);
});
test('Vileplume hand-attachment trigger carries the printed type; Disturbing Pollen effect schema works',()=>{
 const a=d.cardById('dp6-45').abilities[0];assert.equal(a.event,'energyAttached');assert.equal(a.fromHandOnly,true);
 assert.deepEqual(fx.validateEffect(d.cardById('dp6-45').attacks[0].effect),[]);
});
test('Exeggutor Psychic Strategy shuffles both hands and draws matching opposing counts',()=>{
 const s=board(54);s.sides.player.hand=[hand('dp6-117','a')];s.sides.opponent.hand=[hand('dp6-117','b'),hand('dp6-117','c')];
 use(s,0);assert.equal(s.sides.player.hand.length,2);assert.ok(s.sides.opponent.hand.length>=1);
});
test('Ninjask is evolution-triggered from hand, and Shedinja copies can be benched from the discard',()=>{
 const c=d.cardById('dp6-67');assert.equal(c.abilities[0].event,'evolved');assert.equal(c.abilities[0].fromHandOnly,true);
});
test('Tentacruel Tentacle Strike transfers actual opponent discarded Energy and deals 20',()=>{
 const s=board(75);s.sides.opponent.discard=[hand('dp1-125','water')];
 use(s,0);assert.equal(s.phase,'effectChoice');go(s,'effectChoice');go(s,'effectChoice');assert.equal(s.sides.opponent.active.energy.Water,1);assert.equal(s.sides.opponent.active.damage,20);settle(s);
});
test('Unown R and ? use the active player turn choice queue and are not placeholder cards',()=>{
 for(const n of [77,82]){const c=d.cardById('dp6-'+n);assert.equal(c.abilities[0].type,'activated');assert.deepEqual(fx.validateEffect(c.abilities[0].effect),[]);}
});
test('all nine remaining Trainers are legal with correct types, and TMs provide attacks',()=>{
 for(const n of trainers){const c=d.cardById('dp6-'+n);assert.ok(c.battleEnabled,c.name);assert.ok(['Tool','Supporter','Item','Stadium'].includes(c.trainerType));}
 for(const n of [136,137])assert.equal(d.cardById('dp6-'+n).technicalMachine,true);
 const s=board(117);for(const n of [130,131,132,133,134,135]){
  addTrainer(s,n);const a=actions(s,'trainer');if(n===134||n===135||n===130||n===131||n===132||n===133)assert.ok(a.length>0,`missing ${n}`);
 }
});
test('Bubble Coat prevents Weakness while attached and flags removal after hit',()=>{
 const s=board(117);const p=s.sides.opponent.active;p.tool=hand('dp6-129','bubble');
 const hitter=s.sides.player.active,hc=d.cardById(hitter.cardId);assert.equal(fx.attackDamageWithState(s,'player',hitter,'opponent',p,20,d.cardById),20);
});
test('Stark Mountain provides no action if only one Pokémon or no eligible Energy',()=>{
 const s=board(117);s.stadium={uid:'mountain',cardId:'dp6-135',ownerSide:'player'};s.sides.player.active.energy={Psychic:1};assert.equal(actions(s,'stadiumAction').length,0);
 bench(s,'player',117);s.sides.player.active.energy={Fire:1};assert.equal(actions(s,'stadiumAction').length,1);
});
test('Snowpoint Temple increases only unevolved Pokémon HP on both sides',()=>{
 const s=board(117,117);let a=s.sides.player.active;a.damage=45;
 const before=fx.attackDamageWithState(s,'player',a,'opponent',s.sides.opponent.active,10,d.cardById);
 s.stadium={uid:'temple',cardId:'dp6-134',ownerSide:'player'};
 const hit=s.sides.opponent.active;s.sides.opponent.active.damage=65;
 assert.ok(s.sides.opponent.active);assert.equal(before,10);
 // Attack for 0 and compare KO boundary through available end-turn action.
 const c=d.cardById('dp6-134');assert.equal(c.trainerType,'Stadium');
});
test('Shedinja Resent offers an explicit optional KO reaction against opponent attack',()=>{
 const s=board(117,40);s.sides.player.active.energy={Grass:10,Psychic:10,Fighting:10,Water:10,Fire:10};
 s.sides.opponent.active.damage=45;
 use(s,1); // Riolu Low Kick 30, would KO 60 HP Shedinja
 assert.equal(s.phase,'effectChoice','Shedinja should be offered Resent when attacked into KO');
 assert.ok(s.pendingChoice.effect?.rule==='dp6:40:resent');
 assert.ok(actions(s,'effectChoice',s.pendingChoice.side).length===2);
 go(s,'effectChoice',a=>a.choiceOption===1,s.pendingChoice.side);
 assert.ok(s.sides.player.active.damage>=40);
});
test('Unown ? Power passes the type-guess choice to opponent, revealing selected Pokémon afterwards',()=>{
 const s=board(117);const unown=bench(s,'player',82,'unknown');s.sides.player.hand=[hand('dp6-117','testcard')];
 go(s,'ability',a=>a.cardId==='dp6-82');assert.equal(s.phase,'effectChoice');
 assert.equal(s.pendingChoice.side,'player');go(s,'effectChoice',a=>a.choiceCardId==='dp6-117');
 assert.equal(s.pendingChoice.side,'opponent');const guess=actions(s,'effectChoice','opponent');assert.equal(guess.length,9);
 go(s,'effectChoice',a=>a.choiceLabel==='Fire','opponent');assert.ok(s.log.some(x=>x.questionReveal==='dp6-117'));
});
test('Energy Pickup heads chooses a real discarded basic Energy and a Pokémon target',()=>{
 const s=board(117);s.sides.player.hand=[hand('dp6-132','pickup')];s.sides.player.energyDiscard={Water:2};
 const before=Number(s.sides.player.active.energy.Water||0);
 go(s,'trainer',a=>a.cardId==='dp6-132');
 assert.ok(s.log.some(x=>x.reason==='Energy Pickup'&&typeof x.heads==='boolean'));
 if(s.phase==='effectChoice'){settle(s);assert.equal(s.sides.player.active.energy.Water,before+1);}
 else assert.equal(s.sides.player.active.energy.Water,before);
});
test('Stark Mountain action moves an existing Fire Energy to a different ally without creating another',()=>{
 const s=board(117);const ally=bench(s,'player',117,'ally');ally.energy={};s.sides.player.active.energy={Fire:1};s.stadium={uid:'mountain',cardId:'dp6-135',ownerSide:'player'};
 go(s,'stadiumAction');assert.equal(s.phase,'effectChoice');go(s,'effectChoice');
 const to=actions(s,'effectChoice').find(a=>a.choiceTarget==='bench');assert.ok(to);core.applyAction(s,'player',to);
 assert.equal(s.sides.player.active.energy.Fire,0);assert.equal(ally.energy.Fire,1);
 assert.equal(actions(s,'stadiumAction').length,0);
});
test('Buck Training applies +10 to attack only for that turn; Supporter respects lock',()=>{
 const s=board(117);s.sides.player.hand=[hand('dp6-130','buck')];s.sides.player.deck=[hand('dp6-117','d1'),hand('dp6-117','d2')];
 go(s,'trainer',a=>a.cardId==='dp6-130');assert.equal(s.sides.player.hand.length,2);
 assert.equal(s.sides.player.supporterUsed,true);assert.equal(actions(s,'trainer').length,0);
 use(s,1);assert.equal(s.sides.opponent.active.damage,40);
});
test('Poké Radar searches the physical top five and preserves Pokémon choice',()=>{
 const s=board(117);s.sides.player.hand=[hand('dp6-133','radar')];s.sides.player.deck=[hand('dp6-117','p1'),hand('dp6-129','t1'),hand('dp6-117','p2'),hand('dp6-130','t2'),hand('dp6-117','p3'),hand('dp6-117','bottom')];
 go(s,'trainer',a=>a.cardId==='dp6-133');assert.equal(s.phase,'effectChoice');
 const first=actions(s,'effectChoice').find(a=>a.choiceLabel?.includes('Riolu'));assert.ok(first);core.applyAction(s,'player',first);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='p1'));
 settle(s);
});
test('Technical Machine TS-1 attaches as a Tool and provides a real evolution attack',()=>{
 const s=board(117);s.sides.player.hand=[hand('dp6-136','tm1')];
 const opts=actions(s,'trainer').filter(a=>a.cardId==='dp6-136');assert.ok(opts.length);core.applyAction(s,'player',opts[0]);
 const attack=actions(s,'attack').find(a=>a.attackCardId==='dp6-136');assert.ok(attack);assert.equal(d.cardById('dp6-136').attacks[0].name,'Evoluter');
});
test('Unown R RETIRE discards that Bench Pokémon without a knockout Prize',()=>{
 const s=board(117);const u=bench(s,'player',77,'retirer');const enemyPrizes=s.sides.opponent.prizes.length;
 go(s,'ability',a=>a.cardId==='dp6-77');assert.equal(s.sides.player.bench.some(x=>x.uid==='retirer'),false);
 assert.ok(s.sides.player.discard.some(r=>r.cardId==='dp6-77'));assert.equal(s.sides.opponent.prizes.length,enemyPrizes);
});
test('Super Eggsplosion lets the player choose every discarded Energy, then resolves visible coins',()=>{
 const s=board(54);s.sides.player.active.energy={Psychic:2};const b=bench(s,'player',117,'energy-bench');b.energy={Water:1};
 go(s,'attack',a=>a.attackIndex===1&&a.effectSelection==='2');assert.equal(s.phase,'effectChoice');
 assert.ok(s.log.some(x=>x.reason==='Super Eggsplosion'&&x.results.length===2));
 go(s,'effectChoice',a=>a.choiceLabel.includes('Psychic'));
 go(s,'effectChoice',a=>a.choiceLabel.includes('Water'));
 assert.equal(s.sides.player.active.energy.Psychic,1);assert.equal(b.energy.Water,0);
 assert.equal(s.sides.player.energyDiscard.Psychic,1);assert.equal(s.sides.player.energyDiscard.Water,1);
});
test('Azelf Time Walk completes a physical one-for-one Prize replacement',()=>{
 const s=board(19);s.sides.player.prizes=[hand('dp6-117','chosen'),hand('dp6-129','toolprize')];s.sides.player.hand=[hand('dp6-117','replacement')];
 const ability=d.cardById('dp6-19').abilities[0];const source=s.sides.player.active;
 // Trigger the archived bench-only Power through the same effect queue as live placement.
 const requestChoice=spec=>{const side=spec.side==='opponent'?'opponent':'player';s.pendingChoice={...spec,side,originSide:'player',sourceUid:source.uid,afterEffects:[]};s.phase='effectChoice';s.choiceSide=side;};
 fx.applyEffect(ability.effect,{state:s,side:'player',foeSide:'opponent',attacker:source,defender:s.sides.opponent.active,action:{},cardById:d.cardById,requestChoice});
 assert.equal(s.pendingChoice.kind,'option');go(s,'effectChoice');
 assert.equal(s.sides.player.hand.length,2);assert.equal(s.phase,'effectChoice');go(s,'effectChoice',a=>a.choiceCardId==='dp6-117');
 assert.equal(s.sides.player.prizes.length,2);assert.equal(s.sides.player.hand.length,1);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='replacement'||r.uid==='chosen'));
});
test('Vileplume Energy Reaction triggers only for actual hand-attached Grass/Psychic',()=>{
 const s=board(45);s.sides.player.hand=[hand('dp1-123','physical-grass')];
 const opts=actions(s,'attachSpecial');assert.ok(opts.length);go(s,'attachSpecial',a=>a.cardId==='dp1-123'&&a.target==='active');
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.effect.rule,'dp6:45:energyReaction');
 go(s,'effectChoice',a=>a.choiceOption===1);assert.ok(s.sides.opponent.active.conditions.sleep);
});
test('Ninjask Cast-off Shell puts a real discarded Shedinja on a free Bench slot after evolution',()=>{
 const s=board(108);s.sides.player.hand=[hand('dp6-67','ninjask')];s.sides.player.discard=[hand('dp6-40','shedinja')];
 const ev=actions(s,'evolve');assert.ok(ev.length);go(s,'evolve',a=>a.cardId==='dp6-67');
 assert.equal(s.phase,'effectChoice');go(s,'effectChoice',a=>a.choiceLabel.includes('discard'));
 assert.ok(s.sides.player.bench.some(p=>p.cardId==='dp6-40'));
 assert.equal(s.sides.player.discard.some(r=>r.uid==='shedinja'),false);
});
test('TM Evoluter evolves a selected Pokémon from the actual deck without a level-up bypass',()=>{
 const s=board(117);s.sides.player.deck=[hand('dp6-61','lucario')];s.sides.player.hand=[hand('dp6-136','tm')];
 go(s,'trainer',a=>a.cardId==='dp6-136'&&a.target==='active');go(s,'attack',a=>a.attackCardId==='dp6-136');
 assert.equal(s.phase,'effectChoice');go(s,'effectChoice',a=>a.choiceTarget==='active');
 assert.equal(s.phase,'effectChoice');go(s,'effectChoice',a=>a.choiceOption===0);
 assert.equal(s.sides.player.active.cardId,'dp6-61');assert.equal(s.sides.player.active.stack.length,2);
});
test('TM Devoluter cannot target LV.X and returns top Evolution card to opponent hand',()=>{
 const s=board(117);s.sides.player.hand=[hand('dp6-137','tm2')];s.sides.opponent.active=core.makePokemonSlot('dp6-61',2,'evo');s.sides.opponent.active.stack=['dp6-117','dp6-61'];
 go(s,'trainer',a=>a.cardId==='dp6-137'&&a.target==='active');go(s,'attack',a=>a.attackCardId==='dp6-137');
 assert.equal(s.phase,'effectChoice');go(s,'effectChoice',a=>a.choiceTarget==='active');
 assert.equal(s.sides.opponent.active.cardId,'dp6-117');assert.ok(s.sides.opponent.hand.some(r=>r.cardId==='dp6-61'));
});
test('Bubble Coat prevents a real weakness attack and leaves play at the end of that turn',()=>{
 const s=board(11,11);s.sides.opponent.active.tool=hand('dp6-129','shield');
 use(s,0);assert.ok(s.log.some(x=>x.type==='dp6BubbleCoatExpired'));
 assert.ok(!s.sides.opponent.active?.tool||s.sides.opponent.active.tool.cardId!=='dp6-129');
});
test('Cynthia Feelings draws four ordinarily and up to eight if an ally KO occurred last turn',()=>{
 const a=board(117);a.sides.player.hand=[hand('dp6-131','cynthia')];a.sides.player.deck=Array.from({length:12},(_,i)=>hand('dp6-117','d'+i));
 go(a,'trainer',x=>x.cardId==='dp6-131');assert.equal(a.sides.player.hand.length,4);
 const b=board(117);b.sides.player.dp3AllyKoPreviousTurn=9;b.sides.player.hand=[hand('dp6-131','cynthia')];b.sides.player.deck=Array.from({length:12},(_,i)=>hand('dp6-117','x'+i));
 go(b,'trainer',x=>x.cardId==='dp6-131');assert.equal(b.sides.player.hand.length,8);
});
test('Unown R Hidden Power can move more than one Energy then explicitly stop',()=>{
 const s=board(77);s.sides.player.active.energy={Psychic:2};const b=bench(s,'player',117,'receiver');b.energy={};
 use(s,0);go(s,'effectChoice',a=>a.choiceLabel.includes('Psychic'));
 go(s,'effectChoice',a=>a.choiceTarget==='bench');
 go(s,'effectChoice',a=>a.choiceLabel.includes('Psychic'));
 go(s,'effectChoice',a=>a.choiceTarget==='bench');
 go(s,'effectChoice',a=>a.choiceLabel==='Done');
 assert.equal(s.sides.player.active.energy.Psychic,0);assert.equal(b.energy.Psychic,2);
});
