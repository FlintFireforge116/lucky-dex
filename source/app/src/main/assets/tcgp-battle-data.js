(function(root, factory){
  const generated = typeof module === 'object' && module.exports ? require('./tcgp/generated/catalogue.js') : root.LuckyDexTCGPCatalogue;
  const api = factory(generated);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LuckyDexTCGPBattleData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(generated){
  'use strict';

  function pokemon(id, name, subtype, stage, hp, retreat, weakness, attacks, extra){
    return Object.assign({
      id, name, setId: 'A1', kind: 'pokemon', subtype, stage, hp, retreat, weakness,
      evolvesFrom: null, points: 1, battleEnabled: true, attacks: attacks || [], ability: null
    }, extra || {});
  }

  const LEGACY_CARDS = [
    pokemon('A1-001','Bulbasaur','Grass','Basic',70,1,'Fire',[
      { name:'Vine Whip', cost:'GC', damage:40, effect:null }
    ]),
    pokemon('A1-002','Ivysaur','Grass','Stage 1',90,2,'Fire',[
      { name:'Razor Leaf', cost:'GCC', damage:60, effect:null }
    ], { evolvesFrom:'Bulbasaur' }),
    pokemon('A1-014','Paras','Grass','Basic',70,1,'Fire',[
      { name:'Scratch', cost:'GC', damage:30, effect:null }
    ]),
    pokemon('A1-015','Parasect','Grass','Stage 1',120,2,'Fire',[
      { name:'Slash', cost:'GGC', damage:80, effect:null }
    ], { evolvesFrom:'Paras' }),
    pokemon('A1-021','Exeggcute','Grass','Basic',50,1,'Fire',[
      { name:'Seed Bomb', cost:'G', damage:20, effect:null }
    ]),
    pokemon('A1-027','Cottonee','Grass','Basic',50,1,'Fire',[
      { name:'Attach', cost:'C', damage:10, effect:null }
    ]),
    pokemon('A1-028','Whimsicott','Grass','Stage 1',80,1,'Fire',[
      { name:'Rolling Tackle', cost:'C', damage:40, effect:null }
    ], { evolvesFrom:'Cottonee' }),
    pokemon('A1-029','Petilil','Grass','Basic',60,1,'Fire',[
      { name:'Blot', cost:'G', damage:10, effect:{ type:'healSelf', amount:10 } }
    ]),
    pokemon('A1-030','Lilligant','Grass','Stage 1',100,1,'Fire',[
      { name:'Leaf Supply', cost:'GG', damage:50, effect:{ type:'attachEnergyFromZoneToBench', energy:'Grass', amount:1 } }
    ], { evolvesFrom:'Petilil', battleEnabled:false }),
    pokemon('A1-186','Pidgey','Colorless','Basic',60,1,'Lightning',[
      { name:'Gust', cost:'C', damage:10, effect:null }
    ]),
    pokemon('A1-187','Pidgeotto','Colorless','Stage 1',80,1,'Lightning',[
      { name:'Gust', cost:'C', damage:30, effect:null }
    ], { evolvesFrom:'Pidgey' }),
    pokemon('A1-188','Pidgeot','Colorless','Stage 2',130,1,'Lightning',[
      { name:'Wing Attack', cost:'CC', damage:70, effect:null }
    ], { evolvesFrom:'Pidgeotto', ability:{ name:'Drive Off', effect:{ type:'forceOpponentSwitch' } }, battleEnabled:false }),
    pokemon('A1-189','Rattata','Colorless','Basic',40,1,'Fighting',[
      { name:'Gnaw', cost:'C', damage:20, effect:null }
    ]),
    pokemon('A1-190','Raticate','Colorless','Stage 1',80,1,'Fighting',[
      { name:'Bite', cost:'C', damage:40, effect:null }
    ], { evolvesFrom:'Rattata' }),
    pokemon('A1-191','Spearow','Colorless','Basic',60,1,'Lightning',[
      { name:'Peck', cost:'C', damage:20, effect:null }
    ]),
    pokemon('A1-192','Fearow','Colorless','Stage 1',100,1,'Lightning',[
      { name:'Drill Run', cost:'CC', damage:50, effect:{ type:'coinDiscardOpponentEnergy', heads:1, amount:1 } }
    ], { evolvesFrom:'Spearow', battleEnabled:false }),
    pokemon('A1-193','Jigglypuff','Colorless','Basic',60,1,'Fighting',[
      { name:'Pound', cost:'CC', damage:30, effect:null }
    ]),
    pokemon('A1-194','Wigglytuff','Colorless','Stage 1',100,2,'Fighting',[
      { name:'Hyper Voice', cost:'CC', damage:60, effect:null }
    ], { evolvesFrom:'Jigglypuff' }),
    pokemon('A1-198',"Farfetch'd",'Colorless','Basic',60,1,'Lightning',[
      { name:'Leek Slap', cost:'C', damage:40, effect:null }
    ]),
    pokemon('A1-199','Doduo','Colorless','Basic',60,1,'Lightning',[
      { name:'Peck', cost:'C', damage:20, effect:null }
    ]),
    pokemon('A1-200','Dodrio','Colorless','Stage 1',80,0,'Lightning',[
      { name:'Drill Peck', cost:'C', damage:40, effect:null }
    ], { evolvesFrom:'Doduo' }),
    {
      id:'BASIC-POKE-BALL', name:'Poke Ball', setId:'BASIC', kind:'trainer', trainerType:'Item',
      battleEnabled:true, loaner:true, effect:{ type:'searchRandomBasic', amount:1 }
    }
  ];

  if (!generated || !Array.isArray(generated.cards)) throw new Error('Local Pocket gameplay catalogue is missing.');
  const CARDS = [...generated.cards, LEGACY_CARDS.find(card=>card.id==='BASIC-POKE-BALL')];
  const PRINTS = generated.prints;
  const CARD_BY_ID = Object.create(null), PRINT_BY_ID = Object.create(null);
  for (const card of CARDS) CARD_BY_ID[normId(card.id)] = card;
  for (const print of PRINTS) PRINT_BY_ID[normId(print.id)] = print;
  function normSet(value){ return String(value || '').trim().toUpperCase(); }
  function normId(value){ return String(value || '').trim().toUpperCase().replace(/^PROMO-([AB])-/, 'P-$1-').replace(/^P([AB])-/, 'P-$1-'); }
  function normName(value){ return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' '); }
  function cardById(id){ const key=normId(id),print=PRINT_BY_ID[key]; return CARD_BY_ID[print?normId(print.gameplayId):key] || null; }
  function gameplayIdForOwned(owned){
    if (!owned || String(owned.source || '').toLowerCase() !== 'tcgp') return null;
    const exact=cardById(owned.id);
    if(exact && exact.id!=='BASIC-POKE-BALL')return exact.id;
    // Collector metadata may recover an opaque legacy print ID. Never infer
    // gameplay from a name: same-name cards can have entirely different rules.
    const number=String(owned.localId ?? owned.number ?? '');
    if(/^\d+$/.test(number)&&owned.setId){const card=cardById(owned.setId+'-'+number.padStart(3,'0'));if(card)return card.id;}
    return null;
  }

  function resolveOwnedCard(owned){
    const id = gameplayIdForOwned(owned);
    return id ? cardById(id) : null;
  }

  function isBattleEnabled(value){
    const card = typeof value === 'string' ? cardById(value) : resolveOwnedCard(value);
    return !!(card && card.battleEnabled);
  }

  function projectOwnedCards(cards){
    const rows = Array.isArray(cards) ? cards : Object.values(cards || {});
    const out = new Map();
    for (const owned of rows){
      const gameplayId = gameplayIdForOwned(owned);
      if (!gameplayId) continue;
      const gameplay = cardById(gameplayId);
      if (!gameplay) continue;
      let row = out.get(gameplayId);
      if (!row){
        row = { gameplayId, name:gameplay.name, card:gameplay, quantity:0, battleEnabled:!!gameplay.battleEnabled, variants:[] };
        out.set(gameplayId, row);
      }
      const quantity = Math.max(0, Number(owned.count == null ? 1 : owned.count) || 0);
      row.quantity += quantity;
      row.variants.push({ id:owned.id, quantity, image:owned.image || owned.imageUrl || null, rarity:owned.rarity || null, row:owned });
    }
    return Array.from(out.values()).sort((a,b) => a.name.localeCompare(b.name));
  }

  const BEGINNER_IVYSAUR_DECK = [
    'A1-001',
    'A1-014','A1-014',
    'A1-021','A1-021',
    'A1-027','A1-027',
    'A1-029','A1-029',
    'A1-002',
    'A1-186','A1-186',
    'A1-189','A1-189',
    'A1-191',
    'A1-193','A1-193',
    'A1-199',
    'BASIC-POKE-BALL','BASIC-POKE-BALL'
  ];

  return {
    CARDS,
    PRINTS,
    SETS:generated.sets,
    COVERAGE:generated.summary,
    BEGINNER_IVYSAUR_DECK,
    cardById,
    gameplayIdForOwned,
    resolveOwnedCard,
    projectOwnedCards,
    isBattleEnabled,
    normalizeSetId:normSet,
    normalizeName:normName
  };
});
