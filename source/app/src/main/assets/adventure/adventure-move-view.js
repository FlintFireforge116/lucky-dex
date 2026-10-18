(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexMoveView=api;})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const D=(typeof window!=='undefined'&&window.LuckyDexMoveData)||(typeof require==='function'?require('./adventure-move-data.js'):null);
  const cap=value=>String(value||'').replace(/(^|[ -])([a-z])/g,(_,space,c)=>space+c.toUpperCase());
  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function describe(value,opts){
    opts=opts||{};const m=typeof value==='object'?value:D.moves[value];if(!m)return null;
    const damaging=m.damageClass!=='status',effect=m.effect||{},sentences=[],effectId=Number(m.effectId);
    const statNames={2:'Attack',3:'Defense',4:'Sp. Atk',5:'Sp. Def',6:'Speed',7:'Accuracy',8:'Evasion'};
    const specialUtility=effect.ailment==='protect'||[112,279,307,350,356,362,384,407,472].includes(effectId)||/Shield|Bulwark|Obstruct/.test(m.name);
    if(damaging)sentences.push('Deals '+m.damageClass+' damage.');
    else if(effectId===38)sentences.push('Fully restores the user’s HP, cures its current status, and puts it to sleep.');
    else if(effectId===26)sentences.push('Resets all battle stat changes on both sides.');
    else if(effectId===103)sentences.push('Cures status conditions across the user’s party.');
    else if(effectId===48)sentences.push('Raises the user’s critical-hit chance.');
    else if([116,137,138,165].includes(effectId)||m.name==='Snowscape')sentences.push('Changes the battle weather for several turns, affecting damage and residual effects.');
    else if(effectId===91)sentences.push('Forces the target to repeat its last move for several turns.');
    else if(effectId===87)sentences.push('Disables the target’s last move for several turns.');
    else if(effectId===107)sentences.push('Prevents the target from escaping or switching for several turns.');
    else if(effectId===115)sentences.push('Starts a three-count on both active battlers; a battler still present at zero faints.');
    else if(effectId===154)sentences.push('Escapes from a wild encounter; it fails in trainer battles.');
    else if(effectId===226)sentences.push('Creates a Tailwind that doubles the user’s Speed for several turns.');
    else if(effectId===260)sentences.push('Creates Trick Room, reversing Speed order for equal-priority moves.');
    else if(effectId===92)sentences.push('Averages the user’s and target’s current HP.');
    else if(effectId===143)sentences.push('Costs half the user’s maximum HP to maximize Attack.');
    else if(effectId===176)sentences.push('Taunts the target, preventing status moves for several turns.');
    else if(effectId===180)sentences.push('Makes a delayed wish that restores HP.');
    else if([182,252].includes(effectId))sentences.push('Gradually restores the user’s HP each turn.');
    else if(effectId===295)sentences.push('Changes the target to pure Water type for the battle.');
    else if(effectId===348)sentences.push('Reverses the target’s battle stat changes.');
    else if(effectId===399)sentences.push('Swaps the user’s and target’s Speed.');
    else if(specialUtility)sentences.push('Protects the user from targeted moves for this turn.');
    else if(effect.ailment==='leech-seed')sentences.push('Seeds the target, draining HP each turn and healing the user.');
    else if(m.role==='heal')sentences.push('Restores the user’s HP.');
    else if(m.role==='buff')sentences.push('Raises the user’s battle stats.');
    else if(m.role==='debuff')sentences.push('Lowers the target’s battle stats.');
    if(damaging&&effect.drain>0)sentences.push('Restores HP based on damage dealt.');
    if(damaging&&effect.drain<0)sentences.push('The user takes recoil damage based on damage dealt.');
    if((effect.flinchChance||0)>0)sentences.push((effect.flinchChance<100?'May ':'Will ')+'make the target flinch if it has not acted yet.');
    if(Array.isArray(effect.statChanges)&&effect.statChanges.length){
      const labels=[...new Set(effect.statChanges.map(x=>statNames[x.statId]).filter(Boolean))];
      if(labels.length)sentences.push(`${damaging&&effect.statChance>0&&effect.statChance<100?'May change':'Changes'} ${labels.join(' / ')} during battle.`);
    }
    const ailments={burn:'burn the target',poison:'poison the target',paralysis:'paralyze the target',sleep:'put the target to sleep',freeze:'put the target to sleep in LuckyDex',yawn:'make the target drowsy; it falls asleep after the following turn',confusion:'confuse the target',trap:'trap the target and deal residual damage'};
    if(ailments[effect.ailment])sentences.push((effect.ailmentChance>0&&effect.ailmentChance<100?'May ':'Can ')+ailments[effect.ailment]+'.');
    if(effectId===39)sentences.push('If it hits a target that is not higher level, it knocks the target out in one hit.');
    if(effectId===41)sentences.push('Cuts the target’s current HP in half.');
    if(effectId===88)sentences.push('Deals fixed damage equal to the user’s level.');
    if(effectId===190)sentences.push('Lowers a healthier target to the user’s current HP.');
    if([100,191,197,220,292,294].includes(effectId))sentences.push('Its power varies with HP, Speed, or weight as appropriate.');
    if(effectId===81)sentences.push('The user must recharge on its next turn.');
    if(!sentences.length)sentences.push('No battle effect is currently implemented in LuckyDex.');
    if(m.id===165)sentences.push('Available without PP when no damaging move has PP; costs a little HP.');
    const max=m.pp==null?'—':String(m.pp),current=opts.currentPP;
    return {id:m.id,name:m.name,type:cap(m.type),category:cap(m.damageClass),power:damaging?(m.power==null?'Variable':String(m.power)):'—',accuracy:m.accuracy==null?'Always hits':m.accuracy+'%',pp:current==null?max:String(Math.max(0,Number(current)||0))+' / '+max,maxPP:m.pp,priority:Number(m.priority)||0,description:sentences.join(' ')};
  }

  function markup(value,opts){const m=describe(value,opts);if(!m)return '';return `<article class="adv-move-card" data-move-card="${esc(m.id)}"><div class="adv-move-card-heading"><strong>${esc(m.name)}</strong><span class="adv-move-type">${esc(m.type)}</span></div><p class="adv-move-category">${esc(m.category)}</p><dl class="adv-move-values"><div><dt>Power</dt><dd>${esc(m.power)}</dd></div><div><dt>Accuracy</dt><dd>${esc(m.accuracy)}</dd></div><div><dt>PP</dt><dd>${esc(m.pp)}</dd></div></dl><p class="adv-move-description">${esc(m.description)}</p></article>`;}
  function compact(value,opts){const m=describe(value,opts);if(!m)return '';return `<b class="adv-move-name">${esc(m.name)}</b><span class="adv-move-meta"><span>${esc(m.type)} · ${esc(m.category)}</span><strong>Power ${esc(m.power)} · PP ${m.id===165?'∞':esc(m.pp)}</strong></span>`;}
  function details(value,opts){const m=describe(value,opts);if(!m)return '';return `<div class="adv-move-detail" data-move-card="${esc(m.id)}"><div><strong>${esc(m.name)}</strong><span>Power ${esc(m.power)} · Accuracy ${esc(m.accuracy)}</span></div><p>${esc(m.description)}</p></div>`;}
  function statusName(value){return {poison:'Poisoned',poisoned:'Poisoned',burn:'Burned',burned:'Burned',paralysis:'Paralyzed',paralyze:'Paralyzed',paralyzed:'Paralyzed',sleep:'Asleep',freeze:'Asleep'}[value]||(value?'Affected':'Healthy');}
  return Object.freeze({describe,markup,compact,details,statusName});
});
