// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const diwanGrid = document.getElementById('diwanGrid');

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

// Translation cache
let translations = {};

// Load saved preferences from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
const savedFont = localStorage.getItem('font') || 'scheherazade';
const savedFontSize = localStorage.getItem('fontSize') || 20;
const savedLanguage = localStorage.getItem('language') || 'ar';

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
async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
        translations[lang] = await response.json();
        return translations[lang];
    } catch (error) {
        console.error('Error loading translations:', error);
        return {};
    }
}

// Update text content based on language
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

// Get nested translation (e.g., 'nav.home')
function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] ? current[key] : null;
    }, obj);
}

// Initialize language
async function initializeLanguage(lang) {
    if (!translations[lang]) {
        await loadTranslations(lang);
    }
    updateTexts(lang);
}

// Toggle mobile menu
if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Close pickers when opening menu
        if (navMenu.classList.contains('active')) {
            if (themePicker) themePicker.classList.remove('active');
            if (fontPicker) fontPicker.classList.remove('active');
            if (languagePicker) languagePicker.classList.remove('active');
        }
    });
}

// Theme toggle click
if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle theme picker, close others
        if (themePicker) {
            themePicker.classList.toggle('active');
            if (fontPicker) fontPicker.classList.remove('active');
            if (languagePicker) languagePicker.classList.remove('active');
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
        
        // Toggle font picker, close others
        if (fontPicker) {
            fontPicker.classList.toggle('active');
            if (themePicker) themePicker.classList.remove('active');
            if (languagePicker) languagePicker.classList.remove('active');
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
        
        // Toggle language picker, close others
        if (languagePicker) {
            languagePicker.classList.toggle('active');
            if (themePicker) themePicker.classList.remove('active');
            if (fontPicker) fontPicker.classList.remove('active');
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
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('language', lang);
        
        // Update active states
        languageBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Load translations and update texts
        await initializeLanguage(lang);
        
        // Close language picker
        if (languagePicker) {
            languagePicker.classList.remove('active');
        }
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

// Load Diwan buttons
function loadDiwanGrid() {
    if (!diwanGrid) return;
    
    diwanGrid.innerHTML = '';
    
    for (let i = 1; i <= 8; i++) {
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    loadDiwanGrid();
    await initializeLanguage(savedLanguage);
});  

// ===== HOME LINK SPECIFIC HANDLER =====
// This makes the nav menu disappear when Home is clicked

// Get all nav menu links
const navLinks = document.querySelectorAll('.nav-menu a');

// Loop through each link
navLinks.forEach(link => {
    // Check if this is the Home link (by text content or data-i18n attribute)
    if (link.textContent.includes('الرئيسية') || 
        link.textContent.includes('Home') || 
        link.textContent.includes('Accueil') ||
        link.dataset.i18n === 'nav.home') {
        
        // Add click event to this specific link
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Stop any page refresh
            
            // Close the mobile menu if it's open
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
            
            // Fix the hamburger icon (turn it back to normal)
            if (hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
            }
            
            // Close any open pickers (theme, font, language)
            if (themePicker) themePicker.classList.remove('active');
            if (fontPicker) fontPicker.classList.remove('active');
            if (languagePicker) languagePicker.classList.remove('active');
            
        });
    }
});