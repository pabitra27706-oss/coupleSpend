// ─────────────────────────────────────────
//  Charts Configuration & Helpers
//  CoupleSpend App
// ─────────────────────────────────────────

const ChartManager = (() => {

  // ── Active chart instances ─────────────────
  const instances = {};

  // ── Get theme colors ───────────────────────
  function getThemeColors() {
    const style    = getComputedStyle(document.documentElement);
    const isDark   = ['dark', 'amoled', 'ocean', 'rose'].includes(
      store.state.profile?.theme || 'dark'
    );

    return {
      isDark,
      accent:      style.getPropertyValue('--accent').trim()      || '#6366f1',
      youColor:    style.getPropertyValue('--you-color').trim()   || '#6366f1',
      herColor:    style.getPropertyValue('--her-color').trim()   || '#ec4899',
      success:     style.getPropertyValue('--success').trim()     || '#10b981',
      warning:     style.getPropertyValue('--warning').trim()     || '#f59e0b',
      danger:      style.getPropertyValue('--danger').trim()      || '#ef4444',
      bgCard:      style.getPropertyValue('--bg-card').trim()     || '#1e293b',
      bgInput:     style.getPropertyValue('--bg-input').trim()    || '#334155',
      textPrimary: style.getPropertyValue('--text-primary').trim()|| '#f1f5f9',
      textMuted:   style.getPropertyValue('--text-muted').trim()  || '#64748b',
      border:      style.getPropertyValue('--border').trim()      || '#334155',
      gridColor:   isDark
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.05)',
      labelColor: isDark ? '#64748b' : '#94a3b8'
    };
  }

  // ── Default chart options ──────────────────
  function getDefaultOptions(colors) {
    return {
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 600, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: colors.bgCard,
          titleColor:      colors.textPrimary,
          bodyColor:       colors.textMuted,
          borderColor:     colors.border,
          borderWidth:     1,
          padding:         12,
          cornerRadius:    8,
          displayColors:   true,
          boxWidth:        8,
          boxHeight:       8,
          usePointStyle:   true
        }
      },
      scales: {
        x: {
          grid:   { display: false },
          border: { display: false },
          ticks: {
            color:    colors.labelColor,
            font:     { size: 10, family: 'Inter' },
            maxRotation: 0
          }
        },
        y: {
          grid: {
            color:      colors.gridColor,
            drawBorder: false
          },
          border: { display: false },
          ticks: {
            color: colors.labelColor,
            font:  { size: 10, family: 'Inter' }
          }
        }
      }
    };
  }

  // ── Destroy chart ──────────────────────────
  function destroy(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  // ── Destroy all charts ─────────────────────
  function destroyAll() {
    Object.keys(instances).forEach(id => destroy(id));
  }

  // ── Doughnut Chart ─────────────────────────
  function createDoughnut(canvasId, {
    labels   = [],
    data     = [],
    colors   = [],
    symbol   = '$',
    cutout   = '68%',
    onHover  = null
  }) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const theme = getThemeColors();

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map(c => c + 'cc'),
          borderColor:     colors,
          borderWidth:     2,
          hoverBorderWidth: 3,
          hoverOffset:     10
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        cutout,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.bgCard,
            titleColor:      theme.textPrimary,
            bodyColor:       theme.textMuted,
            borderColor:     theme.border,
            borderWidth:     1,
            padding:         12,
            cornerRadius:    8,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data
                  .reduce((a, b) => a + b, 0);
                const pct   = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${symbol}${ctx.parsed.toFixed(2)} (${pct}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration:      700
        },
        onHover: onHover || null
      }
    });

    instances[canvasId] = chart;
    return chart;
  }

  // ── Bar Chart ──────────────────────────────
  function createBar(canvasId, {
    labels   = [],
    datasets = [],
    symbol   = '$',
    stacked  = false,
    horizontal = false
  }) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const colors  = getThemeColors();
    const options = getDefaultOptions(colors);

    // Merge stacked option
    if (stacked) {
      options.scales.x.stacked = true;
      options.scales.y.stacked = true;
    }

    // Horizontal
    if (horizontal) {
      options.indexAxis = 'y';
    }

    options.plugins.tooltip.callbacks = {
      label: (ctx) =>
        ` ${ctx.dataset.label}: ${symbol}${ctx.parsed.y?.toFixed(2) || ctx.parsed.x?.toFixed(2)}`
    };

    options.plugins.legend = {
      display:  datasets.length > 1,
      position: 'top',
      labels: {
        color:        colors.labelColor,
        boxWidth:     10,
        boxHeight:    10,
        borderRadius: 5,
        padding:      14,
        font:         { size: 11 }
      }
    };

    options.scales.y.ticks.callback = (v) => `${symbol}${v}`;

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label:           ds.label || `Series ${i + 1}`,
          data:            ds.data  || [],
          backgroundColor: (ds.color || colors.accent) + 'cc',
          borderColor:     ds.color || colors.accent,
          borderWidth:     1,
          borderRadius:    6,
          borderSkipped:   false,
          ...ds.extra
        }))
      },
      options
    });

    instances[canvasId] = chart;
    return chart;
  }

  // ── Line Chart ─────────────────────────────
  function createLine(canvasId, {
    labels   = [],
    datasets = [],
    symbol   = '$',
    smooth   = true,
    fill     = false
  }) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const colors  = getThemeColors();
    const options = getDefaultOptions(colors);

    options.plugins.tooltip.callbacks = {
      label: (ctx) =>
        ` ${ctx.dataset.label}: ${symbol}${ctx.parsed.y.toFixed(2)}`
    };

    options.plugins.legend = {
      display:  datasets.length > 1,
      position: 'top',
      labels: {
        color:        colors.labelColor,
        boxWidth:     10,
        boxHeight:    10,
        borderRadius: 5,
        padding:      14,
        font:         { size: 11 }
      }
    };

    options.scales.y.ticks.callback = (v) => `${symbol}${v}`;

    options.elements = {
      point: {
        radius:      4,
        hoverRadius: 6,
        borderWidth: 2
      },
      line: {
        borderWidth: 2.5
      }
    };

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label:       ds.label || `Series ${i + 1}`,
          data:        ds.data  || [],
          borderColor: ds.color || colors.accent,
          backgroundColor: fill
            ? (ds.color || colors.accent) + '20'
            : 'transparent',
          fill,
          tension:     smooth ? 0.4 : 0,
          pointBackgroundColor: ds.color || colors.accent,
          pointBorderColor:     colors.bgCard,
          ...ds.extra
        }))
      },
      options
    });

    instances[canvasId] = chart;
    return chart;
  }

  // ── Pie Chart ──────────────────────────────
  function createPie(canvasId, {
    labels = [],
    data   = [],
    colors = [],
    symbol = '$'
  }) {
    return createDoughnut(canvasId, {
      labels,
      data,
      colors,
      symbol,
      cutout: '0%'
    });
  }

  // ── Area Chart ─────────────────────────────
  function createArea(canvasId, opts) {
    return createLine(canvasId, { ...opts, fill: true });
  }

  // ── Update chart data ──────────────────────
  function update(canvasId, newData) {
    const chart = instances[canvasId];
    if (!chart) return;

    chart.data = newData;
    chart.update('active');
  }

  // ── Get 6 months labels ────────────────────
  function getLast6MonthLabels() {
    const labels = [];
    const now    = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', {
        month: 'short',
        year:  '2-digit'
      }));
    }

    return labels;
  }

  // ── Get 6 months keys ─────────────────────
  function getLast6MonthKeys() {
    const keys = [];
    const now  = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      );
    }

    return keys;
  }

  // ── Expose ────────────────────────────────
  return {
    createDoughnut,
    createBar,
    createLine,
    createPie,
    createArea,
    destroy,
    destroyAll,
    update,
    getThemeColors,
    getLast6MonthLabels,
    getLast6MonthKeys
  };

})();

window.ChartManager = ChartManager;