const { chromium } = require('playwright');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Starting advanced scraper to get multiple pages of tenders...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  const allTenders = [];
  const maxPages = 5; // Let's scrape up to 5 pages for now to avoid hanging
  
  try {
    await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&AllCons&searchAnnCons', { waitUntil: 'networkidle', timeout: 60000 });
    
    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
        console.log(`Scraping page ${currentPage}...`);
        await page.waitForTimeout(4000); 
        
        const html = await page.content();
        const $ = cheerio.load(html);
        
        let foundOnPage = 0;
        
        $('.actions').parent().each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if(text && text.includes('Objet :')) {
                 allTenders.push({ id: `AO-${Date.now()}-${currentPage}-${i}`, rawText: text });
                 foundOnPage++;
            }
        });

        console.log(`Found ${foundOnPage} tenders on page ${currentPage}. Total so far: ${allTenders.length}`);

        // Try to click the next page button
        // The next button usually has class .next or aria-label="Next" or text ">"
        const nextButton = await page.$('a.next, a[title="Page suivante"], a:has-text("Suivant")');
        if (nextButton && currentPage < maxPages) {
            console.log("Navigating to next page...");
            await nextButton.click();
            // Wait for loader to disappear or table to update
            await page.waitForTimeout(3000);
        } else {
            console.log("No next button found or reached max pages. Stopping pagination.");
            break;
        }
    }

    if (allTenders.length > 0) {
       fs.writeFileSync(path.join(__dirname, '../data/real_tenders_temp.json'), JSON.stringify(allTenders, null, 2));
       console.log(`Finished scraping! Saved ${allTenders.length} raw tenders.`);
    } else {
       console.log("No tenders found. Check the website structure.");
    }

  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }
})();
