const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

// 1. Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umaiswdohfghdeucaqaj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYWlzd2RvaGZnaGRldWNhcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjI1NDksImV4cCI6MjEwNTI5ODU0OX0._oVjpKUmamVCVTXQ1DNbuQcP3OfJj-GtyKq2c507ZQo';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Avis d\'attribution (Results) page...');
    await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&AvisAttribution', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log('Clicking search to get all recent results...');
    await page.click('#ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche');
    await page.waitForTimeout(5000); // Wait for results to load
    
    // Extract basic tender info from the results page
    const tenders = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('.table-results tbody tr');
      
      rows.forEach(row => {
        const refElement = row.querySelector('.ref');
        const actionLink = row.querySelector('.actions a[href*="EntrepriseDetailConsultation"]');
        
        if (refElement && actionLink) {
          results.push({
            reference: refElement.innerText.trim(),
            detailUrl: 'https://www.marchespublics.gov.ma/' + actionLink.getAttribute('href')
          });
        }
      });
      return results;
    });

    console.log(`Found ${tenders.length} results. Processing the first 10 for matching...`);

    // Only process a subset to avoid long execution times in this test
    for (let i = 0; i < Math.min(10, tenders.length); i++) {
      const tender = tenders[i];
      console.log(`\nChecking Supabase for tender reference: ${tender.reference}`);
      
      // Check if we have this tender in our DB
      const { data: existingTender, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('reference', tender.reference)
        .single();
        
      if (!existingTender) {
        console.log(`Tender ${tender.reference} not found in our DB. Skipping.`);
        continue;
      }
      
      if (existingTender.winner_name) {
        console.log(`Tender ${tender.reference} already has a winner (${existingTender.winner_name}). Skipping.`);
        continue;
      }

      console.log(`Tender found in DB! Navigating to detail page...`);
      const detailPage = await context.newPage();
      await detailPage.goto(tender.detailUrl, { waitUntil: 'domcontentloaded' });
      
      // Look for the PDF download link (AvisJAL)
      const pdfLinkHref = await detailPage.evaluate(() => {
        const link = document.querySelector('a[href*="EntrepriseDownloadAvisJAL"]');
        return link ? 'https://www.marchespublics.gov.ma/' + link.getAttribute('href') : null;
      });

      if (!pdfLinkHref) {
        console.log(`No 'Avis d'attribution' PDF link found for ${tender.reference}.`);
        await detailPage.close();
        continue;
      }

      console.log(`Found PDF link. Downloading...`);
      const downloadPromise = detailPage.waitForEvent('download');
      detailPage.goto(pdfLinkHref).catch(e => { /* ignore playwright navigation error on download */ });
      
      const download = await downloadPromise;
      const downloadPath = path.join(__dirname, '..', 'temp_avis.pdf');
      await download.saveAs(downloadPath);
      
      console.log(`Parsing PDF...`);
      const dataBuffer = fs.readFileSync(downloadPath);
      const pdfData = await pdf(dataBuffer);
      const text = pdfData.text;

      // Simple regex extraction for Moroccan Marche Publics PVs
      let winnerName = null;
      let winningAmount = null;
      
      // Try to find the standard block
      const regex = /Concurrent retenu.*?Montant[^\n]*\n+([^\n]+)\n+([\d\s]+[.,]\d*)/i;
      const match = text.match(regex);
      
      if (match) {
        winnerName = match[1].trim();
        winningAmount = parseFloat(match[2].replace(/\s/g, '').replace(',', '.'));
      } else {
        // Fallback matching
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].toLowerCase().includes('concurrent retenu') && lines[j].toLowerCase().includes('montant')) {
            if (j + 2 < lines.length) {
              winnerName = lines[j+1];
              winningAmount = parseFloat(lines[j+2].replace(/\s/g, '').replace(',', '.'));
              break;
            }
          }
        }
      }

      if (winnerName && winningAmount) {
        console.log(`Extracted -> Winner: ${winnerName}, Amount: ${winningAmount} MAD`);
        
        // Update Supabase
        const { error: updateError } = await supabase
          .from('tenders')
          .update({
            winner_name: winnerName,
            winning_amount: winningAmount,
            status: 'Attribue'
          })
          .eq('reference', tender.reference);
          
        if (updateError) {
          console.error(`Error updating Supabase:`, updateError);
        } else {
          console.log(`Successfully updated tender ${tender.reference} in DB!`);
        }
      } else {
        console.log(`Could not reliably extract winner info from PDF for ${tender.reference}.`);
      }
      
      // Cleanup
      fs.unlinkSync(downloadPath);
      await detailPage.close();
    }
    
    console.log('\nFinished processing results.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
