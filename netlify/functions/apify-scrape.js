// netlify/functions/apify-scrape.js
export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  const token = process.env.APIFY_TOKEN || process.env.VITE_APIFY_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'APIFY_TOKEN is not configured on the server.' })
    };
  }

  try {
    const payload = JSON.parse(event.body);
    const { zipcode, storeId, productUrls } = payload;

    if (!zipcode || !storeId || !productUrls || !Array.isArray(productUrls)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: zipcode, storeId, productUrls' })
      };
    }

    const actorInput = {
      maxItems: productUrls.length,
      productUrls: productUrls.map((url) => ({ url })),
      storeId,
      zipCode: zipcode,
    };

    const apifyUrl = `https://api.apify.com/v2/actors/automation-lab~home-depot-product-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&format=json`;

    const response = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorInput),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
