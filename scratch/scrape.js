import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const url = 'https://www.homedepot.com/p/Kelleher-LWM623-9-16-in-x-3-1-4-in-MDF-Baseboard-Molding-MDF221A/202071604';

async function test() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const imgUrl = await page.evaluate(() => {
      const img = document.querySelector('meta[property="og:image"]');
      return img ? img.content : null;
    });
    console.log("Image URL:", imgUrl);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

test();
