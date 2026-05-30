// ─────────────────────────────────────────
//  Compare Feature & Page
//  CoupleSpend App
// ─────────────────────────────────────────

const comparePage = (() => {

  // ── State ─────────────────────────────────
  let chartBar     = null;
  let chartHistory = null;
  let currentMonth = '';

  // ── Initialize ────────────────────────────
  function init() {
    currentMonth = store.state.currentMonth;
    render();

    store.subscribe('transactions', () => {
      if (router.getCurrent() === 'compare') render();
    });
    store.subscribe('partnerTxns', () => {
      if (router.getCurrent() === 'compare') render();
    });
  }

  // ── Render ────────────────────────────────
  function render() {
    const content = document.getElementById('compare-content');
    if (!content) return;

    const profile      = store.state.profile;
    const partnerProf  = store.state.partnerProfile;
    const hasPartner   = !!partnerProf;
    const symbol       = store.getCurrencySymbol();

    if (!hasPartner) {
      content.innerHTML = buildNoPartnerState();
      return;
    }

    const myName      = profile?.name       || 'You';
    const herName     = partnerProf?.name   || 'Partner';
    const myTxns      = store.state.transactions.filter(
      t => t.month === currentMonth
    );
    const herTxns     = store.state.partnerTxns.filter(
      t => t.month === currentMonth
    );
    const mySpend     = store.getTotalSpend(myTxns);
    const herSpend    = store.getTotalSpend(herTxns);
    const myIncome    = store.getTotalIncome(myTxns);
    const herIncome   = store.getTotalIncome(herTxns);
    const combined    = mySpend + herSpend;
    const diff        = mySpend - herSpend;
    const myCatSpend  = store.getSpendByCategory(myTxns);
    const herCatSpend = store.getSpendByCategory(herTxns);

    content.innerHTML = `

      <!-- Month Picker -->
      ${buildMonthPicker(
        currentMonth,
        () => comparePage.prevMonth(),
        () => comparePage.nextMonth()
      )}

      <!-- Who Won Banner -->
      <div class="compare-winner-card ${
        diff > 0 ? 'winner-her' : diff < 0 ? 'winner-you' : 'winner-tie'
      }">
        <div class="compare-winner-icon">
          ${diff === 0
            ? Icons.check
            : diff > 0
            ? Icons.trending_up
            : Icons.trending_down
          }
        </div>
        <div class="compare-winner-text">
          ${diff === 0
            ? `Equal spending this month`
            : diff > 0
            ? `${herName} saved more this month`
            : `${myName} saved more this month`
          }
        </div>
        <div class="compare-winner-diff">
          ${diff !== 0
            ? `Difference: <strong>${symbol}${Math.abs(diff).toFixed(2)}</strong>`
            : 'Great balance!'
          }
        </div>
      </div>

      <!-- Head to Head Cards -->
      <div class="compare-heads">

        <!-- You -->
        <div class="compare-head-card you-card">
          <div class="compare-head-avatar">
            <div class="avatar avatar-md" style="
              border-color: var(--you-color);
              color: var(--you-color);
              background: rgba(var(--you-rgb),0.1)
            ">
              ${Icons.user}
            </div>
          </div>
          <div class="compare-head-name">${myName}</div>
          <div class="compare-head-amount" style="color: var(--you-color)">
            ${symbol}${mySpend.toFixed(2)}
          </div>
          <div class="compare-head-sub">
            ${myTxns.filter(t => t.type === 'expense').length} expenses
          </div>
          <div class="compare-head-income">
            Income: ${symbol}${myIncome.toFixed(2)}
          </div>
        </div>

        <!-- VS -->
        <div class="compare-vs">
          <span>VS</span>
        </div>

        <!-- Her -->
        <div class="compare-head-card her-card">
          <div class="compare-head-avatar">
            <div class="avatar avatar-md" style="
              border-color: var(--her-color);
              color: var(--her-color);
              background: rgba(var(--her-rgb),0.1)
            ">
              ${Icons.user}
            </div>
          </div>
          <div class="compare-head-name">${herName}</div>
          <div class="compare-head-amount" style="color: var(--her-color)">
            ${symbol}${herSpend.toFixed(2)}
          </div>
          <div class="compare-head-sub">
            ${herTxns.filter(t => t.type === 'expense').length} expenses
          </div>
          <div class="compare-head-income">
            Income: ${symbol}${herIncome.toFixed(2)}
          </div>
        </div>

      </div>

      <!-- Combined Total -->
      <div class="compare-combined card">
        <div class="compare-combined-label">Combined Spending</div>
        <div class="compare-combined-amount">
          ${symbol}${combined.toFixed(2)}
        </div>
        <!-- Split bar -->
        <div class="compare-split-bar">
          <div class="compare-split-you"
            style="flex: ${mySpend || 0.5}"
            title="${myName}: ${symbol}${mySpend.toFixed(2)}"
          ></div>
          <div class="compare-split-her"
            style="flex: ${herSpend || 0.5}"
            title="${herName}: ${symbol}${herSpend.toFixed(2)}"
          ></div>
        </div>
        <div class="compare-split-labels">
          <span style="color: var(--you-color)">
            ${myName}: ${combined > 0
              ? ((mySpend/combined)*100).toFixed(0)
              : 50
            }%
          </span>
          <span style="color: var(--her-color)">
            ${herName}: ${combined > 0
              ? ((herSpend/combined)*100).toFixed(0)
              : 50
            }%
          </span>
        </div>
      </div>

      <!-- Bar Chart: Category comparison -->
      <div class="card">
        <div class="section-header mb-4">
          <span class="section-title">Category Comparison</span>
        </div>
        <div class="chart-wrap" style="height: 280px">
          <canvas id="compare-bar-chart"></canvas>
        </div>
      </div>

      <!-- Category Table -->
      <div class="card card-flush">
        <div class="section-header p-5 pb-0 mb-2">
          <span class="section-title">Breakdown</span>
        </div>

        <!-- Table Header -->
        <div class="compare-table-head">
          <span class="compare-table-cat">Category</span>
          <span style="color: var(--you-color)">${myName}</span>
          <span style="color: var(--her-color)">${herName}</span>
          <span>Diff</span>
        </div>

        <!-- Table Rows -->
        <div id="compare-table-body">
          ${buildCategoryTable(myCatSpend, herCatSpend, symbol)}
        </div>
      </div>

      <!-- Insights -->
      <div class="card">
        <div class="section-header mb-4">
          <span class="section-title">Insights</span>
        </div>
        <div class="insights-list">
          ${buildInsights(
            myTxns, herTxns,
            mySpend, herSpend,
            myCatSpend, herCatSpend,
            myName, herName, symbol
          )}
        </div>
      </div>

      <!-- Export Button -->
      <button
        class="btn btn-secondary btn-full"
        onclick="exportCompareReport()"
      >
        ${Icons.export}
        Export Comparison Report
      </button>

    `;

    // Build charts after render
    setTimeout(() => {
      buildBarChart(myCatSpend, herCatSpend, myName, herName, symbol);
    }, 100);
  }

  // ── Build category table ───────────────────
  function buildCategoryTable(myCat, herCat, symbol) {
    // Merge all categories
    const allCats = new Set([
      ...Object.keys(myCat),
      ...Object.keys(herCat)
    ]);

    if (allCats.size === 0) {
      return `<div class="p-5 text-center text-muted text-sm">
        No data for this month
      </div>`;
    }

    // Sort by combined spend
    const sorted = [...allCats].sort((a, b) => {
      const totalA = (myCat[a] || 0) + (herCat[a] || 0);
      const totalB = (myCat[b] || 0) + (herCat[b] || 0);
      return totalB - totalA;
    });

    return sorted.map(catId => {
      const cat    = CATEGORIES.find(c => c.id === catId);
      const myAmt  = myCat[catId]  || 0;
      const herAmt = herCat[catId] || 0;
      const diff   = myAmt - herAmt;

      return `
        <div class="compare-table-row">
          <div class="compare-table-cat">
            <span class="compare-cat-icon"
              style="color:${cat?.color}; background:${cat?.color}18"
            >
              ${Icons[cat?.icon || 'other']}
            </span>
            <span class="compare-cat-label truncate">
              ${cat?.label || catId}
            </span>
          </div>
          <span class="compare-table-val"
            style="color: var(--you-color)"
          >
            ${myAmt > 0 ? `${symbol}${myAmt.toFixed(0)}` : '-'}
          </span>
          <span class="compare-table-val"
            style="color: var(--her-color)"
          >
            ${herAmt > 0 ? `${symbol}${herAmt.toFixed(0)}` : '-'}
          </span>
          <span class="compare-table-diff ${
            diff > 0 ? 'diff-positive' : diff < 0 ? 'diff-negative' : ''
          }">
            ${diff === 0
              ? '-'
              : `${diff > 0 ? '+' : ''}${symbol}${Math.abs(diff).toFixed(0)}`
            }
          </span>
        </div>
      `;
    }).join('');
  }

  // ── Build bar chart ────────────────────────
  function buildBarChart(myCat, herCat, myName, herName, symbol) {
    const canvas = document.getElementById('compare-bar-chart');
    if (!canvas) return;

    if (chartBar) {
      chartBar.destroy();
      chartBar = null;
    }

    // Get top categories by combined spend
    const allCats = new Set([
      ...Object.keys(myCat),
      ...Object.keys(herCat)
    ]);

    const sorted = [...allCats]
      .sort((a, b) => {
        return ((myCat[b] || 0) + (herCat[b] || 0))
             - ((myCat[a] || 0) + (herCat[a] || 0));
      })
      .slice(0, 7);

    const labels  = sorted.map(id =>
      CATEGORIES.find(c => c.id === id)?.label || id
    );
    const myData  = sorted.map(id => myCat[id]  || 0);
    const herData = sorted.map(id => herCat[id] || 0);

    const isDark = ['dark', 'amoled', 'ocean', 'rose'].includes(
      store.state.profile?.theme || 'dark'
    );
    const gridColor = isDark
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.06)';
    const labelColor = isDark ? '#94a3b8' : '#64748b';

    // Get CSS variable values
    const style    = getComputedStyle(document.documentElement);
    const youColor = style.getPropertyValue('--you-color').trim() || '#6366f1';
    const herColor = style.getPropertyValue('--her-color').trim() || '#ec4899';

    chartBar = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label:           myName,
            data:            myData,
            backgroundColor: youColor + 'cc',
            borderColor:     youColor,
            borderWidth:     1,
            borderRadius:    6,
            borderSkipped:   false
          },
          {
            label:           herName,
            data:            herData,
            backgroundColor: herColor + 'cc',
            borderColor:     herColor,
            borderWidth:     1,
            borderRadius:    6,
            borderSkipped:   false
          }
        ]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display:  true,
            position: 'top',
            labels: {
              color:      labelColor,
              boxWidth:   12,
              boxHeight:  12,
              borderRadius: 6,
              padding:    16,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor:      isDark ? '#f1f5f9' : '#0f172a',
            bodyColor:       isDark ? '#94a3b8' : '#475569',
            borderColor:     isDark ? '#334155' : '#e2e8f0',
            borderWidth:     1,
            padding:         12,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${symbol}${ctx.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid:   { display: false },
            border: { display: false },
            ticks: {
              color:    labelColor,
              font:     { size: 10 },
              maxRotation: 30
            }
          },
          y: {
            grid: {
              color:        gridColor,
              drawBorder:   false
            },
            border: { display: false },
            ticks: {
              color:    labelColor,
              font:     { size: 10 },
              callback: (v) => `${symbol}${v}`
            }
          }
        },
        animation: { duration: 600 }
      }
    });
  }

  // ── Build insights ─────────────────────────
  function buildInsights(
    myTxns, herTxns,
    mySpend, herSpend,
    myCat, herCat,
    myName, herName, symbol
  ) {
    const insights = [];

    // Who spends more overall
    if (mySpend > herSpend) {
      insights.push({
        icon:  Icons.trending_up,
        color: 'var(--danger)',
        text:  `${myName} spent <strong>${symbol}${(mySpend - herSpend).toFixed(2)}</strong> more than ${herName} this month`
      });
    } else if (herSpend > mySpend) {
      insights.push({
        icon:  Icons.trending_up,
        color: 'var(--her-color)',
        text:  `${herName} spent <strong>${symbol}${(herSpend - mySpend).toFixed(2)}</strong> more than ${myName} this month`
      });
    }

    // Highest category for each
    const myTopCat = Object.entries(myCat)
      .sort((a, b) => b[1] - a[1])[0];
    const herTopCat = Object.entries(herCat)
      .sort((a, b) => b[1] - a[1])[0];

    if (myTopCat) {
      const cat = CATEGORIES.find(c => c.id === myTopCat[0]);
      insights.push({
        icon:  Icons[cat?.icon || 'other'],
        color: cat?.color || 'var(--accent)',
        text:  `${myName}'s top category is <strong>${cat?.label}</strong> at ${symbol}${myTopCat[1].toFixed(2)}`
      });
    }

    if (herTopCat && herTopCat[0] !== myTopCat?.[0]) {
      const cat = CATEGORIES.find(c => c.id === herTopCat[0]);
      insights.push({
        icon:  Icons[cat?.icon || 'other'],
        color: cat?.color || 'var(--accent)',
        text:  `${herName}'s top category is <strong>${cat?.label}</strong> at ${symbol}${herTopCat[1].toFixed(2)}`
      });
    }

    // Transaction count
    const myCount  = myTxns.filter(t => t.type === 'expense').length;
    const herCount = herTxns.filter(t => t.type === 'expense').length;
    if (myCount !== herCount) {
      const more = myCount > herCount ? myName : herName;
      const less = myCount > herCount ? herName : myName;
      insights.push({
        icon:  Icons.transactions,
        color: 'var(--accent)',
        text:  `${more} made more transactions than ${less} this month`
      });
    }

    // Average transaction
    if (myCount > 0 && herCount > 0) {
      const myAvg  = mySpend  / myCount;
      const herAvg = herSpend / herCount;
      if (Math.abs(myAvg - herAvg) > 1) {
        const higher = myAvg > herAvg ? myName : herName;
        const avg    = Math.max(myAvg, herAvg);
        insights.push({
          icon:  Icons.wallet,
          color: 'var(--warning)',
          text:  `${higher} has a higher average spend of ${symbol}${avg.toFixed(2)} per transaction`
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        icon:  Icons.info,
        color: 'var(--text-muted)',
        text:  'Add more transactions to see insights'
      });
    }

    return insights.map(ins => `
      <div class="insight-item">
        <div class="insight-icon" style="color: ${ins.color}">
          ${ins.icon}
        </div>
        <p class="insight-text">${ins.text}</p>
      </div>
    `).join('');
  }

  // ── No partner state ───────────────────────
  function buildNoPartnerState() {
    return `
      <div class="no-partner-state">
        ${buildEmptyState(
          'users',
          'No partner linked',
          'Link your partner\'s account to compare spending and see insights',
          'Link Partner',
          "router.navigate('settings')"
        )}
      </div>
    `;
  }

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
    if (next > new Date()) return;
    currentMonth = `${next.getFullYear()}-${
      String(next.getMonth() + 1).padStart(2, '0')
    }`;
    store.changeMonth(currentMonth).then(() => render());
  }

  // ── Expose ────────────────────────────────
  return {
    init,
    render,
    prevMonth,
    nextMonth
  };

})();

// ── Export compare report ──────────────────
function exportCompareReport() {
  Toast.info('Exporting', 'Generating comparison report...');
  // Will be implemented in export.js Part 7
  setTimeout(() => {
    if (window.ExportManager) {
      ExportManager.exportComparePDF();
    }
  }, 500);
}

window.comparePage        = comparePage;
window.exportCompareReport = exportCompareReport;