export async function onRequest(context) {
  const url = new URL(context.request.url);

  try {
    const sitemapUrl = new URL('https://us-central1-ai-apps-central.cloudfunctions.net/serveSpecialistsSitemap');
    const clientIp = context.request.headers.get('cf-connecting-ip') || '';
    const userAgent = context.request.headers.get('user-agent') || '';

    const forwardHeaders = new Headers();
    if (userAgent) forwardHeaders.set('User-Agent', userAgent);
    if (clientIp) forwardHeaders.set('X-Forwarded-For', clientIp);
    forwardHeaders.set('X-Forwarded-Host', url.host);

    const sitemapResponse = await fetch(sitemapUrl.toString(), {
      method: context.request.method,
      headers: forwardHeaders
    });

    const headers = new Headers(sitemapResponse.headers);
    // Guarantee 24 hours edge cache on global Cloudflare CDN
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    headers.set('Content-Type', 'application/xml; charset=utf-8');

    return new Response(sitemapResponse.body, {
      status: sitemapResponse.status,
      headers: headers
    });
  } catch (err) {
    // Graceful fallback to valid empty urlset
    const fallback = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
    return new Response(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600'
      }
    });
  }
}
