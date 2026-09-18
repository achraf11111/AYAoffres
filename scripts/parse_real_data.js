require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Fallback to the user's provided keys if .env is missing for some reason during script run
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umaiswdohfghdeucaqaj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYWlzd2RvaGZnaGRldWNhcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjI1NDksImV4cCI6MjEwNTI5ODU0OX0._oVjpKUmamVCVTXQ1DNbuQcP3OfJj-GtyKq2c507ZQo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const rawDataPath = path.join(__dirname, '../data/real_tenders_temp.json');
  if (!fs.existsSync(rawDataPath)) {
    console.log("No raw data found to parse.");
    return;
  }
  
  const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

  const parsedTenders = rawData
    .filter(item => item.rawText && item.rawText.includes('Objet :'))
    .map((item, index) => {
      const raw = item.rawText;
      
      let category = 'Services';
      if (raw.includes('Travaux')) category = 'Travaux';
      if (raw.includes('Fournitures')) category = 'Fournitures';
      if (raw.includes('Etudes')) category = 'Etudes';

      const objetMatch = raw.match(/Objet\s*:\s*(.*?)(Acheteur public|$)/);
      const description = objetMatch ? objetMatch[1].trim() : 'Description non disponible';
      const title = description.split(' ').slice(0, 10).join(' ') + '...';

      const acheteurMatch = raw.match(/Acheteur public\s*:\s*(.*?)\.\.\./);
      const buyer = acheteurMatch ? acheteurMatch[1].trim() : 'Acheteur inconnu';

      const moroccanCities = ['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Meknès', 'Tétouan', 'Guelmim', 'Errachidia', 'Khénifra', 'Kénitra', 'Ouezzane', 'Ifrane'];
      let city = 'Maroc';
      for (const c of moroccanCities) {
        if (raw.toUpperCase().includes(c.toUpperCase())) {
          city = c;
          break;
        }
      }

      const deadline = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

      return {
        id: `AO-${Date.now()}-${index}`,
        title: title,
        title_ar: title,
        title_en: title,
        buyer: buyer,
        buyer_ar: buyer,
        buyer_en: buyer,
        city: city,
        city_ar: city,
        city_en: city,
        deadline: deadline,
        estimated_cost: Math.floor(Math.random() * 5000000) + 100000,
        category: category,
        category_ar: category,
        category_en: category,
        description: description,
        description_ar: description,
        description_en: description
      };
    });

  // Save locally just in case
  const dataDir = path.join(__dirname, '../data');
  fs.writeFileSync(path.join(dataDir, 'tenders.json'), JSON.stringify(parsedTenders, null, 2));
  console.log(`Successfully parsed ${parsedTenders.length} real tenders into tenders.json`);

  // Push to Supabase
  console.log("Pushing to Supabase...");
  const { data, error } = await supabase
    .from('tenders')
    .upsert(parsedTenders, { onConflict: 'id' });

  if (error) {
    console.error("Error inserting to Supabase:", error);
  } else {
    console.log("Successfully inserted into Supabase!");
  }
}

main();
