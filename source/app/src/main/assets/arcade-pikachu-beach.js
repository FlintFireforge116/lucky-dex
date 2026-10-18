(function(root,factory){const api=factory(root);root.LuckyDexPikachuBeach=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;})(typeof window!=='undefined'?window:globalThis,function(root){
'use strict';const $=id=>typeof document!=='undefined'?document.getElementById(id):null;let opened=false;
function open(){opened=true;root.LuckyDexArcadeSession?.mount?.('pikachuBeach',$('pikachuBeachGame'));if(root.state&&root.LuckyDexArcadePlatform?.ensureArcadeState)root.state.arcade=root.LuckyDexArcadePlatform.ensureArcadeState(root.state.arcade);void root.LuckyDexPikachuBeachPrizes?.retry?.(root.state);return root.LuckyDexPikachuBeachDx?.open?.({})??false}
function close(){root.LuckyDexPikachuBeachDx?.close?.();opened=false;return true}
function snapshot(){return {opened,mode:'dx',child:root.LuckyDexPikachuBeachDx?.snapshot?.()||null}}
return {open,close,snapshot};
});
