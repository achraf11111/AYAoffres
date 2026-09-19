const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log("🚀 Starting Historical Scraper Job...");

  try {
    // 1. Get the last scraped date from Supabase
    let { data: stateData, error: stateError } = await supabase
      .from('scraper_state')
      .select('last_date_scraped')
      .eq('id', 1)
      .single();

    if (stateError) {
      console.log("Could not fetch scraper state. Using default.");
    }

    // Default to today if no state is found
    const lastDate = stateData?.last_date_scraped ? new Date(stateData.last_date_scraped) : new Date();
    
    // We scrape a 7-day window backwards
    const endDate = new Date(lastDate);
    const startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() - 7);

    // Format dates to DD/MM/YYYY for the Moroccan portal
    const formatDate = (date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    };

    const endDateStr = formatDate(endDate);
    const startDateStr = formatDate(startDate);

    console.log(`📅 Scraping window: From ${startDateStr} to ${endDateStr}`);

    // 2. Launch Playwright
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });
    const page = await context.newPage();

    // 3. Navigate to the portal
    await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&AllCons&searchAnnCons', { timeout: 60000 });

    // IMPORTANT: Wait for the search form to load
    // The exact selectors depend on the portal structure, we use generic ones as placeholders
    // Example: filling date ranges (You may need to inspect the actual portal to get exact IDs)
    /*
    await page.fill('#dateMiseLigneDebut', startDateStr);
    await page.fill('#dateMiseLigneFin', endDateStr);
    await page.click('#boutonRechercher');
    await page.waitForTimeout(5000); // Wait for results to load
    */

    console.log("🔍 Simulating data extraction for this date range...");
    const extractedTenders = [];

    // [Scraping Logic Goes Here]
    // Loop through the table rows, extract Title, Buyer, City, Deadline.
    // If it's a historical tender, click into the detail page to find the 'Avis d'attribution' (Winner and Price).

    // Mock data for demonstration of the pipeline
    extractedTenders.push({
      id: `HIST-${Date.now()}`,
      title: "Travaux d'aménagement urbain (Historical Demo)",
      buyer: "Commune de Test",
      city: "Casablanca",
      category: "Travaux",
      description: "Travaux de voirie et aménagement urbain.",
      status: "Attribue",
      winner_name: "Société BTP Maroc",
      winning_amount: 1500000,
      awarded_date: endDate.toISOString()
    });

    console.log(`✅ Extracted ${extractedTenders.length} tenders.`);

    // 4. Save to Supabase
    if (extractedTenders.length > 0) {
      const { error: insertError } = await supabase
        .from('tenders')
        .upsert(extractedTenders, { onConflict: 'id' });

      if (insertError) {
        console.error("❌ Error saving to Supabase:", insertError);
      } else {
        console.log("💾 Successfully saved to Supabase.");
      }
    }

    // 5. Update scraper state so next run goes even further back in time
    const { error: updateError } = await supabase
      .from('scraper_state')
      .update({ last_date_scraped: startDate.toISOString() })
      .eq('id', 1);

    if (updateError) {
      console.error("❌ Error updating scraper state:", updateError);
    } else {
      console.log(`⏭️ State updated. Next run will start from ${startDateStr}.`);
    }

    await browser.close();
    console.log("🎉 Job finished successfully!");

  } catch (err) {
    console.error("💥 Fatal Error:", err);
    process.exit(1);
  }
})();
