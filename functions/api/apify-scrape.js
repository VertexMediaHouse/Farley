export async function onRequestPost(context) {
  const { request, env } = context;

  const token = env.APIFY_TOKEN || env.VITE_APIFY_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'APIFY_TOKEN is not configured on the server.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const payload = await request.json();
    const { zipcode, storeId, productUrls } = payload;

    if (!zipcode || !storeId || !productUrls || !Array.isArray(productUrls)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: zipcode, storeId, productUrls' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
