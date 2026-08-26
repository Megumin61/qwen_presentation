const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  await page.goto(pathToFileURL(path.resolve(__dirname,'index.html')).href,{waitUntil:'networkidle'});
  await page.screenshot({path:path.resolve(__dirname,'preview-full.png'),fullPage:true});
  for(let n=1;n<=16;n++){
    const slide=page.locator(`#s${n}`);await slide.screenshot({path:path.resolve(__dirname,`preview-${String(n).padStart(2,'0')}.png`)});
  }
  const data=await page.evaluate(()=>[...document.querySelectorAll('.slide')].map((s,i)=>({page:i+1,scroll:s.scrollHeight,client:s.clientHeight,width:s.clientWidth,ratio:s.clientWidth/s.clientHeight})));
  console.log(JSON.stringify(data));
  await browser.close();
})();
