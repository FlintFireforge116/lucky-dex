'use strict';
const effects=require('../../app/src/main/assets/tcgp-battle-effects.js');
const {TYPES,clean}=require('./tcgp-normalize.cjs');
function validateCatalogue(data){
 const errors=[],ids=new Set(),prints=new Set(),sets=new Set((data.sets||[]).map(s=>s.id)),names=new Set((data.cards||[]).map(c=>clean(c.name).toLowerCase()));
 function effect(e,label){if(!e)return;try{for(const message of effects.validateEffect(e))errors.push(label+' effect: '+message);}catch(err){errors.push(label+' effect: '+err.message);}}
 function strings(value,label){if(typeof value==='string'&&(/\[object Object\]|\bundefined\b|\bNaN\b/.test(value)||/[\u0000-\u0008]/.test(value)))errors.push(label+' unsafe display string');else if(value&&typeof value==='object')for(const [k,v]of Object.entries(value))strings(v,label+'.'+k);if(typeof value==='number'&&!Number.isFinite(value))errors.push(label+' non-finite number');}
 for(const c of data.cards||[]){
  const label=c.id||'missing-id';if(!c.id||ids.has(c.id))errors.push('Duplicate or missing gameplay ID '+label);ids.add(c.id);strings(c,label);
  if(!c.name||!['pokemon','trainer'].includes(c.kind))errors.push(label+' invalid card category/name');
  if(!c.support||!['FULL','PARTIAL','UNSUPPORTED'].includes(c.support.status)||!Array.isArray(c.support.reasons))errors.push(label+' invalid support classification');
  if(c.battleEnabled!==(c.support?.status==='FULL'))errors.push(label+' battle enablement contradicts support');
  if(c.support?.status!=='FULL'&&!c.support?.reasons?.length)errors.push(label+' unsupported without reason');
  if(c.support?.status==='FULL'&&c.support.reasons.length)errors.push(label+' FULL has unresolved reasons');
  if(c.kind==='pokemon'&&c.support?.status==='FULL'){
   if(!Number.isInteger(c.hp)||c.hp<=0)errors.push(label+' invalid HP');
   if(!TYPES.includes(c.subtype))errors.push(label+' invalid Pokémon type');
   if(!['Basic','Stage 1','Stage 2'].includes(c.stage))errors.push(label+' invalid stage');
   if(c.stage!=='Basic'&&(!c.evolvesFrom||!names.has(clean(c.evolvesFrom).toLowerCase())))errors.push(label+' invalid evolution reference '+c.evolvesFrom);
   if(!Number.isInteger(c.retreat)||c.retreat<0)errors.push(label+' invalid retreat');
   if(c.weakness&&!TYPES.includes(c.weakness))errors.push(label+' invalid weakness');
   if(![1,2,3].includes(c.points))errors.push(label+' invalid point rule');
   if(!Array.isArray(c.attacks)||!c.attacks.length)errors.push(label+' missing attacks');
  }
  if(c.kind==='trainer'&&c.support?.status==='FULL'&&!['Item','Supporter','Tool','Stadium'].includes(c.trainerType))errors.push(label+' invalid Trainer subtype');
  for(const a of c.attacks||[]){if(!a.name||!Number.isFinite(a.damage)||a.damage<0||typeof a.cost!=='string'||/[^GRWLPFDMC]/.test(a.cost))errors.push(label+' invalid attack/Energy structure');effect(a.effect,label);}
  effect(c.effect,label);for(const a of c.abilities||[c.ability].filter(Boolean))effect(a.effect,label);
 }
 for(const p of data.prints||[]){if(prints.has(p.id))errors.push('Duplicate print ID '+p.id);prints.add(p.id);if(!ids.has(p.gameplayId))errors.push('Unresolved gameplay ID '+p.id+' -> '+p.gameplayId);if(!sets.has(p.setId))errors.push('Invalid print set '+p.id);}
 return errors;
}
module.exports={validateCatalogue};
