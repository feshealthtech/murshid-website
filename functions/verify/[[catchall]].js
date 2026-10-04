export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Fetch and serve /verify/index.html
  const assetUrl = new URL('/verify/index.html', url.origin);
  const response = await context.env.ASSETS.fetch(new Request(assetUrl, context.request));
  
  // Return response with 200 status code
  return new Response(response.body, {
    status: 200,
    headers: response.headers
  });
}
