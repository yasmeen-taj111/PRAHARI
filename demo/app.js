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

  showToast('✓ Test credentials populated into KYC form');
}

function handleFormSubmit(e) {
  e.preventDefault();
  showToast('🚀 Application submitted successfully to ISRO Antariksh Portal!');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
