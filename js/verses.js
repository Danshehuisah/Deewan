// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbarBrand = document.querySelector('.nav-brand a');
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

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const diwanId = urlParams.get('diwan');
const chapterIndex = parseInt(urlParams.get('chapter')) || 0;

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
const savedLanguage = localStorage.getItem('language') || 'en';

// Apply saved preferences
document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-font', savedFont);
document.documentElement.setAttribute('lang', savedLanguage);
document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
document.body.style.fontSize = savedFontSize + 'px';
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

// Load translations - FIXED PATH
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
        // Fallback to empty object
        translations = {};
    }
}

// Apply translations to UI
function applyTranslations() {
    const t = translations;
    if (!t) return;
    
    // Update back button
    if (backToChapters) {
        backToChapters.innerHTML = `<span></span> ${t.diwan?.back || 'الْعَوْدَةُ لِلْفُصُولِ'}`;
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
}

// Toggle mobile menu
if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Theme toggle click
if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other pickers
        if (fontPicker) fontPicker.classList.remove('active');
        if (languagePicker) languagePicker.classList.remove('active');
        
        // Toggle theme picker
        if (themePicker) {
            themePicker.classList.toggle('active');
        }
        
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Font toggle click
if (fontToggle) {
    fontToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other pickers
        if (themePicker) themePicker.classList.remove('active');
        if (languagePicker) languagePicker.classList.remove('active');
        
        // Toggle font picker
        if (fontPicker) {
            fontPicker.classList.toggle('active');
        }
        
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Language toggle click - FIXED
if (languageToggle) {
    languageToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other pickers
        if (themePicker) themePicker.classList.remove('active');
        if (fontPicker) fontPicker.classList.remove('active');
        
        // Toggle language picker - FIXED: Make sure picker exists
        if (languagePicker) {
            languagePicker.classList.toggle('active');
            console.log('Language picker toggled:', languagePicker.classList.contains('active')); // Debug
        } else {
            console.error('Language picker not found');
        }
        
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Theme button clicks
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        
        // Set theme
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update active states
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update holy names for new theme
        updateHolyNamesForTheme();
        
        // Close theme picker after selection
        if (themePicker) {
            themePicker.classList.remove('active');
        }
    });
});

// Font button clicks
fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const font = btn.dataset.font;
        
        // Set font
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('font', font);
        
        // Update active states
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Close font picker after selection
        if (fontPicker) {
            fontPicker.classList.remove('active');
        }
    });
});

// Language button clicks - FIXED
languageBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const lang = btn.dataset.lang;
        console.log('Language selected:', lang); // Debug
        
        // Set language
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        
        // Update active states
        languageBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Reload translations and refresh page to apply all changes
        await loadTranslations();
        
        // Close language picker after selection
        if (languagePicker) {
            languagePicker.classList.remove('active');
        }
        
        // Reload the page to apply all language changes
        window.location.reload();
    });
});

// Font size slider
if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        document.body.style.fontSize = size + 'px';
        localStorage.setItem('fontSize', size);
        if (fontSizeValue) fontSizeValue.textContent = size;
    });
}

// Nav menu link clicks - close menu after click
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Don't close if it's theme, font, or language toggle (handled separately)
        if (link.id === 'themeToggle' || link.id === 'fontToggle' || link.id === 'languageToggle') {
            e.preventDefault();
            return;
        }
        
        // Close mobile menu
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        
        // For home link, navigate to home
        if (link.getAttribute('href') === '../index.html') {
            window.location.href = '../index.html';
        }
    });
});

// Close pickers when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-picker') && 
        !e.target.closest('#themeToggle') && 
        themePicker?.classList.contains('active')) {
        themePicker.classList.remove('active');
    }
    
    if (!e.target.closest('.font-picker') && 
        !e.target.closest('#fontToggle') && 
        fontPicker?.classList.contains('active')) {
        fontPicker.classList.remove('active');
    }
    
    if (!e.target.closest('.language-picker') && 
        !e.target.closest('#languageToggle') && 
        languagePicker?.classList.contains('active')) {
        languagePicker.classList.remove('active');
    }
    
    if (!e.target.closest('.navbar') && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Style holy names function
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

// Update holy names when theme changes
function updateHolyNamesForTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const holyNames = document.querySelectorAll('.holy-name-allah, .holy-name-muhammad, .holy-name-ahmad, .holy-name-rasool, .holy-name-nabi');
    
    holyNames.forEach(name => {
        name.setAttribute('data-theme', currentTheme);
    });
}

// Update position display with current language
function updatePositionDisplay() {
    if (currentPosition && translations.diwan) {
        currentPosition.textContent = `${translations.diwan.chapterNumber || 'Chapter'} ${chapterIndex + 1} ${translations.diwan.progress || 'of'} ${totalChapters}`;
    } else if (currentPosition) {
        currentPosition.textContent = `${chapterIndex + 1} / ${totalChapters}`;
    }
}

// Load chapter data
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
        
        updateNavbarTitle();
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

// Update navbar title to show chapter name
function updateNavbarTitle() {
    if (!navbarBrand || !currentChapter) return;
    
    let chapterDisplay = currentChapter.title || `${translations.diwan?.chapter || 'الْحِزْبُ'} ${chapterIndex + 1}`;
    
    if (chapterDisplay.length > 30) {
        chapterDisplay = chapterDisplay.substring(0, 30) + '...';
    }
    
    navbarBrand.innerHTML = `ديوان الشيخ <span class="chapter-title-nav">| ${chapterDisplay}</span>`;
}

// Render current chapter
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

// Update progress bar
function updateProgress() {
    if (!progressBar) return;
    
    const progress = ((chapterIndex + 1) / totalChapters) * 100;
    progressBar.style.width = `${progress}%`;
}

// Update navigation buttons
function updateNavigation() {
    if (prevChapter) {
        prevChapter.disabled = chapterIndex <= 0;
    }
    if (nextChapter) {
        nextChapter.disabled = chapterIndex >= totalChapters - 1;
    }
}

// Save reading position
function saveReadingPosition() {
    if (!currentChapter) return;
    
    const firstVerse = currentChapter.huruf && currentChapter.huruf[0] ? currentChapter.huruf[0][0] : '';
    const versePreview = firstVerse.length > 60 ? firstVerse.substring(0, 60) + '...' : firstVerse;
    
    const lastRead = {
        chapterIndex: chapterIndex,
        chapterTitle: currentChapter.title || `${translations.diwan?.chapter || 'الْحِزْبُ'} ${chapterIndex + 1}`,
        versePreview: versePreview
    };
    
    localStorage.setItem(getStorageKey(), JSON.stringify(lastRead));
}

// Navigate to previous chapter
function goToPrevChapter() {
    if (chapterIndex > 0) {
        window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex - 1}`;
    }
}

// Navigate to next chapter
function goToNextChapter() {
    if (chapterIndex < totalChapters - 1) {
        window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex + 1}`;
    }
}

// Go back to chapters list
function goBackToChapters() {
    window.location.href = `chapter-index.html?diwan=${diwanId}`;
}

// Add event listeners
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
backToChapters
// Initialize
document.addEventListener('DOMContentLoaded', loadChapter);