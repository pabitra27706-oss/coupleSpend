// ─────────────────────────────────────────
//  App State Manager
//  CoupleSpend App
// ─────────────────────────────────────────

const store = (() => {

  // ── Private State ──────────────────────
  const state = {
    user:            null,   // Firebase auth user
    profile:         null,   // Firestore user doc
    partnerProfile:  null,   // Partner's Firestore doc
    transactions:    [],     // Current user transactions
    partnerTxns:     [],     // Partner transactions
    budgets:         [],     // Current month budgets
    recurring:       [],     // Recurring transactions
    notifications:   [],     // Unread notifications
    currentMonth:    '',     // e.g. "2024-01"
    isLoading:       false,
    listeners:       {}      // Firestore listeners
  };

  // ── Subscribers ────────────────────────
  const subscribers = {};

  // ── Subscribe to state changes ─────────
  function subscribe(key, callback) {
    if (!subscribers[key]) subscribers[key] = [];
    subscribers[key].push(callback);
    return () => {
      subscribers[key] = subscribers[key]
        .filter(cb => cb !== callback);
    };
  }

  // ── Notify subscribers ─────────────────
  function notify(key) {
    if (subscribers[key]) {
      subscribers[key].forEach(cb => cb(state[key]));
    }
  }

  // ── Set state helper ───────────────────
  function setState(key, value) {
    state[key] = value;
    notify(key);
  }

  // ── Initialize store ───────────────────
  async function init(firebaseUser) {
    setState('user', firebaseUser);

    // ── Smart month detection ──────────────
    // Try to find the most recent transaction month.
    // Falls back to current calendar month if none found
    // or if the index is not yet created.
    try {
      const recentSnap = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', firebaseUser.uid)
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      if (!recentSnap.empty) {
        const lastMonth = recentSnap.docs[0].data().month;
        if (lastMonth) {
          state.currentMonth = lastMonth;
          console.log('📅 Auto-detected month:', lastMonth);
        } else {
          setCurrentMonthFallback();
        }
      } else {
        setCurrentMonthFallback();
      }
    } catch (err) {
      // Index not ready yet or permission error —
      // fall back silently to current month
      console.warn('📅 Month detection fallback:', err.message);
      setCurrentMonthFallback();
    }

    // Load user profile
    await loadProfile(firebaseUser.uid);

    // Load initial data
    await Promise.all([
      loadTransactions(firebaseUser.uid, state.currentMonth),
      loadBudgets(firebaseUser.uid, state.currentMonth),
      loadRecurring(firebaseUser.uid),
      loadNotifications(firebaseUser.uid)
    ]);

    // Load partner data if linked
    if (state.profile?.partnerId) {
      await Promise.all([
        loadPartnerProfile(state.profile.partnerId),
        loadPartnerTransactions(state.profile.partnerId, state.currentMonth)
      ]);
    }

    // Start real-time listeners
    startListeners(firebaseUser.uid);
  }

  // ── Fallback: use current calendar month ──
  function setCurrentMonthFallback() {
    const now = new Date();
    state.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    console.log('📅 Using current month:', state.currentMonth);
  }

  // ── Load Profile ───────────────────────
  async function loadProfile(uid) {
    try {
      const doc = await db
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .get();

      if (doc.exists) {
        setState('profile', { id: doc.id, ...doc.data() });
      }
    } catch (err) {
      console.error('Load profile error:', err);
    }
  }

  // ── Load Partner Profile ───────────────
  async function loadPartnerProfile(partnerId) {
    try {
      const doc = await db
        .collection(COLLECTIONS.USERS)
        .doc(partnerId)
        .get();

      if (doc.exists) {
        setState('partnerProfile', { id: doc.id, ...doc.data() });
      }
    } catch (err) {
      console.error('Load partner profile error:', err);
    }
  }

  // ── Load Transactions ──────────────────
  async function loadTransactions(uid, month) {
    try {
      const snap = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', uid)
        .where('month', '==', month)
        .orderBy('date', 'desc')
        .get();

      const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setState('transactions', txns);
    } catch (err) {
      console.error('Load transactions error:', err);
    }
  }

  // ── Load Partner Transactions ──────────
  async function loadPartnerTransactions(partnerId, month) {
    try {
      const snap = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', partnerId)
        .where('month', '==', month)
        .orderBy('date', 'desc')
        .get();

      const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setState('partnerTxns', txns);
    } catch (err) {
      console.error('Load partner transactions error:', err);
    }
  }

  // ── Load Budgets ───────────────────────
  async function loadBudgets(uid, month) {
    try {
      const snap = await db
        .collection(COLLECTIONS.BUDGETS)
        .where('userId', '==', uid)
        .where('month', '==', month)
        .get();

      const budgets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setState('budgets', budgets);
    } catch (err) {
      console.error('Load budgets error:', err);
    }
  }

  // ── Load Recurring ─────────────────────
  async function loadRecurring(uid) {
    try {
      const snap = await db
        .collection(COLLECTIONS.RECURRING)
        .where('userId', '==', uid)
        .where('isActive', '==', true)
        .get();

      const recurring = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setState('recurring', recurring);
    } catch (err) {
      console.error('Load recurring error:', err);
    }
  }

  // ── Load Notifications ─────────────────
  async function loadNotifications(uid) {
    try {
      const snap = await db
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where('toUserId', '==', uid)
        .where('isRead', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setState('notifications', notifs);
      updateNotifBadge(notifs.length);
    } catch (err) {
      console.error('Load notifications error:', err);
    }
  }

  // ── Real-time Listeners ────────────────
  function startListeners(uid) {
    // Transactions listener
    state.listeners.transactions = db
      .collection(COLLECTIONS.TRANSACTIONS)
      .where('userId', '==', uid)
      .where('month', '==', state.currentMonth)
      .orderBy('date', 'desc')
      .onSnapshot((snap) => {
        const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setState('transactions', txns);
      }, err => console.error('Txn listener:', err));

    // Notifications listener
    state.listeners.notifications = db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('toUserId', '==', uid)
      .where('isRead', '==', false)
      .onSnapshot((snap) => {
        const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setState('notifications', notifs);
        updateNotifBadge(notifs.length);
      }, err => console.error('Notif listener:', err));

    // Partner transactions listener (if linked)
    if (state.profile?.partnerId) {
      state.listeners.partnerTxns = db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', state.profile.partnerId)
        .where('month', '==', state.currentMonth)
        .orderBy('date', 'desc')
        .onSnapshot((snap) => {
          const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setState('partnerTxns', txns);
        }, err => console.error('Partner txn listener:', err));
    }
  }

  // ── Stop all listeners ─────────────────
  function stopListeners() {
    Object.values(state.listeners).forEach(unsub => {
      if (typeof unsub === 'function') unsub();
    });
    state.listeners = {};
  }

  // ── Change Month ───────────────────────
  async function changeMonth(month) {
    state.currentMonth = month;

    // Stop existing listeners
    stopListeners();

    // Reload data for new month
    const uid = state.user.uid;
    await Promise.all([
      loadTransactions(uid, month),
      loadBudgets(uid, month)
    ]);

    if (state.profile?.partnerId) {
      await loadPartnerTransactions(state.profile.partnerId, month);
    }

    // Restart listeners with new month
    startListeners(uid);
    notify('currentMonth');
  }

  // ── Update profile locally ─────────────
  function updateProfile(data) {
    setState('profile', { ...state.profile, ...data });
  }

  // ── Helpers ────────────────────────────
  function updateNotifBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // ── Get computed values ────────────────
  function getTotalSpend(transactions) {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  function getTotalIncome(transactions) {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  function getSpendByCategory(transactions) {
    const map = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!map[t.category]) map[t.category] = 0;
        map[t.category] += t.amount || 0;
      });
    return map;
  }

  function getCurrencySymbol() {
    const currency = state.profile?.currency || 'USD';
    const found    = CURRENCIES.find(c => c.code === currency);
    return found?.symbol || '$';
  }

  function formatAmount(amount) {
    const symbol = getCurrencySymbol();
    return `${symbol}${Number(amount).toFixed(2)}`;
  }

  function formatMonth(monthStr) {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year:  'numeric'
    });
  }

  // ── Expose public API ──────────────────
  return {
    state,
    init,
    subscribe,
    setState,
    changeMonth,
    updateProfile,
    loadProfile,
    loadTransactions,
    loadPartnerTransactions,
    loadBudgets,
    loadNotifications,
    stopListeners,
    getTotalSpend,
    getTotalIncome,
    getSpendByCategory,
    getCurrencySymbol,
    formatAmount,
    formatMonth
  };

})();

window.store = store;