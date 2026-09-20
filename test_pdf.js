const fs = require('fs');
const { chromium } = require('playwright');
const pdf = require('pdf-parse');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to detail page to get download URL...');
    const url = 'https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseDownloadAvisJAL&refConsultation=1041285&orgAcronyme=o8p&idAvis=533582';
    
    // Playwright handling download
    const downloadPromise = page.waitForEvent('download');
    page.goto(url).catch(e => { /* ignore download error */ });
    
    const download = await downloadPromise;
    const downloadPath = 'C:/Users/abdel/.gemini/antigravity/scratch/avis_attribution.pdf';
    await download.saveAs(downloadPath);
    console.log(`Downloaded to ${downloadPath}`);
    
    // Parse PDF
    let dataBuffer = fs.readFileSync(downloadPath);
    const data = await pdf(dataBuffer);
    
    console.log('\n--- PDF TEXT ---\n');
    console.log(data.text);
    console.log('\n----------------\n');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
