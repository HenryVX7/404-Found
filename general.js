const loginUrls = {
  facebook:  'https://www.facebook.com/login.php',
  instagram: 'https://www.instagram.com/accounts/login/',
  google:    'https://accounts.google.com/signin',
  yelp:      'https://www.yelp.com/login'
};

document.querySelectorAll('.connect-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const platform = this.dataset.platform?.toLowerCase();

    // 1. redirect the user
    if (platform && loginUrls[platform]) {
      window.open(loginUrls[platform], '_blank');   
    }

    const statusEl =
      this.closest('.platform-item, .modal-platforms')
          ?.querySelector('.platform-status');

    if (statusEl && !statusEl.classList.contains('connected')) {
      statusEl.textContent = 'Pending...';
      statusEl.classList.add('connected');     
      this.textContent = 'Connected';
      this.style.background = '#00d4ff';
      this.style.color = '#000';
    }

    showConnectModal(false);
  });
});


// document.querySelectorAll('.connect-btn').forEach(btn => {
//             btn.addEventListener('click', function() {
//                 if (this.textContent === 'Connect') {
//                     this.textContent = 'Connected';
//                     this.style.background = '#00d4ff';
//                     this.style.color = '#000';
//                     this.previousElementSibling.querySelector('.platform-status').textContent = 'Connected';
//                 } else {
//                     this.textContent = 'Connect';
//                     this.style.background = 'transparent';
//                     this.style.color = '#fff';
//                     this.previousElementSibling.querySelector('.platform-status').textContent = 'Not connected';
//                 }
//             });
//         });
document.querySelectorAll('.connect-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const platform = this.dataset.platform?.toLowerCase();

    /* 1. open the real login page */
    if (platform && loginUrls[platform]) {
      window.open(loginUrls[platform], '_blank');          // new tab
    }

    /* 2. update UI so guards are satisfied (Pending → Connected) */
    const card = this.closest('.platform-item, .modal-platforms');
    const statusEl = card?.querySelector('.platform-status');

    if (statusEl && !statusEl.classList.contains('connected')) {
      statusEl.textContent = 'Pending...';
      statusEl.classList.add('connected');
      this.textContent = 'Connected';
      this.style.background = '#00d4ff';
      this.style.color = '#000';
    }

    /* 3. close modal if it was open */
    showConnectModal(false);
  });
});

/* ──────────────────  CONNECTION HELPERS  ─────────────────── */
function anyPlatformConnected() {
  return document.querySelector('.platform-status.connected') !== null;
}

function showErrorBanner(show = true) {
  const banner = document.getElementById('error-banner');
  if (banner) banner.style.display = show ? 'block' : 'none';
}

function showConnectModal(show = true) {
  const modal = document.getElementById('connect-modal');
  if (modal) modal.style.display = show ? 'flex' : 'none';
}

document.addEventListener('click', e => {
  if (e.target.id === 'close-modal') showConnectModal(false);
});

function requireConnection(fn) {
  if (!anyPlatformConnected()) {
    showConnectModal(true);
    return;
  }
  showConnectModal(false);
  showErrorBanner(false);
  fn();
}

window.requireConnection = requireConnection;