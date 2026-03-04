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

// Load saved preferences from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
const savedFont = localStorage.getItem('font') || 'amiri';
const savedFontSize = localStorage.getItem('fontSize') || 20;

// Apply saved preferences
document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-font', savedFont);
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
        
        // Toggle theme picker, close others
        if (themePicker) {
            themePicker.classList.toggle('active');
            if (fontPicker) fontPicker.classList.remove('active');
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
        // Don't close if it's theme or font toggle (handled separately)
        if (link.id === 'themeToggle' || link.id === 'fontToggle') {
            e.preventDefault();
            return;
        }
        
        // Close mobile menu
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        
        // Close pickers
        if (themePicker) themePicker.classList.remove('active');
        if (fontPicker) fontPicker.classList.remove('active');
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
document.addEventListener('DOMContentLoaded', () => {
    loadDiwanGrid();
});