(function(root){
  'use strict';

  const BOARD_CONFIG={width:720,height:1004,pegRows:11,firstPegY:134,rowGap:68,slotTop:910,floorY:1004,labelY:970};
  const BALL_RADIUS=26,RAIN_RADIUS=18,BALL_COLLISION_RADIUS=16,RAIN_COLLISION_RADIUS=11,PEG_RADIUS=9,EDGE_PIN_INSET=26.8,PIN_BONUS=12,PHYSICS_MAX_STEP=.002;
  const SLOT_POINTS=[150,250,400,1000,400,250,150]; // legacy model compatibility
  const SPECIAL_PIN_TYPES=['explosion','teleport','stickyWeb','gravity','metronome'];
  const POWERUP_TYPES=['extraBall','ballRain','luckyEgg','rareCandy','masterBall'];
  const SPECIAL_META={
    explosion:{label:'EXPLOSION',short:'X',color:'#ff7a58'},
    teleport:{label:'WARP',short:'W',color:'#b384ff'},
    stickyWeb:{label:'WEB',short:'S',color:'#69b7ff'},
    gravity:{label:'GRAVITY',short:'G',color:'#ffef72'},
    metronome:{label:'METRONOME',short:'?',color:'#ff78d5'}
  };
  const POWER_META={
    extraBall:{label:'+1 BALL',short:'+1',color:'#78e5a6'},
    ballRain:{label:'BALL RAIN',short:'RAIN',color:'#72c8ff'},
    luckyEgg:{label:'LUCKY EGG ×2',short:'×2',color:'#ffe68a'},
    rareCandy:{label:'RARE CANDY',short:'UP',color:'#ff8fc7'},
    masterBall:{label:'MASTER BOOST',short:'M',color:'#b98cff'}
  };
  const COIN_TABLE=[[20,.25],[30,.23],[50,.20],[75,.14],[100,.10],[150,.06],[250,.02]];
  let run=null,raf=null,turnTimer=null,ballSeq=0,eventSeq=0;
  const toastTimers=new Set(),machineFxTimers=new Map();
  const imageCache=new Map();
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const rewardBridge=()=>root.LuckyDexFossilMuseumBridge||globalThis.LuckyDexFossilMuseumBridge;
  const el=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const fmt=n=>Number(n||0).toLocaleString();
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const clone=v=>v&&typeof v==='object'?{...v}:v;
  function withRewardDeadline(value,timeoutMs=4500){
    if(value===undefined||value===null)return Promise.resolve(null);
    const ms=Math.max(1,Number(timeoutMs)||4500);
    return new Promise(resolve=>{
      let done=false,timer=null;
      const finish=result=>{if(done)return;done=true;if(timer!==null)clearTimeout(timer);resolve(result??null);};
      timer=setTimeout(()=>finish(null),ms);
      Promise.resolve(value).then(finish,()=>finish(null));
    });
  }

  function createRun(){
    return {round:0,totalBalls:3,ballsRemaining:3,extraBallsAwarded:0,score:0,coinRewards:0,ordinaryPoints:0,jackpots:0,cardWins:0,boosterWins:0,mysteryWins:0,dropping:false,finished:false,awarded:false,activeBalls:[],pendingRewards:0,mainSettled:false,settledSlot:null,token:0,pegField:[],prizeBoard:[],powerups:[],powerupsInitialized:false,prizeBoardInitialized:false,haul:[],cardReveals:[],events:[],toasts:[],aimX:BOARD_CONFIG.width/2,boardSerial:0,legacyMode:false};
  }

  // Legacy payout helpers retained so old save/tests and old in-flight models remain valid.
  function payoutFor(model){return platform()?.ballDropPayout?.(model)||{ordinaryCoins:0,jackpotCoins:0,totalCoins:0};}
  function payoutDelta(before,after){const a=payoutFor(before),b=payoutFor(after);return {ordinaryCoins:b.ordinaryCoins-a.ordinaryCoins,jackpotCoins:b.jackpotCoins-a.jackpotCoins,totalCoins:b.totalCoins-a.totalCoins};}
  function applyLanding(model,{slot,slotPoints=SLOT_POINTS[slot]||0,pinBonus=0,pinHits=0}={}){
    if(!model||model.finished||model.round>=3)return null;model.legacyMode=true;
    const before={ordinaryPoints:model.ordinaryPoints,jackpots:model.jackpots};
    const bonus=Math.max(0,Number(pinBonus)||0),points=Math.max(0,Number(slotPoints)||0),jackpot=Number(slot)===3;
    model.round++;model.ballsRemaining=Math.max(0,3-model.round);model.score+=points+bonus;model.ordinaryPoints+=bonus;if(jackpot)model.jackpots++;else model.ordinaryPoints+=points;
    if(model.round>=3)model.finished=true;
    const after={ordinaryPoints:model.ordinaryPoints,jackpots:model.jackpots},delta=payoutDelta(before,after);
    const message=jackpot?`JACKPOT · +${delta.jackpotCoins} jackpot${delta.ordinaryCoins?` + ${fmt(delta.ordinaryCoins)} ordinary`:''} = +${fmt(delta.totalCoins)} coins`:`${fmt(points)} points · +${fmt(delta.totalCoins)} coins`;
    return {slot,slotPoints:points,pinBonus:bonus,pinHits:Number(pinHits)||0,jackpot,delta,message};
  }

  function weightedCoin(rng=Math.random){let roll=clamp(Number(rng())||0,0,.999999),sum=0;for(const [amount,w] of COIN_TABLE){sum+=w;if(roll<sum)return amount;}return 20;}
  const coinPrize=amount=>({type:'coin',amount:Number(amount)||20,label:`${Number(amount)||20} COINS`});
  function generatePrizeBoard(rng=Math.random){
    const board=Array.from({length:7},()=>null),free=[0,1,2,4,5,6];
    if(rng()<.25){const at=free.splice(Math.min(free.length-1,Math.floor(rng()*free.length)),1)[0];board[at]={type:'card',label:'CARD'};}
    if(rng()<.08&&free.length){const at=free.splice(Math.min(free.length-1,Math.floor(rng()*free.length)),1)[0];board[at]={type:'booster',label:'BOOSTER'};}
    for(const i of [0,1,2,4,5,6])if(!board[i])board[i]=coinPrize(weightedCoin(rng));
    board[3]={type:'mystery',label:'MYSTERY'};return board;
  }
  function rollMysteryReward(rng=Math.random){
    const r=clamp(Number(rng())||0,0,.999999);
    if(r<.30)return {type:'coin',amount:100,label:'100 COINS'};
    if(r<.55)return {type:'coin',amount:250,label:'250 COINS'};
    if(r<.70)return {type:'coin',amount:500,label:'500 COINS'};
    if(r<.85)return {type:'card',label:'CARD'};
    if(r<.93)return {type:'booster',label:'BOOSTER'};
    return {type:'coin',amount:1000,label:'★ 1000 JACKPOT ★',jackpot:true};
  }
  function upgradePrize(prize){
    const p=clone(prize)||coinPrize(20);
    if(p.type==='mystery')return {type:'coin',amount:1000,label:'★ 1000 JACKPOT ★',jackpot:true};
    if(p.type==='booster')return {type:'mystery',label:'MYSTERY'};
    if(p.type==='card')return {type:'booster',label:'BOOSTER'};
    if(p.type!=='coin')return p;
    const n=Number(p.amount)||20;
    if(n<=30)return coinPrize(75);if(n<=75)return coinPrize(150);return {type:'card',label:'CARD'};
  }

  function basePegField(){
    const out=[],w=BOARD_CONFIG.width;
    for(let row=0;row<BOARD_CONFIG.pegRows;row++){
      const count=row%2?7:6,margin=row%2?72:122,span=(w-margin*2)/(count-1),y=BOARD_CONFIG.firstPegY+row*BOARD_CONFIG.rowGap;
      for(let i=0;i<count;i++)out.push({id:`${row}:${i}`,row,index:i,x:margin+i*span,y,r:PEG_RADIUS,special:null,warpId:null,hitUntil:0});
      if(row%2===0){const edgeX=margin-span;out.push({id:`${row}:edge-l`,row,index:-1,x:edgeX,y,r:PEG_RADIUS,special:null,warpId:null,hitUntil:0,edge:true});out.push({id:`${row}:edge-r`,row,index:count,x:w-edgeX,y,r:PEG_RADIUS,special:null,warpId:null,hitUntil:0,edge:true});}
    }
    return out;
  }
  function createPegField(rng=Math.random){
    const field=basePegField(),candidates=field.filter(p=>!p.edge&&p.row>=2&&p.row<=BOARD_CONFIG.pegRows-2),chosen=[];
    while(chosen.length<6&&candidates.length){const i=Math.min(candidates.length-1,Math.floor(rng()*candidates.length));chosen.push(candidates.splice(i,1)[0]);}
    const types=['teleport','teleport','explosion','stickyWeb','gravity','metronome'];
    chosen.forEach((p,i)=>{p.special=types[i];if(i<2)p.warpId='warp-a';});
    return field;
  }

  function powerupPocketCandidates(pinList=basePegField()){
    const out=[];
    for(let y=210;y<=BOARD_CONFIG.slotTop-72;y+=24)for(let x=48;x<=672;x+=24){
      if(pinList.every(p=>Math.hypot(x-p.x,y-p.y)>=40))out.push({x,y});
    }
    return out;
  }
  function pickPowerType(rng,used){
    const table=[['extraBall',.20],['ballRain',.22],['luckyEgg',.24],['rareCandy',.20],['masterBall',.14]];
    for(let tries=0;tries<10;tries++){let r=rng(),sum=0,choice='luckyEgg';for(const [type,w] of table){sum+=w;if(r<sum){choice=type;break;}}if(!used.has(choice))return choice;}return POWERUP_TYPES.find(x=>!used.has(x))||'luckyEgg';
  }
  function generatePowerups(rng=Math.random,pinList=basePegField()){
    const count=rng()<.35?2:1,out=[],used=new Set(),pockets=powerupPocketCandidates(pinList);
    for(let n=0;n<count&&pockets.length;n++){
      const type=pickPowerType(rng,used);used.add(type);
      const viable=pockets.filter(pt=>!out.some(p=>Math.hypot(pt.x-p.x,pt.y-p.y)<92));
      const pool=viable.length?viable:pockets,idx=Math.min(pool.length-1,Math.floor(rng()*pool.length)),pos=pool[idx];
      out.push({id:`pickup-${n}-${type}`,type,x:pos.x,y:pos.y,r:22,collected:false,flashUntil:0});
    }
    return out;
  }
  function setAimX(model,x){if(!model)return null;const n=Number(x);model.aimX=clamp(Number.isFinite(n)?n:BOARD_CONFIG.width/2,BALL_RADIUS+8,BOARD_CONFIG.width-BALL_RADIUS-8);return model.aimX;}
  function createBall({x,y=64,r=BALL_RADIUS,isRain=false,rng=Math.random}={}){
    return {id:`ball-${++ballSeq}`,x:Number(x)||BOARD_CONFIG.width/2,y,r,collisionR:isRain?RAIN_COLLISION_RADIUS:BALL_COLLISION_RADIUS,vx:(rng()-.5)*(isRain?150:38),vy:isRain?30+rng()*80:0,angle:0,omega:(rng()-.5)*1.4,pinHits:0,pinCooldown:{},specialCooldown:{},coinMultiplier:1,rewardUpgrades:0,isRain:!!isRain,rewardEligible:true,settled:false,countsAsDrop:!isRain,slowTime:0,stallTime:0,activeTime:0,progressY:y,recoveries:0,webbedPinId:null,gravityUntil:0};
  }
  function createRainBalls(w=BOARD_CONFIG.width,rng=Math.random){
    const balls=[];for(let i=0;i<5;i++){const base=w*(i+1)/6,jitter=(rng()-.5)*42;balls.push(createBall({x:clamp(base+jitter,RAIN_RADIUS+4,w-RAIN_RADIUS-4),y:58-(i%2)*18,r:RAIN_RADIUS,isRain:true,rng}));}return balls;
  }

  function applyPowerup(model,powerup,ball,rng=Math.random){
    if(!model||!powerup||powerup.collected)return null;powerup.collected=true;
    if(powerup.type==='extraBall'){
      if(Number(model.extraBallsAwarded||0)<2){model.extraBallsAwarded=Number(model.extraBallsAwarded||0)+1;model.totalBalls=Number(model.totalBalls||3)+1;model.ballsRemaining=Math.max(0,model.totalBalls-Number(model.round||0));return {type:'extraBall',message:'+1 EXTRA BALL'};}
      model.coinRewards=Number(model.coinRewards||0)+100;model.score=Number(model.score||0)+100;return {type:'extraBall',message:'EXTRA BALL CAP · +100 COINS',bonusCoins:100};
    }
    if(powerup.type==='ballRain')return {type:'ballRain',message:'POKÉ BALL RAIN!',spawnRain:true};
    if(powerup.type==='luckyEgg'){if(ball)ball.coinMultiplier=Math.max(1,Number(ball.coinMultiplier)||1)*2;return {type:'luckyEgg',message:'LUCKY EGG · COINS ×2'};}
    if(powerup.type==='masterBall'){if(ball)ball.rewardUpgrades=Number(ball.rewardUpgrades||0)+1;return {type:'masterBall',message:'MASTER BOOST · PRIZE UP'};}
    if(powerup.type==='rareCandy'){
      const candidates=(model.prizeBoard||[]).map((_,i)=>i).filter(i=>i!==3);if(candidates.length){const idx=candidates[Math.min(candidates.length-1,Math.floor(rng()*candidates.length))];model.prizeBoard[idx]=upgradePrize(model.prizeBoard[idx]);return {type:'rareCandy',message:`RARE CANDY · SLOT ${idx+1} UPGRADED`,slot:idx};}
      return {type:'rareCandy',message:'RARE CANDY'};
    }
    return {type:powerup.type,message:powerup.type};
  }

  function clearTimers(){if(raf&&typeof cancelAnimationFrame==='function'){cancelAnimationFrame(raf);raf=null;}if(turnTimer){clearTimeout(turnTimer);turnTimer=null;}for(const timer of toastTimers)clearTimeout(timer);toastTimers.clear();for(const timer of machineFxTimers.values())clearTimeout(timer);machineFxTimers.clear();}
  function stop(){clearTimers();if(run){run.token++;run.dropping=false;run.activeBalls=[];}clearLayer('ball');clearLayer('effects');return true;}


  function machineElement(){return typeof document!=='undefined'?document.querySelector?.('.ball-drop-machine'):null;}
  function pulseMachine(className,duration=900){const machine=machineElement();if(!machine)return false;const prior=machineFxTimers.get(className);if(prior)clearTimeout(prior);machine.classList.remove(className);void machine.offsetWidth;machine.classList.add(className);const timer=setTimeout(()=>{machineFxTimers.delete(className);machine.classList.remove(className);},duration);machineFxTimers.set(className,timer);return true;}
  function fanfareKindForPrize(prize,wasMystery=false){if(prize?.type==='booster')return 'booster';if(prize?.type==='card')return 'card';if(wasMystery)return 'mystery';return 'none';}
  function triggerFanfare(kind){if(!kind||kind==='none')return false;const durations={mystery:1150,card:1350,booster:1600};return pulseMachine(`fanfare-${kind}`,durations[kind]||1000);}
  function triggerLaunchGlow(){return pulseMachine('ball-drop-launch-glow',650);}

  const LAYER_IDS={backboard:'ballDropBackboardCanvas',pins:'ballDropPinsCanvas',prize:'ballDropPrizeCanvas',powerup:'ballDropPowerupCanvas',ball:'ballDropBallCanvas',effects:'ballDropEffectsCanvas'};
  function layerCanvas(name){return el(LAYER_IDS[name]);}
  function layerContext(name){const c=layerCanvas(name);return c?.getContext?.('2d')||null;}
  function clearLayer(name){const c=layerCanvas(name),ctx=c?.getContext?.('2d');if(ctx)ctx.clearRect(0,0,c.width,c.height);return ctx||null;}

  const ballSprite=typeof Image==='undefined'?null:new Image();
  if(ballSprite){ballSprite.src='arcade/sprites/items/poke-ball.png';ballSprite.onload=()=>renderBalls();}
  function cachedImage(src,onReady){
    if(!src||typeof Image==='undefined')return null;let record=imageCache.get(src);
    if(!record){const img=new Image();record={img,ready:false,error:false,waiters:new Set()};imageCache.set(src,record);img.onload=()=>{record.ready=true;const waiters=[...record.waiters];record.waiters.clear();for(const callback of waiters){try{callback();}catch(_){}}};img.onerror=()=>{record.error=true;record.waiters.clear();};img.src=src;}
    if(!record.ready&&record.img?.complete&&record.img?.naturalWidth)record.ready=true;if(onReady&&!record.ready&&!record.error)record.waiters.add(onReady);return record.img;
  }
  function drawPokeball(ctx,b){if(ballSprite?.complete&&ballSprite.naturalWidth){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle||0);ctx.imageSmoothingEnabled=false;ctx.drawImage(ballSprite,-b.r,-b.r,b.r*2,b.r*2);ctx.restore();return;}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d84242';ctx.beginPath();ctx.arc(b.x,b.y,b.r,Math.PI,0);ctx.fill();ctx.strokeStyle='#20252d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(b.x-b.r,b.y);ctx.lineTo(b.x+b.r,b.y);ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,b.r*.24,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.stroke();}
  function drawContained(ctx,img,x,y,w,h){if(!img?.complete||!img.naturalWidth)return false;const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);return true;}
  function slotStyle(prize){if(prize?.type==='booster')return ['#5b4014','#ffe28a'];if(prize?.type==='card')return ['#163e6d','#8cd0ff'];if(prize?.type==='mystery')return ['#45285f','#f7a8ff'];return ['#172942','#d1ddf0'];}
  function drawPrizeSlot(ctx,p,i,sw){
    const fg=slotStyle(p)[1],x=i*sw,y=BOARD_CONFIG.slotTop;ctx.save();ctx.beginPath();ctx.rect(x+2,y+2,sw-4,BOARD_CONFIG.floorY-y-4);ctx.clip();
    if((p?.type==='booster'||p?.type==='card')&&p.artUrl){const img=cachedImage(p.artUrl,()=>{if(run?.prizeBoard?.[i]===p)renderPrizeSlot(i);});if(drawContained(ctx,img,x+8,y+5,sw-16,BOARD_CONFIG.floorY-y-10)){ctx.restore();return;}}
    ctx.fillStyle=fg;ctx.shadowColor=fg;ctx.shadowBlur=p?.type==='coin'?4:13;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=p?.type==='coin'?'900 24px sans-serif':'900 16px sans-serif';const label=p?.type==='coin'?String(p.amount):p?.type==='mystery'?'? MYSTERY ?':p?.label||String(p?.type||'').toUpperCase();ctx.fillText(label,x+sw/2,y+39);ctx.restore();
  }
  // The same solid polygon drives rendering and contact resolution. The upper
  // face slopes down toward the deflection direction; mirror each half-board.
  function pinVertices(p,w=BOARD_CONFIG.width){
    const r=Math.max(1,Number(p.r)||PEG_RADIUS),side=p.x<w/2?1:-1;
    const direction=p.edge?side:side*((Number(p.row)||0)%2?-1:1);
    const outer=p.edge?(side>0?0:w):p.x-direction*r,inner=p.x+direction*r;
    return [{x:outer,y:p.y-r},{x:inner,y:p.y+r*.6},{x:outer,y:p.y+r}];
  }
  function pinPath(ctx,p){const vertices=pinVertices(p);ctx.beginPath();ctx.moveTo(vertices[0].x,vertices[0].y);for(let i=1;i<vertices.length;i++)ctx.lineTo(vertices[i].x,vertices[i].y);ctx.closePath();}
  function drawSpecialPin(ctx,p){const meta=SPECIAL_META[p.special];ctx.save();ctx.shadowBlur=17;ctx.shadowColor=meta.color;ctx.fillStyle=meta.color;pinPath(ctx,p);ctx.fill();ctx.strokeStyle=meta.color;ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#101826';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(meta.short,p.x,p.y+2);ctx.restore();}
  function drawNormalPin(ctx,p){const g=ctx.createLinearGradient(p.x,p.y-p.r,p.x,p.y+p.r);g.addColorStop(0,'#fff1a5');g.addColorStop(.42,'#d6b756');g.addColorStop(1,'#655020');ctx.fillStyle=g;pinPath(ctx,p);ctx.fill();ctx.strokeStyle='#c7aa50';ctx.lineWidth=1.5;ctx.stroke();}
  function drawPowerup(ctx,p){if(p.collected)return;const meta=POWER_META[p.type];ctx.save();ctx.shadowBlur=24;ctx.shadowColor=meta.color;ctx.fillStyle='#0f1a2b';ctx.strokeStyle=meta.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=meta.color;ctx.font=meta.short.length>2?'900 9px sans-serif':'900 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(meta.short,p.x,p.y+1);ctx.restore();}

  function renderBackboard(){
    const c=layerCanvas('backboard'),ctx=clearLayer('backboard');if(!c||!ctx)return false;const w=c.width,h=c.height,sw=w/7;
    const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#173a68');bg.addColorStop(.62,'#091b38');bg.addColorStop(1,'#050b17');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.strokeStyle='rgba(103,202,255,.62)';ctx.lineWidth=3;ctx.shadowColor='#68cfff';ctx.shadowBlur=16;ctx.strokeRect(10,10,w-20,h-20);ctx.restore();
    ctx.fillStyle='rgba(4,12,25,.74)';ctx.fillRect(22,20,w-44,55);ctx.font='800 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const legend=[['X','EXPLOSION'],['W','WARP'],['S','WEB'],['G','GRAVITY'],['?','METRONOME']];legend.forEach(([s,l],i)=>{const x=86+i*137;ctx.fillStyle=Object.values(SPECIAL_META)[i].color;ctx.fillText(`${s} ${l}`,x,47);});
    ctx.save();ctx.strokeStyle='rgba(105,208,255,.75)';ctx.lineWidth=3;ctx.shadowColor='#6bd2ff';ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(BALL_RADIUS+8,96);ctx.lineTo(w-BALL_RADIUS-8,96);ctx.stroke();ctx.restore();ctx.fillStyle='rgba(160,226,255,.78)';ctx.font='800 10px sans-serif';ctx.fillText('DRAG TO AIM',w/2,83);
    const wellTop=BOARD_CONFIG.slotTop,floor=BOARD_CONFIG.floorY;const well=ctx.createLinearGradient(0,wellTop,0,floor);well.addColorStop(0,'rgba(19,39,68,.96)');well.addColorStop(1,'rgba(6,18,34,.98)');ctx.fillStyle=well;ctx.fillRect(0,wellTop,w,floor-wellTop);
    ctx.save();ctx.strokeStyle='#617797';ctx.lineWidth=4;ctx.shadowColor='#68cfff';ctx.shadowBlur=5;for(let i=0;i<=7;i++){ctx.beginPath();ctx.moveTo(i*sw,BOARD_CONFIG.slotTop);ctx.lineTo(i*sw,BOARD_CONFIG.floorY);ctx.stroke();}ctx.restore();ctx.strokeStyle='#8194b1';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,BOARD_CONFIG.floorY);ctx.lineTo(w,BOARD_CONFIG.floorY);ctx.stroke();
    return true;
  }
  function renderPins(){const ctx=clearLayer('pins');if(!ctx)return false;for(const p of run?.pegField?.length?run.pegField:basePegField())p.special?drawSpecialPin(ctx,p):drawNormalPin(ctx,p);return true;}
  function renderPrizeSlot(slot){const c=layerCanvas('prize'),ctx=c?.getContext?.('2d');if(!c||!ctx||!Number.isInteger(slot)||slot<0||slot>6)return false;const sw=c.width/7,x=slot*sw;ctx.clearRect(x,BOARD_CONFIG.slotTop,sw,BOARD_CONFIG.floorY-BOARD_CONFIG.slotTop);const board=run?.prizeBoard?.length?run.prizeBoard:generatePrizeBoard(()=>.5);drawPrizeSlot(ctx,board[slot],slot,sw);return true;}
  function renderPrizeBoard(){const ctx=clearLayer('prize'),c=layerCanvas('prize');if(!ctx||!c)return false;const sw=c.width/7,board=run?.prizeBoard?.length?run.prizeBoard:generatePrizeBoard(()=>.5);board.forEach((p,i)=>drawPrizeSlot(ctx,p,i,sw));return true;}
  function renderPowerups(){const ctx=clearLayer('powerup');if(!ctx)return false;for(const p of run?.powerups||[])drawPowerup(ctx,p);return true;}
  function clearPowerupRegion(p){const ctx=layerContext('powerup');if(!ctx||!p)return false;const pad=Number(p.r||22)+30;ctx.clearRect(p.x-pad,p.y-pad,pad*2,pad*2);return true;}
  function renderBalls(){const ctx=clearLayer('ball');if(!ctx)return false;for(const b of run?.activeBalls||[])drawPokeball(ctx,b);if(!run?.dropping){const aim=Number(run?.aimX??BOARD_CONFIG.width/2);drawPokeball(ctx,{x:aim,y:96,r:BALL_RADIUS,angle:0});}return true;}
  function renderEffects(now=typeof performance!=='undefined'?performance.now():Date.now()){
    const c=layerCanvas('effects'),ctx=clearLayer('effects');if(!c||!ctx)return false;for(const p of run?.pegField||[]){if(!p.special||now>=Number(p.hitUntil||0))continue;const meta=SPECIAL_META[p.special];ctx.save();ctx.strokeStyle=meta.color;ctx.lineWidth=4;ctx.shadowColor=meta.color;ctx.shadowBlur=22;ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(p.x,p.y,p.r+10,0,Math.PI*2);ctx.stroke();ctx.restore();}
    if(Number.isInteger(run?.settledSlot)){const sw=c.width/7;ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(run.settledSlot*sw,BOARD_CONFIG.slotTop,sw,BOARD_CONFIG.floorY-BOARD_CONFIG.slotTop);}return true;
  }
  function renderAllLayers(){renderBackboard();renderPins();renderPrizeBoard();renderPowerups();renderBalls();renderEffects();return true;}
  function draw(){return renderAllLayers();}


  function collisionRadius(ball){return Math.max(1,Number(ball?.collisionR)||Number(ball?.r)||BALL_COLLISION_RADIUS);}
  function pinContactRadius(ball,p){return collisionRadius(ball)+Math.max(1,Number(p?.r)||PEG_RADIUS);}
  function renderPinRegion(p){const ctx=layerContext('pins');if(!ctx||!p)return false;const pad=Math.max(36,(Number(p.r)||PEG_RADIUS)+28);ctx.clearRect(p.x-pad,p.y-pad,pad*2,pad*2);p.special?drawSpecialPin(ctx,p):drawNormalPin(ctx,p);return true;}

  function triggerSpecial(ball,p,now,pinList,rng=Math.random){
    if(!p.special)return null;ball.specialCooldown ||= {};const last=Number(ball.specialCooldown[p.id]||0);if(now-last<180)return null;ball.specialCooldown[p.id]=now;p.hitUntil=now+300;let type=p.special;
    if(type==='metronome'){
      type=['explosion','stickyWeb','gravity'][Math.min(2,Math.floor(rng()*3))];
      p.special=type;p.metronomeResolved=true;if(run?.pegField?.includes?.(p))renderPinRegion(p);
    }
    if(type==='explosion'){
      let dx=ball.x-p.x,dy=ball.y-p.y,dist=Math.hypot(dx,dy);if(dist<.001){dx=ball.vx||1;dy=ball.vy||0;dist=Math.hypot(dx,dy)||1;}
      const nx=dx/dist,ny=dy/dist,blast=820;ball.vx=nx*blast+ball.vx*.06;ball.vy=ny*blast+ball.vy*.06;ball.omega+=(nx>=0?1:-1)*4.2;
    }
    else if(type==='stickyWeb'){
      if(ball.webbedPinId!==p.id){ball.webbedPinId=p.id;ball.webbedSince=now;ball.webbedSlipDir=Math.sign(ball.x-p.x)||Math.sign(ball.vx)||((rng()<.5)?-1:1);ball.vx=0;ball.vy=0;ball.omega=0;}
    }
    else if(type==='gravity'){
      ball.gravityUntil=Math.max(Number(ball.gravityUntil||0),now+1050);ball.vx*=.12;ball.vy=Math.max(720,Math.abs(Number(ball.vy)||0)*.3+560);ball.omega*=.35;
    }
    else if(type==='teleport'){
      const other=pinList.find(x=>x!==p&&x.special==='teleport'&&x.warpId===p.warpId);if(other){const cr=collisionRadius(ball);ball.specialCooldown[other.id]=now;ball.x=other.x;ball.y=clamp(other.y+other.r+cr+5,cr,BOARD_CONFIG.slotTop-cr-2);ball.vy=Math.max(100,Math.abs(ball.vy)*.8);ball.vx+=(rng()-.5)*80;other.hitUntil=now+260;}
    }
    return {source:p.special,effect:type};
  }
  function resolvePin(ball,p,now,pinList,rng=Math.random){
    const cr=collisionRadius(ball),r=Math.max(1,Number(p.r)||PEG_RADIUS);
    if(Math.abs(ball.y-p.y)>cr+r||(!p.edge&&Math.abs(ball.x-p.x)>cr+r))return false;
    const vertices=pinVertices(p),orientation=(vertices[1].x-vertices[0].x)*(vertices[2].y-vertices[0].y)-(vertices[1].y-vertices[0].y)*(vertices[2].x-vertices[0].x);
    let inside=true,best=Infinity,nearest=null,face=null;
    for(let i=0;i<3;i++){
      const a=vertices[i],b=vertices[(i+1)%3],ex=b.x-a.x,ey=b.y-a.y,len2=ex*ex+ey*ey;
      if(((ball.x-a.x)*ey-(ball.y-a.y)*ex)*orientation>0)inside=false;
      const t=clamp(((ball.x-a.x)*ex+(ball.y-a.y)*ey)/len2,0,1),x=a.x+t*ex,y=a.y+t*ey,d2=(ball.x-x)**2+(ball.y-y)**2;
      if(d2<best){best=d2;nearest={x,y};const length=Math.sqrt(len2),sign=orientation>0?1:-1;face={nx:sign*ey/length,ny:-sign*ex/length};}
    }
    if(!inside&&best>=cr*cr)return false;
    const dist=Math.sqrt(best),nx=inside||dist<.000001?face.nx:(ball.x-nearest.x)/dist,ny=inside||dist<.000001?face.ny:(ball.y-nearest.y)/dist,tx=-ny,ty=nx,overlap=inside?cr+dist:cr-dist;
    ball.x+=nx*overlap;ball.y+=ny*overlap;const vn=ball.vx*nx+ball.vy*ny;
    const webbed=ball.webbedPinId===p.id;
    if(vn<0){
      if(webbed){
        // Sticky Web has no bounce: remove the inward normal component but
        // preserve a heavily damped tangent so the ball can slowly creep off.
        const vt=ball.vx*tx+ball.vy*ty;ball.vx=vt*tx*.82;ball.vy=vt*ty*.82;ball.omega*=.55;
      }else{
        const restitution=.77,jn=-(1+restitution)*vn;ball.vx+=jn*nx;ball.vy+=jn*ny;const cr=collisionRadius(ball),inertia=.5*cr*cr,relativeTangent=ball.vx*tx+ball.vy*ty-ball.omega*cr,tangentDenom=1+(cr*cr/inertia);let jt=-relativeTangent/tangentDenom;const maxFriction=Math.abs(jn)*.26;jt=clamp(jt,-maxFriction,maxFriction);ball.vx+=jt*tx;ball.vy+=jt*ty;ball.omega-=jt*cr/inertia;ball.vx+=(rng()-.5)*4;
      }
      if(-vn>70){ball.pinCooldown ||= {};const last=Number(ball.pinCooldown[p.id]||0);if(now-last>65){ball.pinCooldown[p.id]=now;ball.pinHits=Number(ball.pinHits||0)+1;}}
    }
    if(p.special)triggerSpecial(ball,p,now,pinList,rng);return true;
  }
  function resolveWalls(ball,w){
    const cr=collisionRadius(ball),sw=w/7;
    if(ball.y+cr>BOARD_CONFIG.slotTop){for(let i=1;i<7;i++){const wall=i*sw,dx=ball.x-wall;if(Math.abs(dx)<cr&&ball.y-cr<BOARD_CONFIG.floorY){const side=dx>=0?1:-1;ball.x=wall+side*cr;if(ball.vx*side<0){ball.vx=-ball.vx*.55;ball.omega+=-ball.vx/cr*.32;}}}}
    if(ball.x-cr<0){ball.x=cr;ball.vx=Math.abs(ball.vx)*.62;}
    if(ball.x+cr>w){ball.x=w-cr;ball.vx=-Math.abs(ball.vx)*.62;}
    if(ball.y-cr<0){ball.y=cr;ball.vy=Math.abs(ball.vy)*.62;}
  }
  function recoverBall(ball,pinList,w){
    let direction=Math.sign(Number(ball.vx)||0);if(!direction){let nearest=null,best=Infinity;for(const p of pinList||[]){const d=Math.hypot(ball.x-p.x,ball.y-p.y);if(d<best){best=d;nearest=p;}}direction=nearest?Math.sign(ball.x-nearest.x)||((ball.x<w/2)?1:-1):((ball.x<w/2)?1:-1);}
    if(ball.x<=collisionRadius(ball)+1)direction=1;else if(ball.x>=w-collisionRadius(ball)-1)direction=-1;
    ball.vx+=direction*8;ball.vy+=12;ball.omega+=direction*.15;ball.slowTime=0;ball.stallTime=0;ball.progressY=ball.y;ball.recoveries=Number(ball.recoveries||0)+1;return true;
  }
  function stepBall(ball,dt,now,pinList=basePegField(),w=BOARD_CONFIG.width,rng=Math.random){
    ball.activeTime=Math.max(0,Number(ball.activeTime)||0)+Math.max(0,Number(dt)||0);if(ball.activeTime>=20)return clamp(Math.floor(ball.x/(w/7)),0,6);
    const gravity=now<Number(ball.gravityUntil||0)?5200:1300;ball.vy+=gravity*dt;ball.vx*=Math.pow(.999,dt/.004);ball.omega*=Math.pow(.9985,dt/.004);ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.angle+=ball.omega*dt;resolveWalls(ball,w);for(const p of pinList)resolvePin(ball,p,now,pinList,rng);
    if(ball.webbedPinId){
      const web=pinList.find(p=>p.id===ball.webbedPinId);
      if(!web||Math.hypot(ball.x-web.x,ball.y-web.y)>pinContactRadius(ball,web)+4){ball.webbedPinId=null;ball.webbedSince=0;ball.webbedSlipDir=0;}
      else{
        const elapsed=Math.max(0,(now-Number(ball.webbedSince||now))/1000),ramp=Math.min(1.35,elapsed/1.05),slip=Number(ball.webbedSlipDir)||1;
        // Start almost motionless, then rapidly build downward pull and a small
        // tangent creep so the ball visibly seeps around and off the peg.
        ball.vx+=slip*(55+520*ramp*ramp)*dt;ball.vy+=(120+4700*ramp*ramp)*dt;
      }
    }
    // A pin or an intentional Warp may move the centre after the first wall
    // pass. Enforce the same symmetric containment before exposing the frame.
    resolveWalls(ball,w);const cr=collisionRadius(ball);if(ball.y+cr>=BOARD_CONFIG.floorY)return clamp(Math.floor(ball.x/(w/7)),0,6);
    ball.progressY ??= ball.y;ball.slowTime=Math.hypot(ball.vx,ball.vy)<30?(ball.slowTime||0)+dt:0;if(ball.y>=ball.progressY+4){ball.progressY=ball.y;ball.stallTime=0;}else ball.stallTime=(ball.stallTime||0)+dt;if(!ball.webbedPinId&&ball.y+cr<BOARD_CONFIG.slotTop&&(ball.slowTime>=1.25||(ball.slowTime>=.9&&ball.stallTime>=1.25)))recoverBall(ball,pinList,w);return null;
  }

  function renderEventLog(model=run){const log=el('ballDropEventLog');if(!log)return;log.replaceChildren();const events=(model?.events||[]).slice(0,2);if(!events.length){const row=document.createElement('div');row.className='ball-drop-log-entry empty';row.textContent='DROP A BALL · EVENTS APPEAR HERE';log.appendChild(row);return;}for(const evt of events){const row=document.createElement('div');row.className=`ball-drop-log-entry ${evt.kind||''}`;row.textContent=evt.message;log.appendChild(row);}}
  function renderToastStack(model=run){const stack=el('ballDropToastStack');if(!stack)return;stack.replaceChildren();for(const evt of (model?.toasts||[]).slice(0,5)){const row=document.createElement('div');row.className=`ball-drop-toast ${evt.kind||''}`;row.textContent=evt.message;stack.appendChild(row);}}
  function renderEvents(model=run){renderEventLog(model);renderToastStack(model);}
  function addEvent(model,message,kind='normal'){if(!model||!message)return null;const evt={id:++eventSeq,message:String(message),kind,ts:Date.now()};model.events.unshift(evt);model.events=model.events.slice(0,5);model.toasts ||= [];model.toasts.unshift(evt);model.toasts=model.toasts.slice(0,5);renderEvents(model);if(typeof document!=='undefined'){const timer=setTimeout(()=>{toastTimers.delete(timer);if(!model?.toasts)return;model.toasts=model.toasts.filter(x=>x.id!==evt.id);if(run===model)renderToastStack(model);},2400);toastTimers.add(timer);}return evt;}
  function renderRun(){if(!run)return;const next=Math.min(run.totalBalls,run.round+1),roundEl=el('ballDropRound'),maxEl=el('ballDropRoundMax');if(roundEl)roundEl.textContent=String(run.finished?run.totalBalls:next);if(maxEl)maxEl.textContent=String(run.totalBalls);if(el('ballDropScore'))el('ballDropScore').textContent=fmt(run.coinRewards);session()?.update?.('ballDrop',{runText:`Ball ${run.finished?run.totalBalls:next} / ${run.totalBalls}`,liveLabel:'COINS',liveValue:fmt(run.coinRewards)});}
  function showLanding(title,message,detail='',jackpot=false){const box=el('ballDropLanding');if(!box)return;const a=el('ballDropLandingTitle'),b=el('ballDropLandingScore'),c=el('ballDropLandingDetail');if(a)a.textContent=title;if(b)b.textContent=message;if(c)c.textContent=detail;box.classList.toggle('jackpot',!!jackpot);box.hidden=false;}
  function hideLanding(){const box=el('ballDropLanding');if(box){box.hidden=true;box.classList.remove('jackpot');}}

  async function hydratePrizeForSlot(model,slot){
    const prize=model?.prizeBoard?.[slot];if(!prize)return prize;const b=rewardBridge();
    if(prize.type==='card'&&!prize.resolvedCard&&b?.resolveBuriedCard){
      try{const resolved=await b.resolveBuriedCard();if(model?.prizeBoard?.[slot]===prize&&resolved?.card){prize.resolvedCard=resolved;prize.artUrl=resolved.card.image||'';}}catch(_){}
    }else if(prize.type==='booster'&&!prize.resolvedBooster&&b?.resolveBuriedBooster){
      try{const reward=await b.resolveBuriedBooster();if(model?.prizeBoard?.[slot]===prize&&reward?.set?.id){prize.resolvedBooster=reward;prize.artUrl=reward.boosterArt||root.LuckyDexBoosterMiniArt?.directPath?.(reward.set||{})||'';}}catch(_){}
    }
    if(run===model&&model?.prizeBoard?.[slot]===prize)renderPrizeSlot(slot);return prize;
  }
  function hydratePrizeBoard(model){for(let i=0;i<(model?.prizeBoard||[]).length;i++)hydratePrizeForSlot(model,i);}
  function refreshPrizeSlot(model,slot,rng=Math.random){
    if(!model||!Number.isInteger(slot)||slot<0||slot>6)return null;model.boardSerial++;const prize=generatePrizeBoard(rng)[slot];model.prizeBoard[slot]=prize;if(run===model)renderPrizeSlot(slot);hydratePrizeForSlot(model,slot);return prize;
  }
  function prepareTurn(model=run,rng=Math.random){
    if(!model||model.finished)return false;let prizeInit=false,powerInit=false;if(!model.prizeBoardInitialized){model.boardSerial++;model.prizeBoard=generatePrizeBoard(rng);model.prizeBoardInitialized=true;prizeInit=true;hydratePrizeBoard(model);}if(!model.powerupsInitialized){model.powerups=generatePowerups(rng,model.pegField);model.powerupsInitialized=true;powerInit=true;}model.mainSettled=false;model.settledSlot=null;renderRun();if(run===model){if(prizeInit)renderPrizeBoard();if(powerInit)renderPowerups();renderBalls();renderEffects();}return true;
  }

  function applyRewardUpgrades(reward,count){let out=clone(reward);for(let i=0;i<Math.max(0,Number(count)||0);i++)out=upgradePrize(out);return out;}
  async function resolvePrize(model,ball,slot){
    let prize=clone(model.prizeBoard?.[slot]||coinPrize(20));const wasMystery=prize.type==='mystery';if(wasMystery){model.mysteryWins++;triggerFanfare('mystery');root.vibrate?.([18,12,18,12,34]);prize=rollMysteryReward();}
    prize=applyRewardUpgrades(prize,ball.rewardUpgrades);const fanfare=fanfareKindForPrize(prize,wasMystery);if(fanfare!=='none'&&fanfare!=='mystery')triggerFanfare(fanfare);const source=ball.isRain?'RAIN BALL':'BALL';
    if(prize.type==='coin'){
      const amount=Math.max(0,Math.round((Number(prize.amount)||0)*Math.max(1,Number(ball.coinMultiplier)||1)));model.coinRewards+=amount;model.score+=amount;if(prize.jackpot||amount>=1000){model.jackpots++;addEvent(model,`${source} · ★ ${fmt(amount)} COINS ★`,'jackpot');root.vibrate?.([18,18,30,18,60]);}else{addEvent(model,`${source} · +${fmt(amount)} COINS`,'coin');root.vibrate?.(8);}return {type:'coin',amount,jackpot:!!prize.jackpot,title:prize.jackpot?'★ JACKPOT ★':`${fmt(amount)} COINS`,message:`+${fmt(amount)} Lucky Coins`};
    }
    const bridge=rewardBridge();
    if(prize.type==='card'){
      try{const resolved=prize.resolvedCard||await withRewardDeadline(bridge?.resolveBuriedCard?.(),ball.isRain?1800:4500);const row=resolved?.card?bridge?.grantCard?.(resolved.card,resolved.set||{}):null;if(row){model.cardWins++;const name=row.name||resolved.card.name||'Mystery Card',setName=row.setName||resolved.set?.name||'',image=row.image||resolved.card.image||'',rarity=row.rarity||resolved.card.rarity||'';model.haul.push({title:name,subtitle:'Ball Drop card prize',kind:'card'});model.cardReveals.push({id:row.id||resolved.card.id||'',name,image,setName,rarity});addEvent(model,`${source} · CARD · ${name}`,'card');root.vibrate?.([14,10,24,10,42]);return {type:'card',title:'CARD WIN!',message:name,detail:setName||'Added to Card Collection'};}}catch(_){}
      model.coinRewards+=250;model.score+=250;addEvent(model,`${source} · CARD FALLBACK +250`,'coin');return {type:'coin',amount:250,title:'CARD CACHE MISSED',message:'+250 Lucky Coins',detail:'Card data unavailable'};
    }
    if(prize.type==='booster'){
      try{const reward=prize.resolvedBooster||await withRewardDeadline(bridge?.resolveBuriedBooster?.(),ball.isRain?1800:4500);const count=reward?.set?.id?bridge?.grantBooster?.(reward):0;if(count){model.boosterWins++;const name=`${reward.set.name||'Mystery'} Booster`;model.haul.push({title:name,subtitle:'Saved to Sealed Packs',kind:'booster'});addEvent(model,`${source} · BOOSTER · ${name}`,'booster');root.vibrate?.([18,10,24,10,34,10,60]);return {type:'booster',title:'BOOSTER WIN!',message:name,detail:'Saved unopened · Sealed Packs'};}}catch(_){}
      model.coinRewards+=500;model.score+=500;addEvent(model,`${source} · BOOSTER FALLBACK +500`,'coin');return {type:'coin',amount:500,title:'BOOSTER CACHE MISSED',message:'+500 Lucky Coins',detail:'Booster data unavailable'};
    }
    return {type:'none',title:'PRIZE',message:'No prize'};
  }

  function checkPowerups(model,ball,rng=Math.random){
    for(const p of model.powerups||[]){if(p.collected)continue;if(Math.hypot(ball.x-p.x,p.y-ball.y)>collisionRadius(ball)+p.r)continue;const result=applyPowerup(model,p,ball,rng);if(!result)continue;if(run===model)clearPowerupRegion(p);addEvent(model,result.message,'power');root.vibrate?.([8,8,14]);if(result.type==='rareCandy'&&Number.isInteger(result.slot))hydratePrizeForSlot(model,result.slot);if(result.spawnRain){const rainBalls=createRainBalls(BOARD_CONFIG.width,rng);model.activeBalls.push(...rainBalls);addEvent(model,'5 RAIN BALLS RELEASED','power');}renderRun();}
  }
  function settleBall(model,ball,slot){
    if(!model||ball.settled)return;ball.settled=true;const sw=BOARD_CONFIG.width/7;ball.x=sw*(slot+.5);ball.y=BOARD_CONFIG.floorY-collisionRadius(ball);ball.vx=ball.vy=0;model.settledSlot=slot;if(ball.countsAsDrop&&!model.mainSettled){model.mainSettled=true;model.round++;model.ballsRemaining=Math.max(0,model.totalBalls-model.round);}model.pendingRewards++;
    resolvePrize(model,ball,slot).then(out=>{showLanding(out.title,out.message,out.detail||`${ball.pinHits||0} pin hits`,!!out.jackpot);}).finally(()=>{refreshPrizeSlot(model,slot);model.pendingRewards=Math.max(0,model.pendingRewards-1);const idx=model.activeBalls.indexOf(ball);if(idx>=0)model.activeBalls.splice(idx,1);renderRun();renderBalls();renderEffects();maybeFinishTurn(model);});
  }
  function maybeFinishTurn(model){
    if(run!==model||!model.mainSettled||model.pendingRewards>0||model.activeBalls.some(b=>!b.settled))return false;if(turnTimer)return false;
    turnTimer=setTimeout(()=>{turnTimer=null;if(run!==model)return;hideLanding();model.settledSlot=null;if(model.round>=model.totalBalls){model.finished=true;model.dropping=false;completeRun(model);return;}model.dropping=false;prepareTurn(model);const button=el('ballDropBtn');if(button){button.disabled=false;button.textContent='DROP BALL';}},850);return true;
  }
  function animate(model,token){
    let last=typeof performance!=='undefined'?performance.now():Date.now();const frame=now=>{if(run!==model||token!==model.token||!model.dropping)return;let dt=Math.min(.032,(now-last)/1000);last=now;const steps=Math.max(2,Math.ceil(dt/PHYSICS_MAX_STEP));dt/=steps;
      for(let k=0;k<steps;k++){for(const ball of [...model.activeBalls]){if(ball.settled)continue;const slot=stepBall(ball,dt,now,model.pegField,BOARD_CONFIG.width,Math.random);checkPowerups(model,ball,Math.random);if(slot!==null)settleBall(model,ball,slot);}}
      renderBalls();renderEffects(now);if(model.dropping&&(model.activeBalls.length||model.pendingRewards)){raf=requestAnimationFrame(frame);}else{raf=null;maybeFinishTurn(model);}
    };raf=requestAnimationFrame(frame);
  }
  function dropBall(){const model=run;if(!model||model.dropping||model.finished||model.round>=model.totalBalls)return false;model.dropping=true;hideLanding();triggerLaunchGlow();const button=el('ballDropBtn');if(button)button.disabled=true;const x=setAimX(model,model.aimX),main=createBall({x,y:96,r:BALL_RADIUS,isRain:false});model.activeBalls=[main];model.ball=main;model.mainSettled=false;const token=++model.token;renderBalls();renderEffects();animate(model,token);return true;}

  function completeRun(model=run){
    if(!model||model.awarded||!model.finished)return false;model.awarded=true;const legacy=model.legacyMode,payout=legacy?payoutFor({ordinaryPoints:model.ordinaryPoints,jackpots:model.jackpots}):{totalCoins:Math.max(0,Math.round(model.coinRewards||0))};const s=root.state||globalThis.state;const previousBest=Number(s?.arcade?.bestBallDrop||0);if(s?.arcade){s.arcade.bestBallDrop=Math.max(previousBest,Number(model.score)||0);s.arcade.ballDropJackpots=Number(s.arcade.ballDropJackpots||0)+Number(model.jackpots||0);}root.save?.();const awarded=platform()?.awardRun?.({gameId:'ballDrop',label:'Poké Ball Drop',score:model.score,coins:payout.totalCoins,dailyEligible:false,dailyReward:null})||{coinsAwarded:payout.totalCoins,itemAwarded:null};root.save?.();
    const extras=[];if(model.cardWins)extras.push(`${model.cardWins} card${model.cardWins===1?'':'s'}`);if(model.boosterWins)extras.push(`${model.boosterWins} booster${model.boosterWins===1?'':'s'}`);if(model.jackpots)extras.push(`${model.jackpots} jackpot${model.jackpots===1?'':'s'}`);
    const review={title:'PRIZE MACHINE COMPLETE',mode:legacy?'Classic':'Prize Machine',difficulty:legacy?'Classic':'Standard',metricLabel:legacy?'SCORE':'COINS WON',metricValue:legacy?fmt(model.score):fmt(awarded.coinsAwarded),stats:[{label:'Balls Played',value:String(model.totalBalls||model.round||0)},{label:'Jackpots',value:String(model.jackpots||0)},{label:'Cards Won',value:String(model.cardWins||0)},{label:'Boosters Won',value:String(model.boosterWins||0)}],pbs:[{label:'Best Score',value:String(s?.arcade?.bestBallDrop||model.score||0),isNew:Number(model.score||0)>previousBest}],rewards:[{label:'Lucky Coins',value:String(awarded.coinsAwarded||0)},...(awarded.itemAwarded?[{label:'Bonus',value:platform()?.formatItemAward?.(awarded.itemAwarded)||''}]:[]),...((model.haul||[]).slice(0,4).map(row=>({label:String(row.title||'Prize'),value:String(row.subtitle||'Won')})))]};
    session()?.showResult?.('ballDrop',{title:'PRIZE MACHINE COMPLETE',metricLabel:legacy?'SCORE':'COINS WON',metricValue:legacy?`${fmt(model.score)} points${model.jackpots?` · ${model.jackpots} jackpot${model.jackpots===1?'':'s'}`:''}`:`${fmt(awarded.coinsAwarded)}${extras.length?` · ${extras.join(' · ')}`:''}`,coinsAwarded:awarded.coinsAwarded,itemAwarded:awarded.itemAwarded,details:model.haul||[],cardReveals:model.cardReveals||[],bestText:'',review,onReplay:startRun,onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.(true)});return true;
  }
  function startRun(){stop();session()?.hideResult?.();run=createRun();run.pegField=createPegField();const button=el('ballDropBtn');if(button){button.disabled=false;button.textContent='DROP BALL';}hideLanding();renderEvents(run);prepareTurn(run);renderAllLayers();return run;}
  function open(){if(typeof document!=='undefined'){['voltorbGame','clefairyGame','berryGame','fossilGame','dittoGame','quizGame','ballDropGame','unownGame','safariGame','berryPickerGame','tilePuzzleGame'].forEach(id=>{const n=el(id);if(n)n.hidden=id!=='ballDropGame';});document.body.classList.add('arcade-open','arcade-mode');}session()?.mount?.('ballDrop');startRun();return true;}
  function aimFromPointer(event){const model=run,surface=el('ballDropAimSurface');if(!model||!surface||model.dropping||model.finished)return false;const rect=surface.getBoundingClientRect?.();if(!rect?.width)return false;const clientX=Number(event?.clientX);if(!Number.isFinite(clientX))return false;setAimX(model,(clientX-rect.left)*(BOARD_CONFIG.width/rect.width));renderBalls();return true;}
  function wire(){if(typeof document==='undefined')return;const button=el('ballDropBtn'),surface=el('ballDropAimSurface');if(button)button.onclick=dropBall;if(surface?.addEventListener){let aiming=false;surface.addEventListener('pointerdown',event=>{if(run?.dropping||run?.finished)return;aiming=true;surface.setPointerCapture?.(event.pointerId);aimFromPointer(event);});surface.addEventListener('pointermove',event=>{if(aiming)aimFromPointer(event);});const end=event=>{aiming=false;surface.releasePointerCapture?.(event.pointerId);};surface.addEventListener('pointerup',end);surface.addEventListener('pointercancel',end);}}

  const api={BOARD_CONFIG,SLOT_POINTS,PIN_BONUS,BALL_RADIUS,RAIN_RADIUS,BALL_COLLISION_RADIUS,RAIN_COLLISION_RADIUS,EDGE_PIN_INSET,PHYSICS_MAX_STEP,SPECIAL_PIN_TYPES,POWERUP_TYPES,withRewardDeadline,fanfareKindForPrize,createRun,payoutDelta,applyLanding,generatePrizeBoard,rollMysteryReward,upgradePrize,createPegField,pegs:basePegField,powerupPocketCandidates,generatePowerups,createRainBalls,applyPowerup,addEvent,setAimX,hydratePrizeForSlot,refreshPrizeSlot,completeRun,startRun,dropBall,stop,open,draw,stepBall,prepareTurn,_testTriggerSpecial:triggerSpecial};
  root.LuckyDexBallDropV0180=api;root.LuckyDexBallDropV0271=api;root.LuckyDexBallDropV0272=api;root.LuckyDexBallDropV0274=api;root.LuckyDexBallDropV0275=api;root.LuckyDexBallDropV0276=api;root.LuckyDexBallDropV0277=api;root.LuckyDexBallDropV0278=api;root.LuckyDexBallDropV0279=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof document!=='undefined')wire();
})(typeof window!=='undefined'?window:globalThis);
