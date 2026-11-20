'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js')),set=require(path.join(assets,'tcg-classic-dark-explorers.js')),fx=require(path.join(assets,'tcgp-battle-effects.js')),core=require(path.join(assets,'tcgp-battle-core.js')),cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const id=n=>'bw5-'+n,ref=(cardId,uid)=>({cardId,uid:uid||cardId}),slot=(n,uid)=>core.makePokemonSlot(id(n),4,uid||'slot'+n);
function scene(){
 const sample=cpu.generate({sets:['bw5'],type:'Darkness',seed:14});assert.equal(sample.ok,true);
 const s=core.createBattle({format:'classic',seed:14,firstSide:'player',playerDeck:sample.cards,opponentDeck:sample.cards,playerEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal'],opponentEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];s.stadium=null;s.modifiers=[];
 for(const [side,board] of Object.entries(s.sides)){
  board.turnCount=4;board.active=slot(side==='player'?19:20,side+'active');board.active.energy={Colorless:4};board.bench=[];board.hand=[];board.deck=[];board.discard=[];board.energyDiscard={};board.lostZone=[];board.energySupply=[];board.prizes=[ref('bw5-1','prize1'),ref('bw5-2','prize2'),ref('bw5-3','prize3')];board.prizesTaken=0;
 }return s;
}
function bench(board,n){const p=slot(n,'bench'+board.bench.length);p.benchSlot=board.bench.length;board.bench.push(p);return p;}
function act(s,e,{action={},resolve=false,attacker=s.sides.player.active,defender=s.sides.opponent.active,random=()=>.1}={}){
 let choice=null;const p=s.sides.player;
 fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker,defender,cardById:data.cardById,action,resolvingChoice:resolve,isAttack:true,random,
  requestChoice:c=>choice=c,shuffle:(_s,deck)=>deck.reverse(),drawCard:ss=>{const x=ss.deck.shift();if(x&&ss.hand.length<Number(ss.handLimit||8))ss.hand.push(x);return x;},
  onEnergyAttached:()=>{},maxHp:(_who,x)=>data.cardById(x.cardId)?.hp,benchCard:(board,r)=>{const sl=core.makePokemonSlot(r.cardId,board.turnCount,r.uid);sl.benchSlot=board.bench.length;board.bench.push(sl);return sl;}});
 return choice;
}
function attack(s,n,name,{random=()=>.1,action={}}={}){const card=set.cardById(id(n)),a=card.attacks.find(x=>x.name===name);assert.ok(a,`${n} ${name}`);
 return fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,isAttack:true,random,effectiveEnergy:p=>p.energy,maxHp:(_side,p)=>data.cardById(p.cardId)?.hp,retreatCost:who=>core.attackOptions(s,who)?.retreat??data.cardById(s.sides[who].active.cardId)?.retreat});}
test('Energy Assist lists only discarded Basic Energy, never Pokémon, Trainers or Special Energy',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(6);bench(p,7);
 p.discard=[ref('bw5-1','discard-mon'),ref('bw5-92','discard-tool'),ref('bw4-92','discard-special'),ref('bw1-107','discard-basic')];p.energyDiscard.Fire=1;
 let choice=act(s,set.cardById('bw5-6').attacks[1].effect);assert.equal(choice.kind,'pokemon');
 choice=act(s,choice.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(choice.kind,'option');assert.deepEqual(choice.options.map(x=>x.replace(/^Attach /,'')),['Water Energy','Fire Energy (discard ledger)']);
 act(s,choice.effect,{resolve:true,action:{choiceOption:0}});
 assert.equal(p.bench[0].energy.Water,1);assert.equal(p.discard.some(r=>r.uid==='discard-basic'),false);
 assert.equal(p.discard.some(r=>r.uid==='discard-tool'),true);
 assert.equal(p.discard.some(r=>r.uid==='discard-special'),true);
});
test('Charge Beam can attach a physical Special Energy card with its identity intact; non-Energy excluded',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(44);p.active.energy={Lightning:1};p.discard=[ref('bw5-1','not-energy'),ref('bw4-92','double'),ref('bw1-107','water')];
 let choice=act(s,set.cardById('bw5-44').attacks[0].effect);
 assert.equal(choice.kind,'option');assert.equal(choice.options.length,2);
 assert.ok(!choice.options.join().includes('Bulbasaur'));
 const ix=choice.options.findIndex(x=>x.includes('Double Colorless'));assert.ok(ix>=0);
 act(s,choice.effect,{resolve:true,action:{choiceOption:ix}});
 assert.ok(p.active.specialEnergy.some(r=>r.uid==='double'&&r.cardId==='bw4-92'));
 assert.ok(!p.discard.some(r=>r.uid==='double'));
 assert.equal(p.active.energy.Colorless||0,0);
});
test('Volt Bolt selects an opposing Pokémon before damage: Active receives weakness, Bench ignores it',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(38);p.active.energy={Lightning:3};o.active=slot(26);const victim=bench(o,25);
 const e=set.cardById('bw5-38').attacks[1].effect;
 const options=fx.choicesForEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:data.cardById});
 assert.equal(options.length,2);
 const hitActive=attack(s,38,'Volt Bolt',{action:{effectSelection:o.active.uid}});
 assert.equal(hitActive.damage,100);assert.equal(hitActive.damageTarget,o.active);
 assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,hitActive.damage,data.cardById),200);
 const hitBench=attack(s,38,'Volt Bolt',{action:{effectSelection:victim.uid}});
 assert.equal(hitBench.damage,100);assert.equal(hitBench.damageTarget,victim);
 assert.equal(hitBench.damageRules.ignoreWeakness,true);
});
test('Chuck discards only the selected real Tool cards, once; extra Tool cards stay in hand',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(52);p.hand=[ref('bw5-92','tool-a'),ref('bw3-91','tool-b'),ref('bw5-1','not-tool')];
 const e=set.cardById('bw5-52').attacks[0].effect;
 assert.equal(attack(s,52,'Chuck',{action:{effectSelection:'tool-a'}}).damage,40);
 const choice=act(s,e,{action:{effectSelection:'tool-a'}});assert.equal(choice,null,'printed choice must not prompt again after attack');
 assert.deepEqual(p.discard.map(r=>r.uid),['tool-a']);assert.deepEqual(p.hand.map(r=>r.uid),['tool-b','not-tool']);
 assert.equal(s.sides.opponent.active.damage||0,0,'post-attack Tool discard must not apply a second direct hit');
});
test('Item legality: Ultra Ball requires two OTHER hand cards and Dark Patch a Darkness Bench and real discard',()=>{
 const s=scene(),p=s.sides.player;
 p.hand=[ref('bw5-102','ultra'),ref('bw5-1','only-one')];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='bw5-102'));
 p.hand.push(ref('bw5-2','second'));
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='bw5-102'));
 p.hand=[ref('bw5-93','patch')];p.energyDiscard.Darkness=1;
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='bw5-93'));
 bench(p,63);
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='bw5-93'));
 p.energyDiscard.Darkness=0;
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='bw5-93'));
});
test('Enhanced Hammer is not offered without opposing Special Energy, and becomes legal when attached',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.hand=[ref('bw5-94','hammer')];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='bw5-94'));
 o.active.specialEnergy=[ref('bw4-92','dce')];
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='bw5-94'));
});
test('Real battle: Chuck applies Tool cost once and leaves unselected Tools in hand',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(52);p.active.energy={Psychic:2,Colorless:2};
 p.hand=[ref('bw5-92','tool-a'),ref('bw3-91','tool-b'),ref('bw5-1','not-tool')];
 o.active=slot(20);o.active.energy={Fire:4};
 const options=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 const chosen=options.find(a=>a.effectSelection==='tool-a');assert.ok(chosen);
 core.applyAction(s,'player',chosen);
 assert.equal(o.active.damage,40);
 assert.deepEqual(p.discard.filter(x=>x.uid==='tool-a').map(x=>x.cardId),['bw5-92']);
 assert.equal(p.hand.some(x=>x.uid==='tool-b'),true);
 assert.ok(!s.pendingChoice||s.pendingChoice.kind!=='handCard');
});
test('Real battle: Volt Bolt applies normal Active Weakness, then discards Lightning Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(38);p.active.energy={Lightning:3};p.bench=[slot(1)];p.bench[0].benchSlot=0;
 o.active=slot(26);o.bench=[slot(54)];o.bench[0].benchSlot=0;
 const choices=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 const chosen=choices.find(a=>a.effectSelection===o.active.uid);assert.ok(chosen,'Raikou must offer the target Active');
 core.applyAction(s,'player',chosen);
 assert.ok(s.sides.player.energyDiscard.Lightning>=3,'all Lightning cards reach the true discard ledger');
 assert.equal(o.active?.cardId!=='bw5-26',true,'200 Lightning damage should knock out 170 HP Kyogre-EX');
});
test('Kyogre-EX Dual Splash uses Active Weakness but not Bench Weakness or Resistance',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(26);o.active=slot(54);const benched=bench(o,54);
 const e=set.cardById('bw5-26').attacks[1].effect;
 let ch=act(s,e);assert.equal(ch.kind,'pokemon');
 ch=act(s,ch.effect,{resolve:true,action:{choiceTarget:'active'}});
 assert.equal(o.active.damage,100,'Water damage should double on Fighting Active Groudon-EX');
 assert.equal(ch.kind,'pokemon');
 act(s,ch.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:benched.benchSlot}});
 assert.equal(benched.damage,50,'Benched Groudon-EX takes exactly 50 irrespective of Weakness');
});
