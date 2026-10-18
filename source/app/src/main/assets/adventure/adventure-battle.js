(function (root, factory) {

  'use strict';

  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;

  if (root) root.LuckyDexAdventureBattle = api;

})(typeof window !== 'undefined' ? window : null, function () {

  'use strict';

  const D=(typeof window!=='undefined'&&window.LuckyDexMoveData)||(typeof require==='function'?require('./adventure-move-data.js'):null);

  const V=(typeof window!=='undefined'&&window.LuckyDexMoveView)||(typeof require==='function'?require('./adventure-move-view.js'):null);

  const P=(typeof window!=='undefined'&&window.LuckyDexProgression)||(typeof require==='function'?require('./adventure-progression.js'):null);

  const SS=(typeof window!=='undefined'&&window.LuckyDexArcadeSpecialStats)||(typeof require==='function'?require('../arcade-special-stats.js'):null);

  const MOVES={normal:'Body Slam',fire:'Flame Burst',water:'Water Pulse',electric:'Spark',grass:'Razor Leaf',ice:'Icy Wind',fighting:'Brick Break',poison:'Poison Jab',ground:'Mud Shot',flying:'Air Slash',psychic:'Psybeam',bug:'Bug Bite',rock:'Rock Throw',ghost:'Shadow Sneak',dragon:'Dragon Breath',dark:'Bite',steel:'Metal Claw',fairy:'Draining Kiss'};

  const SUPER={fire:['grass','ice','bug','steel'],water:['fire','ground','rock'],electric:['water','flying'],grass:['water','ground','rock'],ice:['grass','ground','flying','dragon'],fighting:['normal','ice','rock','dark','steel'],poison:['grass','fairy'],ground:['fire','electric','poison','rock','steel'],flying:['grass','fighting','bug'],psychic:['fighting','poison'],bug:['grass','psychic','dark'],rock:['fire','ice','flying','bug'],ghost:['psychic','ghost'],dragon:['dragon'],dark:['psychic','ghost'],steel:['ice','rock','fairy'],fairy:['fighting','dragon','dark']};

  const WEAK={normal:['rock','steel'],fire:['fire','water','rock','dragon'],water:['water','grass','dragon'],electric:['electric','grass','dragon'],grass:['fire','grass','poison','flying','bug','dragon','steel'],ice:['fire','water','ice','steel'],fighting:['poison','flying','psychic','bug','fairy'],poison:['poison','ground','rock','ghost'],ground:['grass','bug'],flying:['electric','rock','steel'],psychic:['psychic','steel'],bug:['fire','fighting','poison','flying','ghost','steel','fairy'],rock:['fighting','ground','steel'],ghost:['dark'],dragon:['steel'],dark:['fighting','dark','fairy'],steel:['fire','water','electric','steel'],fairy:['fire','poison','steel']};

  const IMMUNE={normal:['ghost'],electric:['ground'],fighting:['ghost'],poison:['steel'],ground:['flying'],psychic:['dark'],ghost:['normal'],dragon:['fairy']};

  const BALLS={pokeball:{name:'Poké Ball',mod:1},premierball:{name:'Premier Ball',mod:1},greatball:{name:'Great Ball',mod:1.5},ultraball:{name:'Ultra Ball',mod:2}};

  const ENEMY_TURN_DELAY=420, HIT_HOLD=260;

  const MYTHICAL=[151,251,385,386,489,490,491,492,493,494,647,648,649,719,720,721,801,802,807,808,809,893];

  const LEGENDARY=[144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,792,800,801,802,807,808,809,888,889,890,891,892,893,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1009,1010,1024,1025];

  const BOSSES={127:{id:'enrage',name:'Enrage',text:'Below 40% HP, Pinsir attacks 20% harder.'},142:{id:'swift',name:'Ancient speed',text:'Aerodactyl acts first on the opening turn.'},94:{id:'veil',name:'Ghostly veil',text:'The first incoming hit deals 40% less damage.'},131:{id:'tide',name:'Restorative tide',text:'Below half HP, Lapras restores 20% HP once.'},6:{id:'blaze',name:'Blazing field',text:'Fire attacks from either side deal 20% more damage.'}};

  const clone=value=>JSON.parse(JSON.stringify(value));

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  const number=(n,fallback)=>Number.isFinite(Number(n))?Number(n):fallback;

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function seedValue(seed) { if(typeof seed==='number') return (seed>>>0)||0x9e3779b9;let h=2166136261;for(const c of String(seed==null?'adventure':seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0||1; }

  function random(fight) { let x=fight.rng>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;fight.rng=x>>>0;return fight.rng/4294967296; }

  function stats(row) {

    const base=row.baseStats||{}, L=clamp(number(row.level,5),1,50);

    const spAtk=SS?.spAtk?.(row.id)??number(base.spAttack??base.specialAttack,60),spDef=SS?.spDef?.(row.id)??number(base.spDefense??base.specialDefense,60);

    return {hp:Math.round(number(base.hp,60)*.55+L*4+18),attack:Math.round(number(base.attack,60)*.28+L*2.1+8),defense:Math.round(number(base.defense,60)*.28+L*2+8),spAttack:Math.round(number(spAtk,60)*.28+L*2.1+8),spDefense:Math.round(number(spDef,60)*.28+L*2+8),speed:Math.round(number(base.speed,60)*.22+L*1.6+6)};

  }

  function build(row,index,full) {

    const p=clone(row), computed=stats(p);P.ensureOwned(p);p.pp=p.pp||Object.fromEntries(p.moves.map(id=>[id,D.moves[id].pp||10]));p.status=p.status||null;p.statusTurns=p.statusTurns||0;p.guard=Number(p.guard)||1;p.attackBoost=Number(p.attackBoost)||1;p.level=clamp(number(p.level,5),1,50);p.types=Array.isArray(p.types)&&p.types.length?p.types:['normal'];

    p.stats=computed;p.maxHp=Math.max(1,Math.round(number(p.maxHp,computed.hp)));p.hp=full?p.maxHp:clamp(number(p.hp,p.maxHp),0,p.maxHp);ensureCombatState(p);

    if(index!=null)p.key=p.key||`${p.id}:${p.shiny?'s':'n'}`;return p;

  }

  function create(party,enemy,opts) {

    opts=opts||{};const context=['expedition','regional'].includes(opts.context)?opts.context:'roam', members=(party||[]).map((p,i)=>build(p,i,context==='roam'));

    const foe=build(enemy,null,true), kind=opts.kind||'wild', modifier=kind==='boss'?BOSSES[opts.bossId||foe.id]:null;

    if(kind==='boss') {foe.maxHp=Math.round(foe.maxHp*1.3);foe.hp=foe.maxHp;}

    const rng=seedValue(opts.seed), lead=members.find(p=>p.key===opts.leadKey&&p.hp>0)||members.find(p=>p.hp>0);

    const fight={id:`fight-${context}-${opts.destination||'meadow'}-${rng}-${foe.id}`,context,kind,challengeTier:opts.challengeTier||kind,destination:opts.destination||'meadow',enemy:foe,party:members,leadKey:lead?lead.key:null,berryBoost:1,rng,turns:0,actionSeq:0,phase:'active',flags:{},bossModifier:modifier?clone(modifier):null,perks:Array.isArray(opts.perks)?opts.perks.slice():[],trainer:opts.trainer?clone(opts.trainer):null,result:null,lastAction:null};

    fight.realMoves=context==='regional'||(party||[]).some(p=>Array.isArray(p.moves));fight.enemyTeam=(opts.enemyTeam||[enemy]).map(p=>build(p,null,true));fight.enemyIndex=0;fight.strategy=opts.strategy||opts.trainer?.strategy||'pressure';if(!lead) terminal(fight,'loss');return fight;

  }

  function lead(fight) {return fight.party.find(p=>p.key===fight.leadKey);}

  function terminal(fight,kind,extra) {

    fight.phase='terminal';fight.result={kind,enemy:clone(fight.enemy),leadKey:fight.leadKey,...extra};return fight.result;

  }

  function effectiveness(type,types) {return types.reduce((v,t)=>v*((IMMUNE[type]||[]).includes(t)?0:(SUPER[type]||[]).includes(t)?2:(WEAK[type]||[]).includes(t)?.5:1),1);}

  function modifierEvent(action,text) {action.events.push({kind:'modifier',text,target:'enemy'});}

  const EMPTY_STAGES=()=>({attack:0,defense:0,spAttack:0,spDefense:0,speed:0,accuracy:0,evasion:0});
  const STAT_STAGE_KEY={2:'attack',3:'defense',4:'spAttack',5:'spDefense',6:'speed',7:'accuracy',8:'evasion'};
  const SELF_STAT_EFFECTS=new Set([143,169,183,205,219,230,239,285,309,313,335,405,447]);
  function stageMultiplier(stage){stage=clamp(Number(stage)||0,-6,6);return stage>=0?1+stage*.15:1/(1+Math.abs(stage)*.15);}
  function ensureCombatState(p){
    if(!p)return p;
    p.stages={...EMPTY_STAGES(),...(p.stages||{})};
    for(const key of Object.keys(p.stages))p.stages[key]=clamp(Math.round(Number(p.stages[key])||0),-6,6);
    p.confusionTurns=Math.max(0,Number(p.confusionTurns)||0);
    p.trapTurns=Math.max(0,Number(p.trapTurns)||0);
    p.leechSeededBy=p.leechSeededBy||null;
    p.protected=!!p.protected;p.flinched=!!p.flinched;p.rechargeTurns=Math.max(0,Number(p.rechargeTurns)||0);
    p.encoreTurns=Math.max(0,Number(p.encoreTurns)||0);p.encoreMoveId=Number(p.encoreMoveId)||null;p.lastMoveId=Number(p.lastMoveId)||null;p.turnsOnField=Math.max(0,Number(p.turnsOnField)||0);
    p.disableTurns=Math.max(0,Number(p.disableTurns)||0);p.disabledMoveId=Number(p.disabledMoveId)||null;p.escapeLockTurns=Math.max(0,Number(p.escapeLockTurns)||0);
    p.tauntTurns=Math.max(0,Number(p.tauntTurns)||0);p.wishTurns=Math.max(0,Number(p.wishTurns)||0);p.aquaRing=!!p.aquaRing;p.ingrain=!!p.ingrain;p.tailwindTurns=Math.max(0,Number(p.tailwindTurns)||0);p.perishTurns=Math.max(0,Number(p.perishTurns)||0);
    return p;
  }
  function resetStages(p){p.stages=EMPTY_STAGES();p.guard=1;p.attackBoost=1;}
  function effectiveSpeed(p){return Math.max(1,(p.stats?.speed||1)*stageMultiplier(p.stages?.speed)*(p.tailwindTurns>0?2:1));}
  function stageLabel(key){return {attack:'Attack',defense:'Defense',spAttack:'Sp. Atk',spDefense:'Sp. Def',speed:'Speed',accuracy:'Accuracy',evasion:'Evasion'}[key]||key;}
  function applyStage(action,p,target,statId,change,moveName){
    const key=STAT_STAGE_KEY[statId];if(!key||!change)return false;ensureCombatState(p);
    const before=p.stages[key],after=clamp(before+Number(change),-6,6);p.stages[key]=after;
    if(after===before){action.events.push({kind:'modifier',target,text:`${p.name}’s ${stageLabel(key)} cannot change further.`});return false;}
    const amount=Math.abs(after-before),direction=after>before?'rose':'fell',degree=amount>=2?' sharply':'';
    action.events.push({kind:'modifier',target,text:`${p.name}’s ${stageLabel(key)} ${direction}${degree}!`});return true;
  }
  function directDamage(action,attacker,defender,target,type,damage,text,source){
    const before=defender.hp;damage=Math.max(0,Math.min(before,Math.round(damage)||0));defender.hp=Math.max(0,before-damage);
    const event={kind:'hit',target,source:source|| (target==='enemy'?'player':'enemy'),key:defender.key||null,name:defender.name,type:type||'typeless',damage,eff:1,beforeHp:before,hp:defender.hp,maxHp:defender.maxHp,fainted:defender.hp===0,text:(text||`${defender.name} takes ${damage} damage.`)+(defender.hp===0?` ${defender.name} fainted!`:'')};
    action.events.push(event);return event;
  }
  function variablePower(move,attacker,defender){
    switch(Number(move.effectId)){
      case 100:{const r=attacker.hp/Math.max(1,attacker.maxHp);return r<=.041?200:r<=.104?150:r<=.208?100:r<=.354?80:r<=.687?40:20;}
      case 197:{const w=Number(defender.weight)||50;return w>=200?120:w>=100?100:w>=50?80:w>=25?60:w>=10?40:20;}
      case 220:return clamp(Math.floor(25*effectiveSpeed(defender)/Math.max(1,effectiveSpeed(attacker)))+1,1,150);
      case 292:{const ratio=(Number(attacker.weight)||50)/Math.max(1,Number(defender.weight)||50);return ratio>=5?120:ratio>=4?100:ratio>=3?80:ratio>=2?60:40;}
      case 294:{const ratio=effectiveSpeed(attacker)/Math.max(1,effectiveSpeed(defender));return ratio>=4?150:ratio>=3?120:ratio>=2?80:ratio>=1?60:40;}
      case 191:return Math.max(1,Math.round(150*attacker.hp/Math.max(1,attacker.maxHp)));
      default:return move.power==null?40:Number(move.power)||40;
    }
  }

  function hit(fight,action,attacker,defender,type,power,target,multiplier,damageClass='physical') {

    if(fight.context==='regional'&&target==='player'){
      const scale={wild:.60,rare:.62,trainer:.60,'victory-road':.65,gym:.62,trial:.62,'elite-four':.60,'league-round':.60,champion:.85}[fight.challengeTier]??.60;
      multiplier=(multiplier||1)*scale;
    }

    const eff=effectiveness(type,defender.types), variance=.86+random(fight)*.22;

    let mod=multiplier||1;

    if(fight.bossModifier?.id==='blaze'&&type==='fire')mod*=1.2;
    if(fight.weather==='rain'){if(type==='water')mod*=1.5;else if(type==='fire')mod*=.5;}
    else if(fight.weather==='sun'){if(type==='fire')mod*=1.5;else if(type==='water')mod*=.5;}

    if(target==='enemy'&&fight.bossModifier?.id==='veil'&&!fight.flags.veilUsed) {mod*=.6;fight.flags.veilUsed=true;modifierEvent(action,'Gengar’s veil softens the first hit.');}

    const special=damageClass==='special',atkKey=special?'spAttack':'attack',defKey=special?'spDefense':'defense';
    const atkStage=stageMultiplier(attacker.stages?.[atkKey]),defStage=stageMultiplier(defender.stages?.[defKey]);
    const critical=random(fight)<(attacker.focusEnergy?1/8:1/24);if(critical)mod*=1.5;
    const attackStat=attacker.stats?.[atkKey]||attacker.stats.attack,defenseStat=defender.stats?.[defKey]||defender.stats.defense;
    const damage=eff===0?0:Math.max(1,Math.round(power*(attackStat*atkStage/Math.max(1,defenseStat*defStage))*.44*variance*eff*mod*(attacker.attackBoost||1)/Math.max(.75,defender.guard||1)));

    const before=defender.hp;defender.hp=Math.max(0,defender.hp-damage);

    const text=(critical?'A critical hit! ':'')+(eff===0?'It has no effect.':eff>1?'Super effective!':eff<1?'Not very effective.':`${defender.name} takes ${damage} damage.`)+(defender.hp===0?` ${defender.name} fainted!`:'');

    const event={kind:'hit',target,source:target==='enemy'?'player':'enemy',key:defender.key||null,name:defender.name,type,damage,eff,beforeHp:before,hp:defender.hp,maxHp:defender.maxHp,fainted:defender.hp===0,text};

    action.events.push(event);return event;

  }

  function readyMoves(p){return p.moves.filter(id=>(Number(p.pp?.[id])||0)>0&&D.moves[id]&&!(p.disableTurns>0&&Number(id)===Number(p.disabledMoveId)));}

  function canStruggle(p){return !readyMoves(p).some(id=>D.moves[id].damageClass!=='status');}

  function resolveMove(fight,p,command,args){if(args?.moveId)return Number(args.moveId);if(command==='quick')return p.moves[0];const damage=readyMoves(p).filter(id=>D.moves[id].damageClass!=='status');return damage.sort((a,b)=>(D.moves[b].power||40)-(D.moves[a].power||40))[0]||p.moves[0];}

  function migrateFight(fight){if(!fight)return fight;for(const p of [...fight.party,fight.enemy]){P.ensureOwned(p);p.pp=p.pp||Object.fromEntries(p.moves.map(id=>[id,D.moves[id].pp||10]));p.guard=p.guard||1;p.attackBoost=p.attackBoost||1;p.yawnTurns=Math.max(0,Number(p.yawnTurns)||0);ensureCombatState(p)}fight.enemyTeam=fight.enemyTeam||[clone(fight.enemy)];fight.enemyIndex=fight.enemyIndex||0;fight.realMoves=true;return fight;}

  function useMove(fight,action,attacker,defender,id,target,multiplier=1){

    const move=D.moves[id],own=target==='enemy'?'player':'enemy';
    ensureCombatState(attacker);ensureCombatState(defender);

    if(attacker.flinched){attacker.flinched=false;action.events.push({kind:'miss',target:own,text:`${attacker.name} flinched and couldn’t move!`});return {damage:0,eff:1};}
    if(attacker.rechargeTurns>0){attacker.rechargeTurns--;action.events.push({kind:'miss',target:own,text:`${attacker.name} must recharge!`});return {damage:0,eff:1};}
    if(attacker.status==='paralysis'&&random(fight)<.18){action.events.push({kind:'miss',target:own,text:`${attacker.name} is paralyzed.`});return {damage:0,eff:1};}
    if(attacker.status==='sleep'&&attacker.statusTurns>0){attacker.statusTurns--;if(!attacker.statusTurns)attacker.status=null;action.events.push({kind:'miss',target:own,text:`${attacker.name} is asleep and cannot move.`});return {damage:0,eff:1};}
    if(attacker.confusionTurns>0){
      attacker.confusionTurns--;action.events.push({kind:'modifier',target:own,text:`${attacker.name} is confused!`});
      if(random(fight)<1/3){const damage=Math.max(1,Math.round(attacker.maxHp*.08));directDamage(action,attacker,attacker,own,'typeless',damage,`${attacker.name} hurt itself in confusion!`,own);return {damage:0,eff:1};}
      if(attacker.confusionTurns===0)action.events.push({kind:'modifier',target:own,text:`${attacker.name} snapped out of confusion!`});
    }

    if(attacker.tauntTurns>0&&move.damageClass==='status'){action.events.push({kind:'miss',target:own,text:`${attacker.name} is taunted and cannot use ${move.name}!`});return {damage:0,eff:1};}
    if(id!==165)attacker.pp[id]=Math.max(0,attacker.pp[id]-1);attacker.lastMoveId=id;
    if(Number(id)===252&&attacker.turnsOnField>0){action.events.push({kind:'miss',target:own,text:`${move.name} failed — it only works on ${attacker.name}’s first turn in.`});return {damage:0,eff:1};}
    if(own==='enemy'){if(move.role==='heal')fight.flags.healUsed=true;if(['buff','debuff','status'].includes(move.role))fight.flags.supportUsed=true;}

    const targetsOpponent=Number(move.targetId)===10;
    if(defender.protected&&targetsOpponent){action.events.push({kind:'modifier',target,text:`${defender.name} blocked ${move.name}!`});return {damage:0,eff:1};}

    if(move.accuracy!=null){
      const accuracy=clamp((move.accuracy/100)*stageMultiplier(attacker.stages.accuracy)/stageMultiplier(defender.stages.evasion),.05,1);
      if(random(fight)>accuracy){action.events.push({kind:'miss',target,text:move.name+' missed!'});return {damage:0,eff:1};}
    }

    const weatherByEffect={116:'sandstorm',137:'rain',138:'sun',165:'hail'};
    const weather=weatherByEffect[Number(move.effectId)]||(move.name==='Snowscape'?'snow':null);
    if(weather){fight.weather=weather;fight.weatherTurns=5;action.events.push({kind:'modifier',target:own,text:`${move.name} changed the weather to ${weather}.`});return {damage:0,eff:1};}
    if(Number(move.effectId)===92){const average=Math.floor((attacker.hp+defender.hp)/2);attacker.hp=Math.min(attacker.maxHp,average);defender.hp=Math.min(defender.maxHp,average);action.events.push({kind:'modifier',target,text:`Pain Split shared the battlers’ HP: ${attacker.hp} / ${defender.hp}.`});return {damage:0,eff:1};}
    if(Number(move.effectId)===143){const cost=Math.floor(attacker.maxHp/2);if(attacker.hp<=cost){action.events.push({kind:'modifier',target:own,text:'Belly Drum failed because there was not enough HP.'});return {damage:0,eff:1};}directDamage(action,attacker,attacker,own,'typeless',cost,`${attacker.name} cut its HP to maximize Attack!`,own);attacker.stages.attack=6;action.events.push({kind:'modifier',target:own,text:`${attacker.name}’s Attack rose to the maximum!`});return {damage:0,eff:1};}
    if(Number(move.effectId)===91){if(!defender.lastMoveId||!D.moves[defender.lastMoveId])action.events.push({kind:'modifier',target,text:'Encore failed because the target has no previous move.'});else{defender.encoreMoveId=defender.lastMoveId;defender.encoreTurns=3;action.events.push({kind:'modifier',target,text:`${defender.name} received an encore for ${D.moves[defender.encoreMoveId].name}!`});}return {damage:0,eff:1};}
    if(Number(move.effectId)===87){if(!defender.lastMoveId||!D.moves[defender.lastMoveId])action.events.push({kind:'modifier',target,text:'Disable failed because the target has no previous move.'});else{defender.disabledMoveId=defender.lastMoveId;defender.disableTurns=3;action.events.push({kind:'modifier',target,text:`${D.moves[defender.disabledMoveId].name} was disabled!`});}return {damage:0,eff:1};}
    if(Number(move.effectId)===107){defender.escapeLockTurns=4;action.events.push({kind:'modifier',target,text:`${defender.name} can no longer escape or switch!`});return {damage:0,eff:1};}
    if(Number(move.effectId)===115){attacker.perishTurns=3;defender.perishTurns=3;action.events.push({kind:'modifier',target,text:'Both battlers heard the Perish Song!'});return {damage:0,eff:1};}
    if(Number(move.effectId)===154){if(['wild','rare'].includes(fight.kind)){action.events.push({kind:'modifier',target:own,text:`${attacker.name} teleported away from the encounter.`});terminal(fight,'fled');}else action.events.push({kind:'modifier',target:own,text:'Teleport failed in a trainer battle.'});return {damage:0,eff:1};}
    if(Number(move.effectId)===226){attacker.tailwindTurns=4;action.events.push({kind:'modifier',target:own,text:`A Tailwind blew behind ${attacker.name}’s side!`});return {damage:0,eff:1};}
    if(Number(move.effectId)===260){fight.trickRoomTurns=5;action.events.push({kind:'modifier',target:own,text:'The dimensions twisted into a Trick Room!'});return {damage:0,eff:1};}
    if(Number(move.effectId)===295){defender.types=['water'];action.events.push({kind:'modifier',target,text:`${defender.name} became pure Water type!`});return {damage:0,eff:1};}
    if(Number(move.effectId)===348){for(const key of Object.keys(defender.stages))defender.stages[key]=-defender.stages[key];action.events.push({kind:'modifier',target,text:`${defender.name}’s stat changes were inverted!`});return {damage:0,eff:1};}
    if(Number(move.effectId)===399){const speed=attacker.stats.speed;attacker.stats.speed=defender.stats.speed;defender.stats.speed=speed;action.events.push({kind:'modifier',target,text:`${attacker.name} and ${defender.name} swapped Speed!`});return {damage:0,eff:1};}
    if(Number(move.effectId)===176){defender.tauntTurns=3;action.events.push({kind:'modifier',target,text:`${defender.name} was taunted!`});return {damage:0,eff:1};}
    if(Number(move.effectId)===180){attacker.wishTurns=2;action.events.push({kind:'modifier',target:own,text:`${attacker.name} made a wish!`});return {damage:0,eff:1};}
    if([182,252].includes(Number(move.effectId))){if(Number(move.effectId)===182)attacker.ingrain=true;else attacker.aquaRing=true;action.events.push({kind:'modifier',target:own,text:`${attacker.name} will gradually recover HP.`});return {damage:0,eff:1};}
    // High-value utility families that used to fall through to the generic no-op path.
    if(move.effect?.ailment==='protect'||[112,279,307,350,356,362,384,407,472].includes(Number(move.effectId))||/Shield|Bulwark|Obstruct/.test(move.name)){
      attacker.protected=true;action.events.push({kind:'modifier',target:own,text:`${attacker.name} protected itself!`});return {damage:0,eff:1};
    }
    if(Number(move.effectId)===38){
      const before=attacker.hp;attacker.hp=attacker.maxHp;attacker.status='sleep';attacker.statusTurns=2;attacker.confusionTurns=0;
      action.events.push({kind:'heal',target:own,hp:attacker.hp,maxHp:attacker.maxHp,heal:attacker.hp-before,text:`${attacker.name} rested and fully restored its health, then fell asleep.`});return {damage:0,eff:1};
    }
    if(Number(move.effectId)===26){
      resetStages(attacker);resetStages(defender);action.events.push({kind:'modifier',target:own,text:'Haze reset all battle stat changes.'});return {damage:0,eff:1};
    }
    if(Number(move.effectId)===103){
      const team=own==='player'?fight.party:[fight.enemy];for(const p of team){p.status=null;p.statusTurns=0;p.confusionTurns=0;}
      action.events.push({kind:'modifier',target:own,text:`${move.name} cured the team’s status conditions.`});return {damage:0,eff:1};
    }
    if(Number(move.effectId)===48){attacker.focusEnergy=true;action.events.push({kind:'modifier',target:own,text:`${attacker.name} is getting pumped! Critical hits are more likely.`});return {damage:0,eff:1};}
    if(move.effect?.ailment==='leech-seed'){
      if(defender.types.includes('grass')||defender.leechSeededBy){action.events.push({kind:'modifier',target,text:`${move.name} failed.`});}
      else{defender.leechSeededBy=own;action.events.push({kind:'modifier',target,text:`${defender.name} was seeded!`});}
      return {damage:0,eff:1};
    }
    if(move.role==='status'&&move.effect?.ailment==='yawn'){
      if(defender.status||defender.yawnTurns>0)action.events.push({kind:'modifier',target,text:`${move.name} failed.`});else{defender.yawnTurns=2;action.events.push({kind:'modifier',target,text:`${defender.name} grew drowsy.`});}
      return {damage:0,eff:1};
    }
    if(move.role==='status'&&move.effect?.ailment==='confusion'){
      if(defender.confusionTurns>0)action.events.push({kind:'modifier',target,text:`${move.name} failed.`});else{defender.confusionTurns=2+Math.floor(random(fight)*3);action.events.push({kind:'modifier',target,text:`${defender.name} became confused!`});}
      return {damage:0,eff:1};
    }

    let event={damage:0,eff:1};

    if(move.damageClass!=='status'){
      const type=id===165?'typeless':move.type,minHits=Math.max(1,Number(move.effect?.minHits)||1),maxHits=Math.max(minHits,Number(move.effect?.maxHits)||minHits),planned=minHits===maxHits?minHits:minHits+Math.floor(random(fight)*(maxHits-minHits+1));
      let total=0,first=null,hits=0;
      const effectId=Number(move.effectId);
      if(effectId===39){
        if(attacker.level<defender.level){action.events.push({kind:'modifier',target,text:`${move.name} failed against the higher-level target.`});}
        else{first=directDamage(action,attacker,defender,target,type,defender.hp,`${move.name} is a one-hit knockout!`);total=first.damage;hits=1;}
      }else if(effectId===41){first=directDamage(action,attacker,defender,target,type,Math.max(1,Math.floor(defender.hp/2)),`${move.name} cut ${defender.name}’s HP in half!`);total=first.damage;hits=1;}
      else if(effectId===88){first=directDamage(action,attacker,defender,target,type,attacker.level,`${move.name} dealt fixed damage equal to ${attacker.name}’s level!`);total=first.damage;hits=1;}
      else if(effectId===190){const amount=Math.max(0,defender.hp-attacker.hp);if(amount>0){first=directDamage(action,attacker,defender,target,type,amount,`${move.name} brought ${defender.name} down to ${attacker.name}’s HP!`);total=first.damage;hits=1;}else action.events.push({kind:'modifier',target,text:`${move.name} failed.`});}
      else if(effectId===321){const amount=attacker.hp;first=directDamage(action,attacker,defender,target,type,amount,`${move.name} sacrificed ${attacker.name}’s HP!`);total=first.damage;hits=1;directDamage(action,attacker,attacker,own,'typeless',attacker.hp,`${attacker.name} fainted from Final Gambit.`,own);}
      else{
        const power=variablePower(move,attacker,defender),stab=attacker.types.includes(move.type)?1.1:1;
        for(let i=0;i<planned&&defender.hp>0;i++){const row=hit(fight,action,attacker,defender,type,power,target,multiplier*stab,move.damageClass);row.moveName=move.name;first=first||row;total+=row.damage;hits++;}
        if(effectId===102&&defender.hp===0&&first){const restore=1;defender.hp=restore;const last=action.events.filter(e=>e.kind==='hit'&&e.target===target).at(-1);if(last){last.damage=Math.max(0,last.beforeHp-restore);last.hp=restore;last.fainted=false;last.text=`${defender.name} held on with 1 HP!`;total=action.events.filter(e=>e.kind==='hit'&&e.target===target&&e.moveName===move.name).reduce((n,e)=>n+e.damage,0);}}
      }
      event={...(first||event),damage:total,eff:first?.eff??1,moveName:move.name};
      if(maxHits>1)action.events.push({kind:'modifier',target,text:`${move.name} hit ${hits} times!`});

      if(move.effect?.drain>0&&event.damage>0){const before=attacker.hp;attacker.hp=Math.min(attacker.maxHp,attacker.hp+Math.max(1,Math.round(event.damage*move.effect.drain/100)));action.events.push({kind:'heal',target:own,hp:attacker.hp,maxHp:attacker.maxHp,heal:attacker.hp-before,text:move.name+' restores HP.'});}
      if(move.effect?.drain<0&&event.damage>0&&attacker.hp>0){const recoil=Math.min(attacker.hp,Math.max(1,Math.round(event.damage*Math.abs(move.effect.drain)/100)));directDamage(action,attacker,attacker,own,'typeless',recoil,`${attacker.name} is hurt by recoil!`,own);}
      if(effectId===8&&attacker.hp>0)directDamage(action,attacker,attacker,own,'typeless',attacker.hp,`${attacker.name} fainted from the explosion.`,own);
      if(effectId===81&&attacker.hp>0)attacker.rechargeTurns=1;
      if(id===165&&attacker.hp>0)directDamage(action,attacker,attacker,own,'typeless',Math.max(1,Math.round(attacker.maxHp*.08)),`${attacker.name} is hurt by Struggle recoil!`,own);
      if(move.effect?.ailment==='trap'&&defender.hp>0){defender.trapTurns=4;defender.trappedBy=own;action.events.push({kind:'modifier',target,text:`${defender.name} was trapped by ${move.name}!`});}
      if((move.effect?.flinchChance||0)>0&&event.damage>0&&event.eff>0&&defender.hp>0&&random(fight)<move.effect.flinchChance/100){defender.flinched=true;action.events.push({kind:'modifier',target,text:`${defender.name} flinched!`});}
    }else if(move.role==='heal'){
      const before=attacker.hp;attacker.hp=Math.min(attacker.maxHp,attacker.hp+Math.round(attacker.maxHp*Math.max(.2,(move.effect?.healing||40)/100)));action.events.push({kind:'heal',target:own,hp:attacker.hp,maxHp:attacker.maxHp,heal:attacker.hp-before,text:move.name+' restores HP.'});
    }

    const changes=Array.isArray(move.effect?.statChanges)?move.effect.statChanges:[];
    if(changes.length){
      const chance=move.damageClass==='status'?1:((move.effect?.statChance||100)/100);
      if(random(fight)<chance){for(const row of changes){const self=move.role==='buff'||SELF_STAT_EFFECTS.has(Number(move.effectId))||(move.damageClass!=='status'&&Number(row.change)>0);applyStage(action,self?attacker:defender,self?own:target,row.statId,row.change,move.name);}}
    }else if(move.role==='buff'&&move.damageClass==='status'){
      attacker.guard=Math.min(1.6,(attacker.guard||1)+.15);attacker.attackBoost=Math.min(1.3,(attacker.attackBoost||1)+.08);action.events.push({kind:'modifier',target:own,text:move.name+' strengthens '+attacker.name+'’s offensive and defensive stance.'});
    }else if(move.role==='debuff'&&move.damageClass==='status'){
      defender.guard=Math.max(.75,(defender.guard||1)-.12);defender.attackBoost=Math.max(.75,(defender.attackBoost||1)-.08);action.events.push({kind:'modifier',target,text:move.name+' weakens the opposing stance.'});
    }else if(move.role==='no-op'||(move.role==='status'&&!['burn','poison','paralysis','sleep','freeze','yawn','confusion','trap','leech-seed'].includes(move.effect?.ailment))){
      action.events.push({kind:'modifier',target:own,text:move.name+': No battle effect is currently implemented in LuckyDex.'});
    }

    const ailment=move.effect?.ailment;
    if(['burn','poison','paralysis','sleep','freeze'].includes(ailment)&&!defender.status&&defender.hp>0){
      const immune=effectiveness(move.type,defender.types)===0||ailment==='burn'&&defender.types.includes('fire')||ailment==='poison'&&defender.types.some(t=>['poison','steel'].includes(t))||ailment==='paralysis'&&defender.types.includes('electric');
      if(immune&&move.damageClass==='status')action.events.push({kind:'modifier',target,text:`${defender.name} is immune to this status effect.`});
      else if(!immune&&random(fight)<((move.effect.ailmentChance||100)/100)){defender.status=ailment==='freeze'?'sleep':ailment;defender.statusTurns=ailment==='sleep'||ailment==='freeze'?2:0;action.events.push({kind:'modifier',target,text:`${defender.name} is now ${statusName(defender.status).toLowerCase()}.`});}
    }
    if(ailment==='confusion'&&defender.hp>0&&defender.confusionTurns===0&&random(fight)<((move.effect.ailmentChance||100)/100)){defender.confusionTurns=2+Math.floor(random(fight)*3);action.events.push({kind:'modifier',target,text:`${defender.name} became confused!`});}

    return event;

  }

  function nextEnemy(fight,action){if(fight.enemy.hp>0)return false;if(fight.enemyIndex+1>=fight.enemyTeam.length){terminal(fight,'victory');return true}fight.enemyIndex++;fight.enemy=build(fight.enemyTeam[fight.enemyIndex],null,true);fight.flags={};action.events.push({kind:'modifier',target:'enemy',text:`${fight.trainer?.name||'The trainer'} sent out ${fight.enemy.name}!`});return true;}

  function enemyMove(fight,player){const e=fight.enemy,ids=readyMoves(e);if(e.encoreTurns>0&&e.encoreMoveId&&ids.includes(e.encoreMoveId))return e.encoreMoveId;if(!ids.length)return 165;const healing=ids.find(id=>D.moves[id].role==='heal');if(healing&&e.hp<e.maxHp*.4&&!fight.flags.healUsed){return healing;}const support=ids.find(id=>['buff','debuff','heal'].includes(D.moves[id].role)||D.moves[id].role==='status'||[38,48,103,112].includes(Number(D.moves[id].effectId)));if(support&&fight.strategy!=='pressure'&&!fight.flags.supportUsed){return support}if(canStruggle(e))return 165;return ids.filter(id=>D.moves[id].damageClass!=='status').sort((a,b)=>(D.moves[b].power||40)*effectiveness(D.moves[b].type,player.types)-(D.moves[a].power||40)*effectiveness(D.moves[a].type,player.types))[0]||ids[0];}

  function residual(fight,action,p,target){
    if(!p||p.hp<=0)return;ensureCombatState(p);
    if(['burn','poison'].includes(p.status)){const before=p.hp,damage=Math.max(1,Math.round(p.maxHp*.04));p.hp=Math.max(0,p.hp-damage);action.events.push({kind:'hit',source:'status',target,type:p.status,key:p.key,name:p.name,damage,beforeHp:before,hp:p.hp,maxHp:p.maxHp,fainted:p.hp===0,eff:1,text:`${p.name} takes ${p.status} damage.${p.hp===0?' '+p.name+' fainted!':''}`});}
    if(p.hp<=0)return;
    if(p.trapTurns>0){const before=p.hp,damage=Math.max(1,Math.round(p.maxHp/16));p.hp=Math.max(0,p.hp-damage);p.trapTurns--;action.events.push({kind:'hit',source:'trap',target,type:'normal',key:p.key,name:p.name,damage,beforeHp:before,hp:p.hp,maxHp:p.maxHp,fainted:p.hp===0,eff:1,text:`${p.name} is hurt by the binding effect.${p.hp===0?' '+p.name+' fainted!':''}`});if(p.trapTurns===0){p.trappedBy=null;action.events.push({kind:'modifier',target,text:`${p.name} was freed from the binding effect.`});}}
    if(p.hp<=0)return;
    if(p.leechSeededBy){const before=p.hp,damage=Math.max(1,Math.round(p.maxHp/8));p.hp=Math.max(0,p.hp-damage);const owner=p.leechSeededBy==='player'?lead(fight):fight.enemy;let heal=0;if(owner&&owner.hp>0){const ownerBefore=owner.hp;owner.hp=Math.min(owner.maxHp,owner.hp+damage);heal=owner.hp-ownerBefore;}action.events.push({kind:'hit',source:'leech-seed',target,type:'grass',key:p.key,name:p.name,damage,beforeHp:before,hp:p.hp,maxHp:p.maxHp,fainted:p.hp===0,eff:1,text:`Leech Seed drained ${damage} HP from ${p.name}.${heal?` ${owner.name} recovered ${heal} HP.`:''}`});}
    if(p.hp<=0)return;
    if(p.aquaRing||p.ingrain){const before=p.hp,heal=Math.max(1,Math.round(p.maxHp/16));p.hp=Math.min(p.maxHp,p.hp+heal);if(p.hp>before)action.events.push({kind:'heal',target,hp:p.hp,maxHp:p.maxHp,heal:p.hp-before,text:`${p.name} recovered HP from ${p.aquaRing?'Aqua Ring':'Ingrain'}.`});}
    if(p.wishTurns>0){p.wishTurns--;if(p.wishTurns===0){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+Math.max(1,Math.round(p.maxHp/2)));action.events.push({kind:'heal',target,hp:p.hp,maxHp:p.maxHp,heal:p.hp-before,text:`${p.name}’s wish came true!`});}}
    if(['sandstorm','hail'].includes(fight.weather)){const immune=fight.weather==='sandstorm'?p.types.some(t=>['rock','ground','steel'].includes(t)):p.types.includes('ice');if(!immune){const before=p.hp,damage=Math.max(1,Math.round(p.maxHp/16));p.hp=Math.max(0,p.hp-damage);action.events.push({kind:'hit',source:'weather',target,type:fight.weather==='hail'?'ice':'rock',key:p.key,name:p.name,damage,beforeHp:before,hp:p.hp,maxHp:p.maxHp,fainted:p.hp===0,eff:1,text:`${p.name} is hurt by the ${fight.weather}.`});}}
  }

  function delayedStatus(action,p,target){if(!p||p.hp<=0||!(p.yawnTurns>0))return;p.yawnTurns--;if(p.yawnTurns===0){if(!p.status){p.status='sleep';p.statusTurns=2;action.events.push({kind:'modifier',target,text:`${p.name} fell asleep!`});}}}

  function enemyTurn(fight,action) {

    if(fight.phase!=='active')return;const player=lead(fight);if(!player)return;

    let mod=1;

    if(fight.bossModifier?.id==='enrage'&&fight.enemy.hp/fight.enemy.maxHp<.4) {mod=1.2;if(!fight.flags.enraged){fight.flags.enraged=true;modifierEvent(action,'Pinsir is enraged! Attacks are 20% stronger.');}}

    if(fight.realMoves)useMove(fight,action,fight.enemy,player,enemyMove(fight,player),'player',mod);else hit(fight,action,fight.enemy,player,fight.enemy.types[0],26,'player',mod);residual(fight,action,player,'player');residual(fight,action,fight.enemy,'enemy');

    if(player.hp===0) {

      const next=fight.party.find(p=>p.hp>0);

      if(next) {next.turnsOnField=0;fight.leadKey=next.key;action.events.push({kind:'switch',target:'player',key:next.key,name:next.name,text:`Go, ${next.name}!`});}

      else terminal(fight,'loss');

    }

    if(fight.phase==='active'&&fight.enemy.hp===0)nextEnemy(fight,action);

  }

  function captureChance(fight,key) {

    const e=fight.enemy, legendary=e.legendary||e.tier==='legendary'||LEGENDARY.includes(Number(e.id)), mythical=e.mythical||MYTHICAL.includes(Number(e.id));

    return clamp((.12+(1-e.hp/e.maxHp)*.62)*(e.tier==='rare'?.72:1)*(legendary?.28:1)*(mythical?.75:1)*BALLS[key].mod*fight.berryBoost,.025,.95);

  }

  // Real moves commit to the two active Pokémon. A faint or replacement cancels
  // the queued move; the incoming partner never inherits a departed actor's turn.
  function realMoveTurn(fight,action,player,chosen){
    const enemy=fight.enemy;ensureCombatState(player);ensureCombatState(enemy);player.protected=false;enemy.protected=false;player.flinched=false;enemy.flinched=false;
    const enemyId=enemyMove(fight,player),playerMove=D.moves[chosen],foeMove=D.moves[enemyId];
    const priority=(Number(playerMove.priority)||0)-(Number(foeMove.priority)||0),rawSpeed=effectiveSpeed(player)-effectiveSpeed(enemy),speed=fight.trickRoomTurns>0?-rawSpeed:rawSpeed;
    const playerFirst=priority!==0?priority>0:speed!==0?speed>0:random(fight)<.5;
    const settle=()=>{
      if(player.hp<=0&&fight.leadKey===player.key){const next=fight.party.find(p=>p.hp>0);if(next){next.turnsOnField=0;fight.leadKey=next.key;action.events.push({kind:'switch',target:'player',key:next.key,name:next.name,text:`Go, ${next.name}!`});}else terminal(fight,'loss');}
      if(fight.phase==='active'&&fight.enemy===enemy&&enemy.hp<=0)nextEnemy(fight,action);
    };
    let playerActed=false;
    const move=side=>{
      if(fight.phase!=='active'||player.hp<=0||enemy.hp<=0||fight.enemy!==enemy)return;
      if(side==='player'){
        playerActed=true;action.text=`${player.name} used ${playerMove.name}!`;let mod=1;
        if(fight.perks.includes('quickClaw')&&!fight.flags.quickClawUsed){mod=1.15;fight.flags.quickClawUsed=true;}
        const event=useMove(fight,action,player,enemy,chosen,'enemy',mod);action.damage=event.damage;action.eff=event.eff;
        if(enemy.hp>0&&fight.bossModifier?.id==='tide'&&!fight.flags.tideUsed&&enemy.hp/enemy.maxHp<.5){fight.flags.tideUsed=true;const before=enemy.hp;enemy.hp=Math.min(enemy.maxHp,before+Math.round(enemy.maxHp*.2));action.events.push({kind:'heal',target:'enemy',heal:enemy.hp-before,beforeHp:before,hp:enemy.hp,maxHp:enemy.maxHp,text:'Lapras restores HP with a restorative tide.'});}
      }else{
        let mod=1;if(fight.bossModifier?.id==='enrage'&&enemy.hp/enemy.maxHp<.4){mod=1.2;if(!fight.flags.enraged){fight.flags.enraged=true;modifierEvent(action,'Pinsir is enraged! Attacks are 20% stronger.');}}
        useMove(fight,action,enemy,player,enemyId,'player',mod);
      }
      settle();
    };
    move(playerFirst?'player':'enemy');move(playerFirst?'enemy':'player');
    residual(fight,action,player,'player');residual(fight,action,enemy,'enemy');delayedStatus(action,player,'player');delayedStatus(action,enemy,'enemy');
    for(const p of [player,enemy]){
      if(p.encoreTurns>0&&--p.encoreTurns===0)p.encoreMoveId=null;if(p.disableTurns>0&&--p.disableTurns===0)p.disabledMoveId=null;if(p.escapeLockTurns>0)p.escapeLockTurns--;if(p.tauntTurns>0)p.tauntTurns--;if(p.tailwindTurns>0)p.tailwindTurns--;
      if(p.perishTurns>0){p.perishTurns--;action.events.push({kind:'modifier',target:p===player?'player':'enemy',text:`${p.name}’s perish count fell to ${p.perishTurns}.`});if(p.perishTurns===0&&p.hp>0)directDamage(action,p,p,p===player?'player':'enemy','ghost',p.hp,`${p.name} perished!`,'status');}
    }
    if(fight.trickRoomTurns>0&&--fight.trickRoomTurns===0)action.events.push({kind:'modifier',target:'enemy',text:'Trick Room returned to normal.'});
    if(fight.weatherTurns>0&&--fight.weatherTurns===0){action.events.push({kind:'modifier',target:'enemy',text:'The weather returned to normal.'});fight.weather=null;}settle();
    if(fight.party.find(p=>p.key===player.key)===player)player.turnsOnField=(player.turnsOnField||0)+1;
    if(fight.enemy===enemy)enemy.turnsOnField=(enemy.turnsOnField||0)+1;
    player.protected=false;enemy.protected=false;player.flinched=false;enemy.flinched=false;
    if(!playerActed)action.text=`${player.name} fainted before it could move.`;
    if(fight.result?.kind==='loss')action.text='Your party is out of HP. Return to safety.';
  }

  function act(fight,command,args,inventory) {

    args=args||{};inventory=inventory||{};

    const reject=reason=>({applied:false,reason,action:null,result:null});

    if(!fight||fight.phase!=='active')return reject('This encounter has ended.');

    if(!['move','quick','type','berry','potion','ball','switch','flee'].includes(command))return reject('Unknown command.');

    const current=lead(fight);

    if(!current||current.hp<=0)return reject('Choose a living party member.');

    if(command==='flee'&&!['wild','rare'].includes(fight.kind))return reject('You cannot leave a trainer or guardian battle.');
    if((command==='flee'||command==='switch')&&(current.trapTurns>0||current.escapeLockTurns>0||current.ingrain))return reject(`${current.name} is trapped and cannot leave the field.`);
    if(command==='berry'&&['trainer','elite'].includes(fight.kind))return reject('Berries are for catching wild Pokémon.');

    const chosen=['move','quick','type'].includes(command)&&fight.realMoves?resolveMove(fight,current,command,args):null;

    if(chosen&&(!D.moves[chosen]||(chosen===165?!canStruggle(current):!current.moves.includes(chosen)||!(current.pp[chosen]>0))))return reject('Choose a known move with PP.');
    if(chosen&&current.encoreTurns>0&&current.encoreMoveId&&chosen!==current.encoreMoveId)return reject(`${current.name} must repeat ${D.moves[current.encoreMoveId]?.name||'its encored move'}.`);
    if(chosen&&current.disableTurns>0&&chosen===current.disabledMoveId)return reject(`${D.moves[chosen]?.name||'That move'} is disabled.`);

    let item;

    if(command==='ball') {if(['trainer','elite'].includes(fight.kind))return reject('Trainer Pokémon cannot be caught.');if(!BALLS[args.key])return reject('Choose a Poké Ball.');item=args.key;}

    if(command==='berry'||command==='potion')item=command;

    if(item&&!(number(inventory[item],0)>=1))return reject('No supplies left.');

    if(command==='potion'&&current.hp>=current.maxHp)return reject('HP is already full.');

    if(command==='switch'&&(!fight.party.some(p=>p.key===args.key&&p.hp>0)||args.key===fight.leadKey))return reject('Choose another living Pokémon.');

    const action={seq:++fight.actionSeq,kind:command,target:command==='quick'||command==='type'||command==='ball'?'enemy':'player',text:'',events:[],beforeLead:{key:current.key,name:current.name,hp:current.hp,maxHp:current.maxHp}};

    if(item)inventory[item]=number(inventory[item],0)-1;

    if(command==='berry') {

      const satchel=fight.perks.includes('berrySatchel');fight.berryBoost=Math.min(satchel?2.2:2,fight.berryBoost*(satchel?1.55:1.4));

      action.text=`A Berry makes ${fight.enemy.name} easier to catch.`;action.events.push({kind:'berry',target:'enemy',text:action.text});

    } else if(command==='flee') {action.text='You left the wild encounter.';terminal(fight,'fled');}

    else {

      fight.turns++;

      if(chosen){realMoveTurn(fight,action,current,chosen);fight.lastAction=action;return {applied:true,action,result:fight.result};}

      const first=fight.bossModifier?.id==='swift'&&!fight.flags.swiftUsed;

      if(first) {fight.flags.swiftUsed=true;enemyTurn(fight,action);modifierEvent(action,'Aerodactyl’s ancient speed gave it the opening move.');}

      if(fight.phase==='active') {

        const player=lead(fight);

        if(command==='move'||command==='quick'||command==='type') {

          const type=chosen?D.moves[chosen].type:command==='quick'?'normal':player.types[0], name=chosen?D.moves[chosen].name:D.moves[player.moves[0]]?.name||'Struggle';

          action.text=`${player.name} used ${name}!`;

          let mod=1;

          if(fight.perks.includes('quickClaw')&&!fight.flags.quickClawUsed){mod=1.15;fight.flags.quickClawUsed=true;}

          if(chosen){const event=useMove(fight,action,player,fight.enemy,chosen,'enemy',mod);action.damage=event.damage;action.eff=event.eff;}

          else if(command==='type'&&random(fight)>=.9) {action.events.push({kind:'miss',target:'enemy',text:'The attack missed!'});action.damage=0;action.eff=1;}

          else {const event=hit(fight,action,player,fight.enemy,type,command==='quick'?24:38,'enemy',mod);action.damage=event.damage;action.eff=event.eff;}

          if(fight.enemy.hp===0)nextEnemy(fight,action);

          else if(fight.bossModifier?.id==='tide'&&!fight.flags.tideUsed&&fight.enemy.hp/fight.enemy.maxHp<.5) {

            fight.flags.tideUsed=true;const heal=Math.round(fight.enemy.maxHp*.2), before=fight.enemy.hp;fight.enemy.hp=Math.min(fight.enemy.maxHp,before+heal);

            action.events.push({kind:'heal',target:'enemy',heal: fight.enemy.hp-before,beforeHp:before,hp:fight.enemy.hp,maxHp:fight.enemy.maxHp,text:'Lapras restores HP with a restorative tide.'});

          }

        } else if(command==='potion') {

          const before=player.hp, amount=Math.round(Math.max(10,Math.round(player.maxHp*(fight.context==='regional'?.62:.38)))*(fight.perks.includes('potionBelt')?1.15:1));

          player.hp=Math.min(player.maxHp,before+amount);action.text=`${player.name} recovered HP.`;

          action.events.push({kind:'heal',target:'player',key:player.key,heal:player.hp-before,beforeHp:before,hp:player.hp,maxHp:player.maxHp,text:action.text});

        } else if(command==='switch') {const incoming=fight.party.find(p=>p.key===args.key);if(incoming)incoming.turnsOnField=0;fight.leadKey=args.key;action.text=`Go, ${lead(fight).name}!`;action.events.push({kind:'switch',target:'player',key:args.key,name:lead(fight).name,text:action.text});}

        else if(command==='ball') {

          const chance=captureChance(fight,args.key), roll=random(fight);action.ball=args.key;action.captureChance=chance;action.captureSuccess=roll<chance;

          action.shakes=action.captureSuccess?3:Math.min(2,Math.floor((roll-chance)/Math.max(.0001,1-chance)*3));

          action.text=action.captureSuccess?`Gotcha! ${fight.enemy.name} was caught!`:`${fight.enemy.name} broke free!`;

          action.events.push({kind:'capture',target:'enemy',success:action.captureSuccess,shakes:action.shakes,text:action.text});

          if(action.captureSuccess)terminal(fight,'capture',{captureChance:chance,ball:args.key});else fight.berryBoost=1;

        }

        if(!first&&!action.events.some(e=>e.kind==='modifier'&&e.text.includes('sent out')))enemyTurn(fight,action);if(fight.phase==='active'){delayedStatus(action,lead(fight),'player');delayedStatus(action,fight.enemy,'enemy');}

      }

    }

    if(fight.result?.kind==='loss')action.text='Your party is out of HP. Return to safety.';

    fight.lastAction=action;return {applied:true,action,result:fight.result};

  }

  function actorAsset(assets,p,back) {

    return typeof assets.pokemon==='function'?assets.pokemon(p.id,!!p.shiny,!!back):`arcade/sprites/actors/pokemon/${p.shiny?'shiny/':''}${p.id}.png`;

  }

  function statusName(status){return {burn:'Burned',poison:'Poisoned',paralysis:'Paralyzed',sleep:'Asleep',freeze:'Asleep'}[status]||'';}

  function hpHud(p,side) {const need=P.xpNeeded(p.level),xp=Math.max(0,Number(p.xp)||0),exp=side==='player'?`<div class="adv-battle-xp"><b>EXP</b><span role="progressbar" aria-label="${esc(p.name)} EXP" aria-valuemin="0" aria-valuemax="${need}" aria-valuenow="${xp}" data-xp-track><i data-xp-fill style="width:${Math.min(100,xp/need*100)}%"></i></span></div><small data-xp-text>${xp} / ${need} EXP</small>`:'';return `<div class="adv-battle-hud adv-battle-hud--${side}" data-battle-hud="${side}"><div><strong data-hud-name>${esc(p.name)}</strong><span data-hud-level>Lv.${p.level}</span></div><div class="adv-battle-hp"><b>HP</b><span role="progressbar" aria-label="${esc(p.name)} HP" aria-valuemin="0" aria-valuemax="${p.maxHp}" aria-valuenow="${p.hp}" data-hp-track><i data-hp-fill style="width:${p.hp/p.maxHp*100}%"></i></span></div><small data-hp-text>${Math.ceil(p.hp)} / ${p.maxHp}</small>${exp}<small data-hud-status>${esc(statusName(p.status))}</small></div>`;}

  function moveButtons(p){
    const ids=[...p.moves];if(canStruggle(p)&&!ids.includes(165))ids.push(165);
    return ids.map((id,i)=>{
      const opts={currentPP:id===165?undefined:p.pp[id]},m=V.describe(id,opts),extra=i>=4;
      const content=V.compact(id,opts).replace('class="adv-move-name"',`class="adv-move-name"${i===1?' data-type-move':''}`);
      return `<div class="adv-battle-move-choice${extra?' adv-battle-move-choice--fallback':''}"><button type="button" class="adv-move-slot adv-battle-move" data-adv-battle="${i===0?'quick':i===1?'type':'move'}" data-move-id="${id}"${id!==165&&!(p.pp[id]>0)?' disabled':''}>${extra?`<b class="adv-move-name">${esc(m.name)}</b><span class="adv-move-meta">PP ∞ · Costs a little HP</span>`:content}</button><button type="button" class="adv-move-inspect" data-battle-preview="${id}" aria-label="Info: ${esc(m.name)}">i</button></div>`;
    }).join('');
  }

  function firstMovePreview(p){return p.moves.find(id=>p.pp[id]>0)||(canStruggle(p)?165:p.moves[0]);}
  const battleMenus=new WeakMap();
  function menu(scene,p){
    let state=battleMenus.get(scene);
    if(!state){
      state={p,id:null};battleMenus.set(scene,state);
      const preview=event=>{
        const target=event.target.closest?.('[data-battle-preview],[data-move-id]');if(!target||!scene.contains(target))return;
        const id=Number(target.dataset.battlePreview||target.dataset.moveId);if(!D.moves[id])return;
        state.id=id;showMoveDetail(scene,state);
      };
      scene.addEventListener('focusin',preview);scene.addEventListener('pointerover',preview);
      scene.addEventListener('click',event=>{if(event.target.closest?.('[data-battle-preview]')){preview(event);event.stopPropagation();}});
    }
    state.p=p;
    if(!p.moves.includes(state.id)&&state.id!==165)state.id=firstMovePreview(p);
    if(state.id===165&&!canStruggle(p)&&!p.moves.includes(165))state.id=firstMovePreview(p);
    showMoveDetail(scene,state);
  }
  function showMoveDetail(scene,state){
    const detail=scene.querySelector('[data-battle-move-detail]');
    if(detail)detail.innerHTML=V.details(state.id,{currentPP:state.id===165?undefined:state.p.pp[state.id]});
    for(const button of scene.querySelectorAll('[data-move-id]'))button.classList.toggle('is-previewed',Number(button.dataset.moveId)===state.id);
  }

  function enemyProgress(fight){const total=fight.enemyTeam.length,remaining=Math.max(0,total-fight.enemyIndex-(fight.enemy.hp<=0?1:0));return `${remaining} / ${total} Pokémon remaining`;}

  function markup(fight,assets) {
    assets=assets||{};const p=lead(fight)||fight.party[0]||fight.enemy,e=fight.enemy,dest=(assets.destinations||{})[fight.destination]||{},boss=fight.kind==='boss',trainerBattle=['trainer','elite'].includes(fight.kind),wild=['wild','rare'].includes(fight.kind);
    const backdrop=(boss&&dest.boss)||dest.battle||`adventure/art/${fight.destination}-battle.png`,inv=fight.inventory||assets.inventory||{},trainer=fight.trainer;
    const trainerName=trainer&&(trainer.name||trainer.class)||'Trainer';
    const trainerKey=trainer&&(trainer.sprite||trainer.classKey||trainer.class),trainerAsset=trainerBattle&&!(fight.context==='regional'&&trainer?.city)?((assets.trainers||{})[trainerKey]||trainer?.image||dest.trainer):null;
    const banner=boss?`${e.name} · Area guardian`:trainerBattle?`${trainerName} challenges you!`:`A wild ${e.name} appeared!`;
    const balls=trainerBattle?'':Object.keys(BALLS).map(key=>`<button type="button" data-adv-battle="ball" data-key="${key}" data-item="${key}"${!inv[key]?' disabled':''}><span class="adv-battle-item adv-battle-item--${key}" aria-hidden="true"></span>${BALLS[key].name}<small data-item-count="${key}">×${Number(inv[key]||0)}</small></button>`).join('');
    const berry=trainerBattle?'':`<button type="button" data-adv-battle="berry" data-item="berry"${inv.berry?'':' disabled'}>Berry<small data-item-count="berry">×${Number(inv.berry||0)}</small></button>`;
    const switches=fight.party.map(member=>`<button type="button" data-adv-battle="switch" data-key="${esc(member.key)}"${member.hp<=0||member.key===fight.leadKey?' disabled':''}><img src="${esc(actorAsset(assets,member,false))}" data-back-src="${esc(actorAsset(assets,member,true))}" alt=""><span>${esc(member.name)}<small data-party-hp="${esc(member.key)}">${Math.ceil(member.hp)} / ${member.maxHp} HP${member.status?' · '+esc(statusName(member.status)):''}</small></span></button>`).join('');
    return `<section class="adventure-battle${boss?' adventure-battle--boss':''}${e.shiny?' adventure-battle--shiny':''}" data-fight-id="${esc(fight.id)}" style="--adv-battle-backdrop:url('${esc(backdrop)}')"><div class="adv-battle-scene"><p class="adv-battle-banner">${esc(banner)}</p>${trainerBattle?`<p class="adv-battle-enemy-progress" data-enemy-progress>${esc(enemyProgress(fight))}</p>`:''}${fight.bossModifier?`<p class="adv-battle-modifier">${esc(fight.bossModifier.name)} · ${esc(fight.bossModifier.text)}</p>`:''}${trainerAsset?`<img class="adv-battle-trainer" src="${esc(trainerAsset)}" alt="${esc(trainerName)}">`:''}${hpHud(e,'enemy')}${hpHud(p,'player')}<div class="adv-battle-actor adv-battle-actor--enemy" data-battle-actor="enemy"><img data-actor-image src="${esc(actorAsset(assets,e,false))}" alt="${esc(e.name)}"><span class="adv-battle-sparkles" aria-hidden="true"></span></div><div class="adv-battle-actor adv-battle-actor--player" data-battle-actor="player"><img data-actor-image src="${esc(actorAsset(assets,p,true))}" alt="${esc(p.name)}"></div><div class="adv-battle-effect" data-battle-effect aria-hidden="true"></div><div class="adv-battle-ball" data-battle-ball aria-hidden="true"></div></div><div class="adv-battle-console"><p class="adv-battle-message" data-battle-message role="status" aria-live="polite">${esc(fight.lastAction?.text||banner)}</p><div class="adv-battle-command-panel"><p data-battle-prompt>What will ${esc(p.name)} do?</p><div class="adv-battle-command-grid"><button type="button" data-adv-command="battle-fight" aria-expanded="false"><b>FIGHT</b><small>Choose a move</small></button><button type="button" data-adv-command="battle-bag" aria-expanded="false"><b>BAG</b><small>${trainerBattle?'Healing supplies':'Supplies &amp; capture'}</small></button><button type="button" data-adv-command="battle-switch" aria-expanded="false"><b>POKÉMON</b><small>Choose your lead</small></button>${wild?'<button type="button" data-adv-battle="flee"><b>LEAVE</b><small>End this wild encounter</small></button>':'<p class="adv-battle-trainer-rule">Win the battle with your party.</p>'}</div></div><div class="adv-battle-drawer" data-battle-drawer="fight" hidden role="region" aria-label="Fight moves"><div class="adv-battle-drawer-title"><strong>FIGHT</strong><button type="button" data-adv-command="battle-close" aria-label="Close moves">×</button></div><div class="adv-battle-moves adv-move-grid" data-battle-moves>${moveButtons(p)}</div><div class="adv-move-info" data-battle-move-detail aria-live="polite">${V.details(firstMovePreview(p),{currentPP:p.pp[firstMovePreview(p)]})}</div></div><div class="adv-battle-drawer" data-battle-drawer="bag" hidden role="region" aria-label="Battle bag"><div class="adv-battle-drawer-title"><strong>BAG</strong><button type="button" data-adv-command="battle-close" aria-label="Close bag">×</button></div><div class="adv-battle-supplies">${berry}<button type="button" data-adv-battle="potion" data-item="potion"${inv.potion&&p.hp<p.maxHp?'':' disabled'}>Potion<small data-item-count="potion">×${Number(inv.potion||0)}</small></button>${balls}</div><p data-catch-hint>${trainerBattle?'Trainer Pokémon cannot be caught.':`Weaken your opponent to improve the catch. Berry boost ×${fight.berryBoost.toFixed(1)}.`}</p></div><div class="adv-battle-drawer" data-battle-drawer="switch" hidden role="region" aria-label="Battle Pokémon"><div class="adv-battle-drawer-title"><strong>POKÉMON</strong><button type="button" data-adv-command="battle-close" aria-label="Close party">×</button></div><div class="adv-battle-party">${switches}</div></div></div></section>`;
  }

  function update(host,fight) {

    const scene=host.matches?.('.adventure-battle')?host:host.querySelector('.adventure-battle');if(!scene)return;

    const p=lead(fight)||fight.party[0], e=fight.enemy;

    for(const [side,row] of [['enemy',e],['player',p]]) {

      if(!row)continue;const hud=scene.querySelector(`[data-battle-hud="${side}"]`);if(!hud)continue;

      hud.querySelector('[data-hud-name]').textContent=row.name;hud.querySelector('[data-hud-level]').textContent=`Lv.${row.level}`;

      const fill=hud.querySelector('[data-hp-fill]');fill.style.width=`${row.hp/row.maxHp*100}%`;fill.dataset.tone=row.hp/row.maxHp<=.2?'low':row.hp/row.maxHp<=.5?'mid':'high';

      hud.querySelector('[data-hp-text]').textContent=`${Math.ceil(row.hp)} / ${row.maxHp}`;

      const status=hud.querySelector('[data-hud-status]');if(status)status.textContent=statusName(row.status);if(side==='player'){const need=P.xpNeeded(row.level),xp=Math.max(0,Number(row.xp)||0),xpFill=hud.querySelector('[data-xp-fill]'),xpText=hud.querySelector('[data-xp-text]'),xpTrack=hud.querySelector('[data-xp-track]');if(xpFill)xpFill.style.width=`${Math.min(100,xp/need*100)}%`;if(xpText)xpText.textContent=`${xp} / ${need} EXP`;if(xpTrack){xpTrack.setAttribute('aria-valuenow',xp);xpTrack.setAttribute('aria-valuemax',need);}}

      const track=hud.querySelector('[data-hp-track]');track.setAttribute('aria-valuenow',row.hp);track.setAttribute('aria-valuemax',row.maxHp);track.setAttribute('aria-label',`${row.name} HP`);

      const actor=scene.querySelector(`[data-battle-actor="${side}"]`);if(side==='enemy'){const img=actor.querySelector('img');img.src=actorAsset((typeof window!=='undefined'&&window.LuckyDexAdventureAssets)||{},e,false);img.alt=e.name;}actor.classList.toggle('is-fainted',row.hp<=0);actor.classList.toggle('is-caught',side==='enemy'&&fight.result?.kind==='capture');

      if(side==='player') {

        const button=Array.from(scene.querySelectorAll('[data-adv-battle="switch"]')).find(b=>b.dataset.key===row.key), image=actor.querySelector('img');

        if(button) {const thumbnail=button.querySelector('img'),src=thumbnail.dataset.backSrc||thumbnail.getAttribute('src');if(image.getAttribute('src')!==src)image.src=src;image.alt=row.name;}

      }

    }

    const prompt=scene.querySelector('[data-battle-prompt]');prompt.textContent=fight.phase==='terminal'?(fight.result?.kind==='capture'?'A new travel companion!':fight.result?.kind==='victory'?'Victory!':'Encounter complete'):`What will ${p.name} do?`;

    const moves=scene.querySelector('[data-battle-moves]');if(moves)moves.innerHTML=moveButtons(p);menu(scene,p);

    const progress=scene.querySelector('[data-enemy-progress]');if(progress)progress.textContent=enemyProgress(fight);

    if(fight.lastAction)scene.querySelector('[data-battle-message]').textContent=fight.lastAction.text;

    for(const button of scene.querySelectorAll('[data-adv-battle]')) {

      const cmd=button.dataset.advBattle;button.disabled=fight.phase!=='active';if(button.dataset.moveId&&Number(button.dataset.moveId)!==165)button.disabled ||= !(p.pp[button.dataset.moveId]>0);

      if(cmd==='switch') {const member=fight.party.find(m=>m.key===button.dataset.key);button.disabled ||= !member||member.hp<=0||member.key===fight.leadKey;if(member)button.querySelector('[data-party-hp]').textContent=`${Math.ceil(member.hp)} / ${member.maxHp} HP${member.status?' · '+statusName(member.status):''}${member.key===fight.leadKey?' · LEAD':''}`;}

      const item=button.dataset.item;

      if(item) {const count=fight.inventory?.[item];if(count!=null) {button.querySelector('[data-item-count]').textContent=`×${count}`;button.disabled ||= count<1;}else button.disabled ||= Number((button.querySelector('[data-item-count]').textContent||'').replace('×',''))<1;

        if(item==='potion')button.disabled ||= p.hp>=p.maxHp;if(cmd==='ball')button.disabled ||= ['trainer','elite'].includes(fight.kind);

      }

    }

    for(const b of scene.querySelectorAll('.adv-battle-command-grid [data-adv-command]'))b.disabled=fight.phase!=='active';

    const hint=scene.querySelector('[data-catch-hint]');if(!['trainer','elite'].includes(fight.kind))hint.textContent=`Weaken your opponent to improve the catch. Berry boost ×${fight.berryBoost.toFixed(1)}.`;

  }

  function updateEventHud(scene,event) {

    if(!event||!['hit','heal'].includes(event.kind)||!event.target)return;

    const hud=scene.querySelector(`[data-battle-hud="${event.target}"]`);if(!hud)return;

    const hp=Math.max(0,Number(event.hp)||0),max=Math.max(1,Number(event.maxHp)||1),ratio=hp/max;

    const fill=hud.querySelector('[data-hp-fill]');if(fill){fill.style.width=`${ratio*100}%`;fill.dataset.tone=ratio<=.2?'low':ratio<=.5?'mid':'high';}

    const text=hud.querySelector('[data-hp-text]');if(text)text.textContent=`${Math.ceil(hp)} / ${max}`;

    const track=hud.querySelector('[data-hp-track]');if(track){track.setAttribute('aria-valuenow',hp);track.setAttribute('aria-valuemax',max);}

  }

  async function animate(host,action,scope,reduced) {

    if(!host||!action||!scope||typeof scope.wait!=='function')return;

    const scene=host.matches?.('.adventure-battle')?host:host.querySelector('.adventure-battle');if(!scene)return;

    const active=()=>!scope.disposed&&(typeof scope.isActive!=='function'||scope.isActive());

    const wait=async ms=>{await scope.wait(ms);return active();};

    const classes=[], actorStates=[];const add=(node,name)=>{if(node){node.classList.add(name);classes.push([node,name]);}};

    const playerActor=scene.querySelector('[data-battle-actor="player"]'), playerImage=playerActor?.querySelector('img');

    const finalImage=playerImage?{src:playerImage.getAttribute('src'),alt:playerImage.alt}:null;

    const showPlayer=key=>{const button=Array.from(scene.querySelectorAll?.('[data-adv-battle="switch"]')||[]).find(b=>b.dataset.key===key), thumbnail=button?.querySelector('img');if(playerImage&&thumbnail){playerImage.src=thumbnail.dataset.backSrc||thumbnail.getAttribute('src');playerImage.alt=button.querySelector('span')?.firstChild?.textContent||'';}};

    try {

      if(!active())return;

      if(reduced) {scene.querySelector('[data-battle-message]').textContent=action.text;return;}

      if(action.kind==='intro') {add(scene,'is-entering');await wait(320);return;}

      for(const side of ['player','enemy']) {const actor=scene.querySelector(`[data-battle-actor="${side}"]`);if(actor){actorStates.push({actor,fainted:actor.classList.contains('is-fainted'),caught:actor.classList.contains('is-caught')});actor.classList.remove('is-fainted');actor.classList.remove('is-caught');}}

      if(action.beforeLead)showPlayer(action.beforeLead.key);

      if(action.kind==='ball') {

        const ball=scene.querySelector('[data-battle-ball]'),enemy=scene.querySelector('[data-battle-actor="enemy"]');

        ball.dataset.ball=action.ball;add(ball,'is-thrown');if(!await wait(170))return;add(enemy,'is-capturing');add(ball,'is-landed');

        if(!await wait(80))return;

        for(let i=0;i<action.shakes;i++) {ball.classList.remove('is-shaking');void ball.offsetWidth;ball.classList.add('is-shaking');if(!await wait(100))return;}

        ball.classList.remove('is-shaking');

        if(action.captureSuccess){add(ball,'is-caught');add(scene,'is-capture-success');await wait(100);}else {add(enemy,'is-breakout');await wait(120);}

      }

      for(const event of action.events||[]) {

        if(!active())return;

        if(event.kind==='hit') {

          if(event.source==='enemy') {

            scene.querySelector('[data-battle-message]').textContent=`${scene.querySelector('[data-battle-actor="enemy"] img')?.alt||'The opponent'} used ${event.moveName||MOVES[event.type]||'Attack'}!`;

            if(!await wait(ENEMY_TURN_DELAY))return;

          }

          const source=scene.querySelector(`[data-battle-actor="${event.source}"]`), target=scene.querySelector(`[data-battle-actor="${event.target}"]`);

          add(source,'is-attacking');add(target,'is-hit');if(event.eff>1)add(scene,'is-super-effective');

          const effect=scene.querySelector('[data-battle-effect]');effect.dataset.type=event.type;effect.dataset.target=event.target;add(effect,'is-active');

          if(!await wait(190))return;updateEventHud(scene,event);scene.querySelector('[data-battle-message]').textContent=event.text;

          source?.classList.remove('is-attacking');target?.classList.remove('is-hit');effect.classList.remove('is-active');scene.classList.remove('is-super-effective');

          if(event.fainted) {add(target,'is-fainting');if(!await wait(170))return;}

          if(!await wait(HIT_HOLD))return;

        } else if(event.kind==='heal') {const actor=scene.querySelector(`[data-battle-actor="${event.target}"]`);add(actor,'is-healing');if(!await wait(170))return;updateEventHud(scene,event);scene.querySelector('[data-battle-message]').textContent=event.text;actor?.classList.remove('is-healing');if(!await wait(180))return;}

        else if(event.kind==='berry') {const actor=scene.querySelector(`[data-battle-actor="${event.target}"]`);add(actor,'is-healing');if(!await wait(170))return;actor?.classList.remove('is-healing');}

        else if(event.kind==='miss') {scene.querySelector('[data-battle-message]').textContent=event.text;if(!await wait(320))return;}

        else if(event.kind==='modifier') {scene.querySelector('[data-battle-message]').textContent=event.text;if(!await wait(280))return;}

        else if(event.kind==='switch') {showPlayer(event.key);playerActor?.classList.remove('is-fainting');if(!await wait(220))return;}

      }

      if(active())scene.querySelector('[data-battle-message]').textContent=action.text;

    } finally {

      for(const [node,name] of classes)node.classList.remove(name);scene.querySelector('[data-battle-ball]')?.classList.remove('is-shaking');

      for(const state of actorStates){if(state.fainted)state.actor.classList.add('is-fainted');if(state.caught)state.actor.classList.add('is-caught');}

      if(finalImage){playerImage.src=finalImage.src;playerImage.alt=finalImage.alt;}

    }

  }

  return Object.freeze({create,act,markup,update,animate,migrateFight,stats,effectiveness});

});

