(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LuckyDexUnownData=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';

const MODE_CONFIG={
  easy:{durationMs:15000,multiplier:1},
  normal:{durationMs:18000,multiplier:1.3},
  hard:{durationMs:10000,multiplier:1.65},
};

function fold(value){return String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'');}
function normaliseAnswer(value){return fold(value).toUpperCase().replace(/[^A-Z0-9]/g,'');}
function glyphWords(answer){return fold(answer).toUpperCase().split(/\s+/).map(word=>word.replace(/[^A-Z]/g,'')).filter(Boolean);}
function slug(value){return normaliseAnswer(value).toLowerCase()||'entry';}
function entry(category,answer,clue,common=false){return {key:`${category.toLowerCase()}:${slug(answer)}`,answer,category,clue,common};}

const CURATED_ENTRIES=[
  ...[
    ['Kanto','The first main-series region',true],['Johto','Region west of Kanto',true],['Hoenn','Region with land and sea legends',true],['Sinnoh','Region surrounding Mount Coronet',true],['Unova','Region introduced with 156 new species',true],['Kalos','Region known for Mega Evolution',true],['Alola','Island region with regional forms',true],['Galar','Region known for Dynamax',true],['Paldea','Region with the Terastal phenomenon',true],['Hisui','Ancient-era Sinnoh'],['Orre','Region of Pokémon Colosseum'],['Fiore','Pokémon Ranger region'],['Almia','Region from Shadows of Almia'],['Oblivia','Ranger region of island chains'],['Sevii Islands','Islands reached from Kanto'],['Orange Islands','Anime island archipelago'],['Kitakami','Land visited in the Teal Mask'],['Blueberry Academy','Academy in the Indigo Disk'],
  ].map(x=>entry('REGION',...x)),
  ...[
    ['Normal','A Pokémon type',true],['Fire','A Pokémon type',true],['Water','A Pokémon type',true],['Electric','A Pokémon type',true],['Grass','A Pokémon type',true],['Ice','A Pokémon type'],['Fighting','A Pokémon type'],['Poison','A Pokémon type'],['Ground','A Pokémon type'],['Flying','A Pokémon type'],['Psychic','A Pokémon type'],['Bug','A Pokémon type'],['Rock','A Pokémon type'],['Ghost','A Pokémon type'],['Dragon','A Pokémon type'],['Dark','A Pokémon type'],['Steel','A Pokémon type'],['Fairy','A Pokémon type'],
  ].map(x=>entry('TYPE',...x)),
  ...[
    ['Poké Ball','Basic capture device',true],['Great Ball','Improved capture device',true],['Ultra Ball','High-performance capture device',true],['Master Ball','Never fails to catch its target',true],['Premier Ball','Commemorative capture ball'],['Luxury Ball','Helps a caught Pokémon grow friendly'],['Quick Ball','Works best at the start of battle'],['Dusk Ball','Works well at night or in caves'],['Timer Ball','Improves as battle turns pass'],['Repeat Ball','Works better on registered species'],['Dive Ball','Designed for Pokémon in water'],['Net Ball','Works well on Bug and Water types'],['Nest Ball','Works better on lower-level targets'],['Heal Ball','Heals a newly caught Pokémon'],['Moon Ball','Apricorn Ball associated with Moon Stone evolutions'],['Friend Ball','Apricorn Ball that starts friendship high'],['Heavy Ball','Apricorn Ball suited to heavy Pokémon'],['Level Ball','Apricorn Ball using level differences'],['Lure Ball','Apricorn Ball for hooked Pokémon'],['Fast Ball','Apricorn Ball for fast Pokémon'],['Love Ball','Apricorn Ball affected by species and gender'],['Rare Candy','Raises a Pokémon by one level',true],['Potion','Restores HP',true],['Super Potion','Restores more HP'],['Hyper Potion','Strong HP recovery item'],['Full Restore','Restores HP and status'],['Revive','Revives a fainted Pokémon',true],['Max Revive','Fully revives a fainted Pokémon'],['Escape Rope','Leaves caves and dungeons'],['Repel','Keeps weaker wild Pokémon away'],['Max Repel','Long-lasting wild encounter repellent'],['Bicycle','Classic faster travel item'],['Exp Share','Shares experience with the team',true],['Lucky Egg','Boosts experience gained'],['Amulet Coin','Boosts prize money'],['Leftovers','Restores HP each turn',true],['Choice Scarf','Boosts Speed but locks a move'],['Choice Band','Boosts Attack but locks a move'],['Choice Specs','Boosts Special Attack but locks a move'],['Focus Sash','Can prevent a full-HP knockout'],['Life Orb','Boosts moves at an HP cost'],['Eviolite','Boosts defenses of unevolved Pokémon'],
  ].map(x=>entry('ITEM',...x)),
  ...[
    ['Tackle','Basic physical attack',true],['Thunderbolt','Reliable Electric attack',true],['Flamethrower','Reliable Fire attack',true],['Surf','Powerful Water move used for travel',true],['Ice Beam','Reliable Ice attack',true],['Psychic','Signature-style Psychic attack'],['Shadow Ball','Ghost-type projectile',true],['Earthquake','Powerful Ground attack',true],['Solar Beam','Two-turn Grass attack'],['Hyper Beam','Powerful move that needs recovery'],['Quick Attack','Priority Normal attack'],['Protect','Blocks most attacks for a turn',true],['Recover','Restores the user’s HP'],['Swords Dance','Sharply raises Attack'],['Dragon Dance','Raises Attack and Speed'],['Calm Mind','Raises Special Attack and Special Defense'],['Stealth Rock','Entry hazard using floating stones',true],['Spikes','Entry hazard on the ground'],['Toxic','Badly poisons the target'],['Will-O-Wisp','Burns the target'],['Roost','Flying-associated recovery move'],['U-turn','Attack that switches the user out'],['Volt Switch','Electric attack that switches the user out'],['Baton Pass','Switches while passing some effects'],['False Swipe','Cannot reduce the target below one HP',true],['Sleep Powder','Grass powder that causes sleep'],['Spore','Highly accurate sleep move'],['Metronome','Calls a random move'],['Transform','Copies the target’s form and moves'],['Splash','Famously does almost nothing',true],['Fly','Two-turn Flying move used for travel'],['Dig','Two-turn Ground move used for travel'],['Cut','Classic field move for small trees'],['Rock Smash','Classic field move for breakable rocks'],['Waterfall','Water move used to climb waterfalls'],
  ].map(x=>entry('MOVE',...x)),
  ...[
    ['Pallet Town','Where Red begins his Kanto journey',true],['Viridian City','Kanto city near Route 1'],['Pewter City','Home of the Rock-type Kanto Gym'],['Cerulean City','Home of the Water-type Kanto Gym'],['Lavender Town','Kanto town known for Pokémon Tower',true],['Celadon City','Kanto city with a department store'],['Fuchsia City','Kanto city associated with the Safari Zone'],['Saffron City','Kanto city home to Silph Co.'],['Cinnabar Island','Kanto island with a volcano and lab'],['Indigo Plateau','League destination shared by Kanto and Johto',true],['New Bark Town','Starting town in Johto'],['Goldenrod City','Large Johto city with radio tower',true],['Ecruteak City','Johto city of historic towers'],['Olivine City','Johto port city with a lighthouse'],['Mahogany Town','Small Johto town near the Lake of Rage'],['Blackthorn City','Johto city with the Dragon Gym'],['Littleroot Town','Starting town in Hoenn'],['Petalburg City','Hoenn city with Norman’s Gym'],['Mauville City','Central Hoenn city and Game Corner',true],['Fallarbor Town','Hoenn town near Meteor Falls'],['Fortree City','Hoenn city built among trees'],['Lilycove City','Hoenn coastal city with a department store'],['Sootopolis City','Hoenn city inside a crater'],['Ever Grande City','Hoenn Pokémon League location'],['Twinleaf Town','Starting town in Sinnoh'],['Jubilife City','Large early Sinnoh city'],['Hearthome City','Sinnoh city with a Contest Hall'],['Veilstone City','Sinnoh city with Team Galactic activity'],['Snowpoint City','Snowy Sinnoh Gym city'],['Sunyshore City','Coastal Sinnoh city with electric walkways'],['Nuvema Town','Starting town in Unova'],['Castelia City','Large Unova metropolis'],['Nimbasa City','Unova entertainment city'],['Driftveil City','Unova port city'],['Lumiose City','Central Kalos metropolis',true],['Shalour City','Kalos city tied to Mega Evolution'],['Hauoli City','Largest city in Alola'],['Malie City','Ula’ula Island city'],['Motostoke','Industrial Galar city'],['Hammerlocke','Galar city surrounding a huge stadium'],['Mesagoza','Largest city in Paldea',true],['Levincia','Paldea city home to Iono'],['Area Zero','Crater at the center of Paldea',true],['Ruins of Alph','Johto ruins associated with Unown',true],
  ].map(x=>entry('LOCATION',...x)),
  ...[
    ['Critical Hit','Attack that deals increased damage',true],['Super Effective','Move hits a type weakness',true],['Not Very Effective','Move is resisted by typing'],['Same Type Attack Bonus','Damage bonus for matching move type'],['STAB','Short name for same-type attack bonus',true],['Priority','Move order modifier'],['Speed Tie','Equal Speed leaves order to chance'],['Entry Hazard','Effect triggered when a Pokémon switches in'],['Weather','Battlefield condition such as rain or sun'],['Terrain','Ground effect affecting battlers'],['Burn','Status that damages and weakens physical Attack',true],['Poison','Status that deals damage over time',true],['Paralysis','Status that can impair Speed and actions',true],['Sleep','Status that prevents acting temporarily'],['Freeze','Status associated with Ice'],['Confusion','Volatile status that may cause self-damage'],['Flinch','Effect that prevents acting for a turn'],['Faint','When HP reaches zero',true],['Switch','Replace the active Pokémon'],['Double Battle','Battle with two active Pokémon per side'],['Triple Battle','Battle with three active Pokémon per side'],['Rotation Battle','Unova battle format with rotating fronts'],['Mega Evolution','Temporary powered-up transformation',true],['Dynamax','Galar giant battle transformation',true],['Gigantamax','Species-specific Dynamax form'],['Terastallize','Paldea crystal transformation',true],['Z-Move','Alola once-per-battle powered move'],
  ].map(x=>entry('BATTLE',...x)),
  ...[
    ['Evolution','A Pokémon changing into another species',true],['Friendship','Bond value used by some evolutions',true],['Breeding','Producing Eggs at a nursery or daycare'],['Egg Move','Move inherited through breeding'],['Shiny Pokémon','Rare alternate-colour Pokémon',true],['Pokédex','Encyclopaedia of discovered Pokémon',true],['National Dex','Pokédex spanning all regions'],['Living Dex','Collection containing each species at once'],['Shiny Charm','Key item that improves shiny odds'],['Masuda Method','Breeding method using different-language parents'],['Chain Fishing','Repeated fishing method used for shiny hunting'],['SOS Chain','Alola chaining method using called allies'],['Poké Radar','Device used for chained encounters'],['Effort Value','Hidden stat training value'],['EV Training','Training targeted effort values',true],['Individual Value','Hidden inherited stat potential'],['IV Breeding','Breeding for inherited stat potential'],['Nature','Trait that modifies two stats'],['Ability','Passive trait a Pokémon can have'],['Hidden Ability','Less common alternate ability'],['Move Tutor','NPC that teaches certain moves'],['Move Reminder','NPC that restores forgotten level-up moves'],['Day Care','Facility traditionally used for leveling or breeding'],['Nursery','Breeding-focused Pokémon facility'],['Rare Mark','Uncommon title-bearing encounter trait'],['Ribbon','Award carried by a Pokémon'],['Mark','Encounter trait that can grant a title'],['Pokérus','Rare beneficial training virus'],['Experience Points','Progress earned toward levels',true],['Level Up','Gain a level after enough experience',true],['Trade Evolution','Evolution triggered by trading'],['Stone Evolution','Evolution triggered by an evolutionary stone'],['Regional Form','Region-specific alternate species form'],['Form Change','Change between forms of one species'],['Pokémon Center','Facility that heals a party',true],['Pokémon Mart','Shop for trainer supplies',true],
  ].map(x=>entry('TRAINING',...x)),
];

function buildPokemonEntries(speciesById){
  return Object.values(speciesById||{}).filter(s=>s&&Number(s.id)>=1&&Number(s.id)<=1025&&s.name).sort((a,b)=>a.id-b.id).map(s=>({
    key:`pokemon:${s.id}`,
    answer:String(s.name),
    category:'POKÉMON',
    clue:`${(s.types||['normal']).map(t=>String(t).toUpperCase()).join(' / ')} Pokémon`,
    common:Number(s.id)<=151,
    pokemonId:Number(s.id),
  }));
}
function buildPool(speciesById){return [...buildPokemonEntries(speciesById),...CURATED_ENTRIES];}
function complexityFor(entry){const words=glyphWords(entry?.answer);return words.reduce((n,w)=>n+w.length,0)+Math.max(0,words.length-1)*3;}
function weightFor(entry,mode='easy',streak=0){
  if(mode==='hard')return 1;
  const cfg=mode==='normal'?{target:9+Math.min(streak,10)*.5,slope:.25,common:1.4}:{target:6+Math.min(streak,10)*.6,slope:.55,common:2.5};
  const over=Math.max(0,complexityFor(entry)-cfg.target);
  return Math.max(.0001,Math.exp(-over*cfg.slope)*(entry?.common?cfg.common:1));
}
function pickEntry(pool,{mode='easy',streak=0,usedKeys=new Set(),usedNormalised=new Set(),rng=Math.random}={}){
  let candidates=(pool||[]).filter(e=>e&&!usedKeys.has(e.key));
  if(!candidates.length)return null;
  const collisionFree=candidates.filter(e=>!usedNormalised.has(normaliseAnswer(e.answer)));
  if(collisionFree.length)candidates=collisionFree;
  const weights=candidates.map(e=>weightFor(e,mode,streak));
  const total=weights.reduce((a,b)=>a+b,0);
  let roll=Math.max(0,Math.min(.999999999999,Number(rng?.()??Math.random())))*total;
  for(let i=0;i<candidates.length;i++){roll-=weights[i];if(roll<0)return candidates[i];}
  return candidates.at(-1)||null;
}
function buildChoices(correct,pool,count=4,rng=Math.random){
  if(!correct||count<=0)return [];
  const chosen=[correct],seen=new Set([normaliseAnswer(correct.answer)]);
  const candidates=(pool||[]).filter(e=>e&&e.key!==correct.key&&!seen.has(normaliseAnswer(e.answer)));
  const same=candidates.filter(e=>e.category===correct.category),other=candidates.filter(e=>e.category!==correct.category);
  function take(bucket){
    while(chosen.length<count&&bucket.length){
      const idx=Math.floor(Math.max(0,Math.min(.999999999999,Number(rng?.()??Math.random())))*bucket.length);
      const e=bucket.splice(idx,1)[0],key=normaliseAnswer(e.answer);
      if(seen.has(key))continue;
      seen.add(key);chosen.push(e);
      for(let i=same.length-1;i>=0;i--)if(seen.has(normaliseAnswer(same[i].answer)))same.splice(i,1);
      for(let i=other.length-1;i>=0;i--)if(seen.has(normaliseAnswer(other[i].answer)))other.splice(i,1);
    }
  }
  take(same);take(other);
  for(let i=chosen.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999999999,Number(rng?.()??Math.random())))*(i+1));[chosen[i],chosen[j]]=[chosen[j],chosen[i]];}
  return chosen;
}
function scoreFor(entry,{mode='easy',streak=0,remainingFraction=0}={}){
  const words=glyphWords(entry?.answer),letters=words.reduce((n,w)=>n+w.length,0),extraWords=Math.max(0,words.length-1);
  const base=120+letters*16+extraWords*30,multiplier=MODE_CONFIG[mode]?.multiplier??1;
  const remain=Math.max(0,Math.min(1,Number(remainingFraction)||0));
  const result=base*multiplier*(1+Math.min(Math.max(0,Number(streak)||0),15)*.06)*(.75+remain*.5);
  const points=Math.round(result);
  return {points,coins:Math.max(30,Math.round(points*.35))};
}

return {MODE_CONFIG,CURATED_ENTRIES,normaliseAnswer,glyphWords,buildPokemonEntries,buildPool,complexityFor,weightFor,pickEntry,buildChoices,scoreFor};
});
