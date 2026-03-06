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

// Language Modal elements
const languageModal = document.getElementById('languageModal');
const modalLanguageBtns = document.querySelectorAll('.modal-language-btn');

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

// Translation cache
let translations = {};

// Load saved preferences from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
const savedFont = localStorage.getItem('font') || 'scheherazade';
const savedFontSize = localStorage.getItem('fontSize') || 20;

// Validate language before using it
function validateLanguage() {
    const savedLang = localStorage.getItem('language');
    const validLanguages = ['ar', 'en', 'fr'];
    
    if (!savedLang || !validLanguages.includes(savedLang)) {
        // Invalid or missing language, clear it
        localStorage.removeItem('language');
        localStorage.removeItem('hasVisited');
        return false;
    }
    return true;
}

// Set initial language based on validation
let savedLanguage = 'en'; // Default
if (validateLanguage()) {
    savedLanguage = localStorage.getItem('language');
} else {
    localStorage.setItem('language', 'en');
    savedLanguage = 'en';
}

// Check if user has visited before
const hasVisited = localStorage.getItem('hasVisited');

// Apply saved preferences (but don't apply language yet if first time)
document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-font', savedFont);

// Only apply language if user has visited before
if (hasVisited) {
    document.documentElement.setAttribute('lang', savedLanguage);
    document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
}

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

// Only update language button active state if user has visited
if (hasVisited) {
    languageBtns.forEach(btn => {
        if (btn.dataset.lang === savedLanguage) {
            btn.classList.add('active');
        }
    });
}

// ===== LANGUAGE MODAL FOR FIRST TIME USERS =====

// Show language selection modal
function showLanguageModal() {
    if (languageModal) {
        languageModal.classList.add('active');
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }
}

// Initialize app function
async function initializeApp() {
    // Load translations and update texts
    await initializeLanguage(savedLanguage);
    
    // Load diwan grid
    loadDiwanGrid();
    
    // Update active language button
    languageBtns.forEach(btn => {
        if (btn.dataset.lang === savedLanguage) {
            btn.classList.add('active');
        }
    });
}

// Handle language selection from modal
if (modalLanguageBtns) {
    modalLanguageBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const selectedLang = btn.dataset.lang;
            
            // Save that user has visited
            localStorage.setItem('hasVisited', 'true');
            
            // Save selected language
            localStorage.setItem('language', selectedLang);
            
            // Update savedLanguage variable
            savedLanguage = selectedLang;
            
            // Update HTML attributes
            document.documentElement.setAttribute('lang', selectedLang);
            document.documentElement.setAttribute('dir', selectedLang === 'ar' ? 'rtl' : 'ltr');
            
            // Hide modal
            if (languageModal) {
                languageModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Initialize app with selected language
            await initializeLanguage(selectedLang);
            
            // Load diwan grid
            loadDiwanGrid();
        });
    });
}

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

// Language button clicks (for navbar)
languageBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const lang = btn.dataset.lang;
        
        // Set language
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('language', lang);
        localStorage.setItem('hasVisited', 'true'); // Ensure visited flag is set
        
        // Update savedLanguage variable
        savedLanguage = lang;
        
        // Update active states
        languageBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Load translations and update texts
        await initializeLanguage(lang);
        
        // Close language picker
        closeAllMenus();
    });
});

// Font size slider - UPDATED to affect all elements
if (fontSizeSlider) {
    let timeout;
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        fontSizeValue.textContent = size;
        
        // Debounce the actual resize to prevent layout thrashing
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            document.documentElement.style.setProperty('--base-font-size', size + 'px');
            document.documentElement.style.fontSize = size + 'px';
            localStorage.setItem('fontSize', size);
        }, 50);
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
        
        // Handle home link specially (stay on same page)
        if (link.dataset.i18n === 'nav.home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
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

// Initialize - Start the app with first-time modal check
document.addEventListener('DOMContentLoaded', () => {
    // Validate language and check first time
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