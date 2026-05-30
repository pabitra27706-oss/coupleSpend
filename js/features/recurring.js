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

    if (!uid || !recurring || recurring.length === 0) return;

    const toAdd = recurring.filter(r => {
      return r.isActive && r.nextDate && r.nextDate <= today;
    });

    if (toAdd.length === 0) return;

    console.log(`[Recurring] Adding ${toAdd.length} transactions`);

    for (const rec of toAdd) {
      try {
        await addRecurringTransaction(rec, today, uid);
      } catch (err) {
        console.error('[Recurring] Add error:', err);
      }
    }
  }

  // ── Add recurring transaction ──────────────
  async function addRecurringTransaction(rec, date, uid) {
    const month = date.substring(0, 7);

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

    const nextDate = getNextDate(rec.frequency, date);
    await db
      .collection(COLLECTIONS.RECURRING)
      .doc(rec.id)
      .update({ nextDate, lastAdded: date });

    // Show notification safely
    const cat = CATEGORIES.find(c => c.id === rec.category);
    const msg = `${rec.description || cat?.label || rec.category}: `
      + `${store.getCurrencySymbol()}${rec.amount.toFixed(2)}`;

    if (window.notificationsPage &&
        typeof notificationsPage.showLocalNotification === 'function') {
      notificationsPage.showLocalNotification(
        'Recurring Transaction Added', msg
      );
    } else if (
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification('Recurring Transaction Added', {
          body: msg,
          icon: './assets/icons/icon-192.png'
        });
      } catch (e) {
        console.log('Notification failed:', e);
      }
    }
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
    const nextDate = getNextDate(
      data.frequency,
      data.startDate || today
    );

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
        endDate:       data.endDate || null,
        isActive:      true,
        createdAt:     firebase.firestore.FieldValue.serverTimestamp()
      });

      await store.loadRecurring(uid);
      Toast.show('success', 'Added',
        'Recurring transaction created'
      );

    } catch (err) {
      console.error('Add recurring error:', err);
      Toast.show('error', 'Failed',
        'Could not create recurring transaction'
      );
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

      Toast.show(
        'success',
        isActive ? 'Resumed' : 'Paused',
        `Recurring transaction ${isActive ? 'resumed' : 'paused'}`
      );

    } catch (err) {
      console.error('Toggle recurring error:', err);
      Toast.show('error', 'Failed', 'Could not update recurring');
    }
  }

  // ── Delete recurring ───────────────────────
  async function remove(recurringId) {
    if (!window.Modal) {
      console.error('Modal not loaded');
      return;
    }

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
      Toast.show('success', 'Deleted',
        'Recurring transaction removed'
      );

    } catch (err) {
      console.error('Delete recurring error:', err);
      Toast.show('error', 'Failed',
        'Could not delete recurring transaction'
      );
    }
  }

  // ── Show recurring list modal ──────────────
  function showRecurringList() {
    if (!window.Modal) {
      console.error('Modal not loaded');
      return;
    }

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
          ${recurring.map(rec =>
            buildRecurringItem(rec, symbol)
          ).join('')}
        </div>
        <button
          class="btn btn-primary btn-full mt-4"
          onclick="RecurringManager.showAddForm()"
        >
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
      daily:    'Daily',
      weekly:   'Weekly',
      biweekly: 'Every 2 weeks',
      monthly:  'Monthly',
      yearly:   'Yearly'
    };

    return `
      <div class="recurring-item ${!rec.isActive ? 'paused' : ''}">
        <div class="recurring-icon"
          style="color:${cat?.color};
                 background:${cat?.color}18"
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
          <div class="recurring-amount" style="color: ${
            rec.type === 'income'
              ? 'var(--success)'
              : 'var(--danger)'
          }">
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
    if (!window.Modal) {
      console.error('Modal not loaded');
      return;
    }

    const symbol = store.getCurrencySymbol();

    const body = `
      <div class="input-group">
        <label class="input-label">Category</label>
        <select class="input" id="rec-category">
          ${CATEGORIES
            .filter(c => c.id !== 'income')
            .map(cat => `
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
    const category = document.getElementById('rec-category')?.value;
    const type     = document.getElementById('rec-type')?.value;
    const amount   = parseFloat(
      document.getElementById('rec-amount')?.value
    );
    const description = document.getElementById(
      'rec-description'
    )?.value.trim();
    const frequency = document.getElementById('rec-frequency')?.value;
    const startDate = document.getElementById('rec-start')?.value;
    const payment   = document.getElementById('rec-payment')?.value;

    if (!amount || amount <= 0) {
      Toast.show('error', 'Invalid', 'Please enter a valid amount');
      return;
    }

    if (window.Modal) Modal.close('modal-add-recurring');

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

// ── CSS for notifications & recurring ──────
const recurringStyles = document.createElement('style');
recurringStyles.textContent = `
  .recurring-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .recurring-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-input);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    transition: var(--transition-fast);
  }
  .recurring-item.paused { opacity: 0.6; }
  .recurring-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .recurring-icon svg {
    width: 18px; height: 18px;
    stroke: currentColor; fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .recurring-info { flex: 1; min-width: 0; }
  .recurring-name {
    font-size: var(--text-sm);
    font-weight: var(--weight-semi);
    color: var(--text-primary);
  }
  .recurring-meta {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: 2px;
  }
  .recurring-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-1);
    flex-shrink: 0;
  }
  .recurring-amount {
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    font-variant-numeric: tabular-nums;
  }
  .recurring-actions {
    display: flex;
    gap: var(--space-1);
  }
  .recurring-actions svg {
    width: 14px; height: 14px;
    stroke: currentColor; fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;
document.head.appendChild(recurringStyles);

// ── Window exports ─────────────────────────
window.RecurringManager = RecurringManager;

// ── Auto check on load ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (store && store.state && store.state.user) {
      RecurringManager.checkAndAdd();
    }
  }, 3000);
});