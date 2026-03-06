// DOM Elements
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

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'picker-overlay';
document.body.appendChild(overlay);

// Diwan titles with proper Arabic vowels
const diwanTitles = {
    1: "تَيْسِيرُ الْوُصُولِ إِلَىٰ حَضْرَةِ الرَّسُولِ",
    2: "إِكْسِيرُ السَّعَادَةِ",
    3: "سَلْوَى الْمَشْجُونِ",
    4: "أَوْثَقُ الْعُرَىٰ فِي مَدْحِ سَيِّدِ الْوَرَىٰ",
    5: "شِفَاءُ الْأَسْقَامِ",
    6: "مَنَاسِكُ أَهْلِ الْوِدَادِ",
    7: "نُورُ الْحَقِّ",
    8: "سَيْرُ الْقَلْبِ"
};

// Get diwan ID from URL
const urlParams = new URLSearchParams(window.location.search);
const diwanId = urlParams.get('diwan');

// State
let translations = {};

// Storage key for reading progress
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

// Load translations
async function loadTranslations() {
    try {
        const path = window.location.pathname.includes('/html/') ? '../locales/' : 'locales/';
        const response = await fetch(`${path}${savedLanguage}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        translations = await response.json();
        console.log('Translations loaded:', translations);
        applyTranslations();
        return translations;
    } catch (error) {
        console.error('Error loading translations:', error);
        translations = {};
    }
}

// Apply translations to UI
function applyTranslations() {
    const t = translations;
    if (!t) return;
    
    console.log('Applying translations, found elements:', document.querySelectorAll('[data-i18n]').length);
    
    // Update ALL elements with data-i18n attributes
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
            console.log(`Updated ${key} to:`, value);
        } else {
            console.warn(`Translation missing for key: ${key}`);
        }
    });
    
    // Update continue reading heading
    if (continueHeading) {
        continueHeading.innerHTML = t.diwan?.continue || continueHeading.innerHTML;
    }
    
    // Update the continue card if it exists
    updateContinueCard();
}

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
        
        // Set theme
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update active states
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Close picker after selection
        closeAllMenus();
    });
});

// Font button clicks - CLOSE PICKER AFTER SELECTION
fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const font = btn.dataset.font;
        
        // Set font
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('font', font);
        
        // Update active states
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Close picker after selection
        closeAllMenus();
    });
});

// Language button clicks - SINGLE HANDLER
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
        
        // Load translations and apply them
        await loadTranslations();
        
        // Close language picker
        closeAllMenus();
        
        // Force update of any dynamic content
        if (diwanId) {
            // Update diwan title with new translation
            if (diwanTitle) {
                diwanTitle.textContent = `${translations.diwan?.title || 'الديوان'} ${diwanId}`;
            }
        }
        
        // Force update of the continue card if it exists
        loadLastRead();
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

// Nav menu link clicks - close menu after click
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

// Close pickers when clicking outside - SIMPLIFIED
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

// Load last read position
function loadLastRead() {
    const lastRead = localStorage.getItem(getStorageKey());
    
    if (!lastRead || !continueReading) {
        if (continueReading) {
            continueReading.style.display = 'none';
        }
        return;
    }
    
    try {
        const { chapterIndex, chapterTitle, versePreview } = JSON.parse(lastRead);
        
        if (chapterIndex === undefined || chapterIndex === null) {
            continueReading.style.display = 'none';
            return;
        }
        
        continueReading.style.display = 'block';
        
        // Update the continue card with translations
        updateContinueCard(chapterIndex, chapterTitle, versePreview);
        
    } catch (error) {
        console.error('Error loading last read:', error);
        if (continueReading) {
            continueReading.style.display = 'none';
        }
    }
}

// Update continue card with translations
function updateContinueCard(chapterIndex, chapterTitle, versePreview) {
    if (!continueCard || !translations.diwan) return;
    
    const t = translations.diwan;
    
    if (chapterIndex !== undefined && chapterTitle && versePreview) {
        // We have data - populate the card
        continueCard.innerHTML = `
            <h4>${chapterTitle}</h4>
            <div class="continue-preview">${versePreview}</div>
            <div class="continue-meta">
                <span class="continue-badge">${t.lastRead}</span>
                <span>${t.chapterNumber} ${chapterIndex + 1}</span>
            </div>
        `;
        
        // Re-attach click event
        const newCard = continueCard.cloneNode(true);
        continueCard.parentNode.replaceChild(newCard, continueCard);
        continueCard = newCard;
        
        newCard.addEventListener('click', () => {
            window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${chapterIndex}`;
        });
    }
}

// Load chapter data
async function loadChapters() {
    if (!diwanId) {
        window.location.href = '../index.html';
        return;
    }

    try {
        // Load translations first
        await loadTranslations();
        
        // APPLY TRANSLATIONS TO NAV AND ALL ELEMENTS
        applyTranslations();
        
        if (diwanTitle) {
            diwanTitle.textContent = `${translations.diwan?.title || 'الديوان'} ${diwanId}`;
        }
        if (diwanFullTitle) {
            diwanFullTitle.textContent = diwanTitles[diwanId] || '';
        }

        const response = await fetch(`../deewan-text/${diwanId}.json`);
        if (!response.ok) throw new Error('Failed to load diwan');
        
        const data = await response.json();
        const chapters = Array.isArray(data) ? data : [data];
        
        loadLastRead();
        renderChapters(chapters);
        
    } catch (error) {
        console.error('Error loading chapters:', error);
        if (hurufList) {
            hurufList.innerHTML = `<div class="error">${translations.diwan?.error || 'فشل تحميل الديوان'}</div>`;
        }
    }
}

// Render chapters list
function renderChapters(chapters) {
    if (!hurufList) return;
    
    hurufList.innerHTML = '';
    
    chapters.forEach((chapter, index) => {
        const firstVerse = chapter.huruf && chapter.huruf[0] ? chapter.huruf[0][0] : '';
        const previewText = firstVerse.length > 50 ? firstVerse.substring(0, 50) + '...' : firstVerse;
        
        const item = document.createElement('div');
        item.className = 'huruf-item';
        item.innerHTML = `
            <h3>${chapter.title || `${translations.diwan?.huruf || 'الْحَرْفُ'} ${index + 1}`}</h3>
            <div class="huruf-preview">${previewText}</div>
        `;
        
        item.addEventListener('click', () => {
            window.location.href = `huruf-view.html?diwan=${diwanId}&chapter=${index}`;
        });
        
        hurufList.appendChild(item);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadChapters);

// Also run when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && diwanId) {
        loadLastRead();
    }
});