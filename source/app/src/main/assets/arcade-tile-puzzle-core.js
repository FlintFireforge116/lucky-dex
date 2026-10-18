(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexTilePuzzleCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const CARD_RATE=0.004,PACK_RATE=0.004,GIFT_RATE=0.018;
  function clamp01(v){v=Number(v);return Number.isFinite(v)?Math.max(0,Math.min(.999999999,v)):0;}
  function cleanRate(value,fallback){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}
  function rollKind(value,rates={}){const r=clamp01(value),card=cleanRate(rates.card,CARD_RATE),pack=cleanRate(rates.pack,PACK_RATE);return r<card?'card':r<Math.min(1,card+pack)?'pack':'normal';}
  function sceneAllowedForMode(scene,mode){return !Array.isArray(scene?.excludeModes)||!scene.excludeModes.includes(mode);}
  function pickScene(scenes,mode,lastSceneId=null,random=Math.random){
    const eligible=(Array.isArray(scenes)?scenes:[]).filter(scene=>sceneAllowedForMode(scene,mode));
    const withoutLast=eligible.filter(scene=>scene.id!==lastSceneId),pool=withoutLast.length?withoutLast:eligible;
    if(!pool.length)return null;return pool[Math.floor(clamp01(random())*pool.length)]||pool[0];
  }
  function giftRewardForRoll(value){const r=clamp01(value);if(r<.45)return {type:'profile',coins:250,label:'250 Lucky Coins',visual:'◈'};if(r<.8)return {type:'profile',dust:50,label:'50 Card Dust',visual:'✦'};return {type:'profile',tickets:1,label:'Pack Voucher',visual:'🎟'};}
  function createAttempt({mode='easy',tileCount=20,scenes=[],lastSceneId=null,random=Math.random,rates={}}={}){
    const kind=rollKind(random(),rates),scene=pickScene(scenes,mode,lastSceneId,random),attempt={kind,mode,sceneId:scene?.id||null,reward:null,resolution:kind==='normal'?'ready':'pending'};
    const giftRate=cleanRate(rates.gift,GIFT_RATE);if(kind==='normal'&&giftRate>0&&clamp01(random())<giftRate){attempt.gift={tileValue:Math.min(Math.max(0,Math.floor(clamp01(random())*Math.max(1,tileCount))),Math.max(0,tileCount-1)),revealed:false,reward:giftRewardForRoll(random())};}
    return attempt;
  }
  function giftAtBoardIndex(attempt,board,index){return !!attempt?.gift&&Array.isArray(board)&&index>=0&&index<board.length&&Number(board[index])===Number(attempt.gift.tileValue);}
  function revealGift(attempt,board,index){if(!giftAtBoardIndex(attempt,board,index)||attempt.gift.revealed)return false;attempt.gift.revealed=true;return true;}
  return Object.freeze({CARD_RATE,PACK_RATE,GIFT_RATE,rollKind,sceneAllowedForMode,pickScene,giftRewardForRoll,createAttempt,giftAtBoardIndex,revealGift});
});
