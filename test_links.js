const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Dump all links to see how to navigate to "Résultats"
    const html = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(l => l.innerText.trim() + ' : ' + l.href).join('\n');
    });
    
    fs.writeFileSync('C:/Users/abdel/.gemini/antigravity/scratch/links.txt', html);
    console.log('Saved links to links.txt');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
