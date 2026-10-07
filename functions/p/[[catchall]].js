export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const slug = (pathParts[1] || url.searchParams.get('slug') || '').trim().toLowerCase();

  // If no slug or visiting /p/ directly, serve static /p/index.html
  if (!slug) {
    const assetUrl = new URL('/p/index.html', url.origin);
    return context.env.ASSETS.fetch(new Request(assetUrl, context.request));
  }

  // Pre-validate slug format locally (zero external network overhead for invalid requests)
  const validSlugPattern = /^[a-z0-9_]{5,30}$/;
  if (!validSlugPattern.test(slug)) {
    return new Response('<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>الموقع غير موجود — مرشد</title><meta name="robots" content="noindex, nofollow"></head><body><h1>الموقع غير موجود</h1><p>الرابط المطلوب غير صحيح.</p></body></html>', {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      }
    });
  }

  try {
    const ssrUrl = new URL('https://us-central1-ai-apps-central.cloudfunctions.net/serveSpecialistBioMeta');
    ssrUrl.searchParams.set('slug', slug);

    const clientIp = context.request.headers.get('cf-connecting-ip') || '';
    const userAgent = context.request.headers.get('user-agent') || '';

    const forwardHeaders = new Headers();
    if (userAgent) forwardHeaders.set('User-Agent', userAgent);
    if (clientIp) forwardHeaders.set('X-Forwarded-For', clientIp);
    forwardHeaders.set('X-Forwarded-Host', url.host);

    const ssrResponse = await fetch(ssrUrl.toString(), {
      method: 'GET',
      headers: forwardHeaders
    });

    return new Response(ssrResponse.body, {
      status: ssrResponse.status,
      headers: ssrResponse.headers
    });
  } catch (err) {
    // Graceful fallback to static asset in case of edge network issue
    const assetUrl = new URL('/p/index.html', url.origin);
    return context.env.ASSETS.fetch(new Request(assetUrl, context.request));
  }
}
