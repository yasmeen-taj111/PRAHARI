// ==========================================================================
// Theme Management Engine (Light & Dark Mode)
// ==========================================================================

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function updateThemeLabel(theme) {
  const label = document.getElementById('theme-text-label');
  if (label) {
    label.innerText = theme === 'dark' ? 'Dark' : 'Light';
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('prahari_demo_theme', theme);
  updateThemeLabel(theme);
}

function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// Attach event listeners as soon as DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }

  // Update initial label
  updateThemeLabel(getCurrentTheme());
});

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
