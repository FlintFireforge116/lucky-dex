/* Neo Discovery (75/75 numbered cards) — Classic TCG expansion.
 * Original numbered card identity and gameplay data: PokemonTCG/pokemon-tcg-data/cards/en/neo2.json.
 * Printed rules are represented by battle effects, not amended card artwork.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGNeoDiscovery=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'neo2',name:'Neo Discovery',series:'Neo',releaseDate:'2001-06-01',cardCount:75});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless',D:'Darkness',M:'Metal'};
const DATA=`1|Espeon|P|1|80|0|P||Eevee|Rare Holo|Bite~CC~20;Psychic~PPC~30+
2|Forretress|M|1|80|3|R|G|Pineco|Rare Holo|Rapid Spin~MCC~30
3|Hitmontop|F|0|60|1|P|||Rare Holo|Detect~F~;Triple Kick~FFF~30×
4|Houndoom|D|1|70|1||P|Houndour|Rare Holo|Crunch~DCC~30;Flamethrower~RRC~50
5|Houndour|R|0|50|1|W|||Rare Holo|Smog~R~10;Collect Fire~RR~20
6|Kabutops|W|2|90|2|G||Kabuto|Rare Holo|Slash~C~20;Hydrocutter~F~40×
7|Magnemite|M|0|40|1|R|G||Rare Holo|Lock-on~C~;Electric Bolt~LC~50
8|Politoed|W|2|100|3|G||Poliwhirl|Rare Holo|Doubleslap~WWCC~40×
9|Poliwrath|F|2|90|2|P||Poliwhirl|Rare Holo|Corkscrew Punch~FC~30;Submission~FFCC~70
10|Scizor|M|1|80|2|R|G|Scyther|Rare Holo|False Swipe~M~?;Double Claw~CCC~20+
11|Smeargle|C|0|50|1|F|P||Rare Holo|Sketch~CC~
12|Tyranitar|D|2|100|3||P|Pupitar|Rare Holo|Slam~CCC~30×;Trample~DDCC~50
13|Umbreon|D|1|80|1||P|Eevee|Rare Holo|Bite~CC~20;Feint Attack~DDC~
14|Unown [A]|P|0|40|1|P|||Rare Holo|Hidden Power~P~10
15|Ursaring|C|1|80|3|F|P|Teddiursa|Rare Holo|Headpress~CC~20;Double Lariat~CCCC~40×
16|Wobbuffet|P|0|90|3|P|||Rare Holo|Counter~P~
17|Yanma|G|0|60|0|R|F||Rare Holo|Shockwave~G~;Swift~GGG~30
18|Beedrill|G|2|80|0|R|F|Kakuna|Rare|Triple Poison~G~10;Pin Missile~GGC~20×
19|Butterfree|G|2|80|0|R|F|Metapod|Rare|Magic Dust~GC~20;Hyper Reverse~GGC~
20|Espeon|P|1|70|1|P||Eevee|Rare|Quick Attack~CC~10+;Psybeam~PPC~30
21|Forretress|M|1|80|3|R|G|Pineco|Rare|Rapid Spin~MCC~30
22|Hitmontop|F|0|60|1|P|||Rare|Detect~F~;Triple Kick~FFF~30×
23|Houndoom|D|1|70|1||P|Houndour|Rare|Crunch~DCC~30;Flamethrower~RRC~50
24|Houndour|R|0|50|1|W|||Rare|Smog~R~10;Collect Fire~RR~20
25|Kabutops|W|2|90|2|G||Kabuto|Rare|Slash~C~20;Hydrocutter~F~40×
26|Magnemite|M|0|40|1|R|G||Rare|Lock-on~C~;Electric Bolt~LC~50
27|Politoed|W|2|100|3|G||Poliwhirl|Rare|Doubleslap~WWCC~40×
28|Poliwrath|F|2|90|2|P||Poliwhirl|Rare|Corkscrew Punch~FC~30;Submission~FFCC~70
29|Scizor|M|1|80|2|R|G|Scyther|Rare|False Swipe~M~?;Double Claw~CCC~20+
30|Smeargle|C|0|50|1|F|P||Rare|Sketch~CC~
31|Tyranitar|D|2|100|3||P|Pupitar|Rare|Slam~CCC~30×;Trample~DDCC~50
32|Umbreon|D|1|70|1||P|Eevee|Rare|Quick Attack~CC~10+;Pursuit~DCC~30
33|Unown [A]|P|0|40|1|P|||Rare|Hidden Power~P~10
34|Ursaring|C|1|80|3|F|P|Teddiursa|Rare|Headpress~CC~20;Double Lariat~CCCC~40×
35|Wobbuffet|P|0|90|3|P|||Rare|Counter~P~
36|Yanma|G|0|60|0|R|F||Rare|Shockwave~G~;Swift~GGG~30
37|Corsola|W|0|50|1|G|||Uncommon|Recover~W~;Spike Cannon~FF~30×
38|Eevee|C|0|50|1|F|P||Uncommon|Smash Kick~C~10
39|Houndour|D|0|40|1||P||Uncommon|Bite~C~10;Plunder~DC~20
40|Igglybuff|C|0|30|0||||Uncommon|
41|Kakuna|G|1|70|2|R||Weedle|Uncommon|Secrete Poison~GG~
42|Metapod|G|1|70|2|R||Caterpie|Uncommon|Harden~CC~;Hatch~GG~
43|Omastar|F|2|80|2|G||Omanyte|Uncommon|Squeeze~W~10+;Spike Barrage~WWW~20+
44|Poliwhirl|W|1|70|1|G||Poliwag|Uncommon|Belly Drum~C~;Water Gun~WWC~30+
45|Pupitar|F|1|70|1|G|L|Larvitar|Uncommon|Skull Bash~CC~20;Dust Devil~FF~
46|Scyther|G|0|60|1|R|F||Uncommon|Fury Cutter~GG~10+
47|Unown [D]|P|0|40|1|P|||Uncommon|Hidden Power~P~10
48|Unown [F]|P|0|40|1|P|||Uncommon|Hidden Power~P~10
49|Unown [M]|P|0|40|1|P|||Uncommon|Hidden Power~P~10
50|Unown [N]|P|0|40|1|P|||Uncommon|Hidden Power~P~10
51|Unown [U]|P|0|40|1|P|||Uncommon|Hidden Power~P~10
52|Xatu|P|1|70|1|P|F|Natu|Uncommon|Energy Cycle~P~;Super Psy~PPC~50
53|Caterpie|G|0|50|1|R|||Common|Spin Tackle~C~20
54|Dunsparce|C|0|30|0|F|P||Common|Glare~C~10
55|Hoppip|G|0|30|0|R|F||Common|Rolling Tackle~G~20
56|Kabuto|W|1|50|1|G||Mysterious Fossil|Common|Work Together~FC~10+
57|Larvitar|F|0|40|1|G|L||Common|Bite~C~10
58|Mareep|L|0|50|1|F|||Common|Thunder Jolt~LC~30
59|Natu|P|0|40|1|P|F||Common|Confuse Ray~P~10
60|Omanyte|F|1|50|1|G||Mysterious Fossil|Common|Bind~W~10
61|Pineco|G|0|40|2|R|||Common|Burst~G~40
62|Poliwag|W|0|40|1|G|||Common|Rollout~C~10;Hypnosis~W~
63|Sentret|C|0|50|1|F|P||Common|Scout~C~;Tackle~CC~20
64|Spinarak|G|0|50|1|R|||Common|Poison Sting~GC~20
65|Teddiursa|C|0|40|1|F|P||Common|Scratch~C~10;Nap Time~CC~
66|Tyrogue|F|0|30|0||||Common|Smash Punch~C~30
67|Unown [E]|P|0|40|1|P|||Common|Hidden Power~P~10
68|Unown [I]|P|0|40|1|P|||Common|Hidden Power~P~10
69|Unown [O]|P|0|40|1|P|||Common|Hidden Power~P~10
70|Weedle|G|0|40|1|R|||Common|Spike Stab~G~20
71|Wooper|W|0|50|1|G|L||Common|Slime~W~;Tail Slap~CC~20
72|Fossil Egg||0||0||||Uncommon|
73|Hyper Devolution Spray||0||0||||Uncommon|
74|Ruin Wall||0||0||||Uncommon|
75|Energy Ark||0||0||||Common|`.trim().split('\n');
const noop={type:'noop'},par=status=>({type:'status',target:'opponentActive',status});
const coin=(heads,tails)=>({type:'coinFlip',heads:heads||noop,tails:tails||noop});
const seq=(...effects)=>({type:'sequence',effects}),bonus=n=>({type:'bonusDamage',amount:n}),
 multi=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'}),
 rule=name=>({type:'neoRule',rule:'discovery:'+name}),
 guard=(effects=true)=>({type:'preventDamage',target:'self',duration:'opponentTurn',effects}),
 gate=()=>({type:'coinAttackGate',heads:noop});
const ATTACK={},DESCRIPTIONS={};
function set(n,i,effect,description){ATTACK[n+':'+i]=effect;DESCRIPTIONS[n+':'+i]=description||'';}
// Main Pokémon, their alternate holo/non-holo prints share the same original move text.
set(1,1,{type:'energyDamage',source:'opponent',countCards:true,amount:10},'Add 10 for each Energy card attached to the defender.');
set(2,0,{type:'neoRule',rule:'rapidSpin'},'Deal damage; both sides choose a new Active Pokémon from Bench.');
set(3,0,coin(guard()),'Heads: prevent all effects of attacks next turn.');
set(3,1,multi(3,30),'Three flips; 30 damage per heads.');
set(4,0,{type:'neoRule',rule:'screech'},'Attacks against the defender deal 20 more damage through the end of your next turn.');
set(4,1,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true},'Discard one attached Fire Energy or this attack fails.');
set(5,0,coin(par('poison')),'Heads: poison the defender.');
set(5,1,rule('collectFire'),'Attach one Fire Energy from discard to Houndour if available.');
set(6,1,rule('hydrocutter'),'Flip up to three coins, one per attached Energy; 40 per heads.');
set(7,0,rule('lockOn'),'Next turn, Electric Bolt treats tails as heads while Magnemite remains Active.');
set(7,1,rule('electricBolt'),'Flip twice: both heads Paralyze; any tails means this attack misses.');
set(8,0,multi(2,40),'Two flips; 40 per heads.');
set(9,1,{type:'selfDamage',amount:20},'Deal 20 damage to Poliwrath itself.');
set(10,0,rule('falseSwipe'),'Half the defender’s remaining HP, rounded down to the nearest ten.');
set(10,1,seq(multi(2,20),bonus(0)),'Two flips; 20 per heads.');
set(11,0,rule('sketch'),'Copy the attack used by the defending Pokémon last turn if Smeargle was already in play.');
set(12,0,multi(2,30),'Two flips; 30 per heads.');
set(12,1,rule('trample'),'Flip for every Benched Pokémon on both sides; 30 to each heads target.');
set(13,1,seq({type:'selectedDamage',target:'opponentPokemon',amount:30,ignoreWeakness:true,ignoreResistance:true},{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true}),'Choose any opposing Pokémon; deal 30 ignoring other effects.');
set(15,0,{type:'coinAttackGate',heads:par('paralysis')},'Heads: 20 damage and Paralyze. Tails: this attack misses.');
set(15,1,multi(2,40),'Two flips; 40 per heads.');
set(16,0,rule('counter'),'Next turn, flip heads to return received attack damage to the attacker.');
set(17,0,rule('shockwave'),'Heads: deal 10 to all opposing Pokémon and force a switch.');
set(17,1,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},'Ignore Weakness, Resistance and opposing protective effects.');
// Non-holo alternative moves, rather than silently mirroring their holo counterparts.
set(20,0,coin(bonus(20)),'Heads: add 20 damage.');
set(20,1,coin(par('confusion')),'Heads: Confuse the defender.');
set(32,0,coin(bonus(20)),'Heads: add 20 damage.');
set(32,1,rule('pursuit'),'Deal 10 when the defender retreats next turn.');
set(18,0,coin({type:'status',target:'opponentActive',status:'poison',amount:30}),'Heads: triple poison between-turn damage.');
set(18,1,multi(4,20),'Four flips; 20 per heads.');
set(19,0,coin(rule('magicDust')),'Heads: select Sleep, Confusion, Paralysis or Poison.');
set(19,1,rule('hyperReverse'),'10 for each defender Energy, then heal Butterfree by damage dealt.');
set(37,0,seq({type:'discardEnergyCard',target:'self',energyType:'Water',amount:1,useCost:true},{type:'healSelf',amount:999}),'Discard Water Energy attached to Corsola; heal all its damage.');
set(37,1,multi(2,30),'Two flips; 30 per heads.');
set(39,1,rule('plunder'),'Discard all Trainers attached to the defending Pokémon before damage.');
set(41,0,rule('secretePoison'),'Next time Kakuna is attacked for damage, poison the attacker and deal 10 to its Bench.');
set(42,0,{type:'preventDamage',target:'self',duration:'opponentTurn',maxDamage:20},'Prevent up to 20 attack damage to Metapod next turn.');
set(42,1,rule('hatch'),'Heads: heal Metapod, then evolve it from your deck.');
set(43,0,coin(seq(bonus(20),par('paralysis'))),'Heads: 20 additional damage and Paralysis.');
set(43,1,rule('spikeBarrage'),'Flip for each attached Water Energy; 20 extra damage per heads.');
set(44,0,rule('bellyDrum'),'Place three damage counters on Poliwhirl, then attach up to two Basic Energy.');
set(44,1,{type:'energyDamage',source:'self',energyType:'Water',extraAbove:2,maxCount:2,amount:10},'10 more per extra Water Energy, up to 20.');
set(45,1,rule('dustDevil'),'Deal 10 to every Pokémon in play that is not Fighting type.');
set(46,0,{type:'coinTierBonus',coins:4,tiers:{0:0,1:10,2:20,3:40,4:80}},'Flip four; add 10/20/40/80 for exactly 1/2/3/4 heads.');
set(52,0,rule('energyCycle'),'Heads: move one Energy from the defender to a Benched opposing Pokémon.');
set(53,0,{type:'selfDamage',amount:10},'Caterpie takes 10 damage.');
set(54,0,coin(par('paralysis')),'Heads: Paralyze.');
set(56,0,rule('workTogether'),'Heads: add 10 for each Kabuto/Omanyte family Pokémon on your Bench.');
set(58,0,coin(noop,{type:'selfDamage',amount:10}),'Tails: Mareep takes 10 damage.');
set(59,0,coin(par('confusion')),'Heads: Confuse.');
set(60,0,coin(par('paralysis')),'Heads: Paralyze.');
set(61,0,rule('burst'),'Two flips: heads first damages both Benches and Pineco; tails second misses.');
set(62,1,par('sleep'),'Put defender Asleep.');
set(63,0,{type:'revealHand',side:'opponent'},'Look at the opposing hand.');
set(64,0,coin(par('poison')),'Heads: Poison.');
set(65,1,seq({type:'healSelf',amount:999},{type:'status',target:'self',status:'sleep'}),'Heal all damage and put Teddiursa Asleep.');
set(66,0,gate(),'Tails: attack misses.');
set(70,0,{type:'coinAttackGate',heads:par('poison')},'Heads: 20 damage and Poison; tails: miss.');
set(71,0,rule('slime'),'Next turn, opponent flips to see whether attack damage is prevented.');
// Ability names are retained for all prints. Their battle effects execute in
// the Classic engine; cards whose rules are incomplete are explicitly PARTIAL.
const ABILITY_DESCRIPTIONS={spikes:'When an opposing Benched Pokémon becomes Active during its owner’s turn, deal 10 damage to it.',frogSong:'If more than three Poliwag-family Pokémon are in play, Politoed’s damaging attacks deal 40 more damage.',anger:'Hidden Power gets 10 more damage per damage counter on one Unown [A].',energyEvolution:'When attaching Energy to Eevee, flip heads to evolve it from your deck into a matching Energy type.',gaze:'Choose one opposing Benched Pokémon: suppress its Pokémon Power until the end of this turn.',unownDarkness:'Reduce by 30 damage done to your Pokémon by Darkness Pokémon, if exactly one Unown [D] is in play.',unownFind:'Search your deck for a Trainer when Unown [F], [I], [N] and [D] are in play.',unownMetal:'Reduce by 30 damage done to your Pokémon by Metal Pokémon, if exactly one Unown [M] is in play.',unownNormal:'Reduce by 30 damage done to your Pokémon by Colorless Pokémon, if exactly one Unown [N] is in play.',unownUndo:'Return your Active Pokémon and attachments to hand when Unown [U], [N], [D] and [O] are in play.',reviveFriends:'Flip a coin to put a Kabuto from your deck onto your Bench as a Basic Pokémon.',reviveFossil:'Flip a coin to put an Evolution of Mysterious Fossil onto your Bench as a Basic Pokémon.',unownEngage:'When played from hand, each player may shuffle hand into deck and draw four.',unownIncrease:'When played from hand, search for an Unown in your deck and Bench it.',unownObserve:'Look at the top five cards of your opponent’s deck without rearranging them.'};
const ABILITIES={
 2:['Spikes','passive','spikes'],8:['Frog Song','passive','frogSong'],14:['[Anger]','passive','anger'],
 38:['Energy Evolution','triggered','energyEvolution','energyAttached'],
 40:['Gaze','activated','gaze'],47:['[Darkness]','passive','unownDarkness'],
 48:['[Find]','activated','unownFind'],49:['[Metal]','passive','unownMetal'],
 50:['[Normal]','passive','unownNormal'],51:['[Undo]','activated','unownUndo'],
 56:['Revive Friends','activated','reviveFriends'],60:['Revive Fossil','activated','reviveFossil'],
 67:['[Engage]','triggered','unownEngage','benched'],
 68:['[Increase]','triggered','unownIncrease','benched'],
 69:['[Observe]','activated','unownObserve']
};
const PRINT_OF={21:2,22:3,23:4,24:5,25:6,26:7,27:8,28:9,29:10,30:11,31:12,33:14,34:15,35:16,36:17};
const SHARED_POWERS={21:2,27:8,33:14};
const TRAINERS={
 72:{text:'Flip a coin. Heads: search for an Evolution of Mysterious Fossil and Bench it as a Basic.',effect:rule('fossilEgg')},
 73:{text:'Devolve one of your Pokémon into your hand. That Pokémon cannot evolve again this turn.',effect:rule('hyperDevolution')},
 74:{text:'Search for an Unown and Bench it. Shuffle your deck.',effect:rule('ruinWall')},
 75:{text:'Flip twice; for each heads, take a Basic Energy card from the Energy Zone into hand.',effect:rule('energyArk')}
};
const PLAIN=new Set('71:1 1:0 6:0 9:0 13:0 14:0 38:0 39:0 45:0 52:1 55:0 57:0 62:0 63:1 65:0 67:0 68:0 69:0 71:1 47:0 48:0 49:0 50:0 51:0'.split(' '));
const EXTRA_PLAIN=new Set('2:0 3:0 3:1 4:0 4:1 5:0 5:1 6:1 7:0 7:1 8:0 9:1 10:0 10:1 11:0 12:0 12:1 13:1 15:0 15:1 16:0 17:0 17:1 18:0 18:1 19:0 19:1 20:0 20:1 32:0 32:1 37:0 37:1 39:1 41:0 42:0 42:1 43:0 43:1 44:0 44:1 45:1 46:0 52:0 53:0 54:0 56:0 58:0 59:0 60:0 61:0 62:1 63:0 64:0 65:1 66:0 70:0 71:0'.split(' '));
const BABIES=new Set([40,66]);
const DISCOVERY_RULES_READY=new Set('trample falseSwipe hydrocutter collectFire spikeBarrage workTogether dustDevil energyEvolution lockOn electricBolt sketch counter shockwave magicDust hyperReverse pursuit plunder secretePoison hatch bellyDrum energyCycle burst slime fossilEgg hyperDevolution ruinWall energyArk spikes frogSong anger gaze unownDarkness unownFind unownMetal unownNormal unownUndo reviveFriends reviveFossil unownEngage unownIncrease unownObserve'.split(' '));
function implemented(effect){
 if(!effect)return true;
 if(effect.type==='neoRule'&&String(effect.rule||'').startsWith('discovery:'))return DISCOVERY_RULES_READY.has(String(effect.rule).slice(10));
 if(effect.type==='sequence')return effect.effects.every(implemented);
 if(effect.type==='coinFlip')return implemented(effect.heads)&&implemented(effect.tails);
 if(effect.type==='coinAttackGate')return implemented(effect.heads);
 return !!fx?.supportsEffect?.(effect);
}

const CARDS=DATA.map(line=>{
 const [raw,name,type,stage,hp,ret,weak,res,evolvesFrom,rarity,moves]=line.split('|'),n=Number(raw),id='neo2-'+n;
 const kind=n>=72?'trainer':'pokemon',base=PRINT_OF[n]||n;
 const attacks=(moves||'').split(';').filter(Boolean).map((m,i)=>{
  const [title,cost,printed]=m.split('~'),key=base+':'+i;
  const variable=/[+×?]/.test(printed),damage=/×|\?/.test(printed)?0:Number((printed||'').replace(/[^0-9]/g,''))||0;
  const implemented=PLAIN.has(key)||Object.hasOwn(ATTACK,key);
  return {name:title,cost,damage,damageText:variable?printed:null,effect:ATTACK[key]||null,text:DESCRIPTIONS[key]||'',unimplemented:!implemented};
 });
 const abilityDef=ABILITIES[SHARED_POWERS[n]||base];
 const abilities=abilityDef?[{name:abilityDef[0],type:abilityDef[1],event:abilityDef[3],fromHandOnly:['unownEngage','unownIncrease'].includes(abilityDef[2]),oncePerTurn:abilityDef[1]==='activated',disabledByStatus:!abilityDef[0].startsWith('[Darkness]')&&!['[Metal]','[Normal]'].includes(abilityDef[0]),effect:rule(abilityDef[2]),text:ABILITY_DESCRIPTIONS[abilityDef[2]]||abilityDef[0]}]:[];
 const reasons=[];if(kind==='pokemon'){
  for(const atk of attacks){if(atk.unimplemented)reasons.push('Printed '+atk.name+' effect not implemented');else if(atk.effect&&!implemented(atk.effect))reasons.push('Unsupported effect '+atk.name);}
  for(const ability of abilities)if(!implemented(ability.effect))reasons.push('Unsupported Pokémon Power '+ability.name);
  if(!attacks.length&&!abilities.length)reasons.push('No playable attacks or Pokémon Powers');
 }else if(!implemented(TRAINERS[n]?.effect))reasons.push('Trainer effect pending');
 const battleEnabled=!reasons.length;
 return {id,setId:'neo2',number:String(n),name,kind,rarity,source:'tcg',battleFormat:'classic',
  ...(kind==='pokemon'?{stage:Number(stage)===0?'Basic':'Stage '+stage,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolvesFrom||null,attacks,abilities,baby:BABIES.has(n)}:{}),
  ...(kind==='trainer'?{trainerType:'Item',text:TRAINERS[n]?.text||'',effect:TRAINERS[n]?.effect}:{}),
  battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons},
  image:'https://images.pokemontcg.io/neo2/'+n+'.png',imageLarge:'https://images.pokemontcg.io/neo2/'+n+'_hires.png'};
});
if(CARDS.length!==75||new Set(CARDS.map(c=>c.id)).size!==75)throw new Error('Neo Discovery catalogue identity mismatch');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:75,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id+' '+c.name+': '+c.support.reasons.join('; '))})};
});
