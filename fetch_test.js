import fs from 'fs';

const urls = [
  "https://www.homedepot.com/p/Kelleher-LWM623-9-16-in-x-3-1-4-in-MDF-Baseboard-Molding-MDF221A/202071604",
  "https://www.homedepot.com/p/Builders-Choice-Pro-Pack-OP306-1-2-in-x-3-1-2-in-x-144-in-Primed-MDF-Baseboard-Moulding-8-Pack-96-Total-Linear-Feet-HDFB306-PP/306717387"
];

async function test() {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
      const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
      
      console.log("URL:", url);
      console.log("Title:", titleMatch ? titleMatch[1] : "Not found");
      console.log("Image:", imgMatch ? imgMatch[1] : "Not found");
    } catch (err) {
      console.error(err);
    }
  }
}

test();
