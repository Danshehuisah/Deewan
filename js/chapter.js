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

// Load translations
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

// Apply translations to UI
function applyTranslations() {
    const t = translations;
    if (!t) return;
    
    // Update continue reading heading
    if (continueHeading) {
        continueHeading.innerHTML = t.diwan.continue;
    }
    
    // Update the continue card if it exists
    updateContinueCard();
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

// Language toggle click
if (languageToggle) {
    languageToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other pickers
        if (themePicker) themePicker.classList.remove('active');
        if (fontPicker) fontPicker.classList.remove('active');
        
        // Toggle language picker
        if (languagePicker) {
            languagePicker.classList.toggle('active');
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

// Language button clicks
languageBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const lang = btn.dataset.lang;
        
        // Set language
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        
        // Update active states
        languageBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Reload translations and refresh
        await loadTranslations();
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
        if (link.id === 'themeToggle' || link.id === 'fontToggle' || link.id === 'languageToggle') {
            e.preventDefault();
            return;
        }
        
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        
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
    } else {
        // Just update the heading (already done in applyTranslations)
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