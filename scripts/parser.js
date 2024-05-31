import fs from 'fs/promises';

import puppeteer from 'puppeteer-extra'; 
import StealthPlugin from 'puppeteer-extra-plugin-stealth'; 

puppeteer.use(StealthPlugin());

// GET DATA FROM VS OF OTHER SERVICE
(async() => {
  const browser = await puppeteer.launch({
    headless: false,
    // defaultViewport: null,
    // devtools: true
  });
  
  const page = await browser.newPage();
  
  console.time();
  await page.goto(
    'https://career.habr.com/companies/ratings', {
        timeout : 0,
        waitUntil: 'domcontentloaded'
  });
  
  const urls = [];

  const len = await page.$$eval('.tabs__tab', (data) => data.length);
  
  for (let i = 1; i < len; i++) {
  // for (let i = 1; i < 2; i++) {
    await sleep(2000);

    await page.click(`.tabs__tab:nth-child(${i}) button`); 
    
    await sleep(3000);
    
    let btns = await page.$$('.with-pagination__pages .button-comp');
    
    if (btns.length > 0) {
      let next = true;
      
        while(next) {
          await sleep(3000);
          next = await page.$('.with-pagination__side-button a[rel=next]');

          const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.section-group .transition-expand .rating-card__main .rating-card__company .rating-card__company-main .rating-card__company-meta > span > span:nth-child(2) > a')).map(el => el.href);
          });

          if (next) {
            page.click('.with-pagination__side-button a[rel=next]');
          }
          
          urls.push(...links);
        };
      } else {

        
        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.rating-card__company .rating-card__company-aside a')).map(el => el.href);
        });

        urls.push(...links);
      }
    
  }
  
  const emails = [];
  
  for (let url of urls) {
    const page2 = await browser.newPage();
    
    await page2.goto(url, { 
      timeout : 0,
      waitUntil: 'domcontentloaded'
    });
    await sleep(1000);

    const emailAddress = await getEmailAddress(page2)
    
    if (emailAddress) {
      emails.push(emailAddress);
      await sleep(300);
    }
    
    await page2.close();
  }

  console.log(emails);
  
  // // CREATE FILE AND APPEND HREF CYCLE
  for (let text of urls) {
    await fs.appendFile('./hrefs.txt', text + '\r\n');
  }

  // // CREATE FILE AND APPEND EMAIL CYCLE
  for (let text of emails) {
    await fs.appendFile('./emails.txt', text + '\r\n');
  }
    
    console.timeEnd();
    await browser.close();
})
// ();

const sleep = (delay) => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

async function getEmailAddress (page2) {  
    return await page2.evaluate(() => {
    const c = document.querySelectorAll('.contacts .contact');
    
    for (let i = 0; i < c.length; i++) {
      const t = c[i].querySelector('.contacts .contact .type');
      const text = t.textContent.trim().toLowerCase();
      
      if (text === 'email:') {
        const v = c[i].querySelector('.contacts .contact .value');
        const email = v.textContent.trim();
        
        const regex = new RegExp('clck', 'gi');
        const found = regex.test(email);
        
        return (email && !found ) ? email: null;
      }
    }
  });
}