(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcgp-battle-data.js'));
  else root.LuckyDexTCGPDeckLibrary=factory(root.LuckyDexTCGPBattleData);
})(typeof globalThis!=='undefined'?globalThis:this,function(data){
  'use strict';
  const repeat=(id,n)=>Array.from({length:n},()=>id);
  const deck=pairs=>Object.freeze(pairs.flatMap(([id,n])=>repeat(id,n)));
  const freezeRecipe=recipe=>Object.freeze({...recipe,cards:Object.freeze(recipe.cards.slice()),keyPokemon:Object.freeze((recipe.keyPokemon||[]).slice()),energyTypes:Object.freeze((recipe.energyTypes||[]).slice())});
  const official=(id,name,expansion,difficulty,description,energyTypes,keyPokemon,cards)=>freezeRecipe({
    id,name,expansion,difficulty,description,energyTypes,keyPokemon,cards,
    energyMode:'manual',source:'Official',historical:true,immutable:true
  });

  // Exact historical Solo Battle lists. Card IDs intentionally point to the
  // gameplay print used by the source expansion; later prints never mutate them.
  const OFFICIAL_RECIPES=Object.freeze([
    official('official-genetic-apex-beginner-ivysaur','Ivysaur Deck','Genetic Apex','Beginner','The original Genetic Apex beginner Grass list: many Basics with a single Ivysaur evolution.',['Grass'],['A1-001','A1-002'],data.BEGINNER_IVYSAUR_DECK),
    official('official-genetic-apex-beginner-charmeleon','Charmeleon Deck','Genetic Apex','Beginner','The original Genetic Apex beginner Fire list: a broad Basic bench with a light Charmeleon line.',['Fire'],['A1-033','A1-034'],deck([
      ['A1-033',1],['A1-037',2],['A1-039',2],['A1-049',2],['A1-051',2],['A1-034',1],['A1-186',2],['A1-189',2],['A1-191',1],['A1-193',2],['A1-199',1],['BASIC-POKE-BALL',2]
    ])),
    official('official-genetic-apex-intermediate-magneton-eelektross','Magneton and Eelektross Deck','Genetic Apex','Intermediate','The original Genetic Apex intermediate Lightning list with several Stage 1 lines and a full Eelektross chain.',['Lightning'],['A1-097','A1-098','A1-107','A1-108','A1-109'],deck([
      ['A1-097',1],['A1-105',1],['A1-107',1],['A1-110',1],['A1-111',1],['A1-106',1],['A1-108',1],['A1-098',1],['A1-109',1],['A1-189',1],['A1-190',1],['A1-191',1],['A1-192',1],['A1-193',1],['A1-194',1],['A1-202',1],['BASIC-POKE-BALL',2],['P-A-007',2]
    ])),
    official('official-genetic-apex-intermediate-alakazam-mewtwo','Alakazam and Mewtwo Deck','Genetic Apex','Intermediate','The original Genetic Apex intermediate Psychic list centred on Alakazam with Mewtwo support.',['Psychic'],['A1-115','A1-116','A1-117','A1-128'],deck([
      ['A1-113',1],['A1-115',1],['A1-135',1],['A1-114',1],['A1-116',1],['A1-126',1],['A1-136',1],['A1-117',1],['A1-128',1],['A1-189',1],['A1-190',1],['A1-191',1],['A1-192',1],['A1-193',1],['A1-194',1],['A1-202',1],['BASIC-POKE-BALL',2],['P-A-007',2]
    ])),
    official('official-genetic-apex-advanced-pikachu-ex','Pikachu ex Deck','Genetic Apex','Advanced','The original Genetic Apex advanced Pikachu ex list backed by several Lightning evolution lines.',['Lightning'],['A1-096','A1-107','A1-108','A1-109'],deck([
      ['A1-099',2],['A1-105',2],['A1-107',2],['A1-110',2],['A1-111',1],['A1-100',1],['A1-106',1],['A1-108',2],['A1-109',1],['A1-096',1],['P-A-002',1],['BASIC-POKE-BALL',2],['P-A-007',2]
    ])),
    official('official-genetic-apex-advanced-charizard-ex','Charizard ex Deck','Genetic Apex','Advanced','The original Genetic Apex advanced Charizard ex list with Rapidash, Salazzle and Moltres support.',['Fire'],['A1-033','A1-034','A1-036'],deck([
      ['A1-033',2],['A1-042',2],['A1-049',2],['A1-050',1],['A1-034',2],['A1-043',1],['A1-046',1],['A1-036',1],['A1-189',2],['A1-190',1],['P-A-002',1],['BASIC-POKE-BALL',2],['P-A-007',2]
    ])),
    official('official-space-time-expert-pachirisu-pikachu','Pachirisu ex and Pikachu ex Deck','Space-time Smackdown','Expert','The original Space-time Smackdown Expert Lightning list using compact Basic ex pressure and Tool support.',['Lightning'],['A1-096','A1-104','A2-061','A2-062'],deck([
      ['A1-096',2],['A1-104',2],['A2-061',2],['A2-062',2],['A2-147',2],['A2-148',2],['A2-150',2],['P-A-002',2],['BASIC-POKE-BALL',2],['P-A-007',2]
    ])),
    official('official-space-time-expert-darkrai-weavile','Darkrai ex and Weavile ex Deck','Space-time Smackdown','Expert','The original Space-time Smackdown Expert Darkness list combining Darkrai ex chip damage with Weavile ex pressure.',['Darkness'],['A2-098','A2-099','P-A-042'],deck([
      ['A2-098',2],['A2-099',2],['P-A-042',2],['A1-198',2],['A2-148',2],['A2-150',2],['A2-154',2],['P-A-002',2],['BASIC-POKE-BALL',2],['P-A-007',2]
    ])),
    official('official-space-time-expert-palkia-vaporeon','Palkia ex and Vaporeon Deck','Space-time Smackdown','Expert','The original Space-time Smackdown Expert Water list using Manaphy/Vaporeon Energy movement into Palkia ex and Articuno ex.',['Water'],['A1-080','A1-084','A2-049','P-A-048','A1-206'],deck([
      ['A1-080',2],['A1-084',2],['A2-049',2],['P-A-048',2],['A1-206',2],['A2-147',2],['A1a-068',2],['A2-150',2],['BASIC-POKE-BALL',2],['P-A-007',2]
    ]))
  ]);

  const BY_ID=new Map(OFFICIAL_RECIPES.map(r=>[r.id,r]));
  const recipeById=id=>BY_ID.get(String(id||''))||null;
  const officialForDifficulty=difficulty=>OFFICIAL_RECIPES.filter(r=>r.difficulty===difficulty);
  function archetypePrior(cards,energyTypes){
    const selected=(cards||[]).map(data.cardById).filter(c=>c?.kind==='pokemon');
    if(!selected.length)return 0;
    const names=new Set(selected.map(c=>data.normalizeName(c.name))),types=new Set(energyTypes||[]);
    let best=0;
    for(const recipe of OFFICIAL_RECIPES){
      if(types.size&&recipe.energyTypes.length&&!recipe.energyTypes.some(t=>types.has(t)))continue;
      const keyNames=new Set(recipe.keyPokemon.map(id=>data.normalizeName(data.cardById(id)?.name||id)));
      const overlap=[...keyNames].filter(n=>names.has(n)).length;
      if(!overlap)continue;
      const coverage=overlap/Math.max(1,keyNames.size);
      const score=Math.min(60,overlap===1?6:Math.round(overlap*10+coverage*20));
      best=Math.max(best,score);
    }
    return best;
  }
  return {OFFICIAL_RECIPES,recipeById,officialForDifficulty,archetypePrior};
});
