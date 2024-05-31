import fs from 'fs/promises';

import puppeteer from 'puppeteer-extra'; 
import StealthPlugin from 'puppeteer-extra-plugin-stealth'; 

const e = process.env.YANDEX_EMAIL;
const p = process.env.YANDEX_PASSWORD;

puppeteer.use(StealthPlugin());
(async() => {
  const mails = await read('emails');

  const browser = await puppeteer.launch({
    headless: false,
    timeout: 0,
    // devtools: true
  });

  const page = await browser.newPage()
  
  console.time()

  console.log(e, p)
  
  await page.goto(
    'https://mail.yandex.com/', {
      timeout : 0,
      waitUntil: 'domcontentloaded'
  });
  
  console.timeEnd()
  console.log(mails);
})();

export async function read(fileName) {
  try {
    const data = await fs.readFile(`./${fileName}.txt`, { encoding: 'utf8' });
    const hrefs = data.split('\r\n').filter(Boolean);
    return hrefs;
  } catch (err) {
    console.log(err);
  }
}