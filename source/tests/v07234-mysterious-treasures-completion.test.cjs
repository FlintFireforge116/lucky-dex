'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const ROOT='../app/src/main/assets/';
const mt=require(ROOT+'tcg-classic-mysterious-treasures'),core=require(ROOT+'tcgp-battle-core'),opp=require(ROOT+'tcg-classic-opponents'),fx=require(ROOT+'tcgp-battle-effects');
const allTypes=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const sample=opp.generate({sets:['dp1'],type:'Grass',seed:23});
function slot(id,uid,energy){const p=core.makePokemonSlot(id,3,uid);p.energy=energy??{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4};return p;}
function field(me='dp2-2',op='dp1-17'){
 const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,seed:42,firstSide:'player',playerEnergyTypes:allTypes,opponentEnergyTypes:allTypes});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=8;s.sides.opponent.turnCount=8;
 s.sides.player.active=slot(me,'our-active');s.sides.opponent.active=slot(op,'foe-active');
 s.sides.player.bench=[slot('dp1-94','our-bench',{Grass:1,Lightning:1})];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[slot('dp1-94','foe-bench',{Lightning:1})];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function act(s,side,type,rule){const x=core.legalActions(s,side).find(a=>a.type===type&&(!rule||rule(a)));assert.ok(x,'No '+type+' for '+side+' in phase '+s.phase);core.applyAction(s,side,x);return x;}
function resolve(s,picker){for(let n=0;n<35&&s.phase==='effectChoice';n++){const acts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(acts.length,'Missing continuation '+n+' '+s.pendingChoice?.effect?.rule);core.applyAction(s,s.choiceSide,picker?.(acts,s,n)||acts[0]);}assert.notEqual(s.phase,'effectChoice','Choice did not finish');}
function attack(s,index=0,picker){act(s,'player','attack',a=>a.attackIndex===index&&(!a.attackCardId||a.attackCardId===s.sides.player.active.cardId));resolve(s,picker);}
function power(s,cardId,picker){act(s,'player','ability',a=>a.cardId===cardId);resolve(s,picker);}
function log(s,type){return s.log.filter(e=>e.type===type).at(-1);}
function bench(s,side,id,uid,energy){const b=s.sides[side],p=slot(id,uid,energy);p.benchSlot=b.bench.length;b.bench.push(p);return p;}

test('all 124 Mysterious Treasures prints are battle-enabled and validate against the shared rule catalogue',()=>{
 assert.equal(mt.CARDS.length,124);assert.deepEqual(mt.coverage(),{total:124,battleEnabled:124,gated:[]});
 for(const c of mt.CARDS){assert.equal(c.battleEnabled,true,c.id);for(const e of [...(c.attacks||[]),...(c.abilities||[]),...(c.effect?[{effect:c.effect}]:[])])assert.deepEqual(fx.validateEffect(e.effect),[],c.id);}
});
test('Armor and Skull Fossils are playable Trainer-based 50 HP Bench Pokémon with voluntary discard',()=>{
 for(const id of ['dp2-116','dp2-117']){const s=field();s.sides.player.hand=[{uid:'fossil-from-hand',cardId:id}];
  act(s,'player','trainer',x=>x.cardId===id);assert.equal(s.sides.player.bench.at(-1).cardId,id);
  assert.equal(core.legalActions(s,'player').filter(x=>x.type==='retreat'&&x.cardId===id).length,0);
  assert.ok(core.legalActions(s,'player').some(x=>x.type==='discardFossil'&&x.cardId===id));
  act(s,'player','discardFossil',x=>x.cardId===id);assert.ok(s.sides.player.discard.some(x=>x.cardId===id));
 }
});
test('Downer Material raises opposing Basic attacks by exactly one Colorless, only with all three pixies',()=>{
 const s=field('dp2-89');s.sides.player.active.energy={Colorless:1};
 bench(s,'opponent','dp2-4','azelf');bench(s,'opponent','dp2-14','mesprit');bench(s,'opponent','dp2-18','uxie');
 assert.equal(core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackIndex===0),false);
 s.sides.player.active.energy.Colorless=2;assert.ok(core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackIndex===0));
});
test('Murkrow can borrow Honchkrow Dark Wing Flaps without its normal cost if Honchkrow is funded',()=>{
 const s=field('dp2-90');s.sides.player.active.energy={};bench(s,'player','dp2-10','honch',{Darkness:2,Colorless:1});
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackCardId==='dp2-10'));
});
test('Ambipom Charity Tail asks defender before damage and discards 2 actual hand cards',()=>{
 const s=field('dp2-3');s.sides.opponent.hand=[{uid:'a',cardId:'dp2-73'},{uid:'b',cardId:'dp2-75'},{uid:'c',cardId:'dp2-90'}];
 attack(s,1,(actions,st,n)=>n===0?actions.find(x=>x.choiceOption===1):actions[0]);
 assert.equal(log(s,'attack').damage,10);assert.equal(s.sides.opponent.hand.some(ref=>ref.uid==='a'||ref.uid==='b'),false);
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='a'));
});
test('Uxie Mind Off boosts and Sleeps only with Mesprit and Azelf allies',()=>{
 const plain=field('dp2-18');attack(plain,0);assert.equal(log(plain,'attack').damage,10);
 const s=field('dp2-18');bench(s,'player','dp2-14','mesprit');bench(s,'player','dp2-4','azelf');attack(s,0);
 assert.equal(log(s,'attack').damage,30);assert.ok(s.sides.opponent.active.conditions?.sleep);
});
test('Bastiodon Protective Wall prevents opposing attack damage to allies on Bench',()=>{
 const s=field('dp2-43');bench(s,'opponent','dp2-21','bastiodon');
 s.sides.player.active.energy={Fighting:1,Colorless:1};attack(s,1);
 assert.equal(s.sides.opponent.bench[0].damage,0);
});
test('Gyarados Dragon DNA grants inherited Magikarp attacks with paid energy cost',()=>{
 const s=field('dp2-26');s.sides.player.active.stack=['dp2-89','dp2-26'];s.sides.player.active.energy={Water:2,Colorless:2};
 s.sides.player.active.damage=20;const borrowed=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackCardId==='dp2-89'&&x.attackIndex===0);assert.ok(borrowed,'Flail from Magikarp');
 core.applyAction(s,'player',borrowed);resolve(s);assert.equal(log(s,'attack').damage,50);
});
test('Crobat Evolutionary Toxic is optional and applies double-damage Poison',()=>{
 const s=field('dp2-50');s.sides.player.hand=[{uid:'crobat-card',cardId:'dp2-23'}];s.sides.player.active.stack=['dp2-108','dp2-50'];s.sides.player.active.playedOnSideTurn=3;
 act(s,'player','evolve',a=>a.cardId==='dp2-23');resolve(s,(actions)=>actions.find(x=>x.choiceOption===1)||actions[0]);
 assert.equal(s.sides.opponent.active.conditions?.poison?.amount,20);
});
test('Mr Mime Airy Wall shields against at most 2 Energy cards, not 3',()=>{
 const s=field('dp2-15','dp2-30');s.sides.player.active.energy={Lightning:3};attack(s,1);
 assert.ok(log(s,'attack').damage>0);
 const t=field('dp2-15','dp2-30');t.sides.player.active.energy={Lightning:2};attack(t,1);
 assert.equal(log(t,'attack').damage,0);
});
test('Toxicroak Poison Sacs preserves poison on opponent evolution',()=>{
 const s=field('dp2-2','dp2-78');bench(s,'player','dp2-36','sacs');
 s.activeSide='opponent';s.sides.opponent.hand=[{uid:'evolve',cardId:'dp2-36'}];s.sides.opponent.active.conditions.poison={amount:20};s.sides.opponent.active.playedOnSideTurn=3;
 act(s,'opponent','evolve',x=>x.cardId==='dp2-36');assert.ok(s.sides.opponent.active.conditions.poison);
});
test('Unown ITEM searches trainer only when all four Unown occupy Bench',()=>{
 const s=field('dp2-37');s.sides.player.bench=[];
 for(const [i,id] of ['dp2-37','dp2-65','dp2-66','dp2-67'].entries()){const p=slot(id,'unown-'+i);p.benchSlot=i;s.sides.player.bench.push(p);}
 s.sides.player.deck.push({uid:'wanted',cardId:'dp2-115'});
 power(s,'dp2-37',a=>a.find(x=>x.choiceCardId==='dp2-115')||a[0]);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='wanted'));
});
test('Unown EQUIP turns a Benched Pokémon into a Tool for +10 HP',()=>{
 const s=field('dp2-15');const u=bench(s,'player','dp2-65','u-e');
 act(s,'player','ability',a=>a.cardId==='dp2-65');resolve(s,actions=>actions.find(a=>a.choiceTarget==='active')||actions[0]);
 assert.ok(s.sides.player.active.tool?.cardId==='dp2-65');assert.ok(!s.sides.player.bench.includes(u));
});
test('Unown E Hidden Power forces all opponent coin flips to tails on next turn',()=>{
 const s=field('dp2-65');attack(s,0);assert.equal(s.sides.opponent.dp2ForceTailsUntil,10+1);
});
test('Team Galactic Wager reveals rock-paper-scissors choices and returns shuffled hands to decks',()=>{
 const s=field();s.sides.player.hand=[{uid:'wager',cardId:'dp2-115'},{uid:'first',cardId:'dp2-73'},{uid:'second',cardId:'dp2-75'}];
 s.sides.opponent.hand=[{uid:'third',cardId:'dp2-90'}];s.sides.player.deck=[];s.sides.opponent.deck=[];
 act(s,'player','trainer',x=>x.cardId==='dp2-115');
 assert.equal(s.phase,'effectChoice');resolve(s,(actions,st,n)=>n===0?actions.find(a=>a.choiceOption===0):n===1?actions.find(a=>a.choiceOption===2):actions.find(a=>a.choiceOption===0));
 assert.equal(s.phase,'battle');assert.equal(s.sides.player.hand.length,0);assert.equal(s.sides.opponent.hand.length,0);
});

test('Alakazam Psychic Guard reduces Stage 2 attack damage through the next opposing turn',()=>{
 const s=field('dp2-2','dp2-8');attack(s,0);
 assert.equal(s.sides.player.active.dp2PsychicGuardUntil,11);
 const from=fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',s.sides.player.active,50,core.getCardById||((id)=>mt.CARDS.find(c=>c.id===id)));
 assert.equal(from,20);
 s.sides.player.active.dp2PsychicGuardUntil=0;
 assert.equal(fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',s.sides.player.active,50,core.getCardById||((id)=>mt.CARDS.find(c=>c.id===id))),50);
});
test('Azelf Bind Pulse excludes Special Energy attachments from next-turn legal actions',()=>{
 const s=field('dp2-4');s.sides.opponent.hand=[{uid:'special',cardId:'dp2-120'}];attack(s,0);
 assert.equal(s.sides.opponent.dp2BindPulseUntil,11);
 assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='attachSpecial'&&a.cardId==='dp2-120'),false);
});
test('Fossils evolve into their respective printed Stage 1 Pokémon',()=>{
 for(const [basic,evo] of [['dp2-116','dp2-63'],['dp2-117','dp2-43']]){
  const s=field();s.sides.player.bench=[slot(basic,'fossil-'+basic)];s.sides.player.bench[0].benchSlot=0;s.sides.player.bench[0].playedOnSideTurn=3;
  s.sides.player.hand=[{uid:'upgrade',cardId:evo}];
  act(s,'player','evolve',a=>a.cardId===evo&&a.target==='bench');
  assert.equal(s.sides.player.bench[0].cardId,evo);
 }
});
test('Unown T THROW prompts to discard one real card before coin and optional opponent bench target',()=>{
 const s=field('dp2-67');s.sides.player.hand=[{uid:'cost',cardId:'dp2-73'}];
 act(s,'player','ability',a=>a.cardId==='dp2-67');assert.equal(s.phase,'effectChoice');
 resolve(s);assert.ok(s.sides.player.discard.some(r=>r.uid==='cost'));
 assert.ok(s.log.some(e=>e.type==='coin'&&e.reason==='Unown T THROW'));
});
test('Power Cancel can discard two cards and stop an opposing Poké-Power before it resolves',()=>{
 const s=field('dp2-6','dp2-2');s.sides.opponent.hand=[{uid:'cancel1',cardId:'dp2-73'},{uid:'cancel2',cardId:'dp2-75'}];
 s.sides.player.deck.push({uid:'would-be-drawn',cardId:'dp2-73'});const before=s.sides.player.hand.length;
 act(s,'player','ability',a=>a.cardId==='dp2-6');
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 resolve(s,(actions,st,n)=>n===0?actions.find(a=>a.choiceOption===1):actions[0]);
 assert.equal(s.sides.player.hand.length,before);
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='cancel1'));
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='cancel2'));
});
test('Uxie Memory Out offers to lock the last attacking move during the opponent turn',()=>{
 const s=field('dp2-15','dp2-18');s.sides.opponent.active.energy={Psychic:1};
 act(s,'player','attack',a=>a.attackIndex===1);
 assert.equal(s.phase,'effectChoice');
 assert.equal(s.choiceSide,'opponent');
 resolve(s,(actions)=>actions.find(a=>a.choiceOption===1)||actions[0]);
 assert.ok(s.sides.player.active.locks?.some(x=>x.attackName==='Explosive Thunder'));
});

test('CPU resolves Team Galactic Wager with non-identical rock-paper-scissors selections after ties',()=>{
 const ai=require(ROOT+'tcgp-battle-ai'),s=field();s.sides.player.hand=[{uid:'wager',cardId:'dp2-115'},{uid:'p',cardId:'dp2-73'}];s.sides.opponent.hand=[{uid:'o',cardId:'dp2-75'}];
 act(s,'player','trainer',a=>a.cardId==='dp2-115');assert.equal(s.phase,'effectChoice');
 for(let n=0;n<30&&s.phase==='effectChoice';n++){
  const move=ai.chooseAction(s,s.choiceSide,'Expert',n);assert.ok(move,'CPU failed to pick Wager continuation');core.applyAction(s,s.choiceSide,move);
 }
 assert.equal(s.phase,'battle','CPU Wager choices must finish');
 assert.ok(s.sides.player.hand.length+s.sides.opponent.hand.length>0,'CPU should draw after resolving Wager');
});
test('Skull Fossil knocked out by an attack awards one Prize, unlike voluntary Fossil discard',()=>{
 const s=field('dp2-2','dp2-117');s.sides.player.prizes=[{uid:'prize',cardId:'dp2-73'}];s.sides.opponent.active.damage=0;
 act(s,'player','attack',a=>a.attackIndex===0);
 assert.equal(log(s,'ko')?.cardId,'dp2-117');assert.equal(log(s,'ko')?.awarded,1);
 assert.equal(s.sides.opponent.active?.cardId==='dp2-117',false);
});
test('Walrein Freeze-up can discard a defender without awarding a Prize',()=>{
 const s=field('dp2-62','dp2-89');s.rngState=1;s.sides.player.hand=[{uid:'walrein',cardId:'dp2-39'}];s.sides.player.active.playedOnSideTurn=3;
 act(s,'player','evolve',a=>a.cardId==='dp2-39');
 assert.equal(s.phase,'effectChoice');
 resolve(s,actions=>actions.find(a=>a.choiceOption===1)||actions[0]);
 const proof=s.log.find(x=>x.reason==='Freeze-up');assert.ok(proof,'Power must flip the printed two coins');
 if(proof.heads===2){assert.equal(log(s,'ko')?.cardId,'dp2-89');assert.equal(log(s,'ko')?.awarded,0);}
});

test('Tail Influence puts selected attached Energy on the BOTTOM of the opponent deck',()=>{
 const s=field('dp2-3','dp2-7');s.rngState=8192;s.sides.opponent.active.energy={Grass:2};
 s.sides.opponent.deck=[{uid:'top-marker',cardId:'dp2-73'}];
 attack(s,0);
 const flip=s.log.find(x=>x.reason==='Tail Influence');assert.ok(flip,'Tail Influence coins must resolve');
 if(flip.results.some(x=>!x)){
  assert.equal(s.sides.opponent.active.energy.Grass,2-flip.results.filter(x=>!x).length);
  assert.equal(require(ROOT+'tcg-classic-battle-data').cardById(s.sides.opponent.deck.at(-1)?.cardId)?.subtype,'Grass');
 }
});
test('Crobat Strike and Fade prompts for a specific opposing target before its coin flip',()=>{
 const s=field('dp2-23');s.sides.opponent.active.damage=0;s.sides.opponent.bench[0].damage=0;
 attack(s,0,actions=>actions.find(x=>x.choiceTarget==='bench')||actions[0]);
 assert.equal(s.sides.opponent.bench[0].damage,50);assert.equal(s.sides.opponent.active.damage,0);
 assert.ok(s.log.some(x=>x.reason==='Strike and Fade'));
});
test('Mr Mime Trick Play asks defender to guess and applies the right result',()=>{
 const s=field('dp2-30');s.rngState=1;
 attack(s,0,actions=>actions.find(a=>a.choiceOption===0)||actions[0]);
 const flip=s.log.find(x=>x.reason==='Trick Play');assert.ok(flip);
 if(flip.heads){assert.ok(s.sides.player.active.damage>=20);assert.equal(s.sides.opponent.active.damage,0);}
 else{assert.ok(s.sides.opponent.active.damage>=50);}
});
test('Unown I face-down Colorless conversion restores original Basic Energy after opponent turn',()=>{
 const s=field('dp2-37','dp2-89');s.sides.opponent.active.energy={Water:2};attack(s,0);
 assert.equal(s.sides.opponent.active.energy.Water,1);
 assert.ok(s.sides.opponent.active.specialEnergy.some(x=>x.dp2FaceDownBasic==='Water'));
 assert.equal(s.turnNumber,11);
 act(s,'opponent','endTurn');
 assert.equal(s.turnNumber,12);
 assert.equal(s.sides.opponent.active.energy.Water,2);
 assert.equal(s.sides.opponent.active.specialEnergy.some(x=>x.dp2FaceDownBasic==='Water'),false);
});
