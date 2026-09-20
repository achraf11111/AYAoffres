const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to detail page...');
    await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseDetailConsultation&refConsultation=1041285&orgAcronyme=o8p', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Dump entire body
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('C:/Users/abdel/.gemini/antigravity/scratch/sample_winner_detail.html', html);
    console.log('Successfully saved detail HTML snippet.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
