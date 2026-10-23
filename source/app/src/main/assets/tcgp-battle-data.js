(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LuckyDexTCGPBattleData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  function pokemon(id, name, subtype, stage, hp, retreat, weakness, attacks, extra){
    return Object.assign({
      id, name, setId: 'A1', kind: 'pokemon', subtype, stage, hp, retreat, weakness,
      evolvesFrom: null, points: 1, battleEnabled: true, attacks: attacks || [], ability: null
    }, extra || {});
  }

  const CARDS = [
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

  const CARD_BY_ID = Object.create(null);
  const CARD_BY_SET_NAME = Object.create(null);
  for (const card of CARDS){
    CARD_BY_ID[card.id] = card;
    const key = setNameKey(card.setId, card.name);
    if (!CARD_BY_SET_NAME[key]) CARD_BY_SET_NAME[key] = card.id;
    else CARD_BY_SET_NAME[key] = null;
  }

  function normSet(value){ return String(value || '').trim().toUpperCase(); }
  function normId(value){ return String(value || '').trim().toUpperCase(); }
  function normName(value){ return String(value || '').trim().toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' '); }
  function setNameKey(setId, name){ return normSet(setId) + '|' + normName(name); }

  function cardById(id){ return CARD_BY_ID[normId(id)] || null; }

  function gameplayIdForOwned(owned){
    if (!owned || String(owned.source || '').toLowerCase() !== 'tcgp') return null;
    const exact = cardById(owned.id);
    if (exact && exact.setId !== 'BASIC') return exact.id;
    const setId = normSet(owned.setId || String(owned.id || '').split('-')[0]);
    const fallback = CARD_BY_SET_NAME[setNameKey(setId, owned.name)];
    return fallback || null;
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
