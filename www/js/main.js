// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const diwanGrid = document.getElementById('diwanGrid');

const themeToggle = document.getElementById('themeToggle');
const themePicker = document.getElementById('themePicker');
const themeBtns = document.querySelectorAll('.theme-btn');

const fontToggle = document.getElementById('fontToggle');
const fontPicker = document.getElementById('fontPicker');
const fontBtns = document.querySelectorAll('.font-btn');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');

const languageToggle = document.getElementById('languageToggle');
const languagePicker = document.getElementById('languagePicker');
const languageBtns = document.querySelectorAll('.language-btn');

const languageModal = document.getElementById('languageModal');
const modalLanguageBtns = document.querySelectorAll('.modal-language-btn');

const overlay = document.createElement('div');
overlay.className = 'picker-overlay';
document.body.appendChild(overlay);

const diwanTitles = {
    1: "تَيْسِيرُ الْوُصُولِ", 2: "إِكْسِيرُ السَّعَادَاتِ", 3: "سَلْوَةُ الشُّجُونِ",
    4: "أَوْثَقُ الْعُرَى", 5: "شِفَاءُ الْأَسْقَامِ", 6: "مَنَاسِكُ أَهْلِ الْوِدَادِ",
    7: "نُورُ الْحَقِّ", 8: "سَيْرُ الْقَلْبِ", 9: "كَنْزُ الْعَارِفِينَ"
};

let translations = {};

const savedTheme = localStorage.getItem('theme') || 'light';
const savedFont = localStorage.getItem('font') || 'scheherazade';
const savedFontSize = localStorage.getItem('fontSize') || 20;

function validateLanguage() {
    const savedLang = localStorage.getItem('language');
    if (!savedLang || !['ar', 'en', 'fr'].includes(savedLang)) {
        localStorage.removeItem('language');
        localStorage.removeItem('hasVisited');
        return false;
    }
    return true;
}

let savedLanguage = 'en';
if (validateLanguage()) {
    savedLanguage = localStorage.getItem('language');
} else {
    localStorage.setItem('language', 'en');
    savedLanguage = 'en';
}

const hasVisited = localStorage.getItem('hasVisited');

document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-font', savedFont);

if (hasVisited) {
    document.documentElement.setAttribute('lang', savedLanguage);
    document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
}

// Do NOT set root font size anymore to prevent layout breaking
if (fontSizeSlider) fontSizeSlider.value = savedFontSize;
if (fontSizeValue) fontSizeValue.textContent = savedFontSize;

themeBtns.forEach(btn => { if (btn.dataset.theme === savedTheme) btn.classList.add('active'); });
fontBtns.forEach(btn => { if (btn.dataset.font === savedFont) btn.classList.add('active'); });
if (hasVisited) languageBtns.forEach(btn => { if (btn.dataset.lang === savedLanguage) btn.classList.add('active'); });

function showLanguageModal() {
    if (languageModal) {
        languageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

async function initializeApp() {
    await initializeLanguage(savedLanguage);
    loadDiwanGrid();
}

if (modalLanguageBtns) {
    modalLanguageBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const selectedLang = btn.dataset.lang;
            localStorage.setItem('hasVisited', 'true');
            localStorage.setItem('language', selectedLang);
            savedLanguage = selectedLang;
            document.documentElement.setAttribute('lang', selectedLang);
            document.documentElement.setAttribute('dir', selectedLang === 'ar' ? 'rtl' : 'ltr');
            
            if (languageModal) {
                languageModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            await initializeLanguage(selectedLang);
            loadDiwanGrid();
        });
    });
}

function closeAllMenus() {
    if (navMenu && navMenu.classList.contains('active')) navMenu.classList.remove('active');
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
    if (themePicker) themePicker.classList.remove('active');
    if (fontPicker) fontPicker.classList.remove('active');
    if (languagePicker) languagePicker.classList.remove('active');
    overlay.classList.remove('active');
}

function togglePicker(pickerToShow) {
    closeAllMenus();
    if (pickerToShow) {
        pickerToShow.classList.add('active');
        overlay.classList.add('active');
    }
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
        translations[lang] = await response.json();
        return translations[lang];
    } catch (error) { return {}; }
}

function updateTexts(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.dataset.i18n;
        const translation = getNestedTranslation(translations[lang], key);
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key] ? current[key] : null, obj);
}

async function initializeLanguage(lang) {
    if (!translations[lang]) await loadTranslations(lang);
    updateTexts(lang);
}

if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', isOpen);
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        
        if (themePicker) themePicker.classList.remove('active');
        if (fontPicker) fontPicker.classList.remove('active');
        if (languagePicker) languagePicker.classList.remove('active');
        overlay.classList.remove('active');
    });
}

if (themeToggle) themeToggle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); togglePicker(themePicker); });
if (fontToggle) fontToggle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); togglePicker(fontPicker); });
if (languageToggle) languageToggle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); togglePicker(languagePicker); });

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.documentElement.setAttribute('data-theme', btn.dataset.theme);
        localStorage.setItem('theme', btn.dataset.theme);
        themeBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
        closeAllMenus();
    });
});

fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.documentElement.setAttribute('data-font', btn.dataset.font);
        localStorage.setItem('font', btn.dataset.font);
        fontBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
        closeAllMenus();
    });
});

languageBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const lang = btn.dataset.lang;
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('language', lang);
        localStorage.setItem('hasVisited', 'true');
        savedLanguage = lang;
        languageBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
        await initializeLanguage(lang);
        closeAllMenus();
    });
});

// Slider isolated
if (fontSizeSlider) {
    let timeout;
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        fontSizeValue.textContent = size;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            localStorage.setItem('fontSize', size);
            // We don't apply anything globally here. The setting is just saved for the verses page.
        }, 50);
    });
}

overlay.addEventListener('click', closeAllMenus);

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.id === 'themeToggle' || link.id === 'fontToggle' || link.id === 'languageToggle') {
            e.preventDefault(); return;
        }
        closeAllMenus();
        if (link.dataset.i18n === 'nav.home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && !e.target.closest('.nav-menu') && navMenu?.classList.contains('active')) {
        closeAllMenus();
    }
});

function loadDiwanGrid() {
    if (!diwanGrid) return;
    diwanGrid.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const button = document.createElement('div');
        button.className = 'diwan-btn';
        button.innerHTML = `
            <div class="diwan-number">${i}</div>
            <div class="diwan-title">${diwanTitles[i]}</div>
        `;
        button.addEventListener('click', () => {
            window.location.href = `html/chapter-index.html?diwan=${i}`;
        });
        diwanGrid.appendChild(button);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validateLanguage()) {
        showLanguageModal();
    } else {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            showLanguageModal();
        } else {
            initializeApp();
        }
    }
});

// ===== RATE APP LOGIC =====
const rateAppBtn = document.getElementById('rateAppBtn');

if (rateAppBtn) {
    rateAppBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Close the menu if it's open
        if (typeof closeAllMenus === 'function') {
            closeAllMenus();
        }

        // Your unique Android package ID (from Capacitor config)
        const packageId = 'com.yourname.diwan'; 
        
        // 1. Try to use Capacitor Native App Launcher (For Android App)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
            try {
                // Opens the Play Store directly to your app's review page
                await window.Capacitor.Plugins.App.openUrl({
                    url: `market://details?id=${packageId}&showAllReviews=true`
                });
                return;
            } catch (err) {
                console.error('Capacitor App Plugin failed', err);
            }
        }

        // 2. Fallback for Web Browsers (or if the App plugin fails)
        window.open(`https://play.google.com/store/apps/details?id=${packageId}`, '_blank');
    });
}