/* Pack visuals and data policy. No economy or collection writes live here. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LuckyDexPack = api;
})(typeof window === 'object' ? window : globalThis, function() {
  'use strict';
  const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
  const mix = (a,b,t) => a+(b-a)*t;
  function dateValue(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const date = new Date(value+'T00:00:00Z');
    return Number.isFinite(+date) && date.toISOString().slice(0,10) === value ? +date : null;
  }
  function orderSets(sets) {
    return sets.map((set,index)=>({set,index,date:dateValue(set.releaseDate)})).sort((a,b)=>
      a.date === null ? (b.date === null ? a.index-b.index : 1) :
      b.date === null ? -1 : b.date-a.date || a.index-b.index
    ).map(row=>row.set);
  }
  async function enrichSets(sets, options) {
    const enriched = sets.map(set=>({...set}));
    let cursor=0;
    async function worker() {
      while (cursor < enriched.length) {
        const i=cursor++, set=enriched[i];
        if (dateValue(set.releaseDate)!==null) continue;
        const cached=options.cached?.(set.id);
        if (dateValue(cached?.releaseDate)!==null) {set.releaseDate=cached.releaseDate;continue;}
        if (!options.online) continue;
        try {
          const detail=await options.detail(set.id);
          if (dateValue(detail?.releaseDate)!==null) {
            set.releaseDate=detail.releaseDate;
            options.persist?.({...set});
          }
        } catch (_) { /* Genuinely unavailable dates retain source order. */ }
      }
    }
    await Promise.all(Array.from({length:Math.min(6,enriched.length)},worker));
    return orderSets(enriched);
  }
  async function resolveArtwork(card, options) {
    async function local(blob, source) {
      if (!blob) return null;
      const url=options.objectUrl(blob);
      if (await options.decode(url)) return {url,owned:true,source};
      options.revoke(url);return null;
    }
    try {const hit=await local(await options.cached(card.id),'cache');if(hit)return hit;} catch (_) {}
    if (/^(data:|blob:)/i.test(card.image || '')) {
      if (await options.decode(card.image)) return {url:card.image,owned:false,source:'local'};
    }
    if (options.online && !options.signal?.aborted) {
      try {const hit=await local(await options.network(card),'network');if(hit)return hit;} catch (_) {}
    }
    return {url:options.placeholder,owned:false,source:'placeholder'};
  }
  function isPromoSet(set) {
    const name=String(set?.name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const id=String(set?.id||'').toLowerCase();
    return /\bpromos?\b/.test(name)||/(?:^|[-_:])promos?(?:$|[-_:])/.test(id);
  }
  function physicalPackSizeFor(setOrTotal) {
    const raw=typeof setOrTotal==='number'?setOrTotal:(setOrTotal?.cardCount?.total??setOrTotal?.cardCount?.official??setOrTotal?.total??setOrTotal?.setTotal);
    const total=Number(raw)||0;
    if(!total)return 10;
    if(total<=40)return 4;
    if(total<=70)return 6;
    if(total<=100)return 8;
    return 10;
  }
  function profileFor(card) {
    const shared=globalThis.LuckyDexCardRarity?.classify?.(card||{});
    const r=String(card?.rarity||card?._foil||'').toLowerCase().replace(/\s+/g,' ').trim();
    const legend=!shared&&/(^|\s)legend(?:ary)?(\s|$)/.test(r);
    let level=shared?.impactTier??0;
    let style=shared?.revealStyle||shared?.impactStyle||'normal';
    let label=shared?.revealLabel||'';
    const revealRank=Number(shared?.revealRank??level)||0;
    if(shared?.finish==='reverse-holo'&&revealRank<2)style='reverse';
    else if(shared?.finish!=='normal'&&revealRank<2)style='holo';
    if(!shared){
      const stars=(r.match(/[★☆]/g)||[]).length;
      const gold=!legend&&/crown|gold rare|hyper rare/.test(r);
      const prismatic=!legend&&!gold&&/rainbow|three star|3 star|immersive/.test(r);
      if(legend){level=6;style='legend';label='LEGEND PULL';}
      else if(gold){level=6;style='gold';label='GOLD JACKPOT';}
      else if(/secret rare/.test(r)){level=6;style='secret';label='SECRET RARE';}
      else if(prismatic){level=5;style='prismatic';label='PRISMATIC PULL';}
      else if(/special illustration|two star|2 star|two shiny|shiny ultra|rare holo lv\.x|rare prime/.test(r)){level=5;style='special';label='SPECIAL PULL';}
      else if(stars>=1||/one star|1 star|illustration|ultra rare|radiant|amazing|ace spec|one shiny|shining|rare holo ex|rare holo gx|rare break|holo rare v(?:max|star)?\b/.test(r)){level=4;style='illustration';label='ILLUSTRATION HIT';}
      else if(/double rare|four diamond|4 diamond/.test(r)){level=3;style='ultra';label='DOUBLE RARE';}
      else if(/rare|holo|three diamond|3 diamond/.test(r)||card?._foil){level=2;style='holo';label='RARE / HOLO';}
      else if(/uncommon|two diamond|2 diamond/.test(r)){level=1;style='normal';label='UNCOMMON';}
    }
    level=Math.max(0,Math.min(6,Number(level)||0));
    const drama=Math.max(level,Math.min(8,revealRank)),rankBonus=Math.max(0,drama-level);
    const approachEnd=[560,585,610,645,690,735,815][level]+Math.round(rankBonus*70);
    const settleEnd=approachEnd+[150,155,165,175,190,220,260][level]+Math.round(rankBonus*45);
    const flipEnd=settleEnd+[430,450,470,500,545,625,720][level]+Math.round(rankBonus*90);
    const payoff=[360,500,650,850,1150,1750,2600][level]+Math.round(rankBonus*280);
    const traits=shared?.chaseTraits||[];
    const isLegend=style==='legend'||legend;
    const gold=style==='gold'||style==='crown',prismatic=style==='prismatic'||style==='immersive';
    const printedRarity=String(card?.rarity||'').trim();
    const secondaryLabel=/^no rarity$/i.test(printedRarity)?'':(printedRarity||(!label?String(card?._foil||'').trim():''));
    return {
      level,revealRank:drama,style,legend:isLegend,gold,prismatic,label,secondaryLabel,
      rarityClass:shared?.rarityClass||'unknown',finish:shared?.finish||'normal',chaseTraits:traits,
      particles:[0,8,18,34,64,112,176][level]+Math.round(rankBonus*24),
      flash:Math.min(1,[0,.12,.24,.38,.62,.88,1][level]+rankBonus*.07),
      ribbons:[0,0,0,1,2,3,5][level]+Math.round(rankBonus),
      rayCount:[0,0,4,8,16,28,40][level]+Math.round(rankBonus*5),
      rainbow:style==='prismatic'||style==='immersive',
      duration:flipEnd+payoff,
      approachEnd,settleEnd,flipEnd,
      startScale:[.58,.50,.40,.31,.22,.13,.07][level],
      startZ:[-1250,-1700,-2350,-3050,-3950,-5200,-6800][level],
      turnsY:[0,0,1,1,2,3,5][level],
      turnsZ:[0,0,0,1,1,2,3][level],
      overshoot:[1.008,1.014,1.024,1.038,1.055,1.08,1.105][level],
      aura:[0,.08,.13,.2,.34,.56,.8][level],
      haptic:[[8],[10,14,14],[14,16,24],[18,16,28,16,34],[22,15,36,15,48],[30,16,40,16,58,18,82],[38,16,48,16,68,18,92,20,140]][level]
    };
  }
  // Actual perspective flight. Rarity changes the distance, initial size,
  // number of rotations, overshoot and total timing rather than only adding a
  // cosmetic overlay after the card is already on screen.
  function motionAt(ms, profile={level:0,approachEnd:560,settleEnd:710,flipEnd:1140,startScale:.42,startZ:-1800,turnsY:.55,turnsZ:.35,overshoot:1.01}) {
    const approachEnd=profile.approachEnd||560, settleEnd=profile.settleEnd||710, flipEnd=profile.flipEnd||1140;
    const yFinal=360*(profile.turnsY ?? .55), zFinal=360*(profile.turnsZ ?? .35);
    if (ms<=approachEnd) {
      const t=clamp(ms/approachEnd), e=1-Math.pow(1-t,2.45), drift=Math.sin(t*Math.PI)*18*(profile.level||0)/6;
      return {
        z:mix(profile.startZ||-1800,58,e),
        scale:mix(profile.startScale||.42,profile.overshoot||1.01,e),
        x:mix(68+(profile.level||0)*7,2,e),
        y:mix(-55-(profile.level||0)*13,yFinal,e),
        roll:mix(-120-(profile.level||0)*18,zFinal,e),
        lift:mix(-150-(profile.level||0)*24,drift,e),
        flip:0
      };
    }
    if(ms<=settleEnd){
      const s=clamp((ms-approachEnd)/(settleEnd-approachEnd)), spring=1-Math.pow(1-s,3);
      return {z:mix(58,0,spring),scale:mix(profile.overshoot||1.01,1,spring),x:mix(2,0,spring),y:yFinal,roll:zFinal,lift:mix(0,-4*Math.sin(s*Math.PI),spring),flip:0};
    }
    const f=clamp((ms-settleEnd)/(flipEnd-settleEnd)), smooth=f*f*(3-2*f);
    return {z:0,scale:1,x:0,y:yFinal,roll:zFinal,lift:0,flip:180*smooth};
  }
  function motionTransform(m) {
    return `translate3d(0,${m.lift}px,${m.z}px) rotateX(${m.x}deg) rotateY(${m.y}deg) rotateZ(${m.roll}deg) scale(${m.scale})`;
  }
  function ribbonPoint(angle, ring, hw, hh) {
    const tilts=[-.32,.38,-.6,.72],tilt=tilts[ring%tilts.length]+Math.floor(ring/tilts.length)*.11;
    const u=Math.cos(angle)*hw*(1.42+ring*.10),v=Math.sin(angle)*hh*(.68+ring*.075);
    return {x:u*Math.cos(tilt)-v*Math.sin(tilt), y:u*Math.sin(tilt)+v*Math.cos(tilt), depth:Math.cos(angle-ring*.58)};
  }
  class RevealSession {
    constructor(options) {this.options=options;this.animations=[];this.ready=false;this.closed=false;this.done=false;this.rafId=null;this.origin=null;}
    ownAnimation(animation) {this.animations.push(animation);return animation;}
    start() {
      const tick=time=>{
        if(this.closed || this.done)return;
        if(this.origin===null)this.origin=time;
        const elapsed=time-this.origin;
        try{this.options.frame(elapsed);}catch(error){try{this.options.onError?.(error);}catch(_){}this.finish();return;}
        if(elapsed>=this.options.duration){this.finish();return;}
        this.rafId=this.options.raf(tick);
      };
      this.rafId=this.options.raf(tick);
    }
    stopLoops() {
      if(this.rafId!==null){try{this.options.caf(this.rafId);}catch(error){try{this.options.onError?.(error);}catch(_){}}this.rafId=null;}
      this.animations.splice(0).forEach(a=>{try{a?.cancel?.();}catch(error){try{this.options.onError?.(error);}catch(_){}}});
    }
    finish() {if(this.closed||this.done)return;this.done=true;this.stopLoops();this.ready=true;try{this.options.settle();}catch(error){try{this.options.onError?.(error);}catch(_){}}}
    skip() {this.finish();}
    cancel() {if(this.closed)return;this.closed=true;this.ready=false;this.stopLoops();}
  }
  function placeholder(name='Lucky Dex') {
    const safe=String(name).replace(/[<>&"']/g,'').slice(0,35);
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="245" height="342" viewBox="0 0 245 342"><defs><linearGradient id="b" x2="1" y2="1"><stop stop-color="#224875"/><stop offset="1" stop-color="#080f23"/></linearGradient></defs><rect width="245" height="342" rx="15" fill="url(#b)"/><rect x="8" y="8" width="229" height="326" rx="12" fill="none" stroke="#cbb568" stroke-width="3"/><circle cx="122" cy="130" r="54" fill="#376294"/><path d="M84 140l37-59 41 59-41 34z" fill="#efd18b"/><text x="122" y="227" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="13">${safe}</text><text x="122" y="250" text-anchor="middle" fill="#9ab9dc" font-family="sans-serif" font-size="10">LOCAL CARD PREVIEW</text></svg>`);
  }
  function decodeImage(url, signal) {
    return new Promise(resolve=>{
      const image=new Image();let complete=false;
      const finish=ok=>{if(complete)return;complete=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);image.onload=image.onerror=null;resolve(ok);};
      const abort=()=>{image.src='';finish(false);};
      const timer=setTimeout(()=>finish(false),7000);
      image.onload=()=>finish(image.naturalWidth>0);image.onerror=()=>finish(false);
      if(signal?.aborted){abort();return;}signal?.addEventListener('abort',abort,{once:true});image.src=url;
    });
  }
  // Two canvases straddle the 3D card. Every segment chooses its depth plane.
  // The front plane clips the art rectangle, so ribbons stay at the perimeter.
  function createEffects(scene, cardBox, profile) {
    const canvases=[scene.querySelector('.pack-fx-rear'),scene.querySelector('.pack-fx-front')];
    const contexts=canvases.map(c=>c.getContext('2d'));
    // Bake glow once. Per-segment shadowBlur at mobile DPR costs a full blur
    // pass for every spark and trail segment on software-backed WebViews.
    const spark=document.createElement('canvas');spark.width=spark.height=32;
    const sparkContext=spark.getContext('2d'),sparkGlow=sparkContext.createRadialGradient(16,16,0,16,16,16);
    sparkGlow.addColorStop(0,'#fff8d1');sparkGlow.addColorStop(.12,'#ffe69bc9');sparkGlow.addColorStop(.45,'#ffc74338');sparkGlow.addColorStop(1,'#ffc74300');
    sparkContext.fillStyle=sparkGlow;sparkContext.fillRect(0,0,32,32);sparkContext.fillStyle='#fff6c6';sparkContext.fillRect(15,10,2,12);sparkContext.fillRect(10,15,12,2);
    let width=0,height=0,hw=0,hh=0;
    function resize() {
      width=scene.clientWidth;height=scene.clientHeight;
      const cardHeight=Math.min(height,window.innerHeight*.58,520,window.innerWidth*(window.innerHeight<=650?.56:.69)*342/245);
      cardBox.style.height=cardHeight+'px';cardBox.style.width=cardHeight*245/342+'px';
      hw=cardBox.clientWidth/2;hh=cardBox.clientHeight/2;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      canvases.forEach((c,i)=>{c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);contexts[i].setTransform(dpr,0,0,dpr,0,0);});
    }
    resize();
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(scene);
    function clear(){contexts.forEach(ctx=>ctx.clearRect(0,0,width,height));}
    function draw(ms) {
      clear();if(!profile.level)return;
      const fade=clamp((profile.duration-ms)/720), form=clamp((ms-80)/420);
      const revealPeak=profile.settleEnd+(profile.flipEnd-profile.settleEnd)*.55;
      const flipBoost=1+.72*Math.exp(-Math.pow((ms-revealPeak)/220,2));
      const phase=clamp((ms-70)/(profile.duration-160))*Math.PI*(4.2+profile.level*.52);
      contexts.forEach((ctx,i)=>{
        ctx.save();ctx.translate(width/2,height/2);
        if(i===1){ctx.beginPath();ctx.rect(-width/2,-height/2,width,height);ctx.rect(-hw*.97,-hh*.97,hw*1.94,hh*1.94);ctx.clip('evenodd');}
        ctx.globalCompositeOperation='lighter';
      });
      if(ms>profile.settleEnd-40) {
        const ctx=contexts[0], bloom=clamp((ms-(profile.settleEnd-40))/190)*fade;
        const g=ctx.createRadialGradient(0,0,hw*.6,0,0,hh*1.8);
        g.addColorStop(0,`rgba(255,224,125,${bloom*(.18+profile.aura*.34)})`);g.addColorStop(.32,`rgba(255,189,47,${bloom*profile.aura*.19})`);g.addColorStop(1,'rgba(255,205,80,0)');
        ctx.fillStyle=g;ctx.fillRect(-width/2,-height/2,width,height);
        if(profile.ribbons) {
          for(let i=0;i<18;i++){
            const angle=i*Math.PI/9+ms*.00018, radius=hh*1.85;
            ctx.beginPath();ctx.moveTo(Math.cos(angle)*hw*.8,Math.sin(angle)*hh*.8);
            ctx.lineTo(Math.cos(angle-.027)*radius,Math.sin(angle-.027)*radius);ctx.lineTo(Math.cos(angle+.027)*radius,Math.sin(angle+.027)*radius);
            ctx.fillStyle=`rgba(255,221,119,${fade*.13})`;ctx.fill();
          }
        }
      }
      if(profile.rayCount&&ms>profile.settleEnd-30){
        const ctx=contexts[0],power=clamp((ms-(profile.settleEnd-30))/180)*fade;
        ctx.save();ctx.translate(0,0);ctx.globalCompositeOperation='lighter';
        for(let i=0;i<profile.rayCount;i++){
          const a=i*Math.PI*2/profile.rayCount+ms*.00012*(1+profile.level*.08),pulse=.55+.45*Math.sin(ms*.006+i*1.77);
          const inner=Math.max(hw,hh)*(.82+(i%3)*.06),outer=Math.max(width,height)*(.55+(i%5)*.055);
          ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);
          ctx.strokeStyle=profile.rainbow?`hsla(${(i*19+ms*.045)%360},95%,76%,${power*.16*pulse})`:`rgba(255,218,116,${power*(.10+profile.level*.018)*pulse})`;
          ctx.lineWidth=1+(i%4)*.34;ctx.stroke();
        }
        ctx.restore();
      }
      for(let ring=0;ring<profile.ribbons;ring++) {
        const head=phase+ring*2.1;
        // Eight fading path batches per ribbon, depth-split on every segment.
        // Wide translucent strokes supply glow without repeated image blurs.
        for(let bucket=0;bucket<8;bucket++) {
          const paths=[new Path2D(),new Path2D()],counts=[0,0];
          for(let k=0;k<7;k++) {
            const j=bucket*7+k,angle=head-j*.04,a=ribbonPoint(angle,ring,hw,hh),b=ribbonPoint(angle-.041,ring,hw,hh),path=paths[a.depth>0?1:0];
            path.moveTo(a.x,a.y);path.lineTo(b.x,b.y);counts[a.depth>0?1:0]++;
          }
          const alpha=(1-bucket/8)*form*fade;
          contexts.forEach((ctx,plane)=>{
            if(!counts[plane])return;
            ctx.strokeStyle=profile.rainbow&&ring===2?`hsla(${(ms*.06+bucket*15)%360},90%,78%,${alpha*.18})`:`rgba(255,203,69,${alpha*.16})`;
            ctx.lineWidth=8*flipBoost;ctx.stroke(paths[plane]);
            ctx.strokeStyle=profile.rainbow&&ring===2?`hsla(${(ms*.06+bucket*15)%360},90%,80%,${alpha*.9})`:`rgba(255,229,148,${alpha*.94})`;
            ctx.lineWidth=(2.7-bucket*.18)*flipBoost;ctx.stroke(paths[plane]);
          });
        }
      }
      const sparkStart=profile.ribbons?Math.max(90,profile.approachEnd*.16):profile.settleEnd;
      if(ms>sparkStart)for(let i=0;i<profile.particles;i++) {
        const life=((ms-sparkStart+i*53)%760)/760, angle=phase+i*2.39996;
        let p=profile.ribbons?ribbonPoint(angle,i%profile.ribbons,hw,hh):{x:Math.cos(angle)*hw*1.15,y:Math.sin(angle)*hh*1.05,depth:Math.cos(angle)};
        const ctx=contexts[p.depth>0?1:0], alpha=Math.sin(life*Math.PI)*form*fade;
        const x=p.x+Math.cos(i*1.7)*life*27,y=p.y-life*35,size=(1+ i%3)*(.4+alpha*.6);
        ctx.globalAlpha=alpha;const extent=size*6;ctx.drawImage(spark,x-extent/2,y-extent/2,extent,extent);ctx.globalAlpha=1;
        if(profile.rainbow&&i%4===0){ctx.fillStyle=`hsla(${i*33+ms*.08},90%,78%,${alpha})`;ctx.fillRect(x-1,y-1,2,2);}
      }
      contexts.forEach(ctx=>ctx.restore());
    }
    return {draw,clear,destroy(){observer?.disconnect();clear();}};
  }
  function planTearGesture(start, end, rect) {
    const width=Math.max(1,Number(rect?.width)||1),height=Math.max(1,Number(rect?.height)||1);
    const left=Number(rect?.left)||0,top=Number(rect?.top)||0;
    const sx=clamp((Number(start?.x)-left)/width),ex=clamp((Number(end?.x)-left)/width);
    const rawSy=(Number(start?.y)-top)/height,rawEy=(Number(end?.y)-top)/height;
    const sy=clamp(Number.isFinite(rawSy)?rawSy:.12,.05,.32),ey=clamp(Number.isFinite(rawEy)?rawEy:.12,.05,.32);
    const dx=(ex-sx)*width,dy=(ey-sy)*height;
    const valid=Math.abs(dx)>=Math.max(72,width*.35)&&Math.abs(dx)>=Math.abs(dy)*1.15;
    const leftY=ex>=sx?sy:ey,rightY=ex>=sx?ey:sy;
    const points=[];const segments=10;
    for(let i=0;i<=segments;i++){
      const t=i/segments,x=mix(.04,.96,t),base=mix(leftY,rightY,t);
      const jag=i===0||i===segments?0:((i%2?1:-1)*(.007+(i%3)*.003));
      points.push([x,clamp(base+jag,.05,.32)]);
    }
    const pct=n=>`${(n*100).toFixed(2)}%`;
    const line=points.map(([x,y])=>`${pct(x)} ${pct(y)}`);
    const topClip=`polygon(0% 0%, 100% 0%, ${[...line].reverse().join(', ')})`;
    const bottomClip=`polygon(${line.join(', ')}, 100% 100%, 0% 100%)`;
    const svgPath=points.map(([x,y],i)=>`${i?'L':'M'} ${(x*100).toFixed(2)} ${(y*100).toFixed(2)}`).join(' ');
    return {valid,points,topClip,bottomClip,svgPath,startY:leftY,endY:rightY};
  }

  function mountFallbackReveal(container, options) {
    const {card,artwork,index,count,setName,onNext,onPrevious,onFullScreen,onExit,onSettle}=options;
    const profile=profileFor(card), escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    container.innerHTML=`<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="pack-reveal pack-reveal-fallback level-${profile.level} style-${profile.style}"><div class="pack-reveal-head"><b>${escape(setName)}</b><span>${index+1} / ${count}</span></div><div class="pack-theatre"><div class="pack-camera"><div class="pack-flight" style="transform:none"><div class="pack-shared-card" style="transform:rotateY(180deg)"><div class="pack-face pack-face-back"><div class="pack-back-emblem"></div><b>LUCKY DEX</b></div><div class="pack-face pack-face-front"><img style="visibility:visible" src="${escape(artwork)}" alt="${escape(card.name)}" draggable="false"></div></div></div></div></div><div class="pack-card-info"><div class="pack-hit-label">${escape(profile.label)}</div><b>${card._wasNew?'<span class="pack-new">NEW</span> ':''}${escape(card.name)}</b>${profile.secondaryLabel?`<span>${escape(profile.secondaryLabel)}</span>`:''}</div><div class="pack-swipe-hint">Static reveal · cinematic recovered</div><div class="pack-reveal-actions"><button class="secondary" id="zoomCurrentCard">FULL SCREEN</button><button class="secondary pack-skip" id="packSkipBtn" type="button"><b>${index===count-1?'SUMMARY':'NEXT'}</b><small>RECOVERED</small></button><button class="primary" id="nextPackCard">${index===count-1?'PACK SUMMARY':'NEXT CARD'}</button></div></div>`;
    container.dataset.packPhase='ready';
    const listeners=[];
    const listen=(element,type,handler,opts)=>{if(!element?.addEventListener)return;element.addEventListener(type,handler,opts);listeners.push(()=>element.removeEventListener(type,handler,opts));};
    listen(container.querySelector('#packExitBtn'),'click',onExit);
    listen(container.querySelector('#packSkipBtn'),'click',onNext);
    listen(container.querySelector('#nextPackCard'),'click',onNext);
    listen(container.querySelector('#zoomCurrentCard'),'click',onFullScreen);
    const session={ready:true,closed:false,skip(){this.ready=true;},cancel(){this.closed=true;this.ready=false;}};
    try{onSettle?.();}catch(error){try{options.onError?.(error);}catch(_){}}
    return {session,destroy(){session.cancel();listeners.splice(0).forEach(fn=>fn());}};
  }

  function mountReveal(container, options) {
    const {card,artwork,hiddenDittoCoverArtwork,index,count,setName,onNext,onPrevious,onFullScreen,onExit,onSettle,haptic}=options;
    const hiddenDitto=!!(card?._hiddenDitto&&card?._hiddenDittoCover),displayCard=hiddenDitto&&!card._hiddenDittoRevealed?card._hiddenDittoCover:card;
    const profile=profileFor(displayCard), escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const initialSecondary=profileFor(displayCard).secondaryLabel;
    const peelMarkup=hiddenDitto?`<div class="ditto-peel-layer${card._hiddenDittoRevealed?' is-revealed':''}" aria-label="Peelable card layer"><img src="${escape(hiddenDittoCoverArtwork||card._hiddenDittoCover?._packArtwork||card._hiddenDittoCover?.image||placeholder(card._hiddenDittoCover?.name))}" alt="${escape(card._hiddenDittoCover?.name||'Hidden card layer')}" draggable="false"><i class="ditto-peel-corner" aria-hidden="true"></i></div>`:'';
    container.innerHTML=`<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="pack-reveal level-${profile.level} style-${profile.style}"><div class="pack-reveal-head"><b>${escape(setName)}</b><span>${index+1} / ${count}</span></div><div class="pack-theatre" id="packTheatre"><canvas class="pack-fx-rear" aria-hidden="true"></canvas><div class="pack-camera"><div class="pack-flight" id="packFlight"><div class="pack-shared-card" id="packSharedCard"><div class="pack-face pack-face-back"><div class="pack-back-emblem"></div><b>LUCKY DEX</b></div><div class="pack-face pack-face-front" id="packCardFront"><div class="pack-unrevealed-cover"><div class="pack-back-emblem"></div><b>LUCKY DEX</b></div><img class="pack-main-art" style="visibility:hidden" src="${escape(artwork)}" alt="${escape(card.name)}" draggable="false">${peelMarkup}</div></div></div></div><canvas class="pack-fx-front" aria-hidden="true"></canvas><div class="pack-flash" aria-hidden="true"></div></div><div class="pack-card-info"><div class="pack-hit-label" id="packHitLabel">${escape(profile.label)}</div><b id="packCardName">${displayCard?._wasNew?'<span class="pack-new">NEW</span> ':''}${escape(displayCard?.name||card.name)}</b><span id="packCardSecondary"${initialSecondary?'':' hidden'}>${escape(initialSecondary||'')}</span></div><div class="pack-swipe-hint" id="packSwipeHint">Revealing…</div><div class="pack-reveal-actions"><button class="secondary" id="zoomCurrentCard" disabled>FULL SCREEN</button><button class="secondary pack-skip" id="packSkipBtn" type="button"><b>SKIP</b><small>HOLD FAST</small></button><button class="primary" id="nextPackCard" disabled>${index===count-1?'PACK SUMMARY':'NEXT CARD'}</button></div></div>`;
    const scene=container.querySelector('#packTheatre'),flight=container.querySelector('#packFlight'),shared=container.querySelector('#packSharedCard'),front=container.querySelector('#packCardFront');
    const image=front.querySelector('.pack-main-art'),cover=front.querySelector('.pack-unrevealed-cover'),peel=front.querySelector('.ditto-peel-layer');
    const next=container.querySelector('#nextPackCard'),zoom=container.querySelector('#zoomCurrentCard'),skip=container.querySelector('#packSkipBtn'),flash=container.querySelector('.pack-flash');
    const nameEl=container.querySelector('#packCardName'),secondaryEl=container.querySelector('#packCardSecondary'),hitLabel=container.querySelector('#packHitLabel'),hint=container.querySelector('#packSwipeHint');
    const effects=createEffects(scene,flight,profile);let hapticPlayed=false;
    const renderCardInfo=shown=>{
      if(!shown)return;const shownProfile=profileFor(shown);
      nameEl.innerHTML=`${shown._wasNew?'<span class="pack-new">NEW</span> ':''}${escape(shown.name)}`;
      const secondary=shownProfile.secondaryLabel||'';secondaryEl.textContent=secondary;secondaryEl.hidden=!secondary;
    };
    const revealHiddenDitto=()=>{
      if(!hiddenDitto||card._hiddenDittoRevealed)return false;
      globalThis.LuckyDexPokemonGoDitto?.reveal?.(card);peel?.classList.add('is-revealed');renderCardInfo(card);
      if(hitLabel){hitLabel.textContent='HIDDEN DITTO';hitLabel.style.opacity='1';}
      if(hint)hint.textContent=`Ditto revealed! Swipe left for next${index>0?' · right for previous':''}`;
      haptic?.([18,12,34,14,46]);return true;
    };
    const samples=[];for(let ms=0;ms<profile.flipEnd;ms+=22)samples.push(ms);samples.push(profile.flipEnd);
    const animation=flight.animate(samples.map(ms=>({transform:motionTransform(motionAt(ms,profile)),offset:ms/profile.flipEnd})),{duration:profile.flipEnd,fill:'both',easing:'linear'});animation.pause();
    const flip=shared.animate(samples.map(ms=>({transform:`rotateY(${motionAt(ms,profile).flip}deg)`,offset:ms/profile.flipEnd})),{duration:profile.flipEnd,fill:'both',easing:'linear'});flip.pause();
    const session=new RevealSession({
      duration:profile.duration,raf:f=>requestAnimationFrame(f),caf:id=>cancelAnimationFrame(id),onError:options.onError,
      frame:ms=>{
        if(ms>=profile.settleEnd&&image.style.visibility!=='visible'){image.style.visibility='visible';cover.hidden=true;}effects.draw(ms);
        const revealPeak=profile.settleEnd+(profile.flipEnd-profile.settleEnd)*.55;
        flash.style.opacity=String(profile.flash*Math.exp(-Math.pow((ms-revealPeak)/(54+profile.level*8),2)));
        if(ms>=revealPeak&&!hapticPlayed){hapticPlayed=true;haptic?.(profile.haptic);}
        const phase=ms<profile.approachEnd?'approach':ms<profile.settleEnd?'settling':ms<profile.flipEnd?'flip':'payoff';if(container.dataset.packPhase!==phase)container.dataset.packPhase=phase;
      },
      settle:()=>{
        flight.style.transform='translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';
        shared.style.transform='rotateY(180deg)';image.style.visibility='visible';cover.hidden=true;flash.style.opacity='0';effects.clear();
        next.disabled=zoom.disabled=false;container.dataset.packPhase='ready';
        skip.querySelector('b').textContent=index===count-1?'SUMMARY':'NEXT';skip.querySelector('small').textContent='HOLD FAST';
        hint.textContent=`Swipe left for next${index>0?' · right for previous':''}`;onSettle?.();
      }
    });
    session.ownAnimation(animation);session.ownAnimation(flip);
    const listeners=[];
    const listen=(element,type,handler,opts)=>{element.addEventListener(type,handler,opts);listeners.push(()=>element.removeEventListener(type,handler,opts));};
    listen(container.querySelector('#packExitBtn'),'click',onExit);
    let fastHoldTimer=null,fastHoldStarted=false,suppressFastClickUntil=0;
    const clearFastHold=()=>{if(fastHoldTimer!==null){clearTimeout(fastHoldTimer);fastHoldTimer=null;}if(fastHoldStarted){suppressFastClickUntil=performance.now()+450;options.onFastEnd?.();fastHoldStarted=false;}};
    listen(skip,'pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;fastHoldStarted=false;fastHoldTimer=setTimeout(()=>{fastHoldTimer=null;fastHoldStarted=true;options.onFastStart?.();},280);});
    listen(skip,'pointerup',clearFastHold);listen(skip,'pointercancel',clearFastHold);listen(skip,'pointerleave',e=>{if(e.buttons===0)clearFastHold();});
    listen(skip,'click',e=>{if(fastHoldStarted||performance.now()<suppressFastClickUntil){e.preventDefault();return;}session.ready?onNext():session.skip();});
    listen(next,'click',()=>{if(session.ready)onNext();});listen(zoom,'click',()=>{if(session.ready)onFullScreen();});
    let touch=null,suppressClickUntil=0;
    listen(scene,'touchstart',e=>{
      const t=e.changedTouches[0];if(!session.ready){touch=null;return;}
      let dittoPeel=false;if(hiddenDitto&&!card._hiddenDittoRevealed){const rect=front.getBoundingClientRect();dittoPeel=t.clientX>=rect.right-rect.width*.34&&t.clientY>=rect.bottom-rect.height*.34;}
      touch={x:t.clientX,y:t.clientY,dittoPeel};
    },{passive:true});
    listen(scene,'touchend',e=>{
      if(!touch||!session.ready)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y,dittoPeel=touch.dittoPeel;touch=null;
      if(dittoPeel&&(dx<-35||dy<-35)){suppressClickUntil=performance.now()+650;revealHiddenDitto();return;}
      if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){suppressClickUntil=performance.now()+500;dx<0?onNext():onPrevious();}
    },{passive:true});
    listen(front,'click',()=>{if(session.ready&&performance.now()>suppressClickUntil)onFullScreen();});
    animation.play();flip.play();session.start();
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)session.skip();
    return {session,revealHiddenDitto,destroy(){session.cancel();effects.destroy();listeners.splice(0).forEach(fn=>fn());}};
  }
  return {dateValue,orderSets,enrichSets,resolveArtwork,isPromoSet,physicalPackSizeFor,profileFor,motionAt,ribbonPoint,RevealSession,placeholder,decodeImage,planTearGesture,mountReveal,mountFallbackReveal};
});
