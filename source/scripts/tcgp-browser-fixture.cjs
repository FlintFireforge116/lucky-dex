const fs=require('node:fs'),path=require('node:path');const {launch,appPage}=require('./recovery-browser.cjs');
async function createPage(browser,viewport={width:393,height:873}){
 const errors=[],result=await appPage(browser,viewport,errors,{init:()=>{
  localStorage.setItem('luckyDexSave',JSON.stringify({saveVersion:7,profile:{coins:1000,xp:0},tcgpBattle:{helpSeen:true},pokemon:{'25:n':{id:25,name:'Pikachu',level:5,count:1}},team:['25:n']}));
  // Fixture instrumentation wraps the real Solo factory before the UI captures
  // its dependency. All legality/action transitions use unchanged production core.
  let api;Object.defineProperty(window,'LuckyDexTCGPBattleSolo',{configurable:true,get:()=>api,set:value=>{api=value;const create=value.createBattle;value.createBattle=options=>{
    const r=create({...options,seed:123,firstSide:'player'});window.__tcgpBattle=r;
    if(window.__tcgpMode==='battle'){
      const C=window.LuckyDexTCGPBattleCore,p=r.sides.player,o=r.sides.opponent;r.phase='battle';r.setupSide=null;r.activeSide='player';r.turnNumber=5;p.turnCount=3;
      p.active=C.makePokemonSlot('A1-001',0,'fixture-active');p.active.energy={Grass:2};p.bench=['A1-001','A1-014','A1-021'].slice(0,window.__tcgpBenchCount??3).map((id,i)=>C.makePokemonSlot(id,0,'fixture-bench-'+i));p.energyAvailable=true;p.energyUsed=false;p.retreated=false;
      const ids=['A1-014','A1-002','BASIC-POKE-BALL','A1-189','A1-021'];p.hand=Array.from({length:window.__tcgpHandCount??5},(_,i)=>({uid:'fixture-hand-'+i,cardId:ids[i%ids.length]}));
      o.active=C.makePokemonSlot('A1-187',0,'fixture-opponent');o.bench=['A1-014','A1-021','A1-189'].map((id,i)=>C.makePokemonSlot(id,0,'fixture-cpu-'+i));
    }
    return r;
  };}});
 }});
 const {page}=result;
 const art=process.env.LUCKYDEX_TCGP_QA_ART;
 if(art)await page.route('https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/**',route=>{const file=path.join(art,new URL(route.request().url()).pathname.split('/').pop());return fs.existsSync(file)?route.fulfill({path:file}):route.abort();});
 await page.click('#titleContinueBtn');await page.evaluate(()=>{navigate('packs');LuckyDexTCGPBattleUI.open();LuckyDexTCGPBattleUI.hideHelp?.();document.getElementById('tcgpBattleHelp').hidden=true;});
 return {...result,errors};
}
async function start(page,{mode='setup',handCount=5,benchCount=3}={}){await page.evaluate(({mode,handCount,benchCount})=>{window.__tcgpMode=mode;window.__tcgpHandCount=handCount;window.__tcgpBenchCount=benchCount;LuckyDexTCGPBattleUI.renderHome();},{mode,handCount,benchCount});await page.click('[data-tcgp-action="practice"]');}
async function grabPoint(page,selector){const target=page.locator(selector);await target.scrollIntoViewIfNeeded();return target.evaluate(n=>{const r=n.getBoundingClientRect();for(let y=r.top+8;y<r.bottom-5;y+=8)for(let x=r.left+5;x<r.right-4;x+=6){const hit=document.elementFromPoint(x,y);if(hit&&(n===hit||n.contains(hit)))return{x,y};}throw Error('Card has no reachable hit area');});}
async function drag(page,from,to){const a=await grabPoint(page,from),b=await page.locator(to).boundingBox();if(!b)throw Error('Missing drag destination '+to);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:14});await page.mouse.up();}
module.exports={launch,createPage,start,drag,grabPoint};
