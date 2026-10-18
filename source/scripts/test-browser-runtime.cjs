// Use the available desktop Chrome when a browser test omits an executable.
// This changes only browser selection; assertions, routes and app code are real.
const fs=require('fs'),path=process.env.LUCKYDEX_BROWSER||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':null);
if(path&&fs.existsSync(path)){const {chromium}=require('playwright'),launch=chromium.launch.bind(chromium);chromium.launch=(options={})=>launch({...options,executablePath:options.executablePath||path});}
