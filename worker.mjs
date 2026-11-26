const SSR_BIO_META_ENDPOINT =
  'https://us-central1-ai-apps-central.cloudfunctions.net/serveSpecialistBioMeta';
const SPECIALISTS_SITEMAP_ENDPOINT =
  'https://us-central1-ai-apps-central.cloudfunctions.net/serveSpecialistsSitemap';
const VALID_SLUG_REGEX = /^[a-z0-9_]{5,30}$/;

function buildCompanionNoCacheHeaders(baseHeaders) {
  const headers = new Headers(baseHeaders);
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return headers;
}

const VERIFY_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' https://www.gstatic.com https://www.google.com https://recaptcha.net https://www.recaptcha.net",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://www.gstatic.com",
  "font-src 'self'",
  "img-src 'self' data: https://www.gstatic.com",
  "frame-src https://www.google.com https://recaptcha.net https://www.recaptcha.net",
  "connect-src 'self' https://us-central1-ai-apps-central.cloudfunctions.net https://firebaseappcheck.googleapis.com https://content-firebaseappcheck.googleapis.com https://firebaseinstallations.googleapis.com https://www.google.com https://www.gstatic.com https://recaptcha.net https://www.recaptcha.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

function buildVerifyNoCacheHeaders(baseHeaders) {
  const headers = new Headers(baseHeaders);
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy', VERIFY_CONTENT_SECURITY_POLICY);
  return headers;
}

function methodNotAllowedResponse() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      Allow: 'GET, HEAD',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

function invalidBioNotFoundResponse() {
  return new Response(
    '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>الموقع غير موجود — مرشد</title><meta name="robots" content="noindex, nofollow"></head><body><h1>الموقع غير موجود</h1><p>الرابط المطلوب غير صحيح.</p></body></html>',
    {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

async function fetchStaticHtmlAsset(env, origin, canonicalAssetPath, request) {
  const safeMethod = request.method === 'HEAD' ? 'HEAD' : 'GET';
  let targetUrl = new URL(canonicalAssetPath, origin).toString();

  let response = await env.ASSETS.fetch(
    new Request(targetUrl, {
      method: safeMethod,
      headers: request.headers,
    })
  );

  // Guard against any 30x auto-trailing-slash canonicalization redirect from ASSETS
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      targetUrl = new URL(location, origin).toString();
      response = await env.ASSETS.fetch(
        new Request(targetUrl, {
          method: safeMethod,
          headers: request.headers,
        })
      );
    }
  }
  return response;
}

export async function handleWorkerRequest(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isReadMethod = request.method === 'GET' || request.method === 'HEAD';

  // 1. Companion App Link fallback (/companion/link*, /ar/companion/link*)
  const isCompanionLinkRoute =
    pathname === '/companion/link' ||
    pathname.startsWith('/companion/link/') ||
    pathname === '/ar/companion/link' ||
    pathname.startsWith('/ar/companion/link/');

  if (isCompanionLinkRoute) {
    if (!isReadMethod) return methodNotAllowedResponse();
    const assetResponse = await fetchStaticHtmlAsset(
      env,
      url.origin,
      '/companion/link/',
      request
    );
    return new Response(assetResponse.body, {
      status: assetResponse.status === 404 ? 404 : 200,
      headers: buildCompanionNoCacheHeaders(assetResponse.headers),
    });
  }

  // 2. Credential & Certificate Verification Portal (/verify, /verify/*)
  const isVerifyRoute = pathname === '/verify' || pathname.startsWith('/verify/');
  if (isVerifyRoute) {
    if (!isReadMethod) return methodNotAllowedResponse();
    const assetResponse = await fetchStaticHtmlAsset(
      env,
      url.origin,
      '/verify/',
      request
    );
    return new Response(assetResponse.body, {
      status: assetResponse.status === 404 ? 404 : 200,
      headers: buildVerifyNoCacheHeaders(assetResponse.headers),
    });
  }

  // 3. Dynamic Specialists Sitemap (/sitemap-specialists.xml)
  if (pathname === '/sitemap-specialists.xml') {
    if (!isReadMethod) return methodNotAllowedResponse();
    try {
      const forwardHeaders = new Headers();
      const userAgent = request.headers.get('user-agent');
      const clientIp = request.headers.get('cf-connecting-ip');
      if (userAgent) forwardHeaders.set('User-Agent', userAgent);
      if (clientIp) forwardHeaders.set('X-Forwarded-For', clientIp);
      forwardHeaders.set('X-Forwarded-Host', url.host);

      const upstream = await fetchImpl(SPECIALISTS_SITEMAP_ENDPOINT, {
        method: request.method,
        headers: forwardHeaders,
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: upstream.headers,
      });
    } catch (_) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
        {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300',
          },
        }
      );
    }
  }

  // 4. Specialist Public Bio Pages & Social OpenGraph SSR (/p, /p/<slug>)
  const isBioRoute = pathname === '/p' || pathname.startsWith('/p/');
  if (isBioRoute) {
    if (!isReadMethod) return methodNotAllowedResponse();

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 2) {
      return invalidBioNotFoundResponse();
    }

    let rawPathSlug = '';
    if (segments[1]) {
      try {
        rawPathSlug = decodeURIComponent(segments[1]);
      } catch (_) {
        return invalidBioNotFoundResponse();
      }
    }

    const normalizedPathSlug =
      rawPathSlug.toLowerCase() === 'index.html' ? '' : rawPathSlug.trim().toLowerCase();

    // Canonicalize trailing slash (/p/ahmed/ -> /p/ahmed) so relative ../assets/ resolves cleanly
    if (normalizedPathSlug && pathname.endsWith('/')) {
      const canonical = new URL(`/p/${encodeURIComponent(normalizedPathSlug)}`, url.origin);
      canonical.search = url.search;
      canonical.hash = url.hash;
      return new Response(null, {
        status: 301,
        headers: {
          Location: canonical.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const querySlug = (
      url.searchParams.get('slug') ||
      url.searchParams.get('u') ||
      url.searchParams.get('id') ||
      ''
    )
      .trim()
      .toLowerCase();

    const slug = normalizedPathSlug || querySlug;

    if (!slug) {
      return fetchStaticHtmlAsset(env, url.origin, '/p/', request);
    }

    if (!VALID_SLUG_REGEX.test(slug)) {
      return invalidBioNotFoundResponse();
    }

    try {
      const ssrUrl = new URL(SSR_BIO_META_ENDPOINT);
      ssrUrl.searchParams.set('slug', slug);

      const forwardHeaders = new Headers();
      const clientIp = request.headers.get('cf-connecting-ip') || '';
      const userAgent = request.headers.get('user-agent') || '';
      if (userAgent) forwardHeaders.set('User-Agent', userAgent);
      if (clientIp) forwardHeaders.set('X-Forwarded-For', clientIp);
      forwardHeaders.set('X-Forwarded-Host', url.host);

      const ssrResponse = await fetchImpl(ssrUrl.toString(), {
        method: request.method,
        headers: forwardHeaders,
      });

      const headers = new Headers(ssrResponse.headers);
      const rawCacheControl = (headers.get('cache-control') || '').toLowerCase();
      const isUncacheable =
        rawCacheControl.includes('no-cache') || rawCacheControl.includes('no-store');

      if (ssrResponse.status === 200 && !isUncacheable) {
        headers.set(
          'Cache-Control',
          'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800'
        );
      }

      return new Response(ssrResponse.body, {
        status: ssrResponse.status,
        headers,
      });
    } catch (_) {
      return fetchStaticHtmlAsset(env, url.origin, '/p/', request);
    }
  }

  // 5. Fallback for all other routes
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    return handleWorkerRequest(request, env);
  },
};
