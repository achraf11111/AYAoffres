const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating...');
    await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&AvisAttribution', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log('Clicking search...');
    await page.click('#ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche');
    
    console.log('Waiting for results...');
    await page.waitForTimeout(5000); // Wait for postback to complete
    
    // Check what the table looks like
    const html = await page.evaluate(() => {
      // Find the main results table
      const table = document.querySelector('.table.table-striped');
      if (table) return table.outerHTML;
      
      const actions = document.querySelectorAll('.actions');
      if (actions.length > 0) return actions[0].closest('table').outerHTML;
      
      // If nothing found, return the central part
      return document.querySelector('#main-part') ? document.querySelector('#main-part').innerHTML : document.body.innerHTML;
    });
    
    fs.writeFileSync('C:/Users/abdel/.gemini/antigravity/scratch/sample_results_real.html', html);
    console.log('Successfully saved results HTML snippet.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
