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

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = new FormData(form).get('email');
  if (!email || !String(email).includes('@')) {
    message.textContent = 'Enter a valid email address to request your invite.';
    form.querySelector('input').focus();
    return;
  }
  message.textContent = 'You’re on the list. We’ll be in touch with the invitation details.';
  form.reset();
});
