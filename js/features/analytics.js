// ─────────────────────────────────────────
//  Analytics Page
//  CoupleSpend App
// ─────────────────────────────────────────

const analyticsPage = (() => {

  // ── State ─────────────────────────────────
  let currentPeriod = '6m';
  let historyData   = null;

  // ── Initialize ────────────────────────────
  function init() {
    render();

    store.subscribe('transactions', () => {
      if (router.getCurrent() === 'analytics') render();
    });
  }

  // ── Render ────────────────────────────────
  function render() {
    const content = document.getElementById('analytics-content');
    if (!content) return;

    const symbol = store.getCurrencySymbol();

    content.innerHTML = `

      <!-- Period Tabs -->
      <div class="period-tabs">
        ${['1m','3m','6m','1y'].map(p => `
          <button
            class="period-tab ${currentPeriod === p ? 'active' : ''}"
            onclick="analyticsPage.setPeriod('${p}')"
          >
            ${p === '1m' ? '1 Month'
              : p === '3m' ? '3 Months'
              : p === '6m' ? '6 Months'
              : '1 Year'
            }
          </button>
        `).join('')}
      </div>

      <!-- Key Stats -->
      <div class="analytics-stats" id="analytics-stats">
        ${buildKeyStats(symbol)}
      </div>

      <!-- Spending Trend -->
      <div class="card">
        <div class="section-header mb-4">
          <span class="section-title">Spending Trend</span>
          <button
            class="btn btn-icon btn-ghost btn-sm"
            onclick="ChartManager.destroy('trend-chart');
                     analyticsPage.render()"
            title="Refresh"
          >
            ${Icons.refresh}
          </button>
        </div>
        <div class="trend-chart-wrap">
          <canvas id="trend-chart"></canvas>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="card">
        <div class="section-header mb-4">
          <span class="section-title">By Category</span>
          <span class="text-muted text-xs">
            ${store.formatMonth(store.state.currentMonth)}
          </span>
        </div>
        <div class="cat-bar-list" id="cat-bar-list">
          ${buildCategoryBars(symbol)}
        </div>
      </div>

      <!-- Doughnut + Partner -->
      <div class="analytics-duo">

        <div class="card">
          <div class="section-title mb-4">Your Spending</div>
          <div style="height: 180px; position: relative">
            <canvas id="my-doughnut"></canvas>
          </div>
          <div class="cat-legend-sm" id="my-doughnut-legend"></div>
        </div>

        ${store.state.partnerProfile ? `
          <div class="card">
            <div class="section-title mb-4">
              ${store.state.partnerProfile.name || 'Partner'}'s Spending
            </div>
            <div style="height: 180px; position: relative">
              <canvas id="her-doughnut"></canvas>
            </div>
            <div class="cat-legend-sm" id="her-doughnut-legend"></div>
          </div>` : ''
        }

      </div>

      <!-- Payment Methods -->
      <div class="card">
        <div class="section-header mb-4">
          <span class="section-title">Payment Methods</span>
        </div>
        <div class="payment-breakdown" id="payment-breakdown">
          ${buildPaymentBreakdown(symbol)}
        </div>
      </div>

      <!-- Day of Week Pattern -->
      <div class="card">
        <div class="section-header mb-4">
          <span class="section-title">Spending by Day</span>
        </div>
        <div style="height: 160px; position: relative">
          <canvas id="day-chart"></canvas>
        </div>
      </div>

      <!-- Share & Export -->
      <div class="analytics-actions">
        <button
          class="btn btn-secondary flex-1"
          onclick="ShareManager.showShareOptions()"
        >
          ${Icons.share}
          Share
        </button>
        <button
          class="btn btn-secondary flex-1"
          onclick="analyticsPage.showExportSheet()"
        >
          ${Icons.export}
          Export
        </button>
      </div>

    `;

    // Build charts after render
    setTimeout(() => {
      buildTrendChart(symbol);
      buildDoughnuts(symbol);
      buildDayChart(symbol);
    }, 100);
  }

  // ── Build key stats ────────────────────────
  function buildKeyStats(symbol) {
    const txns    = store.state.transactions;
    const month   = store.state.currentMonth;
    const current = txns.filter(t => t.month === month);

    // Previous month
    const [y, m]  = month.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonth = `${prevDate.getFullYear()}-${
      String(prevDate.getMonth() + 1).padStart(2, '0')
    }`;
    const prev = txns.filter(t => t.month === prevMonth);

    const currSpend = store.getTotalSpend(current);
    const prevSpend = store.getTotalSpend(prev);
    const pctChange = prevSpend > 0
      ? ((currSpend - prevSpend) / prevSpend) * 100
      : 0;

    const currExpCount = current.filter(t => t.type === 'expense').length;
    const avgTx        = currExpCount > 0
      ? currSpend / currExpCount
      : 0;

    const topCat = (() => {
      const catSpend = store.getSpendByCategory(current);
      const top      = Object.entries(catSpend)
        .sort((a, b) => b[1] - a[1])[0];
      if (!top) return { label: 'None', color: 'var(--text-muted)' };
      const cat = CATEGORIES.find(c => c.id === top[0]);
      return { label: cat?.label || top[0], color: cat?.color || 'var(--accent)' };
    })();

    const savings = store.getTotalIncome(current) - currSpend;

    const stats = [
      {
        label:  'Total Expenses',
        value:  `${symbol}${currSpend.toFixed(2)}`,
        change: pctChange !== 0 ? {
          val:  `${Math.abs(pctChange).toFixed(0)}%`,
          up:   pctChange > 0,
          text: pctChange > 0 ? 'vs last month' : 'vs last month'
        } : null
      },
      {
        label: 'Transactions',
        value: currExpCount,
        change: null
      },
      {
        label:  'Avg per Transaction',
        value:  `${symbol}${avgTx.toFixed(2)}`,
        change: null
      },
      {
        label: 'Net Savings',
        value: `${savings >= 0 ? '+' : ''}${symbol}${Math.abs(savings).toFixed(2)}`,
        change: null,
        color: savings >= 0 ? 'var(--success)' : 'var(--danger)'
      }
    ];

    return stats.map(s => `
      <div class="analytics-stat-card">
        <div class="analytics-stat-label">${s.label}</div>
        <div class="analytics-stat-value" ${
          s.color ? `style="color:${s.color}"` : ''
        }>${s.value}</div>
        ${s.change ? `
          <div class="analytics-stat-change ${
            s.change.up ? 'change-up' : 'change-down'
          }">
            ${s.change.up ? Icons.trending_up : Icons.trending_down}
            <span>${s.change.val} ${s.change.text}</span>
          </div>` : `<div class="analytics-stat-change change-flat"></div>`
        }
      </div>
    `).join('');
  }

  // ── Build category bars ────────────────────
  function buildCategoryBars(symbol) {
    const txns   = store.state.transactions.filter(
      t => t.month === store.state.currentMonth && t.type === 'expense'
    );
    const catSpend = store.getSpendByCategory(txns);
    const total    = Object.values(catSpend).reduce((a, b) => a + b, 0);

    if (total === 0) {
      return `<p class="text-muted text-sm text-center p-4">
        No expenses this month
      </p>`;
    }

    return Object.entries(catSpend)
      .sort((a, b) => b[1] - a[1])
      .map(([catId, amount]) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        const pct = ((amount / total) * 100).toFixed(1);

        return `
          <div class="cat-bar-item">
            <div class="cat-bar-header">
              <div class="cat-bar-left">
                <div class="cat-bar-icon"
                  style="color:${cat?.color}; background:${cat?.color}18"
                >
                  ${Icons[cat?.icon || 'other']}
                </div>
                <span class="cat-bar-name">${cat?.label || catId}</span>
              </div>
              <div class="cat-bar-right">
                <span class="cat-bar-amount">
                  ${symbol}${amount.toFixed(2)}
                </span>
                <span class="cat-bar-pct">${pct}%</span>
              </div>
            </div>
            <div class="cat-progress">
              <div
                class="cat-progress-fill"
                style="
                  width: ${pct}%;
                  background: ${cat?.color || 'var(--accent)'}
                "
              ></div>
            </div>
          </div>
        `;
      }).join('');
  }

  // ── Build payment breakdown ────────────────
  function buildPaymentBreakdown(symbol) {
    const txns = store.state.transactions.filter(
      t => t.month === store.state.currentMonth && t.type === 'expense'
    );

    const methods = {};
    txns.forEach(tx => {
      const m = tx.paymentMethod || 'other';
      if (!methods[m]) methods[m] = { count: 0, total: 0 };
      methods[m].count++;
      methods[m].total += tx.amount;
    });

    if (Object.keys(methods).length === 0) {
      return `<p class="text-muted text-sm text-center">No data</p>`;
    }

    const methodIcons = {
      card:     Icons.wallet,
      cash:     Icons.currency,
      transfer: Icons.share,
      wallet:   Icons.wallet,
      other:    Icons.other
    };

    const methodColors = {
      card:     'var(--accent)',
      cash:     'var(--success)',
      transfer: 'var(--warning)',
      wallet:   'var(--her-color)',
      other:    'var(--text-muted)'
    };

    return Object.entries(methods)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([method, data]) => `
        <div class="payment-method-row">
          <div class="payment-method-icon" style="
            color: ${methodColors[method] || 'var(--accent)'};
            background: ${methodColors[method] || 'var(--accent)'}18
          ">
            ${methodIcons[method] || Icons.other}
          </div>
          <div class="payment-method-info">
            <div class="payment-method-name">
              ${capitalise(method)}
            </div>
            <div class="payment-method-count">
              ${data.count} transaction${data.count !== 1 ? 's' : ''}
            </div>
          </div>
          <div class="payment-method-amount">
            ${symbol}${data.total.toFixed(2)}
          </div>
        </div>
      `).join('');
  }

  // ── Build trend chart ──────────────────────
  async function buildTrendChart(symbol) {
    const monthKeys   = ChartManager.getLast6MonthKeys();
    const monthLabels = ChartManager.getLast6MonthLabels();
    const uid         = store.state.user?.uid;
    const partnerId   = store.state.profile?.partnerId;

    // Fetch history data if not cached
    if (!historyData) {
      try {
        const startMonth = monthKeys[0];
        const endMonth   = monthKeys[monthKeys.length - 1];

        const snap = await db
          .collection(COLLECTIONS.TRANSACTIONS)
          .where('userId', '==', uid)
          .where('month', '>=', startMonth)
          .where('month', '<=', endMonth)
          .get();

        historyData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      } catch (err) {
        console.error('Fetch history error:', err);
        historyData = [];
      }
    }

    const colors = ChartManager.getThemeColors();

    // Build data per month
    const myData = monthKeys.map(mk => {
      const monthTxns = historyData.filter(
        t => t.month === mk && t.type === 'expense'
      );
      return monthTxns.reduce((s, t) => s + t.amount, 0);
    });

    const datasets = [
      {
        label: store.state.profile?.name || 'You',
        data:  myData,
        color: colors.youColor
      }
    ];

    // Fetch & add partner data if linked
    if (store.state.partnerProfile && partnerId) {
      try {
        const pSnap = await db
          .collection(COLLECTIONS.TRANSACTIONS)
          .where('userId', '==', partnerId)
          .where('month', '>=', monthKeys[0])
          .where('month', '<=', monthKeys[monthKeys.length - 1])
          .get();

        const partnerHistory = pSnap.docs.map(d => ({
          id: d.id, ...d.data()
        }));

        const herData = monthKeys.map(mk => {
          const monthTxns = partnerHistory.filter(
            t => t.month === mk && t.type === 'expense'
          );
          return monthTxns.reduce((s, t) => s + t.amount, 0);
        });

        datasets.push({
          label: store.state.partnerProfile.name || 'Partner',
          data:  herData,
          color: colors.herColor
        });

      } catch (err) {
        console.error('Partner history error:', err);
      }
    }

    ChartManager.createLine('trend-chart', {
      labels:   monthLabels,
      datasets,
      symbol,
      smooth:   true,
      fill:     false
    });
  }

  // ── Build doughnut charts ──────────────────
  function buildDoughnuts(symbol) {
    const myTxns    = store.state.transactions.filter(
      t => t.month === store.state.currentMonth
    );
    const myCat     = store.getSpendByCategory(myTxns);
    const myEntries = Object.entries(myCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    if (myEntries.length > 0) {
      const labels = myEntries.map(([id]) =>
        CATEGORIES.find(c => c.id === id)?.label || id
      );
      const data   = myEntries.map(([, amt]) => amt);
      const colors = myEntries.map(([id]) =>
        CATEGORIES.find(c => c.id === id)?.color || '#94a3b8'
      );

      ChartManager.createDoughnut('my-doughnut', {
        labels, data, colors, symbol
      });

      // Build small legend
      const legend = document.getElementById('my-doughnut-legend');
      if (legend) {
        legend.innerHTML = buildSmallLegend(myEntries, symbol);
      }
    }

    // Partner doughnut
    if (store.state.partnerProfile) {
      const herTxns    = store.state.partnerTxns.filter(
        t => t.month === store.state.currentMonth
      );
      const herCat     = store.getSpendByCategory(herTxns);
      const herEntries = Object.entries(herCat)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      if (herEntries.length > 0) {
        const hLabels = herEntries.map(([id]) =>
          CATEGORIES.find(c => c.id === id)?.label || id
        );
        const hData   = herEntries.map(([, amt]) => amt);
        const hColors = herEntries.map(([id]) =>
          CATEGORIES.find(c => c.id === id)?.color || '#94a3b8'
        );

        ChartManager.createDoughnut('her-doughnut', {
          labels: hLabels, data: hData, colors: hColors, symbol
        });

        const legend = document.getElementById('her-doughnut-legend');
        if (legend) {
          legend.innerHTML = buildSmallLegend(herEntries, symbol);
        }
      }
    }
  }

  // ── Build small legend ─────────────────────
  function buildSmallLegend(entries, symbol) {
    const total = entries.reduce((s, [, a]) => s + a, 0);
    return entries.slice(0, 4).map(([catId, amount]) => {
      const cat = CATEGORIES.find(c => c.id === catId);
      const pct = ((amount / total) * 100).toFixed(0);
      return `
        <div class="legend-item">
          <div class="legend-dot" style="background:${cat?.color}"></div>
          <span class="legend-label truncate">${cat?.label || catId}</span>
          <span class="legend-pct">${pct}%</span>
        </div>
      `;
    }).join('');
  }

  // ── Build day of week chart ────────────────
  function buildDayChart(symbol) {
    const txns = store.state.transactions.filter(
      t => t.month === store.state.currentMonth && t.type === 'expense'
    );

    const days     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayTotals = new Array(7).fill(0);

    txns.forEach(tx => {
      if (!tx.date) return;
      const d = new Date(tx.date + 'T00:00:00');
      dayTotals[d.getDay()] += tx.amount;
    });

    const colors     = ChartManager.getThemeColors();
    const accentRgba = colors.youColor + 'cc';

    ChartManager.createBar('day-chart', {
      labels: days,
      datasets: [{
        label: 'Spending',
        data:  dayTotals,
        color: colors.youColor
      }],
      symbol
    });
  }

  // ── Set period ────────────────────────────
  function setPeriod(period) {
    currentPeriod = period;
    historyData   = null; // Reset cache
    ChartManager.destroyAll();
    render();
  }

  // ── Show export sheet ──────────────────────
  function showExportSheet() {
    Modal.sheet({
      id:    'modal-analytics-export',
      title: 'Export Analytics',
      items: [
        {
          label:  'Export as PDF',
          icon:   `<div class="sheet-item-icon">${Icons.export}</div>`,
          action: () => ExportManager.exportPDF()
        },
        {
          label:  'Export as CSV',
          icon:   `<div class="sheet-item-icon">${Icons.download}</div>`,
          action: () => ExportManager.exportCSV()
        },
        {
          label:  'Export as Excel',
          icon:   `<div class="sheet-item-icon">${Icons.download}</div>`,
          action: () => ExportManager.exportExcel()
        },
        {
          label:  'Save Trend Chart',
          icon:   `<div class="sheet-item-icon">${Icons.analytics}</div>`,
          action: () => ExportManager.exportChartImage(
            'trend-chart',
            'spending-trend'
          )
        }
      ]
    });
  }

  // ── Expose ────────────────────────────────
  return {
    init,
    render,
    setPeriod,
    showExportSheet
  };

})();

window.analyticsPage = analyticsPage;