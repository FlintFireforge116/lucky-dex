const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const assetRoot = path.join(root, 'app/src/main/assets');
const games = {berryPicker:'berryPickerStartBtn',tilePuzzle:'tilePuzzleStartBtn',voltorb:'voltorbNewBtn',ballDrop:'ballDropBtn',berry:'berryStartBtn',clefairy:'memoryStartBtn',fossil:'fossilToolPickaxe',unown:'unownStartBtn',quiz:'quizStartBtn'};
async function launch() {
  const executablePath=process.env.LUCKYDEX_BROWSER||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined);
  return chromium.launch({executablePath,headless:true});
}
async function appPage(browser, viewport, errors, options={}) {
  const context = await browser.newContext({viewport,hasTouch:true,isMobile:true});
  const page = await context.newPage();
  if(options.init)await page.addInitScript(options.init);
  page.on('pageerror', e=>errors.push({message:e.message,stack:e.stack}));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource')) errors.push({console:m.text()});});
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=='luckydex.test')return route.abort();
    const file=path.resolve(assetRoot,decodeURIComponent(url.pathname).slice(1)||'index.html');
    if(!file.startsWith(assetRoot+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'Missing local asset'});
    return route.fulfill({path:file});
  });
  await page.goto('http://luckydex.test/index.html',{waitUntil:'load'});
  page.setDefaultTimeout(4000);
  return {context,page};
}
async function baseline() {
  const browser=await launch();const errors=[];const out=path.join(root,'artifacts/baseline');fs.mkdirSync(out,{recursive:true});
  const {page,context}=await appPage(browser,{width:360,height:800},errors);
  const record=[];
  async function step(name,fn){try{await fn();record.push({name,ok:true});}catch(e){record.push({name,error:e.message,stack:e.stack});}}
  await step('title -> home',async()=>{await page.locator('#titleContinueBtn').click();const starter=page.locator('#starterChoices button').first();if(await starter.isVisible())await starter.click();});
  await page.screenshot({path:path.join(out,'home.png')});
  await step('home -> Trade',()=>page.locator('[data-nav="trade"]').click());
  await page.screenshot({path:path.join(out,'trade.png')});
  for(const route of ['collection','adventure','trade','adventure','arcade'])await step('navigate '+route,()=>page.locator('.bottom-nav [data-nav="'+route+'"]').click());
  await page.screenshot({path:path.join(out,'world.png')});
  for(const [id,bid] of Object.entries(games)){
    await step('open '+id,()=>page.evaluate(id=>window.LuckyDexArcadeWorld.openGame(id),id));
    await page.screenshot({path:path.join(out,id+'.png')});
    await step('start '+id,()=>page.locator('#'+bid).click({timeout:1800}));
    await step('exit '+id,()=>page.locator('#'+id+'Game [data-exit-game]').click({timeout:1800}));
    await step('force exit '+id,()=>page.evaluate(()=>window.LuckyDexArcadeWorld.backFromGame(true)));
  }
  fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify({errors,record},null,2));
  console.log(JSON.stringify({errors,failures:record.filter(x=>!x.ok)},null,2));
  await context.close();await browser.close();
}
module.exports={root,games,launch,appPage};
if(require.main===module)baseline().catch(e=>{console.error(e);process.exitCode=1;});
