(function (globalScope) {
    'use strict';

    if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/shared/vendor/pdf.worker.min.js';
    }

    const LOOKUP_PUBLIC_KEY_ENDPOINT = 'https://us-central1-ai-apps-central.cloudfunctions.net/lookupPublicKey';
    const VERIFY_AFFILIATE_ENDPOINT = 'https://us-central1-ai-apps-central.cloudfunctions.net/verifyAffiliateCredential';
    const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    const i18n = {
        en: {
            portalTitleBadge: 'Official Verification Engine',
            tabReport: 'Verify PDF Document',
            tabPartner: 'Affiliate Credentials',
            dropTitle: 'Drag & Drop Your PDF Document Here',
            dropHint: 'Or click to browse and select any report, diet plan, or official invoice exported from Murshid App to verify its authenticity and cryptographic signature.',
            browseBtn: 'Choose File from Device',
            partnerSearchPlaceholder: 'Enter Affiliate ID, Email, Phone, or Name...',
            partnerSearchBtn: 'Verify',
            appCtaText: 'Download Murshid App — The Smart Clinical Dietitian Platform',
            googlePlay: 'Google Play',
            appStore: 'App Store',
            verifyingDoc: 'Verifying Document...',
            verifyingDocHint: 'Extracting cryptographic signature & querying cloud registry',
            verifyingPartner: 'Verifying Credentials...',
            verifyingPartnerHint: 'Querying Murshid Official Credentials Registry',
            docAuthenticTitle: '100% Authentic & Verified Document',
            docAuthenticSub: 'Cryptographic signature validated against Murshid Cloud Registry',
            verifiedIssuerAccount: 'Verified Issuer Identity (Murshid Registry)',
            verifiedHistoricalKeyBadge: 'Verified using a previously registered issuer key',
            verifiedPhoneLabel: 'Verified Official Phone:',
            verifiedPhoneTelegramBadge: 'Verified via Telegram',
            phoneNotVerifiedLabel: 'Phone Number:',
            phoneNotVerifiedBadge: 'Not Verified (Not included in electronic seal)',
            phoneUnverifiedOrRevokedBadge: 'Embedded Phone Not Verified in Murshid Registry',
            specialistProfileData: 'Specialist Profile Data',
            selfDeclaredTag: 'Self-Declared Data',
            specialistName: 'Specialist Name:',
            clinicFacility: 'Clinic / Facility:',
            notSpecified: 'Not specified',
            transparencyNoticeVerifiedPhone: 'Transparency Notice: The issuer\'s official email address, Telegram-verified phone number, and document cryptographic integrity are 100% verified against Murshid Cloud Registry. The specialist\'s display name and clinic name above remain self-declared profile details.',
            transparencyNoticeEmailOnly: 'Transparency Notice: The issuer\'s official email address and document cryptographic integrity are 100% verified. No Telegram-verified phone number is attached or verified for this report header; the specialist\'s display name and clinic name above are self-declared profile details.',
            documentId: 'Document ID:',
            issueDate: 'Issue Date:',
            verifiedPages: 'Verified Pages:',
            pagesUnit: 'Pages',
            verifyAnother: 'Verify Another Document',
            tamperedTitle: 'Warning: Tampered or Invalid Document',
            tamperedSub: 'Cryptographic integrity check failed',
            tamperedDefaultReason: 'The document content or its cryptographic metadata has been altered after issuance, invalidating the digital signature.',
            unsignedTitle: 'Unsigned or Modified Document',
            unsignedSub: 'No official cryptographic seal detected',
            unsignedBody: 'This document does not carry an official Murshid cryptographic seal. This typically occurs if the file was edited or re-saved by an external PDF tool (which stripped its original digital seal), converted from another format, or was not directly exported from the official Murshid platform.',
            checkAnotherFile: 'Check Another File',
            tryAgain: 'Try Again',
            verificationFailed: 'Verification Failed',
            cryptoEngineUnavailableMsg: 'Cryptographic verification library failed to load securely. Verification cannot proceed safely—please refresh the page and try again.',
            pdfEngineUnavailableMsg: 'Structural PDF verification engine is unavailable or blocked. Verification cannot proceed without structural checks—please refresh and try again.',
            pdfStructureVerifyFailedMsg: 'PDF structural inspection failed or the file structure is corrupted, so authenticity cannot be confirmed.',
            unauthorizedAccess: 'Unauthorized Access',
            unauthorizedReportMsg: 'Unauthorized document verification request. Access is restricted to the official Murshid platform.',
            unauthorizedPartnerMsg: 'Access is restricted to the official verified Murshid platform.',
            networkErrorTitle: 'Connection Error',
            networkErrorMsg: 'Unable to reach Murshid verification registry. Please check your internet connection.',
            cloudLookupFailedMsg: 'Unable to connect to Murshid Cloud Registry. Please check your internet connection.',
            emailNotRegisteredMsg: 'The specialist email is not registered in Murshid verified public key registry.',
            forgedSigMsg: 'Invalid cryptographic digital signature: The manifest payload was forged or modified.',
            contentTamperingMsg: 'Document content tampering detected: The visual content, pages, or text of this PDF were modified or re-saved after official issuance.',
            sealStrippedMsg: 'Document modification detected: The cryptographic seal was stripped or incomplete, or edited by an external PDF tool.',
            pageMismatchMsg: (expected, actual) => `Page structure mismatch: Expected ${expected} pages, but file contains ${actual} pages.`,
            visualTamperingMsg: 'Visual tampering detected: The document contains unauthorized drawings, ink marks, or annotations added after official issuance.',
            externalEditorMsg: 'Document modification detected: The file was edited and re-saved by an external PDF editor.',
            unexpectedErrorMsg: 'An unexpected error occurred while processing the PDF file: ',
            decodeErrorMsg: 'Failed to decode embedded cryptographic metadata payload.',
            validPdfAlert: 'Please select a valid PDF file.',
            partnerLandingTitle: 'Verify Affiliate Credentials',
            partnerLandingHint: 'Enter an Affiliate ID, Email, Full Name, or Phone Number to verify official partner registration.',
            verifiedSpecialistBadge: 'Verified Affiliate',
            suspendedBadge: 'Suspended Credential',
            expiredBadge: 'Expired Credential',
            partnerIdLabel: 'Affiliate ID:',
            emailLabel: 'Email:',
            phoneLabel: 'Phone:',
            countryLabel: 'Country:',
            officialEmailDefault: 'Official Registered Email',
            officialContactDefault: 'Official Contact',
            regRepDefault: 'Registered Representative',
            validThru: 'Valid Thru',
            multipleMatchesTitle: 'Multiple Matches Found',
            multipleMatchesHint: 'Multiple affiliates match this name. To ensure identity precision, please search using the exact Affiliate ID or Mobile Phone number.',
            refineSearchBtn: 'Refine Search',
            credentialNotFoundTitle: 'Credential Not Found',
            credentialNotFoundMsg: (query) => `No official records match "${escapeHtml(query)}" in Murshid verified affiliate registry.`,
            switchLangBtn: '🌐 العربية'
        },
        ar: {
            portalTitleBadge: 'بوابة ومحرك التحقق الرسمي',
            tabReport: 'فحص وثيقة PDF',
            tabPartner: 'بيانات واعتماد المنتسب',
            dropTitle: 'اسحب وأفلت وثيقة PDF هنا',
            dropHint: 'أو انقر للاستعراض واختيار أي تقرير طبي، خطة حمية غذائية، أو فاتورة رسمية صادرة من تطبيق مرشد للتحقق من أصالتها وتوقيعها التشفيري.',
            browseBtn: 'اختر ملفاً من جهازك',
            partnerSearchPlaceholder: 'أدخل معرّف المنتسب، البريد، الهاتف، أو الاسم...',
            partnerSearchBtn: 'تحقق الآن',
            appCtaText: 'حمّل تطبيق مرشد — المنصة السريرية الذكية لأخصائيي التغذية',
            googlePlay: 'جوجل بلاي',
            appStore: 'آب ستور',
            verifyingDoc: 'جارٍ فحص الوثيقة تشفيرياً...',
            verifyingDocHint: 'استخراج التوقيع الرقمي ومطابقة السجل السحابي المعتمد',
            verifyingPartner: 'جارٍ التحقق من بيانات الاعتماد...',
            verifyingPartnerHint: 'الاستعلام من السجل المركزي لمنتسبي وشركاء مرشد المعتمدين',
            docAuthenticTitle: 'وثيقة أصلية ومعتمدة 100%',
            docAuthenticSub: 'تم تأكيد صحة التوقيع الرقمي التشفيري ومطابقته بالسجل السحابي لمرشد',
            verifiedIssuerAccount: 'ترويسة التحقق الإلكتروني للمُصدر (سجل مرشد)',
            verifiedHistoricalKeyBadge: 'موقّعة بمفتاح معتمد سابق مسجّل للمُصدر',
            verifiedPhoneLabel: 'رقم الهاتف الموثق:',
            verifiedPhoneTelegramBadge: 'موثق عبر تليجرام',
            phoneNotVerifiedLabel: 'رقم الهاتف:',
            phoneNotVerifiedBadge: 'غير موثق (غير مضاف بترويسة التحقق الإلكتروني)',
            phoneUnverifiedOrRevokedBadge: 'رقم الهاتف المرفق غير موثق أو تغير في سجل مرشد',
            specialistProfileData: 'بيانات ملف الأخصائي المصدر',
            selfDeclaredTag: 'بيانات معلنة ذاتياً',
            specialistName: 'اسم الأخصائي:',
            clinicFacility: 'العيادة / المنشأة:',
            notSpecified: 'غير محدد',
            transparencyNoticeVerifiedPhone: 'إشعار الشفافية: تم التحقق 100% من البريد الإلكتروني للمُصدر، ومن رقم هاتفه الرسمي الموثق عبر تليجرام في سجل مرشد، وسلامة التوقيع التشفيري للوثيقة. الاسم واسم العيادة أعلاه بيانات معلنة ذاتياً.',
            transparencyNoticeEmailOnly: 'إشعار الشفافية: البريد الإلكتروني للمُصدر وسلامة التشفير للوثيقة موثقان بنسبة 100%، ولا يحمل هذا التقرير رقم هاتف موثقاً عبر تليجرام لذا يظهر البريد الإلكتروني فقط في ترويسة التحقق مع توضيح أن رقم الهاتف غير موثق. الاسم واسم العيادة بيانات معلنة ذاتياً.',
            documentId: 'معرّف الوثيقة:',
            issueDate: 'تاريخ الإصدار:',
            verifiedPages: 'الصفحات المعتمدة:',
            pagesUnit: 'صفحات',
            verifyAnother: 'فحص وثيقة أخرى',
            tamperedTitle: 'تحذير: وثيقة معدلة أو تالفة تشفيرياً',
            tamperedSub: 'فشل التحقق من السلامة الرقمية للوثيقة',
            tamperedDefaultReason: 'تم تعديل محتوى الوثيقة أو بياناتها التشفيرية بعد إصدارها الرسمي، مما أدى لإبطال التوقيع الرقمي فوراً.',
            unsignedTitle: 'وثيقة غير موقعة أو معدلة خارجياً',
            unsignedSub: 'لم يتم العثور على الختم التشفيري الرسمي',
            unsignedBody: 'هذه الوثيقة لا تحمل الختم التشفيري الرسمي لمنصة مرشد. يحدث هذا غالباً في حال تم تعديل الملف أو إعادة حفظه عبر برنامج PDF خارجي (قام بإزالة الختم الرقمي)، أو تم تحويله من صيغة أخرى، أو لم يتم تصديره مباشرة من تطبيق مرشد الرسمي.',
            checkAnotherFile: 'فحص ملف آخر',
            tryAgain: 'إعادة المحاولة',
            verificationFailed: 'فشل التحقق',
            cryptoEngineUnavailableMsg: 'تعذر تحميل محرك التشفير بشكل آمن؛ تم إيقاف التحقق لحمايتك من النتائج المضللة. يرجى تحديث الصفحة والمحاولة مجدداً.',
            pdfEngineUnavailableMsg: 'تعذر تحميل محرك فحص بنية ملفات PDF؛ تم إيقاف التحقق لأنه لا يمكن تأكيد خلو الملف من التلاعب البصري دون فحص البنية.',
            pdfStructureVerifyFailedMsg: 'تعذر إتمام الفحص البنيوي لملف PDF أو أن بنية الملف تالفة، لذا لا يمكن اعتماد أصالته.',
            unauthorizedAccess: 'وصول غير مصرح به',
            unauthorizedReportMsg: 'طلب تحقق غير مصرح به. يقتصر التحقق على المنصة الرسمية لمرشد.',
            unauthorizedPartnerMsg: 'يقتصر الاستعلام على المنصة الرسمية المعتمدة لمرشد.',
            networkErrorTitle: 'خطأ في الاتصال',
            networkErrorMsg: 'تعذر الاتصال بسجل التحقق السحابي لمرشد. يرجى التحقق من اتصال الإنترنت لديك.',
            cloudLookupFailedMsg: 'تعذر الاتصال بسجل المفاتيح العامة السحابي لمرشد. يرجى مراجعة اتصال الإنترنت.',
            emailNotRegisteredMsg: 'البريد الإلكتروني للأخصائي غير مسجل في سجل المفاتيح العامة المعتمدة لمرشد.',
            forgedSigMsg: 'توقيع رقمي غير صالح: تم تزوير أو تعديل حمولة البيانات التشفيرية المرفقة.',
            contentTamperingMsg: 'تم اكتشاف تلاعب بمحتوى الوثيقة: تم تعديل النصوص، الرسومات، أو الصفحات بعد إصدار الوثيقة رسمياً.',
            sealStrippedMsg: 'تم اكتشاف تعديل على الوثيقة: تم تجريد الختم التشفيري أو إتلافه أو استخدام محرر PDF خارجي.',
            pageMismatchMsg: (expected, actual) => `عدم تطابق في بنية الصفحات: الوثيقة الأصلية تتكون من ${escapeHtml(expected)} صفحات، لكن الملف يحتوي على ${escapeHtml(actual)} صفحات.`,
            visualTamperingMsg: 'تم اكتشاف تلاعب بصري: تحتوي الوثيقة على رسومات، حبر، أو تعليقات توضيحية غير مصرح بها أضيفت بعد التصدير.',
            externalEditorMsg: 'تم اكتشاف تعديل على الوثيقة: تم تحرير الملف وإعادة حفظه بواسطة محرر PDF خارجي.',
            unexpectedErrorMsg: 'حدث خطأ غير متوقع أثناء معالجة ملف PDF: ',
            decodeErrorMsg: 'فشل فك تشفير حمولة البيانات التشفيرية المضمنة في الوثيقة.',
            validPdfAlert: 'يرجى اختيار ملف PDF صالح.',
            partnerLandingTitle: 'التحقق من بيانات واعتماد المنتسب',
            partnerLandingHint: 'أدخل معرّف المنتسب (ID)، البريد الإلكتروني، الاسم الكامل، أو رقم الهاتف للتحقق من التسجيل الرسمي المعتمد.',
            verifiedSpecialistBadge: 'منتسب معتمد',
            suspendedBadge: 'اعتماد موقوف مؤقتاً',
            expiredBadge: 'اعتماد منتهي الصلاحية',
            partnerIdLabel: 'معرّف المنتسب:',
            emailLabel: 'البريد المعتمد:',
            phoneLabel: 'هاتف التواصل:',
            countryLabel: 'الدولة والمنطقة:',
            officialEmailDefault: 'بريد رسمي مسجل',
            officialContactDefault: 'هاتف تواصل رسمي',
            regRepDefault: 'ممثل معتمد رسمياً',
            validThru: 'صالح حتى تاريخ',
            multipleMatchesTitle: 'تم العثور على عدة نتائج مطابقة',
            multipleMatchesHint: 'يوجد أكثر من منتسب يحمل هذا الاسم. لضمان الدقة وتحديد الهوية بدقة، يرجى البحث باستخدام معرّف المنتسب (ID) أو رقم الهاتف بدقة.',
            refineSearchBtn: 'تخصيص البحث',
            credentialNotFoundTitle: 'بيانات الاعتماد غير موجودة',
            credentialNotFoundMsg: (query) => `لا توجد أي سجلات رسمية مطابقة لـ "${escapeHtml(query)}" في سجل منتسبي مرشد المعتمدين.`,
            switchLangBtn: '🌐 English'
        }
    };

    function detectLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        if (langParam === 'ar' || langParam === 'en') return langParam;
        try {
            const stored = localStorage.getItem('murshid_verify_lang');
            if (stored === 'ar' || stored === 'en') return stored;
        } catch (_) {}
        if (navigator.language && navigator.language.startsWith('ar')) return 'ar';
        return 'en';
    }

    let currentLang = detectLanguage();
    let lastReportState = null;
    let lastPartnerState = null;

    function getReasonText(key, extra) {
        const dict = i18n[currentLang];
        switch (key) {
            case 'DECODE_ERROR': return dict.decodeErrorMsg;
            case 'UNREGISTERED_EMAIL': return dict.emailNotRegisteredMsg;
            case 'INVALID_SIG': return dict.forgedSigMsg;
            case 'DOC_HASH_MISMATCH': return dict.contentTamperingMsg;
            case 'SEAL_STRIPPED': return dict.sealStrippedMsg;
            case 'PAGE_MISMATCH': return dict.pageMismatchMsg(extra?.expected, extra?.actual);
            case 'VISUAL_TAMPERING': return dict.visualTamperingMsg;
            case 'MULTIPLE_EOF': return dict.externalEditorMsg;
            case 'PDF_PARSE_FAILED': return dict.pdfStructureVerifyFailedMsg;
            default: return key ? escapeHtml(key) : dict.tamperedDefaultReason;
        }
    }

    function setLanguage(lang) {
        currentLang = lang;
        try {
            localStorage.setItem('murshid_verify_lang', lang);
        } catch (_) {}
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar' ? 'rtl' : 'ltr');
        document.title = (lang === 'ar' ? 'بوابة ومحرك التحقق الرسمي — منصة مرشد' : 'Official Verification Portal — Murshid Platform');

        const dict = i18n[lang];
        const isAr = (lang === 'ar');

        const homeUrl = isAr ? 'https://murshid.feshealthtech.com/ar/' : 'https://murshid.feshealthtech.com/';
        const backHomeLink = document.getElementById('backHomeLink');
        if (backHomeLink) backHomeLink.href = homeUrl;
        const backHomeText = document.getElementById('backHomeText');
        if (backHomeText) backHomeText.textContent = isAr ? 'الرئيسية' : 'Back to Home';

        const logoLink = document.getElementById('logoLink');
        if (logoLink) logoLink.href = homeUrl;

        const portalBadgeText = document.getElementById('portalBadgeText');
        if (portalBadgeText) portalBadgeText.textContent = dict.portalTitleBadge;

        const tabReportText = document.getElementById('tabReportText');
        if (tabReportText) tabReportText.textContent = dict.tabReport;

        const tabPartnerText = document.getElementById('tabPartnerText');
        if (tabPartnerText) tabPartnerText.textContent = dict.tabPartner;

        const dropTitleText = document.getElementById('dropTitleText');
        if (dropTitleText) dropTitleText.textContent = dict.dropTitle;

        const dropHintText = document.getElementById('dropHintText');
        if (dropHintText) dropHintText.textContent = dict.dropHint;

        const browseBtnText = document.getElementById('browseBtnText');
        if (browseBtnText) browseBtnText.textContent = dict.browseBtn;

        const partnerInput = document.getElementById('partnerInput');
        if (partnerInput) partnerInput.placeholder = dict.partnerSearchPlaceholder;

        const searchBtnText = document.getElementById('searchBtnText');
        if (searchBtnText) searchBtnText.textContent = dict.partnerSearchBtn;

        const appCtaText = document.getElementById('appCtaText');
        if (appCtaText) appCtaText.textContent = dict.appCtaText;

        const googlePlayText = document.getElementById('googlePlayText');
        if (googlePlayText) googlePlayText.textContent = dict.googlePlay;

        const appStoreText = document.getElementById('appStoreText');
        if (appStoreText) appStoreText.textContent = dict.appStore;

        const appStoreBtn = document.getElementById('appStoreBtn');
        if (appStoreBtn) appStoreBtn.href = isAr ? 'https://murshid.feshealthtech.com/ar/#download' : 'https://murshid.feshealthtech.com/#download';

        const footerBrandLink = document.getElementById('footerBrandLink');
        if (footerBrandLink) {
            footerBrandLink.href = homeUrl;
            footerBrandLink.textContent = isAr ? 'مرشد' : 'Murshid';
        }

        const footerBrandingText = document.getElementById('footerBrandingText');
        if (footerBrandingText && footerBrandingText.childNodes.length > 1) {
            footerBrandingText.childNodes[1].nodeValue = ' ' + (isAr ? 'محرك التحقق والتشفير الرسمي © 2026' : 'Cryptographic Verification Engine © 2026');
        }

        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) langToggleBtn.textContent = dict.switchLangBtn;

        if (lastReportState) {
            if (lastReportState.type === 'authentic') {
                renderAuthenticReport(lastReportState.fileName, lastReportState.manifest, lastReportState.pubKey, lastReportState.cloudKeyData, true);
            } else if (lastReportState.type === 'tampered') {
                renderTamperedReport(lastReportState.fileName, lastReportState.reasonKey, lastReportState.extra, true);
            } else if (lastReportState.type === 'unsigned') {
                renderUnsignedReport(lastReportState.fileName, true);
            } else if (lastReportState.type === 'error') {
                renderErrorState(lastReportState.msg, true);
            }
        }

        if (lastPartnerState) {
            if (lastPartnerState.type === 'landing') {
                renderPartnerLanding(true);
            } else if (lastPartnerState.type === 'success') {
                renderPartnerCard(lastPartnerState.matchedPartner, true);
            } else if (lastPartnerState.type === 'ambiguous') {
                renderAmbiguousPartner(lastPartnerState.message, true);
            } else if (lastPartnerState.type === 'not_found') {
                renderNotFoundPartner(lastPartnerState.raw, true);
            } else if (lastPartnerState.type === 'unauthorized') {
                renderUnauthorizedPartner(true);
            } else if (lastPartnerState.type === 'network_error') {
                renderNetworkErrorPartner(true);
            }
        }
    }

    function toggleVerifyLanguage() {
        setLanguage(currentLang === 'ar' ? 'en' : 'ar');
    }

    function switchTab(tab) {
        const tabReportBtn = document.getElementById('tabReportBtn');
        const tabPartnerBtn = document.getElementById('tabPartnerBtn');
        const reportSection = document.getElementById('reportSection');
        const partnerSection = document.getElementById('partnerSection');

        if (tab === 'report') {
            if (tabReportBtn) tabReportBtn.classList.add('active');
            if (tabPartnerBtn) tabPartnerBtn.classList.remove('active');
            if (reportSection) reportSection.style.display = 'block';
            if (partnerSection) partnerSection.style.display = 'none';
        } else {
            if (tabPartnerBtn) tabPartnerBtn.classList.add('active');
            if (tabReportBtn) tabReportBtn.classList.remove('active');
            if (reportSection) reportSection.style.display = 'none';
            if (partnerSection) partnerSection.style.display = 'block';
            const area = document.getElementById('partnerResultArea');
            if (!lastPartnerState && area && !area.innerHTML) {
                renderPartnerLanding();
            }
        }
    }

    function decodeBase64Bytes(b64) {
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }
        return bytes;
    }

    function decodeBase64Utf8Strict(b64) {
        const rawBytes = decodeBase64Bytes(b64);
        return new TextDecoder('utf-8', { fatal: true }).decode(rawBytes);
    }

    // Strict In-Binary Scanner for %MSH_SIG: at the end of the file (fail-closed on trailing mutations)
    function extractSignatureAndCleanBytes(bytes) {
        const marker = [0x25, 0x4D, 0x53, 0x48, 0x5F, 0x53, 0x49, 0x47, 0x3A]; // "%MSH_SIG:"
        let markerIndex = -1;

        for (let i = bytes.length - marker.length; i >= 0; i--) {
            let match = true;
            for (let j = 0; j < marker.length; j++) {
                if (bytes[i + j] !== marker[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                markerIndex = i;
                break;
            }
        }

        if (markerIndex !== -1) {
            let cleanEnd = markerIndex;
            if (cleanEnd > 0 && bytes[cleanEnd - 1] === 0x0A) {
                cleanEnd--;
                if (cleanEnd > 0 && bytes[cleanEnd - 1] === 0x0D) {
                    cleanEnd--;
                }
            }
            const cleanBytes = bytes.subarray(0, cleanEnd);

            let str = '';
            let sigEndIndex = bytes.length;
            for (let i = markerIndex + marker.length; i < bytes.length; i++) {
                const c = bytes[i];
                if (c === 0x0A || c === 0x0D || c === 0x20 || c === 0x25) {
                    sigEndIndex = i;
                    break;
                } else {
                    str += String.fromCharCode(c);
                }
            }

            // Fail-closed: reject non-whitespace trailing bytes appended after the cryptographic seal
            for (let i = sigEndIndex; i < bytes.length; i++) {
                const c = bytes[i];
                if (c !== 0x0A && c !== 0x0D && c !== 0x20 && c !== 0x09) {
                    return {
                        rawB64: '',
                        cleanBytes: cleanBytes,
                        hasTrailerSeal: true,
                        hasTrailingGarbage: true
                    };
                }
            }

            return {
                rawB64: str,
                cleanBytes: cleanBytes,
                hasTrailerSeal: true,
                hasTrailingGarbage: false
            };
        }

        // Fallback search for legacy MSH_SIG inside /Subject metadata
        let latinText = '';
        const chunkSize = 65536;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const sub = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            latinText += String.fromCharCode.apply(null, sub);
        }
        const match = latinText.match(/MSH_SIG:([A-Za-z0-9+/=]+)/);
        if (match && match[1]) {
            return {
                rawB64: match[1],
                cleanBytes: bytes,
                hasTrailerSeal: false,
                hasTrailingGarbage: false
            };
        }
        return null;
    }

    // Strict Fail-Closed Ed25519 Detached Verification using TweetNaCl
    function verifyEd25519(messageStr, sigBase64, pubKeyBase64) {
        try {
            if (
                typeof nacl === 'undefined' ||
                !nacl ||
                !nacl.sign ||
                !nacl.sign.detached ||
                typeof nacl.sign.detached.verify !== 'function'
            ) {
                console.error('Cryptographic Fail-Closed: TweetNaCl verification engine is unavailable.');
                return false;
            }
            if (
                typeof messageStr !== 'string' ||
                typeof sigBase64 !== 'string' ||
                typeof pubKeyBase64 !== 'string' ||
                !sigBase64.trim() ||
                !pubKeyBase64.trim()
            ) {
                return false;
            }

            const msgBytes = new TextEncoder().encode(messageStr);
            const sigBytes = decodeBase64Bytes(sigBase64.trim());
            const pubBytes = decodeBase64Bytes(pubKeyBase64.trim());

            if (sigBytes.length !== 64 || pubBytes.length !== 32) {
                console.warn('Cryptographic Fail-Closed: Invalid Ed25519 signature or public key byte length.');
                return false;
            }

            return nacl.sign.detached.verify(msgBytes, sigBytes, pubBytes) === true;
        } catch (e) {
            console.error('Signature verification error (Fail-Closed):', e);
            return false;
        }
    }

    function hasRequiredCryptoEngines() {
        const naclOk = typeof nacl !== 'undefined' &&
            nacl &&
            nacl.sign &&
            nacl.sign.detached &&
            typeof nacl.sign.detached.verify === 'function';
        const subtleOk = typeof crypto !== 'undefined' &&
            crypto.subtle &&
            typeof crypto.subtle.digest === 'function';
        return naclOk && subtleOk;
    }

    function hasRequiredPdfEngine() {
        return typeof pdfjsLib !== 'undefined' &&
            pdfjsLib &&
            typeof pdfjsLib.getDocument === 'function';
    }

    async function processPdfFile(file) {
        const dict = i18n[currentLang];
        if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
            if (typeof alert === 'function') alert(dict.validPdfAlert);
            return;
        }

        const resultArea = document.getElementById('reportResultArea');
        if (resultArea) {
            resultArea.style.display = 'block';
            resultArea.innerHTML = `
                <div class="result-card" style="padding: 40px 20px; text-align: center;">
                    <div class="loading-spinner"></div>
                    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 6px;">${dict.verifyingDoc}</h3>
                    <p style="font-size: 13px; color: var(--text-muted);">${dict.verifyingDocHint}</p>
                </div>
            `;
        }

        // 0. Strict Preflight Fail-Closed Engine Guards
        if (!hasRequiredCryptoEngines()) {
            renderErrorState('CRYPTO_ENGINE_UNAVAILABLE');
            return;
        }
        if (!hasRequiredPdfEngine()) {
            renderErrorState('PDF_ENGINE_UNAVAILABLE');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            // 1. Extract Cryptographic Seal & Original Clean Bytes
            const extraction = extractSignatureAndCleanBytes(bytes);

            if (!extraction) {
                renderUnsignedReport(file.name);
                return;
            }
            if (extraction.hasTrailingGarbage) {
                renderTamperedReport(file.name, 'EXTERNAL_EDITOR');
                return;
            }
            if (!extraction.rawB64) {
                renderUnsignedReport(file.name);
                return;
            }

            // 2. Parse Manifest & Digital Signature strictly as UTF-8
            let payload;
            try {
                const jsonStr = decodeBase64Utf8Strict(extraction.rawB64);
                payload = JSON.parse(jsonStr);
            } catch (e) {
                console.error('Payload decode error:', e);
                renderTamperedReport(file.name, 'DECODE_ERROR');
                return;
            }

            const manifest = payload && payload.manifest;
            const signatureBase64 = payload && payload.sig;

            if (
                !manifest ||
                typeof manifest !== 'object' ||
                typeof manifest.email !== 'string' ||
                !manifest.email.trim() ||
                typeof signatureBase64 !== 'string' ||
                !signatureBase64.trim()
            ) {
                renderUnsignedReport(file.name);
                return;
            }

            const claimedPhone = typeof manifest.phone === 'string' ? manifest.phone.trim() : '';

            // 3. Query Murshid Cloud Registry for Registered Public Key & Silent Verified Phone Attestation
            let cloudKeyData;
            try {
                let appCheckToken = '';
                if (typeof window.getAppCheckToken === 'function') {
                    try {
                        appCheckToken = await window.getAppCheckToken();
                    } catch (_) {}
                }

                const headers = { 'Content-Type': 'application/json' };
                if (appCheckToken) {
                    headers['X-Firebase-AppCheck'] = appCheckToken;
                }

                const requestBody = { email: manifest.email.trim().toLowerCase() };
                if (claimedPhone) {
                    requestBody.claimedPhone = claimedPhone;
                }

                const resp = await fetch(LOOKUP_PUBLIC_KEY_ENDPOINT, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestBody)
                });

                if (resp.status === 401) {
                    renderErrorState('UNAUTHORIZED');
                    return;
                }
                if (!resp.ok) {
                    renderErrorState('CLOUD_CONNECT_FAILED');
                    return;
                }

                cloudKeyData = await resp.json();
            } catch (e) {
                console.error('Cloud lookup failed:', e);
                renderErrorState('CLOUD_CONNECT_FAILED');
                return;
            }

            const candidateKeys = [];
            const seenCandidateKeys = new Set();
            if (cloudKeyData && Array.isArray(cloudKeyData.publicKeys)) {
                for (const keyItem of cloudKeyData.publicKeys) {
                    if (typeof keyItem === 'string' && keyItem.trim() && !seenCandidateKeys.has(keyItem.trim())) {
                        seenCandidateKeys.add(keyItem.trim());
                        candidateKeys.push(keyItem.trim());
                    }
                }
            }
            if (cloudKeyData && typeof cloudKeyData.publicKey === 'string' && cloudKeyData.publicKey.trim()) {
                const primaryTrimmed = cloudKeyData.publicKey.trim();
                if (!seenCandidateKeys.has(primaryTrimmed)) {
                    candidateKeys.unshift(primaryTrimmed);
                    seenCandidateKeys.add(primaryTrimmed);
                }
            }

            if (!cloudKeyData || !cloudKeyData.found || candidateKeys.length === 0) {
                renderTamperedReport(file.name, 'UNREGISTERED_EMAIL');
                return;
            }

            // 4. Verify Ed25519 Cryptographic Signature over canonical JSON strictly newest-to-oldest (Fail-Closed)
            const canonicalJson = JSON.stringify(manifest);
            let publicKeyBase64 = '';
            let matchedKeyIndex = -1;
            for (let keyIdx = 0; keyIdx < candidateKeys.length; keyIdx++) {
                if (verifyEd25519(canonicalJson, signatureBase64, candidateKeys[keyIdx])) {
                    publicKeyBase64 = candidateKeys[keyIdx];
                    matchedKeyIndex = keyIdx;
                    break;
                }
            }

            if (!publicKeyBase64) {
                renderTamperedReport(file.name, 'INVALID_SIG');
                return;
            }

            const enrichedCloudKeyData = {
                ...cloudKeyData,
                usedHistoricalKey: matchedKeyIndex > 0,
                matchedKeyIndex: matchedKeyIndex,
            };

            // 5. Verify Content Bit-Integrity (SHA-256 against manifest.docHash)
            if (extraction.hasTrailerSeal) {
                if (typeof manifest.docHash !== 'string' || !SHA256_HEX_REGEX.test(manifest.docHash.trim())) {
                    renderTamperedReport(file.name, 'SEAL_STRIPPED');
                    return;
                }
                const hashBuffer = await crypto.subtle.digest('SHA-256', extraction.cleanBytes);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const computedDocHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                if (computedDocHash !== manifest.docHash.trim().toLowerCase()) {
                    console.warn('Document SHA-256 mismatch! Expected:', manifest.docHash, 'Computed:', computedDocHash);
                    renderTamperedReport(file.name, 'DOC_HASH_MISMATCH');
                    return;
                }
            } else {
                renderTamperedReport(file.name, 'SEAL_STRIPPED');
                return;
            }

            // 6. Verify Structural Integrity & Anti-Tampering with PDF.js (Fail-Closed)
            try {
                if (!hasRequiredPdfEngine()) {
                    renderErrorState('PDF_ENGINE_UNAVAILABLE');
                    return;
                }
                const pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;

                if (manifest.pages && pdfDoc.numPages !== manifest.pages) {
                    renderTamperedReport(file.name, 'PAGE_MISMATCH', { expected: manifest.pages, actual: pdfDoc.numPages });
                    return;
                }

                for (let p = 1; p <= pdfDoc.numPages; p++) {
                    const page = await pdfDoc.getPage(p);
                    const annotations = await page.getAnnotations();
                    if (annotations && annotations.length > 0) {
                        console.warn(`Tampering alert: Page ${p} contains ${annotations.length} annotations/drawings.`);
                        renderTamperedReport(file.name, 'VISUAL_TAMPERING');
                        return;
                    }
                }
            } catch (pdfErr) {
                console.error('PDF.js structure verification failed (Fail-Closed):', pdfErr);
                renderTamperedReport(file.name, 'PDF_PARSE_FAILED');
                return;
            }

            // 7. Check for Incremental File Updates (Multiple %%EOF appended by editors)
            try {
                let latinString = '';
                const chunkSize = 65536;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    const sub = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
                    latinString += String.fromCharCode.apply(null, sub);
                }
                const eofMatches = latinString.match(/%%EOF/g);
                if (eofMatches && eofMatches.length > 1) {
                    console.warn('Tampering alert: Multiple %%EOF markers found:', eofMatches.length);
                    renderTamperedReport(file.name, 'MULTIPLE_EOF');
                    return;
                }
            } catch (eofErr) {
                console.error('EOF structure verification error (Fail-Closed):', eofErr);
                renderTamperedReport(file.name, 'PDF_PARSE_FAILED');
                return;
            }

            // 8. Render Authentic Verified Document with Clear Phone Verification Distinction
            renderAuthenticReport(file.name, manifest, publicKeyBase64, enrichedCloudKeyData);

        } catch (err) {
            console.error('Processing error:', err);
            renderErrorState(i18n[currentLang].unexpectedErrorMsg + (err && err.message ? err.message : ''));
        }
    }

    function formatDate(isoStr) {
        if (!isoStr) return '-';
        try {
            const d = new Date(isoStr);
            if (Number.isNaN(d.getTime())) return String(isoStr);
            return d.toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (_) {
            return String(isoStr);
        }
    }

    function renderAuthenticReport(fileName, manifest, pubKey, cloudKeyData = {}, isLangRerender = false) {
        if (!isLangRerender) {
            lastReportState = { type: 'authentic', fileName, manifest, pubKey, cloudKeyData };
        }
        const dict = i18n[currentLang];
        const resultArea = document.getElementById('reportResultArea');
        if (!resultArea) return;

        const manifestPhone = typeof manifest.phone === 'string' ? manifest.phone.trim() : '';
        const isSignedPhoneClaimed = manifest.phoneVerified === true && manifestPhone.length > 0;
        const isCloudPhoneMatch = cloudKeyData && cloudKeyData.phoneVerifiedMatch === true;
        const hasVerifiedTelegramPhone = isSignedPhoneClaimed && isCloudPhoneMatch;
        const usedHistoricalKey = Boolean(cloudKeyData && cloudKeyData.usedHistoricalKey === true);

        const historicalKeyBadgeHtml = usedHistoricalKey
            ? `<div style="margin-top: 6px;"><span class="verified-telegram-pill" style="background: #EFF6FF; border-color: #BFDBFE; color: #1D4ED8;">🔑 ${dict.verifiedHistoricalKeyBadge}</span></div>`
            : '';

        let phoneHeaderHtml = '';
        let transparencyText = dict.transparencyNoticeEmailOnly;

        if (hasVerifiedTelegramPhone) {
            transparencyText = dict.transparencyNoticeVerifiedPhone;
            phoneHeaderHtml = `
                <div class="verified-phone-row is-verified">
                    <span class="verified-phone-label">${dict.verifiedPhoneLabel}</span>
                    <span class="verified-phone-value mono">${escapeHtml(manifestPhone)}</span>
                    <span class="verified-telegram-pill">✓ ${dict.verifiedPhoneTelegramBadge}</span>
                </div>
            `;
        } else {
            const unverifiedLabel = manifestPhone.length > 0
                ? dict.phoneUnverifiedOrRevokedBadge
                : dict.phoneNotVerifiedBadge;
            phoneHeaderHtml = `
                <div class="verified-phone-row is-unverified">
                    <span class="verified-phone-label">${dict.phoneNotVerifiedLabel}</span>
                    <span class="unverified-phone-pill">⚠️ ${unverifiedLabel}</span>
                </div>
            `;
        }

        resultArea.innerHTML = `
            <div class="result-card">
                <div class="result-banner success">
                    <div class="result-banner-icon">
                        <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                    <h2 class="result-headline">${dict.docAuthenticTitle}</h2>
                    <p class="result-subline">${dict.docAuthenticSub}</p>
                </div>

                <div class="result-body">
                    <!-- Verified Issuer Header (Email + Verified Telegram Phone OR Explicit Unverified Notice) -->
                    <div class="verified-box">
                        <div class="verified-badge-icon">
                            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div class="verified-box-title">${dict.verifiedIssuerAccount}</div>
                            <div class="verified-box-email">${escapeHtml(manifest.email)}</div>
                            ${historicalKeyBadgeHtml}
                            ${phoneHeaderHtml}
                        </div>
                    </div>

                    <!-- Declared Clinician Info Box (No unverified phone masquerading here) -->
                    <div class="declared-box">
                        <div class="declared-header">
                            <span class="declared-title">${dict.specialistProfileData}</span>
                            <span class="unverified-tag">${dict.selfDeclaredTag}</span>
                        </div>

                        <div class="meta-row">
                            <span class="meta-label">${dict.specialistName}</span>
                            <span class="meta-value">${escapeHtml(manifest.name || dict.notSpecified)}</span>
                        </div>

                        <div class="meta-row">
                            <span class="meta-label">${dict.clinicFacility}</span>
                            <span class="meta-value">${escapeHtml(manifest.clinic || dict.notSpecified)}</span>
                        </div>
                    </div>

                    <!-- Transparency Notice -->
                    <div class="transparency-notice">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        <span>${transparencyText}</span>
                    </div>

                    <!-- Technical Manifest Details -->
                    <div class="declared-box">
                        <div class="meta-row">
                            <span class="meta-label">${dict.documentId}</span>
                            <span class="meta-value mono">${escapeHtml(manifest.id)}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">${dict.issueDate}</span>
                            <span class="meta-value">${escapeHtml(formatDate(manifest.issuedAt))}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">${dict.verifiedPages}</span>
                            <span class="meta-value">${escapeHtml(manifest.pages)} ${dict.pagesUnit}</span>
                        </div>
                    </div>
                </div>

                <div class="result-actions">
                    <button type="button" class="reset-btn" data-action="reset-report">${dict.verifyAnother}</button>
                </div>
            </div>
        `;
    }

    function renderTamperedReport(fileName, reasonKey, extra = null, isLangRerender = false) {
        if (!isLangRerender) {
            lastReportState = { type: 'tampered', fileName, reasonKey, extra };
        }
        const dict = i18n[currentLang];
        const reasonText = getReasonText(reasonKey, extra);
        const resultArea = document.getElementById('reportResultArea');
        if (!resultArea) return;
        resultArea.innerHTML = `
            <div class="result-card">
                <div class="result-banner tampered">
                    <div class="result-banner-icon">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <h2 class="result-headline">${dict.tamperedTitle}</h2>
                    <p class="result-subline">${dict.tamperedSub}</p>
                </div>

                <div class="result-body">
                    <p style="font-size: 13.5px; color: var(--text-main); line-height: 1.6;">
                        ${reasonText}
                    </p>
                </div>

                <div class="result-actions">
                    <button type="button" class="reset-btn" data-action="reset-report">${dict.tryAgain}</button>
                </div>
            </div>
        `;
    }

    function renderUnsignedReport(fileName, isLangRerender = false) {
        if (!isLangRerender) {
            lastReportState = { type: 'unsigned', fileName };
        }
        const dict = i18n[currentLang];
        const resultArea = document.getElementById('reportResultArea');
        if (!resultArea) return;
        resultArea.innerHTML = `
            <div class="result-card">
                <div class="result-banner unsigned">
                    <div class="result-banner-icon">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <h2 class="result-headline">${dict.unsignedTitle}</h2>
                    <p class="result-subline">${dict.unsignedSub}</p>
                </div>

                <div class="result-body">
                    <p style="font-size: 13.5px; color: var(--text-main); line-height: 1.6;">
                        ${dict.unsignedBody}
                    </p>
                </div>

                <div class="result-actions">
                    <button type="button" class="reset-btn" data-action="reset-report">${dict.checkAnotherFile}</button>
                </div>
            </div>
        `;
    }

    function renderErrorState(msg, isLangRerender = false) {
        if (!isLangRerender) {
            lastReportState = { type: 'error', msg };
        }
        const dict = i18n[currentLang];
        const displayMsg =
            (msg === 'UNAUTHORIZED') ? dict.unauthorizedReportMsg :
            (msg === 'CLOUD_CONNECT_FAILED') ? dict.cloudLookupFailedMsg :
            (msg === 'CRYPTO_ENGINE_UNAVAILABLE') ? dict.cryptoEngineUnavailableMsg :
            (msg === 'PDF_ENGINE_UNAVAILABLE') ? dict.pdfEngineUnavailableMsg :
            escapeHtml(msg);
        const resultArea = document.getElementById('reportResultArea');
        if (!resultArea) return;
        resultArea.innerHTML = `
            <div class="result-card" style="padding: 30px 20px; text-align: center;">
                <h3 style="font-size: 16px; color: var(--error); margin-bottom: 8px;">${dict.verificationFailed}</h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">${displayMsg}</p>
                <button type="button" class="reset-btn" data-action="reset-report">${dict.tryAgain}</button>
            </div>
        `;
    }

    function resetReportView() {
        lastReportState = null;
        const pdfInput = document.getElementById('pdfFileInput');
        if (pdfInput) pdfInput.value = '';
        const area = document.getElementById('reportResultArea');
        if (area) {
            area.style.display = 'none';
            area.innerHTML = '';
        }
    }

    function renderPartnerLanding(isLangRerender = false) {
        if (!isLangRerender) {
            lastPartnerState = { type: 'landing' };
        }
        const dict = i18n[currentLang];
        const area = document.getElementById('partnerResultArea');
        if (!area) return;
        area.innerHTML = `
            <div class="dropzone-card" style="cursor: default;">
                <div class="drop-icon-circle">
                    <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 14z"/></svg>
                </div>
                <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 6px;">${dict.partnerLandingTitle}</h3>
                <p style="font-size: 13px; color: var(--text-muted);">${dict.partnerLandingHint}</p>
            </div>
        `;
    }

    const getMonogram = (fullName) => {
        const parts = String(fullName || '').trim().split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return 'ID';
    };

    function renderPartnerCard(matchedPartner, isLangRerender = false) {
        if (!isLangRerender) {
            lastPartnerState = { type: 'success', matchedPartner };
        }
        const dict = i18n[currentLang];
        const matchedId = escapeHtml(matchedPartner.id);
        const monogram = escapeHtml(getMonogram(matchedPartner.name));

        let statusBadgeHtml = `
            <div class="status-badge is-active">
                <div class="status-icon"></div>
                <span>${dict.verifiedSpecialistBadge}</span>
            </div>
        `;

        if (matchedPartner.status === 'suspended') {
            statusBadgeHtml = `
                <div class="status-badge" style="background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.5);">
                    <div class="status-icon" style="background: #EF4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);"></div>
                    <span style="color: #FEE2E2;">${dict.suspendedBadge}</span>
                </div>
            `;
        } else if (matchedPartner.status === 'expired') {
            statusBadgeHtml = `
                <div class="status-badge" style="background: rgba(245, 158, 11, 0.25); border-color: rgba(245, 158, 11, 0.5);">
                    <div class="status-icon" style="background: #F59E0B; box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);"></div>
                    <span style="color: #FEF3C7;">${dict.expiredBadge}</span>
                </div>
            `;
        }

        const area = document.getElementById('partnerResultArea');
        if (!area) return;
        area.innerHTML = `
            <div class="id-card">
                <div class="id-banner">
                    ${statusBadgeHtml}
                </div>
                <div class="id-avatar-wrapper">
                    <div class="id-avatar-ring">
                        <div class="id-avatar-inner">
                            <div class="monogram-avatar">${monogram}</div>
                        </div>
                    </div>
                </div>
                <div class="id-body">
                    <h2 class="partner-name">${escapeHtml(matchedPartner.name)}</h2>
                    <span class="partner-title">${escapeHtml(matchedPartner.title)}</span>
                    <div class="data-glass-panel">
                        <div class="meta-row">
                            <span class="meta-label">${dict.partnerIdLabel}</span>
                            <span class="meta-value mono">${matchedId}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">${dict.emailLabel}</span>
                            <span class="meta-value mono">${escapeHtml(matchedPartner.email || dict.officialEmailDefault)}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">${dict.phoneLabel}</span>
                            <span class="meta-value mono">${escapeHtml(matchedPartner.phone || dict.officialContactDefault)}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">${dict.countryLabel}</span>
                            <span class="meta-value">${escapeHtml(matchedPartner.country || dict.regRepDefault)}</span>
                        </div>
                    </div>
                </div>
                <div class="id-footer">
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">${dict.validThru}</div>
                        <div class="validity-value">${escapeHtml(matchedPartner.expiryDate)}</div>
                    </div>
                    <img src="/assets/logo.webp" alt="Murshid" style="height: 36px;">
                </div>
            </div>
        `;
    }

    function renderAmbiguousPartner(message, isLangRerender = false) {
        if (!isLangRerender) {
            lastPartnerState = { type: 'ambiguous', message };
        }
        const dict = i18n[currentLang];
        const area = document.getElementById('partnerResultArea');
        if (!area) return;
        area.innerHTML = `
            <div class="result-card" style="padding: 28px 20px; text-align: center;">
                <div class="result-banner-icon" style="background: rgba(245, 158, 11, 0.15); color: var(--warning); margin: 0 auto 14px;">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                <h3 style="font-size: 16px; font-weight: 800; color: #92400E; margin-bottom: 8px;">${dict.multipleMatchesTitle}</h3>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">
                    ${message ? escapeHtml(message) : dict.multipleMatchesHint}
                </p>
                <button type="button" class="reset-btn" data-action="focus-partner">${dict.refineSearchBtn}</button>
            </div>
        `;
    }

    function renderNotFoundPartner(raw, isLangRerender = false) {
        if (!isLangRerender) {
            lastPartnerState = { type: 'not_found', raw };
        }
        const dict = i18n[currentLang];
        const area = document.getElementById('partnerResultArea');
        if (!area) return;
        area.innerHTML = `
            <div class="result-card" style="padding: 30px 20px; text-align: center;">
                <h3 style="font-size: 16px; color: var(--error); margin-bottom: 6px;">${dict.credentialNotFoundTitle}</h3>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">${dict.credentialNotFoundMsg(raw)}</p>
            </div>
        `;
    }

    function renderUnauthorizedPartner(isLangRerender = false) {
        if (!isLangRerender) {
            lastPartnerState = { type: 'unauthorized' };
        }
        const dict = i18n[currentLang];
        const area = document.getElementById('partnerResultArea');
        if (!area) return;
        area.innerHTML = `
            <div class="result-card" style="padding: 30px 20px; text-align: center;">
                <h3 style="font-size: 16px; color: var(--error); margin-bottom: 6px;">${dict.unauthorizedAccess}</h3>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">${dict.unauthorizedPartnerMsg}</p>
            </div>
        `;
    }

    function renderNetworkErrorPartner(isLangRerender = false) {
        if (!isLangRerender) {
            lastPartnerState = { type: 'network_error' };
        }
        const dict = i18n[currentLang];
        const area = document.getElementById('partnerResultArea');
        if (!area) return;
        area.innerHTML = `
            <div class="result-card" style="padding: 30px 20px; text-align: center;">
                <h3 style="font-size: 16px; color: var(--error); margin-bottom: 6px;">${dict.networkErrorTitle}</h3>
                <p style="font-size: 13px; color: var(--text-muted);">${dict.networkErrorMsg}</p>
            </div>
        `;
    }

    async function handlePartnerSearch(e) {
        if (e && e.preventDefault) e.preventDefault();
        const input = document.getElementById('partnerInput');
        const raw = input ? input.value.trim() : '';
        if (!raw) return renderPartnerLanding();

        const dict = i18n[currentLang];
        const area = document.getElementById('partnerResultArea');
        if (area) {
            area.innerHTML = `
                <div class="result-card" style="padding: 40px 20px; text-align: center;">
                    <div class="loading-spinner"></div>
                    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 6px;">${dict.verifyingPartner}</h3>
                    <p style="font-size: 13px; color: var(--text-muted);">${dict.verifyingPartnerHint}</p>
                </div>
            `;
        }

        try {
            let appCheckToken = '';
            if (typeof window.getAppCheckToken === 'function') {
                try {
                    appCheckToken = await window.getAppCheckToken();
                } catch (_) {}
            }

            const headers = { 'Content-Type': 'application/json' };
            if (appCheckToken) {
                headers['X-Firebase-AppCheck'] = appCheckToken;
            }

            const response = await fetch(VERIFY_AFFILIATE_ENDPOINT, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ query: raw })
            });

            if (response.status === 401) {
                renderUnauthorizedPartner();
                return;
            }

            const data = await response.json();

            if (data.found && data.partner) {
                renderPartnerCard(data.partner);
            } else if (data.code === 'AMBIGUOUS_MATCH') {
                renderAmbiguousPartner(data.message);
            } else {
                renderNotFoundPartner(raw);
            }
        } catch (networkErr) {
            console.error('Network error verifying credential:', networkErr);
            renderNetworkErrorPartner();
        }
    }

    function setupDomBindings() {
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', toggleVerifyLanguage);
        }

        const tabReportBtn = document.getElementById('tabReportBtn');
        if (tabReportBtn) {
            tabReportBtn.addEventListener('click', () => switchTab('report'));
        }

        const tabPartnerBtn = document.getElementById('tabPartnerBtn');
        if (tabPartnerBtn) {
            tabPartnerBtn.addEventListener('click', () => switchTab('partner'));
        }

        const pdfFileInput = document.getElementById('pdfFileInput');
        if (pdfFileInput) {
            pdfFileInput.addEventListener('change', (e) => {
                const files = e.target && e.target.files;
                if (files && files.length > 0) {
                    processPdfFile(files[0]);
                }
            });
        }

        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.add('dragover');
                }, false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('dragover');
                }, false);
            });
            dropZone.addEventListener('drop', (e) => {
                const files = e.dataTransfer && e.dataTransfer.files;
                if (files && files.length > 0) {
                    processPdfFile(files[0]);
                }
            });
        }

        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', handlePartnerSearch);
        }

        const reportResultArea = document.getElementById('reportResultArea');
        if (reportResultArea) {
            reportResultArea.addEventListener('click', (e) => {
                const target = e.target && e.target.closest ? e.target.closest('[data-action="reset-report"]') : null;
                if (target) {
                    resetReportView();
                }
            });
        }

        const partnerResultArea = document.getElementById('partnerResultArea');
        if (partnerResultArea) {
            partnerResultArea.addEventListener('click', (e) => {
                const target = e.target && e.target.closest ? e.target.closest('[data-action="focus-partner"]') : null;
                if (target) {
                    const input = document.getElementById('partnerInput');
                    if (input) input.focus();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupDomBindings();
        setLanguage(currentLang);
        const urlParams = new URLSearchParams(window.location.search);
        const partnerId = urlParams.get('id');
        if (partnerId) {
            switchTab('partner');
            const input = document.getElementById('partnerInput');
            if (input) input.value = partnerId;
            handlePartnerSearch({ preventDefault: () => {} });
        }
    });

    // Expose deterministic hooks for automated security tests
    globalScope.__MurshidVerify = {
        verifyEd25519,
        extractSignatureAndCleanBytes,
        processPdfFile,
        renderAuthenticReport,
        hasRequiredCryptoEngines,
        hasRequiredPdfEngine,
        escapeHtml,
        getLastReportState: () => lastReportState
    };
})(typeof window !== 'undefined' ? window : globalThis);
