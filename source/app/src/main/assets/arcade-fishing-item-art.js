(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexFishingItemArt=api;})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const BASE='arcade/fishing-items-v0685/';
const IDS=new Set([
'empty-potion','bent-pokeball','repel-wrapper','driftwood','broken-lure','rotten-leftovers','rusty-bike','frayed-rope','shattered-blackglasses','decomposed-apricorn','slowpoke-tail','torn-eon-ticket','broken-silph-scope','soggy-rocket-uniform','fake-nugget','waterlogged-mail','cracked-pokenav','waterlogged-poketch','deflated-pokedoll','faded-old-sea-map','rusted-itemfinder','torn-vs-seeker','muddy-acro-pedal','bent-mach-gear','empty-moomoo-bottle','soggy-old-gateau','chipped-mystic-water','cracked-damp-rock','broken-pokeflute-reed','waterlogged-pokeblock-case','torn-devon-label','crushed-soda-can','snapped-super-rod','moldy-ragecandy-wrapper','cracked-dive-ball','glitched-driftwood',
'coin-pouch','stardust','pack-ticket','sealed-pack','big-dust','ticket-pair'
]);
function idOf(item){return typeof item==='string'?item:item?.id;}
function pathFor(item){const id=idOf(item);return IDS.has(id)?BASE+id+'.svg':null;}
function has(item){return !!pathFor(item);}
return{BASE,IDS,pathFor,has};
});
