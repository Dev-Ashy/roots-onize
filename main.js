const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#site-nav');
const form = document.querySelector('.rsvp-form');
const message = document.querySelector('.form-message');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.dataset.open = String(!isOpen);
  menuButton.querySelector('[aria-hidden="true"]').textContent = isOpen ? 'Menu' : 'Close';
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  delete navigation.dataset.open;
  const menuLabel = menuButton?.querySelector('[aria-hidden="true"]');
  if (menuLabel) menuLabel.textContent = 'Menu';
}));

// Admin password for the secret portal
const ADMIN_PASSWORD = 'roots2026';

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = form.querySelector('input[name="name"]')?.value || '';
  const email = new FormData(form).get('email');
  const phone = new FormData(form).get('phone');
  if (!email || !String(email).includes('@')) {
    message.textContent = 'Enter a valid email address.';
    form.querySelector('input')?.focus();
    return;
  }
  const submitBtn = form.querySelector('button');
  if (submitBtn) submitBtn.disabled = true;
  try {
    // Step 1: Register the guest
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone }),
    });
    const result = await response.json();
    if (!response.ok) {
      message.textContent = result.error || 'Something went wrong. Please try again.';
      return;
    }
    
    // Step 2: Show bank details and receipt upload
    message.innerHTML = `
      <p>Thank you! Please complete your payment:</p>
      <p>Amount: ₦120,000 per guest</p>
      <details>
        <summary>Bank account details</summary>
        <p>Bank Name: <em>[Please request from admin]</em></p>
        <p>Account Name: <em>Chef Onize</em></p>
        <p>Account Number: <em>[To be provided]</em></p>
      </details>
      <br />
      <input type="file" id="receiptUpload" accept="image/*" />
      <button id="uploadReceipt">Upload receipt</button>
      <p id="uploadStatus"></p>
      <button class="button button-primary" onClick="window.location.href='/admin'">I've paid - Show admin dashboard</button>
    `;
    
    // Handle receipt upload
    document.getElementById('uploadReceipt')?.addEventListener('click', (e) => {
      e.preventDefault();
      const file = document.getElementById('receiptUpload')?.files[0];
      if (!file) {
        document.getElementById('uploadStatus')?.textContent = 'Please select a receipt image.';
        return;
      }
      // Simulate upload - in production would upload to cloud storage
      document.getElementById('uploadStatus')?.textContent = 'Receipt received! Admin will verify.';
      
      // Notify admin (just log for now, would send email in production)
      fetch('/api/admin/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, hasPaid: true })
      }).catch(() => {});
    });
    
    form.reset();
  } catch (err) {
    console.error('RSVP submit error:', err);
    message.textContent = 'Something went wrong. Please try again.';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});
