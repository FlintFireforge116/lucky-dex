'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const rows=require('../data/classic/cel25c-print-compact.json');
const assets='../app/src/main/assets/';
const fx=require(assets+'tcgp-battle-effects.js');
// Explicit reviewed mappings, not name-only or collector-number matching.
const mappings={
 '2_A':['base1','base1-2'],'4_A':['base1','base1-4'],'15_A1':['base1','base1-15'],
 '15_A3':['gym-challenge','gym2-15'],'15_A4':['great-encounters','dp4-15'],
 '73_A':['base1','base1-73'],'20_A':['neo-genesis','neo1-20'],'66_A':['neo-revelation','neo3-66'],
 '9_A':['team-magma-aqua','ex4-9'],'86_A':['team-rocket-returns','ex7-86'],
 '88_A':['legend-maker','ex12-88'],'93_A':['dragon-frontiers','ex15-93'],
 '109_A':['rising-rivals','pl2-109'],'145_A':['supreme-victors','pl3-145'],
 '107_A':['heartgold-soulsilver','hgss1-107'],'113_A':['black-white','bw1-113'],
 '114_A':['black-white','bw1-114'],'54_A':['next-destinies','bw4-54'],'60_A':['guardians-rising','sm2-60']
};
const gaps={'15_A2':'Original Item requires persistent face-up Prize display and selection (not the later Supporter).','8_A':'Final Beam needs knockout reaction, coin, status gate and weakness/resistance.','24_A':'Birthday Surprise requires an explicit in-game birthday policy.','17_A':'Dark Ray optional hidden hand discard and Star rules need dedicated outcome tests.'};
const manual={
 '97_A':[{type:'benchDamage',side:'opponent',count:1,amount:30},{type:'lock',action:'attack',target:'self',duration:'nextOwnTurn',attackName:'X Blast'}],
 '76_A':[{type:'benchCountDamage',side:'self',amount:30,mode:'replace'}]
};
function historical(suffix){const m=mappings[suffix];if(!m)return null;const mod=require(assets+'tcg-classic-'+m[0]+'.js');const c=mod.cardById(m[1]);assert.ok(c?.battleEnabled,`Missing playable original ${m[1]}`);return c;}
const cards=rows.map(r=>{
 const [suffix,name,sup,subs,hp,types,parent,attacks,abilities,weak,res,retreat,rarity,rules,number,art,trait]=r;
 const original=historical(suffix), id='cel25c-'+suffix, reason=gaps[suffix];
 if(original){assert.equal(original.kind,sup==='Trainer'?'trainer':'pokemon');if(sup==='Pokémon'){assert.equal(original.name,name);assert.equal(original.hp,Number(hp));assert.deepEqual(original.types,types);assert.equal(original.evolvesFrom??null,parent);assert.equal(original.retreat,retreat);assert.deepEqual((original.attacks||[]).map(a=>[a.name,[...a.cost].join('')]),attacks.map(a=>[a[0],a[1].join('')]));assert.deepEqual((original.abilities||[]).map(a=>a.name),abilities.map(a=>a[0]));}}
 const c={...(original?structuredClone(original):{}),id,name,setId:'cel25c',number,source:'tcg',battleFormat:'classic',kind:sup==='Trainer'?'trainer':'pokemon',rarity,image:`https://images.pokemontcg.io/cel25c/${art}.png`,imageLarge:`https://images.pokemontcg.io/cel25c/${art}_hires.png`,battleEnabled:!reason,deckEligible:!reason,support:{status:reason?'PARTIAL':'FULL',reasons:reason?[reason]:[]},printedRules:rules.join(' § '),reprintOf:original?.id||null};
 if(c.kind==='trainer'){c.trainerType=subs.includes('Supporter')?'Supporter':'Item';c.text=rules.join(' § ');c.effect=original?.effect||{type:'unsupported',reason};}
 else{
  const mega=subs.includes('MEGA'),ex=subs.includes('EX'),oldEx=subs.includes('ex'),gx=subs.includes('GX'),star=subs.includes('Star');
  Object.assign(c,{stage:mega?'Stage 1':subs.includes('Baby')?'Basic':subs[0],hp:Number(hp),types,subtype:types[0],evolvesFrom:parent,retreat,weakness:weak?.type??null,weaknessValue:weak?.value??null,weaknesses:weak?[weak]:[],resistance:res?.type??null,resistanceValue:res?.value??null,resistances:res?[res]:[],ancientTrait:trait,megaEvolution:mega,pokemonEX:ex,pokemonEx:oldEx,isEx:oldEx,pokemonGX:gx,isPokemonGX:gx,pokemonStar:star,isPokemonStar:star,isLevelX:subs.includes('Level-Up'),isPokemonSP:subs.includes('SP'),baby:subs.includes('Baby'),prizeCards:ex||oldEx||gx?2:1,maxDeckCopies:star||name.startsWith('Shining ')?1:4});
  c.tags=[...new Set([...(c.tags||[]).filter(t=>t!=='full-art'),...(ex||oldEx?['pokemon-ex']:[]),...(mega?['mega-evolution']:[]),...(trait?['ancient-trait']:[]),...(gx?['pokemon-gx']:[]),...(star?['pokemon-star']:[])])];
  c.attacks=attacks.map(([title,cost,damage,text],i)=>{const old=original?.attacks?.[i];const effect=old?(old.effect||{type:'noop'}):manual[suffix]?.[i]||{type:'unsupported',reason};const base=damage.includes('×')?0:Number(damage.match(/^\d+/)?.[0]||0);if(old)assert.equal(old.damage,base,`${id} ${title} base damage`);return {...old,name:title,cost:cost.join(''),damage:base,damageText:damage||null,text,gxAttack:title.endsWith('-GX'),effect};});
  c.abilities=abilities.map(([title,type,text],i)=>({...original?.abilities?.[i],name:title,text,printedPowerType:type==='Ability'?'ability':type==='Poké-Body'?'body':'power',effect:original?.abilities?.[i]?.effect||{type:'unsupported',reason}}));
  // The printed reprint text is authoritative when historical metadata is weaker.
  // Claydol and Gardevoir ex are blocked by *any* Special Condition, and
  // Wonder Tag is optional rather than a forced Supporter search.
  for(const power of c.abilities){
   if(['15_A4','93_A'].includes(suffix))power.allSpecialConditions=true;
   if(suffix==='60_A'&&power.name==='Wonder Tag')power.effect={...power.effect,optional:true};
  }
  if(!c.deckMeta)c.deckMeta={roles:[],synergy:[],energyTypes:[...new Set(attacks.flatMap(a=>a[1]).map(s=>({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',Y:'Fairy'})[s]).filter(Boolean))],preferredPartners:parent?[parent]:[]};
 }
 if(!reason){for(const e of [...(c.attacks||[]).map(a=>a.effect),...(c.abilities||[]).map(a=>a.effect),...(c.kind==='trainer'?[c.effect]:[])])assert.deepEqual(fx.validateEffect(e),[],`${id}: invalid ${JSON.stringify(e)}`);}
 return c;
});
process.stdout.write(JSON.stringify(cards));
