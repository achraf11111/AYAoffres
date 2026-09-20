const { chromium } = require('playwright');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umaiswdohfghdeucaqaj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYWlzd2RvaGZnaGRldWNhcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjI1NDksImV4cCI6MjEwNTI5ODU0OX0._oVjpKUmamVCVTXQ1DNbuQcP3OfJj-GtyKq2c507ZQo';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log("🚀 Starting Advanced Historical Scraper...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  });
  const page = await context.newPage();
  
  const extractedTenders = [];

  try {
    // 1. Go to the main search page
    await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&AllCons&searchAnnCons', { waitUntil: 'networkidle', timeout: 60000 });
    
    // We will scrape the first 3 pages as an example for the real extraction
    for (let currentPage = 1; currentPage <= 3; currentPage++) {
        console.log(`📄 Scraping page ${currentPage}...`);
        await page.waitForTimeout(4000); 
        
        const html = await page.content();
        const $ = cheerio.load(html);
        
        $('tr').each((i, el) => {
            const ref = $(el).find('td.col-450 span.ref').text().trim();
            if (!ref) return;

            const fullObjet = $(el).find('.info-bulle[id$="_infosBullesObjet"] div').text().trim();
            const objetDivText = $(el).find('td.col-450 .objet-line:contains("Objet")').text();
            const objetMatch = objetDivText.match(/Objet\s*:\s*([\s\S]*?)(?:\.\.\.|$)/);
            const description = fullObjet || (objetMatch ? objetMatch[1].replace(/\s+/g, ' ').trim() : '');
            const title = description.split(' ').slice(0, 10).join(' ') + (description.split(' ').length > 10 ? '...' : '');

            const acheteurDivText = $(el).find('td.col-450 .objet-line:contains("Acheteur public")').text();
            const acheteurMatch = acheteurDivText.match(/Acheteur public\s*:\s*([\s\S]*)/);
            const buyer = acheteurMatch ? acheteurMatch[1].replace(/\s+/g, ' ').trim() : '';

            const lieuText = $(el).find('td.col-90[headers="cons_lieuExe"] .bloc-info-bulle .info-bulle div').text().trim();
            const city = lieuText || 'Maroc';

            const category = $(el).find('td.col-90[headers="cons_ref"] div[id$="_panelBlocCategorie"]').text().replace(/\s+/g, ' ').trim() || 'Services';

            const dateLimitHtml = $(el).find('td.col-60[headers="cons_dateEnd"] .cloture-line').first().html(); 
            let deadline = null;
            if (dateLimitHtml) {
                const cleanDate = dateLimitHtml.replace(/<br\s*\/?>/i, ' ').replace(/\s+/g, ' ').trim();
                const dateMatch = cleanDate.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
                if (dateMatch) {
                    const [_, dd, mm, yyyy, hh, min] = dateMatch;
                    deadline = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00Z`).toISOString();
                }
            }

            const linkHref = $(el).find('td.actions[headers="cons_actions"] a[href*="EntrepriseDetailConsultation"]').attr('href');
            const source_url = linkHref ? `https://www.marchespublics.gov.ma/${linkHref.replace(/^\?/, 'index.php?')}` : null;

            extractedTenders.push({
                id: ref,
                title, title_ar: title, title_en: title,
                buyer, buyer_ar: buyer, buyer_en: buyer,
                city, city_ar: city, city_en: city,
                category, category_ar: category, category_en: category,
                description, description_ar: description, description_en: description,
                deadline,
                estimated_cost: null, // Not in the main table
                status: "En cours",
                winner_name: null,    // Needs to be scraped from results page
                winning_amount: null, // Needs to be scraped from results page
                source_url
            });
        });

        // Click next page
        const nextButton = await page.$('a.next, a[title="Page suivante"], a:has-text("Suivant")');
        if (nextButton) {
            await nextButton.click();
            await page.waitForTimeout(3000);
        } else {
            break;
        }
    }

    console.log(`✅ Extracted ${extractedTenders.length} real tenders from portal.`);

    // 2. Save to Supabase
    if (extractedTenders.length > 0) {
      const { error: insertError } = await supabase
        .from('tenders')
        .upsert(extractedTenders, { onConflict: 'id' });

      if (insertError) {
        console.error("❌ Error saving to Supabase:", insertError);
      } else {
        console.log("💾 Successfully saved REAL DATA to Supabase.");
      }
    }

    await browser.close();
    console.log("🎉 Job finished successfully!");

  } catch (err) {
    console.error("💥 Fatal Error:", err);
    process.exit(1);
  }
})();
