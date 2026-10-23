// ===== DOM Elements =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbarBrand = document.querySelector('.nav-brand a');
const progressBar = document.getElementById('progressBar');
const backToChapters = document.getElementById('backToChapters');
const prevChapter = document.getElementById('prevChapter');
const nextChapter = document.getElementById('nextChapter');
const currentPosition = document.getElementById('currentPosition');
const versesContainer = document.getElementById('versesContainer');

// Theme elements
const themeToggle = document.getElementById('themeToggle');
const themePicker = document.getElementById('themePicker');
const themeBtns = document.querySelectorAll('.theme-btn');

// Font elements
const fontToggle = document.getElementById('fontToggle');
const fontPicker = document.getElementById('fontPicker');
const fontBtns = document.querySelectorAll('.font-btn');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');

// Language elements
const languageToggle = document.getElementById('languageToggle');
const languagePicker = document.getElementById('languagePicker');
const languageBtns = document.querySelectorAll('.language-btn');

// Overlay
const overlay = document.createElement('div');
overlay.className = 'picker-overlay';
document.body.appendChild(overlay);

// ===== URL Params =====
const urlParams = new URLSearchParams(window.location.search);
const diwanId = urlParams.get('diwan');
const chapterIndex = parseInt(urlParams.get('chapter')) || 0; // 0-based

// ===== Diwan titles =====
const diwanTitles = {
    1: "تَيْسِيرُ الْوُصُلِ",
    2: "إِكْسِيرُ السَّعَادَةِ",
    3: "سَلْوَى الْمَشْجُونِ",
    4: "أَوْثَقُ الْعُرَىٰ",
    5: "شِفَاءُ الْأَسْقَامِ",
    6: "مَنَاسِكُ أَهْلِ الْوِدَادِ",
    7: "نُورُ الْحَقِّ",
    8: "سَيْرُ الْقَلْبِ",
    9: "كَنْزُ الْعَارِفِين"
};

// ===== State =====
let totalChapters = 0;
let currentChapter = null;
let translations = {};

// ===== Path helper =====
function dataPath(file) {
    const inHtml = window.location.pathname.includes('/html/');
    const prefix = inHtml ? '../deewan-text' : 'deewan-text';
    return `${prefix}/${diwanId}/${file}`;
}

// ===== Storage =====
const getStorageKey = () => `diwan_${diwanId}_last_read`;

// ===== Preferences =====
const savedTheme = localStorage.getItem('theme') || 'light';
const savedFont = localStorage.getItem('font') || 'scheherazade';
const savedFontSize = localStorage.getItem('fontSize') || 20;
let savedLanguage = localStorage.getItem('language') || 'en';

document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-font', savedFont);
document.documentElement.setAttribute('lang', savedLanguage);
document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
document.documentElement.style.setProperty('--base-font-size', savedFontSize + 'px');
document.documentElement.style.fontSize = savedFontSize + 'px';

if (fontSizeSlider) fontSizeSlider.value = savedFontSize;
if (fontSizeValue) fontSizeValue.textContent = savedFontSize;

themeBtns.forEach(btn => { if (btn.dataset.theme === savedTheme) btn.classList.add('active'); });
fontBtns.forEach(btn => { if (btn.dataset.font === savedFont) btn.classList.add('active'); });
languageBtns.forEach(btn => { if (btn.dataset.lang === savedLanguage) btn.classList.add('active'); });

// ===== Menu helpers =====
function closeAllMenus() {
    if (navMenu) navMenu.classList.remove('active');
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
    if (themePicker) themePicker.classList.remove('active');
    if (fontPicker) fontPicker.classList.remove('active');
    if (languagePicker) languagePicker.classList.remove('active');
    overlay.classList.remove('active');
}

function closePickersWhenNavOpens() {
    if (navMenu && navMenu.classList.contains('active')) {
        if (themePicker) themePicker.classList.remove('active');
        if (fontPicker) fontPicker.classList.remove('active');
        if (languagePicker) languagePicker.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function togglePicker(pickerToShow) {
    if (themePicker) themePicker.classList.remove('active');
    if (fontPicker) fontPicker.classList.remove('active');
    if (languagePicker) languagePicker.classList.remove('active');

    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }

    if (pickerToShow) {
        pickerToShow.classList.add('active');
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// ===== Translations =====
async function loadTranslations() {
    try {
        const path = window.location.pathname.includes('html/') ? '../locales/' : 'locales/';
        const response = await fetch(`${path}${savedLanguage}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        translations = await response.json();
        applyTranslations();
    } catch (error) {
        console.error('Error loading translations:', error);
        translations = {};
    }
}

function applyTranslations() {
    const t = translations;
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const keys = key.split('.');
        let value = t;
        for (const k of keys) {
            if (value && value[k]) value = value[k];
            else { value = null; break; }
        }
        if (value) element.textContent = value;
    });

    if (backToChapters) backToChapters.innerHTML = t.diwan?.back || '← الْعَوْدَةُ لِلْفُصُولِ';
    if (prevChapter) prevChapter.textContent = t.diwan?.prev || 'الْحِزْبُ السَّابِقُ';
    if (nextChapter) nextChapter.textContent = t.diwan?.next || 'الْحِزْبُ التَّالِي';

    updatePositionDisplay();
    updateNavbarWithBothTitles();
}

function updatePositionDisplay() {
    if (!currentPosition) return;
    if (translations.diwan && totalChapters > 0) {
        currentPosition.textContent = `${translations.diwan.chapterNumber || 'Chapter'} ${chapterIndex + 1} ${translations.diwan.progress || 'of'} ${totalChapters}`;
    } else {
        currentPosition.textContent = `${chapterIndex + 1} / ${totalChapters || '?'}`;
    }
}

// ============================================================
// HOLY NAME STYLING — Version A (5 classes, spans carry data-theme)
// ============================================================
function styleHolyNames() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    document.querySelectorAll('.verse-line').forEach(line => {
        let html = line.innerHTML;
        html = html.replace(/(الله|اللَّهِ|اللَّهَ|اللَّه|اللَّهُ)/g,
            `<span class="holy-name-allah" data-theme="${currentTheme}">$1</span>`);
        html = html.replace(/(مُحَمَّد|مُحَمَّدٍ|مُحَمَّدًا|مُحَمَّدُ|مُحَمَّدِ)/g,
            `<span class="holy-name-muhammad" data-theme="${currentTheme}">$1</span>`);
        html = html.replace(/(أَحْمَد|أَحْمَدَ|أَحْمَدُ|أَحْمَدِ)/g,
            `<span class="holy-name-ahmad" data-theme="${currentTheme}">$1</span>`);
        html = html.replace(/(رَسُول|رَسُولِ|رَسُولَ|رَسُولُ)/g,
            `<span class="holy-name-rasool" data-theme="${currentTheme}">$1</span>`);
        html = html.replace(/(نَبِي|نَبِيِّ|نَبِيَّ|نَبِيُّ)/g,
            `<span class="holy-name-nabi" data-theme="${currentTheme}">$1</span>`);
        line.innerHTML = html;
    });
}

function updateHolyNamesForTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.querySelectorAll('.holy-name-allah, .holy-name-muhammad, .holy-name-ahmad, .holy-name-rasool, .holy-name-nabi')
        .forEach(name => name.setAttribute('data-theme', currentTheme));
}

// ===== Chapter detection =====
async function fileExists(n) {
    try {
        const res = await fetch(dataPath(`${n}.json`), { method: 'HEAD' });
        return res.ok;
    } catch {
        return false;
    }
}

async function detectTotalChapters() {
    if (!(await fileExists(1))) {
        totalChapters = 0;
        return 0;
    }
    let low = 1;
    let high = 2;
    while (await fileExists(high) && high < 5000) {
        low = high;
        high *= 2;
    }
    while (low + 1 < high) {
        const mid = Math.floor((low + high) / 2);
        if (await fileExists(mid)) low = mid;
        else high = mid;
    }
    totalChapters = low;
    return totalChapters;
}

async function fetchChapter(index) {
    const file = `${index + 1}.json`;
    const res = await fetch(dataPath(file));
    if (!res.ok) throw new Error(`Chapter ${index + 1} not found`);
    return await res.json();
}

function preloadChapter(index) {
    if (index < 0 || index >= totalChapters) return;
    fetch(dataPath(`${index + 1}.json`)).catch(() => {});
}

// ===== Load chapter =====
async function loadChapter() {
    if (!diwanId) {
        window.location.href = '../index.html';
        return;
    }

    try {
        await loadTranslations();

        if (versesContainer) {
            versesContainer.innerHTML = `<div class="loading">${translations.diwan?.loading || 'جَارِي التَّحْمِيلُ...'}</div>`;
        }

        if (totalChapters === 0) await detectTotalChapters();

        if (totalChapters === 0) {
            if (versesContainer) {
                versesContainer.innerHTML = `<div class="error">${translations.diwan?.error || 'لَا تُوجَدُ فُصُولٌ'}</div>`;
            }
            return;
        }

        if (chapterIndex < 0 || chapterIndex >= totalChapters) {
            window.location.href = `chapter-index.html?diwan=${diwanId}`;
            return;
        }

        currentChapter = await fetchChapter(chapterIndex);

        updateNavbarWithBothTitles();
        renderCurrentChapter();
        updateProgress();
        updateNavigation();
        updatePositionDisplay();
        saveReadingPosition();

        preloadChapter(chapterIndex + 1);

    } catch (error) {
        console.error('Error loading chapter:', error);
        if (versesContainer) {
            versesContainer.innerHTML = `<div class="error">${translations.diwan?.error || 'فَشِلَ تَحْمِيلُ الْحِزْبِ'}</div>`;
        }
        updateNavigation();
    }
}

function updateNavbarWithBothTitles() {
    if (!navbarBrand || !currentChapter) return;
    const diwanTitle = diwanTitles[diwanId] || `الديوان ${diwanId}`;
    let hurufTitle = currentChapter.title || '';
    if (!hurufTitle || hurufTitle.trim() === '') hurufTitle = `حرف ${chapterIndex + 1}`;

    navbarBrand.innerHTML = `
        <span class="diwan-title-nav">${diwanTitle}</span>
        <span class="huruf-title-nav">${hurufTitle}</span>
    `;
}

function renderCurrentChapter() {
    if (!versesContainer || !currentChapter) return;
    versesContainer.innerHTML = '';

    if (!currentChapter.huruf || !Array.isArray(currentChapter.huruf)) {
        versesContainer.innerHTML = `<div class="error">${translations.diwan?.noVerses || 'لَا تُوجَدُ أَبْيَاتٌ فِي هَذَا الْحِزْبِ'}</div>`;
        return;
    }

    const frag = document.createDocumentFragment();
    currentChapter.huruf.forEach(verse => {
        if (Array.isArray(verse) && verse.length >= 2) {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse-item';
            const line1 = document.createElement('div');
            line1.className = 'verse-line';
            line1.textContent = verse[0];
            const line2 = document.createElement('div');
            line2.className = 'verse-line';
            line2.textContent = verse[1];
            verseDiv.appendChild(line1);
            verseDiv.appendChild(line2);
            frag.appendChild(verseDiv);
        }
    });
    versesContainer.appendChild(frag);

    // Apply holy name spans AFTER insertion (Version A behaviour)
    setTimeout(styleHolyNames, 50);
}

function updateProgress() {
    if (!progressBar || totalChapters === 0) return;
    const progress = ((chapterIndex + 1) / totalChapters) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateNavigation() {
    if (prevChapter) prevChapter.disabled = chapterIndex <= 0;
    if (nextChapter) nextChapter.disabled = totalChapters === 0 || chapterIndex >= totalChapters - 1;
}

function saveReadingPosition() {
    if (!currentChapter) return;
    const firstVerse = currentChapter.huruf && currentChapter.huruf[0] ? currentChapter.huruf[0][0] : '';
    const versePreview = firstVerse.length > 60 ? firstVerse.substring(0, 60) + '...' : firstVerse;
    const lastRead = {
        chapterIndex,
        chapterTitle: currentChapter.title || `حرف ${chapterIndex + 1}`,
        versePreview
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(lastRead));
}

function goToPrevChapter() {
    if (chapterIndex > 0) window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex - 1}`;
}
function goToNextChapter() {
    if (chapterIndex < totalChapters - 1) window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex + 1}`;
}
function goBackToChapters() {
    window.location.href = `chapter-index.html?diwan=${diwanId}`;
}

// ===== Event listeners =====
if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        closePickersWhenNavOpens();
    });
}

if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (themePicker && !themePicker.classList.contains('active')) togglePicker(themePicker);
        else togglePicker(null);
    });
}

if (fontToggle) {
    fontToggle.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (fontPicker && !fontPicker.classList.contains('active')) togglePicker(fontPicker);
        else togglePicker(null);
    });
}

if (languageToggle) {
    languageToggle.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (languagePicker && !languagePicker.classList.contains('active')) togglePicker(languagePicker);
        else togglePicker(null);
    });
}

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateHolyNamesForTheme();
        closeAllMenus();
    });
});

fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const font = btn.dataset.font;
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('font', font);
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        closeAllMenus();
    });
});

languageBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation();
        const lang = btn.dataset.lang;
        localStorage.setItem('language', lang);
        localStorage.setItem('hasVisited', 'true');
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        savedLanguage = lang;
        languageBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        await loadTranslations();
        closeAllMenus();
        updateNavbarWithBothTitles();
    });
});

if (fontSizeSlider) {
    let timeout;
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        if (fontSizeValue) fontSizeValue.textContent = size;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            document.documentElement.style.setProperty('--base-font-size', size + 'px');
            document.documentElement.style.fontSize = size + 'px';
            localStorage.setItem('fontSize', size);
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
        if (link.getAttribute('href') === '../index.html') {
            window.location.href = '../index.html';
        }
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && !e.target.closest('.nav-menu a') && navMenu?.classList.contains('active')) {
        closeAllMenus();
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 10 && navMenu?.classList.contains('active')) closeAllMenus();
});

if (backToChapters) backToChapters.addEventListener('click', goBackToChapters);
if (prevChapter) prevChapter.addEventListener('click', goToPrevChapter);
if (nextChapter) nextChapter.addEventListener('click', goToNextChapter);

window.addEventListener('beforeunload', saveReadingPosition);

document.addEventListener('DOMContentLoaded', loadChapter);