// ─────────────────────────────────────────
//  Authentication Logic
//  CoupleSpend App
// ─────────────────────────────────────────

// ── State ────────────────────────────────
let currentTab = 'login';
let pendingInviteToken = null;   // ★ NEW: holds invite token from URL

// ── On Page Load ─────────────────────────
window.addEventListener('DOMContentLoaded', () => {

  // ★ NEW: Check for invitation link
  const urlParams = new URLSearchParams(window.location.search);
  const inviteParam = urlParams.get('invite');
  if (inviteParam) {
    pendingInviteToken = inviteParam.trim();
    // Clean the URL so the param isn't re-used on refresh
    if (window.history && window.history.replaceState) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }

  // Apply saved theme immediately so no flash
  applySavedTheme();

  // Check if user already logged in
  let redirected = false;
  auth.onAuthStateChanged(async (user) => {
    if (user && !redirected) {
      redirected = true;

      try {
        await ensureUserDoc(user);

        // ★ NEW: If there's a pending invite, process it now
        if (pendingInviteToken) {
          await processInviteToken(user, pendingInviteToken);
          pendingInviteToken = null;
        }

      } catch (err) {
        console.warn('ensureUserDoc/invite processing failed:', err);
      }

      window.location.href = 'app.html';
    }
  });

  // Password strength listener
  const regPassword = document.getElementById('reg-password');
  if (regPassword) {
    regPassword.addEventListener('input', (e) => {
      checkPasswordStrength(e.target.value);
    });
  }
});

// ── Ensure User Doc Exists ────────────────
async function ensureUserDoc(user) {
  if (!user?.uid) return;

  const ref  = db.collection(COLLECTIONS.USERS).doc(user.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({
      uid:         user.uid,
      name:        user.displayName || extractNameFromEmail(user.email),
      partnerName: 'Partner',
      email:       user.email || '',
      photoURL:    user.photoURL || null,
      currency:    'USD',
      theme:       'dark',
      accentColor: 'indigo',
      youColor:    'indigo',
      herColor:    'pink',
      partnerId:   null,
      fcmToken:    null,
      notifications: {
        budgetAlert:   true,
        partnerAdded:  true,
        weeklyReport:  true,
        monthlyReport: true,
        dailyReminder: false
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
}

// ── NEW: Process invitation token ─────────
async function processInviteToken(user, token) {
  try {
    // 1. Fetch the invite doc
    const inviteSnap = await db.collection(COLLECTIONS.INVITES).doc(token).get();
    if (!inviteSnap.exists) {
      console.warn('Invite token not found');
      return;
    }

    const inviteData = inviteSnap.data();
    if (inviteData.used) {
      console.warn('Invite token already used');
      return;
    }
    if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
      console.warn('Invite token expired');
      return;
    }

    const creatorUid = inviteData.createdBy;
    if (!creatorUid || creatorUid === user.uid) {
      // Cannot link to yourself
      return;
    }

    // 2. Verify that the creator still exists and is not already linked
    const creatorSnap = await db.collection(COLLECTIONS.USERS).doc(creatorUid).get();
    if (!creatorSnap.exists) {
      return;
    }
    const creatorData = creatorSnap.data();
    if (creatorData.partnerId && creatorData.partnerId !== user.uid) {
      // Creator already linked to someone else
      return;
    }

    // 3. Update both user docs
    await db.collection(COLLECTIONS.USERS).doc(creatorUid).update({ partnerId: user.uid });
    try {
      await db.collection(COLLECTIONS.USERS).doc(user.uid).update({ partnerId: creatorUid });
    } catch (partnerDocErr) {
      // Own doc update always allowed; ignore rule block on partner doc
      console.info('Could not update partner doc (rules)');
    }

    // 4. Create couple doc
    const coupleId = [creatorUid, user.uid].sort().join('_');
    await db.collection(COLLECTIONS.COUPLE).doc(coupleId).set({
      userA: creatorUid,
      userB: user.uid,
      linkedAt: firebase.firestore.FieldValue.serverTimestamp(),
      linkedBy: creatorUid
    }, { merge: true });

    // 5. Mark invite as used
    await db.collection(COLLECTIONS.INVITES).doc(token).update({ used: true });

    // 6. Send notification to creator
    try {
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        toUserId: creatorUid,
        fromUserId: user.uid,
        type: 'partner_linked',
        title: 'Partner Accepted! 🎉',
        message: `${user.displayName || user.email} accepted your invitation.`,
        isRead: false,
        data: {},
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (notifErr) {
      console.warn('Notification failed:', notifErr);
    }

    console.log('Invite processed successfully');

  } catch (err) {
    console.error('processInviteToken error:', err);
  }
}

// ── Extract name from email ───────────────
function extractNameFromEmail(email) {
  if (!email) return 'User';
  const local = email.split('@')[0];
  return local
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
    || 'User';
}

// ── Tab Switcher ──────────────────────────
function switchTab(tab) {
  currentTab = tab;

  const loginForm    = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');
  const indicator    = document.getElementById('tab-indicator');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    indicator.classList.remove('right');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    indicator.classList.add('right');
  }

  clearErrors();
}

// ── Login Handler ─────────────────────────
async function handleLogin(event) {
  event.preventDefault();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-btn');
  const spinner  = document.getElementById('login-spinner');
  const errBox   = document.getElementById('login-error');

  if (!email || !password) {
    showFormError(errBox, 'Please fill in all fields');
    return;
  }

  setButtonLoading(btn, spinner, true);
  clearErrors();

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    await ensureUserDoc(cred.user);

    // ★ NEW: Process invite token if present
    if (pendingInviteToken) {
      await processInviteToken(cred.user, pendingInviteToken);
      pendingInviteToken = null;
    }

    showToast('success', 'Welcome back!', `Signed in as ${cred.user.email}`);

    setTimeout(() => {
      window.location.href = 'app.html';
    }, 800);

  } catch (err) {
    console.error('Login error:', err);
    showFormError(errBox, getAuthErrorMessage(err.code));
    setButtonLoading(btn, spinner, false);
  }
}

// ── Register Handler ──────────────────────
async function handleRegister(event) {
  event.preventDefault();

  const name     = document.getElementById('reg-name').value.trim();
  const partner  = document.getElementById('reg-partner').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const currency = document.getElementById('reg-currency').value;
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const btn      = document.getElementById('register-btn');
  const spinner  = document.getElementById('register-spinner');
  const errBox   = document.getElementById('register-error');

  if (!name || !email || !password || !confirm) {
    showFormError(errBox, 'Please fill in all required fields');
    return;
  }
  if (password !== confirm) {
    showFormError(errBox, 'Passwords do not match');
    return;
  }
  if (password.length < 8) {
    showFormError(errBox, 'Password must be at least 8 characters');
    return;
  }

  setButtonLoading(btn, spinner, true);
  clearErrors();

  let cred = null;

  try {
    cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    try {
      await cred.user.updateProfile({ displayName: name });
    } catch (profileErr) {
      console.warn('updateProfile failed:', profileErr);
    }

    const userDocData = {
      uid,
      name,
      partnerName: partner || 'Partner',
      email,
      photoURL:    null,
      currency:    currency || 'USD',
      theme:       'dark',
      accentColor: 'indigo',
      youColor:    'indigo',
      herColor:    'pink',
      partnerId:   null,
      fcmToken:    null,
      notifications: {
        budgetAlert:   true,
        partnerAdded:  true,
        weeklyReport:  true,
        monthlyReport: true,
        dailyReminder: false
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    let writeSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await db.collection(COLLECTIONS.USERS).doc(uid).set(userDocData);
        writeSuccess = true;
        break;
      } catch (writeErr) {
        console.warn(`Write attempt ${attempt} failed:`, writeErr);
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, attempt * 300));
        }
      }
    }

    if (!writeSuccess) {
      showToast('warning', 'Account created', 'Profile will sync on next login');
    } else {
      showToast('success', 'Account created!', 'Welcome to CoupleSpend');
    }

    // ★ NEW: Process invite token after registration
    if (pendingInviteToken) {
      await processInviteToken(cred.user, pendingInviteToken);
      pendingInviteToken = null;
    }

    setTimeout(() => {
      window.location.href = 'app.html';
    }, 900);

  } catch (err) {
    console.error('Register error:', err);
    showFormError(errBox, getAuthErrorMessage(err.code));
    setButtonLoading(btn, spinner, false);
  }
}

// ── Google Login ──────────────────────────
async function handleGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  const btn = document.getElementById('google-btn');

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner spinner-sm"></span> Connecting...`;

  try {
    const result = await auth.signInWithPopup(provider);
    const user   = result.user;

    await ensureUserDoc(user);

    // ★ NEW: Process invite token after Google login
    if (pendingInviteToken) {
      await processInviteToken(user, pendingInviteToken);
      pendingInviteToken = null;
    }

    showToast('success', 'Welcome!', `Signed in as ${user.displayName || user.email}`);

    setTimeout(() => {
      window.location.href = 'app.html';
    }, 800);

  } catch (err) {
    console.error('Google login error:', err);
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="google-icon" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26
          1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74
          3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66
          -2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84
          C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35
          -2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18
          4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45
          2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66
          2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continue with Google
    `;

    if (err.code !== 'auth/popup-closed-by-user') {
      showToast('error', 'Google sign-in failed', getAuthErrorMessage(err.code));
    }
  }
}

// ── Forgot Password ───────────────────────
async function handleForgotPassword() {
  const emailInput = document.getElementById('login-email');
  const email      = emailInput?.value.trim();

  if (!email) {
    showToast('warning', 'Enter your email',
      'Type your email first then click forgot password'
    );
    emailInput?.focus();
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    showToast('success', 'Reset email sent',
      `Check your inbox at ${email}`
    );
  } catch (err) {
    showToast('error', 'Failed to send email',
      getAuthErrorMessage(err.code)
    );
  }
}

// ── Password Toggle ───────────────────────
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isText = input.type === 'text';
  input.type   = isText ? 'password' : 'text';

  const svg = btn.querySelector('svg');
  if (svg) {
    svg.innerHTML = isText
      ? `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10
           7-10-7-10-7z"/>
         <circle cx="12" cy="12" r="3"/>`
      : `<path d="M17.94 17.94A10.07 10.07 0 0 1 12
           20c-7 0-10-7-10-7a18.45 18.45 0 0 1
           5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7
           0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>`;
  }
}

// ── Password Strength ─────────────────────
function checkPasswordStrength(password) {
  const bars  = document.querySelectorAll('.strength-bar');
  const label = document.getElementById('strength-label');

  if (!bars.length || !label) return;

  bars.forEach(b => {
    b.classList.remove('weak', 'fair', 'good', 'strong');
  });

  if (!password) {
    label.textContent = 'Enter password';
    return;
  }

  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = ['weak', 'fair', 'good', 'strong'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  for (let i = 0; i < score; i++) {
    bars[i].classList.add(levels[score - 1]);
  }

  label.textContent = labels[score - 1] || 'Too short';
}

// ── Helpers ───────────────────────────────
function setButtonLoading(btn, spinner, loading) {
  const text = btn.querySelector('.btn-text');
  btn.disabled = loading;
  if (loading) {
    text?.classList.add('hidden');
    spinner?.classList.remove('hidden');
  } else {
    text?.classList.remove('hidden');
    spinner?.classList.add('hidden');
  }
}

function showFormError(errorBox, message) {
  if (!errorBox) return;
  errorBox.innerHTML = `
    <svg viewBox="0 0 24 24"
      style="width:1rem;height:1rem;stroke:currentColor;
             fill:none;stroke-width:1.5;flex-shrink:0">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8"  x2="12"    y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <span>${message}</span>
  `;
  errorBox.classList.remove('hidden');
}

function clearErrors() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.classList.add('hidden');
    el.innerHTML = '';
  });
}

function getAuthErrorMessage(code) {
  const messages = {
    'auth/user-not-found':          'No account found with this email',
    'auth/wrong-password':          'Incorrect password',
    'auth/email-already-in-use':    'Email is already registered',
    'auth/weak-password':           'Password is too weak',
    'auth/invalid-email':           'Invalid email address',
    'auth/too-many-requests':       'Too many attempts. Try again later',
    'auth/network-request-failed':  'Network error. Check your connection',
    'auth/popup-closed-by-user':    'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'auth/invalid-credential':      'Invalid email or password',
    'auth/user-disabled':           'This account has been disabled',
    'auth/operation-not-allowed':   'This sign-in method is not enabled'
  };
  return messages[code] || 'An error occurred. Please try again';
}

// ── Apply Saved Theme ─────────────────────
function applySavedTheme() {
  try {
    const saved  = localStorage.getItem('cs_theme')  || 'dark';
    const accent = localStorage.getItem('cs_accent') || 'indigo';
    const you    = localStorage.getItem('cs_you_color');
    const her    = localStorage.getItem('cs_her_color');

    document.documentElement.setAttribute('data-theme',  saved);
    document.documentElement.setAttribute('data-accent', accent);
    if (you) document.documentElement.setAttribute('data-you', you);
    if (her) document.documentElement.setAttribute('data-her', her);

    if (window.THEMES && window.THEMES[saved]) {
      const theme = window.THEMES[saved];
      Object.entries(theme).forEach(([key, val]) => {
        if (key.startsWith('--')) {
          document.documentElement.style.setProperty(key, val);
        }
      });
    }
  } catch (e) {
    console.warn('Could not read saved theme:', e);
  }
}

// ── Toast Notification ────────────────────
function showToast(type, title, message, duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>`,
    error:   `<circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9"  y1="9" x2="15" y2="15"/>`,
    warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94
                a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9"  x2="12"    y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>`,
    info:    `<circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8"  x2="12"    y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <svg viewBox="0 0 24 24">
        ${icons[type] || icons.info}
      </svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Window exports ────────────────────────
window.showToast  = showToast;
window.switchTab  = switchTab;