/* One character timeline; reflection is a spatial projection of the very same
   pose blend and rigid transform, never a second independent animation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClefairy=api;})(globalThis,function(){
  'use strict';
  const poses={idle:'clefairy_pose_idle.png',star:'clefairy_pose_star.png',song:'clefairy_pose_song.png',moon:'clefairy_pose_moon.png',spin:'clefairy_pose_spin.png'};
  function poseSourceFor(action){return poses[action]||poses.idle;}
  const SOURCE_DURATIONS={idle:220,star:1500,song:1750,moon:1650,spin:1450};
  const PLAYBACK_SPEED=1.55;
  const durations={idle:220,star:968,song:1129,moon:1065,spin:935};
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
  const mix=(a,b,t)=>a+(b-a)*t;
  const neutral=()=>({x:0,y:0,rotation:0,scale:1,light:0,weights:{idle:1,star:0,song:0,moon:0,spin:0}});
  function durationFor(action){return durations[action]||durations.idle;}
  function sourceDurationFor(action){return SOURCE_DURATIONS[action]||SOURCE_DURATIONS.idle;}
  function sourceTime(action,elapsed){const realDuration=durationFor(action),sourceDuration=sourceDurationFor(action),real=Math.max(0,elapsed);return action==='idle'?real:Math.min(sourceDuration,real*sourceDuration/realDuration);}
  function path(ms,keys){
    if(ms<=keys[0][0])return keys[0][1];
    for(let i=1;i<keys.length;i++)if(ms<=keys[i][0])return mix(keys[i-1][1],keys[i][1],ease((ms-keys[i-1][0])/(keys[i][0]-keys[i-1][0])));
    return keys.at(-1)[1];
  }
  function motionAt(action,ms,from=neutral()){
    const m=neutral(),realDuration=durationFor(action),duration=sourceDurationFor(action),realMs=Math.max(0,ms);ms=sourceTime(action,realMs);
    if(action==='idle'){m.y=-.65*(1-Math.cos(ms*Math.PI*2/2800));return m;}
    if(action==='star'){
      m.y=path(ms,[[0,0],[170,-3],[430,-13],[720,-5],[1130,-2],[1500,0]]);
      m.rotation=path(ms,[[0,0],[260,-3],[650,1.5],[1100,0]]);
      m.light=.38*Math.exp(-Math.pow((ms-880)/165,2));
    }else if(action==='song'){
      const envelope=Math.sin(clamp(ms/duration)*Math.PI);
      m.y=-7*Math.pow(Math.sin(ms*Math.PI/520),2)*envelope;
      m.x=2*Math.sin(ms*Math.PI*2/1050)*envelope;
      m.rotation=2*Math.sin(ms*Math.PI*2/900)*envelope;
    }else if(action==='moon'){
      m.y=path(ms,[[0,0],[300,-4],[580,-10],[1080,-10],[1450,-1],[1650,0]]);
      m.rotation=path(ms,[[0,0],[350,-2],[800,1],[1400,0]]);
      m.light=path(ms,[[0,0],[220,.12],[620,1],[940,.92],[1320,.35],[1650,0]]);
    }else if(action==='spin'){
      const finish=from.rotation+360,upright=Math.round(finish/360)*360;
      m.rotation=ms<=1150?mix(from.rotation,finish,smooth((ms-100)/1050)):mix(finish,upright,ease((ms-1150)/(duration-1150)));
      m.y=path(ms,[[0,0],[160,-3],[480,-11],[860,-9],[1210,-2],[1380,0]]);
      m.light=.17*Math.sin(clamp(ms/1380)*Math.PI);
    }
    const blend=ease(ms/100),returning=ease((ms-(duration-180))/180),target=action;
    for(const pose of Object.keys(m.weights)){
      const active=mix(from.weights[pose]||0,pose===target?1:0,blend);
      m.weights[pose]=mix(active,pose==='idle'?1:0,returning);
    }
    // Retarget from the actual visible state, including an interrupted twirl.
    const entry=ease(ms/120);
    m.x=mix(from.x,m.x,entry);m.y=mix(from.y,m.y,entry);
    if(action!=='spin')m.rotation=mix(from.rotation,Math.round(from.rotation/360)*360+m.rotation,entry);
    m.light=mix(from.light,m.light,entry);
    if(realMs>=realDuration){m.x=m.y=m.light=0;m.rotation=action==='spin'?Math.round((from.rotation+360)/360)*360:Math.round(from.rotation/360)*360;m.weights={idle:1,star:0,song:0,moon:0};}
    return m;
  }
  function effectsAt(action,ms){
    ms=sourceTime(action,ms);
    const e={star:null,notes:[],ribbon:0};
    if(action==='star'&&ms>220&&ms<980){const p=clamp((ms-220)/760);e.star={x:.9-.79*p,y:.105+.215*p,opacity:Math.sin(p*Math.PI),progress:p};}
    if(action==='song')for(let i=0;i<6;i++){
      const t=(ms-(220+i*190))/790;if(t>0&&t<1)e.notes.push({index:i,progress:t,opacity:Math.sin(t*Math.PI)});
    }
    if(action==='spin'&&ms>80&&ms<1360)e.ribbon=Math.sin(clamp((ms-80)/1280)*Math.PI);
    return e;
  }
  function transform(m){return `translate(${m.x.toFixed(3)}px,${m.y.toFixed(3)}px) rotate(${m.rotation.toFixed(3)}deg)`;}
  const emergencyIdle='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M22 35 15 8 42 25M79 24 109 12 99 41" fill="#edb5c3" stroke="#69495d" stroke-width="3"/><ellipse cx="60" cy="68" rx="43" ry="40" fill="#edb5c3" stroke="#69495d" stroke-width="3"/><path d="M38 62q5-7 10 0m23 0q5-7 10 0M51 78q9 9 18 0M55 29q18-7 15 7-5 9-13 2" fill="none" stroke="#69495d" stroke-width="3" stroke-linecap="round"/></svg>');
  function loadImage(src){return new Promise(resolve=>{
    const image=new Image();let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(ok);};
    const timer=setTimeout(()=>finish(false),1800);image.onload=async()=>{try{await image.decode();finish(image.naturalWidth>0);}catch(_){finish(false);}};image.onerror=()=>finish(false);image.src=src;
  });}
  function createEffects(stage){
    const canvases=[stage.querySelector('.clefairy-fx-rear'),stage.querySelector('.clefairy-fx-front')],contexts=canvases.map(c=>c.getContext('2d'));
    let width=0,height=0,size=0;
    const glow=document.createElement('canvas');glow.width=glow.height=48;const g=glow.getContext('2d'),gradient=g.createRadialGradient(24,24,0,24,24,24);
    gradient.addColorStop(0,'#fff7d2');gradient.addColorStop(.12,'#ffdf81');gradient.addColorStop(.35,'#ffe59b77');gradient.addColorStop(1,'#ffdb7000');g.fillStyle=gradient;g.fillRect(0,0,48,48);
    function resize(){
      width=stage.clientWidth;height=stage.clientHeight;size=stage.querySelector('.clefairy-character').clientWidth;
      const ratio=Math.min(window.devicePixelRatio||1,1.5);
      canvases.forEach((c,i)=>{c.width=Math.round(width*ratio);c.height=Math.round(height*ratio);contexts[i].setTransform(ratio,0,0,ratio,0,0);});
    }
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();
    function clear(){contexts.forEach(ctx=>ctx.clearRect(0,0,width,height));}
    function draw(action,ms,m,reduced=false){
      clear();if(!width||!height)return;
      const timelineMs=reduced?ms:sourceTime(action,ms),rear=contexts[0],front=contexts[1],fx=effectsAt(reduced?'idle':action,ms),water=.73*height,cx=width*.5+m.x,cy=water-size*.5+m.y;
      if(m.light>.003){
        const moon=rear.createRadialGradient(width*.8,height*.055,2,width*.8,height*.055,width*.52);
        moon.addColorStop(0,`rgba(255,248,207,${m.light*.77})`);moon.addColorStop(.23,`rgba(255,245,204,${m.light*.2})`);moon.addColorStop(1,'rgba(255,245,204,0)');
        rear.fillStyle=moon;rear.fillRect(0,0,width,height);
        rear.fillStyle=`rgba(255,244,205,${m.light*.075})`;rear.fillRect(0,0,width,height);
        const waterGlow=rear.createRadialGradient(width*.6,water+height*.1,0,width*.6,water+height*.1,width*.45);
        waterGlow.addColorStop(0,`rgba(221,238,255,${m.light*.31})`);waterGlow.addColorStop(1,'rgba(221,238,255,0)');rear.fillStyle=waterGlow;rear.fillRect(0,water,width,height-water);
        rear.strokeStyle=`rgba(232,245,255,${m.light*.27})`;rear.lineWidth=1;
        for(let i=0;i<6;i++){rear.beginPath();rear.ellipse(cx,water+8+i*9,size*(.22+i*.085),2+i*.2,0,0,Math.PI*2);rear.stroke();}
      }
      if(fx.star){
        const {x,y,opacity,progress}=fx.star;rear.save();rear.beginPath();rear.rect(0,0,width,height*.42);rear.clip();
        for(let i=20;i>0;i--){const p=Math.max(0,progress-i*.013);rear.beginPath();rear.moveTo((.9-.79*p)*width,(.105+.215*p)*height);rear.lineTo((.9-.79*(p+.014))*width,(.105+.215*(p+.014))*height);rear.strokeStyle=`rgba(155,226,255,${opacity*(1-i/21)})`;rear.lineWidth=2.4*(1-i/24);rear.stroke();}
        rear.globalAlpha=opacity;rear.drawImage(glow,x*width-13,y*height-13,26,26);rear.fillStyle='#effaff';rear.beginPath();rear.moveTo(x*width,y*height-6);rear.lineTo(x*width+2,y*height-1);rear.lineTo(x*width+6,y*height);rear.lineTo(x*width+1,y*height+2);rear.lineTo(x*width,y*height+6);rear.lineTo(x*width-2,y*height+1);rear.lineTo(x*width-6,y*height);rear.lineTo(x*width-1,y*height-2);rear.closePath();rear.fill();rear.restore();
      }
      for(const note of fx.notes){
        const {index,progress,opacity}=note,x=cx+(index%2?1:-1)*size*(.32+index*.035)+Math.sin(progress*4+index)*9,y=water-size*(.65+progress*.55);
        front.save();front.globalAlpha=opacity;front.font=`${22+index%3*3}px sans-serif`;front.fillStyle=index%2?'#a4edff':'#ffb6f0';front.shadowColor=front.fillStyle;front.shadowBlur=7;front.fillText(index%2?'♫':'♪',x,y);front.restore();
      }
      if(fx.ribbon){
        const phase=(timelineMs-80)/1280*Math.PI*3.5;
        const point=(angle,ring)=>({x:cx+Math.cos(angle)*size*(.72+ring*.07),y:cy+size*.12+Math.sin(angle)*size*.25+ring*size*.07,z:Math.sin(angle)});
        for(let ring=0;ring<2;ring++)for(let bucket=0;bucket<6;bucket++){
          const paths=[new Path2D(),new Path2D()],counts=[0,0];
          for(let j=0;j<7;j++){const a=point(phase+ring*2.1-(bucket*7+j)*.055,ring),b=point(phase+ring*2.1-(bucket*7+j+1)*.055,ring),i=a.z>0?1:0;paths[i].moveTo(a.x,a.y);paths[i].lineTo(b.x,b.y);counts[i]++;}
          contexts.forEach((ctx,i)=>{if(!counts[i])return;const alpha=(1-bucket/6)*fx.ribbon;ctx.strokeStyle=`rgba(255,207,99,${alpha*.19})`;ctx.lineWidth=7;ctx.stroke(paths[i]);ctx.strokeStyle=`rgba(255,239,175,${alpha*.94})`;ctx.lineWidth=2.5-bucket*.25;ctx.stroke(paths[i]);});
        }
        for(let i=0;i<22;i++){const life=((timelineMs+i*47)%560)/560,p=point(phase-i*.51,i%2),ctx=contexts[p.z>0?1:0],alpha=fx.ribbon*Math.sin(life*Math.PI);ctx.globalAlpha=alpha;ctx.drawImage(glow,p.x-5+Math.cos(i)*life*12,p.y-5-life*19,10,10);ctx.globalAlpha=1;}
      }
    }
    return {draw,clear,resize,destroy(){observer.disconnect();clear();}};
  }
  function mount(stage){
    const actor=stage.querySelector('.clefairy-character .clefairy-motion'),reflection=stage.querySelector('.clefairy-reflection .clefairy-motion'),roots=[actor,reflection];
    const available={idle:true,star:true,song:true,moon:true},effects=createEffects(stage);
    const bg=stage.querySelector('#clefairyBackground');bg.onerror=()=>{bg.hidden=true;};
    let current=neutral(),active=false,raf=0,token=0,pending=null,frame=0,idleStart=0,highlightAnimation=null;
    function highlight(action){
      highlightAnimation?.cancel();highlightAnimation=null;
      const index=['star','song','moon','spin'].indexOf(action);
      document.querySelectorAll('[data-memory]').forEach(b=>{const selected=+b.dataset.memory===index;b.classList.toggle('flash',selected);b.classList.remove('pressed');b.setAttribute('aria-pressed',String(selected));if(selected)highlightAnimation=b.animate([{filter:'brightness(1)'},{filter:'brightness(1.12)'},{filter:'brightness(1)'}],{duration:620,iterations:Infinity});});
      document.querySelectorAll('#memorySequenceTrack i').forEach(i=>i.classList.toggle('current',i.dataset.action===action&&i===i.parentElement.lastElementChild));
    }
    function render(m){
      const weights={idle:0,star:0,song:0,moon:0,spin:0};for(const [pose,weight] of Object.entries(m.weights))weights[available[pose]?pose:'idle']+=weight;
      current={...m,weights};const t=transform(m);
      for(const root of roots){root.style.transform=t;for(const p of root.querySelectorAll('[data-pose]'))p.style.opacity=String(weights[p.dataset.pose]);}
      const brightness=1+m.light*.15;actor.style.filter=`brightness(${brightness.toFixed(3)})`;reflection.style.filter=`brightness(${brightness.toFixed(3)})`;
      stage.querySelector('.clefairy-reflection').style.opacity=String(.24+m.light*.15);
      stage.dataset.rotation=String(m.rotation);stage.dataset.light=String(m.light);stage.dataset.frame=String(++frame);
    }
    const ready=Promise.all(Object.entries(poses).map(async([pose,src])=>{available[pose]=await loadImage(src);})).then(async()=>{
      if(!available.idle){await loadImage(emergencyIdle);available.idle=true;roots.forEach(root=>{root.querySelector('[data-pose="idle"] img').src=emergencyIdle;});}
      roots.forEach(root=>{for(const p of root.querySelectorAll('[data-pose]'))if(!available[p.dataset.pose])p.hidden=true;});render(current);return true;
    });
    function interrupt(){token++;cancelAnimationFrame(raf);raf=0;if(pending){pending(false);pending=null;}highlight('idle');}
    function idleLoop(time){if(!active)return;render(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?neutral():motionAt('idle',time-idleStart));raf=requestAnimationFrame(idleLoop);}
    function resume(){if(active)return;active=true;idleStart=performance.now();stage.dataset.state=stage.dataset.action='idle';render(neutral());raf=requestAnimationFrame(idleLoop);}
    async function play(action='idle'){
      if(!(action in durations))return false;
      const from=current;interrupt();active=true;const run=token;highlight(action);stage.dataset.action=action;stage.dataset.state='transition';
      await ready;if(run!==token||!active)return false;
      const duration=durationFor(action),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      let elapsed=0,lastTime=null;
      return new Promise(resolve=>{
        pending=resolve;
        function tick(time){
          if(run!==token||!active)return;
          // Start at the first presented frame, not before a cold image/layer
          // rasterization. A rendering hitch must not skip the whole scene cue.
          if(lastTime!==null)elapsed+=Math.min(40,Math.max(0,time-lastTime));lastTime=time;
          const ms=Math.min(duration,elapsed);
          let m;
          if(action==='idle'){
            const t=ease(ms/duration);m=neutral();m.x=mix(from.x,0,t);m.y=mix(from.y,0,t);m.rotation=mix(from.rotation,Math.round(from.rotation/360)*360,t);m.light=mix(from.light,0,t);
            for(const p of Object.keys(m.weights))m.weights[p]=mix(from.weights[p]||0,p==='idle'?1:0,t);
          }else m=motionAt(action,ms,from);
          if(reduced){m.x=m.y=m.rotation=0;}
          render(m);effects.draw(action,ms,m,reduced);stage.dataset.state=ms<100||ms>duration-180?'transition':action;
          if(ms>=duration){
            pending=null;highlight('idle');effects.clear();stage.dataset.state=stage.dataset.action='idle';idleStart=time;resolve(true);raf=requestAnimationFrame(idleLoop);
          }else raf=requestAnimationFrame(tick);
        }
        render(from);raf=requestAnimationFrame(tick);
      });
    }
    function reset(){interrupt();effects.clear();stage.dataset.action=stage.dataset.state='idle';render(neutral());if(active){idleStart=performance.now();raf=requestAnimationFrame(idleLoop);}}
    function suspend(){interrupt();active=false;effects.clear();stage.dataset.action=stage.dataset.state='idle';render(neutral());}
    render(neutral());
    return {ready,play,resume,reset,suspend,destroy(){suspend();effects.destroy();}};
  }
  return {durationFor,motionAt,effectsAt,poseSourceFor,mount};
});
