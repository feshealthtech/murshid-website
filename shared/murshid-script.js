/* ══════════════════════════════════════════
   مرشد — Shared JavaScript
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initScrollReveal();
  initLegalTOC();
  initFAQ();
  initFeatureTabs();
  initCounters();
  initTypewriter();
  initCookieBanner();
  initBetaModal();
  initCompanionBetaModal();
  initDynamicYear();
  initReferralTracking();
});

/* ── Dynamic Footer Year ── */
function initDynamicYear() {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = currentYear;
  });
  document.querySelectorAll('.m-footer-copy').forEach(el => {
    el.innerHTML = el.innerHTML.replace(/\b202\d\b/g, currentYear);
  });
}

/* ── Navbar ── */
function initNav() {
  const nav = document.querySelector('.m-nav, .m-navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  // If on partners portal, the dedicated luxury drawer controller in partners-script.js handles it
  if (document.body && document.body.classList.contains('partners-body')) return;

  const btn = document.getElementById('m-hamburger') || document.querySelector('.m-hamburger');
  const menu = document.getElementById('m-mobile-menu') || document.querySelector('.m-mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    menu.classList.toggle('open', isOpen);
    menu.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open', 'active');
    menu.classList.remove('open', 'active');
    btn.setAttribute('aria-expanded', 'false');
  }));

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('open', 'active');
      menu.classList.remove('open', 'active');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  // Enable animation mode now that JS is running
  document.documentElement.classList.add('js-reveal');

  // Staggered delays for grids
  document.querySelectorAll('.features-tab-panel > *, .wallet-grid > *, .how-steps > *, .testimonials-grid > *, .ps-grid > *')
    .forEach((el, i) => {
      if (!el.dataset.delay) el.dataset.delay = i * 100;
      el.classList.add('reveal');
    });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('on'), delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => obs.observe(el));
}



/* ── Legal TOC Active Tracking ── */
function initLegalTOC() {
  const toc = document.querySelector('.legal-toc');
  if (!toc) return;

  const sections = document.querySelectorAll('.legal-section[id]');
  const links = toc.querySelectorAll('a[href^="#"]');
  const tocList = toc.querySelector('ul') || toc;

  function scrollActiveIntoView(activeEl) {
    if (!tocList || !activeEl) return;
    if (tocList.scrollHeight <= tocList.clientHeight) return;
    const activeRect = activeEl.getBoundingClientRect();
    const listRect = tocList.getBoundingClientRect();
    if (activeRect.top < listRect.top) {
      tocList.scrollBy({ top: activeRect.top - listRect.top - 8, behavior: 'smooth' });
    } else if (activeRect.bottom > listRect.bottom) {
      tocList.scrollBy({ top: activeRect.bottom - listRect.bottom + 8, behavior: 'smooth' });
    }
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      scrollActiveIntoView(link);
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = toc.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) {
          active.classList.add('active');
          scrollActiveIntoView(active);
        }
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ── FAQ Accordion ── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
      // Open clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  // FAQ Filter
  document.querySelectorAll('.faq-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.faq-group').forEach(group => {
        group.style.display = (cat === 'all' || group.dataset.cat === cat) ? 'block' : 'none';
      });
    });
  });
}

/* ── Feature Tabs ── */
function initFeatureTabs() {
  document.querySelectorAll('.ftab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.features-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ── Counter Animation ── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

function animateCount(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  const update = now => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString() + suffix;
  };
  requestAnimationFrame(update);
}

/* ── Typewriter Effect ── */
function initTypewriter() {
  const el = document.querySelector('[data-typewriter]');
  if (!el) return;
  const words = JSON.parse(el.dataset.typewriter);
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];
    if (deleting) {
      el.textContent = word.substring(0, ci--);
      if (ci < 0) { deleting = false; wi = (wi + 1) % words.length; }
      setTimeout(type, 60);
    } else {
      el.textContent = word.substring(0, ci++);
      if (ci > word.length) { deleting = true; setTimeout(type, 1800); return; }
      setTimeout(type, 90);
    }
  }
  type();
}

/* ── Smooth Scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});




/* ── Newsletter Form ── */
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = '✅';
    setTimeout(() => btn.textContent = 'Subscribe', 2000);
    form.reset();
  });
});

function resolveCookiePrivacyHref(pathname, docLang, protocol, scriptSrc) {
  const path = pathname || '/';
  const normalizedLang = (docLang || '').toLowerCase();
  const isArabic = normalizedLang.startsWith('ar') || path === '/ar' || path.indexOf('/ar/') === 0;
  const isCompanion = path.indexOf('/companion') !== -1;
  const isHttp = protocol === 'http:' || protocol === 'https:';
  // Arabic specialist pages under /ar/* share the root /privacy-policy.html document;
  // only /ar/companion/* has a dedicated Arabic privacy-policy.html file.
  const targetRelative = isCompanion
    ? (isArabic ? 'ar/companion/privacy-policy.html' : 'companion/privacy-policy.html')
    : 'privacy-policy.html';

  if (isHttp) {
    return '/' + targetRelative;
  }

  if (typeof scriptSrc === 'string' && scriptSrc) {
    const cleanSrc = scriptSrc.split('#')[0].split('?')[0];
    const sharedIdx = cleanSrc.indexOf('shared/murshid-script.js');
    if (sharedIdx !== -1) {
      return cleanSrc.slice(0, sharedIdx) + targetRelative;
    }
  }
  return targetRelative;
}

/* ── Cookie Consent Banner ── */
function initCookieBanner() {
  if (localStorage.getItem('murshid_cookies_accepted') === 'true') return;

  const path = window.location.pathname || '/';
  const docLang = (document.documentElement.lang || '').toLowerCase();
  const isArabic = docLang.startsWith('ar') || path === '/ar' || path.indexOf('/ar/') === 0;
  const dir = isArabic ? 'rtl' : 'ltr';
  const scriptEl = document.currentScript || document.querySelector('script[src*="murshid-script.js"]');
  const scriptSrc = scriptEl ? (scriptEl.getAttribute('src') || '') : '';
  const privacyHref = resolveCookiePrivacyHref(path, docLang, window.location.protocol, scriptSrc);

  const style = document.createElement('style');
  style.textContent = `
    .m-cookie-banner {
      position: fixed;
      bottom: 24px;
      right: 24px;
      left: auto;
      background: rgba(10, 15, 30, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(20, 184, 166, 0.15);
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      max-width: 420px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 14px;
      animation: mCookieFadeUp 0.5s ease forwards;
      direction: ltr;
      text-align: left;
      font-family: inherit;
    }
    .m-cookie-banner[dir="rtl"] {
      direction: rtl;
      text-align: right;
      left: 24px;
      right: auto;
    }
    @media (max-width: 576px) {
      .m-cookie-banner,
      .m-cookie-banner[dir="rtl"] {
        left: 16px;
        right: 16px;
        bottom: 16px;
        max-width: none;
        padding: 16px 20px;
      }
    }
    @keyframes mCookieFadeUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .m-cookie-text {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.78);
      line-height: 1.65;
      margin: 0;
    }
    .m-cookie-text a {
      color: #10B981;
      font-weight: 700;
      text-decoration: underline;
    }
    .m-cookie-btn-group {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    .m-cookie-btn {
      padding: 8px 18px;
      font-size: 0.82rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .m-cookie-accept {
      background: #047857; /* Darker green for WCAG contrast */
      color: #fff;
      border: none;
    }
    .m-cookie-accept:hover {
      background: #064e3b;
    }
    .m-cookie-reject {
      background: transparent;
      color: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .m-cookie-reject:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  `;
  document.head.appendChild(style);

  const messageHtml = isArabic
    ? `🔒 يستخدم هذا الموقع تخزين المتصفح المحلي الضروري فقط (LocalStorage) لحفظ تفضيلات اللغة والتصفح وضمان عمل الواجهة بكفاءة، ولا نستخدم أي ملفات تعريف ارتباط إعلانية أو لتتبع السلوك عبر الجهات الخارجية. لمزيد من التفاصيل، راجع <a href="${privacyHref}">سياسة الخصوصية</a>.`
    : `🔒 This website uses strictly necessary browser storage (LocalStorage) to remember your language and navigation preferences and keep the interface reliable, with no third-party advertising or tracking cookies. For details, read our <a href="${privacyHref}">Privacy Policy</a>.`;
  const acceptLabel = isArabic ? 'موافق' : 'Accept';
  const rejectLabel = isArabic ? 'إغلاق' : 'Close';

  const banner = document.createElement('div');
  banner.className = 'm-cookie-banner';
  banner.setAttribute('dir', dir);
  banner.innerHTML = `
    <p class="m-cookie-text">${messageHtml}</p>
    <div class="m-cookie-btn-group">
      <button class="m-cookie-btn m-cookie-reject" id="mCookieReject">${rejectLabel}</button>
      <button class="m-cookie-btn m-cookie-accept" id="mCookieAccept">${acceptLabel}</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('mCookieAccept').addEventListener('click', () => {
    localStorage.setItem('murshid_cookies_accepted', 'true');
    banner.style.display = 'none';
  });
  document.getElementById('mCookieReject').addEventListener('click', () => {
    banner.style.display = 'none';
  });
}

/* ── Closed Beta Modal ── */
function initBetaModal() {
  const modal = document.getElementById('beta-modal');
  if (!modal) return;

  const closeX = document.getElementById('modal-close-x');
  const closeBtn = document.getElementById('modal-close-btn');

  // Trigger buttons (iOS triggers modal, Android navigates directly to Google Play)
  const triggerSelectors = [
    '#hero-ios-btn',
    '#dl-ios-btn',
    '#mobile-ios-btn',
    '.m-mobile-dl-ios'
  ];

  const openModal = (e) => {
    e.preventDefault();
    const savedRef = localStorage.getItem('mrshed_ref_code');
    const badgeEl = document.getElementById('ios-ref-badge');
    if (savedRef && !badgeEl) {
      const modalBody = modal.querySelector('.m-modal-body') || modal;
      const badge = document.createElement('div');
      badge.id = 'ios-ref-badge';
      badge.style.cssText = 'background:rgba(13,148,136,0.15);border:1px dashed #0d9488;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:0.85rem;color:#0d9488;text-align:center;font-weight:600;';
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl' || document.documentElement.lang === 'ar';
      badge.innerHTML = isRtl
        ? `🎁 تم حفظ كود الدعوة <strong>${savedRef}</strong> لحسابك! سيكون متاحاً لك فور إطلاق نسخة iOS.`
        : `🎁 Invite code <strong>${savedRef}</strong> is saved for your account for the upcoming iOS release!`;
      modalBody.prepend(badge);
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Attach event listeners to all triggers
  triggerSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', openModal);
    });
  });

  // Close event listeners
  if (closeX) closeX.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ── Companion Closed Beta Modal ── */
function initCompanionBetaModal() {
  const modal = document.getElementById('companion-download-modal');
  if (!modal) return;

  const closeX = document.getElementById('companion-modal-close-x');
  const closeBtn = document.getElementById('companion-modal-close-btn');

  const openModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.companion-dl-trigger, [data-companion-modal]').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (closeX) closeX.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ── Referral Tracking & Dynamic Store Linking ── */
function initReferralTracking() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let refCode = urlParams.get('ref') || urlParams.get('referrer') || urlParams.get('mrshed_ref');

    if (refCode && /^[A-Za-z0-9_-]{3,20}$/.test(refCode.trim())) {
      refCode = refCode.trim().toUpperCase();
      localStorage.setItem('mrshed_ref_code', refCode);
    } else {
      refCode = localStorage.getItem('mrshed_ref_code');
    }

    if (!refCode) return;

    // 1. Update Specialist App Google Play Store links only (exclude com.feshealthtech.murshid.companion)
    const candidatePlaySelector = 'a[href*="play.google.com/store/apps/details"]';
    const storeLinks = Array.from(document.querySelectorAll(candidatePlaySelector)).filter((link) => {
      try {
        const parsed = new URL(link.getAttribute('href') || '', window.location.origin);
        return parsed.searchParams.get('id') === 'com.feshealthtech.murshid';
      } catch (_) {
        return false;
      }
    });
    
    // Merge existing UTM tags if present on the page URL
    const source = urlParams.get('utm_source') || 'google-play';
    const medium = urlParams.get('utm_medium') || 'referral';
    const campaign = urlParams.get('utm_campaign') || 'peer_ref';
    
    const referrerParam = `utm_source%3D${encodeURIComponent(source)}%26utm_medium%3D${encodeURIComponent(medium)}%26utm_campaign%3D${encodeURIComponent(campaign)}%26mrshed_ref%3D${encodeURIComponent(refCode)}`;

    storeLinks.forEach(link => {
      let currentHref = link.getAttribute('href') || '';
      if (currentHref.includes('&referrer=')) {
        currentHref = currentHref.replace(/&referrer=[^&]*/, `&referrer=${referrerParam}`);
      } else if (currentHref.includes('?referrer=')) {
        currentHref = currentHref.replace(/\?referrer=[^&]*/, `?referrer=${referrerParam}`);
      } else {
        currentHref += (currentHref.includes('?') ? '&' : '?') + `referrer=${referrerParam}`;
      }
      link.setAttribute('href', currentHref);
    });

    // 2. Preserve referral parameter across language switch links & internal navigation
    const internalSwitchLinks = document.querySelectorAll('a[href="/"], a[href="/ar/"], a[href="/ar"], a[href*="/ar/"], a[href*="/contact.html"], a[href*="/faq.html"], .m-mobile-link');
    internalSwitchLinks.forEach(link => {
      try {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.origin === window.location.origin && !targetUrl.searchParams.has('ref')) {
          targetUrl.searchParams.set('ref', refCode);
          link.setAttribute('href', targetUrl.pathname + targetUrl.search + targetUrl.hash);
        }
      } catch (_) {}
    });

    // 3. Top banner hidden per design requirement (referral tracking & dynamic store links remain active in background)
    // showReferralBanner(refCode);
  } catch (e) {
    console.warn('Referral tracking init failed:', e);
  }
}

function showReferralBanner(refCode) {
  // Banner display is disabled to prevent overlapping the top navigation bar.
  // Referral code extraction, localStorage persistence, and Google Play dynamic links remain 100% active.
  return;

  if (document.getElementById('m-referral-banner')) return;

  const isRtl = document.documentElement.getAttribute('dir') === 'rtl' || document.documentElement.lang === 'ar';

  const style = document.createElement('style');
  style.textContent = `
    .m-ref-banner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(90deg, #0d9488 0%, #059669 50%, #0284c7 100%);
      color: #ffffff;
      padding: 10px 16px;
      font-size: 0.88rem;
      font-weight: 600;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: mRefSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes mRefSlideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .m-ref-banner-content {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 1200px;
      margin: 0 auto;
      flex-wrap: wrap;
      justify-content: center;
      text-align: center;
    }
    .m-ref-code-badge {
      background: rgba(0, 0, 0, 0.35);
      border: 1.5px dashed #fef08a;
      padding: 3px 12px;
      border-radius: 8px;
      font-family: monospace;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #fef08a;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .m-ref-copy-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .m-ref-copy-btn:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: scale(1.03);
    }
    .m-ref-dl-btn {
      background: #ffffff;
      color: #0f766e;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .m-ref-dl-btn:hover {
      background: #fef08a;
      color: #000;
      transform: scale(1.03);
    }
    .m-ref-close-btn {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0 8px;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .m-ref-close-btn:hover {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.id = 'm-referral-banner';
  banner.className = 'm-ref-banner';

  const textHtml = isRtl
    ? `<span>🎉 مرحباً بك! تمت دعوتك برمز الإسناد الحصري:</span> <span class="m-ref-code-badge">${refCode}</span> <button class="m-ref-copy-btn" id="mRefCopyBtn">📋 نسخ الكود</button> <a href="#download" class="m-ref-dl-btn">📥 تحميل التطبيق</a>`
    : `<span>🎉 Welcome! Special invite code applied:</span> <span class="m-ref-code-badge">${refCode}</span> <button class="m-ref-copy-btn" id="mRefCopyBtn">📋 Copy Code</button> <a href="#download" class="m-ref-dl-btn">📥 Download App</a>`;

  banner.innerHTML = `
    <div class="m-ref-banner-content">
      ${textHtml}
      <button class="m-ref-close-btn" id="mRefCloseBtn" aria-label="Close">&times;</button>
    </div>
  `;

  document.body.prepend(banner);

  const nav = document.getElementById('m-nav');
  if (nav) {
    nav.style.marginTop = '46px';
  }

  const copyBtn = document.getElementById('mRefCopyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(refCode).then(() => {
        copyBtn.textContent = isRtl ? '✅ تم النسخ!' : '✅ Copied!';
        setTimeout(() => {
          copyBtn.textContent = isRtl ? '📋 نسخ الكود' : '📋 Copy Code';
        }, 2000);
      });
    });
  }

  document.getElementById('mRefCloseBtn').addEventListener('click', () => {
    banner.style.display = 'none';
    if (nav) nav.style.marginTop = '0';
  });
}

