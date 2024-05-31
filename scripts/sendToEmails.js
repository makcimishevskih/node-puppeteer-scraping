import 'dotenv/config';
import fs from 'fs/promises';

import UserAgent from 'user-agents';
import puppeteer from 'puppeteer-extra'; 
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { sleep, getNumberFromRange, read } from './helpers.js';

const el = process.env.EMAIL;
const pw = process.env.PASSWORD;

puppeteer.use(StealthPlugin());

(async() => {
  // const mails = await read('emails');

  const browser = await puppeteer.launch({
    headless: false,
    timeout: 0,
    // devtools: true
  });

  const page = await browser.newPage()
  
  // await page.setUserAgent((new UserAgent).toString());

  console.time()

  await page.goto(
    'https://mail.yandex.com/', {
      timeout : 0,
      waitUntil: 'domcontentloaded'
  });

  const url1 = page.url();
  const captchaSelector = 'input[type=submit]';

  if (url1 !== 'https://360.yandex.com/mail/') {
    // CAPTCHA
    // allows you to avoid captcha by timeout function and hover effect
    // can't be less than 3000ms
    await sleep(3000);
    page.hover(captchaSelector)
    await sleep(2000);
    page.click(captchaSelector);
  }
  
  await sleep(2000);
  const loginBtnSelector = 'a#header-login-button'
  await page.waitForSelector(loginBtnSelector);
  await sleep(500);

  const url2 = page.url();
  
  // if url !== yandex mail - close browser
  // if === yandex mail - continue to login
  if (url2 !== 'https://360.yandex.com/mail/') {
    browser.close();
  } else {
    console.log(url2);
    page.click(loginBtnSelector);
  }
    
  await sleep(2000);
  const popup = await page.$('#root');
  
  if (popup) {
    popup.click();
  }
  
  

  async function enter(iterable, inputSelector, buttonToLoginSelector) {
    await sleep(1000);
    
    await page.click(inputSelector); 
    
    for (let char of iterable) {
      await sleep(getNumberFromRange(20, 500));
      await page.type(inputSelector, char); 
    }
    
    const loginAfterEmailSelector = buttonToLoginSelector;
    await page.click(loginAfterEmailSelector);    
  } 

  // EMAIL LOGIN
  await enter(el, '[data-t="field:input-login"]', '[data-t="button:action:passp:sign-in"]');

  // PASS LOGIN
  await enter(pw, '[data-t="field:input-passwd"]', '[data-t="button:action:passp:sign-in"]');
  
  // need to set your push notification password from your phone handly(!!!) before the timeout end - you have 10s
  await sleep(10000);

  // if fatal error page need to navigate in to the light version of yandex mail
  await sleep(1000);
  const fatalError = page.$('.FatalContent-m__error--TdK8P');
  
  if (fatalError) {
    page.click('.FatalContent-m__error--TdK8P > p > a');;    
  }

  
  // await page.click('[data-t="button:action"]');
  console.timeEnd();
})();

