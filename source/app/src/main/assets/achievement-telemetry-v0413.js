(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexAchievementTelemetryV0413=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function ensure(state){
    if(!state||typeof state!=='object')return {events:{},flags:{}};
    const raw=state.achievementTelemetryV0413;
    const safe=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const events=safe.events&&typeof safe.events==='object'&&!Array.isArray(safe.events)?safe.events:{};
    const flags=safe.flags&&typeof safe.flags==='object'&&!Array.isArray(safe.flags)?safe.flags:{};
    state.achievementTelemetryV0413={events:{...events},flags:{...flags}};
    return state.achievementTelemetryV0413;
  }
  function record(state,eventId,payload){
    if(!state||!eventId)return false;
    const t=ensure(state),id=String(eventId),old=t.events[id]&&typeof t.events[id]==='object'?t.events[id]:{};
    t.events[id]={count:Math.max(0,Number(old.count)||0)+1,lastAt:Date.now(),...(payload===undefined?{}:{lastPayload:payload})};
    return true;
  }
  function count(state,eventId){return Math.max(0,Number(ensure(state).events?.[String(eventId)]?.count)||0);}
  function flag(state,key,value=true){const t=ensure(state),id=String(key||'');if(!id)return false;const changed=t.flags[id]!==value;t.flags[id]=value;return changed;}
  return {ensure,record,count,flag};
});
