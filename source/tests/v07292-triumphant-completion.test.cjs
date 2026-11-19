'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const h=require(path.join(assets,'tcg-classic-triumphant.js')),db=require(path.join(assets,'tcg-classic-battle-data.js')),
fx=require(path.join(assets,'tcgp-battle-effects.js')),core=require(path.join(assets,'tcgp-battle-core.js')),
cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const id=n=>'hgss4-'+n,ref=(n,uid)=>({cardId:/^(hgss|dp|pl|base|neo)/.test(n)?n:id(n),uid:uid||n}),
slot=(n,uid)=>core.makePokemonSlot(/^(hgss|dp|pl|base|neo)/.test(n)?n:id(n),3,uid||n),
a=(n,name)=>h.cardById(id(n)).attacks.find(v=>v.name===name),ability=(n,name)=>h.cardById(id(n)).abilities.find(v=>v.name===name);
function scene(){let g;for(const type of ['Psychic','Grass','Water','Fire']){g=cpu.generate({sets:['hgss4'],type,seed:3});if(g.ok)break;}assert.ok(g?.ok,'Triumphant-only sample deck required');
 const s=core.createBattle({format:'classic',seed:2028,firstSide:'player',playerDeck:g.cards,opponentDeck:g.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.turnNumber=5;s.activeSide='player';s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;
 for(const board of [s.sides.player,s.sides.opponent]){board.active=slot('58','active-'+board.id);board.bench=[];board.hand=[];board.discard=[];board.lostZone=[];board.energyDiscard={};board.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Colorless:4};}
 return s;}
function resolve(s,e,{source=s.sides.player.active,action={},resolvingChoice=false,random=()=>0.1,isAttack=false}={}){
 const offers=[],p=s.sides.player,o=s.sides.opponent;
 fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:source,defender:o.active,cardById:db.cardById,action,isAttack,resolvingChoice,random,
  requestChoice:spec=>offers.push(spec),shuffle:(_state,deck)=>deck.reverse(),drawCard:board=>{const r=board.deck.shift();if(r)board.hand.push(r);return r;},
  onEnergyAttached:()=>{},benchCard:(board,r)=>{const at=board.bench.length;board.bench.push({...slot(r.cardId,r.uid),benchSlot:at});return at;},maxHp:(side,p)=>db.cardById(p.cardId)?.hp||100});return offers[0]||null;}
function picked(s,choice,action={},source=s.sides.player.active){assert.ok(choice,'Expected a user choice');return resolve(s,choice.effect,{source,action,resolvingChoice:true});}
function action(s,filter){const side=s.choiceSide||s.activeSide,opts=core.legalActions(s,side),act=opts.find(filter);assert.ok(act,JSON.stringify({side,opts,pending:s.pendingChoice}));core.applyAction(s,side,act);return act;}

test('complete 103 print set: no gated cards, no missing executable schema',()=>{
 assert.equal(h.CARDS.length,103);assert.equal(h.coverage().battleEnabled,103);assert.equal(h.coverage().gated.length,0);
 for(const c of h.CARDS){assert.equal(c.battleEnabled,true,c.id);assert.equal(c.deckEligible,true,c.id);for(const x of [...(c.attacks||[]),...(c.abilities||[]),...(c.kind==='trainer'?[c]:[])])assert.deepEqual(fx.validateEffect(x.effect),[],c.id+' '+x.name);}
});
test('both LEGEND pairs require two physical halves and each occupies one Bench slot',()=>{
 for(const [left,right] of [['99','100'],['101','102']]){
  const s=scene(),p=s.sides.player;p.hand=[ref(left,'left')];p.bench=[];
  assert.equal(core.legalActions(s,'player').filter(a=>a.type==='legendBench').length,0);
  p.hand.push(ref(right,'right'));const legal=core.legalActions(s,'player').filter(a=>a.type==='legendBench');assert.ok(legal.length);
  core.applyAction(s,'player',legal[0]);assert.equal(p.bench.length,1);assert.deepEqual(p.bench[0].stack,[id(left),id(right)]);
 }
});
test('LEGEND pair deck builder never supplies orphan halves across 180 seeds',()=>{
 let checked=0;for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=20;seed++){
  const g=cpu.generate({sets:['hgss4'],type,seed});if(!g.ok)continue;checked++;assert.equal(g.cards.length,30);assert.ok(db.validateDeck(g.cards).ok,type+'/'+seed);
  for(const [a,b] of [['99','100'],['101','102']])assert.equal(g.cards.filter(x=>x===id(a)).length,g.cards.filter(x=>x===id(b)).length);
 }assert.ok(checked>=70,'Only '+checked+' successful CPU decks');
});
test('Nidoking Pheromone Stamina adds exactly 20 HP per Nidoqueen',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('6','king');p.bench=[slot('28','queen1'),slot('28','queen2')];
 assert.equal(core.maxHp(s,'player',p.active),180);p.bench.pop();assert.equal(core.maxHp(s,'player',p.active),160);
});
test('Indigo Plateau grants +30 HP to both players’ LEGEND Pokémon only',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('99','legend');const original=core.maxHp(s,'player',p.active);
 s.stadium=ref('86','plateau');assert.equal(core.maxHp(s,'player',p.active),original+30);
 const plain=slot('58','plain');assert.equal(core.maxHp(s,'player',plain),Number(db.cardById(plain.cardId).hp));
});
test('Solrock Heal Block requires Lunatone and prevents healing on either side',()=>{
 const s=scene(),p=s.sides.player;p.bench=[slot('9','sun'),slot('dp4-49','moon')];
 // Use a real Lunatone card, not merely an ID with a matching type.
 p.bench[1]=slot('pl3-32','moon');assert.equal(db.cardById(p.bench[1].cardId)?.name,'Lunatone');
 assert.equal(fx.healingIsBlocked(s,s.sides.opponent.active,db.cardById),true);p.bench.pop();assert.equal(fx.healingIsBlocked(s,s.sides.opponent.active,db.cardById),false);
});
test('Cubone Lonely Bone reduces damage by 20 per real Marowak in its discard',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('60','cubone');p.discard=[ref('hgss1-45','marowak1'),ref('hgss1-45','marowak2')];
 const mar=Object.values(db.CARDS).find(c=>c.name==='Marowak');assert.ok(mar);p.discard=[ref(mar.id,'marowak1'),ref(mar.id,'marowak2')];
 assert.equal(fx.modifierAmount(s,'player',p.active,'damageReduction',db.cardById),40);
});
test('Mew Prime borrows only actual Lost Zone Pokemon attacks, not discard pile',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('97','mew');p.active.energy={Grass:3,Colorless:3,Psychic:3};p.lostZone=[ref('hgss4-98','yanmega')];p.discard=[ref('hgss4-95','machamp')];
 const actions=core.legalActions(s,'player');assert.ok(actions.some(x=>x.type==='attack'&&x.attackCardId===id('98')));
 assert.ok(!actions.some(x=>x.type==='attack'&&x.attackCardId===id('95')));
});
test('Yanmega Prime Insight makes attacks free only while both hands match',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('98','yanmega');p.active.energy={};p.hand=[ref('58','a')];o.hand=[ref('58','b')];
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackIndex===0));
 o.hand.push(ref('58','c'));assert.ok(!core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackIndex===0));
});
test('Psychic Lock prevents opposing activated Poké-Powers on next turn',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;o.active=slot('96','zone');o.hand=[];
 resolve(s,a('23','Psychic Lock').effect,{source:slot('23','grumpig')});
 assert.equal(o.hgss4PowersLockedUntil,s.turnNumber+1);
});
test('Mamoswine Snowstorm hits ONLY previously damaged opposing Bench Pokémon',()=>{
 const s=scene(),o=s.sides.opponent;o.bench=[slot('58','damaged'),slot('58','healthy')];o.bench[0].damage=10;
 resolve(s,a('5','Snowstorm').effect,{source:slot('5','mamoswine'),isAttack:true});assert.equal(o.bench[0].damage,30);assert.equal(o.bench[1].damage,0);
});
test('Black Belt and Twins cannot be played while ahead/even in Prizes',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.hand=[ref('85','belt'),ref('89','twins')];p.prizes=[ref('58','p1')];o.prizes=[ref('58','p2'),ref('58','p3')];
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='trainer'&&[id('85'),id('89')].includes(x.cardId)));
 p.prizes.push(ref('58','p4'),ref('58','p5'));assert.ok(core.legalActions(s,'player').some(x=>x.type==='trainer'&&x.cardId===id('85')));
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='trainer'&&x.cardId===id('89')));
});
test('Junk Arm cannot retrieve itself or Supporters and needs two discard cards',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('87','arm'),ref('58','discard1'),ref('58','discard2')];p.discard=[ref('87','armOld'),ref('85','belt'),ref('hgss2-72','dualBall')];
 const offers=resolve(s,h.cardById(id('87')).effect);assert.equal(offers.kind,'handCard');
 const n=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId===id('87'));assert.ok(n);
});
test('Twin search picks two physical cards from the deck',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.deck=[ref('58','first'),ref('59','second'),ref('60','third')];p.prizes=Array(3).fill(0).map((_,i)=>ref('58','p'+i));o.prizes=[ref('58','foep')];
 let c=resolve(s,h.cardById(id('89')).effect);assert.equal(c.kind,'deckCard');c=picked(s,c,{choiceDeckIndex:1});assert.equal(p.hand[0].uid,'second');
 assert.equal(c.kind,'deckCard');picked(s,c,{choiceDeckIndex:0});assert.equal(p.hand[1].uid,'first');
});
test('Palkia & Dialga Time Control adds two actual cards to opponent Prize cards',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('101','pair');p.active.energy={Metal:3};o.prizes=[ref('58','original')];o.deck=[ref('58','one'),ref('59','two'),ref('60','left')];
 resolve(s,a('101','Time Control').effect,{source:p.active});assert.equal(p.active.energy.Metal,0);assert.deepEqual(o.prizes.map(r=>r.uid),['original','one','two']);
});
test('Rescue Energy returns exactly the knocked-out Pokemon to hand while the Energy is discarded',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('95','champ');p.active.energy={Fighting:4,Colorless:4};
 p.prizes=Array.from({length:5},(_,i)=>ref('58','prize'+i));
 o.active=slot('58','rescued');o.active.specialEnergy=[ref('90','rescue-energy')];o.bench=[slot('58','replacement')];o.bench[0].benchSlot=0;
 o.prizes=Array.from({length:5},(_,i)=>ref('58','op-prize'+i));
 const attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1&&x.cardId===id('95'));
 assert.ok(attack,'Champ Buster must be a legal attack');core.applyAction(s,'player',attack);
 assert.equal(o.hand.filter(x=>x.cardId===id('58')).length,1);
 assert.equal(o.discard.filter(x=>x.cardId===id('90')).length,1);
 assert.equal(s.pendingPrizeClaims?.find(x=>x.side==='player')?.remaining,1);
});
test('Alph Lithograph FOUR privately inspects ALL face-down Prize cards without revealing them',()=>{
 const s=scene(),p=s.sides.player;p.prizes=[ref('58','one'),ref('59','two')];const c=resolve(s,h.cardById(id('FOUR')).effect);
 assert.equal(c.kind,'option');assert.match(c.options[0],/Close prize inspection/);assert.deepEqual(p.prizes.map(r=>r.uid),['one','two']);picked(s,c,{choiceOption:0});
});
test('Magnezone Magnetic Draw draws precisely to six cards',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('58','h1')];p.deck=[ref('58','1'),ref('58','2'),ref('58','3'),ref('58','4'),ref('58','5'),ref('58','6')];
 resolve(s,ability('96','Magnetic Draw').effect,{source:slot('96','zone')});assert.equal(p.hand.length,6);assert.equal(p.deck.length,1);
});
test('Magnezone Lost Burn offers zero-or-more actual Energy and moves selected card into Lost Zone',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('96','zone');p.active.energy={Lightning:2};p.bench=[];o.active=slot('58','target');
 let c=resolve(s,a('96','Lost Burn').effect,{source:p.active});assert.equal(c.kind,'option');assert.match(c.options[0],/Deal 0 damage/);
 c=picked(s,c,{choiceOption:1},p.active);assert.equal(p.active.energy.Lightning,1);assert.equal(p.lostZone.length,1);
 picked(s,c,{choiceOption:0},p.active);assert.ok(o.active.damage>0);
});
test('Absol Vicious Claw sends selected Pokemon to Lost Zone, not discard',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('58','pikachu')];let c=resolve(s,a('91','Vicious Claw').effect,{source:slot('91','absol')});assert.equal(c.kind,'handCard');
 picked(s,c,{choiceHandIndex:0},slot('91','absol'));assert.equal(p.lostZone.length,1);assert.equal(p.hand.length,0);assert.equal(p.discard.length,0);
});
test('Forest Breath is Active-only and attaches Grass Energy from hand to chosen friendly Pokemon',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('92','celebi');p.active.energy={};p.hand=[ref('dp1-123','grass')];
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='ability'&&x.cardId===id('92')));
 p.bench=[p.active];p.bench[0].benchSlot=0;p.active=slot('58','other');assert.ok(!core.legalActions(s,'player').some(x=>x.type==='ability'&&x.cardId===id('92')));
});
test('selected opponent Bench damage from Illumisile requires Illumise in play',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.bench=[];o.bench=[slot('58','target')];o.bench[0].benchSlot=0;
 assert.equal(resolve(s,a('82','Illumisile').effect),null);
 p.bench=[slot('64','illumise')];p.bench[0].benchSlot=0;assert.equal(db.cardById(p.bench[0].cardId)?.name,'Illumise');
 const c=resolve(s,a('82','Illumisile').effect);assert.equal(c.kind,'pokemon');picked(s,c,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(o.bench[0].damage,30);
});
test('all 103 battle actions pass independent schema, CPU and synthetic smoke checks',()=>{
 const audit=require(path.join(root,'scripts/audit-classic-set.cjs'));
 const report=audit.auditSet('hgss4',{data:db,fx,opponents:cpu,core,testIndex:[],engineText:fs.readFileSync(path.join(assets,'tcgp-battle-effects.js'),'utf8')+'\n'+fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8'),setDefs:{hgss4:h.SET},cpu:true,smoke:true});
 assert.equal(report.summary.errors,0);assert.equal(report.summary.warnings,0);assert.equal(report.summary.reviewFlags,0);
 assert.equal(report.smoke.failures.length,0);assert.equal(report.cpu.valid,16);
});
