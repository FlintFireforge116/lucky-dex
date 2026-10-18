'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const B=require('../app/src/main/assets/adventure/adventure-battle.js');
const {launch,open,wildFight,settle}=require('../scripts/adventure3-browser-utils.cjs');
const mon={id:1,key:'1:n',name:'Bulbasaur',level:20,types:['grass','poison'],moves:[33,45,22,73],pp:{33:0,45:40,22:25,73:10},baseStats:{hp:45,attack:49,defense:49,speed:45}};

// Expanded move descriptions, lost aliases, or a hidden fallback must fail these contracts.
test('Fight gives four compact move slots and one secondary factual detail panel',()=>{
  const f=B.create([mon],{...mon,id:25,key:'enemy',name:'Pikachu'},{context:'regional'});
  const html=B.markup(f);
  assert.equal((html.match(/class="adv-move-name"/g)||[]).length,4);
  assert.equal((html.match(/class="adv-move-detail"/g)||[]).length,1);
  assert.doesNotMatch(html,/adv-battle-move-description/);
  assert.match(html,/data-adv-battle="quick" data-move-id="33"[^>]*disabled/);
  assert.match(html,/data-adv-battle="type" data-move-id="45"/);
  assert.match(html,/PP 0 \/ 35/);
  f.party[0].pp={33:0,45:0,22:0,73:0};
  assert.match(B.markup(f),/data-adv-battle="move" data-move-id="165"/,'Struggle remains executable beside the ordinary slots');
  assert.match(B.markup(f),/class="adv-move-detail" data-move-card="165"/,'when every ordinary move is exhausted, the detail describes usable Struggle');
});

// Real controller clicks protect the one-tap action, draw/back contracts and preview purity.
test('Wild Hunt command, Fight, Bag and switch menus fit phones and preview never spends a turn',async()=>{
  const browser=await launch();
  const out=path.resolve(__dirname,'../artifacts/v0401-battle-agent/screens');fs.mkdirSync(out,{recursive:true});
  try {
    for(const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:768,height:1024},{width:320,height:568}]){
      const {page,context,errors}=await open(browser,viewport);
      try {
        await page.locator('[data-nav="adventure"]').click();await wildFight(page);
        await page.evaluate(()=>{
          const f=state.adventureV2.activeRoam.battle,p=f.party.find(p=>p.key===f.leadKey);
          p.moves=[33,45,22,73];p.pp={33:0,45:40,22:25,73:10};
          f.enemy.maxHp=500;f.enemy.hp=500;LuckyDexAdventure.wild();
        });
        async function fit(label){
          const g=await page.evaluate(()=>{
            const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,bottom:r.bottom,right:r.right,width:r.width,height:r.height}};
            const root=document.querySelector('.adventure-battle'),pane=root.parentElement,scene=root.querySelector('.adv-battle-scene');
            const visible=[...root.querySelectorAll('[data-battle-actor],[data-battle-hud],[data-battle-drawer]:not([hidden]),[data-battle-drawer]:not([hidden]) button')].filter(n=>getComputedStyle(n).display!=='none');
            return {outer:document.documentElement.scrollHeight>innerHeight+1,horizontal:document.documentElement.scrollWidth>innerWidth+1,pane:pane.scrollHeight>pane.clientHeight+1,scene:rect(scene),items:visible.map(rect),drawer:[...root.querySelectorAll('[data-battle-drawer]:not([hidden])')].map(n=>({scroll:n.scrollHeight,client:n.clientHeight}))};
          });
          assert(!g.outer&&!g.horizontal,label+' document stays within '+viewport.width+'x'+viewport.height);
          if(viewport.width>=360)assert(!g.pane,label+' primary pane has no scroll');
          assert(g.scene.height>=140,label+' retains both battle actors');
          for(const r of g.items){assert(r.x>=-1&&r.right<=viewport.width+1&&r.y>=-1&&r.bottom<=viewport.height+1,label+' visible item remains in viewport');}
          for(const d of g.drawer)assert(d.scroll<=d.client+1,label+' drawer needs no scrolling '+JSON.stringify(d));
          console.log(label+' '+viewport.width+'x'+viewport.height+' '+JSON.stringify({scene:g.scene.height,pane:g.pane,outer:g.outer,drawer:g.drawer}));
        }
        await fit('command');
        await page.locator('[data-adv-command="battle-fight"]').click();
        assert.equal(await page.locator('[data-battle-drawer="fight"] .adv-move-name').count(),4);
        const buttons=await page.locator('[data-battle-moves] [data-move-id]').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {y:r.y,x:r.x,h:r.height}}));
        assert.equal(buttons[0].y,buttons[1].y);assert.equal(buttons[2].y,buttons[3].y);assert(buttons[2].y>buttons[0].y);assert(buttons.every(b=>b.h>=44));
        assert.equal(await page.locator('[data-battle-drawer="fight"] .adv-move-detail').count(),1);
        assert(!await page.locator('.adv-battle-command-panel').isVisible(),'Fight replaces the command menu in the lower console');
        await fit('fight');
        const before=await page.evaluate(()=>JSON.stringify(state.adventureV2.activeRoam.battle));
        const infoTarget=await page.locator('[data-battle-preview="45"]').boundingBox();
        assert(infoTarget.width>=44&&infoTarget.height>=44,'secondary information has a mobile tap target');
        await page.locator('[data-battle-preview="45"]').click();
        assert.equal(await page.locator('[data-battle-move-detail] [data-move-card]').getAttribute('data-move-card'),'45');
        assert.equal(await page.evaluate(()=>JSON.stringify(state.adventureV2.activeRoam.battle)),before,'information never mutates PP, RNG or battle state');
        if(viewport.width===360&&viewport.height===780)await page.screenshot({path:path.join(out,'wild-fight-360x780.png')});
        await page.locator('[data-battle-drawer="fight"] [data-adv-command="battle-close"]').click();
        assert(await page.locator('.adv-battle-command-panel').isVisible());
        for(const menu of ['bag','switch']){
          await page.locator('[data-adv-command="battle-'+menu+'"]').click();await fit(menu);
          if(viewport.width===360&&viewport.height===780)await page.screenshot({path:path.join(out,'wild-'+menu+'-360x780.png')});
          await page.locator('[data-battle-drawer="'+menu+'"] [data-adv-command="battle-close"]').click();
        }
        await page.locator('[data-adv-command="battle-fight"]').click();
        const pp=await page.evaluate(()=>state.adventureV2.activeRoam.battle.party.find(p=>p.key===state.adventureV2.activeRoam.battle.leadKey).pp[22]);
        await page.locator('[data-battle-moves] [data-move-id="22"]').click();await settle(page);
        const after=await page.evaluate(()=>{const f=state.adventureV2.activeRoam.battle;return {seq:f.actionSeq,pp:f.party.find(p=>p.key===f.leadKey).pp[22]}});
        assert.equal(after.seq,1,'one move tap resolves exactly one action');assert.equal(after.pp,pp-1);
        await page.evaluate(()=>{const f=state.adventureV2.activeRoam.battle;f.party.find(p=>p.key===f.leadKey).pp={33:0,45:0,22:0,73:0};LuckyDexAdventure.wild()});
        await page.locator('[data-adv-command="battle-fight"]').click();
        assert(await page.locator('[data-move-id="165"]').isEnabled());await fit('Struggle');
        assert((await page.locator('[data-move-id="165"]').boundingBox()).height>=44,'Struggle has a full mobile tap target');
        await page.locator('[data-battle-preview="165"]').click();await fit('Struggle info');
        await page.evaluate(()=>{const f=state.adventureV2.activeRoam.battle,p=f.party.find(p=>p.key===f.leadKey);p.moves=[570,619,717,831];p.pp={570:10,619:10,717:10,831:10};LuckyDexAdventure.wild()});
        await page.locator('[data-adv-command="battle-fight"]').click();
        await page.locator('[data-battle-preview="570"]').click();await fit('long names');
        assert.deepEqual(errors,[]);
      }finally{await context.close();}
    }
  }finally{await browser.close();}
});

test('Journey trainer battle keeps its actors, status and all menus inside the same lower console',async()=>{
  const browser=await launch();
  try{
    for(const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:768,height:1024},{width:320,height:568}]){
      const {page,context,errors}=await open(browser,viewport);
      try{
        await page.locator('[data-nav="adventure"]').click();
        await page.evaluate(()=>{
          const E=LuckyDexRegionalEngine,j=E.start(state,'johto',31);j.depth=3;j.sectionIndex=3;
          E.enter(state,'johto-c0-s3');const f=j.battle,p=f.party.find(p=>p.key===f.leadKey);
          p.moves=[33,45,22,73];p.pp={33:35,45:40,22:25,73:10};p.status='burn';
          f.enemy.status='poison';LuckyDexAdventure.regional();
        });
        const initial=await page.locator('.adv-battle-scene').boundingBox();
        assert.equal(await page.locator('[data-battle-hud="player"] [data-hud-status]').innerText(),'Burned');
        assert.equal(await page.locator('[data-battle-hud="enemy"] [data-hud-status]').innerText(),'Poisoned');
        for(const menu of ['fight','bag','switch']){
          await page.locator('[data-adv-command="battle-'+menu+'"]').click();
          const g=await page.evaluate(()=>{
            const b=document.querySelector('.adventure-battle'),p=b.parentElement,d=b.querySelector('[data-battle-drawer]:not([hidden])');
            return {outer:document.documentElement.scrollHeight>innerHeight+1,horizontal:document.documentElement.scrollWidth>innerWidth+1,pane:p.scrollHeight>p.clientHeight+1,drawer:d.scrollHeight>d.clientHeight+1,rect:d.getBoundingClientRect().toJSON(),scene:b.querySelector('.adv-battle-scene').getBoundingClientRect().toJSON()};
          });
          assert(!g.outer&&!g.horizontal&&!g.pane&&!g.drawer,'Journey '+menu+' fits '+viewport.width+'x'+viewport.height);
          assert.equal(g.scene.height,initial.height,'menu opening preserves the battle scene');
          assert(g.scene.height>=140);assert(g.rect.bottom<=viewport.height+1);
          if(menu==='bag')assert.equal(await page.locator('[data-adv-battle="ball"],[data-adv-battle="berry"],[data-adv-battle="flee"]').count(),0,'trainer restrictions stay in place');
          if(viewport.width===360&&viewport.height===780)await page.screenshot({path:path.resolve(__dirname,'../artifacts/v0401-battle-agent/screens/journey-'+menu+'-360x780.png')});
          await page.locator('[data-battle-drawer="'+menu+'"] [data-adv-command="battle-close"]').click();
          console.log('journey '+menu+' '+viewport.width+'x'+viewport.height+' '+JSON.stringify({scene:g.scene.height,pane:g.pane,outer:g.outer,drawer:g.drawer}));
        }
        assert.deepEqual(errors,[]);
      }finally{await context.close();}
    }
  }finally{await browser.close();}
});
