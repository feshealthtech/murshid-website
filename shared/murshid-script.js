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
  initDynamicYear();
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

/* ── Data Deletion Form ── */
const deletionForm = document.getElementById('deletionForm');
if (deletionForm) {
  deletionForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = deletionForm.querySelector('[type=submit]');
    btn.textContent = '⏳ جاري الإرسال...';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1500));
    btn.textContent = '✅ تم استلام طلبك';
    btn.style.background = 'var(--m-success)';
    deletionForm.reset();
    const msg = document.getElementById('deletion-success');
    if (msg) msg.style.display = 'block';
  });
}



/* ── Newsletter Form ── */
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = '✅';
    setTimeout(() => btn.textContent = 'اشترك', 2000);
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
      direction: rtl;
      text-align: right;
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
      background: #10B981;
      color: #fff;
      border: none;
    }
    .m-cookie-accept:hover {
      background: #0D9488;
    }
    .m-cookie-reject {
      background: transparent;
      color: rgba(255, 255, 255, 0.5);
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
      🔒 يستخدم موقعنا ملفات تعريف الارتباط لتحسين أداء النظام وتحليل حركة التصفح. مواصلة تصفحك للموقع يعني موافقتك على ذلك. لمزيد من المعلومات، اقرأ 
      <a href="privacy-policy.html">سياسة الخصوصية</a>.
    </p>
    <div class="m-cookie-btn-group">
      <button class="m-cookie-btn m-cookie-reject" id="mCookieReject">إغلاق</button>
      <button class="m-cookie-btn m-cookie-accept" id="mCookieAccept">موافق</button>
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
