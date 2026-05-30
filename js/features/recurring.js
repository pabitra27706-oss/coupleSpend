// ─────────────────────────────────────────
//  Recurring Transactions Manager
//  CoupleSpend App
// ─────────────────────────────────────────

const RecurringManager = (() => {

  // ── Check & add due recurring ──────────────
  async function checkAndAdd() {
    const uid       = store.state.user?.uid;
    const recurring = store.state.recurring;
    const today     = getTodayStr();

    if (!uid || recurring.length === 0) return;

    const toAdd = recurring.filter(r => {
      return r.isActive && r.nextDate && r.nextDate <= today;
    });

    if (toAdd.length === 0) return;

    console.log(`[Recurring] Adding ${toAdd.length} transactions`);

    for (const rec of toAdd) {
      try {
        await addRecurringTransaction(rec, today, uid);
      } catch (err) {
        console.error('[Recurring] Add error:', err, rec);
      }
    }
  }

  // ── Add recurring transaction ──────────────
  async function addRecurringTransaction(rec, date, uid) {
    const month = date.substring(0, 7);

    // Add transaction
    await db.collection(COLLECTIONS.TRANSACTIONS).add({
      userId:        uid,
      amount:        rec.amount,
      category:      rec.category,
      type:          rec.type || 'expense',
      date,
      month,
      paymentMethod: rec.paymentMethod || 'card',
      description:   rec.description || '',
      tags:          rec.tags || [],
      isRecurring:   true,
      recurringId:   rec.id,
      createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:     firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update next date on recurring doc
    const nextDate = getNextDate(rec.frequency, date);
    await db.collection(COLLECTIONS.RECURRING).doc(rec.id).update({
      nextDate,
      lastAdded: date
    });

    // Notify user
    const cat = CATEGORIES.find(c => c.id === rec.category);
    notificationsPage.showLocalNotification(
      'Recurring Transaction Added',
      `${rec.description || cat?.label}: ${store.getCurrencySymbol()}${rec.amount.toFixed(2)}`
    );
  }

  // ── Calculate next date ────────────────────
  function getNextDate(frequency, fromDate) {
    const date = new Date(fromDate + 'T00:00:00');

    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }

    return date.toISOString().split('T')[0];
  }

  // ── Add new recurring ──────────────────────
  async function add(data) {
    const uid     = store.state.user?.uid;
    const today   = getTodayStr();
    const nextDate = getNextDate(data.frequency, data.startDate || today);

    try {
      await db.collection(COLLECTIONS.RECURRING).add({
        userId:        uid,
        amount:        data.amount,
        category:      data.category,
        type:          data.type || 'expense',
        description:   data.description || '',
        frequency:     data.frequency,
        paymentMethod: data.paymentMethod || 'card',
        tags:          data.tags || [],
        startDate:     data.startDate || today,
        nextDate,
        endDate:       data.endDate   || null,
        isActive:      true,
        createdAt:     firebase.firestore.FieldValue.serverTimestamp()
      });

      await store.loadRecurring(uid);
      Toast.success('Added', 'Recurring transaction created');

    } catch (err) {
      console.error('Add recurring error:', err);
      Toast.error('Failed', 'Could not create recurring transaction');
    }
  }

  // ── Toggle active state ────────────────────
  async function toggle(recurringId, isActive) {
    try {
      await db
        .collection(COLLECTIONS.RECURRING)
        .doc(recurringId)
        .update({ isActive });

      const uid = store.state.user?.uid;
      await store.loadRecurring(uid);

      Toast.success(
        isActive ? 'Resumed' : 'Paused',
        `Recurring transaction ${isActive ? 'resumed' : 'paused'}`
      );

    } catch (err) {
      console.error('Toggle recurring error:', err);
    }
  }

  // ── Delete recurring ───────────────────────
  async function remove(recurringId) {
    const confirmed = await Modal.confirm({
      title:   'Delete Recurring',
      message: 'Stop and delete this recurring transaction?',
      okText:  'Delete',
      okClass: 'btn-danger'
    });

    if (!confirmed) return;

    try {
      await db
        .collection(COLLECTIONS.RECURRING)
        .doc(recurringId)
        .delete();

      const uid = store.state.user?.uid;
      await store.loadRecurring(uid);
      Toast.success('Deleted', 'Recurring transaction removed');

    } catch (err) {
      console.error('Delete recurring error:', err);
      Toast.error('Failed', 'Could not delete recurring transaction');
    }
  }

  // ── Show recurring list modal ──────────────
  function showRecurringList() {
    const recurring = store.state.recurring;
    const symbol    = store.getCurrencySymbol();

    const body = recurring.length === 0
      ? buildEmptyState(
          'recurring',
          'No recurring transactions',
          'Set up automatic recurring expenses like rent, subscriptions etc.',
          'Add Recurring',
          'RecurringManager.showAddForm()'
        )
      : `
        <div class="recurring-list">
          ${recurring.map(rec => buildRecurringItem(rec, symbol)).join('')}
        </div>
        <button
          class="btn btn-primary btn-full mt-4"
          onclick="RecurringManager.showAddForm()"
        >
          ${Icons.add}
          Add Recurring
        </button>
      `;

    Modal.create({
      id:       'modal-recurring',
      title:    'Recurring Transactions',
      body,
      position: 'bottom'
    });
    Modal.open('modal-recurring');
  }

  // ── Build recurring item ───────────────────
  function buildRecurringItem(rec, symbol) {
    const cat = CATEGORIES.find(c => c.id === rec.category);
    const freqLabels = {
      daily:     'Daily',
      weekly:    'Weekly',
      biweekly:  'Every 2 weeks',
      monthly:   'Monthly',
      yearly:    'Yearly'
    };

    return `
      <div class="recurring-item ${!rec.isActive ? 'paused' : ''}">
        <div class="recurring-icon"
          style="color:${cat?.color}; background:${cat?.color}18"
        >
          ${Icons[cat?.icon || 'other']}
        </div>
        <div class="recurring-info">
          <div class="recurring-name">
            ${rec.description || cat?.label || rec.category}
          </div>
          <div class="recurring-meta">
            ${freqLabels[rec.frequency] || rec.frequency}
            · Next: ${formatDate(rec.nextDate)}
          </div>
          ${!rec.isActive
            ? `<span class="badge badge-warning">Paused</span>`
            : ''
          }
        </div>
        <div class="recurring-right">
          <div class="recurring-amount" style="
            color: ${rec.type === 'income' ? 'var(--success)' : 'var(--danger)'}
          ">
            ${rec.type === 'income' ? '+' : '-'}${symbol}${rec.amount.toFixed(2)}
          </div>
          <div class="recurring-actions">
            <button
              class="btn btn-icon btn-ghost btn-sm"
              onclick="RecurringManager.toggle('${rec.id}', ${!rec.isActive})"
              title="${rec.isActive ? 'Pause' : 'Resume'}"
            >
              ${rec.isActive ? Icons.warning : Icons.check}
            </button>
            <button
              class="btn btn-icon btn-ghost btn-sm"
              onclick="RecurringManager.remove('${rec.id}')"
              style="color: var(--danger)"
              title="Delete"
            >
              ${Icons.delete}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Show add form ──────────────────────────
  function showAddForm() {
    const symbol = store.getCurrencySymbol();

    const body = `
      <div class="input-group">
        <label class="input-label">Category</label>
        <select class="input" id="rec-category">
          ${CATEGORIES.filter(c => c.id !== 'income').map(cat => `
            <option value="${cat.id}">${cat.label}</option>
          `).join('')}
        </select>
      </div>

      <div class="input-group">
        <label class="input-label">Type</label>
        <select class="input" id="rec-type">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div class="input-group">
        <label class="input-label">
          Amount (${symbol})
        </label>
        <input
          type="number"
          class="input"
          id="rec-amount"
          placeholder="0.00"
          step="0.01"
          inputmode="decimal"
        />
      </div>

      <div class="input-group">
        <label class="input-label">Description</label>
        <input
          type="text"
          class="input"
          id="rec-description"
          placeholder="e.g. Netflix, Rent..."
        />
      </div>

      <div class="input-group">
        <label class="input-label">Frequency</label>
        <select class="input" id="rec-frequency">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every 2 Weeks</option>
          <option value="monthly" selected>Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div class="form-row-2">
        <div class="input-group">
          <label class="input-label">Start Date</label>
          <input
            type="date"
            class="input"
            id="rec-start"
            value="${getTodayStr()}"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Payment</label>
          <select class="input" id="rec-payment">
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
            <option value="wallet">E-Wallet</option>
          </select>
        </div>
      </div>

      <button
        class="btn btn-primary btn-full"
        onclick="RecurringManager.saveForm()"
      >
        ${Icons.recurring}
        Add Recurring
      </button>
    `;

    Modal.create({
      id:       'modal-add-recurring',
      title:    'Add Recurring',
      body,
      position: 'bottom'
    });
    Modal.open('modal-add-recurring');
  }

  // ── Save form ──────────────────────────────
  async function saveForm() {
    const category    = document.getElementById('rec-category')?.value;
    const type        = document.getElementById('rec-type')?.value;
    const amount      = parseFloat(document.getElementById('rec-amount')?.value);
    const description = document.getElementById('rec-description')?.value.trim();
    const frequency   = document.getElementById('rec-frequency')?.value;
    const startDate   = document.getElementById('rec-start')?.value;
    const payment     = document.getElementById('rec-payment')?.value;

    if (!amount || amount <= 0) {
      Toast.error('Invalid', 'Please enter a valid amount');
      return;
    }

    Modal.close('modal-add-recurring');

    await add({
      category,
      type,
      amount,
      description,
      frequency,
      startDate,
      paymentMethod: payment
    });
  }

  // ── Expose ────────────────────────────────
  return {
    checkAndAdd,
    add,
    toggle,
    remove,
    showRecurringList,
    showAddForm,
    saveForm
  };

})();

// ── CSS for notifications & recurring ─────
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  /* Notifications */
  .notif-header {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
  }
  .notif-list { overflow: hidden; }
  .notif-item {
    display:       flex;
    align-items:   flex-start;
    gap:           var(--space-3);
    padding:       var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--border);
    cursor:        pointer;
    transition:    var(--transition-fast);
    position:      relative;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:active     { background: var(--bg-input); }
  .notif-item.unread     { background: rgba(var(--accent-rgb), 0.03); }
  .notif-icon {
    width:           40px;
    height:          40px;
    border-radius:   var(--radius-lg);
    display:         flex;
    align-items:     center;
    justify-content: center;
    flex-shrink:     0;
  }
  .notif-icon svg {
    width: 18px; height: 18px;
    stroke: currentColor; fill: none;
    stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .notif-body { flex: 1; min-width: 0; }
  .notif-title {
    font-size:   var(--text-sm);
    font-weight: var(--weight-semi);
    color:       var(--text-primary);
  }
  .notif-message {
    font-size:  var(--text-xs);
    color:      var(--text-secondary);
    margin-top: 2px;
    line-height: 1.5;
  }
  .notif-time {
    font-size:  var(--text-xs);
    color:      var(--text-muted);
    margin-top: var(--space-1);
  }
  .notif-dot {
    width:         8px;
    height:        8px;
    border-radius: 50%;
    background:    var(--accent);
    flex-shrink:   0;
    margin-top:    var(--space-1);
  }

  /* Recurring */
  .recurring-list {
    display: flex; flex-direction: column; gap: var(--space-3);
  }
  .recurring-item {
    display:       flex;
    align-items:   center;
    gap:           var(--space-3);
    padding:       var(--space-4);
    background:    var(--bg-input);
    border-radius: var(--radius-xl);
    border:        1px solid var(--border);
    transition:    var(--transition-fast);
  }
  .recurring-item.paused { opacity: 0.6; }
  .recurring-icon {
    width: 40px; height: 40px;
    border-radius: var(--radius-lg);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .recurring-icon svg {
    width: 18px; height: 18px;
    stroke: currentColor; fill: none;
    stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .recurring-info { flex: 1; min-width: 0; }
  .recurring-name {
    font-size: var(--text-sm); font-weight: var(--weight-semi);
    color: var(--text-primary);
  }
  .recurring-meta {
    font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;
  }
  .recurring-right {
    display: flex; flex-direction: column;
    align-items: flex-end; gap: var(--space-1);
    flex-shrink: 0;
  }
  .recurring-amount {
    font-size: var(--text-sm); font-weight: var(--weight-bold);
    font-variant-numeric: tabular-nums;
  }
  .recurring-actions { display: flex; gap: var(--space-1); }
  .recurring-actions svg {
    width: 14px; height: 14px;
    stroke: currentColor; fill: none;
    stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round;
  }

  /* Analytics Extras */
  .analytics-duo {
    display: flex; flex-direction: column; gap: var(--space-4);
  }
  .cat-legend-sm {
    margin-top: var(--space-3);
    display: flex; flex-direction: column; gap: var(--space-2);
  }
  .analytics-actions {
    display: flex; gap: var(--space-3);
  }
  .analytics-actions svg {
    width: 16px; height: 16px;
    stroke: currentColor; fill: none;
    stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .payment-breakdown {
    display: flex; flex-direction: column; gap: var(--space-3);
  }
  .payment-method-row {
    display: flex; align-items: center; gap: var(--space-3);
  }
  .payment-method-icon {
    width: 36px; height: 36px;
    border-radius: var(--radius-lg);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .payment-method-icon svg {
    width: 16px; height: 16px;
    stroke: currentColor; fill: none;
    stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .payment-method-info { flex: 1; }
  .payment-method-name {
    font-size: var(--text-sm); font-weight: var(--weight-medium);
    color: var(--text-primary);
  }
  .payment-method-count {
    font-size: var(--text-xs); color: var(--text-muted);
  }
  .payment-method-amount {
    font-size: var(--text-sm); font-weight: var(--weight-bold);
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  /* Backup Preview */
  .backup-preview { display: flex; flex-direction: column; gap: var(--space-4); }
  .backup-preview-header {
    display: flex; align-items: center; gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-input);
    border-radius: var(--radius-xl);
  }
  .backup-preview-icon {
    width: 44px; height: 44px;
    border-radius: var(--radius-xl);
    background: rgba(var(--accent-rgb),0.1);
    color: var(--accent);
    display: flex; align-items: center; justify-content: center;
  }
  .backup-preview-icon svg {
    width: 22px; height: 22px;
    stroke: currentColor; fill: none; stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .backup-preview-title {
    font-size: var(--text-sm); font-weight: var(--weight-semi);
    color: var(--text-primary);
  }
  .backup-preview-sub {
    font-size: var(--text-xs); color: var(--text-muted);
  }
  .backup-stats {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: var(--space-3);
  }
  .backup-stat {
    background: var(--bg-input);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    text-align: center;
  }
  .backup-stat-value {
    font-size: var(--text-xl); font-weight: var(--weight-bold);
    color: var(--text-primary);
  }
  .backup-stat-label {
    font-size: var(--text-xs); color: var(--text-muted);
    margin-top: 2px;
  }
  .backup-warning {
    display: flex; align-items: center; gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: rgba(var(--warning-rgb),0.1);
    border: 1px solid rgba(var(--warning-rgb),0.2);
    border-radius: var(--radius-lg);
    font-size: var(--text-xs); color: var(--warning);
  }
  .backup-warning svg {
    width: 14px; height: 14px;
    stroke: currentColor; fill: none; stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0;
  }
  .restore-options { display: flex; flex-direction: column; gap: var(--space-3); }
`;

document.head.appendChild(extraStyles);

window.RecurringManager  = RecurringManager;
window.notificationsPage = notificationsPage;

// ── Auto check recurring on load ───────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (store.state.user) {
      RecurringManager.checkAndAdd();
    }
  }, 3000);
});