(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexVoltorbGiftCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const GIFT_RATE=0.02;
  function clamp01(v){v=Number(v);return Number.isFinite(v)?Math.max(0,Math.min(.999999999,v)):0;}
  function cleanRate(v,fallback=GIFT_RATE){v=Number(v);return Number.isFinite(v)?Math.max(0,Math.min(1,v)):fallback;}
  function rewardForRoll(value){
    const r=clamp01(value);
    if(r<.40)return {kind:'coins',reward:{type:'profile',coins:300,label:'300 Lucky Coins',visual:'◈'}};
    if(r<.62)return {kind:'dust',reward:{type:'profile',dust:60,label:'60 Card Dust',visual:'✦'}};
    if(r<.77)return {kind:'ticket',reward:{type:'profile',tickets:1,label:'Pack Voucher',visual:'🎟'}};
    if(r<.94)return {kind:'card',reward:null};
    return {kind:'pack',reward:null};
  }
  function createGift({tiles=[],rate=GIFT_RATE,random=Math.random}={}){
    const chance=cleanRate(rate,GIFT_RATE);if(chance<=0||clamp01(random())>=chance)return null;
    const safe=(Array.isArray(tiles)?tiles:[]).map((value,index)=>({value,index})).filter(row=>Number(row.value)!==0);
    if(!safe.length)return null;
    const pick=safe[Math.min(safe.length-1,Math.floor(clamp01(random())*safe.length))];
    const reward=rewardForRoll(random());
    return {tileIndex:pick.index,revealed:false,kind:reward.kind,reward:reward.reward};
  }
  function revealGift(board,index){
    const gift=board?.gift;if(!gift||gift.revealed||Number(gift.tileIndex)!==Number(index))return false;
    gift.revealed=true;return true;
  }
  return Object.freeze({GIFT_RATE,rewardForRoll,createGift,revealGift});
});
