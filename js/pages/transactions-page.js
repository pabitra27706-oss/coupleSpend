// ─────────────────────────────────────────
//  Transactions Page
//  CoupleSpend App
// ─────────────────────────────────────────

const transactionsPage = (() => {

  // ── State ─────────────────────────────────
  let currentOwner    = 'you';
  let currentFilter   = 'all';
  let searchQuery     = '';
  let currentMonth    = '';

  // ── Initialize ────────────────────────────
  function init() {
    currentMonth = store.state.currentMonth;
    render();

    // Subscribe to transaction changes
    store.subscribe('transactions', () => {
      if (router.getCurrent() === 'transactions') render();
    });
    store.subscribe('partnerTxns', () => {
      if (router.getCurrent() === 'transactions') render();
    });
  }

  // ── Render ────────────────────────────────
  function render() {
    const content = document.getElementById('transactions-content');
    if (!content) return;

    const profile     = store.state.profile;
    const hasPartner  = !!store.state.partnerProfile;
    const partnerName = store.state.partnerProfile?.name
      || profile?.partnerName
      || 'Partner';
    const symbol      = store.getCurrencySymbol();

    content.innerHTML = `

      <!-- Month Picker -->
      ${buildMonthPicker(
        currentMonth,
        () => transactionsPage.prevMonth(),
        () => transactionsPage.nextMonth()
      )}

      <!-- Owner Toggle (if partner linked) -->
      ${hasPartner ? `
        <div class="owner-toggle">
          <button
            class="owner-toggle-btn ${currentOwner === 'you' ? 'active-you' : ''}"
            onclick="transactionsPage.setOwner('you')"
          >
            ${profile?.name || 'You'}
          </button>
          <button
            class="owner-toggle-btn ${currentOwner === 'her' ? 'active-her' : ''}"
            onclick="transactionsPage.setOwner('her')"
          >
            ${partnerName}
          </button>
          <button
            class="owner-toggle-btn ${currentOwner === 'all' ? 'active-you' : ''}"
            onclick="transactionsPage.setOwner('all')"
          >
            Both
          </button>
        </div>` : ''
      }

      <!-- Search Bar -->
      <div class="search-wrap">
        <span class="search-icon">
          ${Icons.search}
        </span>
        <input
          type="search"
          class="input search-input"
          placeholder="Search transactions..."
          value="${searchQuery}"
          oninput="transactionsPage.onSearch(this.value)"
        />
      </div>

      <!-- Category Filter Chips -->
      <div class="filter-bar">
        <button
          class="filter-chip ${currentFilter === 'all' ? 'active' : ''}"
          onclick="transactionsPage.setFilter('all')"
        >
          All
        </button>
        <button
          class="filter-chip ${currentFilter === 'expense' ? 'active' : ''}"
          onclick="transactionsPage.setFilter('expense')"
        >
          ${Icons.trending_down}
          Expenses
        </button>
        <button
          class="filter-chip ${currentFilter === 'income' ? 'active' : ''}"
          onclick="transactionsPage.setFilter('income')"
        >
          ${Icons.trending_up}
          Income
        </button>
        ${CATEGORIES.map(cat => `
          <button
            class="filter-chip ${currentFilter === cat.id ? 'active' : ''}"
            onclick="transactionsPage.setFilter('${cat.id}')"
            style="${currentFilter === cat.id
              ? `background:${cat.color}18;border-color:${cat.color};color:${cat.color}`
              : ''
            }"
          >
            <span style="color:${cat.color}">
              ${Icons[cat.icon] || Icons.other}
            </span>
            ${cat.label}
          </button>
        `).join('')}
      </div>

      <!-- Summary Strip -->
      <div class="tx-summary-strip" id="tx-summary-strip">
        ${buildSummaryStrip(symbol)}
      </div>

      <!-- Transactions List -->
      <div id="tx-groups-container">
        ${buildTransactionGroups(symbol)}
      </div>

    `;
  }

  // ── Build summary strip ───────────────────
  function buildSummaryStrip(symbol) {
    const txns   = getFilteredTxns();
    const income = txns
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = txns
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    return `
      <div class="tx-summary-item">
        <span class="tx-summary-label">Transactions</span>
        <span class="tx-summary-value">${txns.length}</span>
      </div>
      <div class="tx-summary-item">
        <span class="tx-summary-label">Income</span>
        <span class="tx-summary-value income">
          +${symbol}${income.toFixed(2)}
        </span>
      </div>
      <div class="tx-summary-item">
        <span class="tx-summary-label">Expenses</span>
        <span class="tx-summary-value expense">
          -${symbol}${expense.toFixed(2)}
        </span>
      </div>
    `;
  }

  // ── Build grouped transactions ─────────────
  function buildTransactionGroups(symbol) {
    const txns = getFilteredTxns();

    if (txns.length === 0) {
      return buildEmptyState(
        'transactions',
        'No transactions found',
        searchQuery
          ? `No results for "${searchQuery}"`
          : 'Add your first transaction for this period',
        searchQuery ? '' : 'Add Transaction',
        'openAddTransaction()'
      );
    }

    // Group by date
    const groups = groupByDate(txns);

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => {
      return new Date(b) - new Date(a);
    });

    return sortedDates.map(date => {
      const dateTxns  = groups[date];
      const dayTotal  = dateTxns
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      const showOwner = currentOwner === 'all';

      return `
        <div class="date-group">
          <div class="date-group-header">
            <span class="date-group-label">
              ${formatDate(date)}
            </span>
            ${dayTotal > 0
              ? `<span class="date-group-total">
                   -${symbol}${dayTotal.toFixed(2)}
                 </span>`
              : ''
            }
          </div>
          <div class="date-group-card">
            ${dateTxns.map(tx =>
                buildTransactionItem(tx, showOwner)
              ).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Get filtered transactions ─────────────
  function getFilteredTxns() {
    let txns = [];

    // Owner filter
    if (currentOwner === 'you') {
      txns = [...store.state.transactions];
    } else if (currentOwner === 'her') {
      txns = [...store.state.partnerTxns];
    } else {
      txns = [
        ...store.state.transactions,
        ...store.state.partnerTxns
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Month filter
    txns = txns.filter(t => t.month === currentMonth);

    // Type / category filter
    if (currentFilter === 'expense') {
      txns = txns.filter(t => t.type === 'expense');
    } else if (currentFilter === 'income') {
      txns = txns.filter(t => t.type === 'income');
    } else if (currentFilter !== 'all') {
      txns = txns.filter(t => t.category === currentFilter);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      txns = txns.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return txns;
  }

  // ── Set owner ─────────────────────────────
  function setOwner(owner) {
    currentOwner = owner;
    render();
  }

  // ── Set filter ────────────────────────────
  function setFilter(filter) {
    currentFilter = filter;
    render();
  }

  // ── Search handler ────────────────────────
  const onSearch = debounce((val) => {
    searchQuery = val;
    const container = document.getElementById('tx-groups-container');
    const strip     = document.getElementById('tx-summary-strip');
    const symbol    = store.getCurrencySymbol();

    if (container) container.innerHTML = buildTransactionGroups(symbol);
    if (strip)     strip.innerHTML     = buildSummaryStrip(symbol);
  }, 300);

  // ── Month navigation ──────────────────────
  function prevMonth() {
    const [y, m] = currentMonth.split('-').map(Number);
    const prev   = new Date(y, m - 2, 1);
    currentMonth = `${prev.getFullYear()}-${
      String(prev.getMonth() + 1).padStart(2, '0')
    }`;
    store.changeMonth(currentMonth).then(() => render());
  }

  function nextMonth() {
    const [y, m] = currentMonth.split('-').map(Number);
    const next   = new Date(y, m, 1);
    const now    = new Date();

    // Dont go beyond current month
    if (next > now) return;

    currentMonth = `${next.getFullYear()}-${
      String(next.getMonth() + 1).padStart(2, '0')
    }`;
    store.changeMonth(currentMonth).then(() => render());
  }

  // ── Expose ────────────────────────────────
  return {
    init,
    render,
    setOwner,
    setFilter,
    onSearch,
    prevMonth,
    nextMonth
  };

})();

window.transactionsPage = transactionsPage;