const puppeteer = require('puppeteer-core');
const fs = require('fs');

const executablePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = executablePaths.find(p => fs.existsSync(p));

(async () => {
  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('file:///D:/projects/mrshed/landing_pages/murshid/contact.html', { waitUntil: 'networkidle0' });
  
  console.log('Clicking country trigger...');
  await page.click('#countryTrigger');
  await new Promise(r => setTimeout(r, 500));
  
  console.log('Typing in form...');
  await page.type('#clientName', 'Test Name');
  await page.type('#clientEmail', 'test@example.com');
  await page.select('#messageSubject', 'support');
  await page.type('#clientMessage', 'This is a test message 123456');
  await page.type('#clientPhone', '500123456');
  
  console.log('Submitting form...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1000));
  
  await browser.close();
})();
