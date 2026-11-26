import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";

const firebaseConfig = {
    apiKey: "AIzaSyCGNr5u0R_ryuALLum9GpPUUJE6tjpD8Bk",
    authDomain: "ai-apps-central.firebaseapp.com",
    projectId: "ai-apps-central",
    storageBucket: "ai-apps-central.firebasestorage.app",
    messagingSenderId: "538868422841",
    appId: "1:538868422841:web:662d4f78fe5f88c9652368"
};

try {
    const app = initializeApp(firebaseConfig);
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider('6LeISOktAAAAAGxytq1MOaOjcTcHRxloD1Mu6Dgb'),
        isTokenAutoRefreshEnabled: true
    });

    window.getAppCheckToken = async function () {
        try {
            const tokenResult = await getToken(appCheck, false);
            return tokenResult ? tokenResult.token : '';
        } catch (e) {
            console.warn("AppCheck token fetch warning:", e);
            return '';
        }
    };
} catch (initErr) {
    console.warn("AppCheck init skipped or failed:", initErr);
    window.getAppCheckToken = async () => '';
}
