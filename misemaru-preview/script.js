const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

const c = window.MISEMARU_CONFIG || {};
const phoneLink = document.getElementById('phoneLink');
const phoneText = document.getElementById('phoneText');
const mobilePhone = document.getElementById('mobilePhone');
const lineLink = document.getElementById('lineLink');
const instaLink = document.getElementById('instaLink');

if (c.phoneTel) {
  const phoneHref = 'tel:' + c.phoneTel;
  if (phoneLink) phoneLink.href = phoneHref;
  if (mobilePhone) {
    mobilePhone.href = phoneHref;
    mobilePhone.textContent = '電話する';
  }
  if (phoneText) phoneText.textContent = c.phoneDisplay || c.phoneTel;
} else {
  if (phoneLink) phoneLink.href = '#contact';
  if (mobilePhone) {
    mobilePhone.href = '#contact';
    mobilePhone.textContent = '電話相談';
  }
  if (phoneText) phoneText.textContent = '電話相談を希望する';
}

if (c.lineUrl && lineLink) {
  lineLink.href = c.lineUrl;
  lineLink.hidden = false;
}
if (c.instagramUrl && instaLink) {
  instaLink.href = c.instagramUrl;
  instaLink.hidden = false;
}

const form = document.querySelector('.contact-form');
const error = document.getElementById('formError');
if (form) {
  form.addEventListener('submit', (e) => {
    const phone = (document.getElementById('phone')?.value || '').trim();
    const email = (document.getElementById('email')?.value || '').trim();
    if (!phone && !email) {
      e.preventDefault();
      if (error) {
        error.textContent = 'ご返信先として、電話番号またはメールアドレスをどちらか1つ入力してください。';
        error.hidden = false;
      }
      document.getElementById('phone')?.focus();
      return;
    }
    if (error) error.hidden = true;
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();