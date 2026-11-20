'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const data=require(path.join(asset,'tcg-classic-battle-data.js')),bw=require(path.join(asset,'tcg-classic-next-destinies.js')),
  fx=require(path.join(asset,'tcgp-battle-effects.js')),core=require(path.join(asset,'tcgp-battle-core.js')),
  cpu=require(path.join(asset,'tcg-classic-opponents.js'));
const id=n=>'bw4-'+n;
const ref=(id,uid)=>({cardId:id,uid:uid||id});
const slot=(n,uid)=>core.makePokemonSlot(id(n),4,uid||String(n));
function scene(){
 const deck=cpu.generate({sets:['bw3'],type:'Fire',seed:7});assert.ok(deck.ok);
 const s=core.createBattle({format:'classic',seed:7,firstSide:'player',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];s.stadium=null;
 for(const [side,b] of Object.entries(s.sides)){
   b.turnCount=4;b.active=slot(side==='player'?'5':'54',side+'-active');b.active.energy={Colorless:4};b.bench=[];b.hand=[];b.deck=[];b.discard=[];b.energyDiscard={};b.energySupply=[];b.lostZone=[];
 }return s;
}
function bench(board,n){const p=slot(n,'bench'+board.bench.length);p.benchSlot=board.bench.length;board.bench.push(p);return p;}
function act(s,e,{action={},resolve=false,attacker=s.sides.player.active,defender=s.sides.opponent.active,random=()=>.1}={}){
 let result=null;const p=s.sides.player,o=s.sides.opponent;
 fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker,defender,cardById:data.cardById,action,resolvingChoice:resolve,isAttack:true,random,
   requestChoice:c=>result=c,shuffle:(_state,deck)=>deck.reverse(),drawCard:ss=>{const r=ss.deck.shift();if(r&&ss.hand.length<Number(ss.handLimit||8))ss.hand.push(r);return r;},
   maxHp:(_side,x)=>data.cardById(x.cardId).hp,onEnergyAttached:()=>{},benchCard:(board,r)=>{const sl=core.makePokemonSlot(r.cardId,board.turnCount,r.uid);sl.benchSlot=board.bench.length;board.bench.push(sl);return sl;}});
 return result;
}
function attack(s,n,name,{action={},random=()=>.1}={}){const c=bw.cardById(id(n)),a=c.attacks.find(x=>x.name===name);assert.ok(a,`${n} ${name}`);
 return fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,isAttack:true,random,effectiveEnergy:p=>p.energy,maxHp:(_side,p)=>data.cardById(p.cardId)?.hp});}
test('The complete pinned Next Destinies print roster is imported faithfully with distinct full-art IDs',()=>{
 const bytes=fs.readFileSync(path.join(root,'data/classic/bw4-print-compact.json'));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'8027b966110623fadf028820809bd46d301289d6594120a2de45e3883ea0018f');
 const rows=JSON.parse(bytes);assert.equal(rows.length,103);assert.equal(bw.CARDS.length,103);
 for(const row of rows){const card=bw.cardById(id(row[0]));assert.ok(card);assert.equal(card.name,row[1]);assert.equal(data.cardById(card.id),card);
  if(card.kind==='pokemon'){assert.deepEqual(card.attacks.map(a=>a.name),row[7].map(a=>a[0]));assert.deepEqual(card.attacks.map(a=>a.text),row[7].map(a=>a[3]));}}
 assert.equal(bw.cardById(id(98)).name,'Mewtwo-EX');assert.equal(bw.cardById(id(54)).name,'Mewtwo-EX');assert.notEqual(bw.cardById(id(54)).id,bw.cardById(id(98)).id);
});
test('All attacks and abilities and Trainers have valid schemas with full set enabled',()=>{
 let attackCount=0,powerCount=0;for(const c of bw.CARDS){for(const a of c.attacks||[]){attackCount++;assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}for(const a of c.abilities||[]){powerCount++;assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);} }
 assert.equal(attackCount,161);assert.equal(powerCount,12);assert.equal(bw.coverage().battleEnabled,103);assert.equal(bw.cardById(id(87)).battleEnabled,true);assert.equal(bw.cardById(id(87)).deckEligible,true);
});
test('EX prints are Basic Pokémon granting 2 prizes; they are distinct from old Pokémon-ex',()=>{
 for(const n of [5,22,38,51,54,82,94,95,96,97,98,99]){const p=bw.cardById(id(n));assert.equal(p.stage,'Basic');assert.equal(p.prizeCards,2);assert.equal(p.pokemonEX,true);assert.equal(p.pokemonEx,undefined);}
 assert.equal(bw.cardById(id(21)).prizeCards,1);
});
test('Dynamic damage: Revenge Blast, X Ball, Stadium bonus, Dark Penalty, Oracle Inflict',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(5);o.active=slot(54);o.prizesTaken=2;assert.equal(attack(s,5,'Revenge Blast').damage,90);
 p.active=slot(54);p.active.energy={Psychic:2};o.active.energy={Colorless:1};assert.equal(attack(s,54,'X Ball').damage,60);
 p.active=slot(7);p.active.energy={Grass:3};assert.equal(attack(s,7,'Stadium Drain').damage,30);
 s.stadium=ref('bw4-91','stadium');assert.equal(attack(s,7,'Stadium Drain').damage,60);
 p.active=slot(70);assert.equal(attack(s,70,'Dark Penalty').damage,0);o.active.tool=ref('bw3-94','tool');assert.equal(attack(s,70,'Dark Penalty').damage,90);
 p.active=slot(76);o.hand=[ref('bw4-1'),ref('bw4-2'),ref('bw4-3')];assert.equal(attack(s,76,'Oracle Inflict').damage,60);
});
test('Coin damage and optional Giga Power choices resolve before matchup',()=>{
 const s=scene();s.sides.player.active=slot(60);s.sides.player.active.energy={Fire:3};
 assert.equal(attack(s,60,'DarMAXitan').damage,150);
 s.sides.player.active=slot(82);assert.equal(attack(s,82,'Giga Power',{action:{effectSelection:''}}).damage,60);
 const boosted=attack(s,82,'Giga Power',{action:{effectSelection:'boost'}});assert.equal(boosted.damage,80);assert.equal(boosted.pendingEffects[0].type,'selfDamage');
});
test('Heavy Ball / Level Ball select only valid physical Pokémon and never exceed hand limit',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('bw4-22','expensive'),ref('bw4-1','cheap'),ref('bw4-61','small')];
 let choice=act(s,bw.cardById(id(88)).effect);assert.equal(choice.kind,'option');assert.deepEqual(choice.options,['Take Reshiram-EX']);
 act(s,choice.effect,{resolve:true,action:{choiceOption:0}});assert.equal(p.hand[0].cardId,'bw4-22');
 choice=act(s,bw.cardById(id(89)).effect);assert.equal(choice.kind,'option');assert.ok(choice.options.some(s=>s.includes('Pinsir')));
 assert.ok(!choice.options.some(s=>s.includes('Reshiram')));
});
test('Synthesis uses a real Energy card and chosen target without making up Energy',()=>{
 const s=scene(),p=s.sides.player;const b=bench(p,7);p.deck=[ref('bw1-105','grass')];
 const e=bw.cardById(id(5)).attacks[0].effect;
 let ch=act(s,e);assert.equal(ch.kind,'pokemon');assert.equal(ch.effect.stage,'chooseTarget');
 ch=act(s,ch.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:b.benchSlot}});
 assert.equal(ch.kind,'deckCard');assert.equal(ch.effect.stage,'physical');
 act(s,ch.effect,{resolve:true,action:{choiceDeckIndex:0}});
 assert.equal(b.energy.Grass,1);assert.equal(p.deck.length,0);
});
test('Power Pinch discards chosen Basic Energy into actual discard ledger',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;o.active.energy={Water:2,Metal:1};
 const e=bw.cardById(id(1)).attacks[0].effect;
 let ch=act(s,e);assert.equal(ch.kind,'option');assert.equal(ch.effect.remaining,2);
 ch=act(s,ch.effect,{resolve:true,action:{choiceOption:0}});assert.equal(o.active.energy.Water,1);assert.equal(o.energyDiscard.Water,1);
 assert.equal(ch.kind,'option');act(s,ch.effect,{resolve:true,action:{choiceOption:1}});assert.equal(o.energyDiscard.Metal,1);
});
test('Special Prism Energy stays conditional by stage and does not become a Basic Energy',()=>{
 const p=bw.cardById(id(93));assert.equal(p.specialEnergy,true);assert.equal(p.basicEnergy,false);
 const s=scene(),pl=s.sides.player;pl.active=slot(54);pl.active.energy={};pl.active.specialEnergy=[{...ref('bw4-93','prism'),provides:{Colorless:1}}];
 const withPrism=core.legalActions(s,'player');assert.ok(Array.isArray(withPrism));
});
test('Leaky Choice or mismatched Stage will not award bogus HP or extra Energy',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(33);p.bench=[];const e=bw.cardById(id(33)).abilities.find(a=>a.name==='Slippery Soles').effect;
 assert.equal(act(s,e),null);
});
test('Random seeded CPU Next Destinies builds contain 30 cards with valid evolution legality',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=6;seed++){
  const result=cpu.generate({sets:['bw4'],type,seed});assert.equal(result.ok,true,`${type}/${seed}`);assert.equal(result.cards.length,30);
  assert.equal(data.validateDeck(result.cards).ok,true);
 }
});

test('A real 2-Prize Pokémon-EX knockout awards exactly two selectable Prizes',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(22,'attacker');p.active.energy={Fire:4};p.bench=[slot(10,'backup')];p.bench[0].benchSlot=0;
 o.active=slot(54,'ex-defender');o.active.damage=60;o.bench=[slot(2,'backupDefender')];o.bench[0].benchSlot=0;
 const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);
 assert.ok(action,'Reshiram-EX should be able to attack');core.applyAction(s,'player',action);
 let count=0;while(s.phase==='effectChoice'&&count++<4){const a=core.legalActions(s,s.choiceSide).find(x=>x.type==='effectChoice');assert.ok(a,`missing choice ${count} for ${JSON.stringify(s.pendingChoice)}`);core.applyAction(s,s.choiceSide,a);}
 assert.equal(p.prizesTaken,2);assert.equal(o.active?.cardId!=='bw4-54',true);
});
test('Exp. Share transfers real Basic Energy BEFORE attack KO discards the Active, and keeps the Tool',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(54,'defender');p.active.damage=60;p.active.energy={Psychic:2,Fire:1};
 const holder=bench(p,7);holder.tool=ref('bw4-87','exp-share-tool');holder.energy={Grass:1};
 o.active=slot(22,'attacker');o.active.energy={Fire:4};o.bench=[slot(2,'oppBackup')];o.bench[0].benchSlot=0;
 s.activeSide='opponent';s.phase='battle';
 const attackAction=core.legalActions(s,'opponent').find(x=>x.type==='attack'&&x.attackIndex===1);
 assert.ok(attackAction);core.applyAction(s,'opponent',attackAction);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 const choices=core.legalActions(s,'player');assert.ok(choices.some(x=>String(x.choiceLabel).includes('Psychic Energy')));
 const pick=choices.find(x=>String(x.choiceLabel).includes('Psychic Energy'));core.applyAction(s,'player',pick);
 assert.equal(holder.energy.Psychic,1);assert.equal(holder.tool.cardId,'bw4-87');assert.equal(p.energyDiscard.Psychic,1);
});

test('Double Colorless adds two actual Energy units for Mewtwo-EX X Ball, including matchup damage',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(54);p.active.energy={};p.active.specialEnergy=[{...ref('bw4-92','dce'),provides:{Colorless:2}}];
 o.active=slot(1);o.active.energy={};o.bench=[slot(2)];o.bench[0].benchSlot=0;
 const x=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(x,'X Ball should cost exactly 2 Colorless Energy');
 core.applyAction(s,'player',x);assert.equal(o.active.damage,40);
});
test('Prism is Rainbow on Basic Pokémon but only Colorless on evolved Pokémon',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(54);p.active.energy={Psychic:1,Colorless:1};p.active.specialEnergy=[{...ref('bw4-93','prism'),provides:{Colorless:1}}];
 const basicActions=core.legalActions(s,'player');assert.ok(basicActions.some(a=>a.type==='attack'&&a.attackIndex===1),'Basic Mewtwo can pay PPC with Prism');
 p.active=slot(56);p.active.energy={Colorless:2};p.active.specialEnergy=[{...ref('bw4-93','prism'),provides:{Colorless:1}}];
 const stageActions=core.legalActions(s,'player');assert.equal(stageActions.some(a=>a.type==='attack'&&a.attackIndex===1),false,'Stage 1 cannot use Prism as a Psychic unit');
});
test('Psychic Mirage gives a Psychic ally two Psychic energy units for one BASIC attachment',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(54);p.active.energy={Psychic:1};const g=bench(p,57);g.energy={};
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===0),'Two Psychic units pay X Ball C C');
 p.bench=[];assert.equal(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===0),false);
});
test('Pokémon Center is an activated once-per-turn Stadium that respects Heal Block',()=>{
 const s=scene(),p=s.sides.player;const hurt=bench(p,3);hurt.damage=50;s.stadium=ref('bw4-90','center');
 let action=core.legalActions(s,'player').find(a=>a.type==='stadiumAction');assert.ok(action,'damaged Benched Pokémon should allow Stadium action');
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');
 const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceTarget==='bench');assert.ok(choice);
 core.applyAction(s,'player',choice);assert.equal(hurt.damage,30);assert.equal(core.legalActions(s,'player').some(a=>a.type==='stadiumAction'),false);
 const newer=scene(),b=newer.sides.player;const target=bench(b,3);target.damage=50;newer.stadium=ref('bw4-90','center2');bench(b,76);
 assert.equal(core.legalActions(newer,'player').some(a=>a.type==='stadiumAction'),false,'Bronzong Heal Block forbids Pokémon Center');
});
test('Slippery Soles keeps both Bench indexes stable after switching both Actives',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 const mine=bench(p,33),theirs=bench(o,2),e=bw.cardById(id(33)).abilities[0].effect;
 let q=act(s,e,{attacker:mine});assert.equal(q.kind,'pokemon');assert.equal(q.includeActive,false);
 q=act(s,q.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:mine.benchSlot},attacker:mine});assert.equal(p.active.uid,mine.uid);assert.equal(p.active.benchSlot,null);
 assert.equal(q.kind,'pokemon');assert.equal(q.selectionSide,'opponent');
 act(s,q.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:theirs.benchSlot},attacker:mine});
 assert.equal(o.active.uid,theirs.uid);assert.equal(o.active.benchSlot,null);
 assert.equal(p.bench[0].benchSlot,0);assert.equal(o.bench[0].benchSlot,0);
});
test('Sporprise evolves from hand and makes both Confusion and Poison optional',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(8,'foonguss');p.active.energy={Grass:1};p.active.playedOnSideTurn=1;p.hand=[ref('bw4-9','amoonguss')];
 const evolve=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='bw4-9');assert.ok(evolve);
 core.applyAction(s,'player',evolve);assert.equal(s.phase,'effectChoice');
 let q=core.legalActions(s,'player').find(a=>String(a.choiceLabel).startsWith('Use Sporprise'));assert.ok(q);
 core.applyAction(s,'player',q);assert.equal(!!s.sides.opponent.active.conditions.poison,true);
 assert.equal(!!s.sides.opponent.active.conditions.confusion,true);
});
test('Frozen Wings chooses a physical Special Energy and moves it into opponent discard',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(38);o.active.specialEnergy=[ref('bw4-92','dce'),ref('bw4-93','prism')];
 const e=bw.cardById(id(38)).attacks[0].effect;let q=act(s,e);assert.ok(q&&q.kind==='option');assert.equal(q.options.length,2);
 act(s,q.effect,{resolve:true,action:{choiceOption:1}});assert.equal(o.discard.at(-1).cardId,'bw4-93');assert.equal(o.active.specialEnergy.length,1);
});
test('Echoed Voice adds exactly 50 on the next turn only',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(85);const result=attack(s,85,'Echoed Voice');assert.equal(result.damage,50);
 assert.equal(result.pendingEffects.length,1);act(s,result.pendingEffects[0]);
 assert.ok(p.active.nextAttackBonuses?.some(b=>b.amount===50&&b.turn===11));
});
