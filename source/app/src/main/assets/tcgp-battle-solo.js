(function(root, factory){
  let core = root && root.LuckyDexTCGPBattleCore;
  let data = root && root.LuckyDexTCGPBattleData;
  if (typeof module === 'object' && module.exports){
    core = require('./tcgp-battle-core.js');
    data = require('./tcgp-battle-data.js');
    module.exports = factory(core,data);
  } else if (root){
    root.LuckyDexTCGPBattleSolo = factory(core,data);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(core,data){
  'use strict';

  const CHALLENGES=[{
    id:'genetic-apex-beginner-ivysaur',
    expansion:'Genetic Apex',
    difficulty:'Beginner',
    name:'Ivysaur Deck',
    description:'A straightforward Grass deck built around Ivysaur and a wide Basic Pokémon bench.',
    energyType:'Grass',
    deck:data.BEGINNER_IVYSAUR_DECK.slice(),
    firstClear:{coins:100,dust:50},
    repeat:{coins:0,dust:0}
  }];

  function challengeById(id){return CHALLENGES.find(item=>item.id===id)||null;}

  function defaultFirstSide(seed){
    const n=(Number(seed)||0)>>>0;
    return ((n*1664525+1013904223)>>>0)%2===0?'player':'opponent';
  }

  function createBattle(options){
    const opts=options||{};
    const challenge=challengeById(opts.challengeId||CHALLENGES[0].id);
    if(!challenge)throw new Error('Unknown Pocket Solo challenge.');
    const playerDeck=Array.isArray(opts.playerDeck)?opts.playerDeck.slice():data.BEGINNER_IVYSAUR_DECK.slice();
    return core.createBattle({
      playerDeck,
      opponentDeck:challenge.deck,
      seed:opts.seed,
      firstSide:opts.firstSide||defaultFirstSide(opts.seed),
      playerEnergyType:opts.playerEnergyType||'Grass',
      playerEnergyTypes:opts.playerEnergyTypes,
      opponentEnergyType:challenge.energyType,
      opponentEnergyTypes:opts.opponentEnergyTypes,
      manualPlayerSetup:!!opts.manualPlayerSetup
    });
  }

  return {CHALLENGES,challengeById,createBattle};
});
