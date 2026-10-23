// ===== DOM Elements =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const diwanTitle = document.getElementById('diwanTitle');
const diwanFullTitle = document.getElementById('diwanFullTitle');
const hurufList = document.getElementById('hurufList');
const continueReading = document.getElementById('continueReading');
let continueCard = document.getElementById('continueCard');
const continueHeading = document.querySelector('.continue-reading h3');

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

// ===== Diwan titles =====
const diwanTitles = {
    1: "تَيْسِيرُ الْوُصُولِ إِلَىٰ حَضْرَةِ الرَّسُولِ",
    2: "إِكْسِيرُ السَّعَادَةِ",
    3: "سَلْوَى الْمَشْجُونِ",
    4: "أَوْثَقُ الْعُرَىٰ فِي مَدْحِ سَيِّدِ الْوَرَىٰ",
    5: "شِفَاءُ الْأَسْقَامِ",
    6: "مَنَاسِكُ أَهْلِ الْوِدَادِ",
    7: "نُورُ الْحَقِّ",
    8: "سَيْرُ الْقَلْبِ",
    9: "كَنْزُ الْعَارِفِين"
};

// ===== State =====
let translations = {};
let totalChapters = 0;

// ===== Path helper (works from /html/ or root) =====
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
    if (hamburger) hamburger.classList.remove('active');
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
        hamburger.classList.remove('active');
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

    if (continueHeading) {
        continueHeading.innerHTML = t.diwan?.continue || continueHeading.innerHTML;
    }

    updateContinueCard();
}

// ===== Chapter detection via HEAD probes =====
async function fileExists(n) {
    try {
        const res = await fetch(dataPath(`${n}.json`), { method: 'HEAD' });
        return res.ok;
    } catch {
        return false;
    }
}

async function detectTotalChapters() {
    // Exponential probe → binary search for scalability
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

// ===== Fetch a single chapter (for preview) =====
async function fetchChapter(n) {
    const res = await fetch(dataPath(`${n}.json`));
    if (!res.ok) throw new Error(`Chapter ${n} not found`);
    return await res.json();
}

// ===== Load chapters list =====
async function loadChapters() {
    if (!diwanId) {
        window.location.href = '../index.html';
        return;
    }

    try {
        await loadTranslations();

        if (diwanTitle) {
            diwanTitle.textContent = `${translations.diwan?.title || 'الديوان'} ${diwanId}`;
        }
        if (diwanFullTitle) {
            diwanFullTitle.textContent = diwanTitles[diwanId] || '';
        }

        if (hurufList) {
            hurufList.innerHTML = `<div class="loading">${translations.diwan?.loading || 'جَارِي التَّحْمِيلُ...'}</div>`;
        }

        // Detect chapter count
        await detectTotalChapters();

        if (totalChapters === 0) {
            if (hurufList) {
                hurufList.innerHTML = `<div class="error">${translations.diwan?.error || 'لَا تُوجَدُ فُصُولٌ'}</div>`;
            }
            return;
        }

        // Fetch only the first chapter for preview, then render list
        let firstChapter = null;
        try {
            firstChapter = await fetchChapter(1);
        } catch (e) {
            console.warn('Could not load first chapter preview:', e);
        }

        loadLastRead();
        renderChapters(firstChapter);

    } catch (error) {
        console.error('Error loading chapters:', error);
        if (hurufList) {
            hurufList.innerHTML = `<div class="error">${translations.diwan?.error || 'فشل تحميل الديوان'}</div>`;
        }
    }
}

// ===== Render chapters list (lazy previews) =====
function renderChapters(firstChapter) {
    if (!hurufList) return;
    hurufList.innerHTML = '';

    for (let i = 0; i < totalChapters; i++) {
        const index = i; // 0-based URL param
        const item = document.createElement('div');
        item.className = 'huruf-item';

        // Use the fetched first chapter for index 0; others get lazy preview
        let title = `${translations.diwan?.huruf || 'الْحَرْفُ'} ${i + 1}`;
        let previewText = '';

        if (i === 0 && firstChapter) {
            if (firstChapter.title) title = firstChapter.title;
            if (firstChapter.huruf && firstChapter.huruf[0]) {
                const fv = firstChapter.huruf[0][0] || '';
                previewText = fv.length > 50 ? fv.substring(0, 50) + '...' : fv;
            }
        }

        item.innerHTML = `
            <h3 class="chapter-title">${title}</h3>
            <div class="huruf-preview">${previewText || '…'}</div>
        `;

        // Lazy-load preview when visible
        observePreview(item, index);

        item.addEventListener('click', () => {
            window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${index}`;
        });

        hurufList.appendChild(item);
    }
}

// ===== Lazy preview loader via IntersectionObserver =====
const previewCache = new Map();

function observePreview(item, index) {
    const previewEl = item.querySelector('.huruf-preview');
    const titleEl = item.querySelector('.chapter-title');
    if (!previewEl) return;

    const observer = new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                observer.disconnect();
                try {
                    let chapter = previewCache.get(index);
                    if (!chapter) {
                        chapter = await fetchChapter(index + 1);
                        previewCache.set(index, chapter);
                    }
                    if (chapter.title && titleEl) titleEl.textContent = chapter.title;
                    const fv = chapter.huruf && chapter.huruf[0] ? chapter.huruf[0][0] : '';
                    previewEl.textContent = fv.length > 50 ? fv.substring(0, 50) + '...' : fv;
                } catch (e) {
                    // Silent fail — keep placeholder
                }
            }
        }
    }, { rootMargin: '100px' });

    observer.observe(item);
}

// ===== Continue reading card =====
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
            <div class="continue-preview">${versePreview}</div>
            <div class="continue-meta">
                <span class="continue-badge">${t.lastRead}</span>
                <span>${t.chapterNumber} ${chapterIndex + 1}</span>
            </div>
        `;

        // Re-attach click
        const newCard = continueCard.cloneNode(true);
        continueCard.parentNode.replaceChild(newCard, continueCard);
        continueCard = newCard;

        newCard.addEventListener('click', () => {
            window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex}`;
        });
    }
}

// ===== Event listeners =====
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
        // Refresh dynamic titles
        if (diwanTitle) diwanTitle.textContent = `${translations.diwan?.title || 'الديوان'} ${diwanId}`;
        loadLastRead();
        // Re-render chapter list titles with new translation fallback
        if (totalChapters > 0) {
            renderChapters(previewCache.get(0) || null);
            loadLastRead();
        }
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

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && diwanId) loadLastRead();
});

document.addEventListener('DOMContentLoaded', loadChapters);

if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        closePickersWhenNavOpens();
    });
}