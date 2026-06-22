/* ============================================================
   login.js — Operations Hub & Live Controller
   ============================================================ */
"use strict";

const users = [
  { name: "Yuvaraj Dev", email: "test@example.com", pwd: "Password123!" }
];

window.switchTab = function(tab) {
  document.getElementById('viewSignin').classList.toggle('active', tab === 'signin');
  document.getElementById('viewSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('tabSignin').classList.toggle('active', tab === 'signin');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  clearErrors();
};

function clearErrors() {
  ['si-error', 'su-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  document.querySelectorAll('input').forEach(inp => {
    inp.classList.remove('error-state', 'ok-state');
  });
}

window.toggleEye = function(inputId, openId, closedId) {
  const input = document.getElementById(inputId);
  const isOpen = input.type === 'text';
  input.type = isOpen ? 'password' : 'text';
  document.getElementById(openId).style.display = isOpen ? '' : 'none';
  document.getElementById(closedId).style.display = isOpen ? 'none' : '';
};

const pwdRules = {
  'r-len':   v => v.length >= 8,
  'r-upper': v => /[A-Z]/.test(v),
  'r-lower': v => /[a-z]/.test(v),
  'r-num':   v => /[0-9]/.test(v),
  'r-sym':   v => /[^A-Za-z0-9]/.test(v),
};

const COLORS = ['#f85149', '#f97316', '#eab308', '#22c55e', '#10b981'];
const LABELS = ['Critical vulnerabilities', 'Weak entry', 'Moderate defense', 'Strong validation', 'Perfect isolation'];

window.onPwdInput = function(val) {
  const wrap = document.getElementById('su-strengthWrap');
  const bar  = document.getElementById('su-strengthBar');
  const lbl  = document.getElementById('su-strengthLabel');
  
  if (!val) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  
  let score = 0;
  Object.entries(pwdRules).forEach(([id, test]) => {
    const el = document.getElementById(id);
    const passed = test(val);
    if (el) el.classList.toggle('met', passed);
    if (passed) score++;
  });
  
  const idx = Math.max(0, Math.min(score - 1, 4));
  bar.style.width = Math.round((score / 5) * 100) + '%';
  bar.style.backgroundColor = COLORS[idx];
  lbl.style.color = COLORS[idx];
  lbl.textContent = LABELS[idx];
  
  const conf = document.getElementById('su-confirm').value;
  if (conf) window.onConfirmInput(conf);
};

window.onConfirmInput = function(val) {
  const pwd = document.getElementById('su-pwd').value;
  const note = document.getElementById('su-match');
  const confirmInput = document.getElementById('su-confirm');
  
  if (!val) { note.textContent = ''; return; }
  if (val === pwd) {
    note.style.color = '#4ade80';
    note.textContent = '✓ Integrity Match Complete';
    confirmInput.classList.remove('error-state');
    confirmInput.classList.add('ok-state');
  } else {
    note.style.color = '#f85149';
    note.textContent = '✗ Password structural variance';
    confirmInput.classList.remove('ok-state');
    confirmInput.classList.add('error-state');
  }
};

window.doSignIn = function() {
  const email = document.getElementById('si-email').value.trim();
  const pwd   = document.getElementById('si-pwd').value;
  const errEl = document.getElementById('si-error');
  const btn   = document.getElementById('si-btn');

  if (!email || !pwd) { errEl.textContent = 'Parameters missing. Fill all fields.'; return; }

  btn.classList.add('loading');
  btn.disabled = true;
  errEl.textContent = '';

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    const user = users.find(u => u.email === email && u.pwd === pwd);
    
    if (user) {
      showSuccess(`Identity Verified`, `Welcome back. Entering space…`);
    } else {
      ['si-email', 'si-pwd'].forEach(id => document.getElementById(id).classList.add('error-state'));
      errEl.textContent = 'Authentication vector refused. Invalid credentials.';
    }
  }, 1100);
};

window.doSignUp = function() {
  const name    = document.getElementById('su-name').value.trim();
  const email   = document.getElementById('su-email').value.trim();
  const pwd     = document.getElementById('su-pwd').value;
  const confirm = document.getElementById('su-confirm').value;
  const errEl   = document.getElementById('su-error');
  const btn     = document.getElementById('su-btn');

  if (!name || !email || !pwd || !confirm) { errEl.textContent = 'All records required.'; return; }
  if (pwd !== confirm) { errEl.textContent = 'Password parity check failed.'; return; }

  btn.classList.add('loading');
  btn.disabled = true;
  errEl.textContent = '';

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    users.push({ name, email, pwd });
    switchTab('signin');
    
    const siErr = document.getElementById('si-error');
    siErr.style.color = '#4ade80';
    siErr.textContent = 'Record initialized! Execute sign-in sequence.';
    document.getElementById('si-email').value = email;
  }, 1200);
};

window.doGuestAccess = function() {
  showSuccess("Guest Session Created", "Initializing temporary connection…");
};

function showSuccess(title, sub) {
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlaySub').textContent = sub;
  
  const overlay = document.getElementById('successOverlay');
  overlay.classList.add('show');
  
  setTimeout(() => {
    const fillBar = document.getElementById('redirectFill');
    if (fillBar) fillBar.style.width = '100%';
  }, 50);

  setTimeout(() => {
    window.location.href = 'https://yuvaraj51.github.io/Portfolio';
  }, 2500);
}

document.addEventListener('input', e => {
  if (e.target.tagName === 'INPUT') {
    e.target.classList.remove('error-state');
  }
});

/* ── NEW: BACK BUTTON RESTORATION ACTION ── */
window.addEventListener('pageshow', function(event) {
  // If the page is loaded from the history state cache (back button pressed)
  if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
    const overlay = document.getElementById('successOverlay');
    const fillBar = document.getElementById('redirectFill');
    
    if (overlay) overlay.classList.remove('show');
    if (fillBar) fillBar.style.width = '0%';
    
    // Reset any loaded button states
    document.querySelectorAll('.btn-submit').forEach(btn => {
      btn.classList.remove('loading');
      btn.disabled = false;
    });
  }
});