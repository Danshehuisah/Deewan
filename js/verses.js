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
const chapterIndex = parseInt(urlParams.get('chapter')) || 0;

// ===== Diwan titles & Counts =====
const diwanTitles = {
    1: "تَيْسِيرُ الْوُصُولِ",
    2: "إِكْسِيرُ السَّعَادَاتِ",
    3: "سَلْوَةُ الشُّجُونِ",
    4: "أَوْثَقُ الْعُرَى",
    5: "شِفَاءُ الْأَسْقَامِ",
    6: "مَنَاسِكُ أَهْلِ الْوِدَادِ",
    7: "نُورُ الْحَقِّ",
    8: "سَيْرُ الْقَلْبِ",
    9: "كَنْزُ الْعَارِفِينَ"
};
const DIWAN_CHAPTER_COUNTS = { 1: 28, 2: 32, 3: 37, 4: 29, 5: 30, 6: 29, 7: 28, 8: 25, 9: 6 };

// ===== State & Storage =====
let totalChapters = DIWAN_CHAPTER_COUNTS[diwanId] || 0;
let currentChapter = null;
let translations = {};
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

// Don't change the root font size, leave the UI elements alone
// document.documentElement.style.setProperty('--base-font-size', savedFontSize + 'px'); 
// document.documentElement.style.fontSize = savedFontSize + 'px';

// Instead, we wait for the DOM to load, then apply the saved size to the verses
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.verses-container');
    if (container) container.style.fontSize = savedFontSize + 'px';
});




if (fontSizeSlider) fontSizeSlider.value = savedFontSize;
if (fontSizeValue) fontSizeValue.textContent = savedFontSize;
themeBtns.forEach(btn => { if (btn.dataset.theme === savedTheme) btn.classList.add('active'); });
fontBtns.forEach(btn => { if (btn.dataset.font === savedFont) btn.classList.add('active'); });
languageBtns.forEach(btn => { if (btn.dataset.lang === savedLanguage) btn.classList.add('active'); });

// ===== Paths & Helpers =====
function dataPath(file) {
    const inHtml = window.location.pathname.includes('/html/');
    const prefix = inHtml ? '../deewan-text' : 'deewan-text';
    return `${prefix}/${diwanId}/${file}`;
}

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
    if (pickerToShow) { pickerToShow.classList.add('active'); overlay.classList.add('active'); }
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
    } catch (error) { console.error(error); translations = {}; }
}

function applyTranslations() {
    const t = translations;
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const keys = key.split('.');
        let value = t;
        for (const k of keys) { if (value && value[k]) value = value[k]; else { value = null; break; } }
        if (value) element.textContent = value;
    });

    // Arrows are handled via CSS, just set the text here
    if (prevChapter) prevChapter.innerHTML = t.diwan?.prev || 'الْحِزْبُ السَّابِقُ';
    if (nextChapter) nextChapter.innerHTML = t.diwan?.next || 'الْحِزْبُ التَّالِي';

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
// HOLY NAME STYLING — Index-Map Solution (Preserves Diacritics)
// ============================================================

// 1. Define name groups with their specific CSS classes
const NAME_GROUPS = [
    { class: 'holy-name-allah', names: ["الله", "إِلَهِي", "الْإِلَهُ", "رَبِّي", "الرَّبُّ", "رَبٌّ", "رَبُّ الْعَالَمِينَ", "رَبُّ النَّاسِ", "الْمَوْلَى", "الرَّحْمَنُ", "الْمَنَّانُ", "الْمَلِيكُ", "الدَّيَّانُ", "الْحَقُّ", "الْجَلِيلُ", "الْخَالِقُ", "الْبَارِي", "الْمُهَيْمِنُ", "الْمَعْبُودُ"] },
    { class: 'holy-name-ahmad', names: ["أَحْمَدُ", "أَحْمَدَ", "أَحْمَدِ"] },
    { class: 'holy-name-rasool', names: ["رَسُولُ اللهِ", "رَسُولُ الْعَالَمِينَ", "رَسُولُ إِلَهِ الْعَرْشِ", "رَسُول", "رَسُولِ", "رَسُولَ", "رَسُولُ"] },
    { class: 'holy-name-nabi', names: ["نَبِيُّنَا", "نَبِي", "نَبِيِّ", "نَبِيَّ", "نَبِيُّ"] },
    { class: 'holy-name-muhammad', names: ["مُحَمَّدٌ", "مُحَمَّدٍ", "مُحَمَّدًا", "مُحَمَّدُ", "مُحَمَّدِ", "طَهَ", "طَاهَ", "الْمُصْطَفَى", "الْمُخْتَارُ", "الْأَمِينُ", "الْمَأْمُونُ", "الْمَاحِي", "الْمَحْمُودُ", "أَبُو الْقَاسِمِ", "الْهَاشِمِيُّ", "عَبْدُ اللهِ", "السِّرَاجُ", "الْمُقَفَّى", "الْمُنْحَمِنَّا", "عَبْدُ الْإِلَهِ", "حَبِيبُ اللهِ", "أَمِينُ اللهِ", "الْمَنْصُورُ", "الْإِمَامُ الْهَاشِمِيُّ", "الصَّادِقُ الْمَصْدُوقُ", "الْهَادِي", "هَادِي الْبَرِيَّةِ", "خَيْرُ النَّاسِ", "خَيْرُ الْأَنَامِ", "خَيْرُ الْعَالَمِينَ", "خَيْرُ الْوَرَى", "خَيْرُ الْخَلاَئِقِ", "كَنْزُ الْبَرَايَا", "الشَّفِيعُ", "بَشِيرٌ نَذِيرٌ", "الْمُنْذِرُ الْمُبَشِّرُ", "الْقَرْمُ", "مَاحِ", "مَاحِي"] }
];

// Flatten and sort by length descending
const ALL_NAMES = [];
NAME_GROUPS.forEach(group => {
    group.names.forEach(name => {
        ALL_NAMES.push({ text: name, class: group.class });
    });
});
ALL_NAMES.sort((a, b) => b.text.length - a.text.length);

// Strip diacritics for matching
function stripDiacritics(str) {
    return str.replace(/[\u064B-\u065F\u0670]/g, '');
}

// Build a regex with a capture group for each name
const ALL_NAMES_REGEX = new RegExp(`(${ALL_NAMES.map(n => stripDiacritics(n.text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

function applyHolySpans(text, theme) {
    // 1. Escape HTML to prevent injection
    const escapedText = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // 2. Create a normalized version and a map back to original indices
    let normalized = '';
    const indexMap = []; // Maps normalized index -> original index
    
    for (let i = 0; i < escapedText.length; i++) {
        const char = escapedText[i];
        if (!/[\u064B-\u065F\u0670]/.test(char)) {
            normalized += char;
            indexMap.push(i);
        }
    }
    indexMap.push(escapedText.length); // Sentinel for end of string

    // 3. Find matches in the normalized string
    let match;
    const matches = [];
    ALL_NAMES_REGEX.lastIndex = 0; 
    
    while ((match = ALL_NAMES_REGEX.exec(normalized)) !== null) {
        const startNorm = match.index;
        const endNorm = startNorm + match[0].length;
        
        // Map back to original indices
        const origStart = indexMap[startNorm];
        const origEnd = indexMap[endNorm];
        
        matches.push({
            start: origStart,
            end: origEnd,
            text: match[0]
        });
    }

    if (matches.length === 0) return escapedText;

    // 4. Resolve overlaps (keep longest matches)
    matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const validMatches = [];
    let currentEnd = -1;
    
    for (const m of matches) {
        if (m.start >= currentEnd) {
            validMatches.push(m);
            currentEnd = m.end;
        }
    }

    // 5. Build the final HTML in one pass
    let result = '';
    let lastIndex = 0;
    
    for (const m of validMatches) {
        // Determine class based on normalized match text
        const normalizedMatch = stripDiacritics(m.text);
        const group = ALL_NAMES.find(n => stripDiacritics(n.text) === normalizedMatch);
        const cls = group ? group.class : 'holy-name-muhammad'; 
        
        result += escapedText.slice(lastIndex, m.start);
        const originalText = escapedText.slice(m.start, m.end);
        result += `<span class="${cls}" data-theme="${theme}">${originalText}</span>`;
        lastIndex = m.end;
    }
    result += escapedText.slice(lastIndex);
    
    return result;
}

function updateHolyNamesForTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.querySelectorAll('.holy-name-allah, .holy-name-muhammad, .holy-name-ahmad, .holy-name-rasool, .holy-name-nabi').forEach(name => name.setAttribute('data-theme', currentTheme));
}

// ===== Fetching & Loading =====
async function fetchChapter(index) {
    const file = `${index + 1}.json`;
    const res = await fetch(dataPath(file));
    if (!res.ok) throw new Error(`Chapter ${index + 1} not found`);
    return await res.json();
}

function schedulePrefetch(indices) {
    const run = () => { indices.forEach(idx => { if (idx >= 0 && idx < totalChapters) fetch(dataPath(`${idx + 1}.json`)).catch(() => {}); }); };
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 }); else setTimeout(run, 500);
}

async function loadChapter() {
    if (!diwanId) { window.location.href = '../index.html'; return; }
    loadTranslations();

    try {
        versesContainer.innerHTML = `<div class="loading">جَارِي التَّحْمِيلُ...</div>`;
        currentChapter = await fetchChapter(chapterIndex);
        updateNavbarWithBothTitles();
        renderCurrentChapter();
        updateProgress();
        updateNavigation();
        updatePositionDisplay();
        saveReadingPosition();
        schedulePrefetch([chapterIndex - 1, chapterIndex + 1, chapterIndex + 2]);
    } catch (error) {
        versesContainer.innerHTML = `<div class="error">فَشِلَ تَحْمِيلُ الْحِزْبِ</div>`;
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
    if (!currentChapter.huruf || !Array.isArray(currentChapter.huruf)) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const frag = document.createDocumentFragment();

    currentChapter.huruf.forEach(verse => {
        if (!Array.isArray(verse) || verse.length < 2) return;
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse-item';
        const line1 = document.createElement('div');
        line1.className = 'verse-line';
        line1.innerHTML = applyHolySpans(verse[0], currentTheme);
        const line2 = document.createElement('div');
        line2.className = 'verse-line';
        line2.innerHTML = applyHolySpans(verse[1], currentTheme);
        verseDiv.appendChild(line1);
        verseDiv.appendChild(line2);
        frag.appendChild(verseDiv);
    });
    versesContainer.appendChild(frag);
}

function updateProgress() {
    if (!progressBar || totalChapters === 0) return;
    progressBar.style.width = `${((chapterIndex + 1) / totalChapters) * 100}%`;
}
function updateNavigation() {
    if (prevChapter) prevChapter.disabled = chapterIndex <= 0;
    if (nextChapter) nextChapter.disabled = totalChapters === 0 || chapterIndex >= totalChapters - 1;
}

// ===== Scroll Memory & Navigation =====
function saveReadingPosition() {
    if (!currentChapter) return;
    const firstVerse = currentChapter.huruf && currentChapter.huruf[0] ? currentChapter.huruf[0][0] : '';
    const versePreview = firstVerse.length > 60 ? firstVerse.substring(0, 60) + '...' : firstVerse;
    localStorage.setItem(getStorageKey(), JSON.stringify({ chapterIndex, chapterTitle: currentChapter.title || `حرف ${chapterIndex + 1}`, versePreview }));
}

function saveScrollPosition() {
    sessionStorage.setItem(`diwan_${diwanId}_scroll_y`, window.scrollY);
}

function goToPrevChapter() { saveScrollPosition(); if (chapterIndex > 0) window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex - 1}`; }
function goToNextChapter() { saveScrollPosition(); if (chapterIndex < totalChapters - 1) window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex + 1}`; }
function goBackToChapters() { saveScrollPosition(); window.location.href = `chapter-index.html?diwan=${diwanId}`; }

// ===== Event Listeners =====
// ===== Event Listeners =====
if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => { 
        e.preventDefault();
        e.stopPropagation(); 
        
        // 1. Toggle the menu and hamburger icon
        const isOpen = !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', isOpen); 
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        
        // 2. Close auxiliary pickers WITHOUT closing the nav menu
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
    updateHolyNamesForTheme(); closeAllMenus();
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
    await loadTranslations(); closeAllMenus(); updateNavbarWithBothTitles();
}));

// ===== Font size slider (Targeted to Verses Only) =====
if (fontSizeSlider) {
    let timeout;
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value; 
        if (fontSizeValue) fontSizeValue.textContent = size;
        
        // Apply the font size directly to the verses container, not the whole app
        document.querySelector('.verses-container').style.fontSize = size + 'px';
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            localStorage.setItem('fontSize', size);
        }, 50);
    });
}
overlay.addEventListener('click', closeAllMenus);

document.addEventListener('click', (e) => { 
    if (!e.target.closest('.navbar') && !e.target.closest('.nav-menu') && navMenu?.classList.contains('active')) {
        closeAllMenus(); 
    }
});

if (backToChapters) backToChapters.addEventListener('click', goBackToChapters);
if (prevChapter) prevChapter.addEventListener('click', goToPrevChapter);
if (nextChapter) nextChapter.addEventListener('click', goToNextChapter);

window.addEventListener('pagehide', saveScrollPosition);
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveScrollPosition(); });

document.addEventListener('DOMContentLoaded', () => {
    window.history.pushState({ page: 'verses' }, '', window.location.href);
    window.addEventListener('popstate', () => {
        window.location.href = `chapter-index.html?diwan=${diwanId}`;
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === '../index.html' || link.dataset.i18n === 'nav.home') {
            link.addEventListener('click', () => {
                sessionStorage.removeItem(`diwan_${diwanId}_scroll_y`);
            });
        }
    });

    loadChapter();
});