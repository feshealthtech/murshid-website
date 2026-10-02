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
  const nav = document.querySelector('.m-nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const btn = document.getElementById('m-hamburger');
  const menu = document.getElementById('m-mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', btn.classList.contains('open'));
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open');
    menu.classList.remove('open');
  }));

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
    }
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

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

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = toc.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
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

/* ── Cookie Consent Banner ── */
function initCookieBanner() {
  if (localStorage.getItem('murshid_cookies_accepted') === 'true') return;

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
      max-width: 400px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 14px;
      animation: mCookieFadeUp 0.5s ease forwards;
      direction: ltr;
      text-align: left;
    }
    @media (max-width: 576px) {
      .m-cookie-banner {
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
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
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
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .m-cookie-reject:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.className = 'm-cookie-banner';
  banner.innerHTML = `
    <p class="m-cookie-text">
      🔒 Our website uses cookies to improve system performance and analyze traffic. By continuing to browse, you agree to this. For more information, read our
      <a href="privacy-policy.html">Privacy Policy</a>.
    </p>
    <div class="m-cookie-btn-group">
      <button class="m-cookie-btn m-cookie-reject" id="mCookieReject">Close</button>
      <button class="m-cookie-btn m-cookie-accept" id="mCookieAccept">Accept</button>
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

    // 1. Update all Google Play Store links with robust referrer query parameter
    const googlePlaySelector = 'a[href*="play.google.com/store/apps/details?id=com.feshealthtech.murshid"]';
    const storeLinks = document.querySelectorAll(googlePlaySelector);
    
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

    // 2. Display sleek Referral Welcome Banner
    showReferralBanner(refCode);
  } catch (e) {
    console.warn('Referral tracking init failed:', e);
  }
}

function showReferralBanner(refCode) {
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

