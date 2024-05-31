import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-extra'; 
import StealthPlugin from 'puppeteer-extra-plugin-stealth'; 
import UserAgent from 'user-agents';


puppeteer.use(StealthPlugin());

(async() => {
  const urls = await read('hrefs');
  
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 0,
    // devtools: true
  });
  
  const page = await browser.newPage()
  await page.setUserAgent((new UserAgent).toString());
  
  console.time()
  for (let url of urls) {
    console.log(url);

    await page.goto(
      url, {
        timeout : 0,
        waitUntil: 'domcontentloaded'
      });
    }

    
    
    console.log(urls, urls.length);
    
    console.timeEnd()

    // browser.close();
})
// ();


export async function read(fileName) {
  try {
    const data = await fs.readFile(`./${fileName}.txt`, { encoding: 'utf8' });
    const hrefs = data.split('\r\n').filter(Boolean);
    return hrefs;
  } catch (err) {
    console.log(err);
  }
}


