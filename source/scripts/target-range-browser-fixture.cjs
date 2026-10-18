const path=require('node:path'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
async function launch(){return chromium.launch({headless:true,executablePath:process.env.LUCKYDEX_BROWSER||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined)});}
async function open(browser,viewport={width:360,height:780},type='ground'){
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:true,offline:true});
  const page=await context.newPage();page.setDefaultTimeout(5000);
  await page.goto(pathToFileURL(path.resolve(__dirname,'../app/src/main/assets/index.html')).href);
  await page.evaluate(type=>{document.getElementById('titleScreen')?.remove();document.querySelector('[data-nav="arcade"]').click();LuckyDexArcadeWorld.openGame('targetRange');LuckyDexTargetRange.startExhibition({difficulty:'easy',participant:{id:207,key:'207:n',name:'Gligar',baseStat:35,types:[type,'flying']},attackType:type});},type);
  await page.locator('#targetRangePlay').waitFor({state:'visible'});return {context,page};
}
module.exports={launch,open};
