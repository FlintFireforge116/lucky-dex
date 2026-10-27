(function(root){
'use strict';
const BERRIES=[
{id:'razz',name:'Razz',image:'arcade/sprites/items/razz-berry.png'},
{id:'bluk',name:'Bluk',image:'arcade/sprites/items/bluk-berry.png'},
{id:'pinap',name:'Pinap',image:'arcade/sprites/items/pinap-berry.png'},
{id:'wepear',name:'Wepear',image:'arcade/sprites/items/wepear-berry.png'},
{id:'magost',name:'Magost',image:'arcade/sprites/items/magost-berry.png'},
{id:'durin',name:'Durin',image:'arcade/sprites/items/durin-berry.png'},
{id:'nomel',name:'Nomel',image:'arcade/sprites/items/nomel-berry.png'}];
const BERRY_MODES={easy:{durationMs:60000,berries:3,maxCustomers:1,missLimit:null},normal:{durationMs:60000,berries:5,maxCustomers:2,missLimit:null},hard:{durationMs:60000,berries:7,maxCustomers:3,missLimit:null},unlimited:{durationMs:null,berries:5,maxCustomers:3,missLimit:3}};
const BERRY_META={easy:{patience:6500,cap:70,daily:15},normal:{patience:5200,cap:100,daily:25},hard:{patience:4100,cap:140,daily:35},unlimited:{patience:3600,cap:150,daily:45}};
const BERRY_STREAK=15;
const TILE_MODES={easy:{rows:4,cols:5},normal:{rows:5,cols:6},hard:{rows:6,cols:8}};
let active=null,berryMode='easy',tileMode='easy',berry=null,tile=null,lastTileSceneId=null;
const $=id=>typeof document!=='undefined'?document.getElementById(id):null;

const platform=()=>root.LuckyDexArcadePlatform;
const session=()=>root.LuckyDexArcadeSession;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const choose=a=>a[Math.floor(Math.random()*a.length)];
const berryObj=id=>BERRIES.find(b=>b.id===id)||BERRIES[0];
const backdrop=name=>`arcade/authentic-v0200/amie/${name}-backdrop.png`;
const imageCache=new Map();
function participants(n){
 const supplied=platform()?.caughtParticipants?.(n,[25,133,175])||[];
 return Array.from({length:n},(_,i)=>{
  const p=supplied[i]||{id:[25,133,175][i%3],name:['Pikachu','Eevee','Togepi'][i%3]};
  return {...p,image:p.image||`arcade/sprites/actors/pokemon/${p.shiny?'shiny/':''}${p.id}.png`};
 });
}
function award(gameId,label,score,coins,dailyEligible=false,dailyReward=null){
 return platform()?.awardRun?.({gameId,label,score,coins,dailyEligible,dailyReward})||{coinsAwarded:coins,itemAwarded:null};
}
function shuffled(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function swapTiles(board,a,b){if(Array.isArray(board)&&a>=0&&b>=0&&a<board.length&&b<board.length)[board[a],board[b]]=[board[b],board[a]];return board;}
function isSolvedSwap(board){return Array.isArray(board)&&board.every((v,i)=>v===i);}
function isSolvedVisualSwap(board,equivalent=()=>false){return Array.isArray(board)&&board.every((v,i)=>v===i||equivalent(v,i));}
function tileRect(value,rows,cols){return {row:Math.floor(value/cols),col:value%cols,x:(value%cols)/cols,y:Math.floor(value/cols)/rows,w:1/cols,h:1/rows};}
function runState(extra){return {running:false,finished:false,disposed:false,timeouts:new Set(),raf:null,interval:null,drag:null,...extra};}
function later(run,callback,ms){
 const id=setTimeout(()=>{run.timeouts.delete(id);if(!run.disposed&&run.running)callback();},ms);
 run.timeouts.add(id);return id;
}
function dispose(run){
 if(!run)return;
 run.disposed=true;run.running=false;
 if(run.raf!=null)cancelAnimationFrame(run.raf);
 if(run.interval!=null)clearInterval(run.interval);
 run.timeouts.forEach(clearTimeout);run.timeouts.clear();run.drag?.();
 run.raf=run.interval=null;
}
function resetAll(){dispose(berry);dispose(tile);berry=tile=null;}
function text(id,value){const el=$(id);if(el)el.textContent=value;}
function message(game,value){text(`${game}Message`,value);}
function controls(game,running,label){
 const start=$(`${game}StartBtn`),restart=$(`${game}RestartBtn`);
 if(start){start.hidden=running;start.textContent=label;}
 if(restart)restart.hidden=!running;
 document.querySelectorAll(`[data-${game==='berryPicker'?'berry':'tile'}-mode]`).forEach(b=>b.disabled=running);
}
function result(game,data){
 if(session()?.showResult)session().showResult(game,data);
 else message(game,`${data.title} ${data.metricValue} · ${data.coinsAwarded} coins`);
}

/* Berry Picker: stable requesters, persisted jackpot request and a run-owned pointer gesture. */
const specialEvents=()=>root.LuckyDexArcadeSpecialEvents;
const rareOdds=()=>({berry:.03,unown:.004,tileCard:.004,tilePack:.004,tilePresent:.018,...(root.state?.settings?.rareOdds||{})});
function persistBerryAttempt(){try{rareBridge()?.save?.();}catch(_){try{root.save?.();}catch(__){}}}
function ensureBerryAttempt(){
 const rr=rareRewards(),state=root.state;if(!rr||!state)return {id:'volatile-berry',kind:'berryRun',special:null};
 let attempt=rr.currentAttempt(state,'berryPicker');if(attempt)return attempt;
 attempt=rr.getOrCreateAttempt(state,'berryPicker',()=>({kind:'berryRun',mode:berryMode,special:specialEvents()?.createBerryRunSpecial?.(Math.random,rareOdds().berry)||null}));persistBerryAttempt();return attempt;
}
async function resolveBerrySpecial(attempt,run){
 const special=attempt?.special;if(!special||attempt.reward||!rareBridge()?.resolveArcadeReward)return attempt?.reward||null;
 try{const reward=await rareBridge().resolveArcadeReward(special.kind);if(!reward)throw new Error('reward unavailable');rareRewards()?.patchAttempt?.(root.state,'berryPicker',attempt.id,{reward});persistBerryAttempt();if(run===berry&&!run.disposed){run.attempt=attempt;attachBerrySpecial(run);renderBerryCustomers();}return reward;}catch(error){console.warn?.('[LuckyDex] Berry special reward resolution failed',error);return null;}
}
function attachBerrySpecial(run){
 const attempt=run?.attempt,special=attempt?.special;if(!run?.running||!special||special.surfaced||special.missed||special.delivered||run.requestCount<Number(special.triggerAfter||1))return false;
 const target=run.customers.find(c=>!c.reaction&&!c.specialRequest);if(!target)return false;special.surfaced=true;target.specialRequest=true;rareRewards()?.patchAttempt?.(root.state,'berryPicker',attempt.id,{special});persistBerryAttempt();message('berryPicker','✨ GOLDEN BERRY! Deliver the gold fruit to bank a mystery reward for the results screen.');return true;
}
function berryNewRequest(c){c.specialRequest=false;c.request=choose(BERRIES.slice(0,BERRY_MODES[berryMode].berries)).id;c.expires=performance.now()+BERRY_META[berryMode].patience;c.reaction='';if(berry?.running){berry.requestCount=Number(berry.requestCount||0)+1;attachBerrySpecial(berry);}}
function prepareBerry(running=false,attempt=null){
 const cfg=BERRY_MODES[berryMode];
 berry=runState({running,score:0,served:0,combo:0,misses:0,selected:null,requestCount:0,attempt,ends:cfg.durationMs?performance.now()+cfg.durationMs:null,customers:participants(cfg.maxCustomers).map(p=>({p}))});
 berry.customers.forEach(berryNewRequest);berryScene();renderBerryHud();controls('berryPicker',running,'START PICKER');
 message('berryPicker',running?'Match each requested berry. Drag it to the Pokémon, or tap the berry then the Pokémon.':'Choose a mode, then start. Match the berries your Pokémon request.');
}
function berryScene(){
 const stage=$('berryPickerStage');if(!stage||!berry)return;
 stage.replaceChildren();
 const tree=document.createElement('div');tree.className='amie-berry-tree';tree.dataset.berryCount=BERRY_MODES[berryMode].berries;
 BERRIES.slice(0,BERRY_MODES[berryMode].berries).forEach((b,i)=>{
  const button=document.createElement('button');button.type='button';button.className=`amie-berry berry-pos-${i}`;button.dataset.berryPick=b.id;button.setAttribute('aria-label',`${b.name} Berry`);
  const img=document.createElement('img');img.src=b.image;img.alt='';button.append(img);tree.append(button);
  button.setAttribute('aria-pressed','false');
  // Android WebView supports PointerEvent; only older engines need touch fallback.
  // Register one gesture path so a physical touch cannot start two drags.
  if(root.PointerEvent)button.addEventListener('pointerdown',e=>startBerryDrag(e,b.id));
  else button.addEventListener('touchstart',e=>startBerryTouchDrag(e,b.id),{passive:false});
  button.addEventListener('click',()=>{if(!berry?.running||berry.drag)return;if(berry.suppressClick===button){berry.suppressClick=null;return;}selectBerry(berry,b.id);});
 });
 const customers=document.createElement('div');customers.id='berryCustomers';customers.className='amie-customers';
 berry.customers.forEach((c,i)=>{
  const button=document.createElement('button');button.type='button';button.className='amie-requester';button.dataset.berryCustomer=i;
  const thought=document.createElement('span');thought.className='berry-thought';const request=document.createElement('img');const special=document.createElement('span');special.className='berry-special-reward';special.hidden=true;const patience=document.createElement('progress');patience.max=1;thought.append(request,special,patience);
  const img=document.createElement('img');img.src=c.p.image;img.alt=c.p.name;img.className='amie-pokemon';
  button.append(thought,img);
  const feedSelected=()=>{if(berry?.selected&&!berry.drag)deliverBerry(i,berry.selected);};
  button.addEventListener('click',feedSelected);
  // Some WebViews suppress a compatibility click immediately after a drag.
  // A physical touch release still completes the tap-to-feed fallback.
  if(root.PointerEvent)button.addEventListener('pointerup',e=>{if(e.pointerType==='touch'||e.pointerType==='pen')feedSelected();});
  else button.addEventListener('touchend',feedSelected);
  customers.append(button);
 });
 stage.append(tree,customers);renderBerryCustomers();
}
function goldenBerryId(run=berry){const c=run?.customers?.find?.(row=>row.specialRequest);return c?.request||null;}
function renderBerrySpecialTree(){
 if(!berry)return;const golden=goldenBerryId();
 $('berryPickerStage')?.querySelectorAll('[data-berry-pick]').forEach(el=>{const active=!!golden&&el.dataset.berryPick===golden;el.classList.toggle('golden-berry',active);const img=el.querySelector('img');if(img){img.hidden=false;img.src=berryObj(el.dataset.berryPick).image;img.classList.toggle('golden-berry-image',active);}});
}
function renderBerryCustomers(){
 if(!berry)return;const now=performance.now();
 $('berryCustomers')?.querySelectorAll('[data-berry-customer]').forEach((el,i)=>{
  const c=berry.customers[i],b=berryObj(c.request),golden=!!c.specialRequest,remaining=berry.running?clamp((c.expires-now)/BERRY_META[berryMode].patience,0,1):1;
  el.className=`amie-requester ${c.reaction||''} ${remaining<.28?'impatient':''} ${golden?'special-request golden-berry-request':''}`;
  el.setAttribute('aria-label',golden?`${c.p.name} requests the Golden Berry`:`${c.p.name} requests ${b.name} Berry`);
  const img=el.querySelector('.berry-thought img'),badge=el.querySelector('.berry-special-reward');if(img){img.hidden=false;if(img.getAttribute('src')!==b.image)img.src=b.image;img.alt=golden?'Golden Berry':b.name;img.classList.toggle('golden-berry-image',golden);}
  if(badge){badge.hidden=true;badge.textContent='';badge.title='';}
  el.querySelector('progress').value=remaining;
 });renderBerrySpecialTree();
}
function selectBerry(run,id){
 if(run!==berry||run.disposed)return;run.selected=id;
 $('berryPickerStage')?.querySelectorAll('[data-berry-pick]').forEach(el=>{const selected=el.dataset.berryPick===id;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
}
function berryDropTarget(point){
 const hit=document.elementFromPoint(point.clientX,point.clientY)?.closest('[data-berry-customer]');if(hit)return hit;
 // Capture retargets events to the berry; physical release coordinates decide drops.
 return [...($('berryCustomers')?.querySelectorAll('[data-berry-customer]')||[])].find(el=>{const r=el.getBoundingClientRect();return point.clientX>=r.left&&point.clientX<=r.right&&point.clientY>=r.top&&point.clientY<=r.bottom;});
}
function startBerryDrag(ev,id){if(ev.isPrimary===false||ev.button>0)return;startBerryGesture(ev,id,false);}
function startBerryTouchDrag(ev,id){startBerryGesture(ev,id,true);}
function startBerryGesture(ev,id,touch){
 const run=berry,source=ev.currentTarget;if(!run?.running||!source||run.drag)return;
 const first=touch?(ev.changedTouches?.[0]||ev.touches?.[0]):ev;if(!first)return;
 const gestureId=touch?first.identifier:ev.pointerId;run.suppressClick=null;selectBerry(run,id);
 let ghost=null,dragging=false,cleaned=false;
 const locate=list=>{if(!list)return null;for(const t of list)if(t.identifier===gestureId)return t;return null;};
 const point=(e,end=false)=>touch?locate(end?e.changedTouches:e.touches):(e.pointerId===gestureId?e:null);
 const move=e=>{
  const p=point(e);if(!p)return;
  if(!dragging&&Math.hypot(p.clientX-first.clientX,p.clientY-first.clientY)<8)return;
  if(!dragging){dragging=true;ghost=document.createElement('img');ghost.src=berryObj(id).image;ghost.className='berry-drag';if(goldenBerryId(run)===id)ghost.classList.add('golden-berry-image');ghost.alt='';document.body.append(ghost);}
  if(e.cancelable)e.preventDefault();ghost.style.left=`${p.clientX}px`;ghost.style.top=`${p.clientY}px`;
 };
 const cleanup=()=>{
  if(cleaned)return;cleaned=true;
  if(touch){document.removeEventListener('touchmove',move,true);document.removeEventListener('touchend',up,true);document.removeEventListener('touchcancel',cancel,true);}
  else{document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',cancel,true);source.removeEventListener('lostpointercapture',lost);try{if(source.hasPointerCapture?.(gestureId))source.releasePointerCapture(gestureId);}catch(_){}}
  ghost?.remove();if(run.drag===cleanup)run.drag=null;
 };
 const up=e=>{
  const p=point(e,true);if(!p)return;
  const target=dragging?berryDropTarget(p):null;
  if(dragging){if(e.cancelable)e.preventDefault();run.suppressClick=source;}
  cleanup();if(run.disposed||!run.running)return;if(target)deliverBerry(Number(target.dataset.berryCustomer),id);
 };
 const cancel=e=>{if(point(e,true))cleanup();};
 const lost=e=>{if(e.pointerId===gestureId)cleanup();};
 run.drag=cleanup;
 if(touch){document.addEventListener('touchmove',move,{capture:true,passive:false});document.addEventListener('touchend',up,{capture:true,passive:false});document.addEventListener('touchcancel',cancel,{capture:true,passive:false});}
 else{document.addEventListener('pointermove',move,{capture:true,passive:false});document.addEventListener('pointerup',up,{capture:true,passive:false});document.addEventListener('pointercancel',cancel,true);source.addEventListener('lostpointercapture',lost);try{source.setPointerCapture?.(gestureId);}catch(_){}}
}
function berryMiss(c,wrong=false){
 const run=berry;if(!run?.running||c.reaction)return;run.combo=0;run.misses++;c.reaction=wrong?'wrong':'timeout';
 if(c.specialRequest&&run.attempt?.special){run.attempt.special.missed=true;run.attempt.special.surfaced=true;c.specialRequest=false;rareRewards()?.patchAttempt?.(root.state,'berryPicker',run.attempt.id,{special:run.attempt.special});persistBerryAttempt();message('berryPicker','Golden Berry missed · mystery reward lost.');}
 later(run,()=>{berryNewRequest(c);renderBerryCustomers();},360);
 if(BERRY_MODES[berryMode].missLimit&&run.misses>=BERRY_MODES[berryMode].missLimit)finishBerry();
}
function deliverBerry(index,id){
 const run=berry,c=run?.customers[index];if(!run?.running||!c||c.reaction)return;
 selectBerry(run,null);
 if(c.request!==id){berryMiss(c,true);renderBerryCustomers();renderBerryHud();return;}
 const remaining=clamp((c.expires-performance.now())/BERRY_META[berryMode].patience,0,1);
 run.score+=Math.round(100+remaining*60+Math.min(run.combo,12)*8);run.served++;run.combo++;c.reaction=remaining>.55?'great':'good';root.vibrate?.(12);
 if(c.specialRequest&&run.attempt?.special){run.attempt.special.delivered=true;run.attempt.special.surfaced=true;c.specialRequest=false;rareRewards()?.patchAttempt?.(root.state,'berryPicker',run.attempt.id,{special:run.attempt.special});persistBerryAttempt();message('berryPicker','✨ GOLDEN BERRY banked! Finish the run to reveal your mystery reward.');}
 later(run,()=>{berryNewRequest(c);renderBerryCustomers();},250);renderBerryCustomers();renderBerryHud();
}
function renderBerryHud(){
 if(!berry)return;const left=berry.ends==null?null:Math.max(0,berry.ends-performance.now());
 text('berryPickerTimer',left==null?'∞':Math.ceil(left/1000));text('berryPickerScore',berry.score);text('berryPickerCombo',berry.combo);text('berryPickerCorrect',berry.served);
 session()?.update?.('berryPicker',{runText:left==null?`${berry.misses}/3 misses · ${berry.served} served`:`${Math.ceil(left/1000)}s · ${berry.served} served`,liveLabel:'SCORE',liveValue:berry.score});
}
function startBerry(){if(active!=='berryPicker')return;dispose(berry);session()?.hideResult?.();const attempt=ensureBerryAttempt();prepareBerry(true,attempt);const run=berry;if(attempt?.special&&!attempt.reward)resolveBerrySpecial(attempt,run);else attachBerrySpecial(run);run.interval=setInterval(()=>{if(run.disposed||!run.running)return;const now=performance.now();for(const c of run.customers)if(now>=c.expires&&!c.reaction)berryMiss(c);renderBerryCustomers();renderBerryHud();if(run.ends!=null&&now>=run.ends)finishBerry();},90);}
function berryRewardReveal(reward){if(!reward)return null;const type=reward.type||'';return {kicker:'GOLDEN BERRY REWARD',name:reward.label||'Mystery Reward',image:reward.image||'',visual:reward.visual||(type==='profile'&&reward.dust?'✦':type==='profile'&&reward.tickets?'🎟':'🎁'),meta:type==='card'?(reward.source==='tcgp'?'TCG POCKET CARD':'POKÉMON TCG CARD'):type==='pack'?'SEALED BOOSTER':reward.dust?'CARD DUST':reward.tickets?'PACK VOUCHER':'SPECIAL DELIVERY'};}
async function finishBerry(){
 if(!berry?.running||berry.finished)return;const run=berry;run.finished=true;dispose(run);
 const best=root.state?.arcade?.bestBerryPicker,previousBest=best&&Object.hasOwn(best,berryMode)?Number(best[berryMode])||0:0;
 if(best&&Object.hasOwn(best,berryMode))best[berryMode]=Math.max(previousBest,run.score);
 const meta=BERRY_META[berryMode],coins=clamp(Math.round(run.score/24),20,meta.cap),reward=award('berryPicker','Berry Picker',run.score,coins,run.served>=meta.daily,{key:'berry',amount:berryMode==='hard'?4:berryMode==='normal'?3:2});
 let rareLabel='';const rr=rareRewards(),attempt=run.attempt;
 try{if(rr&&root.state&&attempt?.id){if(attempt.special?.delivered){if(!attempt.reward)await resolveBerrySpecial(attempt,run);if(attempt.reward){const claim=await rr.claimAttempt(root.state,'berryPicker',attempt.id,r=>rareBridge()?.grantReward?.(r));rareLabel=claim?.result?.label||attempt.reward.label||'Special reward';}else throw new Error('Golden Berry reward is still unavailable');}else rr.abandonAttempt(root.state,'berryPicker',attempt.id);}}catch(error){message('berryPicker','Run complete, but your Golden Berry reward is still reserved. Play again online to retry the claim.');console.error?.('[LuckyDex] Berry special reward claim failed',error);}if(attempt?.special?.delivered&&Number(run.misses||0)===0)root.LuckyDexAchievementTelemetryV0413?.record?.(root.state,'berry:golden-perfect',{mode:berryMode,score:run.score});persistBerryAttempt();root.save?.();
 const review={title:berryMode==='unlimited'?'THREE MISSES':'TIME!',mode:berryMode==='unlimited'?'Unlimited':berryMode[0].toUpperCase()+berryMode.slice(1),difficulty:berryMode==='unlimited'?'Survival':berryMode[0].toUpperCase()+berryMode.slice(1),metricLabel:'BERRIES SERVED',metricValue:String(run.served),stats:[{label:'Score',value:String(run.score)},{label:'Served',value:String(run.served)},{label:'Best Combo',value:String(run.combo)},{label:'Misses',value:String(run.misses)}],pbs:[{label:'Best Score',value:String(best?.[berryMode]||run.score),isNew:run.score>previousBest}],rewards:[{label:'Lucky Coins',value:String(reward.coinsAwarded||0)},...(reward.itemAwarded?[{label:'Bonus',value:platform()?.formatItemAward?.(reward.itemAwarded)||''}]:[]),...(rareLabel?[{label:'Special delivery',value:rareLabel}]:[])]};
 controls('berryPicker',false,'PLAY AGAIN');result('berryPicker',{title:berryMode==='unlimited'?'THREE MISSES':'TIME!',metricLabel:'BERRIES SERVED',metricValue:`${run.served} · ${run.score} pts`,...reward,bestText:rareLabel?`SPECIAL DELIVERY · ${rareLabel}`:run.combo>=BERRY_STREAK?'HOT STREAK':'',rewardReveals:rareLabel&&attempt?.reward?[berryRewardReveal(attempt.reward)]:[],review,onReplay:startBerry,onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.(true)});
}
function setBerryMode(m){if(!BERRY_MODES[m]||berry?.running)return;berryMode=m;modeButtons('berry',m);if(active==='berryPicker'){dispose(berry);prepareBerry();}}

/* Tile Puzzle: persistent rare attempts, curated scenes and landscape play. */
function loadedImage(url,onload){
 let im=imageCache.get(url);if(!im){im=new Image();imageCache.set(url,im);im.src=url;}
 if(im.complete&&im.naturalWidth)queueMicrotask(()=>onload?.());else if(onload)im.addEventListener('load',onload,{once:true});return im;
}
function drawCover(ctx,im,w,h,position){if(!im?.complete||!im.naturalWidth)return;const scale=Math.max(w/im.naturalWidth,h/im.naturalHeight),dw=im.naturalWidth*scale,dh=im.naturalHeight*scale,pos=Array.isArray(position)?position:[.5,.5],px=clamp(Number(pos[0])||.5,0,1),py=clamp(Number(pos[1])||.5,0,1),dx=-(dw-w)*px,dy=-(dh-h)*py;ctx.drawImage(im,dx,dy,dw,dh);}
function drawContain(ctx,im,w,h,pad=.08){if(!im?.complete||!im.naturalWidth)return;const maxW=w*(1-pad*2),maxH=h*(1-pad*2),scale=Math.min(maxW/im.naturalWidth,maxH/im.naturalHeight),dw=im.naturalWidth*scale,dh=im.naturalHeight*scale;ctx.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh);}
function tileSource(ctx,w,h,now,run){
 ctx.clearRect(0,0,w,h);
 if(run.scene?.special){
  ctx.fillStyle='#102535';ctx.fillRect(0,0,w,h);ctx.save();ctx.strokeStyle='rgba(245,211,105,.18)';ctx.lineWidth=Math.max(1,w/350);for(let x=-h;x<w+h;x+=Math.max(24,w/12)){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+h,h);ctx.stroke();}ctx.restore();
  drawContain(ctx,run.sceneImage,w,h,.08);ctx.fillStyle='rgba(5,16,27,.78)';ctx.fillRect(0,h*.86,w,h*.14);ctx.fillStyle='#f6df82';ctx.font=`700 ${Math.max(14,Math.round(h*.045))}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(run.scene.title||'RARE REWARD').slice(0,48),w/2,h*.93);return;
 }
 drawCover(ctx,run.sceneImage,w,h,run.scene?.position);
}
function updateTileTarget(run){const target=$('tilePuzzleTarget');if(!target||!run?.source?.width)return;const scene=run.scene||{};try{target.src=run.source.toDataURL('image/png');target.alt=`Completed puzzle target: ${scene.title||'Pokémon scene'}`;text('tilePuzzleTargetName',scene.title||'Pokémon scene');}catch(_){} }
const TILE_VISUAL_EQUIVALENCE_MAD=10;
function tileVisualSignatures(run,rows,cols){
 const source=run?.source,w=source?.width||0,h=source?.height||0,key=`${w}x${h}:${rows}x${cols}`;if(!run?.sceneImage?.complete||!run.sceneImage.naturalWidth||!w||!h)return null;if(run.tileSignatureKey===key&&run.tileSignatures)return run.tileSignatures;
 let data;try{data=source.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;}catch(_){return null;}
 const sample=8,out=[];
 for(let index=0;index<rows*cols;index++){const row=Math.floor(index/cols),col=index%cols,signature=[];for(let sy=0;sy<sample;sy++){const y=Math.min(h-1,Math.max(0,Math.floor((row+(sy+.5)/sample)*h/rows)));for(let sx=0;sx<sample;sx++){const x=Math.min(w-1,Math.max(0,Math.floor((col+(sx+.5)/sample)*w/cols))),off=(y*w+x)*4;signature.push(data[off],data[off+1],data[off+2]);}}out.push(signature);}
 run.tileSignatureKey=key;run.tileSignatures=out;return out;
}
function tileSignaturesEquivalent(run,a,b,rows,cols,threshold=TILE_VISUAL_EQUIVALENCE_MAD){const signatures=tileVisualSignatures(run,rows,cols),x=signatures?.[a],y=signatures?.[b];if(!x||!y||x.length!==y.length)return false;let total=0;for(let i=0;i<x.length;i++)total+=Math.abs(x[i]-y[i]);return total/x.length<=threshold;}
const rareRewards=()=>root.LuckyDexArcadeRareRewards;
const tileCore=()=>root.LuckyDexTilePuzzleCore;
const rareBridge=()=>root.LuckyDexRareRewardBridge;
function tileScenes(){return Array.isArray(root.LuckyDexTileScenesV0253)?root.LuckyDexTileScenesV0253:[];}
function tileSceneById(id){return tileScenes().find(scene=>scene.id===id)||null;}
function fallbackTileScene(){const core=tileCore(),scenes=tileScenes(),candidate=scenes.find(scene=>scene.id !== lastTileSceneId&&core?.sceneAllowedForMode?.(scene,tileMode));return candidate||scenes[0]||{id:'oreburgh-museum',title:'Oreburgh Mining Museum',src:'arcade/venues-v0223/oreburgh-museum-dppt.png',position:[.5,.5]};}
function persistTileAttempt(){try{rareBridge()?.save?.();}catch(_){try{root.save?.();}catch(__){}}}
function ensureTileAttempt(){
 const rr=rareRewards(),core=tileCore(),state=root.state,cfg=TILE_MODES[tileMode],n=cfg.rows*cfg.cols;
 if(!rr||!core||!state){const scene=core?.pickScene?.(tileScenes(),tileMode,lastTileSceneId,Math.random)||fallbackTileScene();return {id:'volatile',kind:'normal',mode:tileMode,sceneId:scene.id,resolution:'ready'};}
 let attempt=rr.currentAttempt(state,'tilePuzzle');
 if(!attempt){attempt=rr.getOrCreateAttempt(state,'tilePuzzle',()=>core.createAttempt({mode:tileMode,tileCount:n,scenes:tileScenes(),lastSceneId:lastTileSceneId,random:Math.random,rates:{card:rareOdds().tileCard,pack:rareOdds().tilePack,gift:rareOdds().tilePresent}}));lastTileSceneId=attempt.sceneId||lastTileSceneId;persistTileAttempt();return attempt;}
 const patch={};if(attempt.mode!==tileMode)patch.mode=tileMode;
 if(attempt.gift&&Number(attempt.gift.tileValue)>=n)attempt.gift.tileValue=Number(attempt.gift.tileValue)%n;
 const current=tileSceneById(attempt.sceneId);if(attempt.kind==='normal'&&(!current||core.sceneAllowedForMode?.(current,tileMode)===false)){const next=core.pickScene(tileScenes(),tileMode,lastTileSceneId,Math.random);if(next){patch.sceneId=next.id;lastTileSceneId=next.id;}}
 if(Object.keys(patch).length){attempt=rr.patchAttempt(state,'tilePuzzle',attempt.id,patch)||attempt;persistTileAttempt();}
 return attempt;
}
function pickTileScene(){return sceneForAttempt(ensureTileAttempt());}
function rewardScene(attempt){const reward=attempt?.reward;if(!reward?.image)return null;return {id:`tile-reward-${attempt.id}`,title:reward.label||`${attempt.kind==='pack'?'Booster Pack':'Card'} Reward`,src:reward.image,position:[.5,.5],special:true};}
function sceneForAttempt(attempt){if(attempt?.kind==='card'||attempt?.kind==='pack')return rewardScene(attempt)||{id:`tile-reward-loading-${attempt?.id||'pending'}`,title:`Rare ${attempt.kind==='pack'?'booster':'card'} loading…`,src:'arcade/sprites/items/poke-ball.png',position:[.5,.5],special:true,placeholder:true};return tileSceneById(attempt?.sceneId)||fallbackTileScene();}
function setTileStartReady(ready){const btn=$('tilePuzzleStartBtn');if(btn)btn.disabled=!ready;}
async function resolveTileReward(attempt,run){
 if(!attempt||attempt.kind==='normal'||attempt.reward)return attempt?.reward||null;const bridge=rareBridge(),rr=rareRewards();if(!bridge?.resolveTileReward||!rr||!root.state)return null;
 setTileStartReady(false);message('tilePuzzle',`A rare ${attempt.kind==='pack'?'booster':'card'} puzzle appeared. Loading the exact reward…`);
 try{
  const reward=await bridge.resolveTileReward(attempt.kind);if(!reward)throw new Error('reward unavailable');
  const updated=rr.patchAttempt(root.state,'tilePuzzle',attempt.id,{reward,resolution:'ready'});persistTileAttempt();if(!updated)return null;
  if(tile===run&&!run.disposed){run.attempt=updated;run.scene=sceneForAttempt(updated);run.targetReady=false;run.tileSignatureKey=null;run.tileSignatures=null;run.sceneImage=loadedImage(run.scene.src,()=>{run.targetReady=false;if(tile===run&&!run.disposed)renderTileCanvas(run,performance.now());});message('tilePuzzle',`RARE ${attempt.kind==='pack'?'BOOSTER':'CARD'} PUZZLE · Complete it to keep ${reward.label||'the reward'}.`);if(!run.running)setTileStartReady(true);}
  return reward;
 }catch(_){rr.patchAttempt(root.state,'tilePuzzle',attempt.id,{resolution:'pending'});persistTileAttempt();message('tilePuzzle',`Rare ${attempt.kind==='pack'?'booster':'card'} reward is still reserved. Reopen online to load it; it will not reroll.`);return null;}
}
function setTileLayoutState(running){const game=$('tilePuzzleGame');if(game)game.classList.toggle('is-running',!!running);}
function openTileReference(){const target=$('tilePuzzleTarget'),large=$('tilePuzzleReferenceLarge'),overlay=$('tilePuzzleReferenceOverlay');if(!target||!large||!overlay)return;large.src=target.src;large.alt=target.alt||'Enlarged completed puzzle reference';overlay.hidden=false;$('tilePuzzleReferenceClose')?.focus?.();}
function closeTileReference(){const overlay=$('tilePuzzleReferenceOverlay');if(overlay)overlay.hidden=true;}
let tileMysteryGiftIcon=null;
function mysteryGiftIcon(){if(tileMysteryGiftIcon)return tileMysteryGiftIcon;if(typeof Image==='undefined')return null;tileMysteryGiftIcon=loadedImage('arcade/ui/mystery-gift.svg');return tileMysteryGiftIcon;}
function drawGiftMarker(ctx,x,y,cw,ch){
 const size=Math.max(16,Math.min(cw,ch)*.28),left=x+cw-size-5,top=y+5,icon=mysteryGiftIcon();
 if(!icon?.complete||!icon.naturalWidth)return;
 ctx.save();ctx.globalAlpha=.94;ctx.drawImage(icon,left,top,size,size);ctx.restore();
}
function renderTileCanvas(run,now){
 if(run.disposed||tile!==run)return;const canvas=$('tilePuzzleCanvas');if(!canvas)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,root.devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.round(w*3/5);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}run.source.width=w;run.source.height=h;tileSource(run.source.getContext('2d'),w,h,now,run);if(!run.targetReady){updateTileTarget(run);run.targetReady=true;}
 const ctx=canvas.getContext('2d'),{rows,cols}=TILE_MODES[tileMode],cw=w/cols,ch=h/rows;ctx.clearRect(0,0,w,h);
 run.board.forEach((value,index)=>{const r=tileRect(value,rows,cols),x=index%cols*cw,y=Math.floor(index/cols)*ch;ctx.drawImage(run.source,r.x*w,r.y*h,r.w*w,r.h*h,x,y,cw,ch);if(run.attempt?.gift?.revealed&&Number(value)===Number(run.attempt.gift.tileValue))drawGiftMarker(ctx,x,y,cw,ch);if(run.running){ctx.strokeStyle=index===run.selected?'#ffe777':'rgba(255,255,255,.6)';ctx.lineWidth=index===run.selected?4:1;ctx.strokeRect(x+.5,y+.5,cw-1,ch-1);}});
 text('tilePuzzleTimer',run.running?((now-run.started)/1000).toFixed(1):run.finished?run.elapsed.toFixed(1):'0.0');text('tilePuzzleMoves',run.moves);if(run.running)run.raf=requestAnimationFrame(now=>renderTileCanvas(run,now));
}
function prepareTile(running=false,sceneOverride=null){
 const cfg=TILE_MODES[tileMode],n=cfg.rows*cfg.cols;let board=running?shuffled(n):Array.from({length:n},(_,i)=>i);if(running&&isSolvedSwap(board))swapTiles(board,0,1);
 const attempt=ensureTileAttempt();const scene=sceneOverride||pickTileScene();const run=tile=runState({running,started:performance.now(),board,selected:null,moves:0,source:document.createElement('canvas'),targetReady:false,scene,attempt});
 const repaint=()=>{if(tile===run&&!run.disposed&&!run.running)renderTileCanvas(run,performance.now());};run.sceneImage=loadedImage(scene.src,()=>{run.targetReady=false;run.tileSignatureKey=null;run.tileSignatures=null;repaint();});
 const canvas=$('tilePuzzleCanvas');canvas?.setAttribute('aria-label',`${cfg.rows} by ${cfg.cols} ${scene.title} picture swap puzzle`);canvas?.classList.remove('tile-solved');setTileLayoutState(running);closeTileReference();controls('tilePuzzle',running,'START PUZZLE');
 const special=attempt.kind==='card'||attempt.kind==='pack';message('tilePuzzle',special?(attempt.reward?`RARE ${attempt.kind==='pack'?'BOOSTER':'CARD'} PUZZLE · Complete it to keep ${attempt.reward.label||'the reward'}.`:`A rare ${attempt.kind==='pack'?'booster':'card'} puzzle appeared. Loading the exact reward…`):(running?`Restore ${scene.title} by swapping two tiles.`:`Study ${scene.title}, choose a difficulty, then restore it by swapping two tiles.`));
 setTileStartReady(!special||!!attempt.reward);if(special&&!attempt.reward)resolveTileReward(attempt,run);if(running)run.raf=requestAnimationFrame(now=>renderTileCanvas(run,now));else renderTileCanvas(run,performance.now());
}
function tileTap(ev){
 if(!tile?.running)return;ev.preventDefault();const c=$('tilePuzzleCanvas'),r=c.getBoundingClientRect(),cfg=TILE_MODES[tileMode];const col=clamp(Math.floor((ev.clientX-r.left)/r.width*cfg.cols),0,cfg.cols-1),row=clamp(Math.floor((ev.clientY-r.top)/r.height*cfg.rows),0,cfg.rows-1),idx=row*cfg.cols+col;
 if(tileCore()?.revealGift?.(tile.attempt,tile.board,idx)){rareRewards()?.patchAttempt?.(root.state,'tilePuzzle',tile.attempt.id,{gift:tile.attempt.gift});persistTileAttempt();message('tilePuzzle','Mystery Gift found! Finish the puzzle to reveal what is inside.');}
 if(tile.selected==null){tile.selected=idx;return;}if(tile.selected===idx){tile.selected=null;return;}swapTiles(tile.board,tile.selected,idx);tile.moves++;tile.selected=null;text('tilePuzzleMoves',tile.moves);if(isSolvedVisualSwap(tile.board,(value,target)=>tileSignaturesEquivalent(tile,value,target,cfg.rows,cfg.cols)))finishTile();
}
function startTile(){if(active!=='tilePuzzle')return;const scene=tile?.finished?null:tile?.scene;dispose(tile);session()?.hideResult?.();prepareTile(true,scene);session()?.update?.('tilePuzzle',{runText:`${TILE_MODES[tileMode].rows}×${TILE_MODES[tileMode].cols} swap puzzle`,liveLabel:'MOVES',liveValue:0});}
async function finishTile(){
 if(!tile?.running||tile.finished)return;const run=tile;run.finished=true;run.elapsed=(performance.now()-run.started)/1000;run.running=false;if(run.raf!=null)cancelAnimationFrame(run.raf);run.raf=null;renderTileCanvas(run,performance.now());
 const best=root.state?.arcade?.bestTilePuzzle,previousBest=best&&Object.hasOwn(best,tileMode)&&best[tileMode]!=null?Number(best[tileMode]):null;if(best&&Object.hasOwn(best,tileMode)){if(previousBest==null||run.elapsed<previousBest)best[tileMode]=Number(run.elapsed.toFixed(2));}
 const cfg=TILE_MODES[tileMode],elapsed=run.elapsed,coins=clamp(Math.round(cfg.rows*cfg.cols*2.2-Math.min(35,elapsed/6)-Math.min(35,run.moves/10)),25,tileMode==='hard'?130:tileMode==='normal'?90:60),score=Math.max(1,Math.round(12000-elapsed*12-run.moves*8)),reward=award('tilePuzzle','Tile Puzzle',score,coins,elapsed<(tileMode==='hard'?300:tileMode==='normal'?180:100),{key:'berry',amount:tileMode==='hard'?3:2});
 let rareLabel='',rareReveal=null;const rr=rareRewards(),bridge=rareBridge(),attempt=run.attempt;
 try{
  if(rr&&root.state&&attempt?.id){
   if((attempt.kind==='card'||attempt.kind==='pack')&&attempt.reward){const claim=await rr.claimAttempt(root.state,'tilePuzzle',attempt.id,r=>bridge?.grantReward?.(r));rareLabel=claim?.result?.label||attempt.reward.label||'Rare reward';rareReveal=bridge?.rewardReveal?.(attempt.reward,claim?.result,attempt.kind==='pack'?'BOOSTER WON':'CARD WON')||null;}
   else if(attempt.gift?.revealed){rr.patchAttempt(root.state,'tilePuzzle',attempt.id,{reward:attempt.gift.reward,claimKind:'gift'});const claim=await rr.claimAttempt(root.state,'tilePuzzle',attempt.id,r=>bridge?.grantReward?.(r));rareLabel=claim?.result?.label||attempt.gift.reward?.label||'Mystery Gift';rareReveal=bridge?.rewardReveal?.(attempt.gift.reward,claim?.result,'MYSTERY GIFT')||null;}
   else rr.abandonAttempt(root.state,'tilePuzzle',attempt.id);
  }
 }catch(error){message('tilePuzzle','Puzzle complete, but the rare reward is still reserved. Reopen the puzzle to retry the claim.');console.error?.('[LuckyDex] Tile reward claim failed',error);}
 persistTileAttempt();root.save?.();
 const modeLabel=tileMode[0].toUpperCase()+tileMode.slice(1),review={title:'PICTURE COMPLETE!',mode:`${cfg.rows}×${cfg.cols} Puzzle`,difficulty:modeLabel,metricLabel:'TIME',metricValue:`${elapsed.toFixed(1)}s`,stats:[{label:'Moves',value:String(run.moves)},{label:'Picture',value:String(run.scene?.title||'Puzzle')}],pbs:[{label:`${modeLabel} Best`,value:best?.[tileMode]!=null?`${Number(best[tileMode]).toFixed(2)}s`:'—',isNew:previousBest==null||elapsed<previousBest}],rewards:[{label:'Lucky Coins',value:String(reward.coinsAwarded||0)},...(reward.itemAwarded?[{label:'Bonus',value:platform()?.formatItemAward?.(reward.itemAwarded)||''}]:[]),...(rareLabel?[{label:'Rare reward',value:rareLabel}]:[])]};
 $('tilePuzzleCanvas')?.classList.add('tile-solved');setTileLayoutState(false);controls('tilePuzzle',false,'NEW PUZZLE');setTileStartReady(true);result('tilePuzzle',{title:'PICTURE COMPLETE!',metricLabel:'TIME / MOVES',metricValue:`${elapsed.toFixed(1)}s · ${run.moves}`,...reward,bestText:rareLabel?`WON · ${rareLabel}`:'MOVING PICTURE RESTORED',rewardReveals:rareReveal?[rareReveal]:[],review,onReplay:startTile,onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.(true)});
}
function setTileMode(m){if(!TILE_MODES[m]||tile?.running)return;tileMode=m;modeButtons('tile',m);if(active==='tilePuzzle'){dispose(tile);prepareTile(false);}}
function requestTileOrientation(mode){const wanted=mode==='landscape'?'landscape':'portrait';try{rareBridge()?.setOrientation?.(wanted);}catch(_){}try{if(!root.Android?.setOrientation&&root.screen?.orientation?.lock)Promise.resolve(root.screen.orientation.lock(wanted)).catch(()=>{});}catch(_){} }
function updateTileOrientationButton(){const btn=$('tilePuzzleLandscapeBtn');if(btn)btn.textContent=(Number(root.innerWidth||0)>Number(root.innerHeight||0))?'PORTRAIT':'LANDSCAPE';}
function toggleTileOrientation(){const landscape=Number(root.innerWidth||0)>Number(root.innerHeight||0);requestTileOrientation(landscape?'portrait':'landscape');setTimeout(updateTileOrientationButton,120);}

function modeButtons(type,mode){document.querySelectorAll(`[data-${type}-mode]`).forEach(b=>b.classList.toggle('active',b.dataset[`${type}Mode`]===mode));}
function open(gameId){
 if(!['berryPicker','tilePuzzle'].includes(gameId))return false;resetAll();active=gameId;
 ['berryPicker','tilePuzzle'].forEach(g=>{const n=$(`${g}Game`);if(n)n.hidden=g!==gameId;});document.body.classList.add('arcade-open','arcade-mode');session()?.mount?.(gameId);
 if(gameId==='berryPicker'){modeButtons('berry',berryMode);prepareBerry();}else{modeButtons('tile',tileMode);updateTileOrientationButton();prepareTile();}return true;
}
function close(){const closingTile=active==='tilePuzzle';resetAll();closeTileReference();setTileLayoutState(false);['berryPicker','tilePuzzle'].forEach(g=>{const n=$(`${g}Game`);if(n)n.hidden=true;});if(closingTile)requestTileOrientation('portrait');active=null;document.body?.classList.remove('arcade-open');return true;}
function activeGame(){return active;}
function install(){
 const stage=$('berryPickerGame')?.querySelector('.berry-picker-stage');if(stage){stage.id='berryPickerStage';const msg=$('berryPickerMessage');if(msg)stage.after(msg);}
 const board=$('tilePuzzleBoard');if(board){const c=document.createElement('canvas');c.id='tilePuzzleCanvas';c.className='tile-puzzle-canvas';c.width=800;c.height=480;c.addEventListener('pointerdown',tileTap);board.replaceWith(c);}
 for(const [type,setter] of [['berry',setBerryMode],['tile',setTileMode]])document.querySelectorAll(`[data-${type}-mode]`).forEach(b=>b.addEventListener('click',()=>setter(b.dataset[`${type}Mode`])));
 for(const [id,handler] of [['berryPickerStartBtn',startBerry],['berryPickerRestartBtn',startBerry],['tilePuzzleStartBtn',startTile],['tilePuzzleRestartBtn',startTile]])$(id)?.addEventListener('click',handler);
 $('tilePuzzleLandscapeBtn')?.addEventListener('click',toggleTileOrientation);
 $('tilePuzzleReferenceBtn')?.addEventListener('click',openTileReference);$('tilePuzzleReferenceClose')?.addEventListener('click',closeTileReference);$('tilePuzzleReferenceOverlay')?.addEventListener('click',ev=>{if(ev.target?.id==='tilePuzzleReferenceOverlay'||ev.target?.id==='tilePuzzleReferenceLarge')closeTileReference();});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!$('tilePuzzleReferenceOverlay')?.hidden)closeTileReference();});
 root.addEventListener('resize',()=>{updateTileOrientationButton();if(tile&&!tile.running&&!tile.disposed)renderTileCanvas(tile,performance.now());});
}
const api={BERRIES,BERRY_MODES,TILE_MODES,swapTiles,isSolvedSwap,isSolvedVisualSwap,tileRect,startBerry,startTile,setBerryMode,setTileMode,open,close,activeGame};
root.LuckyDexAmie=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document!=='undefined')install();
})(typeof window!=='undefined'?window:globalThis);

