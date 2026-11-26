/**
 * منصة مُرشِد لإدارة عيادات وحسابات التغذية (Murshid Dietetic Practice Platform)
 * سكربت إدارة بوابة الشراكات المؤسسية التفاعلية لعام 2027
 * Interactive B2B Partners Engine (Dual Video Engine, Visual Territory & Molecule Configurator, Executive Dispatch)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════════════════════════
  // 1. مشغل الفيديو السينمائي المزدوج (YouTube API لبروتوكول HTTP + مشغل MP4 محلي لبروتوكول file://)
  // يضمن عدم ظهور خطأ 153 نهائياً سواء فُتحت الصفحة محلياً أو عبر الخادم
  // ═══════════════════════════════════════════════════════════════
  const localVideo = document.getElementById('b2bLocalVideo') || document.getElementById('b2bVideo');
  const ytContainer = document.getElementById('b2bYtPlayer');
  const videoOverlay = document.getElementById('videoOverlay');
  const playPulseBtn = document.getElementById('playPulseBtn');
  const chapterPills = document.querySelectorAll('.b2b-chapter-pill');

  const isFileProtocol = window.location.protocol === 'file:';
  let useLocalVideoEngine = isFileProtocol;

  // تعريف طوابع الفصول السبعة بالثواني الدقيقة
  const chapters = [
    { id: 1, start: 0, end: 105 },     // 00:00 - أزمة التسويق التقليدي وهدر المندوب
    { id: 2, start: 105, end: 160 },   // 01:45 - محرك مرشد الحسابي التغذوي والانتشار الميداني
    { id: 3, start: 160, end: 250 },   // 02:40 - بوابات الشراكة التغذوية ونموذج التوصية الذكي
    { id: 4, start: 250, end: 325 },   // 04:10 - ولاء المشتركين والاندماج الرقمي لعلامة الشريك
    { id: 5, start: 325, end: 400 },   // 05:25 - معمارية حِصّة المُرَكَّب والحظر الجغرافي
    { id: 6, start: 400, end: 475 },   // 06:40 - الضمانات الثلاثية ومحرك التيليمتري المباشر
    { id: 7, start: 475, end: 560 }    // 07:55 - امتيازات الشريك المؤسس والدعوة الختامية
  ];

  let ytPlayer = null;
  let ytTrackingTimer = null;

  const activateLocalVideoMode = () => {
    useLocalVideoEngine = true;
    if (ytContainer) {
      ytContainer.style.display = 'none';
      ytContainer.removeAttribute('src');
    }
    if (localVideo) {
      localVideo.style.display = 'block';
    }
  };

  if (isFileProtocol && localVideo) {
    activateLocalVideoMode();
  }

  const updateActiveChapterUI = (currentTime) => {
    let activeIndex = -1;
    for (let i = 0; i < chapters.length; i++) {
      if (currentTime >= chapters[i].start && currentTime < chapters[i].end) {
        activeIndex = i;
        break;
      }
    }

    if (activeIndex !== -1) {
      chapterPills.forEach((pill, idx) => {
        if (idx === activeIndex) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }
  };

  const startTracking = () => {
    if (ytTrackingTimer) clearInterval(ytTrackingTimer);
    ytTrackingTimer = setInterval(() => {
      if (!useLocalVideoEngine && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        const t = ytPlayer.getCurrentTime();
        updateActiveChapterUI(t);
      }
    }, 350);
  };

  const stopTracking = () => {
    if (ytTrackingTimer) {
      clearInterval(ytTrackingTimer);
      ytTrackingTimer = null;
    }
  };

  const sendIframeCommand = (func, args) => {
    const iframe = document.getElementById('b2bYtPlayer');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: args || []
      }), '*');
    }
  };

  const initYouTubePlayer = () => {
    if (!ytContainer || useLocalVideoEngine) return;

    const setupPlayer = () => {
      try {
        ytPlayer = new YT.Player('b2bYtPlayer', {
          events: {
            onReady: () => {},
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                if (videoOverlay) videoOverlay.classList.add('hidden');
                if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                  document.activeElement.blur();
                }
                window.focus();
                startTracking();
              } else {
                stopTracking();
              }
            },
            onError: () => {
              if (localVideo) {
                activateLocalVideoMode();
              }
            }
          }
        });
      } catch (err) {
        console.warn('YT.Player attach notice:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function() {
        if (typeof prevOnReady === 'function') prevOnReady();
        setupPlayer();
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }
    }
  };

  initYouTubePlayer();

  const startPlayback = () => {
    if (videoOverlay) {
      videoOverlay.classList.add('hidden');
    }
    if (useLocalVideoEngine && localVideo) {
      localVideo.play().catch(err => console.warn('Video play notice:', err));
      return;
    }
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      ytPlayer.playVideo();
    } else {
      sendIframeCommand('playVideo');
    }
    // تحرير التركيز لمنع المتصفح من حصر التمرير أو المفاتيح داخل المشغل
    if (document.activeElement && (document.activeElement.tagName === 'IFRAME' || document.activeElement.id === 'playPulseBtn')) {
      document.activeElement.blur();
    }
    window.focus();
    startTracking();
  };

  if (videoOverlay) {
    videoOverlay.addEventListener('click', startPlayback);
  }
  if (playPulseBtn) {
    playPulseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startPlayback();
    });
  }

  if (localVideo) {
    localVideo.addEventListener('play', () => {
      if (videoOverlay) videoOverlay.classList.add('hidden');
    });
    localVideo.addEventListener('timeupdate', () => {
      updateActiveChapterUI(localVideo.currentTime);
    });
  }

  // الضغط على أزرار مصفوفة الفصول السبعة للقفز الفوري (بدون قفز تمريري إجباري للشاشة)
  chapterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const seekTime = parseFloat(pill.getAttribute('data-seek')) || 0;

      if (videoOverlay) {
        videoOverlay.classList.add('hidden');
      }

      if (useLocalVideoEngine && localVideo) {
        localVideo.currentTime = seekTime;
        localVideo.play().catch(err => console.warn('Local seek play notice:', err));
      } else if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
        ytPlayer.seekTo(seekTime, true);
        ytPlayer.playVideo();
      } else {
        sendIframeCommand('seekTo', [seekTime, true]);
        sendIframeCommand('playVideo');
      }

      chapterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });


  // ═══════════════════════════════════════════════════════════════
  // 2. المنصة التفاعلية المرئية لاستكشاف حِصص المُرَكَّبات والدول (#slots)
  // ═══════════════════════════════════════════════════════════════
  const countrySelect = document.getElementById('slotCountrySelect');
  const compoundSelect = document.getElementById('slotCompoundSelect');
  const countryPills = document.querySelectorAll('.b2b-country-pill');
  const catFilterTabs = document.querySelectorAll('.b2b-cat-tab');
  const moleculeCards = document.querySelectorAll('.b2b-molecule-card');
  const slotDossierCard = document.getElementById('slotDossierCard');

  const slotTitleEl = document.getElementById('slotResultTitle');
  const slotDetailsEl = document.getElementById('slotResultDetails');
  const slotCodeEl = document.getElementById('slotResultCode');
  const slotCategoryBadgeEl = document.getElementById('slotCategoryBadge');
  const slotTriggersEl = document.getElementById('slotTriggersContainer');
  const slotSlaImpressionsEl = document.getElementById('slotSlaImpressions');
  const slotReserveBtn = document.getElementById('slotReserveBtn');
  const slotDirectWaBtn = document.getElementById('slotDirectWaBtn');

  // بيانات تفصيلية موسعة لـ 14 محوراً للمركّبات الغذائية (تعرض كبطاقات مرجعية اختيارية داخل الدليل اليدوي للمكملات ومركز المعرفة، دون أي اقتراح أو تفعيل تلقائي أو ادعاءات مرضية)
  const compoundData = {
    'd3': {
      code: 'CAT-D03',
      categoryAr: 'حِصّة الفيتامينات الذائبة في الدهون وتوازن الكالسيوم الغذائي',
      categoryEn: 'Fat-Soluble Vitamins & Dietary Calcium Balance Slot',
      nameAr: 'فيتامين د3 (Cholecalciferol)',
      nameEn: 'Vitamin D3 (Cholecalciferol)',
      detailsAr: 'إدراج كافة التراكيز والأشكال المرخصة (قطرات، كبسولات، أقراص، وتراكيز متنوعة) ضمن بطاقة المرجع الموثقة في الدليل اليدوي الاختياري عند تصفح الأخصائي لتصنيف فيتامين (د) أثناء التقييم الغذائي أو تصميم جدول الوجبات، مع ظهور صورة العبوة الرسمية في تقرير المراجع وتطبيق «رفيق مرشد» عند اختيار الأخصائي لها يدوياً، ورعاية المسار التعليمي وبطاقة المعرفة اليومية للمركب.',
      detailsEn: 'Indexes all licensed strengths and dosage forms (drops, softgels, capsules) inside the Verified Partner Reference Card within the optional manual supplement directory when the practitioner browses Vitamin D during Dietary Assessment review or Meal Plan design, displaying the official package image in the client report and Companion App upon manual selection, alongside the Knowledge Center course and Daily Knowledge Card.',
      triggersAr: [
        'الظهور ضمن تصنيف فيتامين (د) في الدليل اليدوي الاختياري للأخصائي',
        'صورة العبوة والتركيز في تقرير المراجع وتطبيق رفيق مرشد عند الاختيار اليدوي',
        'مثال تطبيقي عملي داخل مسار فيتامين (د) في مركز المعرفة + بطاقة المعرفة اليومية'
      ],
      triggersEn: [
        'Verified Reference Card Listing Under Vitamin D in the Manual Directory',
        'Official Package Image in Client Reports Upon Manual Practitioner Selection',
        'Practical Example in Knowledge Center Track + Daily Knowledge Card'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'mg-gly': {
      code: 'CAT-MG-GLY',
      categoryAr: 'حِصّة المعادن الكبرى والأملاح العضوية المخلبية',
      categoryEn: 'Essential Macrominerals & Organic Chelates Slot',
      nameAr: 'ماغنيسيوم بيسجلايسينات وثريونات (Magnesium Bisglycinate & Threonate)',
      nameEn: 'Magnesium Bisglycinate & L-Threonate Chelate',
      detailsAr: 'إبراز منتجات الماغنيسيوم المخلبي بكافة أشكالها وتراكيزها (كبسولات، مسحوق، فوار) كبطاقة مرجعية موثقة داخل تصنيف الماغنيسيوم في الدليل اليدوي الاختياري عند تصفحه من قِبل الأخصائي، مع توثيق جدول الحقائق الغذائية ونوع الملح الجزيئي وشرحه كمثال تطبيقي في مركز المعرفة.',
      detailsEn: 'Showcases your chelated magnesium formulations (capsules, powder, effervescent) inside the Verified Partner Reference Card under the Magnesium category of the optional manual supplement directory, complete with Supplement Facts verification and practical integration in the Knowledge Center track.',
      triggersAr: [
        'الإدراج المرجعي الموثق في تصنيف الماغنيسيوم بالدليل اليدوي الاختياري',
        'توثيق الصيغة المخلبية وجدول الحقائق الغذائية للمراجعة التطوعية',
        'شرح الصيغة الجزيئية في المسار التعليمي وبطاقة المعرفة اليومية'
      ],
      triggersEn: [
        'Verified Reference Listing Under Magnesium in Manual Directory',
        'Chelated Supplement Facts Reference for Voluntary Practitioner Review',
        'Chelated Molecular Form Spotlight in Knowledge Center & Daily Card'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'fe-chel': {
      code: 'CAT-FE-CHEL',
      categoryAr: 'حِصّة العناصر المعدنية الدقيقة والأملاح المخلبية اللطيفة',
      categoryEn: 'Trace Minerals & Gentle Chelated Salts Slot',
      nameAr: 'حديد مخلبي لطيف (Ferrous Bisglycinate Chelate)',
      nameEn: 'Gentle Chelated Iron (Ferrous Bisglycinate)',
      detailsAr: 'إدراج أصناف الحديد المخلبي المرخصة (كبسولات، قطرات، شراب، أكياس) ضمن بطاقة المرجع الموثقة في تصنيف الحديد بالدليل اليدوي الاختياري للمكملات، مع عرض صورة العبوة الرسمية للمراجع عند اختيار الأخصائي لها يدوياً لتفادي التشتت عند الشراء.',
      detailsEn: 'Lists your licensed chelated iron line (capsules, drops, liquid, sachets) inside the Verified Partner Reference Card under the Iron category of the manual directory, displaying the official package image in client reports upon manual specialist selection for clear pharmacy identification.',
      triggersAr: [
        'الحضور المرجعي الموثق في تصنيف الحديد بالدليل اليدوي الاختياري',
        'عرض صورة العبوة والتركيز في التقرير عند الاختيار اليدوي للأخصائي',
        'توضيح الخصائص التغذوية للأملاح المخلبية في المسار التعليمي التطبيقي'
      ],
      triggersEn: [
        'Verified Reference Card Listing Under Iron in Manual Directory',
        'Package Image Clarity in Client Reports Upon Manual Selection',
        'Chelated Iron Nutrition & Food Science Examples in Knowledge Track'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'omg-3': {
      code: 'CAT-OMG3',
      categoryAr: 'حِصّة الأحماض الدهنية الأساسية والدهون الغذائية النقية',
      categoryEn: 'Essential Fatty Acids & Purified Dietary Lipids Slot',
      nameAr: 'أوميغا 3 فائق النقاوة (Omega-3 Triglyceride EPA/DHA)',
      nameEn: 'Ultra-Purified Omega-3 (rTG EPA/DHA)',
      detailsAr: 'إدراج مكملات الأوميغا 3 المرخصة بكافة تراكيز EPA/DHA ضمن بطاقة المرجع الموثقة في الدليل اليدوي الاختياري للأخصائي عند تصفحه لتصنيف الأحماض الدهنية الأساسية، مع توثيق شهادات النقاوة (COA) في بطاقة المواصفات الغذائية المرجعية.',
      detailsEn: 'Presents your licensed Omega-3 formulations across all EPA/DHA ratios inside the Verified Partner Reference Card when practitioners browse the Essential Fatty Acids directory category manually, backed by verified COA purity data.',
      triggersAr: [
        'البطاقة المرجعية الموثقة في تصنيف أوميغا 3 بالدليل اليدوي الاختياري',
        'توثيق شهادات النقاوة ونسب EPA/DHA لمراجعة الأخصائي اليدوية',
        'شرح نسب EPA/DHA ونقاوة الزيوت كمثال تطبيقي في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Card Listing Under Omega-3 in Manual Directory',
        'Verified COA Purity & EPA/DHA Specs for Practitioner Review',
        'EPA/DHA Ratio & Purity Practical Example in Knowledge Center'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'probio': {
      code: 'CAT-PROBIO',
      categoryAr: 'حِصّة المزارع الحيوية النافعة والتوازن التغذوي',
      categoryEn: 'Live Friendly Cultures & Dietary Balance Slot',
      nameAr: 'بروبيوتيك وسينبيوتيك متعدد السلالات (Multi-Strain Probiotics & Synbiotics)',
      nameEn: 'Advanced Multi-Strain Probiotics & Synbiotics',
      detailsAr: 'إتاحة مستحضرات البروبيوتيك والسينبيوتيك المرخصة ضمن بطاقة المرجع الموثقة في الدليل اليدوي الاختياري عند تصفح الأخصائي لها، مع توثيق السلالات وعدد الوحدات الحية (CFU) وتقنية الكبسولة في بطاقة الحقائق الغذائية ومسار مركز المعرفة.',
      detailsEn: 'Showcases your licensed probiotic and synbiotic formulations inside the Verified Partner Reference Card when practitioners manually browse the manual supplement directory, detailing strain taxonomy, CFU counts, and capsule stability in the Supplement Facts card and Knowledge Center course.',
      triggersAr: [
        'الإدراج المرجعي الموثق في تصنيف البروبيوتيك بالدليل اليدوي الاختياري',
        'توثيق رموز السلالات وعدد الوحدات الحية في بطاقة المواصفات',
        'توثيق رموز السلالات وعدد CFU في المسار التعليمي وبطاقة المعرفة اليومية'
      ],
      triggersEn: [
        'Verified Reference Listing Under Probiotics in Manual Directory',
        'Documented Live Culture Strains & CFU Specs for Voluntary Selection',
        'Strain Taxonomy & CFU Stability Module in Knowledge Center Track'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'coq10': {
      code: 'CAT-COQ10',
      categoryAr: 'حِصّة المركبات المساعدة الغذائية واليوبيكوينول النشط',
      categoryEn: 'Nutritional Co-Factors & Active Ubiquinol Slot',
      nameAr: 'مساعد الإنزيم كيو 10 ويوبيكوينول (CoQ10 / Active Ubiquinol)',
      nameEn: 'Coenzyme Q10 & Bioactive Ubiquinol',
      detailsAr: 'عرض مكملات CoQ10 واليوبيكوينول المرخصة بمختلف تراكيزها ضمن بطاقة المرجع الموثقة في الدليل اليدوي الاختياري للأخصائي، مع توثيق مقارنة الصيغ الجزيئية في مركز المعرفة.',
      detailsEn: 'Displays your licensed CoQ10 and Ubiquinol strengths inside the Verified Partner Reference Card within the optional manual supplement directory, supported by molecular bioavailability comparisons in the Knowledge Center.',
      triggersAr: [
        'الظهور المرجعي الموثق في تصنيف CoQ10 بالدليل اليدوي الاختياري',
        'إدراج التراكيز المرخصة ومواصفات العبوة للاختيار اليدوي',
        'مقارنة الصيغ الجزيئية للإنزيم المساعد في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Card Under CoQ10 in Manual Supplement Directory',
        'Licensed Strengths & Packaging Reference for Manual Selection',
        'Ubiquinol vs. Ubiquinone Science Module in Knowledge Center'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'b-comp': {
      code: 'CAT-BCOMP',
      categoryAr: 'حِصّة الفيتامينات الذائبة في الماء والصيغ الميثيلية النشطة',
      categoryEn: 'Water-Soluble Vitamins & Active Methylated B Slot',
      nameAr: 'مجموعة فيتامينات ب النشطة الميثيلية (Active Methylated B-Complex)',
      nameEn: 'Methylated Active Coenzyme B-Complex',
      detailsAr: 'عرض مجموعة فيتامينات (ب) النشطة (Methylcobalamin, 5-MTHF, P-5-P) ضمن بطاقة المرجع الموثقة في تصنيف فيتامينات (ب) بالدليل اليدوي الاختياري لتسهيل اطلاع الأخصائي على التراكيز الصيدلانية المرخصة، مع شرح الصيغ النشطة في مركز المعرفة.',
      detailsEn: 'Presents your active methylated B-Complex line (Methylcobalamin, 5-MTHF, P-5-P) inside the Verified Partner Reference Card under B-Vitamins in the manual directory for voluntary specialist review, paired with active coenzyme education in the Knowledge Center.',
      triggersAr: [
        'الإدراج المرجعي الموثق في تصنيف فيتامينات (ب) بالدليل اليدوي الاختياري',
        'استعراض الصيغ الميثيلية والتراكيز في بطاقة الحقائق الغذائية',
        'توثيق الفروق الغذائية للصيغ الميثيلية النشطة في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Card Under B-Vitamins in Manual Directory',
        'Methylated Supplement Facts Panel for Voluntary Specialist Review',
        'Active Methylated Coenzyme Examples in Knowledge Center Track'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'col-mar': {
      code: 'CAT-COL-MAR',
      categoryAr: 'حِصّة ببتيدات البروتين البنائي والأحماض الأمينية التخصصية',
      categoryEn: 'Structural Protein Peptides & Specialized Amino Acids Slot',
      nameAr: 'ببتيدات الكولاجين البحري المتحلل (Hydrolyzed Marine Collagen Peptides)',
      nameEn: 'Pure Hydrolyzed Marine Collagen Peptides (Type I & III)',
      detailsAr: 'إتاحة منتجات ببتيدات الكولاجين المتحلل والعوامل الغذائية المساعدة (مثل فيتامين ج) كبطاقة مرجعية موثقة داخل الدليل اليدوي الاختياري للمكملات، مع توثيق الوزن الجزيئي (Dalton) في بطاقة المواصفات.',
      detailsEn: 'Displays your hydrolyzed collagen peptides and nutritional co-factors as a Verified Partner Reference Card inside the optional manual directory, documenting Dalton molecular weight in the Supplement Facts card.',
      triggersAr: [
        'الظهور المرجعي الموثق في تصنيف الكولاجين بالدليل اليدوي الاختياري',
        'عرض مواصفات الببتيدات المتحللة عند تصفح الأخصائي للدليل',
        'شرح الوزن الجزيئي للببتيدات المتحللة وحقائقها الغذائية في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Listing Under Collagen in Manual Directory',
        'Hydrolyzed Peptide Specs Available for Manual Plan Documentation',
        'Peptide Molecular Weight & Supplement Facts Module in Knowledge Center'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'prot-clin': {
      code: 'CAT-PROT-CLIN',
      categoryAr: 'حِصّة مكملات الماكرو البروتيني والأحماض الأمينية الأساسية (EAA)',
      categoryEn: 'Macronutrient Protein & Essential Amino Acids (EAA) Slot',
      nameAr: 'بروتين مصل اللبن المعزول والبروتين النباتي النقي (Whey Isolate & Plant Matrix)',
      nameEn: 'Ultra-Filtered Whey Isolate & Pure Plant Protein Matrix',
      detailsAr: 'عرض مساحيق ومشروبات البروتين المعزول والنباتي المرخصة ضمن بطاقة المرجع الموثقة في الدليل اليدوي الاختياري للأخصائي، مع توثيق جدول الأحماض الأمينية (EAA/BCAA) وملصق خلو السكر واللاكتوز المعتمد من المصنّع.',
      detailsEn: 'Displays your licensed Whey Isolate and Plant Protein powders/drinks inside the Verified Partner Reference Card in the optional manual directory, complete with EAA/BCAA profiles and manufacturer-declared lactose/sugar-free label specs.',
      triggersAr: [
        'الإدراج المرجعي الموثق في تصنيف البروتينات بالدليل اليدوي الاختياري',
        'بطاقة مواصفات الأحماض الأمينية للاختيار اليدوي في الجداول الغذائية',
        'شرح حسابات البروتين الصافي وجدول الأحماض الأمينية في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Card Under Proteins in the Manual Directory',
        'EAA/BCAA Label Specs Available for Manual Specialist Documentation',
        'Net Protein & Amino Acid Profile Examples in Knowledge Center Track'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'fbr-pre': {
      code: 'CAT-FBR-PRE',
      categoryAr: 'حِصّة الألياف الغذائية الذائبة وتكميل الحصة اليومية للألياف',
      categoryEn: 'Soluble Dietary Fibers & Daily Fiber Quota Slot',
      nameAr: 'ألياف البريبايوتك الذائبة وصمغ الأكاسيا (Soluble Prebiotic Fiber & Acacia Gum)',
      nameEn: 'Soluble Prebiotic Fiber, Inulin & Acacia Fiber Matrix',
      detailsAr: 'إدراج مكملات الألياف الذائبة المرخصة كبطاقة مرجعية موثقة داخل الدليل اليدوي الاختياري عند تصفح الأخصائي لتصنيف الألياف الغذائية، مع عرض صورة العبوة وطريقة الاستخدام في تقرير المراجع عند اختيار الأخصائي لها يدوياً.',
      detailsEn: 'Lists your licensed soluble fiber supplements as a Verified Partner Reference Card within the optional manual supplement directory, displaying package visuals and label usage notes in the client report when selected manually by the practitioner.',
      triggersAr: [
        'البطاقة المرجعية الموثقة في تصنيف الألياف بالدليل اليدوي الاختياري',
        'عرض صورة العبوة وطريقة التحضير عند الاختيار اليدوي للأخصائي',
        'شرح خصائص الألياف الذائبة وغير الذائبة كمثال تطبيقي في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Card Under Fibers in the Manual Directory',
        'Package Visuals & Label Notes in Reports Upon Manual Selection',
        'Soluble vs. Insoluble Fiber Practical Module in Knowledge Center'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'zn-carn': {
      code: 'CAT-ZN-CARN',
      categoryAr: 'حِصّة عنصر الزنك المخلبي وتوازن المعادن النادرة',
      categoryEn: 'Chelated Zinc & Trace Mineral Balance Slot',
      nameAr: 'زنك مخلبي وبيكولينات متوازن (Chelated Zinc & Picolinate Balance)',
      nameEn: 'Chelated Zinc Complex & Picolinate Balance',
      detailsAr: 'عرض مكملات الزنك المرخصة بكافة تراكيزها ضمن بطاقة المرجع الموثقة في الدليل اليدوي الاختياري للمكملات لتسهيل مراجعة الأخصائي للنسب المعدنية المتوازنة في بطاقة الحقائق الغذائية عند اختيارها يدوياً.',
      detailsEn: 'Displays your licensed Zinc formulations across all strengths inside the Verified Partner Reference Card in the optional manual directory for voluntary specialist review alongside Supplement Facts mineral ratios.',
      triggersAr: [
        'الإدراج المرجعي الموثق في تصنيف الزنك بالدليل اليدوي الاختياري',
        'توثيق النسب المعدنية المتوازنة في بطاقة الحقائق الغذائية',
        'شرح التوازن الغذائي بين الزنك والنحاس في المسار التعليمي وبطاقة المعرفة'
      ],
      triggersEn: [
        'Verified Reference Listing Under Zinc in Manual Directory',
        'Mineral Ratio Documentation in Supplement Facts Reference Card',
        'Zinc-to-Copper Dietary Balance Module in Knowledge Center Track'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'berb-phy': {
      code: 'CAT-BERB-PHY',
      categoryAr: 'حِصّة المستخلصات النباتية المعيارية وتقنيات الفايتوسوم الغذائية',
      categoryEn: 'Standardized Nutritional Botanicals & Phytosome Slot',
      nameAr: 'مستخلصات نباتية معيارية بتقنية الفايتوسوم (Standardized Phytosome Botanicals)',
      nameEn: 'Bio-Enhanced Phytosome & Standardized Nutritional Botanicals',
      detailsAr: 'إتاحة المستخلصات النباتية الغذائية المرخصة والمطورة بتقنية الفايتوسوم ضمن فهرس المكملات الاسترشادي الاختياري عند تصفح الأخصائي يدوياً أثناء تصميم البرامج الغذائية، مع توثيق نسب المعايرة النباتية وحجم الحصة اليومية وحدود الأمان (UL) في بطاقة المواصفات الغذائية ومسار مركز المعرفة.',
      detailsEn: 'Showcases your licensed, standardized phytosome botanical supplements within the manual dietitian directory during voluntary browsing and meal plan documentation, detailing botanical standardization ratios, serving sizes, and upper safety limits in the Supplement Facts card and Knowledge Center.',
      triggersAr: [
        'الإدراج المرجعي للمستخلصات النباتية المعيارية المرخصة في الدليل اليدوي',
        'توثيق تقنية الفايتوسوم وبيانات المعايرة في بطاقة الحقائق الغذائية',
        'شرح معايير نقاء المستخلصات النباتية وحدود الحصة اليومية في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Card Listing for Licensed Botanicals in Manual Directory',
        'Phytosome Delivery & Supplement Facts Documentation for Dietitians',
        'Botanical Standardization & Daily Serving Limits in Knowledge Center'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'jnt-mat': {
      code: 'CAT-JNT-MAT',
      categoryAr: 'حِصّة المغذيات البنائية والتغذية الرياضية والحركية',
      categoryEn: 'Structural Nutrients & Active Sports Nutrition Slot',
      nameAr: 'مصفوفة المغذيات البنائية (Glucosamine, Chondroitin & MSM Nutritional Matrix)',
      nameEn: 'Structural Nutrient Matrix (Glucosamine, Chondroitin & MSM)',
      detailsAr: 'عرض مكملات المغذيات البنائية المرخصة (جلوكوزامين، كوندرويتين، MSM، وفيتامين ج المساند) كبطاقة مرجعية موثقة داخل الدليل اليدوي الاختياري للأخصائي عند التوثيق التغذوي، مع عرض مصادر المواد الخام وإفصاحات خلو مسببات الحساسية الواردة على عبوة الشركة المصنعة (مثل خلو مشتقات القشريات) كمعلومات بطاقة مرجعية دون أي فحص آلي للحساسية.',
      detailsEn: 'Presents your licensed structural nutrient supplements (Glucosamine, Chondroitin, MSM, and co-factor Vitamin C) inside the optional manual directory reference card during voluntary practitioner review, displaying manufacturer-stated raw material origin and allergen-free label disclosures (e.g., shellfish-free) for reference only with zero automated allergy checking.',
      triggersAr: [
        'الإدراج المرجعي في تصنيف المغذيات البنائية بالدليل اليدوي الاختياري',
        'نقل إفصاحات مصادر المواد الخام وخلو مسببات الحساسية من بطاقة المصنّع',
        'شرح خصائص المركبات البنائية في مسار مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Listing Under Structural Nutrients in Manual Directory',
        'Manufacturer Raw Material Origin & Allergen Label Disclosures (Reference Only)',
        'Vitamin C Co-Factor & Structural Nutrition Module in Knowledge Center'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    },
    'mat-pren': {
      code: 'CAT-MAT-PREN',
      categoryAr: 'حِصّة الفيتامينات والمعادن الشاملة لمراحل الاحتياج الغذائي المرتفع',
      categoryEn: 'Comprehensive Multi-Micronutrients for Elevated RDA Stages Slot',
      nameAr: 'مكمل الفيتامينات والمعادن المتكامل (Comprehensive Multi-Micronutrient Formula)',
      nameEn: 'Comprehensive Multi-Vitamin & Chelated Mineral Formula',
      detailsAr: 'عرض مكمل الفيتامينات والمعادن المتكامل المرخص كبطاقة مرجعية موثقة داخل الدليل اليدوي الاختياري عند تصفح الأخصائي لتصنيف الفيتامينات المتعددة (الفولات النشط، الحديد، الكولين، اليود، الزنك، وفيتامين د) مع إظهار جدول التراكيز الكامل لاختيار الأخصائي التطوعي.',
      detailsEn: 'Displays your licensed comprehensive multi-micronutrient formula inside the Verified Partner Reference Card under the Multivitamin manual directory category (Active Folate, Iron, Choline, Iodine, Zinc, Vitamin D) with full label specs for manual practitioner review.',
      triggersAr: [
        'الحضور المرجعي الموثق في تصنيف الفيتامينات المتعددة بالدليل اليدوي الاختياري',
        'استعراض جدول المغذيات الدقيقة الكامل والحدود الآمنة في البطاقة المرجعية',
        'شرح جداول توازن الفيتامينات والمعادن والحدود الآمنة (UL) في مركز المعرفة'
      ],
      triggersEn: [
        'Verified Reference Listing Under Multivitamins in Manual Directory',
        'Complete Micronutrient Label Panel for Voluntary Plan Documentation',
        'Micronutrient Synergy & Safe Upper Limits (UL) in Knowledge Center'
      ],
      slaAr: '100% من عيادات الدولة',
      slaEn: '100% Country Clinics'
    }
  };

  const isRtl = document.documentElement.getAttribute('dir') === 'rtl';

  const updateSlotView = () => {
    if (!countrySelect || !compoundSelect) return;

    const selectedCountry = countrySelect.value;
    const countryOption = countrySelect.options[countrySelect.selectedIndex];
    const isAllMarkets = !selectedCountry || selectedCountry === 'all';
    const countryText = isAllMarkets
      ? (isRtl ? 'الكل (نطاق عام)' : 'All (General Scope)')
      : (countryOption ? countryOption.text.replace(/^[^\w\s\u0600-\u06FF]+/, '').trim() : selectedCountry);
    const selectedCompoundKey = compoundSelect.value;
    const compound = compoundData[selectedCompoundKey] || compoundData['d3'];

    if (slotTitleEl) {
      slotTitleEl.textContent = isRtl ? compound.nameAr : compound.nameEn;
    }
    if (slotCodeEl) {
      slotCodeEl.textContent = `${compound.code} • ${countryText}`;
    }
    if (slotCategoryBadgeEl) {
      slotCategoryBadgeEl.textContent = isRtl ? compound.categoryAr : compound.categoryEn;
    }
    if (slotDetailsEl) {
      slotDetailsEl.textContent = isRtl ? compound.detailsAr : compound.detailsEn;
    }
    if (slotSlaImpressionsEl) {
      if (isAllMarkets) {
        slotSlaImpressionsEl.textContent = isRtl ? '100% من عيادات الإقليم المعتمد' : '100% of Approved Territory Clinics';
      } else {
        slotSlaImpressionsEl.textContent = isRtl ? compound.slaAr : compound.slaEn;
      }
    }

    if (slotTriggersEl) {
      const triggers = isRtl ? compound.triggersAr : compound.triggersEn;
      slotTriggersEl.innerHTML = triggers.map(trig => `<span class="b2b-trigger-chip">🎯 ${trig}</span>`).join('');
    }

    // مزامنة الحقول في نموذج الحجز التنفيذي تلقائياً
    const formCountry = document.getElementById('formCountry');
    const formCompound = document.getElementById('formCompound');
    if (formCountry) {
      formCountry.value = isAllMarkets ? '' : selectedCountry;
    }
    if (formCompound) formCompound.value = selectedCompoundKey;

    if (slotDirectWaBtn) {
      const waMsg = isRtl ?
        `طلب إبداء اهتمام وتقديم مبدئي للمراجعة بخصوص حِصّة المُرَكَّب [${compound.nameAr} (${compound.code})] لعام 2027 في نطاق [${countryText}] — منظومة مُرشِد (FES HealthTech).` :
        `Initial Expression of Interest & Application for 2027 Compound Slot: [${compound.nameEn} (${compound.code})] in [${countryText}] — Murshid Platform (FES HealthTech).`;
      slotDirectWaBtn.href = `https://wa.me/447716301961?text=${encodeURIComponent(waMsg)}`;
    }
  };

  // ربط أزرار أعلام الدول العشر التفاعلية
  countryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cCode = pill.getAttribute('data-country');
      if (!cCode || !countrySelect) return;

      countryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      countrySelect.value = cCode;
      updateSlotView();
    });
  });

  // ربط تبويبات تصفية فئات المركبات
  catFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filterGroup = tab.getAttribute('data-filter') || 'all';
      catFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      moleculeCards.forEach(card => {
        const cardGroup = card.getAttribute('data-group');
        if (filterGroup === 'all' || cardGroup === filterGroup) {
          card.classList.remove('filtered-out');
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });

  // ربط البطاقات الجزيئية الـ 14 التفاعلية
  moleculeCards.forEach(card => {
    card.addEventListener('click', () => {
      const compKey = card.getAttribute('data-compound');
      if (!compKey || !compoundSelect) return;

      moleculeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      compoundSelect.value = compKey;
      updateSlotView();

      if (window.innerWidth <= 992 && slotDossierCard) {
        slotDossierCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  if (countrySelect && compoundSelect) {
    countrySelect.addEventListener('change', updateSlotView);
    compoundSelect.addEventListener('change', updateSlotView);
    updateSlotView();
  }

  if (slotReserveBtn) {
    slotReserveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const bookingSection = document.getElementById('bookingSection');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
      const formCountry = document.getElementById('formCountry');
      const formCompound = document.getElementById('formCompound');
      if (formCountry && countrySelect) {
        formCountry.value = (countrySelect.value === 'all') ? '' : countrySelect.value;
      }
      if (formCompound && compoundSelect) formCompound.value = compoundSelect.value;
    });
  }


  // ═══════════════════════════════════════════════════════════════
  // 3. معالجة وتوجيه نموذج حجز الشراكة (Interactive Red Validation & Dispatch)
  // ═══════════════════════════════════════════════════════════════
  const bookingForm = document.getElementById('b2bBookingForm');
  const formSuccess = document.getElementById('b2bFormSuccess');
  const formSubmitBtn = document.getElementById('b2bSubmitBtn');
  const formErrorNotice = document.getElementById('b2bFormErrorNotice');
  const formErrorSubtext = document.getElementById('b2bFormErrorSubtext');

  if (bookingForm) {
    const requiredFieldIds = ['formCompany', 'formCompound', 'formName', 'formTitle', 'formEmail', 'formPhone'];

    const validateSingleField = (inputEl, showValidState = false) => {
      if (!inputEl) return true;
      const group = inputEl.closest('.b2b-form-group');
      const val = (inputEl.value || '').trim();
      let isValid = val.length > 0;

      if (inputEl.id === 'formEmail') {
        isValid = val.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      } else if (inputEl.id === 'formPhone') {
        isValid = val.replace(/\s+/g, '').length >= 6;
      }

      if (group) {
        if (!isValid) {
          group.classList.remove('is-valid');
          group.classList.remove('is-invalid');
          void group.offsetWidth; // re-trigger shake animation
          group.classList.add('is-invalid');
          inputEl.setAttribute('aria-invalid', 'true');
        } else {
          group.classList.remove('is-invalid');
          if (showValidState) {
            group.classList.add('is-valid');
          }
          inputEl.removeAttribute('aria-invalid');
        }
      }
      return isValid;
    };

    const checkAndHideBannerIfAllValid = () => {
      if (!formErrorNotice || formErrorNotice.style.display === 'none') return;
      const anyInvalid = requiredFieldIds.some(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const val = (el.value || '').trim();
        if (id === 'formEmail') return !(val.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
        if (id === 'formPhone') return val.replace(/\s+/g, '').length < 6;
        return val.length === 0;
      });
      if (!anyInvalid) {
        formErrorNotice.style.display = 'none';
      }
    };

    requiredFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const group = el.closest('.b2b-form-group');
        if (group && group.classList.contains('is-invalid')) {
          validateSingleField(el, true);
        }
        checkAndHideBannerIfAllValid();
      });
      el.addEventListener('change', () => {
        validateSingleField(el, true);
        checkAndHideBannerIfAllValid();
      });
      el.addEventListener('blur', () => {
        if ((el.value || '').trim().length > 0) {
          validateSingleField(el, true);
        }
      });
    });

    // Ensure EmailJS is properly initialized with valid Public Key
    if (typeof emailjs !== 'undefined') {
      try {
        emailjs.init({ publicKey: "GRhnKzi6GMcVvCjb3" });
      } catch (e) {
        console.warn("EmailJS inline init:", e);
      }
    }

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const invalidElements = [];
      requiredFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && !validateSingleField(el, true)) {
          invalidElements.push(el);
        }
      });

      if (invalidElements.length > 0) {
        if (formErrorNotice) {
          formErrorNotice.style.display = 'flex';
          formErrorNotice.style.animation = 'none';
          void formErrorNotice.offsetWidth;
          formErrorNotice.style.animation = '';
        }
        if (formErrorSubtext) {
          formErrorSubtext.textContent = isRtl
            ? `يرجى تعبئة الحقول الإلزامية المحددة باللون الأحمر أعلاه (يتبقى ${invalidElements.length} حقول مطلوبة) لإتمام طلب الاعتماد العلمي.`
            : `Please complete the ${invalidElements.length} required field(s) highlighted in red above to submit your scientific sponsorship application.`;
        }
        return;
      }

      if (formErrorNotice) {
        formErrorNotice.style.display = 'none';
      }

      const company = (document.getElementById('formCompany')?.value || '').trim();
      const countryEl = document.getElementById('formCountry');
      const countryVal = countryEl ? countryEl.value.trim() : '';
      const country = (countryEl && countryVal) ? countryEl.options[countryEl.selectedIndex].text : (isRtl ? 'الكل (غير محدد)' : 'All (Unspecified)');
      const compoundEl = document.getElementById('formCompound');
      const compound = compoundEl ? compoundEl.options[compoundEl.selectedIndex].text : '';
      const name = (document.getElementById('formName')?.value || '').trim();
      const title = (document.getElementById('formTitle')?.value || '').trim();
      const email = (document.getElementById('formEmail')?.value || '').trim();
      const phone = (document.getElementById('formPhone')?.value || '').trim();
      const notes = (document.getElementById('formNotes')?.value || '').trim();

      const submitBtnOriginalHTML = formSubmitBtn ? formSubmitBtn.innerHTML : '';

      if (formSubmitBtn) {
        formSubmitBtn.disabled = true;
        formSubmitBtn.innerHTML = isRtl
          ? '<span>⚡ جاري إرسال طلب إبداء الاهتمام للمراجعة...</span>'
          : '<span>⚡ Submitting Initial Expression of Interest...</span>';
      }

      const structuredMsgBody = isRtl ?
        `═══════════════════════════════════════════════════════════\n` +
        `📋 طلب إبداء اهتمام ورعاية حصة مركب تغذوي لعام 2027\n` +
        `═══════════════════════════════════════════════════════════\n\n` +
        `🏢 بيانات الشركة ونطاق السوق:\n` +
        `• اسم الشركة / الوكيل المعتمد: ${company}\n` +
        `• الدولة أو السوق المستهدف: ${country}\n` +
        `• حصة المُرَكَّب التغذوي المطلوب: ${compound}\n\n` +
        `👤 بيانات المسؤول التنفيذي وقنوات التواصل:\n` +
        `• اسم المفوض التنفيذي: ${name}\n` +
        `• الصفة المهنية / المسمى الوظيفي: ${title}\n` +
        `• البريد الإلكتروني المؤسسي: ${email}\n` +
        `• رقم الهاتف الجوال / واتساب المباشر: ${phone}\n\n` +
        `📝 ملاحظات إضافية وتفاصيل التسجيل الرقابي والتراكيز:\n` +
        `${notes ? notes : 'لم يتم إدراج ملاحظات إضافية.'}\n\n` +
        `⚖️ الإقرار والتصريح التنظيمي:\n` +
        `تم إرسال هذا الطلب كطلب إبداء اهتمام مبدئي غير ملزم لمراجعة الأهلية والتراخيص لعام 2027 عبر البوابة الرسمية لتطبيق مُرشِد.` :
        `═══════════════════════════════════════════════════════════\n` +
        `📋 2027 Compound Slot Initial Expression of Interest\n` +
        `═══════════════════════════════════════════════════════════\n\n` +
        `🏢 Company & Market Territory:\n` +
        `• Company / Licensed Distributor: ${company}\n` +
        `• Target Country / Market: ${country}\n` +
        `• Requested Compound Slot: ${compound}\n\n` +
        `👤 Executive Contact & Channels:\n` +
        `• Authorized Executive: ${name}\n` +
        `• Job Title / Capacity: ${title}\n` +
        `• Corporate Email: ${email}\n` +
        `• Direct Phone / WhatsApp: ${phone}\n\n` +
        `📝 Regulatory Registration & Product Notes:\n` +
        `${notes ? notes : 'No additional notes provided.'}\n\n` +
        `⚖️ Regulatory Notice:\n` +
        `Submitted as a non-binding initial expression of interest for 2027 slot eligibility review via Murshid Ecosystem portal.`;

      // Parameters harmonized with the shared EmailJS template (template_kjhcofd)
      const templateParams = {
        templateTitle: isRtl ? '🔬 طلب إبداء اهتمام برعاية حصة مركب تغذوي 2027' : '🔬 2027 Compound Slot Application',
        fullName: `${name} — ${title}`,
        organization: `${company} (${country})`,
        email: email,
        phone: phone,
        subject: isRtl
          ? `[طلب شراكة 2027] ${compound} | ${company}`
          : `[2027 Partnership Application] ${compound} | ${company}`,
        message: structuredMsgBody
      };

      const onSubmissionSuccess = () => {
        if (formSubmitBtn) {
          formSubmitBtn.disabled = false;
          formSubmitBtn.innerHTML = submitBtnOriginalHTML;
        }
        bookingForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
          const waBtn = document.getElementById('directWhatsAppLink');
          if (waBtn) {
            waBtn.href = `https://wa.me/447716301961?text=${encodeURIComponent(structuredMsgBody)}`;
          }
          const tgBtn = document.getElementById('directTelegramLink');
          if (tgBtn) {
            tgBtn.href = 'https://t.me/+447716301961';
          }
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      const onSubmissionFailure = (error) => {
        console.error('EmailJS Send Error:', error);
        if (formSubmitBtn) {
          formSubmitBtn.disabled = false;
          formSubmitBtn.innerHTML = submitBtnOriginalHTML;
        }
        if (formErrorNotice) {
          formErrorNotice.style.display = 'flex';
        }
        if (formErrorSubtext) {
          formErrorSubtext.textContent = isRtl
            ? 'عذراً، حدث خطأ أثناء إرسال طلبك عبر الخادم. يرجى التحقق من اتصال الإنترنت أو المحاولة مجدداً أو مراسلتنا مباشرة عبر واتساب.'
            : 'Sorry, an error occurred while transmitting your application. Please check your connection or contact us directly via WhatsApp.';
        }
        formErrorNotice?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      if (typeof emailjs !== 'undefined') {
        emailjs.send('service_2gtw1uc', 'template_kjhcofd', templateParams)
          .then(() => {
            onSubmissionSuccess();
          })
          .catch((error) => {
            onSubmissionFailure(error);
          });
      } else {
        onSubmissionFailure('EmailJS SDK not loaded');
      }
    });

    const resetBtn = document.getElementById('b2bResetFormBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        bookingForm.reset();
        requiredFieldIds.forEach(id => {
          const el = document.getElementById(id);
          const group = el?.closest('.b2b-form-group');
          if (group) {
            group.classList.remove('is-valid', 'is-invalid');
          }
        });
        if (formErrorNotice) {
          formErrorNotice.style.display = 'none';
        }
        if (formSuccess) {
          formSuccess.style.display = 'none';
        }
        bookingForm.style.display = 'block';
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }


  // ═══════════════════════════════════════════════════════════════
  // 4. التحكم في القائمة الجانبية الفاخرة للهاتف (Luxury Mobile Drawer & Backdrop)
  // ═══════════════════════════════════════════════════════════════
  const hamburgerBtn = document.getElementById('m-hamburger');
  const mobileMenu = document.getElementById('m-mobile-menu');
  const mobileBackdrop = document.getElementById('mMobileBackdrop');
  const mobileCloseBtn = document.getElementById('mMobileCloseBtn');

  const openMobileMenu = () => {
    if (hamburgerBtn) {
      hamburgerBtn.classList.add('open', 'active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    if (mobileMenu) {
      mobileMenu.classList.add('open', 'active');
    }
    if (mobileBackdrop) {
      mobileBackdrop.classList.add('open', 'active');
    }
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove('open', 'active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    if (mobileMenu) {
      mobileMenu.classList.remove('open', 'active');
    }
    if (mobileBackdrop) {
      mobileBackdrop.classList.remove('open', 'active');
    }
    document.body.style.overflow = '';
  };

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = mobileMenu && (mobileMenu.classList.contains('active') || mobileMenu.classList.contains('open'));
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

});
