// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const diwanGrid = document.getElementById('diwanGrid');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Load Diwan buttons
function loadDiwanGrid() {
    if (!diwanGrid) return;
    
    // Create 8 diwan buttons
    for (let i = 1; i <= 8; i++) {
        const button = document.createElement('div');
        button.className = 'diwan-btn';
        button.innerHTML = `
            <div class="diwan-number">${i}</div>
            <div class="diwan-title">الديوان ${i}</div>
        `;
        
        button.addEventListener('click', () => {
            alert(`Diwan ${i} clicked - Navigation will be added next`);
            // We'll add actual navigation in next step
        });
        
        diwanGrid.appendChild(button);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDiwanGrid();
});