(function(root,factory){
  const scenes=factory();
  root.LuckyDexTileScenesV0253=scenes;
  if(typeof module!=='undefined'&&module.exports)module.exports=scenes;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const rows=[
    {id:'celadon-game-corner',title:'Celadon Game Corner',src:'arcade/venues-v0223/celadon-game-corner-hgss.png',position:[0.50,0.48],excludeModes:['normal','hard']},
    {id:'goldenrod-game-corner',title:'Goldenrod Game Corner',src:'arcade/venues-v0223/goldenrod-game-corner-hgss.png',position:[0.50,0.48]},
    {id:'ruins-of-alph',title:'Ruins of Alph',src:'arcade/venues-v0223/ruins-alph-hgss-day.png',position:[0.50,0.50],excludeModes:['easy','normal','hard']},
    {id:'indigo-plateau',title:'Indigo Plateau',src:'arcade/venues-v0223/indigo-plateau-hgss.png',position:[0.50,0.46],excludeModes:['hard']},
    {id:'lilycove-contest-hall',title:'Lilycove Contest Hall',src:'arcade/venues-v0223/lilycove-contest-emerald.png',position:[0.50,0.48],excludeModes:['hard']},
    {id:'oreburgh-museum',title:'Oreburgh Mining Museum',src:'arcade/venues-v0223/oreburgh-museum-dppt.png',position:[0.50,0.47]},
    {id:'moon-stage',title:'Moon Stage',src:'arcade/authentic-v0200/venues/moon-stage.png',position:[0.50,0.46]},
    {id:'oreburgh-city',title:'Oreburgh City',src:'arcade/venues-v0223/oreburgh-city-dppt-source.png',position:[0.62,0.42],excludeModes:['hard']}
  ];
  return Object.freeze(rows.map(row=>Object.freeze({...row,position:Object.freeze(row.position.slice())})));
});
