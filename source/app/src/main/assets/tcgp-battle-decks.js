(function(root, factory){
  let data = root && root.LuckyDexTCGPBattleData;
  if (typeof module === 'object' && module.exports){
    data = require('./tcgp-battle-data.js');
    module.exports = factory(data);
  } else if (root){
    root.LuckyDexTCGPBattleDecks = factory(data);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(data){
  'use strict';

  const BATTLE_DEFAULTS = Object.freeze({
    schema:1,
    helpSeen:false,
    decks:[],
    activeDeckId:null,
    firstClears:{},
    stats:{matches:0,wins:0,losses:0,draws:0,bestWinTurns:null,totalTurns:0}
  });

  const LOANER_PLAYER_DECK = data.BEGINNER_IVYSAUR_DECK.slice();

  function ensureBattleState(state){
    if (!state || typeof state !== 'object') throw new TypeError('LuckyDex state is required');
    const current = state.tcgpBattle && typeof state.tcgpBattle === 'object' ? state.tcgpBattle : {};
    const stats = current.stats && typeof current.stats === 'object' ? current.stats : {};
    const battle = {
      schema:Number(current.schema || BATTLE_DEFAULTS.schema),
      helpSeen:current.helpSeen === true,
      decks:Array.isArray(current.decks) ? current.decks : [],
      activeDeckId:current.activeDeckId == null ? null : current.activeDeckId,
      firstClears:{...(current.firstClears || {})},
      stats:{...BATTLE_DEFAULTS.stats,...stats}
    };
    state.tcgpBattle = battle;
    return battle;
  }

  function ownershipMap(rows){
    const map = new Map();
    for (const row of rows || []) map.set(row.gameplayId, Math.max(0, Number(row.quantity || 0)));
    return map;
  }

  function copyLimitKey(card){
    if (!card) return '';
    const name = typeof card.name === 'string' ? data.normalizeName(card.name) : '';
    return name || String(card.id || '').toLowerCase();
  }

  function validateCore(cards, ownedRows, checkOwnership){
    const errors = [];
    const list = Array.isArray(cards) ? cards.slice() : [];
    if (list.length !== 20) errors.push(`Deck must contain exactly 20 cards (currently ${list.length}).`);
    const owned = ownershipMap(ownedRows);
    const counts = new Map();
    const nameCounts = new Map();
    let basics = 0;
    for (const id of list){
      const card = data.cardById(id);
      if (!card){ errors.push(`Unknown battle card: ${id}.`); continue; }
      if (!card.battleEnabled){ errors.push(`${card.name} is not battle-enabled yet.`); continue; }
      const count = (counts.get(card.id) || 0) + 1;
      counts.set(card.id, count);
      const limitKey = copyLimitKey(card);
      const nameCount = (nameCounts.get(limitKey) || 0) + 1;
      nameCounts.set(limitKey, nameCount);
      if (nameCount > 2) errors.push(`Decks may contain at most 2 copies of ${card.name}.`);
      if (card.kind === 'pokemon' && card.stage === 'Basic') basics += 1;
    }
    if (!basics) errors.push('Deck must contain at least one Basic Pokémon.');
    if (checkOwnership){
      for (const [id,count] of counts){
        const card = data.cardById(id);
        if (!card || card.loaner) continue;
        const have = owned.get(id) || 0;
        if (count > have) errors.push(`You do not own enough copies of ${card.name} (${have}/${count}).`);
      }
    }
    return {ok:errors.length === 0,errors};
  }

  function validateDeck(cards, ownedRows){ return validateCore(cards, ownedRows, true); }
  function validateLoanerDeck(cards){ return validateCore(cards, [], false); }

  function buildQuickDeck(ownedRows){
    const enabled = (ownedRows || []).filter(row => row && row.battleEnabled && data.cardById(row.gameplayId));
    const sorted = enabled.slice().sort((a,b) => {
      const ac = data.cardById(a.gameplayId), bc = data.cardById(b.gameplayId);
      const aBasic = ac.kind === 'pokemon' && ac.stage === 'Basic' ? 0 : 1;
      const bBasic = bc.kind === 'pokemon' && bc.stage === 'Basic' ? 0 : 1;
      return aBasic - bBasic || ac.name.localeCompare(bc.name);
    });
    const cards = ['BASIC-POKE-BALL','BASIC-POKE-BALL'];
    const nameCounts = new Map([[copyLimitKey(data.cardById('BASIC-POKE-BALL')), 2]]);
    for (const row of sorted){
      const card = data.cardById(row.gameplayId);
      const limitKey = copyLimitKey(card);
      const room = Math.max(0, 2 - (nameCounts.get(limitKey) || 0));
      const amount = Math.min(room, Math.max(0, Number(row.quantity || 0)));
      for (let i=0;i<amount && cards.length<20;i++){
        cards.push(row.gameplayId);
        nameCounts.set(limitKey, (nameCounts.get(limitKey) || 0) + 1);
      }
      if (cards.length >= 20) break;
    }
    if (cards.length !== 20){
      return {ok:false,cards,errors:[`You need at least 18 battle-enabled owned card copies to quick-build a deck (${cards.length - 2}/18).`]};
    }
    const checked = validateDeck(cards, ownedRows);
    return checked.ok ? {ok:true,cards,errors:[]} : {ok:false,cards,errors:checked.errors};
  }

  function saveDeck(state, deck, ownedRows){
    const battle = ensureBattleState(state);
    const cards = Array.isArray(deck && deck.cards) ? deck.cards.slice() : [];
    const validation = validateDeck(cards, ownedRows);
    if (!validation.ok) return validation;
    const id = String(deck.id || `deck-${Date.now()}`);
    const saved = {id,name:String(deck.name || 'Pocket Deck').slice(0,40),cards,energyType:String(deck.energyType || 'Grass')};
    const idx = battle.decks.findIndex(item => item && item.id === id);
    if (idx >= 0) battle.decks[idx] = saved; else battle.decks.push(saved);
    battle.activeDeckId = id;
    return {ok:true,errors:[],deck:saved};
  }

  return {BATTLE_DEFAULTS,LOANER_PLAYER_DECK,ensureBattleState,copyLimitKey,validateDeck,validateLoanerDeck,buildQuickDeck,saveDeck};
});
