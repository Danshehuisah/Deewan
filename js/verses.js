// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbarBrand = document.querySelector('.nav-brand a');
const chapterNameElement = document.getElementById('chapterName');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const backToChapters = document.getElementById('backToChapters');
const prevChapter = document.getElementById('prevChapter');
const nextChapter = document.getElementById('nextChapter');
const currentPosition = document.getElementById('currentPosition');
const versesContainer = document.getElementById('versesContainer');
const verseNavigation = document.getElementById('verseNavigation');

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

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'picker-overlay';
document.body.appendChild(overlay);

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const diwanId = urlParams.get('diwan');
const chapterIndex = parseInt(urlParams.get('chapter')) || 0;

// Diwan titles array for the navbar (short form)
const diwanTitles = {
    1: "تَيْسِيرُ الْوُصُلِ",
    2: "إِكْسِيرُ السَّعَادَةِ",
    3: "سَلْوَى الْمَشْجُونِ",
    4: "أَوْثَقُ الْعُرَىٰ",
    5: "شِفَاءُ الْأَسْقَامِ",
    6: "مَنَاسِكُ أَهْلِ الْوِدَادِ",
    7: "نُورُ الْحَقِّ",
    8: "سَيْرُ الْقَلْبِ"
};

// State
let totalChapters = 0;
let chaptersData = [];
let currentChapter = null;
let translations = {};

// Storage keys
const getStorageKey = () => `diwan_${diwanId}_last_read`;

// Load saved preferences from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
const savedFont = localStorage.getItem('font') || 'scheherazade';
const savedFontSize = localStorage.getItem('fontSize') || 20;
let savedLanguage = localStorage.getItem('language') || 'en';

// Apply saved preferences
document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-font', savedFont);
document.documentElement.setAttribute('lang', savedLanguage);
document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');

// Apply saved font size to root element
document.documentElement.style.setProperty('--base-font-size', savedFontSize + 'px');
document.documentElement.style.fontSize = savedFontSize + 'px';

if (fontSizeSlider) fontSizeSlider.value = savedFontSize;
if (fontSizeValue) fontSizeValue.textContent = savedFontSize;

// Update active theme button
themeBtns.forEach(btn => {
    if (btn.dataset.theme === savedTheme) {
        btn.classList.add('active');
    }
});

// Update active font button
fontBtns.forEach(btn => {
    if (btn.dataset.font === savedFont) {
        btn.classList.add('active');
    }
});

// Update active language button
languageBtns.forEach(btn => {
    if (btn.dataset.lang === savedLanguage) {
        btn.classList.add('active');
    }
});

// ===== FUNCTION: Close All Menus and Pickers =====
function closeAllMenus() {
    // Close mobile menu
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
    }
    
    // Close all pickers
    if (themePicker && themePicker.classList.contains('active')) {
        themePicker.classList.remove('active');
    }
    if (fontPicker && fontPicker.classList.contains('active')) {
        fontPicker.classList.remove('active');
    }
    if (languagePicker && languagePicker.classList.contains('active')) {
        languagePicker.classList.remove('active');
    }
    
    // Hide overlay
    overlay.classList.remove('active');
}

// ===== FUNCTION: Close Pickers When Nav Opens =====
function closePickersWhenNavOpens() {
    if (navMenu && navMenu.classList.contains('active')) {
        if (themePicker) themePicker.classList.remove('active');
        if (fontPicker) fontPicker.classList.remove('active');
        if (languagePicker) languagePicker.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// ===== FUNCTION: Show Overlay =====
function showOverlay() {
    overlay.classList.add('active');
}

// ===== FUNCTION: Handle Picker Toggle =====
function togglePicker(pickerToShow) {
    // Close all pickers first
    if (themePicker) themePicker.classList.remove('active');
    if (fontPicker) fontPicker.classList.remove('active');
    if (languagePicker) languagePicker.classList.remove('active');
    
    // Close nav menu if open
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
    
    // Show the selected picker
    if (pickerToShow) {
        pickerToShow.classList.add('active');
        showOverlay();
    } else {
        overlay.classList.remove('active');
    }
}

// ===== FUNCTION: Load Translations =====
async function loadTranslations() {
    try {
        // Determine correct path based on current page
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

// ===== FUNCTION: Apply Translations to UI =====
function applyTranslations() {
    const t = translations;
    if (!t) return;
    
    // Update ALL elements with data-i18n attributes (including nav menu)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const keys = key.split('.');
        let value = t;
        
        // Navigate through the nested keys
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                value = null;
                break;
            }
        }
        
        if (value) {
            element.textContent = value;
        }
    });
    
    // Update back button
    if (backToChapters) {
        backToChapters.innerHTML = t.diwan?.back || '← الْعَوْدَةُ لِلْفُصُولِ';
    }
    
    // Update navigation buttons
    if (prevChapter) {
        prevChapter.textContent = t.diwan?.prev || 'الْحِزْبُ السَّابِقُ';
    }
    if (nextChapter) {
        nextChapter.textContent = t.diwan?.next || 'الْحِزْبُ التَّالِي';
    }
    
    // Update position display
    updatePositionDisplay();
    
    // Update navbar with both titles (to ensure translations are applied)
    updateNavbarWithBothTitles();
}

// ===== FUNCTION: Update Position Display =====
function updatePositionDisplay() {
    if (currentPosition && translations.diwan) {
        currentPosition.textContent = `${translations.diwan.chapterNumber || 'Chapter'} ${chapterIndex + 1} ${translations.diwan.progress || 'of'} ${totalChapters}`;
    } else if (currentPosition) {
        currentPosition.textContent = `${chapterIndex + 1} / ${totalChapters}`;
    }
}

// ===== FUNCTION: Update Holy Names =====
function styleHolyNames() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const verseLines = document.querySelectorAll('.verse-line');
    
    verseLines.forEach(line => {
        let html = line.innerHTML;
        
        // Style "الله" and variations
        html = html.replace(/(الله|اللَّهِ|اللَّهَ|اللَّه|اللَّهُ)/g, 
            '<span class="holy-name-allah" data-theme="' + currentTheme + '">$1</span>');
        
        // Style "محمد" and variations
        html = html.replace(/(مُحَمَّد|مُحَمَّدٍ|مُحَمَّدًا|مُحَمَّدُ|مُحَمَّدِ)/g, 
            '<span class="holy-name-muhammad" data-theme="' + currentTheme + '">$1</span>');
        
        // Style "أحمد" and variations
        html = html.replace(/(أَحْمَد|أَحْمَدَ|أَحْمَدُ|أَحْمَدِ)/g, 
            '<span class="holy-name-ahmad" data-theme="' + currentTheme + '">$1</span>');
        
        // Style "رسول"
        html = html.replace(/(رَسُول|رَسُولِ|رَسُولَ|رَسُولُ)/g, 
            '<span class="holy-name-rasool" data-theme="' + currentTheme + '">$1</span>');
        
        // Style "نبي"
        html = html.replace(/(نَبِي|نَبِيِّ|نَبِيَّ|نَبِيُّ)/g, 
            '<span class="holy-name-nabi" data-theme="' + currentTheme + '">$1</span>');
        
        line.innerHTML = html;
    });
}

// ===== FUNCTION: Update Holy Names for Theme =====
function updateHolyNamesForTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const holyNames = document.querySelectorAll('.holy-name-allah, .holy-name-muhammad, .holy-name-ahmad, .holy-name-rasool, .holy-name-nabi');
    
    holyNames.forEach(name => {
        name.setAttribute('data-theme', currentTheme);
    });
}

// ===== FUNCTION: Load Chapter Data =====
async function loadChapter() {
    if (!diwanId) {
        window.location.href = '../index.html';
        return;
    }

    try {
        // Load translations first
        await loadTranslations();
        
        if (versesContainer) {
            versesContainer.innerHTML = `<div class="loading">${translations.diwan?.loading || 'جَارِي التَّحْمِيلُ...'}</div>`;
        }

        const response = await fetch(`../deewan-text/${diwanId}.json`);
        if (!response.ok) throw new Error('Failed to load diwan');
        
        const data = await response.json();
        chaptersData = Array.isArray(data) ? data : [data];
        totalChapters = chaptersData.length;
        
        if (chapterIndex < 0 || chapterIndex >= totalChapters) {
            window.location.href = `chapter-index.html?diwan=${diwanId}`;
            return;
        }
        
        currentChapter = chaptersData[chapterIndex];
        
        // Update navbar with BOTH diwan title and huruf title
        updateNavbarWithBothTitles();
        
        renderCurrentChapter();
        updateProgress();
        updateNavigation();
        updatePositionDisplay();
        
        saveReadingPosition();
        
    } catch (error) {
        console.error('Error loading chapter:', error);
        if (versesContainer) {
            versesContainer.innerHTML = `<div class="error">${translations.diwan?.error || 'فَشِلَ تَحْمِيلُ الْحِزْبِ'}</div>`;
        }
    }
}

// ===== FUNCTION: Update Navbar with Both Diwan Title and Huruf Title =====
function updateNavbarWithBothTitles() {
    if (!navbarBrand || !currentChapter) return;
    
    // Get the diwan title from our mapping
    const diwanTitle = diwanTitles[diwanId] || `الديوان ${diwanId}`;
    
    // Get the huruf title from the JSON data
    let hurufTitle = currentChapter.title || '';
    
    // If for some reason the huruf title is empty, use a fallback
    if (!hurufTitle || hurufTitle.trim() === '') {
        hurufTitle = `حرف ${chapterIndex + 1}`;
    }
    
    // Combine them with a separator
    navbarBrand.innerHTML = `
        <span class="diwan-title-nav">${diwanTitle}</span>
        <span class="huruf-title-nav">${hurufTitle}</span>
    `;
    
    // Also update the chapter name element if it exists (for backward compatibility)
    if (chapterNameElement) {
        chapterNameElement.textContent = hurufTitle;
    }
}

// ===== FUNCTION: Render Current Chapter =====
function renderCurrentChapter() {
    if (!versesContainer || !currentChapter) return;
    
    versesContainer.innerHTML = '';
    
    if (!currentChapter.huruf || !Array.isArray(currentChapter.huruf)) {
        versesContainer.innerHTML = `<div class="error">${translations.diwan?.noVerses || 'لَا تُوجَدُ أَبْيَاتٌ فِي هَذَا الْحِزْبِ'}</div>`;
        return;
    }
    
    if (currentChapter.huruf.length === 0) {
        return;
    }
    
    currentChapter.huruf.forEach((verse, index) => {
        if (Array.isArray(verse) && verse.length >= 2) {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse-item';
            verseDiv.innerHTML = `
                <div class="verse-line">${verse[0]}</div>
                <div class="verse-line">${verse[1]}</div>
            `;
            versesContainer.appendChild(verseDiv);
        }
    });
    
    // Style holy names AFTER adding them to DOM
    setTimeout(() => {
        styleHolyNames();
    }, 50);
}

// ===== FUNCTION: Update Progress Bar =====
function updateProgress() {
    if (!progressBar) return;
    
    const progress = ((chapterIndex + 1) / totalChapters) * 100;
    progressBar.style.width = `${progress}%`;
}

// ===== FUNCTION: Update Navigation Buttons =====
function updateNavigation() {
    if (prevChapter) {
        prevChapter.disabled = chapterIndex <= 0;
    }
    if (nextChapter) {
        nextChapter.disabled = chapterIndex >= totalChapters - 1;
    }
}

// ===== FUNCTION: Save Reading Position =====
function saveReadingPosition() {
    if (!currentChapter) return;
    
    const firstVerse = currentChapter.huruf && currentChapter.huruf[0] ? currentChapter.huruf[0][0] : '';
    const versePreview = firstVerse.length > 60 ? firstVerse.substring(0, 60) + '...' : firstVerse;
    
    const lastRead = {
        chapterIndex: chapterIndex,
        chapterTitle: currentChapter.title || `حرف ${chapterIndex + 1}`,
        versePreview: versePreview
    };
    
    localStorage.setItem(getStorageKey(), JSON.stringify(lastRead));
}

// ===== NAVIGATION FUNCTIONS =====
function goToPrevChapter() {
    if (chapterIndex > 0) {
        window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex - 1}`;
    }
}

function goToNextChapter() {
    if (chapterIndex < totalChapters - 1) {
        window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex + 1}`;
    }
}

function goBackToChapters() {
    window.location.href = `chapter-index.html?diwan=${diwanId}`;
}

// ===== EVENT LISTENERS =====

// Toggle mobile menu - CLOSE PICKERS WHEN NAV OPENS
if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Close all pickers when nav menu opens
        closePickersWhenNavOpens();
    });
}

// Theme toggle click - CLOSE NAV AND OTHER PICKERS
if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (themePicker && !themePicker.classList.contains('active')) {
            togglePicker(themePicker);
        } else {
            togglePicker(null);
        }
    });
}

// Font toggle click - CLOSE NAV AND OTHER PICKERS
if (fontToggle) {
    fontToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (fontPicker && !fontPicker.classList.contains('active')) {
            togglePicker(fontPicker);
        } else {
            togglePicker(null);
        }
    });
}

// Language toggle click - CLOSE NAV AND OTHER PICKERS
if (languageToggle) {
    languageToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (languagePicker && !languagePicker.classList.contains('active')) {
            togglePicker(languagePicker);
        } else {
            togglePicker(null);
        }
    });
}

// Theme button clicks - CLOSE PICKER AFTER SELECTION
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        updateHolyNamesForTheme();
        
        // Close picker after selection
        closeAllMenus();
    });
});

// Font button clicks - CLOSE PICKER AFTER SELECTION
fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const font = btn.dataset.font;
        
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('font', font);
        
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Close picker after selection
        closeAllMenus();
    });
});

// Language button clicks - FIXED VERSION (no page reload)
languageBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const lang = btn.dataset.lang;
        console.log('Language button clicked:', lang);
        
        // Update active states
        languageBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Set language in localStorage
        localStorage.setItem('language', lang);
        
        // Update HTML attributes
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        
        // Update savedLanguage variable
        savedLanguage = lang;
        
        // Load translations and apply them WITHOUT page reload
        await loadTranslations();
        
        // Close language picker
        closeAllMenus();
        
        // Re-render the navbar titles with potentially new translations
        updateNavbarWithBothTitles();
    });
});

// Font size slider - UPDATED to affect all elements
if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        
        // Apply to root element and CSS variable
        document.documentElement.style.setProperty('--base-font-size', size + 'px');
        document.documentElement.style.fontSize = size + 'px';
        
        localStorage.setItem('fontSize', size);
        if (fontSizeValue) fontSizeValue.textContent = size;
    });
}

// Overlay click handler
overlay.addEventListener('click', () => {
    closeAllMenus();
});

// Nav menu link clicks - CLOSE EVERYTHING WHEN NAV LINK CLICKED
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.id === 'themeToggle' || link.id === 'fontToggle' || link.id === 'languageToggle') {
            e.preventDefault();
            return;
        }
        
        // Close everything
        closeAllMenus();
        
        if (link.getAttribute('href') === '../index.html') {
            window.location.href = '../index.html';
        }
    });
});

// Close pickers and nav when clicking outside - IMPROVED VERSION
document.addEventListener('click', (e) => {
    // Close nav menu if clicking outside navbar
    if (!e.target.closest('.navbar') && 
        !e.target.closest('.nav-menu a') &&
        navMenu?.classList.contains('active')) {
        closeAllMenus();
    }
});

// Close nav menu when scrolling
window.addEventListener('scroll', () => {
    if (window.scrollY > 10 && navMenu?.classList.contains('active')) {
        closeAllMenus();
    }
});

// Navigation button listeners
if (backToChapters) {
    backToChapters.addEventListener('click', goBackToChapters);
}
if (prevChapter) {
    prevChapter.addEventListener('click', goToPrevChapter);
}
if (nextChapter) {
    nextChapter.addEventListener('click', goToNextChapter);
}

// Save position when leaving page
window.addEventListener('beforeunload', () => {
    saveReadingPosition();
});

// Initialize
document.addEventListener('DOMContentLoaded', loadChapter);