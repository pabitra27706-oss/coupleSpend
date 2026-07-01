// ─────────────────────────────────────────
//  Dashboard Page
//  CoupleSpend App
// ─────────────────────────────────────────

const dashboardPage = (() => {

  // ── State ─────────────────────────────────
  let chartInstance = null;

  // ── Initialize ────────────────────────────
  function init() {
    render();

    // Re-render when transactions change
    store.subscribe('transactions', () => {
      if (router.getCurrent() === 'dashboard') render();
    });

    // Re-render when month changes (month selector)
    store.subscribe('currentMonth', () => {
      if (router.getCurrent() === 'dashboard') render();
    });
  }

  // ── Build month selector HTML ──────────────
  function renderMonthSelector() {
    const months = [];
    const now    = new Date();

    // Build last 12 months list
    for (let i = 0; i < 12; i++) {
      const d        = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value    = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label    = d.toLocaleDateString('en-US', {
        month: 'long',
        year:  'numeric'
      });
      months.push({ value, label });
    }

    const current = store.state.currentMonth;

    // If currentMonth is older than 12 months, add it too
    // so it shows in the dropdown
    const existsInList = months.some(m => m.value === current);
    if (!existsInList && current) {
      const [y, mo] = current.split('-');
      const d       = new Date(parseInt(y), parseInt(mo) - 1, 1);
      const label   = d.toLocaleDateString('en-US', {
        month: 'long',
        year:  'numeric'
      });
      months.push({ value: current, label });
    }

    return `
      <div class="month-selector-card">
        <div class="month-selector-row">
          <div class="month-selector-left">
            <svg class="month-cal-icon" viewBox="0 0 24 24"
              width="18" height="18"
              stroke="currentColor" fill="none"
              stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            <span class="month-selector-label">Viewing</span>
          </div>
          <select
            id="month-select"
            class="month-select-input"
            onchange="dashboardPage.handleMonthChange(this.value)"
          >
            ${months.map(m => `
              <option value="${m.value}"
                ${m.value === current ? 'selected' : ''}>
                ${m.label}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }

  // ── Handle month change ────────────────────
  async function handleMonthChange(month) {
    const select = document.getElementById('month-select');
    if (select) select.disabled = true;

    try {
      await store.changeMonth(month);
    } catch (err) {
      console.error('Month change error:', err);
    }

    if (select) select.disabled = false;
  }

  // ── Render ────────────────────────────────
  function render() {
    const content = document.getElementById('dashboard-content');
    if (!content) return;

    const profile      = store.state.profile;
    const txns         = store.state.transactions;
    const partnerTxns  = store.state.partnerTxns;
    const month        = store.state.currentMonth;
    const symbol       = store.getCurrencySymbol();

    // Computed values
    const mySpend      = store.getTotalSpend(txns);
    const myIncome     = store.getTotalIncome(txns);
    const herSpend     = store.getTotalSpend(partnerTxns);
    const myCatSpend   = store.getSpendByCategory(txns);
    const recentTxns   = txns.slice(0, 5);

    // Who spent more
    const diff        = mySpend - herSpend;
    const hasPartner  = !!store.state.partnerProfile;
    const partnerName = store.state.partnerProfile?.name
      || profile?.partnerName
      || 'Partner';

    content.innerHTML = `

      <!-- Month Selector -->
      ${renderMonthSelector()}

      <!-- Month Header -->
      <div class="dashboard-month">
        <div class="dashboard-month-label">
          ${store.formatMonth(month)}
        </div>
        <button
          class="btn btn-sm btn-secondary"
          onclick="router.navigate('analytics')"
        >
          ${Icons.analytics}
          View Analytics
        </button>
      </div>

      <!-- Hero Card -->
      <div class="hero-card">
        <div class="hero-card-bg"></div>
        <div class="hero-label">Total Expenses</div>
        <div class="hero-amount" id="hero-amount">
          ${symbol}0.00
        </div>
        <div class="hero-sub">
          Income: <strong>${symbol}${myIncome.toFixed(2)}</strong>
          &nbsp;·&nbsp;
          Net: <strong style="color:${
            myIncome - mySpend >= 0
              ? 'var(--success)'
              : 'var(--danger)'
          }">
            ${myIncome - mySpend >= 0 ? '+' : ''}${symbol}${Math.abs(myIncome - mySpend).toFixed(2)}
          </strong>
        </div>

        <!-- Partner comparison -->
        ${hasPartner ? `
          <div class="hero-compare">
            <div class="hero-compare-bar">
              <div class="hero-compare-you" style="flex: ${mySpend || 1}">
                <span>${profile?.name || 'You'}</span>
              </div>
              <div class="hero-compare-her" style="flex: ${herSpend || 1}">
                <span>${partnerName}</span>
              </div>
            </div>
            <div class="hero-compare-label">
              ${diff > 0
                ? `You spent <strong>${symbol}${Math.abs(diff).toFixed(2)}</strong> more`
                : diff < 0
                ? `${partnerName} spent <strong>${symbol}${Math.abs(diff).toFixed(2)}</strong> more`
                : `Equal spending this month`
              }
            </div>
          </div>` : ''
        }
      </div>

      <!-- Quick Stats Row -->
      <div class="stats-row">
        <div class="stat-card" onclick="router.navigate('transactions')">
          <div class="stat-card-icon" style="
            background: rgba(99,102,241,0.12);
            color: var(--you-color)
          ">
            ${Icons.transactions}
          </div>
          <div class="stat-card-value">${txns.length}</div>
          <div class="stat-card-label">Transactions</div>
        </div>

        <div class="stat-card" onclick="router.navigate('budget')">
          <div class="stat-card-icon" style="
            background: rgba(16,185,129,0.12);
            color: var(--success)
          ">
            ${Icons.budget}
          </div>
          <div class="stat-card-value">${store.state.budgets.length}</div>
          <div class="stat-card-label">Budgets</div>
        </div>

        ${hasPartner ? `
          <div class="stat-card" onclick="router.navigate('compare')">
            <div class="stat-card-icon" style="
              background: rgba(236,72,153,0.12);
              color: var(--her-color)
            ">
              ${Icons.users}
            </div>
            <div class="stat-card-value">${symbol}${herSpend.toFixed(0)}</div>
            <div class="stat-card-label">${partnerName}</div>
          </div>` : `
          <div class="stat-card" onclick="router.navigate('settings')">
            <div class="stat-card-icon" style="
              background: rgba(236,72,153,0.12);
              color: var(--her-color)
            ">
              ${Icons.link}
            </div>
            <div class="stat-card-value">Link</div>
            <div class="stat-card-label">Partner</div>
          </div>`
        }
      </div>

      <!-- Category Chart -->
      ${Object.keys(myCatSpend).length > 0 ? `
        <div class="card">
          <div class="section-header mb-4">
            <span class="section-title">Spending by Category</span>
            <button
              class="section-action"
              onclick="router.navigate('analytics')"
            >See all</button>
          </div>
          <div class="chart-wrap">
            <canvas id="dashboard-chart" height="220"></canvas>
          </div>
          <div class="cat-legend" id="cat-legend"></div>
        </div>` : ''
      }

      <!-- Budget Overview -->
      ${store.state.budgets.length > 0 ? `
        <div class="card">
          <div class="section-header mb-4">
            <span class="section-title">Budget Overview</span>
            <button
              class="section-action"
              onclick="router.navigate('budget')"
            >Manage</button>
          </div>
          <div class="budget-list" id="dash-budget-list">
            ${buildBudgetRows(myCatSpend, symbol)}
          </div>
        </div>` : ''
      }

      <!-- Recent Transactions -->
      <div class="card card-flush">
        <div class="section-header p-5 pb-0">
          <span class="section-title">Recent Transactions</span>
          <button
            class="section-action"
            onclick="router.navigate('transactions')"
          >See all</button>
        </div>

        ${recentTxns.length > 0
          ? `<div class="tx-list" id="recent-tx-list">
               ${recentTxns.map(tx => buildTransactionItem(tx)).join('')}
             </div>`
          : buildEmptyState(
              'transactions',
              'No transactions yet',
              'Tap the + button to add your first transaction',
              'Add Transaction',
              'openAddTransaction()'
            )
        }
      </div>

    `;

    // Animate hero amount
    const heroEl = document.getElementById('hero-amount');
    if (heroEl) {
      animateCount(heroEl, 0, mySpend, 800, symbol);
    }

    // Build chart
    if (Object.keys(myCatSpend).length > 0) {
      setTimeout(() => {
        buildDoughnutChart(myCatSpend, symbol);
        buildCatLegend(myCatSpend, symbol);
      }, 100);
    }
  }

  // ── Build budget rows ──────────────────────
  function buildBudgetRows(catSpend, symbol) {
    return store.state.budgets
      .slice(0, 4)
      .map(budget => {
        const spent = catSpend[budget.category] || 0;
        const pct   = Math.min((spent / budget.amount) * 100, 100);
        const cat   = CATEGORIES.find(c => c.id === budget.category);
        const color = pct >= 100
          ? 'var(--danger)'
          : pct >= 80
          ? 'var(--warning)'
          : 'var(--success)';

        return `
          <div class="dash-budget-row">
            <div class="dash-budget-info">
              <div class="dash-budget-cat">
                <span class="dash-budget-icon"
                  style="color:${cat?.color}; background:${cat?.color}18"
                >
                  ${Icons[cat?.icon || 'other']}
                </span>
                <span class="dash-budget-name">${cat?.label || budget.category}</span>
              </div>
              <div class="dash-budget-amounts">
                <span style="color:${color}">${symbol}${spent.toFixed(0)}</span>
                <span class="text-muted"> / ${symbol}${budget.amount.toFixed(0)}</span>
              </div>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill ${pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : ''}"
                style="width: ${pct}%; background: ${color}"
              ></div>
            </div>
          </div>
        `;
      }).join('');
  }

  // ── Build doughnut chart ───────────────────
  function buildDoughnutChart(catSpend, symbol) {
    const canvas = document.getElementById('dashboard-chart');
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const labels = [];
    const data   = [];
    const colors = [];

    Object.entries(catSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .forEach(([catId, amount]) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        labels.push(cat?.label || catId);
        data.push(amount);
        colors.push(cat?.color || '#94a3b8');
      });

    const isDark = ['dark', 'amoled', 'ocean', 'rose'].includes(
      store.state.profile?.theme || 'dark'
    );

    chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map(c => c + 'cc'),
          borderColor:     colors,
          borderWidth:     2,
          hoverBorderWidth: 3,
          hoverOffset:     8
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        cutout:              '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor:      isDark ? '#f1f5f9' : '#0f172a',
            bodyColor:       isDark ? '#94a3b8' : '#475569',
            borderColor:     isDark ? '#334155' : '#e2e8f0',
            borderWidth:     1,
            padding:         12,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct   = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${symbol}${ctx.parsed.toFixed(2)} (${pct}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration:      700
        }
      }
    });
  }

  // ── Build category legend ──────────────────
  function buildCatLegend(catSpend, symbol) {
    const legend = document.getElementById('cat-legend');
    if (!legend) return;

    const total   = Object.values(catSpend).reduce((a, b) => a + b, 0);
    const entries = Object.entries(catSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    legend.innerHTML = entries.map(([catId, amount]) => {
      const cat = CATEGORIES.find(c => c.id === catId);
      const pct = ((amount / total) * 100).toFixed(0);

      return `
        <div class="legend-item">
          <div class="legend-dot" style="background: ${cat?.color}"></div>
          <span class="legend-label truncate">${cat?.label || catId}</span>
          <span class="legend-pct">${pct}%</span>
          <span class="legend-amt">${symbol}${amount.toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }

  // ── Expose ────────────────────────────────
  return {
    init,
    render,
    handleMonthChange
  };

})();

window.dashboardPage = dashboardPage;