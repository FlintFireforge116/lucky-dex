/* LuckyDex v0.69.135 — shared rule-derived deck planning metadata.
 * No rule changes: this annotates already battle-enabled effects for builders.
 * Classification is derived from executable effect trees plus printed text.
 * Overrides are reserved for rules whose executable effect is implemented by a
 * separate battle hook (e.g. Classic Stadiums). */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.LuckyDexDeckSynergy=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const THEMES=Object.freeze([
  {id:'any',label:'Balanced / Any'},
  {id:'sleep',label:'Sleep control'},
  {id:'poison',label:'Poison pressure'},
  {id:'burn',label:'Burn pressure'},
  {id:'paralysis',label:'Paralysis control'},
  {id:'healing',label:'Healing / stall'},
  {id:'energy',label:'Energy acceleration'},
  {id:'disruption',label:'Hand / Energy disruption'}
 ]);
 const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'];
 const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const statusAlias={sleep:'sleep',asleep:'sleep',poison:'poison',poisoned:'poison',burn:'burn',burned:'burn',paralyze:'paralysis',paralyzed:'paralysis',paralysis:'paralysis',confusion:'confusion',confused:'confusion'};
 const getStatus=s=>statusAlias[normalize(s)]||'';
 const extra={
  'SNAPFLORIO-109':{inflicts:['sleep'],roles:['disruption']},
  'SNAPFOUNJA-080':{energyTypes:['Grass','Darkness'],roles:['energy']},
  'SNAPFOUNJA-076':{energyTypes:['Grass','Psychic'],roles:['energy']},
  'SNAPFOUNJA-078':{energyTypes:['Water'],roles:['retreat']},
  'SNAPFOUNJA-082':{energyTypes:['Water','Fighting'],roles:['stall']},
  'sv1-167':{stages:['Basic'],roles:['retreat']},
  'sv1-178':{roles:['search']},
  'sv1-168':{roles:['disruption']},
  'sv1-170':{roles:['energy'],energyTypes:['Lightning']},
  'sv1-171':{roles:['energy']},
  'sv1-172':{roles:['energy']},
  'sv1-173':{roles:['energy']},
  'sv1-174':{roles:['energy']},
  'sv1-179':{roles:['search','draw']},
  'sv1-184':{roles:['healing']},
  'sv1-192':{roles:['stall'],energyTypes:['Fighting']},
  'sv1-195':{roles:['disruption']},
  'sv1-197':{roles:['disruption']},
  // Both EX Dragon Stadiums support two types, not just the last named type.
  'ex3-85':{roles:['retreat'],energyTypes:['Fire','Water']},
  'ex3-86':{roles:['stall'],energyTypes:['Grass','Lightning']},
  'ex3-82':{roles:['retreat']},
  'ex3-84':{roles:['energy']}
 };
 const cache=new WeakMap();
 function metadata(card){
  if(!card||typeof card!=='object')return {roles:[],inflicts:[],payoffs:[],energyTypes:[],stages:[],sources:[]};
  const saved=cache.get(card);if(saved)return saved;
  const roles=new Set(),inflicts=new Set(),payoffs=new Set(),energyTypes=new Set(),stages=new Set(),sources=new Set();
  const effects=[card.effect,...(card.attacks||[]).map(a=>a.effect),...(Array.isArray(card.abilities)?card.abilities:card.ability?[card.ability]:[]).map(a=>a.effect)];
  const seen=new Set();
  const walk=(e)=>{
   if(!e||typeof e!=='object'||seen.has(e))return;seen.add(e);
   const t=normalize(e.type).replace(/ /g,''),s=getStatus(e.status);
   if(t==='status'&&s){if(['self','selfActive','selfPokemon'].includes(e.target))roles.add('self-status');else inflicts.add(s);}
   if(e.condition){const c=e.condition,status=getStatus(c.status);if(c.type==='opponentStatus'&&status)payoffs.add(status);}
   if(/heal|recover|rejuvenat|cure/.test(t))roles.add('healing');
   if(/draw|search|lookattop/.test(t))roles.add(t.includes('search')?'search':'draw');
   if(/attach|accelerat|moveenergy|searchenergy|energyflow|energyretrieval|energytransfer|energygain|energycharge/.test(t)&&!/discard/.test(t))roles.add('energy');
   if(/retreat|switch|moveactive/.test(t))roles.add('retreat');
   if(/discard|hand|deck|block|prevent|shuffle|lock/.test(t)&&!(e.target==='self'&&/discard/.test(t)))roles.add('disruption');
   if(/preventdamage|reducedamage|shield|damageblock/.test(t))roles.add('stall');
   const f=e.filter||{};
   if(f.subtype&&TYPES.includes(f.subtype))energyTypes.add(f.subtype);
   if(f.energyType&&TYPES.includes(f.energyType))energyTypes.add(f.energyType);
   if(f.stage)stages.add(f.stage);
   if(e.energyType&&TYPES.includes(e.energyType)&&card.kind==='trainer')energyTypes.add(e.energyType);
   if(f.hasEnergyType&&TYPES.includes(f.hasEnergyType))energyTypes.add(f.hasEnergyType);
   if(f.energyTypeAtLeast?.type&&TYPES.includes(f.energyTypeAtLeast.type))energyTypes.add(f.energyTypeAtLeast.type);
   if(e.scope==='both'&&e.type==='modifier'&&f.subtype)energyTypes.add(f.subtype);
   for(const child of [e.effect,e.heads,e.tails,...(Array.isArray(e.effects)?e.effects:[])])walk(child);
  };
  effects.forEach(walk);
  const texts=[card.printedRules,card.text,...(card.attacks||[]).map(a=>a.text),...(card.abilities||[]).map(a=>a.text)].filter(Boolean).join(' ');
  const low=texts.toLowerCase();
  // Prefer positive action descriptions. The word "Asleep" in "can't be
  // Asleep" is neither an inflicter nor a Sleep payoff.
  for(const [phrase,status] of [['asleep','sleep'],['poisoned','poison'],['burned','burn'],['paralyzed','paralysis'],['confused','confusion']]){
   if(new RegExp(`(?:opponent(?:'s)?|defending)[^.]{0,75}(?:is now|becomes|make(?:s)?|put(?:s)?)[^.]{0,35}\\b${phrase}\\b`).test(low))inflicts.add(status);
   if(new RegExp(`(?:if|while|whenever|when)\\s+(?:the\\s+)?(?:defending\\s+pok[eé]mon|opponent(?:'s)?\\s+pok[eé]mon)[^.]{0,65}\\b(?:is|has|was)\\s+(?:already\\s+)?${phrase}\\b`).test(low))payoffs.add(status);
  }
  if(/heal \d|heal all|recover \d|remove \d+ damage/.test(low))roles.add('healing');
  if(/draw \d|draw cards|draw until/.test(low))roles.add('draw');
  if(/search your deck|search their deck/.test(low))roles.add('search');
  if(/attach.*energy|move.*energy.*pokemon/.test(low))roles.add('energy');
  if(/retreat cost|switch (?:your|this|the) active|switch .*bench/.test(low))roles.add('retreat');
  if(/discard .*opponent|opponent.*discard|opponent.*can't play|shuffle.*opponent/.test(low))roles.add('disruption');
  if(/prevent all damage|takes? \d+ less damage/.test(low))roles.add('stall');
  // A card's condition can be in an activated/passive rule rather than attacks.
  // Infer *target restrictions* only for Trainers: a Pokémon's mention of a
  // type describes its own effects, not what support Pokémon are legal.
  if(card.kind==='trainer'){
   for(const type of TYPES){
    const r=new RegExp(`\\b${type} (?:Energy|Pok[eé]mon)\\b`,'i');
    if(r.test(texts)&&!(/opponent(?:'s|s)?[^.]{0,45}\b(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal)\b/i.test(texts)))energyTypes.add(type);
   }
   if(/Basic Pok[eé]mon(?: in play| you control| have)/i.test(texts)&&/retreat|attach|attack|damage|heal/i.test(texts))stages.add('Basic');
  }
  // Set-owned rule annotations supplement generic effect-tree inference.
  // This is especially important for named legacy effects / triggered Powers.
  for(const override of [extra[card.id],card.deckMeta]){
   if(!override)continue;
   for(const x of override.roles||[])roles.add(x);
   for(const x of override.inflicts||[])inflicts.add(x);
   for(const x of override.payoffs||[])payoffs.add(x);
   for(const x of override.energyTypes||[])energyTypes.add(x);
   for(const x of override.stages||[])stages.add(x);
  }
  if(card.kind==='pokemon')for(const t of card.types||[])sources.add(t);
  const result=Object.freeze({roles:[...roles],inflicts:[...inflicts],payoffs:[...payoffs],energyTypes:[...energyTypes],stages:[...stages],sources:[...sources]});
  cache.set(card,result);return result;
 }
 function context(pokemon=[],energy=[],theme='any'){
  const mons=pokemon.filter(x=>x?.kind==='pokemon'),profile=mons.map(metadata),statusInflict=new Set(profile.flatMap(p=>p.inflicts)),payoffs=new Set(profile.flatMap(p=>p.payoffs)),types=new Set([...energy,...mons.flatMap(c=>c.types||[])]),stages=new Set(mons.map(c=>c.stage));
  return {pokemon:mons,energy:new Set(energy),types,stages,statusInflict,payoffs,theme:THEMES.some(t=>t.id===theme)?theme:'any'};
 }
 function trainerScore(card,ctx){
  if(!card||card.kind!=='trainer')return -Infinity;
  const p=metadata(card);
  // Exact hard mismatch: never add Stadiums or Tools that only improve Pokémon
  // types and evolution stages absent from the target deck. This is separate
  // from their generic usefulness and does not force a matching type in the
  // Energy Zone when the card explicitly affects a Pokémon type.
  if(p.energyTypes.length&&!p.energyTypes.some(t=>ctx.types.has(t)))return -Infinity;
  if(p.stages.length&&!p.stages.some(s=>ctx.stages.has(s)))return -Infinity;
  // Conditional payoff without any source is usually dead. A Sleep-themed deck
  // can take a Sleep enabler even before its other attackers have been chosen.
  if(p.payoffs.length&&!p.payoffs.some(s=>ctx.statusInflict.has(s)||p.inflicts.includes(s)))return -Infinity;
  let score=8;
  const value={draw:37,search:35,healing:20,energy:25,retreat:16,disruption:15,stall:18};
  for(const role of p.roles)score+=value[role]||0;
  if(p.inflicts.includes(ctx.theme))score+=70;
  if(p.payoffs.includes(ctx.theme))score+=70;
  if(ctx.theme==='healing'&&(p.roles.includes('healing')||p.roles.includes('stall')))score+=42;
  if(ctx.theme==='energy'&&p.roles.includes('energy'))score+=42;
  if(ctx.theme==='disruption'&&p.roles.includes('disruption'))score+=42;
  if(p.energyTypes.length)score+=8;
  return score;
 }
 function pokemonThemeScore(card,theme='any'){
  if(!card||card.kind!=='pokemon'||theme==='any')return 0;
  const p=metadata(card);
  if(['sleep','poison','burn','paralysis'].includes(theme))return (p.inflicts.includes(theme)?130:0)+(p.payoffs.includes(theme)?145:0);
  if(theme==='healing')return (p.roles.includes('healing')?85:0)+(p.roles.includes('stall')?65:0);
  if(theme==='energy')return p.roles.includes('energy')?100:0;
  if(theme==='disruption')return p.roles.includes('disruption')?100:0;
  return 0;
 }
 function matchesTheme(card,theme='any'){
  if(theme==='any')return true;
  if(card.kind==='pokemon')return pokemonThemeScore(card,theme)>0;
  const p=metadata(card);
  if(['sleep','poison','burn','paralysis'].includes(theme))return p.inflicts.includes(theme)||p.payoffs.includes(theme);
  if(theme==='healing')return p.roles.includes('healing')||p.roles.includes('stall');
  if(theme==='energy')return p.roles.includes('energy');
  if(theme==='disruption')return p.roles.includes('disruption');
  return false;
 }
 function report(cards,energy=[],theme='any'){
  const selected=(cards||[]).filter(Boolean),pokemon=selected.filter(c=>c.kind==='pokemon'),trainers=selected.filter(c=>c.kind==='trainer'),ctx=context(pokemon,energy,theme);
  const uniq=a=>[...new Set(a)];
  const enablers=uniq(selected.filter(c=>metadata(c).inflicts.includes(theme)).map(c=>c.name)),payoffs=uniq(selected.filter(c=>metadata(c).payoffs.includes(theme)).map(c=>c.name));
  const support=uniq(trainers.filter(c=>metadata(c).roles.some(r=>['draw','search','energy','healing','retreat'].includes(r))).map(c=>c.name)).slice(0,6);
  const dead=uniq(trainers.filter(c=>trainerScore(c,ctx)===-Infinity).map(c=>c.name));
  const warnings=[];if(dead.length)warnings.push('Unsupported support: '+dead.join(', '));
  if(['sleep','poison','burn','paralysis'].includes(theme)){
   if(!enablers.length)warnings.push('No '+theme+' inflicter in this deck.');
   if(!payoffs.length)warnings.push('No '+theme+' payoff found; this deck relies on the condition itself.');
  }
  return {theme,enablers,payoffs,support,dead,warnings,
    summary:theme==='any'?'Balanced support':THEMES.find(t=>t.id===theme)?.label+' · '+(enablers.length?'Enablers: '+enablers.slice(0,3).join(', '):'Theme role: '+uniq(pokemon.filter(c=>pokemonThemeScore(c,theme)>0).map(c=>c.name)).slice(0,3).join(', '))+(payoffs.length?' · Payoffs: '+payoffs.slice(0,3).join(', '):'')};
 }
 return {THEMES,metadata,context,trainerScore,pokemonThemeScore,matchesTheme,report};
});
