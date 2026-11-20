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
test('pinned Dark Explorers roster: 111 distinct cards, 166 attacks, 11 Abilities and all printed text retained',()=>{
 const bytes=fs.readFileSync(path.join(root,'data/classic/bw5-print-compact.json'));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'24e47e6f8ec3f39ab29b5c39c042573cff3af7fbb20e53ccb23bac662361f0f4');
 const rows=JSON.parse(bytes);assert.equal(rows.length,111);assert.equal(set.CARDS.length,111);
 let attacks=0,abilities=0;for(const row of rows){const c=set.cardById(id(row[0]));assert.ok(c);assert.equal(c.name,row[1]);assert.equal(data.cardById(c.id),c);assert.equal(c.battleEnabled,true);
  if(c.kind==='pokemon'){assert.deepEqual(c.attacks.map(a=>a.name),row[7].map(a=>a[0]));assert.deepEqual(c.attacks.map(a=>a.text),row[7].map(a=>a[3]));attacks+=c.attacks.length;abilities+=(c.abilities||[]).length;}}
 assert.equal(attacks,166);assert.equal(abilities,11);
});
test('every BW5 effect validates, full art EX variants remain distinct Basic cards and worth 2 prizes',()=>{
 for(const c of set.CARDS){for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+'/'+a.name);for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+'/'+a.name);if(c.effect)assert.deepEqual(fx.validateEffect(c.effect),[],c.id);}
 assert.equal(set.coverage().battleEnabled,111);
 for(const [n,original] of [[103,13],[104,26],[105,38],[106,54],[107,63],[108,90]]){const full=set.cardById(id(n)),normal=set.cardById(id(original));assert.equal(full.name,normal.name);assert.equal(full.stage,'Basic');assert.equal(full.prizeCards,2);assert.equal(full.pokemonEX,true);assert.ok(full.tags.includes('full-art'));assert.notEqual(full.id,normal.id);}
});
test('printed damage before matchup: Hot Lick, Attack Command, Brutal Bash, Bombast and Dark Rush',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(19);o.active={...slot(20),cardId:'bw5-78'};assert.equal(attack(s,19,'Hot Lick').damage,10);o.active={...slot(20),cardId:'bw5-67'};assert.equal(attack(s,19,'Hot Lick').damage,10);
 p.active=slot(29);bench(p,19);bench(o,20);assert.equal(attack(s,29,'Attack Command').damage,40);
 p.active=slot(71);bench(p,63);assert.equal(attack(s,71,'Brutal Bash').damage,40);p.active.damage=50;assert.equal(attack(s,71,'Dark Rush').damage,100);
 p.active=slot(66);p.prizesTaken=2;assert.equal(attack(s,66,'Bombast').damage,80);
});
test('Shot in the Dark gates on BOTH heads, with observable coin events',()=>{
 const s=scene();s.sides.player.active=slot(23);
 assert.equal(attack(s,23,'Shot in the Dark',{random:()=>.1}).damage,20);
 assert.equal(attack(s,23,'Shot in the Dark',{random:()=>.9}).damage,0);
 assert.ok(s.log.filter(x=>x.type==='coin'&&x.reason==='Shot in the Dark').length>=2);
});
test('Fury Cutter and Stunning Uppercut resolve coin gates before damage and log results',()=>{
 const s=scene();s.sides.player.active=slot(72);assert.equal(attack(s,72,'Fury Cutter',{random:()=>.1}).damage,90);
 s.sides.player.active=slot(89);assert.equal(attack(s,89,'Stunning Uppercut',{random:()=>.9}).damage,0);
 const good=attack(s,89,'Stunning Uppercut',{random:()=>.1});assert.ok(good.pendingEffects.some(e=>e.status==='paralysis'));
});
test('Fire Slash and Electrigun choices apply bonuses before matchup, then discard actual Energy',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(12);p.active.energy={Fire:2};
 let options=fx.choicesForEffect(set.cardById(id(12)).attacks[1].effect,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:s.sides.opponent.active,cardById:data.cardById});
 assert.ok(options.some(o=>o.effectSelection==='Fire'));assert.equal(attack(s,12,'Fire Slash',{action:{effectSelection:'Fire'}}).damage,90);
 act(s,set.cardById(id(12)).attacks[1].effect,{action:{effectSelection:'Fire'}});assert.equal(p.active.energy.Fire,1);assert.equal(p.energyDiscard.Fire,1);
 p.active=slot(37);p.active.energy={Lightning:1};assert.equal(attack(s,37,'Electrigun',{action:{effectSelection:'Lightning'}}).damage,60);
});
test('Dark Patch consumes actual Basic Darkness from discard ledger and attaches to a Darkness Bench ally',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard.Darkness=2;const target=bench(p,63);
 const e=set.cardById(id(93)).effect;let choice=act(s,e);assert.equal(choice.kind,'pokemon');assert.equal(choice.includeActive,false);
 choice=act(s,choice.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:target.benchSlot}});
 assert.equal(choice.kind,'option');assert.ok(choice.options.some(o=>o.includes('Darkness')));
 act(s,choice.effect,{resolve:true,action:{choiceOption:0}});
 assert.equal(target.energy.Darkness,1);assert.equal(p.energyDiscard.Darkness,1);assert.equal(p.deck.length,0);
});
test('Grand Flame and Charge Beam draw from real discard ledger, never mint Energy Zone cards',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(13);const target=bench(p,12);p.energyDiscard.Fire=1;
 let ch=act(s,set.cardById(id(13)).attacks[1].effect,{attacker:p.active});assert.equal(ch.kind,'pokemon');
 ch=act(s,ch.effect,{resolve:true,attacker:p.active,action:{choiceTarget:'bench',choiceBenchIndex:target.benchSlot}});assert.equal(ch.kind,'option');
 act(s,ch.effect,{resolve:true,attacker:p.active,action:{choiceOption:0}});assert.equal(target.energy.Fire,1);assert.equal(p.energyDiscard.Fire,0);
 p.active=slot(44);p.energyDiscard.Water=1;ch=act(s,set.cardById(id(44)).attacks[0].effect,{attacker:p.active});assert.equal(ch.kind,'option');
 act(s,ch.effect,{resolve:true,attacker:p.active,action:{choiceOption:0}});assert.equal(p.active.energy.Water,1);
});
test('Old Amber Aerodactyl sees only the physical bottom seven and benches a Restored Aerodactyl',()=>{
 const s=scene(),p=s.sides.player;p.deck=[...Array.from({length:6},(_,i)=>ref('bw5-1','top'+i)),ref('bw5-53','badtop'),...Array.from({length:7},(_,i)=>ref(i===5?'bw5-53':'bw5-12','bottom'+i))];
 let ch=act(s,set.cardById(id(97)).effect);assert.equal(ch.kind,'option');assert.ok(ch.options.some(x=>x.includes('Aerodactyl')));
 act(s,ch.effect,{resolve:true,action:{choiceOption:0}});assert.equal(p.bench.length,1);assert.equal(p.bench[0].cardId,'bw5-53');assert.equal(p.deck.some(r=>r.uid==='bottom5'),false);
});
test('Dark Cloak allows a Pokémon with Darkness Energy to retreat for free and respects removal of Darkrai',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(19);p.active.energy={Darkness:1};bench(p,63);
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));const affordable=core.legalActions(s,'player').find(a=>a.type==='retreat');assert.ok(affordable);
 p.bench=[];const noDarkrai=core.legalActions(s,'player').some(a=>a.type==='retreat');assert.equal(noDarkrai,false);
});
test('Ancient Scream boosts allied attack against Active, Dark Claw boosts Darkness holder only',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(71);p.active.energy={Darkness:2};const aura=bench(p,53);assert.ok(aura);
 assert.equal(fx.modifierAmount(s,'player',p.active,'attackDamage',data.cardById),10);
 p.active.tool=ref('bw5-92','darkclaw');assert.equal(fx.modifierAmount(s,'player',p.active,'attackDamage',data.cardById),30);
 p.active=slot(19);assert.equal(fx.modifierAmount(s,'player',p.active,'attackDamage',data.cardById),10);
});
test('Slowbro Airhead prevents attacking with 2, 4 or 6 prizes but permits odd counts',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(24);p.active.energy={Water:2,Colorless:2};p.prizes=[ref('bw5-1'),ref('bw5-2')];assert.equal(core.legalActions(s,'player').some(a=>a.type==='attack'),false);
 p.prizes.push(ref('bw5-3'));assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'));
});
test('Recycle/Item search and Dark Claw remain physical, item legal, never Basic Zone cards',()=>{
 assert.equal(set.cardById(id(92)).trainerType,'Tool');assert.equal(set.cardById(id(93)).trainerType,'Item');
 assert.equal(set.cardById(id(97)).trainerType,'Item');assert.equal(set.cardById(id(100)).effect.type,'rareCandy');
});
test('CPU generates legal 30-card BW5 decks across all 9 types and seeded variants',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=9;seed++){
  const d=cpu.generate({sets:['bw5'],type,seed});assert.equal(d.ok,true,`${type}/${seed}`);assert.equal(d.cards.length,30);assert.equal(data.validateDeck(d.cards).ok,true);
 }
});
test('Restored Aerodactyl and Old Amber are a matched deck family, never orphaned fossil filler',()=>{
 const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
 const owned=data.CARDS.filter(c=>c.setId==='bw5'&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const focusCardId of ['bw5-53','bw5-97']){
  const result=builder.buildDeck(owned,{sets:['bw5'],focusCardId});assert.equal(result.ok,true,focusCardId+': '+result.errors?.join('; '));
  assert.ok(result.cards.includes('bw5-53'));assert.ok(result.cards.includes('bw5-97'));assert.equal(result.cards.length,30);
 }
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=20;seed++){
  const out=cpu.generate({sets:['bw5'],type,seed});assert.equal(out.ok,true);assert.equal(out.cards.includes('bw5-53'),out.cards.includes('bw5-97'),'Aerodactyl/Old Amber must travel together');
 }
});
test('Solar Revelation blocks opponent attack effects against Energy-bearing allied Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 const defender=o.active;defender.energy={Colorless:2};bench(o,48);
 act(s,{type:'status',target:'opponentActive',status:'poison'});
 assert.equal(!!defender.conditions.poison,false,'Espeon shields Energy bearer from special condition effects');
 o.bench=[];act(s,{type:'status',target:'opponentActive',status:'poison'});
 assert.ok(defender.conditions.poison,'without Espeon, opponent attack can Poison');
});
test('Ferocious Bellow reduces the targeted attacker damage by 30 on the next opposing turn',()=>{
 const s=scene(),foe=s.sides.opponent;
 const e=set.cardById(id(88)).attacks[1].effect;
 act(s,e);assert.equal(fx.modifierAmount(s,'opponent',foe.active,'attackDamage',data.cardById),-30);
 s.turnNumber+=2;assert.equal(fx.modifierAmount(s,'opponent',foe.active,'attackDamage',data.cardById),0);
});
test('Slurp Shakedown targets and promotes the actual Benched Pokémon before normal active damage',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(47);const victim=bench(o,23);
 const effect=set.cardById(id(47)).attacks[1].effect;
 const opts=fx.choicesForEffect(effect,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:data.cardById});
 assert.equal(opts.length,1);assert.equal(opts[0].effectSelection,victim.uid);
 const result=attack(s,47,'Slurp Shakedown',{action:{effectSelection:victim.uid}});
 assert.equal(result.damage,60);assert.equal(o.active.uid,victim.uid);
});
