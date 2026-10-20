(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexFishingItemArt=api;})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const OFFICIAL='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
const local={
 'empty-potion':'adventure/art/objects/potion.png',
 'bent-pokeball':'arcade/sprites/items/poke-ball.png',
 'driftwood':'adventure/art/objects/cut_tree.png',
 'frayed-rope':'adventure/art/objects/escape_rope.png',
 'broken-silph-scope':'adventure/art/objects/silph_scope.png',
 'fake-nugget':'arcade/sprites/items/nugget.png',
 'glitched-driftwood':'adventure/art/objects/cut_tree.png',
 'coin-pouch':'arcade/sprites/items/nugget.png',
 'stardust':'arcade/sprites/items/stardust.png',
 'pack-ticket':'arcade/fossil-museum-v0257/items/tcg-card.png',
 'sealed-pack':'booster-mini-v0266/base1.webp',
 'big-dust':'arcade/sprites/items/star-piece.png',
 'ticket-pair':'arcade/fossil-museum-v0257/items/tcg-card.png'
};
const official={
 'repel-wrapper':'repel.png',
 'broken-lure':'lure.png',
 'rotten-leftovers':'leftovers.png',
 'rusty-bike':'bicycle.png',
 'shattered-blackglasses':'black-glasses.png',
 'decomposed-apricorn':'red-apricorn.png',
 'slowpoke-tail':'slowpoke-tail.png',
 'torn-eon-ticket':'eon-ticket.png',
 'soggy-rocket-uniform':'team-rocket-uniform.png',
 'waterlogged-mail':'harbor-mail.png',
 'cracked-pokenav':'pokenav.png',
 'waterlogged-poketch':'poketch.png',
 'deflated-pokedoll':'poke-doll.png',
 'faded-old-sea-map':'old-sea-map.png',
 'rusted-itemfinder':'itemfinder.png',
 'torn-vs-seeker':'vs-seeker.png',
 'muddy-acro-pedal':'acro-bike.png',
 'bent-mach-gear':'mach-bike.png',
 'empty-moomoo-bottle':'moomoo-milk.png',
 'soggy-old-gateau':'old-gateau.png',
 'chipped-mystic-water':'mystic-water.png',
 'cracked-damp-rock':'damp-rock.png',
 'broken-pokeflute-reed':'poke-flute.png',
 'waterlogged-pokeblock-case':'pokeblock-case.png',
 'torn-devon-label':'devon-goods.png',
 'crushed-soda-can':'soda-pop.png',
 'snapped-super-rod':'super-rod.png',
 'moldy-ragecandy-wrapper':'rage-candy-bar.png',
 'cracked-dive-ball':'dive-ball.png'
};
const fallback={
 'repel-wrapper':'adventure/art/objects/antidote.png',
 'broken-lure':'arcade/sprites/items/poke-ball.png',
 'rotten-leftovers':'adventure/art/objects/sitrus_berry.png',
 'rusty-bike':'adventure/art/objects/town_map.png',
 'shattered-blackglasses':'adventure/art/objects/quick_claw.png',
 'decomposed-apricorn':'arcade/sprites/items/oran-berry.png',
 'slowpoke-tail':'adventure/art/objects/fossil.png',
 'torn-eon-ticket':'adventure/art/objects/town_map.png',
 'soggy-rocket-uniform':'adventure/art/objects/clipboard.png',
 'waterlogged-mail':'adventure/art/objects/clipboard.png',
 'cracked-pokenav':'adventure/art/objects/town_map.png',
 'waterlogged-poketch':'adventure/art/objects/town_map.png',
 'deflated-pokedoll':'adventure/art/objects/item_ball.png',
 'faded-old-sea-map':'adventure/art/objects/town_map.png',
 'rusted-itemfinder':'adventure/art/objects/silph_scope.png',
 'torn-vs-seeker':'adventure/art/objects/clipboard.png',
 'muddy-acro-pedal':'adventure/art/objects/quick_claw.png',
 'bent-mach-gear':'adventure/art/objects/quick_claw.png',
 'empty-moomoo-bottle':'adventure/art/objects/potion.png',
 'soggy-old-gateau':'arcade/sprites/items/oran-berry.png',
 'chipped-mystic-water':'arcade/fossil-museum-v0257/items/water-stone.png',
 'cracked-damp-rock':'arcade/fossil-museum-v0257/items/hard-stone.png',
 'broken-pokeflute-reed':'adventure/art/objects/wooden_sign.png',
 'waterlogged-pokeblock-case':'adventure/art/objects/clipboard.png',
 'torn-devon-label':'adventure/art/objects/clipboard.png',
 'crushed-soda-can':'adventure/art/objects/potion.png',
 'snapped-super-rod':'adventure/art/objects/wooden_sign.png',
 'moldy-ragecandy-wrapper':'arcade/sprites/items/oran-berry.png',
 'cracked-dive-ball':'adventure/art/objects/great_ball.png'
};
const ids=new Set([...Object.keys(local),...Object.keys(official)]);
function idOf(item){return typeof item==='string'?item:item?.id;}
function pathFor(item){const id=idOf(item);if(local[id])return local[id];if(official[id])return OFFICIAL+official[id];return null;}
function fallbackFor(item){const id=idOf(item);return local[id]||fallback[id]||'adventure/art/objects/item_ball.png';}
function has(item){return !!pathFor(item);}
return{OFFICIAL,IDS:ids,pathFor,fallbackFor,has};
});
