import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const urls = [
  'https://www.homedepot.com/p/Kelleher-LWM623-9-16-in-x-3-1-4-in-MDF-Baseboard-Molding-MDF221A/202071604',
  'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-OP306-1-2-in-x-3-1-2-in-x-144-in-Primed-MDF-Baseboard-Moulding-8-Pack-96-Total-Linear-Feet-HDFB306-PP/306717387',
  'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-3-in-x-8-ft-MDF-Molding-Board-10003223/204468315',
  'https://www.homedepot.com/p/Woodgrain-Millwork-713-9-16-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10000568/203209374',
  'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-4-in-x-8-ft-MDF-Molding-Boards-10003222/204468314',
  'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-1-2-in-x-4-in-x-84-in-Primed-E1E-MDF-Baseboard-Moulding-4-Pack-28-Total-Linear-Feet-01240-96084PK/331387080',
  'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-9-16-in-x-4-1-4-in-x-96-in-Primed-White-Pine-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-00LK4-93096PK/331519591',
  'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-5-8-in-x-4-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-90412-96096PK/331387087',
  'https://www.homedepot.com/p/Woodgrain-Millwork-1866-9-16-in-x-5-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001790/203209462',
  'https://www.homedepot.com/p/Woodgrain-Millwork-11-16-in-x-5-1-2-in-x-96-in-Primed-MDF-Craftsman-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10026967/302793194',
  'https://www.homedepot.com/p/HOUSE-OF-FARA-5-8-in-D-x-5-1-4-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-5709PFJ/340059370',
  'https://www.homedepot.com/p/Woodgrain-Millwork-618-9-16-in-x-5-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001781/203209486',
  'https://www.homedepot.com/p/Unbranded-1-in-x-6-in-x-8-ft-Radiata-Pine-Finger-Joint-Primed-Board-280552/304468198',
  'https://www.homedepot.com/p/Builder-s-Choice-257-5-8-in-x-6-in-Primed-MDF-Baseboard-Moulding-Sold-by-Linear-Foot-HDFB257/206005284',
  'https://www.homedepot.com/p/HOUSE-OF-FARA-8665-3-4-in-x-6-1-2-in-x-96-in-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-8665/202087580',
  'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-6-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-H20PFJ/339857100',
  'https://www.homedepot.com/p/WM-356-11-16-in-x-2-1-4-in-x-84-in-Primed-Finger-Jointed-Casing-10000527/206001677',
  'https://www.homedepot.com/p/Woodgrain-Millwork-25E2-11-16-in-x-2-1-2-in-x-96-in-Craftsman-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10026964/302792237',
  'https://www.homedepot.com/p/711-5-8-in-x-2-1-2-in-x-7-ft-MDF-Casing-MDF424A-1/204685095',
  'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-2-1-2-in-W-x-84-in-L-Primed-Pine-Wood-PFJ-Casing-Moulding-361PFJ/334803846',
  'https://www.homedepot.com/p/RB03-1-in-x-3-1-2-in-x-96-in-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10002037/204167646',
  'https://www.homedepot.com/p/Woodgrain-Millwork-LWM-445-5-8-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Casing-10000550/203209381',
  'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-3-1-4-in-W-x-96-in-L-Primed-Pine-Finger-Joint-Wood-Casing-Moulding-W360-PFJ/340684060',
  'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-434-11-16-in-x-3-1-2-in-x-84-in-Craftsman-Finished-MDF-Primed-White-Casing-5-Pack-35-Total-Linear-Feet-FECS434DP/304065772'
];

async function scrapeImages() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = {};
  const page = await browser.newPage();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i+1}/${urls.length}] Scraping: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const imgUrl = await page.evaluate(() => {
        const img = document.querySelector('meta[property="og:image"]');
        return img ? img.content : null;
      });
      if (imgUrl) {
        results[url] = imgUrl;
        console.log("  -> Found:", imgUrl);
      } else {
        console.log("  -> Not found.");
      }
    } catch (err) {
      console.log("  -> Failed:", err.message);
    }
  }

  await browser.close();
  fs.writeFileSync('images_map.json', JSON.stringify(results, null, 2));
  console.log("Done.");
}

scrapeImages();
