// data/baseboardCasingCatalog.ts

export interface CatalogEntry {
  url: string;
  name: string;
  category: 'baseboard' | 'casing';
  sizeLabel: string; // matches trimConfig's catalog `size` field, e.g. 'Baseboard 3”'
}

export const baseboardCasingCatalog: CatalogEntry[] = [
  // ── Baseboard 3" ──────────────────────────────────────────────
  { url: 'https://www.homedepot.com/p/Kelleher-LWM623-9-16-in-x-3-1-4-in-MDF-Baseboard-Molding-MDF221A/202071604', name: 'Kelleher LWM623 9/16x3-1/4in MDF Baseboard', category: 'baseboard', sizeLabel: 'Baseboard 3”' },
  { url: 'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-OP306-1-2-in-x-3-1-2-in-x-144-in-Primed-MDF-Baseboard-Moulding-8-Pack-96-Total-Linear-Feet-HDFB306-PP/306717387', name: 'Builders Choice OP306 1/2x3-1/2in 144in MDF', category: 'baseboard', sizeLabel: 'Baseboard 3”' },
  { url: 'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-3-in-x-8-ft-MDF-Molding-Board-10003223/204468315', name: 'Finished Elegance 1x3in 8ft MDF Board', category: 'baseboard', sizeLabel: 'Baseboard 3”' },
  { url: 'https://www.homedepot.com/p/Woodgrain-Millwork-713-9-16-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10000568/203209374', name: 'Woodgrain 713 9/16x3-1/4in 96in Primed FJ', category: 'baseboard', sizeLabel: 'Baseboard 3”' },

  // ── Baseboard 4" ──────────────────────────────────────────────
  { url: 'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-4-in-x-8-ft-MDF-Molding-Boards-10003222/204468314', name: 'Finished Elegance 1x4in 8ft MDF Board', category: 'baseboard', sizeLabel: 'Baseboard 4”' },
  { url: 'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-1-2-in-x-4-in-x-84-in-Primed-E1E-MDF-Baseboard-Moulding-4-Pack-28-Total-Linear-Feet-01240-96084PK/331387080', name: 'Alexandria 1/2x4in 84in E1E MDF 4-Pack', category: 'baseboard', sizeLabel: 'Baseboard 4”' },
  { url: 'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-9-16-in-x-4-1-4-in-x-96-in-Primed-White-Pine-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-00LK4-93096PK/331519591', name: 'Alexandria 9/16x4-1/4in 96in White Pine 4-Pack', category: 'baseboard', sizeLabel: 'Baseboard 4”' },
  { url: 'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-5-8-in-x-4-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-90412-96096PK/331387087', name: 'Alexandria 5/8x4-1/4in 96in MDF 4-Pack', category: 'baseboard', sizeLabel: 'Baseboard 4”' },

  // ── Baseboard 5" ──────────────────────────────────────────────
  { url: 'https://www.homedepot.com/p/Woodgrain-Millwork-1866-9-16-in-x-5-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001790/203209462', name: 'Woodgrain 1866 9/16x5-1/4in 96in MDF', category: 'baseboard', sizeLabel: 'Baseboard 5”' },
  { url: 'https://www.homedepot.com/p/Woodgrain-Millwork-11-16-in-x-5-1-2-in-x-96-in-Primed-MDF-Craftsman-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10026967/302793194', name: 'Woodgrain Craftsman 11/16x5-1/2in 96in MDF', category: 'baseboard', sizeLabel: 'Baseboard 5”' },
  { url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-5-8-in-D-x-5-1-4-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-5709PFJ/340059370', name: 'House of Fara 5/8x5-1/4in 96in Primed Pine FJ', category: 'baseboard', sizeLabel: 'Baseboard 5”' },
  { url: 'https://www.homedepot.com/p/Woodgrain-Millwork-618-9-16-in-x-5-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001781/203209486', name: 'Woodgrain 618 9/16x5-1/4in 96in Primed FJ', category: 'baseboard', sizeLabel: 'Baseboard 5”' },

  // ── Baseboard 6" ──────────────────────────────────────────────
  { url: 'https://www.homedepot.com/p/Unbranded-1-in-x-6-in-x-8-ft-Radiata-Pine-Finger-Joint-Primed-Board-280552/304468198', name: 'Radiata Pine 1x6in 8ft FJ Primed Board', category: 'baseboard', sizeLabel: 'Baseboard 6”' },
  { url: 'https://www.homedepot.com/p/Builder-s-Choice-257-5-8-in-x-6-in-Primed-MDF-Baseboard-Moulding-Sold-by-Linear-Foot-HDFB257/206005284', name: 'Builders Choice 257 5/8x6in MDF (per lft)', category: 'baseboard', sizeLabel: 'Baseboard 6”' },
  { url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-8665-3-4-in-x-6-1-2-in-x-96-in-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-8665/202087580', name: 'House of Fara 8665 3/4x6-1/2in 96in MDF', category: 'baseboard', sizeLabel: 'Baseboard 6”' },
  { url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-6-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-H20PFJ/339857100', name: 'House of Fara H20PFJ 11/16x6in 96in Pine FJ', category: 'baseboard', sizeLabel: 'Baseboard 6”' },

  // ── Casing 2" ─────────────────────────────────────────────────
  { url: 'https://www.homedepot.com/p/WM-356-11-16-in-x-2-1-4-in-x-84-in-Primed-Finger-Jointed-Casing-10000527/206001677', name: 'WM-356 11/16x2-1/4in 84in Primed FJ Casing', category: 'casing', sizeLabel: 'Casing 2”' },
  { url: 'https://www.homedepot.com/p/Woodgrain-Millwork-25E2-11-16-in-x-2-1-2-in-x-96-in-Craftsman-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10026964/302792237', name: 'Woodgrain 25E2 11/16x2-1/2in 96in MDF Casing', category: 'casing', sizeLabel: 'Casing 2”' },
  { url: 'https://www.homedepot.com/p/711-5-8-in-x-2-1-2-in-x-7-ft-MDF-Casing-MDF424A-1/204685095', name: '711 5/8x2-1/2in 7ft MDF Casing', category: 'casing', sizeLabel: 'Casing 2”' },
  { url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-2-1-2-in-W-x-84-in-L-Primed-Pine-Wood-PFJ-Casing-Moulding-361PFJ/334803846', name: 'House of Fara 361PFJ 11/16x2-1/2in 84in Pine Casing', category: 'casing', sizeLabel: 'Casing 2”' },

  // ── Casing 3" ─────────────────────────────────────────────────
  { url: 'https://www.homedepot.com/p/RB03-1-in-x-3-1-2-in-x-96-in-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10002037/204167646', name: 'RB03 1x3-1/2in 96in Primed MDF Casing', category: 'casing', sizeLabel: 'Casing 3”' },
  { url: 'https://www.homedepot.com/p/Woodgrain-Millwork-LWM-445-5-8-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Casing-10000550/203209381', name: 'Woodgrain LWM-445 5/8x3-1/4in 96in FJ Casing', category: 'casing', sizeLabel: 'Casing 3”' },
  { url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-3-1-4-in-W-x-96-in-L-Primed-Pine-Finger-Joint-Wood-Casing-Moulding-W360-PFJ/340684060', name: 'House of Fara W360-PFJ 11/16x3-1/4in 96in Casing', category: 'casing', sizeLabel: 'Casing 3”' },
  { url: 'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-434-11-16-in-x-3-1-2-in-x-84-in-Craftsman-Finished-MDF-Primed-White-Casing-5-Pack-35-Total-Linear-Feet-FECS434DP/304065772', name: 'Builders Choice 434 11/16x3-1/2in 84in MDF 5-Pack', category: 'casing', sizeLabel: 'Casing 3”' },
];

export const SCRAPE_ACTOR_INPUT = {
  execute_js_async: false,
  js_script: "function getPrice(){const blocks=[...document.querySelectorAll('script[type=\"application/ld+json\"]')];for(const b of blocks){try{const j=JSON.parse(b.textContent);const nodes=Array.isArray(j)?j:[j];for(const n of nodes){const offers=n.offers?(Array.isArray(n.offers)?n.offers:[n.offers]):[];for(const o of offers){const avail=(o.availability||'').toLowerCase();if(avail.includes('outofstock')||avail.includes('soldout')||avail.includes('discontinued'))return 'out of stock';const p=o.price??o.lowPrice??o.highPrice;if(p!=null&&!isNaN(parseFloat(p)))return String(parseFloat(p));}}}catch(e){}}const bodyText=(document.body.innerText||'').toLowerCase();if(bodyText.includes('out of stock')||bodyText.includes('sold out')||bodyText.includes('this item is currently unavailable')||bodyText.includes('no longer available'))return 'out of stock';const priceEl=document.querySelector('#standard-price, [data-testid=\"standard-price\"], .sui-font-display');const scope=priceEl?priceEl.innerText:document.body.innerText;const m=scope.match(/\\$\\s?([\\d,]+\\.\\d{2})/);if(m)return String(parseFloat(m[1].replace(/,/g,'')));return null;}return getPrice();",
  js_timeout: 10,
  max_retries_per_url: 2,
  page_is_loaded_before_running_script: true,
  proxy: { useApifyProxy: false },
  retrieve_html_from_url_after_loaded: false,
  retrieve_result_from_js_script: true,
  urls: baseboardCasingCatalog.map(c => c.url),
};