document.getElementById('refreshBtn').addEventListener('click', () => {
  // Placeholder: hook this up to your data fetch logic
  console.log('Refresh clicked');
});

// --- Theme toggle ---
const THEME_KEY = 'admin-dashboard-theme';
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="var(--moon-fill)"/>';
const sunIcon = '<circle cx="12" cy="12" r="4.5" fill="var(--moon-fill)"/>' +
  '<g stroke="var(--moon-fill)" stroke-width="1.8" stroke-linecap="round">' +
  '<line x1="12" y1="1.5" x2="12" y2="4"/>' +
  '<line x1="12" y1="20" x2="12" y2="22.5"/>' +
  '<line x1="1.5" y1="12" x2="4" y2="12"/>' +
  '<line x1="20" y1="12" x2="22.5" y2="12"/>' +
  '<line x1="4.2" y1="4.2" x2="6" y2="6"/>' +
  '<line x1="18" y1="18" x2="19.8" y2="19.8"/>' +
  '<line x1="4.2" y1="19.8" x2="6" y2="18"/>' +
  '<line x1="18" y1="6" x2="19.8" y2="4.2"/>' +
  '</g>';

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeIcon.innerHTML = theme === 'dark' ? moonIcon : sunIcon;
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  localStorage.setItem(THEME_KEY, theme);
}

const savedTheme = localStorage.getItem(THEME_KEY);
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
applyTheme(savedTheme || (systemPrefersLight ? 'light' : 'dark'));

themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// --- Account dropdown ---
const accountBtn = document.getElementById('accountBtn');
const accountDropdown = document.getElementById('accountDropdown');

function closeDropdown() {
  accountDropdown.classList.remove('open');
  accountBtn.setAttribute('aria-expanded', 'false');
}

function openDropdown() {
  accountDropdown.classList.add('open');
  accountBtn.setAttribute('aria-expanded', 'true');
}

accountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = accountDropdown.classList.contains('open');
  isOpen ? closeDropdown() : openDropdown();
});

document.addEventListener('click', (e) => {
  if (!accountDropdown.contains(e.target) && e.target !== accountBtn) {
    closeDropdown();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDropdown();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  window.location.href = 'admin-login.html';
});

// --- Admin ID (populate this once the backend is connected) ---
// Call setAdminId('12345678') after fetching the logged-in admin's ID
// from your backend/auth response.
function setAdminId(id) {
  document.getElementById('accountId').textContent = id ? `ID: ${id}` : 'ID: —';
}