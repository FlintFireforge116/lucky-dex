'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js')),set=require(path.join(assets,'tcg-classic-dragons-exalted.js')),fx=require(path.join(assets,'tcgp-battle-effects.js')),core=require(path.join(assets,'tcgp-battle-core.js')),cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const id=n=>'bw6-'+n,ref=(cardId,uid)=>({cardId,uid:uid||cardId}),slot=(n,uid)=>core.makePokemonSlot(id(n),4,uid||'slot-'+n);
function scene(){const deck=cpu.generate({sets:['bw6'],type:'Dragon',seed:37});assert.ok(deck.ok,'Dragon CPU deck builds');const s=core.createBattle({format:'classic',seed:37,firstSide:'player',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal'],opponentEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];s.stadium=null;s.modifiers=[];
 for(const [side,p] of Object.entries(s.sides)){p.turnCount=4;p.active=slot(side==='player'?85:110,side+'-active');p.active.energy={Fire:2,Lightning:2};p.bench=[];p.hand=[];p.deck=[];p.discard=[];p.energyDiscard={};p.lostZone=[];p.energySupply=[];p.prizes=[ref('bw6-1','prize-'+side+'-1'),ref('bw6-2','prize-'+side+'-2'),ref('bw6-3','prize-'+side+'-3')];p.prizesTaken=0;}
 return s;}
function bench(ss,n,uid){const p=slot(n,uid||'bench-'+ss.bench.length);p.benchSlot=ss.bench.length;ss.bench.push(p);return p;}
function apply(s,e,{action={},resolve=false,attacker=s.sides.player.active,defender=s.sides.opponent.active,random=()=>.1}={}){
 let choice=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker,defender,cardById:data.cardById,action,resolvingChoice:resolve,isAttack:true,random,
  requestChoice:c=>choice=c,shuffle:(_s,deck)=>deck.reverse(),drawCard:ss=>{const ref=ss.deck.shift();if(ref&&ss.hand.length<Number(ss.handLimit||8))ss.hand.push(ref);return ref;},
  onEnergyAttached:()=>{},maxHp:(_who,p)=>data.cardById(p?.cardId)?.hp||100});return choice;
}
function atk(s,n,name,{random=()=>.1,action={}}={}){const attack=set.cardById(id(n)).attacks.find(a=>a.name===name);assert.ok(attack,`${n}:${name}`);
 return fx.resolveAttack(attack,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,random,isAttack:true,
  effectiveEnergy:p=>core.effectiveEnergy(s,pokemonSide(s,p),p),retreatCost:side=>data.cardById(s.sides[side].active.cardId).retreat,maxHp:(side,p)=>core.maxHp(s,side,p)});}
function pokemonSide(s,p){return [...[s.sides.player.active,...s.sides.player.bench]].includes(p)?'player':'opponent';}
test('128 distinct verified prints, Dragon type, two EX prizes, full arts and 20 Ability entries',()=>{
 assert.equal(set.CARDS.length,128);assert.equal(new Set(set.CARDS.map(c=>c.id)).size,128);
 assert.ok(set.CARDS.every(c=>c.battleEnabled));assert.equal(set.CARDS.reduce((n,c)=>n+(c.attacks||[]).length,0),200);
 assert.equal(set.CARDS.reduce((n,c)=>n+(c.abilities||[]).length,0),20);
 for(const n of [22,46,71,81,85,92,119,120,121,122,123,124]){assert.equal(set.cardById(id(n)).prizeCards,2);}assert.ok(set.cardById(id(85)).types.includes('Dragon'));
 assert.equal(set.cardById(id(48)).noPrize,true);
});
test('Dragon Blend Energy is ONE restricted unit and still pays Colorless costs',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(85);p.active.energy={};p.active.specialEnergy=[ref('bw6-117','blend')];
 const v=core.effectiveEnergy(s,'player',p.active);assert.equal(v.Crystal,1);assert.equal(v.Colorless||0,0);assert.equal(v.__crystalAllowed.Fire,true);assert.equal(v.__crystalAllowed.Water,undefined);
 assert.ok(fx.canPayCost(v,'R'));assert.ok(fx.canPayCost(v,'C'));assert.ok(!fx.canPayCost(v,'W'));assert.ok(!fx.canPayCost(v,'RL'));
 p.active.specialEnergy=[ref('bw6-118','blend2')];const w=core.effectiveEnergy(s,'player',p.active);assert.ok(fx.canPayCost(w,'W'));assert.ok(!fx.canPayCost(w,'R'));
});
test('Dragon Burst offers Fire and Lightning choices and uses precise multiplier',()=>{
 const s=scene();s.sides.player.active=slot(85);s.sides.player.active.energy={Fire:2,Lightning:1};
 const e=set.cardById(id(85)).attacks.find(a=>a.name==='Dragon Burst').effect;
 const actions=fx.choicesForEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById});
 assert.deepEqual(actions.map(x=>x.effectSelection),['Fire','Lightning']);assert.equal(atk(s,85,'Dragon Burst',{action:{effectSelection:'Fire'}}).damage,120);
 const r=atk(s,85,'Dragon Burst',{action:{effectSelection:'Lightning'}});assert.equal(r.damage,60);
 apply(s,r.pendingEffects[0]);assert.equal(s.sides.player.active.energy.Lightning,0);assert.equal(s.sides.player.energyDiscard.Lightning,1);
 assert.equal(s.sides.player.active.energy.Fire,2);
});
test('Garbodor Tool suppresses both players Abilities; removing Tool restores them',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;const garb=bench(o,54,'garb');garb.tool=ref('bw6-114','cape');const alt=bench(p,84,'altaria');
 assert.equal(fx.abilitiesSuppressed(s,'player',alt,data.cardById),true);
 assert.equal(fx.abilitiesSuppressed(s,'opponent',garb,data.cardById),false);
 garb.tool=null;assert.equal(fx.abilitiesSuppressed(s,'player',alt,data.cardById),false);
});
test('Altaria Fight Song provides +20 Dragon damage, not non-Dragon, and is suppressible',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;const alt=bench(p,84,'alt');p.active=slot(85);o.active=slot(110);
 assert.equal(fx.modifierAmount(s,'player',p.active,'attackDamage',data.cardById),20);
 p.active=slot(110);assert.equal(fx.modifierAmount(s,'player',p.active,'attackDamage',data.cardById),0);
 bench(o,54,'garb').tool=ref('bw6-114','tool');p.active=slot(85);assert.equal(fx.modifierAmount(s,'player',p.active,'attackDamage',data.cardById),0);
});
test('Sigilyph blocks Pokémon-EX attack damage and effects while Ability active',()=>{
 const s=scene(),o=s.sides.opponent;o.active=slot(52);s.sides.player.active=slot(85);
 assert.ok(fx.attackIsPrevented(s,'opponent',o.active,s.sides.player.active,data.cardById));
 assert.equal(fx.attackEffectsPrevented(s,'opponent',o.active,s.sides.player.active,data.cardById),true);
 s.sides.player.active=slot(110);assert.equal(!!fx.attackIsPrevented(s,'opponent',o.active,s.sides.player.active,data.cardById),false);
});
test('Bouffalant Bouffer subtracts 20 damage, Slaking Unobservant blocks Basic target',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(103);o.active=slot(85);
 assert.equal(fx.passiveAttackAllowed(s,'player',p.active,data.cardById),false);
 o.active=slot(84);assert.equal(fx.passiveAttackAllowed(s,'player',p.active,data.cardById),true);
 p.active=slot(110);assert.equal(fx.modifierAmount(s,'player',p.active,'damageReduction',data.cardById),20);
});
test('Shedinja Empty Shell no-prize metadata; Rescue Scarf grants 20 HP only via Cape',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(48);assert.equal(data.cardById('bw6-48').noPrize,true);
 p.active=slot(85);const h=core.maxHp(s,'player',p.active);p.active.tool=ref('bw6-114','cape');assert.equal(core.maxHp(s,'player',p.active),h+20);
 p.active.tool=ref('bw6-115','scarf');assert.equal(core.maxHp(s,'player',p.active),h);
});
test('Mew-EX Versatile borrows in-play Pokémon attacks, including opponent attacks, but not discard',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(46);bench(p,85);o.active=slot(110);p.discard.push(ref('bw6-81','unavailable'));
 const options=core.attackOptions(s,'player');
 assert.ok(options.some(x=>x.cardId==='bw6-85'&&x.attack.name==='Dragon Burst'));
 assert.ok(options.some(x=>x.cardId==='bw6-110'&&x.attack.name==='Gold Breaker'));
 assert.ok(!options.some(x=>x.cardId==='bw6-81'));
 bench(o,54,'garb').tool=ref('bw6-114','lock');assert.ok(!core.attackOptions(s,'player').some(x=>x.cardId==='bw6-85'));
});
test('Energy Crush counts all opponent Energy units and Shadow Steal only physical discarded Special Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(43);o.active=slot(110);o.active.energy={Fire:2};const a=bench(o,85);a.energy={Lightning:1};
 assert.equal(atk(s,43,'Energy Crush').damage,60);
 p.active=slot(51);o.discard=[ref('bw4-92','special'),ref('bw6-117','blend'),ref('bw1-105','basic'),ref('bw6-1','mon')];o.energyDiscard.Fire=5;
 assert.equal(atk(s,51,'Shadow Steal').damage,100);
});
test('Gold Breaker gets EX bonus, Superpower optional choice is 70 or 90 plus recoil',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(110);o.active=slot(85);assert.equal(atk(s,110,'Gold Breaker').damage,120);
 o.active=slot(84);assert.equal(atk(s,110,'Gold Breaker').damage,60);
 p.active=slot(68);assert.equal(atk(s,68,'Superpower').damage,70);
 const stronger=atk(s,68,'Superpower',{action:{effectSelection:'boost'}});assert.equal(stronger.damage,90);assert.equal(stronger.pendingEffects[0]?.amount,20);
});
test('Rainbow Burn sees different Basic Energy types, even with multiple cards of the same type',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(22);p.active.energy={Fire:3,Grass:1};assert.equal(atk(s,22,'Rainbow Burn').damage,60);
});
test('Doom Decree two coin results select real KO instead of unsupported effect',()=>{
 const s=scene();s.sides.player.active=slot(57);
 const r=atk(s,57,'Doom Decree',{random:()=>.1});assert.equal(r.pendingEffects[0]?.type,'knockOut');
 assert.ok(s.log.some(e=>e.type==='coin'&&e.results.length===2));
});
test('Harden prevents <=60 final damage; >60 damage proceeds',()=>{
 const s=scene(),o=s.sides.opponent;o.active=slot(7);o.active.bw6HardenUntil=s.turnNumber;
 const attacker=s.sides.player.active;assert.equal(fx.attackDamageWithState(s,'player',attacker,'opponent',o.active,50,data.cardById),0);
 assert.equal(fx.attackDamageWithState(s,'player',attacker,'opponent',o.active,70,data.cardById),70);
});
test('Tool Scrapper removes a first Tool and offers optional second Tool',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(85);o.active=slot(110);
 p.active.tool=ref('bw6-114','cape');o.active.tool=ref('bw6-115','scarf');
 const e=set.cardById(id(116)).effect;let ch=apply(s,e);assert.equal(ch.kind,'option');assert.equal(ch.options.length,2);
 ch=apply(s,ch.effect,{action:{choiceOption:0},resolve:true});assert.equal(p.active.tool,null);assert.equal(ch.kind,'option');assert.ok(ch.options[0].includes('Stop'));
 apply(s,ch.effect,{action:{choiceOption:1},resolve:true});assert.equal(o.active.tool,null);
 assert.ok(p.discard.some(r=>r.uid==='cape'));assert.ok(o.discard.some(r=>r.uid==='scarf'));
});
test('Dark Trance moves Basic Darkness or matching Blend Special Energy, no free Energy',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(97);p.active.energy={Darkness:1};p.active.specialEnergy=[ref('bw6-117','blend')];const d=bench(p,110,'target');
 const e=set.cardById(id(97)).abilities[0].effect;let ch=apply(s,e);assert.equal(ch.kind,'option');assert.ok(ch.options.length>=2);
 ch=apply(s,ch.effect,{resolve:true,action:{choiceOption:1}});assert.equal(ch.kind,'pokemon');
 apply(s,ch.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(d.specialEnergy.length,1);assert.equal(p.active.specialEnergy.length,0);
});
test('Dynamotor-style draw-in consumes discarded Darkness, not Energy Zone, and preserves source accounting',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(96);p.active.energy={};p.energyDiscard.Darkness=2;p.energySupply=['Darkness'];
 const e=set.cardById(id(96)).attacks.find(a=>a.name==='Draw In').effect;
 let ch=apply(s,e);assert.equal(ch.kind,'option');ch=apply(s,ch.effect,{resolve:true,action:{choiceOption:0}});
 assert.equal(p.active.energy.Darkness,1);assert.equal(p.energyDiscard.Darkness,1);assert.deepEqual(p.energySupply,['Darkness']);
});
test('Mew and Dragon-type Battle deck generator passes 90 focused seeds',()=>{
 for(const t of ['Dragon','Fire','Lightning','Darkness','Psychic','Grass','Water','Metal','Fighting'])for(let seed=1;seed<=10;seed++){
  const g=cpu.generate({sets:['bw6'],type:t,seed});assert.ok(g.ok,`${t} ${seed}: ${g.reason}`);
  const valid=data.validateDeck(g.cards);assert.equal(valid.ok,true,`${t} ${seed}: ${JSON.stringify(valid)}`);
 }
});
test('Ho-Oh-EX Rebirth appears as a discard Ability, uses actual discard, and requires three different types',()=>{
 const s=scene(),p=s.sides.player;p.discard=[ref('bw6-22','hooh')];p.energyDiscard={Fire:1,Water:1,Lightning:1};p.bench=[];
 let acts=core.legalActions(s,'player');let a=acts.find(x=>x.type==='abilityDiscard');assert.ok(a,'Rebirth must be a legal action from discard');
 core.applyAction(s,'player',a);
 assert.equal(s.phase,'effectChoice');assert.ok(s.pendingChoice?.options?.some(x=>x.includes('Flip coin')));
 core.applyAction(s,'player',{type:'effectChoice',choiceOption:1});
 assert.ok(p.bench.some(x=>x.cardId==='bw6-22'),'successful Rebirth should place Ho-Oh on Bench');
 assert.ok(s.pendingChoice?.options?.some(x=>x.includes('Energy')),'three distinct Energy must be chosen');
 for(let i=0;i<3&&s.phase==='effectChoice';i++)core.applyAction(s,'player',{type:'effectChoice',choiceOption:0});
 assert.ok(p.bench[0].energy.Fire+p.bench[0].energy.Water+p.bench[0].energy.Lightning===3);
 assert.equal(Object.values(p.energyDiscard).reduce((a,b)=>a+b,0),0);
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='abilityDiscard'));
});
test('Rebirth is not offered when only two different basic Energy types were discarded',()=>{
 const s=scene(),p=s.sides.player;p.discard=[ref('bw6-22','hooh')];p.energyDiscard={Fire:3,Lightning:2};assert.ok(!core.legalActions(s,'player').some(x=>x.type==='abilityDiscard'));
});
test('Garbotoxin also blocks Ho-Oh Rebirth from discard until Tool is removed',()=>{
 const s=scene(),p=s.sides.player;p.discard=[ref('bw6-22','hooh')];p.energyDiscard={Fire:1,Lightning:1,Grass:1};
 const garb=bench(s.sides.opponent,54,'garb');garb.tool=ref('bw6-114','cape');
 assert.equal(core.legalActions(s,'player').some(x=>x.type==='abilityDiscard'),false);
 garb.tool=null;assert.equal(core.legalActions(s,'player').some(x=>x.type==='abilityDiscard'),true);
});
test('Celestial Roar reads actual physical deck cards and does not consume Energy Zone',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(85);p.active.energy={};p.energySupply=['Fire','Lightning','Water'];
 p.deck=[ref('bw1-106','fire'),ref('bw6-117','blend'),ref('bw6-1','mon')];
 const effect=set.cardById(id(85)).attacks[0].effect;apply(s,effect);
 assert.equal(p.active.energy.Fire,1);assert.equal(p.active.specialEnergy[0].uid,'blend');assert.ok(p.discard.some(x=>x.uid==='mon'));
 assert.deepEqual(p.energySupply,['Fire','Lightning','Water']);
});
test('Giant Cape and Rescue Scarf remain removable Tools, not Trainer cards in the Energy Zone',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(85);p.hand=[ref('bw6-114','cape')];
 const actions=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId==='bw6-114');assert.ok(actions.length);
 core.applyAction(s,'player',actions[0]);assert.equal(p.active.tool?.cardId,'bw6-114');
});
test('Real Battle: Rayquaza-EX Dragon Burst awards the correct two selectable Prizes',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(85);p.active.energy={Fire:3,Lightning:1};p.bench=[slot(84,'ally')];p.bench[0].benchSlot=0;
 o.active=slot(85,'victim-ex');o.active.energy={Fire:1};o.active.damage=0;o.bench=[slot(110,'replacement')];o.bench[0].benchSlot=0;
 const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.effectSelection==='Fire'&&a.attackCardId==='bw6-85');assert.ok(a,'Dragon Burst must offer Fire');
 core.applyAction(s,'player',a);
 assert.equal(p.active.energy.Fire,0);assert.ok(Number(p.energyDiscard.Fire)>=3);
 assert.ok((s.pendingPrizeClaims||[]).some(x=>x.side==='player'&&x.remaining===2)||p.prizesTaken>=2,'EX should award two prizes');
});
test('Dragon CPU archetype builds real Dragon Pokemon with legal mixed Basic Energy, not invented Dragon Energy',()=>{
 const g=cpu.generate({sets:['bw6'],type:'Dragon',seed:37});assert.ok(g.ok);
 assert.ok(g.cards.some(id=>data.cardById(id)?.types?.includes('Dragon')));
 assert.ok(g.energyTypes.every(t=>['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'].includes(t)));
 assert.ok(g.energyTypes.length>=2,'Dragon core should plan its two printed typed Energy requirements');
});
test('Real knockout: Rescue Scarf returns ONLY knocked-out Pokémon; Tools/Energy still discarded',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(85);p.active.energy={Fire:3,Lightning:1};o.active=slot(110,'scarf-target');o.active.energy={Metal:2};o.active.tool=ref('bw6-115','rescue-tool');bench(o,84,'reserve');
 const attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackCardId==='bw6-85'&&x.effectSelection==='Fire');assert.ok(attack);
 core.applyAction(s,'player',attack);
 assert.ok(o.hand.some(ref=>ref.cardId==='bw6-110'),'KO target goes to hand');
 assert.ok(o.discard.some(ref=>ref.uid==='rescue-tool'),'Tool is discarded');
 assert.ok(Number(o.energyDiscard.Metal||0)>=2,'attached Basic Energy goes to ledger');
});
test('Real knockout: Shedinja Empty Shell gives no Prize while a replacement remains',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot(85);p.active.energy={Fire:3,Lightning:1};o.active=slot(48,'shedinja');bench(o,110,'reserve');
 const before=p.prizesTaken;
 const attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackCardId==='bw6-85'&&x.effectSelection==='Fire');assert.ok(attack);
 core.applyAction(s,'player',attack);
 assert.equal(p.prizesTaken,before);
 assert.ok(!(s.pendingPrizeClaims||[]).some(x=>x.side==='player'));
 assert.ok(!o.active||o.active.cardId!=='bw6-48');
});
test('Ampharos Electromagnetic Wall triggers on opposing hand Energy, not the generated Energy Zone',()=>{
 const create=()=>{const s=scene();s.sides.player.active=slot(40,'wall');s.sides.player.active.energy={};
   s.sides.opponent.active=slot(85,'target');s.sides.opponent.active.energy={};s.sides.opponent.bench=[];
   s.activeSide='opponent';s.sides.opponent.hand=[ref('bw6-117','hand-blend')];return s;};
 const s=create();const action=core.legalActions(s,'opponent').find(x=>x.type==='attachSpecial'&&x.target==='active');
 assert.ok(action);core.applyAction(s,'opponent',action);assert.equal(s.sides.opponent.active.damage,30);
 assert.ok(s.log.some(x=>x.rule==='electromagneticWall'&&x.amount===30));
 const zone=create();zone.sides.opponent.hand=[];zone.sides.opponent.energyType='Fire';zone.sides.opponent.energyAvailable=true;
 const attach=core.legalActions(zone,'opponent').find(x=>x.type==='attach'&&x.target==='active');assert.ok(attach);
 core.applyAction(zone,'opponent',attach);assert.equal(zone.sides.opponent.active.damage,0);
 const blocked=create();bench(blocked.sides.opponent,54,'lock').tool=ref('bw6-114','garbotoxin-tool');
 const special=core.legalActions(blocked,'opponent').find(x=>x.type==='attachSpecial');assert.ok(special);
 core.applyAction(blocked,'opponent',special);assert.equal(blocked.sides.opponent.active.damage,0);
});
test('Leaf Tornado can redistribute the Grass-producing Blend Energy without creating a token',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(125,'serperior');p.active.energy={};p.active.specialEnergy=[ref('bw6-117','blend-move')];const target=bench(p,110,'recipient');
 const e=set.cardById(id(125)).attacks.find(x=>x.name==='Leaf Tornado').effect;
 let choice=apply(s,e);assert.equal(choice.kind,'energySource');
 choice=apply(s,choice.effect,{resolve:true,action:{choiceTarget:'active',effectSpecialEnergyUid:'blend-move'}});
 assert.equal(choice.kind,'pokemon');
 choice=apply(s,choice.effect,{resolve:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(p.active.specialEnergy.length,0);assert.equal(target.specialEnergy.length,1);
 assert.equal(target.specialEnergy[0].uid,'blend-move');assert.equal(choice.kind,'option');
});
