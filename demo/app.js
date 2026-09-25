// ==========================================================================
// Theme Management Engine (Light & Dark Mode)
// ==========================================================================

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function updateThemeLabel(theme) {
  const label = document.getElementById('theme-text-label');
  const toggle = document.getElementById('theme-toggle-btn');
  if (label) {
    label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }
  if (toggle) {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    toggle.removeAttribute('title');
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('prahari_demo_theme', theme);
  } catch (_) {
    // Theme switching remains available when browser storage is restricted.
  }
  updateThemeLabel(theme);
}

function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function initialiseThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
  updateThemeLabel(getCurrentTheme());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseThemeToggle, { once: true });
} else {
  initialiseThemeToggle();
}

// ==========================================================================
// KYC Registration Form Actions
// ==========================================================================

function prefillDummyData() {
  document.getElementById('fullname').value = 'Dr. Vikram Sarabhai';
  document.getElementById('email').value = 'vikram.s@isro.gov.in';
  document.getElementById('mobile').value = '+91 98765 43210';
  document.getElementById('pan').value = 'AAAPB1234C';
  document.getElementById('aadhaar').value = '2938 4728 1934';
  document.getElementById('password').value = 'CosmicISRO@2026';
  document.getElementById('otp').value = '849201';
  document.getElementById('card-number').value = '4532 8901 2345 6789';
  document.getElementById('card-expiry').value = '08/29';
  document.getElementById('card-cvv').value = '742';

  showToast('Test credentials populated into registration form');
}

function handleFormSubmit(e) {
  e.preventDefault();
  showToast('KYC Application submitted securely to ISRO Antariksh Gateway');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
