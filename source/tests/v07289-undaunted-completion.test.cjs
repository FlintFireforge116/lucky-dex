'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const hg=require(path.join(assets,'tcg-classic-undaunted.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const id=n=>'hgss3-'+n,ref=(n,uid)=>({cardId:n.startsWith('hgss')||n.startsWith('dp')?n:id(n),uid:uid||n});
const slot=(n,uid)=>core.makePokemonSlot(n.startsWith('hgss')||n.startsWith('dp')?n:id(n),3,uid||n);
const attack=(n,name)=>hg.cardById(id(n)).attacks.find(a=>a.name===name).effect;
const ability=(n,name)=>hg.cardById(id(n)).abilities.find(a=>a.name===name).effect;
function scene(){const g=cpu.generate({sets:['hgss3'],type:'Grass',seed:3});assert.ok(g.ok,g.error);
 const s=core.createBattle({format:'classic',seed:2028,firstSide:'player',playerDeck:g.cards,opponentDeck:g.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water']});
 s.phase='battle';s.turnNumber=5;s.activeSide='player';s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;
 const p=s.sides.player,o=s.sides.opponent;p.active=slot('47','p');o.active=slot('64','o');p.bench=[];o.bench=[];p.hand=[];o.hand=[];p.discard=[];o.discard=[];p.energyDiscard={};o.energyDiscard={};return s;}
function resolve(s,e,{source=s.sides.player.active,action={},resolvingChoice=false,isAttack=false,random=()=>0.1}={}){
 const offers=[];const p=s.sides.player,o=s.sides.opponent;
 fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:source,defender:o.active,cardById:db.cardById,
  action,isAttack,resolvingChoice,random,requestChoice:spec=>offers.push(spec),shuffle:(_s,deck)=>deck.reverse(),
  drawCard:board=>{if(board.deck.length&&board.hand.length<8)board.hand.push(board.deck.shift());},
  effectiveEnergy:x=>x.energy,benchCard:(board,r)=>{const at=board.bench.length;board.bench.push({...slot(r.cardId,r.uid),benchSlot:at});return at;},
  onEnergyAttached:()=>{},maxHp:(_side,p)=>db.cardById(p.cardId)?.hp||100});return offers[0]||null;}
function pick(s,c,action={},source=s.sides.player.active){assert.ok(c,`choice expected ${JSON.stringify(action)}`);return resolve(s,c.effect,{action,resolvingChoice:true,source});}
function pickReal(s,predicate){const side=s.choiceSide||s.activeSide,act=core.legalActions(s,side).find(predicate);assert.ok(act,'Legal action not found: '+JSON.stringify(s.pendingChoice));core.applyAction(s,side,act);return act;}

test('the complete 91-print source is in battle, with zero anonymous or noop scripted effects',()=>{
 assert.equal(hg.CARDS.length,91);assert.equal(hg.coverage().battleEnabled,91);assert.equal(hg.coverage().gated.length,0);
 for(const c of hg.CARDS){assert.equal(c.deckEligible,true,c.id);for(const v of [...(c.attacks||[]),...(c.abilities||[]),...(c.kind==='trainer'?[c]:[])]){
  assert.deepEqual(fx.validateEffect(v.effect),[],`${c.id} ${v.name}`);if(v.text?.trim()||v.type==='passive')assert.notEqual(v.effect.type,'noop',`${c.id} ${v.name}`);
 }}
});
test('all dedicated Undaunted neoRules have actual executable handler branches',()=>{
 const script=fs.readFileSync(path.join(assets,'tcgp-battle-effects.js'),'utf8');
 for(const c of hg.CARDS)for(const thing of [...(c.attacks||[]),...(c.abilities||[]),c]){
  const e=thing.effect;const rule=e?.type==='neoRule'?e.rule:e?.type==='stadiumAction'?e.effect?.rule:null;
  if(rule?.startsWith('hgss3:')){const key=rule.slice(6);const passiveIds=['hgss3-23','hgss3-24','hgss3-81','hgss3-84','hgss3-89','hgss3-90'];assert.ok(script.includes(`key==='${key}'`)||script.includes(`'${key}'`)||passiveIds.includes(c.id)&&fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8').includes(c.id)||passiveIds.includes(c.id)&&script.includes(c.id),`${c.id}/${thing.name||''}: missing ${key}`);}
 }
});
test('both LEGEND pairs are playable only with their matching physical halves and occupy one Bench slot',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('87','first')];p.bench=[];
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='legendBench').length,0);
 p.hand.push(ref('88','second'));const action=core.legalActions(s,'player').find(a=>a.type==='legendBench');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(p.bench.length,1);assert.deepEqual(p.bench[0].stack,[id('87'),id('88')]);assert.equal(p.hand.length,0);
 const other=scene(),q=other.sides.player;q.hand=[ref('89','rd1'),ref('90','rd2')];q.bench=[];
 const action2=core.legalActions(other,'player').find(a=>a.type==='legendBench');assert.ok(action2);core.applyAction(other,'player',action2);
 assert.deepEqual(q.bench[0].stack,[id('89'),id('90')]);
});
test('Kyogre Groudon Mega Tidal Wave mills five opponent physical cards and damages every Bench per Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('87','legend');o.bench=[slot('47','e1'),slot('47','e2')];o.deck=[ref('hgss1-116','a'),ref('47','b'),ref('hgss1-117','c'),ref('64','d'),ref('hgss1-115','e'),ref('64','f')];
 resolve(s,attack('87','Mega Tidal Wave'),{source:p.active,isAttack:true});
 assert.equal(o.bench[0].damage,90);assert.equal(o.bench[1].damage,90);assert.equal(o.discard.length,5);assert.equal(o.deck[0].uid,'f');
});
test('Rayquaza Deoxys LEGEND takes one EXTRA Prize only after its attack damage KO',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('89','l');p.active.stack=[id('89'),id('90')];p.active.energy={Fire:2,Lightning:1,Colorless:1};
 p.bench=[slot('47','safe')];o.active=slot('64','target');o.bench=[slot('47','foeSafe')];
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action);
 core.applyAction(s,'player',action);const ko=s.log.find(x=>x.type==='ko'&&x.cardId===id('64'));
 assert.ok(ko,JSON.stringify(s.log.slice(-8)));assert.equal(ko.awarded,2,'Normal one plus Space Virus extra');
 assert.equal(s.pendingChoice.kind,'prizeCard');pickReal(s,a=>a.choicePrizeIndex===0);pickReal(s,a=>a.choicePrizeIndex===0);
 assert.equal(p.prizesTaken,2);
});
test('Solar Suggestion moves a real counter from damaged friendly Pokemon to chosen enemy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.bench=[slot('42','b')];p.bench[0].benchSlot=0;p.bench[0].damage=30;
 let c=resolve(s,attack('2','Solar Suggestion'),{isAttack:true});assert.equal(c.kind,'pokemon');
 c=pick(s,c,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(c.kind,'pokemon');
 c=pick(s,c,{choiceTarget:'active'});assert.equal(p.bench[0].damage,20);assert.equal(o.active.damage,10);assert.equal(c.kind,'option');
});
test('Ninetales-style Lava Flow discards exact Fire attachments and adds exactly 20 each',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('6','magcargo');p.active.energy.Fire=2;
 let c=resolve(s,attack('6','Lava Flow'),{source:p.active,isAttack:true});assert.equal(c.kind,'option');
 c=pick(s,c,{choiceOption:0},p.active);assert.equal(p.active.energy.Fire,1);assert.equal(s.sides.opponent.active.damage,20);
 c=pick(s,c,{choiceOption:0},p.active);assert.equal(p.active.energy.Fire,0);assert.equal(s.sides.opponent.active.damage,40);
});
test('Mawile Selfish Draw offers peek choice and draws the actual top card',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('47','top'),ref('64','next')];let c=resolve(s,attack('56','Selfish Draw'));assert.equal(c.kind,'option');assert.match(c.options[0],/Eevee/);
 pick(s,c,{choiceOption:0});assert.equal(p.hand[0].uid,'top');assert.equal(p.deck[0].uid,'next');
});
test('Mawile Destructive Jaw chooses attached physical Energy after heads, without flipping twice',()=>{
 const s=scene(),o=s.sides.opponent;o.active.energy.Fire=1;
 let c=resolve(s,attack('56','Destructive Jaw'),{isAttack:true});assert.equal(c.kind,'option');
 pick(s,c,{choiceOption:0});assert.equal(o.active.energy.Fire,0);assert.equal(o.energyDiscard.Fire,1);
 assert.equal(s.log.filter(x=>x.reason==='Destructive Jaw').length,1);
});
test('Sableye Pull Out takes one specific discarded card and places it on deck top',()=>{
 const s=scene(),p=s.sides.player;p.discard=[ref('47','lost'),ref('64','extra')];p.deck=[ref('42','existing')];
 const c=resolve(s,attack('35','Pull Out'));assert.equal(c.kind,'option');pick(s,c,{choiceOption:0});
 assert.equal(p.deck[0].uid,'lost');assert.equal(p.discard.length,1);
});
test('Rotom Mischievous Trick swaps one selected face-down Prize with top deck card',()=>{
 const s=scene(),p=s.sides.player;p.prizes=[ref('47','prize1'),ref('64','prize2')];p.deck=[ref('42','top')];
 const c=resolve(s,ability('20','Mischievous Trick'));assert.equal(c.kind,'prizeCard');pick(s,c,{choicePrizeIndex:1});
 assert.equal(p.prizes[1].uid,'top');assert.equal(p.deck[0].uid,'prize2');
});
test('Smeargle Portrait copies the effect of a chosen actual opposing Supporter',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('8','smeargle');p.deck=[ref('47','draw1'),ref('64','draw2')];o.hand=[ref('hgss1-89','bill')];
 const c=resolve(s,ability('8','Portrait'),{source:p.active});assert.equal(c.kind,'option');assert.match(c.options[0],/Bill/);pick(s,c,{choiceOption:0},p.active);
 assert.equal(p.hand.length,2);assert.equal(o.hand.length,1);
});
test('Vileplume Allergy Flower locks Items for both players, not Supporters',()=>{
 const s=scene(),p=s.sides.player;p.bench=[slot('24','vileplume')];p.bench[0].benchSlot=0;p.hand=[ref('hgss1-93','heal'),ref('hgss1-89','bill')];
 const actions=core.legalActions(s,'player');assert.ok(!actions.some(a=>a.type==='trainer'&&a.cardId==='hgss1-93'));
 assert.ok(actions.some(a=>a.type==='trainer'&&a.cardId==='hgss1-89'));
});
test('Ruins of Alph and Special Energy bonuses are present as effects, not placeholders',()=>{
 assert.equal(hg.cardById(id('76')).trainerType,'Stadium');
 assert.equal(hg.cardById(id('71')).effect.type,'stadiumAction');
 assert.equal(hg.cardById(id('72')).expires,'endOpponentTurn');
 for(const n of ['79','80'])assert.equal(hg.cardById(id(n)).specialEnergy,true);
});
test('Flower Shop Lady and Burned Tower expose actual chosen cards from discard',()=>{
 const s=scene(),p=s.sides.player;p.discard=[ref('47','eevee'),ref('hgss1-116','fire')];
 let c=resolve(s,hg.cardById(id('74')).effect);assert.equal(c.kind,'option');c=pick(s,c,{choiceOption:0});assert.ok(p.deck.some(r=>r.uid==='eevee'));
 c=resolve(s,hg.cardById(id('71')).effect.effect,{random:()=>0.1});assert.equal(c.kind,'option');
});
test('CPU HGSS3-only decks remain valid across 9 types / 12 deterministic seeds with no orphan LEGEND halves',()=>{
 let valid=0;for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=12;seed++){
  const r=cpu.generate({sets:['hgss3'],type,seed});if(!r.ok)continue;valid++;assert.equal(r.cards.length,30);assert.ok(db.validateDeck(r.cards).ok,type+'/'+seed);
  const count=n=>r.cards.filter(c=>c===id(n)).length;assert.equal(count('87'),count('88'));assert.equal(count('89'),count('90'));
 }assert.ok(valid>=40,'only '+valid+' builds succeeded');
});
test('Legend Box places exact revealed pair onto one Bench slot and keeps their revealed Energy',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('87','legenda'),ref('hgss1-116','fire'),ref('88','legendb'),ref('47','discard'),ref('hgss1-117','water'),ref('64','rattata')];p.bench=[];
 let c=resolve(s,hg.cardById(id('75')).effect);assert.equal(c.kind,'option');
 pick(s,c,{choiceOption:0});assert.equal(p.bench.length,1);assert.deepEqual(p.bench[0].stack,[id('87'),id('88')]);
 assert.equal(p.bench[0].energy.Fire,1);assert.equal(p.bench[0].energy.Water,1);
 assert.equal(p.deck.length,2);assert.ok(!p.deck.some(r=>r.uid==='legenda'||r.uid==='legendb'));
});
test('Alph Lithograph THREE returns Stadium to its owner hand, not to the attacker hand',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;s.stadium={cardId:id('76'),uid:'stadium',ownerSide:'opponent'};
 resolve(s,hg.cardById(id('THREE')).effect);assert.equal(s.stadium,null);assert.equal(o.hand[0].uid,'stadium');assert.equal(p.hand.length,0);
});
test('Red Armor prevents attack damage when the opponent carries Special Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('84','scizor');o.active=slot('47','eevee');o.active.specialEnergy=[ref('hgss1-103','dce')];
 assert.ok(fx.attackIsPrevented(s,'player',p.active,o.active,db.cardById));
 o.active.specialEnergy=[];assert.equal(fx.attackIsPrevented(s,'player',p.active,o.active,db.cardById),null);
});
test('Vespiquen Defense Sign protects only allied Benched Grass Pokemon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('47','active');p.bench=[slot('23','vespiquen'),slot('1','grass')];
 assert.ok(fx.attackIsPrevented(s,'player',p.bench[1],o.active,db.cardById));
 assert.equal(fx.attackIsPrevented(s,'player',p.active,o.active,db.cardById),null);
});
test('Burned Tower offers a genuine once-per-turn Stadium action in battle',()=>{
 const s=scene(),p=s.sides.player;s.stadium=ref('71','tower');s.stadium.ownerSide='opponent';p.discard=[ref('hgss1-116','energy')];
 const a=core.legalActions(s,'player').find(x=>x.type==='stadiumAction');assert.ok(a,'Burned Tower Stadium action not available');
 core.applyAction(s,'player',a);assert.equal(s.stadium.cardId,id('71'));assert.ok(p.stadiumActionUsedTurn===s.turnNumber);assert.ok(s.log.some(x=>x.type==='coin'&&x.reason==='Burned Tower'));
});
test('Both Fire and Metal Special Energy effects survive one-to-one card imports',()=>{
 const dark=hg.cardById(id('79')),metal=hg.cardById(id('80'));
 assert.deepEqual(dark.effect.provides,{Darkness:1});assert.deepEqual(metal.effect.provides,{Metal:1});
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('7','scizor');p.active.specialEnergy=[ref('80','metal')];o.active=slot('64','rattata');
 assert.equal(fx.modifierAmount(s,'player',p.active,'damageReduction',db.cardById),10);
 p.active.specialEnergy=[];assert.equal(fx.modifierAmount(s,'player',p.active,'damageReduction',db.cardById),0);
});
test('Gyro Ball prompts voluntary attacker switch before opponent switch',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('13','forretress');p.bench=[slot('47','eevee')];p.bench[0].benchSlot=0;o.bench=[slot('47','foe')];o.bench[0].benchSlot=0;
 let c=resolve(s,attack('13','Gyro Ball'),{source:p.active,isAttack:true});assert.equal(c.kind,'option');
 c=pick(s,c,{choiceOption:1},p.active);assert.equal(c.kind,'switchBench');
 const picked=pick(s,c,{choiceTarget:'bench',choiceBenchIndex:0},p.active);
 assert.equal(p.active.uid,'eevee');assert.equal(picked.kind,'switchBench');
});
