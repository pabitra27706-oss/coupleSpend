// ─────────────────────────────────────────
//  Budget Feature & Page
//  CoupleSpend App
// ─────────────────────────────────────────

const budgetPage = (() => {

  // ── State ─────────────────────────────────
  let currentMonth = '';

  // ── Initialize ────────────────────────────
  function init() {
    currentMonth = store.state.currentMonth;
    render();

    store.subscribe('budgets', () => {
      if (router.getCurrent() === 'budget') render();
    });
    store.subscribe('transactions', () => {
      if (router.getCurrent() === 'budget') render();
    });
  }

  // ── Render ────────────────────────────────
  function render() {
    const content = document.getElementById('budget-content');
    if (!content) return;

    const budgets  = store.state.budgets;
    const txns     = store.state.transactions.filter(
      t => t.month === currentMonth
    );
    const catSpend = store.getSpendByCategory(txns);
    const symbol   = store.getCurrencySymbol();

    // Total budget & spent
    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent  = budgets.reduce((s, b) => {
      return s + (catSpend[b.category] || 0);
    }, 0);
    const totalPct = totalBudget > 0
      ? Math.min((totalSpent / totalBudget) * 100, 100)
      : 0;

    content.innerHTML = `

      <!-- Month Picker -->
      ${buildMonthPicker(
        currentMonth,
        () => budgetPage.prevMonth(),
        () => budgetPage.nextMonth()
      )}

      <!-- Budget Summary Card -->
      ${totalBudget > 0 ? `
        <div class="budget-summary-card card">
          <div class="budget-summary-top">
            <div class="budget-summary-info">
              <div class="budget-summary-label">Total Budget</div>
              <div class="budget-summary-amount">
                <span class="budget-spent">
                  ${symbol}${totalSpent.toFixed(2)}
                </span>
                <span class="budget-total">
                  / ${symbol}${totalBudget.toFixed(2)}
                </span>
              </div>
            </div>
            <div class="budget-summary-circle">
              <svg viewBox="0 0 36 36" class="budget-donut">
                <path class="budget-donut-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="budget-donut-fill"
                  stroke-dasharray="${totalPct.toFixed(1)}, 100"
                  style="stroke: ${
                    totalPct >= 100
                      ? 'var(--danger)'
                      : totalPct >= 80
                      ? 'var(--warning)'
                      : 'var(--success)'
                  }"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" class="budget-donut-text">
                  ${Math.round(totalPct)}%
                </text>
              </svg>
            </div>
          </div>
          <div class="progress-bar" style="height:8px;margin-top:var(--space-3)">
            <div class="progress-fill ${
              totalPct >= 100 ? 'danger' : totalPct >= 80 ? 'warning' : ''
            }" style="width: ${totalPct}%"></div>
          </div>
          <div class="budget-summary-sub">
            ${symbol}${(totalBudget - totalSpent).toFixed(2)} remaining
          </div>
        </div>` : ''
      }

      <!-- Add Budget Button -->
      <button
        class="btn btn-primary btn-full"
        onclick="budgetPage.showAddBudget()"
      >
        ${Icons.add}
        Add Budget
      </button>

      <!-- Budget List -->
      ${budgets.length > 0
        ? `<div class="budget-cards" id="budget-cards">
             ${budgets.map(b =>
               buildBudgetCard(b, catSpend, symbol)
             ).join('')}
           </div>`
        : buildEmptyState(
            'budget',
            'No budgets set',
            'Set spending limits for each category to track your expenses',
            'Add Budget',
            'budgetPage.showAddBudget()'
          )
      }

      <!-- Budget Tips -->
      ${budgets.length > 0 ? buildBudgetTips(budgets, catSpend, symbol) : ''}

    `;
  }

  // ── Build budget card ─────────────────────
  function buildBudgetCard(budget, catSpend, symbol) {
    const cat    = CATEGORIES.find(c => c.id === budget.category);
    const spent  = catSpend[budget.category] || 0;
    const pct    = Math.min((spent / budget.amount) * 100, 100);
    const remain = budget.amount - spent;
    const isOver = spent > budget.amount;

    const color = isOver
      ? 'var(--danger)'
      : pct >= 80
      ? 'var(--warning)'
      : 'var(--success)';

    const status = isOver
      ? 'Over budget'
      : pct >= 80
      ? 'Almost full'
      : 'On track';

    return `
      <div class="budget-card card">
        <div class="budget-card-header">
          <div class="budget-card-left">
            <div class="budget-card-icon"
              style="color:${cat?.color}; background:${cat?.color}18"
            >
              ${Icons[cat?.icon || 'other']}
            </div>
            <div class="budget-card-info">
              <div class="budget-card-name">${cat?.label || budget.category}</div>
              <div class="budget-card-status" style="color: ${color}">
                ${status}
              </div>
            </div>
          </div>
          <div class="budget-card-actions">
            <button
              class="btn btn-icon btn-ghost"
              onclick="budgetPage.editBudget('${budget.id}')"
              aria-label="Edit budget"
            >
              ${Icons.edit}
            </button>
            <button
              class="btn btn-icon btn-ghost"
              onclick="budgetPage.deleteBudget('${budget.id}')"
              style="color: var(--danger)"
              aria-label="Delete budget"
            >
              ${Icons.delete}
            </button>
          </div>
        </div>

        <!-- Progress -->
        <div class="budget-card-progress">
          <div class="progress-bar" style="height:8px">
            <div
              class="progress-fill"
              style="width:${pct}%; background:${color}; transition: width 0.5s ease"
            ></div>
          </div>
        </div>

        <!-- Amounts Row -->
        <div class="budget-card-amounts">
          <div class="budget-amount-item">
            <span class="budget-amount-label">Spent</span>
            <span class="budget-amount-value" style="color:${color}">
              ${symbol}${spent.toFixed(2)}
            </span>
          </div>
          <div class="budget-amount-item">
            <span class="budget-amount-label">Budget</span>
            <span class="budget-amount-value">
              ${symbol}${budget.amount.toFixed(2)}
            </span>
          </div>
          <div class="budget-amount-item">
            <span class="budget-amount-label">
              ${isOver ? 'Over' : 'Left'}
            </span>
            <span class="budget-amount-value" style="color:${
              isOver ? 'var(--danger)' : 'var(--success)'
            }">
              ${symbol}${Math.abs(remain).toFixed(2)}
            </span>
          </div>
          <div class="budget-amount-item">
            <span class="budget-amount-label">Used</span>
            <span class="budget-amount-value">
              ${pct.toFixed(0)}%
            </span>
          </div>
        </div>

        <!-- Alert threshold badge -->
        <div class="budget-card-footer">
          <span class="badge ${
            isOver ? 'badge-danger' : pct >= 80 ? 'badge-warning' : 'badge-success'
          }">
            Alert at ${budget.alertAt || 80}%
          </span>
          ${budget.shared
            ? `<span class="badge badge-accent">Shared</span>`
            : ''
          }
        </div>
      </div>
    `;
  }

  // ── Build budget tips ─────────────────────
  function buildBudgetTips(budgets, catSpend, symbol) {
    const tips = [];

    budgets.forEach(b => {
      const spent = catSpend[b.category] || 0;
      const pct   = (spent / b.amount) * 100;
      const cat   = CATEGORIES.find(c => c.id === b.category);

      if (pct >= 100) {
        tips.push({
          color: 'var(--danger)',
          icon:  Icons.warning,
          text:  `Your <strong>${cat?.label}</strong> budget is exceeded by
                  <strong>${symbol}${(spent - b.amount).toFixed(2)}</strong>`
        });
      } else if (pct >= 80) {
        tips.push({
          color: 'var(--warning)',
          icon:  Icons.warning,
          text:  `<strong>${cat?.label}</strong> budget is ${pct.toFixed(0)}% used.
                  Only <strong>${symbol}${(b.amount - spent).toFixed(2)}</strong> left`
        });
      }
    });

    if (tips.length === 0) return '';

    return `
      <div class="card">
        <div class="section-title mb-4">Budget Alerts</div>
        <div class="insights-list">
          ${tips.map(tip => `
            <div class="insight-item">
              <div class="insight-icon" style="color:${tip.color}">
                ${tip.icon}
              </div>
              <p class="insight-text">${tip.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ── Show add budget modal ──────────────────
  function showAddBudget(existingBudget = null) {
    const isEdit = !!existingBudget;
    const symbol = store.getCurrencySymbol();

    // Categories not yet budgeted
    const budgetedCats = store.state.budgets.map(b => b.category);
    const availableCats = isEdit
      ? CATEGORIES
      : CATEGORIES.filter(c =>
          !budgetedCats.includes(c.id) && c.id !== 'income'
        );

    const body = `
      <div class="input-group">
        <label class="input-label" for="budget-category">Category</label>
        <select class="input" id="budget-category" ${isEdit ? 'disabled' : ''}>
          ${availableCats.map(cat => `
            <option value="${cat.id}"
              ${existingBudget?.category === cat.id ? 'selected' : ''}
            >${cat.label}</option>
          `).join('')}
        </select>
      </div>

      <div class="input-group">
        <label class="input-label" for="budget-amount">
          Budget Amount (${symbol})
        </label>
        <input
          type="number"
          class="input"
          id="budget-amount"
          placeholder="0.00"
          value="${existingBudget?.amount || ''}"
          step="0.01"
          min="1"
          inputmode="decimal"
        />
      </div>

      <div class="input-group">
        <label class="input-label" for="budget-alert">
          Alert at (%)
        </label>
        <select class="input" id="budget-alert">
          ${[50, 70, 80, 90, 100].map(v => `
            <option value="${v}"
              ${(existingBudget?.alertAt || 80) === v ? 'selected' : ''}
            >${v}%</option>
          `).join('')}
        </select>
      </div>

      <div class="settings-toggle-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Shared Budget</div>
          <div class="settings-row-desc">
            Both you and partner count toward this budget
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox"
            id="budget-shared"
            ${existingBudget?.shared ? 'checked' : ''}
          />
          <div class="toggle-track">
            <div class="toggle-thumb"></div>
          </div>
        </label>
      </div>

      <button
        class="btn btn-primary btn-full"
        onclick="budgetPage.saveBudget('${existingBudget?.id || ''}')"
      >
        ${isEdit ? 'Save Changes' : 'Add Budget'}
      </button>
    `;

    Modal.create({
      id:       'modal-add-budget',
      title:    isEdit ? 'Edit Budget' : 'Add Budget',
      body,
      position: 'bottom'
    });
    Modal.open('modal-add-budget');
  }

  // ── Save budget ───────────────────────────
  async function saveBudget(editId = '') {
    const category = document.getElementById('budget-category')?.value;
    const amount   = parseFloat(document.getElementById('budget-amount')?.value);
    const alertAt  = parseInt(document.getElementById('budget-alert')?.value);
    const shared   = document.getElementById('budget-shared')?.checked;

    if (!category) {
      Toast.error('Error', 'Please select a category');
      return;
    }
    if (!amount || amount <= 0) {
      Toast.error('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const uid   = store.state.user?.uid;
      const month = currentMonth;

      const data = {
        userId:   uid,
        category,
        amount,
        month,
        alertAt:  alertAt || 80,
        shared:   shared  || false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (editId) {
        await db.collection(COLLECTIONS.BUDGETS).doc(editId).update(data);
        Toast.success('Updated', 'Budget updated');
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection(COLLECTIONS.BUDGETS).add(data);
        Toast.success('Added', 'Budget created');
      }

      Modal.close('modal-add-budget');
      await store.loadBudgets(uid, month);

    } catch (err) {
      console.error('Save budget error:', err);
      Toast.error('Failed', 'Could not save budget');
    }
  }

  // ── Edit budget ───────────────────────────
  function editBudget(budgetId) {
    const budget = store.state.budgets.find(b => b.id === budgetId);
    if (!budget) return;
    showAddBudget(budget);
  }

  // ── Delete budget ─────────────────────────
  async function deleteBudget(budgetId) {
    const confirmed = await Modal.confirm({
      title:   'Delete Budget',
      message: 'Remove this budget limit?',
      okText:  'Delete',
      okClass: 'btn-danger'
    });

    if (!confirmed) return;

    try {
      await db.collection(COLLECTIONS.BUDGETS).doc(budgetId).delete();
      Toast.success('Deleted', 'Budget removed');
      const uid = store.state.user?.uid;
      await store.loadBudgets(uid, currentMonth);
    } catch (err) {
      console.error('Delete budget error:', err);
      Toast.error('Failed', 'Could not delete budget');
    }
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
    showAddBudget,
    saveBudget,
    editBudget,
    deleteBudget,
    prevMonth,
    nextMonth
  };

})();

window.budgetPage = budgetPage;