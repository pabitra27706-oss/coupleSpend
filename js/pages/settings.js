// ─────────────────────────────────────────
//  Settings Page
//  CoupleSpend App
// ─────────────────────────────────────────

const settingsPage = (() => {

  // ── Initialize ────────────────────────────
  function init() {
    render();
  }

  // ── Render ────────────────────────────────
  function render() {
    const content = document.getElementById('settings-content');
    if (!content) return;

    const profile    = store.state.profile;
    const partner    = store.state.partnerProfile;
    const hasPartner = !!partner;
    const theme      = ThemeManager.getCurrent();

    content.innerHTML = `

      <!-- Profile Card -->
      <div class="card">
        <div class="settings-profile">
          <div class="settings-avatar">
            <div class="avatar avatar-lg">
              ${profile?.photoURL
                ? `<img src="${profile.photoURL}" alt="Profile"/>`
                : Icons.user
              }
            </div>
            <button
              class="settings-avatar-edit"
              onclick="settingsPage.editAvatar()"
              aria-label="Edit avatar"
            >
              ${Icons.edit}
            </button>
          </div>
          <div class="settings-profile-info">
            <div
              class="settings-profile-name"
              contenteditable="true"
              id="settings-name"
              onblur="settingsPage.saveName(this.textContent)"
            >${profile?.name || 'Your Name'}</div>
            <div class="settings-profile-email">
              ${profile?.email || ''}
            </div>
            <div class="settings-profile-since">
              Member since ${formatMemberDate(profile?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <!-- Partner Section -->
      <div class="settings-section">
        <div class="settings-section-title">Partner</div>

        ${hasPartner ? `
          <!-- Partner Linked -->
          <div class="card">
            <div class="settings-partner-card">
              <div class="avatar avatar-md" style="
                border-color: var(--her-color);
                color: var(--her-color);
                background: rgba(var(--her-rgb), 0.1)
              ">
                ${Icons.user}
              </div>
              <div class="settings-partner-info">
                <div class="settings-partner-name">
                  ${partner.name || 'Partner'}
                </div>
                <div class="settings-partner-email">
                  ${partner.email || ''}
                </div>
                <span class="badge badge-success">Linked</span>
              </div>
              <button
                class="btn btn-sm btn-ghost"
                onclick="settingsPage.unlinkPartner()"
                style="color: var(--danger)"
              >
                Unlink
              </button>
            </div>
          </div>
        ` : `
          <!-- Link Partner -->
          <div class="card">
            <div class="settings-link-partner">
              <div class="settings-link-icon">
                ${Icons.link}
              </div>
              <div class="settings-link-info">
                <div class="settings-link-title">
                  Link Partner Account
                </div>
                <div class="settings-link-desc">
                  Share your User ID with your partner,
                  or enter theirs below to link accounts
                </div>
              </div>
            </div>

            <div class="settings-your-id">
              <span class="settings-id-label">Your User ID</span>
              <div class="settings-id-value">
                <code id="user-id-display"
                  style="font-size:11px;word-break:break-all">
                  ${store.state.user?.uid || '—'}
                </code>
                <button
                  class="btn btn-sm btn-ghost"
                  onclick="settingsPage.copyUserId()"
                >
                  ${Icons.copy}
                  Copy
                </button>
              </div>
            </div>

            <div class="input-group mt-4">
              <label class="input-label" for="partner-id-input">
                Partner's User ID
              </label>
              <div class="flex gap-2">
                <input
                  type="text"
                  class="input flex-1"
                  id="partner-id-input"
                  placeholder="Paste partner ID here"
                />
                <button
                  class="btn btn-primary"
                  id="link-partner-btn"
                  onclick="settingsPage.linkPartner()"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
        `}

        <!-- Partner display name -->
        <div class="card">
          <div class="settings-row">
            <div class="settings-row-info">
              <div class="settings-row-label">
                Partner Display Name
              </div>
              <div class="settings-row-desc">
                Name shown for your partner in the app
              </div>
            </div>
            <input
              type="text"
              class="input"
              style="max-width: 140px"
              value="${profile?.partnerName || 'Partner'}"
              onchange="settingsPage.savePartnerName(this.value)"
            />
          </div>
        </div>
      </div>

      <!-- Appearance Section -->
      <div class="settings-section">
        <div class="settings-section-title">Appearance</div>

        <!-- Theme -->
        <div class="card">
          <div class="settings-row-label mb-4">Theme</div>
          <div class="theme-options" id="theme-options">
            ${ThemeManager.buildThemeOptions()}
          </div>
        </div>

        <!-- Accent Color -->
        <div class="card">
          <div class="settings-row-label mb-4">Accent Color</div>
          <div class="accent-options" id="accent-options">
            ${ThemeManager.buildAccentOptions()}
          </div>
        </div>

        <!-- You & Partner Colors -->
        <div class="card">
          <div class="settings-row-label mb-4">Your Color</div>
          <div id="you-color-options">
            ${buildColorOptions('you', theme.youColor)}
          </div>
          <hr class="divider" />
          <div class="settings-row-label mb-4">Partner Color</div>
          <div id="her-color-options">
            ${buildColorOptions('her', theme.herColor)}
          </div>
        </div>

        <!-- Font Size -->
        <div class="card">
          <div class="settings-row">
            <div class="settings-row-info">
              <div class="settings-row-label">Font Size</div>
            </div>
            <div class="font-size-options">
              ${['small', 'normal', 'large'].map(size => `
                <button
                  class="font-size-btn ${
                    theme.fontSize === size ? 'active' : ''
                  }"
                  onclick="settingsPage.setFontSize('${size}', event)"
                >
                  ${size === 'small'  ? '<span style="font-size:12px">A</span>' : ''}
                  ${size === 'normal' ? '<span style="font-size:15px">A</span>' : ''}
                  ${size === 'large'  ? '<span style="font-size:18px">A</span>' : ''}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Preferences Section -->
      <div class="settings-section">
        <div class="settings-section-title">Preferences</div>

        <!-- Currency -->
        <div class="card">
          <div class="settings-row">
            <div class="settings-row-info">
              <div class="settings-row-label">Currency</div>
              <div class="settings-row-desc">
                ${profile?.currency || 'USD'}
              </div>
            </div>
            <button
              class="btn btn-sm btn-secondary"
              onclick="settingsPage.showCurrencyPicker()"
            >
              Change
            </button>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card">
          <div class="settings-group-title">Notifications</div>
          ${buildNotifToggles(profile?.notifications)}
        </div>
      </div>

      <!-- Data Section -->
      <div class="settings-section">
        <div class="settings-section-title">Data</div>

        <div class="card settings-menu-card">

          <button
            class="settings-menu-item"
            onclick="router.navigate('budget')"
          >
            <div class="settings-menu-icon" style="
              background: rgba(16,185,129,0.1);
              color: var(--success)
            ">
              ${Icons.budget}
            </div>
            <span class="settings-menu-label">Manage Budgets</span>
            ${Icons.chevronRight}
          </button>

          <button
            class="settings-menu-item"
            onclick="settingsPage.showExportOptions()"
          >
            <div class="settings-menu-icon" style="
              background: rgba(99,102,241,0.1);
              color: var(--accent)
            ">
              ${Icons.export}
            </div>
            <span class="settings-menu-label">Export Data</span>
            ${Icons.chevronRight}
          </button>

          <button
            class="settings-menu-item"
            onclick="settingsPage.showBackupOptions()"
          >
            <div class="settings-menu-icon" style="
              background: rgba(245,158,11,0.1);
              color: var(--warning)
            ">
              ${Icons.backup}
            </div>
            <span class="settings-menu-label">Backup & Restore</span>
            ${Icons.chevronRight}
          </button>

          <button
            class="settings-menu-item"
            onclick="settingsPage.clearData()"
          >
            <div class="settings-menu-icon" style="
              background: rgba(239,68,68,0.1);
              color: var(--danger)
            ">
              ${Icons.delete}
            </div>
            <span
              class="settings-menu-label"
              style="color: var(--danger)"
            >
              Clear All Data
            </span>
            ${Icons.chevronRight}
          </button>

        </div>
      </div>

      <!-- About Section -->
      <div class="settings-section">
        <div class="settings-section-title">About</div>
        <div class="card">
          <div class="settings-about">
            <div class="settings-about-logo">
              <div class="auth-logo-icon"
                style="width:40px;height:40px">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor"
                  style="width:24px;height:24px;stroke-width:1.5">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477
                    10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
                  <path d="M8 12h8M12 8v8"/>
                </svg>
              </div>
            </div>
            <div class="settings-about-info">
              <div class="settings-about-name">CoupleSpend</div>
              <div class="settings-about-version">
                Version 1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <button
        class="btn btn-secondary btn-full"
        onclick="settingsPage.logout()"
        style="color:var(--danger);
               border-color:rgba(var(--danger-rgb),0.3)"
      >
        ${Icons.logout}
        Sign Out
      </button>

      <div style="height: var(--space-4)"></div>
    `;
  }

  // ── Build color options ────────────────────
  function buildColorOptions(type, current) {
    const YOU_COLORS = [
      { name: 'indigo',  color: '#6366f1' },
      { name: 'blue',    color: '#3b82f6' },
      { name: 'violet',  color: '#8b5cf6' },
      { name: 'cyan',    color: '#06b6d4' },
      { name: 'emerald', color: '#10b981' }
    ];
    const HER_COLORS = [
      { name: 'pink',   color: '#ec4899' },
      { name: 'rose',   color: '#f43f5e' },
      { name: 'orange', color: '#f97316' },
      { name: 'amber',  color: '#f59e0b' },
      { name: 'red',    color: '#ef4444' }
    ];

    const options = type === 'you' ? YOU_COLORS : HER_COLORS;

    return `
      <div class="accent-options">
        ${options.map(opt => `
          <button
            class="accent-option ${
              current === opt.name ? 'active' : ''
            }"
            onclick="settingsPage.setPartnerColor(
              '${type}', '${opt.name}'
            )"
          >
            <div class="accent-dot"
              style="background: ${opt.color}">
              ${current === opt.name
                ? `<svg viewBox="0 0 24 24" fill="none"
                     stroke="#fff" stroke-width="3"
                     stroke-linecap="round"
                     stroke-linejoin="round"
                     width="14" height="14">
                     <polyline points="20 6 9 17 4 12"/>
                   </svg>`
                : ''
              }
            </div>
            <span>${capitalise(opt.name)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  // ── Build notification toggles ─────────────
  function buildNotifToggles(notifs = {}) {
    const toggles = [
      {
        key:   'budgetAlert',
        label: 'Budget Alerts',
        desc:  'Notify when budget is 80% or 100% used'
      },
      {
        key:   'partnerAdded',
        label: 'Partner Activity',
        desc:  'Notify when partner adds transactions'
      },
      {
        key:   'weeklyReport',
        label: 'Weekly Report',
        desc:  'Summary every Sunday'
      },
      {
        key:   'monthlyReport',
        label: 'Monthly Report',
        desc:  'Summary on 1st of each month'
      },
      {
        key:   'dailyReminder',
        label: 'Daily Reminder',
        desc:  'Remind to log expenses'
      }
    ];

    return toggles.map(t => `
      <div class="settings-toggle-row">
        <div class="settings-row-info">
          <div class="settings-row-label">${t.label}</div>
          <div class="settings-row-desc">${t.desc}</div>
        </div>
        <label class="toggle">
          <input
            type="checkbox"
            ${notifs?.[t.key] !== false ? 'checked' : ''}
            onchange="settingsPage.toggleNotification(
              '${t.key}', this.checked
            )"
          />
          <div class="toggle-track">
            <div class="toggle-thumb"></div>
          </div>
        </label>
      </div>
    `).join('');
  }

  // ── Format member date ─────────────────────
  function formatMemberDate(timestamp) {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year:  'numeric'
      });
    } catch {
      return 'Recently';
    }
  }

  // ── Save name ─────────────────────────────
  async function saveName(name) {
    const trimmed = name?.trim();
    if (!trimmed || trimmed === store.state.profile?.name) return;

    try {
      const uid = store.state.user?.uid;
      if (!uid) return;
      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        name: trimmed
      });
      await auth.currentUser?.updateProfile({ displayName: trimmed });
      store.updateProfile({ name: trimmed });
      Toast.success('Saved', 'Name updated');
    } catch (err) {
      console.error('Save name error:', err);
      Toast.error('Failed', 'Could not save name');
    }
  }

  // ── Save partner name ──────────────────────
  async function savePartnerName(name) {
    const trimmed = name?.trim();
    if (!trimmed) return;

    try {
      const uid = store.state.user?.uid;
      if (!uid) return;
      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        partnerName: trimmed
      });
      store.updateProfile({ partnerName: trimmed });
      Toast.success('Saved', 'Partner name updated');
    } catch (err) {
      console.error('Save partner name error:', err);
    }
  }

  // ── Copy user ID ───────────────────────────
  function copyUserId() {
    const uid = store.state.user?.uid;
    if (!uid) {
      Toast.error('Error', 'User ID not available');
      return;
    }
    copyToClipboard(uid);
    Toast.success('Copied!', 'Your User ID has been copied');
  }

  // ── Link partner ───────────────────────────
  // FIX: The core problem was that Firestore
  // security rules block writing to another
  // user's doc (auth.uid != partnerId).
  // Solution: We write ONLY to our own doc.
  // The partner's doc update is done via a
  // special "linkRequests" approach — we
  // store our uid in our own doc as
  // pendingLinkTo, then when partner opens
  // the app, store.init() detects and
  // completes the link on their side.
  // But for simplicity and since both users
  // are authenticated, we use a Firestore
  // intermediate "couple" document that
  // both users can write to, then each
  // user reads from it and updates their
  // own doc. This respects security rules.
  async function linkPartner() {
    const input     = document.getElementById('partner-id-input');
    const btn       = document.getElementById('link-partner-btn');
    const partnerId = input?.value.trim();

    if (!partnerId) {
      Toast.error('Empty', 'Please enter your partner\'s User ID');
      return;
    }

    const myUid = store.state.user?.uid;

    if (partnerId === myUid) {
      Toast.error('Invalid', 'You cannot link to yourself');
      return;
    }

    // Disable button during operation
    if (btn) {
      btn.disabled    = true;
      btn.textContent = 'Linking...';
    }

    try {
      // ── Step 1: Verify partner doc exists ──
      const partnerSnap = await db
        .collection(COLLECTIONS.USERS)
        .doc(partnerId)
        .get();

      if (!partnerSnap.exists) {
        Toast.error(
          'Not found',
          'No account found with that User ID. '
          + 'Make sure your partner has registered first.'
        );
        if (btn) {
          btn.disabled    = false;
          btn.textContent = 'Link';
        }
        return;
      }

      const partnerData = partnerSnap.data();

      // ── Step 2: Check partner not already
      //    linked to someone else ────────────
      if (partnerData.partnerId
          && partnerData.partnerId !== myUid) {
        Toast.error(
          'Already linked',
          `${partnerData.name || 'This account'} is already `
          + 'linked to another account'
        );
        if (btn) {
          btn.disabled    = false;
          btn.textContent = 'Link';
        }
        return;
      }

      // ── Step 3: Update MY own doc ──────────
      // Security rules ALLOW this because
      // auth.uid == myUid
      await db
        .collection(COLLECTIONS.USERS)
        .doc(myUid)
        .update({ partnerId });

      // ── Step 4: Update PARTNER doc ─────────
      // Security rules BLOCK direct write
      // to another user's doc.
      // FIX: Use a shared "couple" link doc
      // that both users can write to.
      // Store the link request so partner's
      // app auto-completes it on next load.
      const coupleId = [myUid, partnerId].sort().join('_');

      await db
        .collection(COLLECTIONS.COUPLE)
        .doc(coupleId)
        .set({
          userA:     myUid,
          userB:     partnerId,
          linkedAt:  firebase.firestore.FieldValue.serverTimestamp(),
          linkedBy:  myUid
        }, { merge: true });

      // Also try to write partner doc directly
      // This succeeds if security rules permit
      // or if partner is also logged in.
      // We wrap in try/catch so it doesn't
      // block the flow if rules deny it.
      try {
        await db
          .collection(COLLECTIONS.USERS)
          .doc(partnerId)
          .update({ partnerId: myUid });
      } catch (ruleErr) {
        // Expected if security rules block it
        // Partner's app will self-heal via
        // checkPendingLink() on next load
        console.info(
          'Direct partner doc update blocked by rules '
          + '(expected) — couple doc created as fallback',
          ruleErr.code
        );
      }

      // ── Step 5: Send notification ──────────
      // toUserId is the partner — allowed
      // because notifications rules allow
      // create if auth != null
      try {
        await db.collection(COLLECTIONS.NOTIFICATIONS).add({
          toUserId:   partnerId,
          fromUserId: myUid,
          type:       'partner_linked',
          title:      'Partner Linked! 🎉',
          message:    `${store.state.profile?.name || 'Someone'} `
                    + 'linked their account to yours. '
                    + 'Open settings to confirm.',
          isRead:     false,
          data:       { fromUid: myUid },
          createdAt:  firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (notifErr) {
        // Non-fatal
        console.warn('Notification send failed:', notifErr);
      }

      // ── Step 6: Update local store ─────────
      store.updateProfile({ partnerId });
      await store.loadPartnerProfile(partnerId);
      await store.loadPartnerTransactions(
        partnerId,
        store.state.currentMonth
      );

      Toast.success(
        'Linked! 🎉',
        `Connected with ${partnerData.name || 'your partner'}. `
        + 'They will be notified.'
      );

      render();

    } catch (err) {
      console.error('Link partner error:', err);
      Toast.error(
        'Failed',
        'Could not link partner. Check your connection and try again.'
      );
      if (btn) {
        btn.disabled    = false;
        btn.textContent = 'Link';
      }
    }
  }

  // ── Unlink partner ────────────────────────
  async function unlinkPartner() {
    const confirmed = await Modal.confirm({
      title:   'Unlink Partner',
      message: 'Are you sure? You will no longer see '
             + 'each other\'s transactions.',
      okText:  'Unlink',
      okClass: 'btn-danger'
    });

    if (!confirmed) return;

    try {
      const myUid     = store.state.user?.uid;
      const partnerId = store.state.profile?.partnerId;

      // Update my own doc — always allowed
      await db
        .collection(COLLECTIONS.USERS)
        .doc(myUid)
        .update({ partnerId: null });

      // Try to update partner's doc
      // May be blocked by rules — that's ok,
      // they will see unlinked on their end
      // when they next open the app via
      // checkPendingLink()
      if (partnerId) {
        try {
          await db
            .collection(COLLECTIONS.USERS)
            .doc(partnerId)
            .update({ partnerId: null });
        } catch (ruleErr) {
          console.info(
            'Could not update partner doc on unlink '
            + '(rules) — they will self-heal on next load'
          );
        }

        // Clean up couple doc
        const coupleId = [myUid, partnerId].sort().join('_');
        try {
          await db
            .collection(COLLECTIONS.COUPLE)
            .doc(coupleId)
            .delete();
        } catch (e) {
          // Non-fatal
        }
      }

      // Clear store
      store.updateProfile({ partnerId: null });
      store.setState('partnerProfile', null);
      store.setState('partnerTxns',    []);

      Toast.success('Unlinked', 'Partner account disconnected');
      render();

    } catch (err) {
      console.error('Unlink error:', err);
      Toast.error('Failed', 'Could not unlink partner');
    }
  }

  // ── Toggle notification ────────────────────
  async function toggleNotification(key, value) {
    try {
      const uid = store.state.user?.uid;
      if (!uid) return;
      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        [`notifications.${key}`]: value
      });
      store.updateProfile({
        notifications: {
          ...store.state.profile?.notifications,
          [key]: value
        }
      });
    } catch (err) {
      console.error('Toggle notification error:', err);
    }
  }

  // ── Set theme ──────────────────────────────
  async function setTheme(name) {
    await ThemeManager.setTheme(name);
    const opts = document.getElementById('theme-options');
    if (opts) opts.innerHTML = ThemeManager.buildThemeOptions();
  }

  // ── Set accent ─────────────────────────────
  async function setAccent(name) {
    await ThemeManager.setAccent(name);
    const opts = document.getElementById('accent-options');
    if (opts) opts.innerHTML = ThemeManager.buildAccentOptions();
  }

  // ── Set partner color ──────────────────────
  async function setPartnerColor(type, name) {
    const curr = ThemeManager.getCurrent();
    const you  = type === 'you' ? name : curr.youColor;
    const her  = type === 'her' ? name : curr.herColor;

    await ThemeManager.setPartnerColors(you, her);

    const youOpts = document.getElementById('you-color-options');
    const herOpts = document.getElementById('her-color-options');
    if (youOpts) youOpts.innerHTML = buildColorOptions('you', you);
    if (herOpts) herOpts.innerHTML = buildColorOptions('her', her);
  }

  // ── Set font size ──────────────────────────
  function setFontSize(size, event) {
    ThemeManager.setFontSize(size);
    document.querySelectorAll('.font-size-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    // Use event target if available
    if (event?.target) {
      event.target.closest('.font-size-btn')?.classList.add('active');
    }
  }

  // ── Show currency picker ───────────────────
  function showCurrencyPicker() {
    const currList = window.CURRENCIES || [];
    const body = `
      <div class="currency-list">
        ${currList.map(c => `
          <button
            class="currency-item ${
              store.state.profile?.currency === c.code
                ? 'active' : ''
            }"
            onclick="settingsPage.setCurrency('${c.code}')"
          >
            <span class="currency-symbol">${c.symbol}</span>
            <span class="currency-name">${c.name}</span>
            <span class="currency-code">${c.code}</span>
            ${store.state.profile?.currency === c.code
              ? `<span style="color:var(--accent)">
                   ${Icons.check}
                 </span>`
              : ''
            }
          </button>
        `).join('')}
      </div>
    `;

    Modal.create({
      id:       'modal-currency',
      title:    'Select Currency',
      body,
      position: 'bottom'
    });
    Modal.open('modal-currency');
  }

  // ── Set currency ───────────────────────────
  async function setCurrency(code) {
    try {
      const uid = store.state.user?.uid;
      if (!uid) return;
      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        currency: code
      });
      store.updateProfile({ currency: code });
      Modal.close('modal-currency');
      Toast.success('Updated', `Currency set to ${code}`);
      render();
    } catch (err) {
      console.error('Set currency error:', err);
      Toast.error('Failed', 'Could not update currency');
    }
  }

  // ── Show export options ────────────────────
  function showExportOptions() {
    Modal.sheet({
      id:    'modal-export',
      title: 'Export Data',
      items: [
        {
          label:  'Export as PDF',
          icon:   `<div class="sheet-item-icon">${Icons.export}</div>`,
          action: () => {
            if (window.ExportManager) ExportManager.exportPDF();
          }
        },
        {
          label:  'Export as CSV',
          icon:   `<div class="sheet-item-icon">${Icons.download}</div>`,
          action: () => {
            if (window.ExportManager) ExportManager.exportCSV();
          }
        },
        {
          label:  'Export as Excel',
          icon:   `<div class="sheet-item-icon">${Icons.download}</div>`,
          action: () => {
            if (window.ExportManager) ExportManager.exportExcel();
          }
        }
      ]
    });
  }

  // ── Show backup options ────────────────────
  function showBackupOptions() {
    Modal.sheet({
      id:    'modal-backup',
      title: 'Backup & Restore',
      items: [
        {
          label:  'Create Backup',
          icon:   `<div class="sheet-item-icon">${Icons.backup}</div>`,
          action: () => {
            if (window.BackupManager) BackupManager.createBackup();
          }
        },
        {
          label:  'Restore from File',
          icon:   `<div class="sheet-item-icon">${Icons.refresh}</div>`,
          action: () => {
            if (window.BackupManager) BackupManager.restoreBackup();
          }
        }
      ]
    });
  }

  // ── Edit avatar ────────────────────────────
  function editAvatar() {
    Toast.info('Coming soon', 'Avatar upload will be available soon');
  }

  // ── Clear data ─────────────────────────────
  async function clearData() {
    const confirmed = await Modal.confirm({
      title:   'Clear All Data',
      message: 'This will permanently delete ALL your '
             + 'transactions, budgets and settings. '
             + 'This action cannot be undone.',
      okText:  'Clear Everything',
      okClass: 'btn-danger'
    });

    if (!confirmed) return;

    const confirmed2 = await Modal.confirm({
      title:   'Are you absolutely sure?',
      message: 'All data will be permanently lost. '
             + 'This cannot be reversed.',
      okText:  'Yes, Delete All',
      okClass: 'btn-danger'
    });

    if (!confirmed2) return;

    try {
      const uid = store.state.user?.uid;
      if (!uid) return;

      Toast.info('Deleting', 'Clearing your data...');

      const batch = db.batch();

      const txSnap = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', uid)
        .get();
      txSnap.docs.forEach(d => batch.delete(d.ref));

      const bgSnap = await db
        .collection(COLLECTIONS.BUDGETS)
        .where('userId', '==', uid)
        .get();
      bgSnap.docs.forEach(d => batch.delete(d.ref));

      await batch.commit();

      store.setState('transactions', []);
      store.setState('budgets',      []);

      Toast.success('Cleared', 'All data has been deleted');

    } catch (err) {
      console.error('Clear data error:', err);
      Toast.error('Failed', 'Could not clear data');
    }
  }

  // ── Logout ────────────────────────────────
  async function logout() {
    const confirmed = await Modal.confirm({
      title:   'Sign Out',
      message: 'Are you sure you want to sign out?',
      okText:  'Sign Out',
      okClass: 'btn-danger'
    });

    if (!confirmed) return;

    try {
      store.stopListeners();
      await auth.signOut();
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Logout error:', err);
      Toast.error('Failed', 'Could not sign out');
    }
  }

  // ── Expose ────────────────────────────────
  return {
    init,
    render,
    saveName,
    savePartnerName,
    copyUserId,
    linkPartner,
    unlinkPartner,
    toggleNotification,
    setTheme,
    setAccent,
    setPartnerColor,
    setFontSize,
    showCurrencyPicker,
    setCurrency,
    showExportOptions,
    showBackupOptions,
    editAvatar,
    clearData,
    logout
  };

})();

window.settingsPage = settingsPage;