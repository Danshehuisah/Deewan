// ===== DOM Elements =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const diwanTitle = document.getElementById('diwanTitle');
const hurufList = document.getElementById('hurufList');
const continueReading = document.getElementById('continueReading');
let continueCard = document.getElementById('continueCard');
const continueHeading = document.querySelector('.continue-reading h3');

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

const overlay = document.createElement('div');
overlay.className = 'picker-overlay';
document.body.appendChild(overlay);

// ===== URL Params =====
const urlParams = new URLSearchParams(window.location.search);
const diwanId = urlParams.get('diwan');

// ===== Diwan titles (Short Versions) =====
const diwanTitles = {
    1: "تَيْسِيرُ الْوُصُولِ",
    2: "إِكْسِيرُ السَّعَادَاتِ",
    3: "سَلْوَةُ الشُّجُونِ",
    4: "أَوْثَقُ الْعُرَى",
    5: "شِفَاءُ الْأَسْقَامِ",
    6: "مَنَاسِكُ أَهْلِ الْوِدَادِ",
    7: "نُورُ الْحَقِّ",
    8: "سَيْرُ الْقَلْبِ",
    9: "كَنْزُ الْعَارِفِينَ"
};

// ===== Hardcoded chapter counts =====
const DIWAN_CHAPTER_COUNTS = { 1: 28, 2: 32, 3: 37, 4: 29, 5: 30, 6: 29, 7: 28, 8: 25, 9: 6 };

// ===== State =====
let translations = {};
let totalChapters = DIWAN_CHAPTER_COUNTS[diwanId] || 0;
let diwanIndex = null;

// ===== Path helper =====
function dataPath(file) {
    const inHtml = window.location.pathname.includes('/html/');
    const prefix = inHtml ? '../deewan-text' : 'deewan-text';
    return `${prefix}/${diwanId}/${file}`;
}

// ===== Storage =====
const getStorageKey = () => `diwan_${diwanId}_last_read`;
const getIndexCacheKey = () => `diwan_${diwanId}_index_v1`;

// ===== Preferences =====
const savedTheme = localStorage.getItem('theme') || 'light';
const savedFont = localStorage.getItem('font') || 'scheherazade';
const savedFontSize = localStorage.getItem('fontSize') || 20;
let savedLanguage = localStorage.getItem('language') || 'en';

document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-font', savedFont);
document.documentElement.setAttribute('lang', savedLanguage);
document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
// Note: We do not apply the root font size anymore to prevent UI breakage
// document.documentElement.style.setProperty('--base-font-size', savedFontSize + 'px');
// document.documentElement.style.fontSize = savedFontSize + 'px';

if (fontSizeSlider) fontSizeSlider.value = savedFontSize;
if (fontSizeValue) fontSizeValue.textContent = savedFontSize;

themeBtns.forEach(btn => { if (btn.dataset.theme === savedTheme) btn.classList.add('active'); });
fontBtns.forEach(btn => { if (btn.dataset.font === savedFont) btn.classList.add('active'); });
languageBtns.forEach(btn => { if (btn.dataset.lang === savedLanguage) btn.classList.add('active'); });

// ===== Menu helpers =====
function closeAllMenus() {
    if (navMenu) navMenu.classList.remove('active');
    if (hamburger) {
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

// ===== Translations =====
function localeCacheKey(lang) { return `locale_${lang}_v1`; }

async function loadTranslations() {
    try {
        const cached = localStorage.getItem(localeCacheKey(savedLanguage));
        if (cached) {
            translations = JSON.parse(cached);
            applyTranslations();
            return;
        }
        const path = window.location.pathname.includes('html/') ? '../locales/' : 'locales/';
        const response = await fetch(`${path}${savedLanguage}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        translations = await response.json();
        localStorage.setItem(localeCacheKey(savedLanguage), JSON.stringify(translations));
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

    if (continueHeading) {
        continueHeading.innerHTML = t.diwan?.continue || continueHeading.innerHTML;
    }
    updateContinueCard();
}

// ===== Load index.json =====
async function loadDiwanIndex() {
    const cached = localStorage.getItem(getIndexCacheKey());
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length) {
                diwanIndex = parsed;
                return;
            }
        } catch {}
    }

    try {
        const res = await fetch(dataPath('index.json'));
        if (!res.ok) throw new Error('index.json not found');
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
            diwanIndex = data;
            try { localStorage.setItem(getIndexCacheKey(), JSON.stringify(data)); } catch {}
        }
    } catch (err) {
        console.warn('index.json missing', err);
        diwanIndex = null;
    }
}

// ===== Load chapters =====
async function loadChapters() {
    if (!diwanId) { window.location.href = '../index.html'; return; }

    // Apply Short Title directly
    const shortTitle = diwanTitles[diwanId] || `الديوان ${diwanId}`;
    const shortEl = document.getElementById('diwanShortTitle');
    if (shortEl) shortEl.textContent = shortTitle;

    const [, ] = await Promise.all([ loadTranslations(), loadDiwanIndex() ]);

    if (diwanTitle) {
        diwanTitle.textContent = `${translations.diwan?.title || 'الديوان'}`;
    }

    if (totalChapters === 0) totalChapters = await detectTotalChaptersFallback();

    if (totalChapters === 0) {
        if (hurufList) hurufList.innerHTML = `<div class="error">${translations.diwan?.error || 'لَا تُوجَدُ فُصُولٌ'}</div>`;
        return;
    }

    renderChapters();
    loadLastRead();
}

// Fallback probe
async function fileExists(n) {
    try {
        const res = await fetch(dataPath(`${n}.json`), { method: 'HEAD' });
        return res.ok;
    } catch { return false; }
}

async function detectTotalChaptersFallback() {
    if (!(await fileExists(1))) return 0;
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
    return low;
}

// ===== Render chapters =====
function renderChapters() {
    if (!hurufList) return;
    hurufList.innerHTML = '';

    const frag = document.createDocumentFragment();

    for (let i = 0; i < totalChapters; i++) {
        const index = i;
        let title = '';
        let preview = '';

        if (diwanIndex) {
            const entry = diwanIndex.find(e => e.n === i + 1) || diwanIndex[i];
            if (entry) {
                title = entry.title || '';
                preview = entry.preview || '';
            }
        }

        if (!title || !title.trim()) {
            title = `${translations.diwan?.huruf || 'الْحَرْفُ'} ${i + 1}`;
        }

        const item = document.createElement('div');
        item.className = 'huruf-item';
        item.innerHTML = `
            <h3 class="chapter-title">${title}</h3>
            ${preview ? `<div class="huruf-preview">${preview}</div>` : ''}
        `;

        item.addEventListener('click', () => {
            window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${index}`;
        });

        frag.appendChild(item);
    }

    hurufList.appendChild(frag);

    // Restore exact scroll position
    const savedY = sessionStorage.getItem(`diwan_${diwanId}_scroll_y`);
    if (savedY !== null) {
        hurufList.style.opacity = '0';
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, parseInt(savedY, 10));
        requestAnimationFrame(() => {
            hurufList.style.opacity = '1';
            setTimeout(() => { document.documentElement.style.scrollBehavior = ''; }, 50);
        });
    }
}

// ===== Continue reading =====
function loadLastRead() {
    const lastRead = localStorage.getItem(getStorageKey());
    if (!lastRead || !continueReading) {
        if (continueReading) continueReading.style.display = 'none';
        return;
    }

    try {
        const { chapterIndex, chapterTitle, versePreview } = JSON.parse(lastRead);
        if (chapterIndex === undefined || chapterIndex === null) {
            continueReading.style.display = 'none';
            return;
        }
        continueReading.style.display = 'block';
        updateContinueCard(chapterIndex, chapterTitle, versePreview);
    } catch (error) {
        console.error('Error loading last read:', error);
        if (continueReading) continueReading.style.display = 'none';
    }
}

function updateContinueCard(chapterIndex, chapterTitle, versePreview) {
    if (!continueCard || !translations.diwan) return;
    const t = translations.diwan;

    if (chapterIndex !== undefined && chapterTitle && versePreview) {
        continueCard.innerHTML = `
            <h4>${chapterTitle}</h4>
            <div class="continue-preview">
                <span class="continue-text">${versePreview}</span>
                <span class="continue-badge">${t.lastRead || ''}</span>
            </div>
        `;

        const newCard = continueCard.cloneNode(true);
        continueCard.parentNode.replaceChild(newCard, continueCard);
        continueCard = newCard;

        newCard.addEventListener('click', () => {
            window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex}`;
        });
    }
}

// ===== Event listeners =====
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

themeBtns.forEach(btn => btn.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', btn.dataset.theme);
    localStorage.setItem('theme', btn.dataset.theme);
    themeBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
    closeAllMenus();
}));

fontBtns.forEach(btn => btn.addEventListener('click', () => {
    document.documentElement.setAttribute('data-font', btn.dataset.font);
    localStorage.setItem('font', btn.dataset.font);
    fontBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
    closeAllMenus();
}));

languageBtns.forEach(btn => btn.addEventListener('click', async (e) => {
    e.preventDefault(); e.stopPropagation();
    const lang = btn.dataset.lang;
    localStorage.setItem('language', lang); localStorage.setItem('hasVisited', 'true');
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    savedLanguage = lang;
    languageBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
    await loadTranslations(); closeAllMenus();
    
    // Update short title on language change
    const shortTitle = diwanTitles[diwanId] || `الديوان ${diwanId}`;
    const shortEl = document.getElementById('diwanShortTitle');
    if (shortEl) shortEl.textContent = shortTitle;

    renderChapters();
    loadLastRead();
}));

// Isolated font slider
if (fontSizeSlider) {
    let timeout;
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        if (fontSizeValue) fontSizeValue.textContent = size;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            localStorage.setItem('fontSize', size);
            // We can safely apply it to just the previews if we want
            // document.querySelectorAll('.huruf-preview').forEach(p => p.style.fontSize = (size * 0.8) + 'px');
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
            sessionStorage.removeItem(`diwan_${diwanId}_scroll_y`); // Clear scroll on Home nav
            window.location.href = '../index.html';
        }
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && !e.target.closest('.nav-menu') && navMenu?.classList.contains('active')) {
        closeAllMenus();
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 10 && navMenu?.classList.contains('active')) closeAllMenus();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && diwanId) loadLastRead();
});

// ===== Hardware Back Button (Android) =====
document.addEventListener('DOMContentLoaded', () => {
    window.history.pushState({ page: 'chapters' }, '', window.location.href);
    window.addEventListener('popstate', () => {
        window.location.href = `../index.html`;
    });
    loadChapters();
});