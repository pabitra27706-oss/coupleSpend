// ─────────────────────────────────────────
//  Transactions Feature
//  CoupleSpend App
// ─────────────────────────────────────────

const Transactions = (() => {

  // ── State ────────────────────────────────
  let editingId    = null;
  let currentTags  = [];
  let currentType  = 'expense';

  // ── Initialize modal form ─────────────────
  function initModal() {
    // Build category grid
    buildCategoryGrid(null);

    // Set default date to today
    const dateInput = document.getElementById('tx-date');
    if (dateInput) dateInput.value = getTodayStr();

    // Set currency symbol
    const sym = document.getElementById('amount-currency-symbol');
    if (sym) sym.textContent = store.getCurrencySymbol();
  }

  // ── Reset form ────────────────────────────
  function resetForm() {
    editingId   = null;
    currentTags = [];
    currentType = 'expense';

    // Reset fields
    const fields = ['tx-amount', 'tx-description'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    // Reset date
    const dateInput = document.getElementById('tx-date');
    if (dateInput) dateInput.value = getTodayStr();

    // Reset payment
    const payment = document.getElementById('tx-payment');
    if (payment) payment.value = 'card';

    // Reset type buttons
    setTransactionType('expense');

    // Reset category
    selectedCategory = null;
    buildCategoryGrid(null);

    // Reset tags
    currentTags = [];
    renderTags();

    // Reset tags input
    const tagsInput = document.getElementById('tx-tags-input');
    if (tagsInput) tagsInput.value = '';

    // Reset edit id on modal
    const modal = document.getElementById('modal-add-inner');
    if (modal) modal.removeAttribute('data-edit-id');
  }

  // ── Set transaction type ──────────────────
  function setType(type) {
    currentType = type;

    const expBtn = document.getElementById('type-expense');
    const incBtn = document.getElementById('type-income');

    if (expBtn) expBtn.classList.toggle('active', type === 'expense');
    if (incBtn) incBtn.classList.toggle('active', type === 'income');
  }

  // ── Populate form for editing ─────────────
  function populateForm(tx) {
    editingId   = tx.id;
    currentTags = tx.tags || [];
    currentType = tx.type || 'expense';

    // Set type
    setType(currentType);

    // Set amount
    const amountEl = document.getElementById('tx-amount');
    if (amountEl) amountEl.value = tx.amount;

    // Set category
    selectedCategory = tx.category;
    buildCategoryGrid(tx.category);

    // Set date
    const dateEl = document.getElementById('tx-date');
    if (dateEl) dateEl.value = tx.date;

    // Set payment
    const payEl = document.getElementById('tx-payment');
    if (payEl) payEl.value = tx.paymentMethod || 'card';

    // Set description
    const descEl = document.getElementById('tx-description');
    if (descEl) descEl.value = tx.description || '';

    // Render tags
    renderTags();
  }

  // ── Handle tag input ──────────────────────
  function handleTagInput(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = document.getElementById('tx-tags-input');
      const val   = input?.value.trim().replace(',', '');

      if (val && !currentTags.includes(val) && currentTags.length < 5) {
        currentTags.push(val);
        renderTags();
      }
      if (input) input.value = '';
    }

    // Backspace to remove last tag
    if (event.key === 'Backspace') {
      const input = document.getElementById('tx-tags-input');
      if (input?.value === '' && currentTags.length > 0) {
        currentTags.pop();
        renderTags();
      }
    }
  }

  // ── Render tags ───────────────────────────
  function renderTags() {
    const display = document.getElementById('tags-display');
    if (!display) return;

    display.innerHTML = currentTags.map((tag, i) => `
      <span class="tag-chip">
        ${tag}
        <button
          type="button"
          class="tag-chip-remove"
          onclick="Transactions.removeTag(${i})"
          aria-label="Remove tag"
        >
          <svg viewBox="0 0 24 24" width="10" height="10"
            fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6"  y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </span>
    `).join('');
  }

  // ── Remove tag ────────────────────────────
  function removeTag(index) {
    currentTags.splice(index, 1);
    renderTags();
  }

  // ── Validate form ─────────────────────────
  function validate() {
    const amount = parseFloat(document.getElementById('tx-amount')?.value);
    const cat    = getSelectedCategory();

    if (!amount || amount <= 0) {
      Toast.error('Invalid amount', 'Please enter a valid amount');
      return false;
    }
    if (!cat) {
      Toast.error('No category', 'Please select a category');
      return false;
    }
    return true;
  }

  // ── Save transaction ──────────────────────
  async function save() {
    if (!validate()) return;

    const uid    = store.state.user?.uid;
    const btn    = document.getElementById('save-transaction-btn');
    const spinner = document.getElementById('save-tx-spinner');
    const btnText = btn?.querySelector('.btn-text');

    // Loading state
    if (btn)      btn.disabled      = true;
    if (spinner)  spinner.classList.remove('hidden');
    if (btnText)  btnText.classList.add('hidden');

    try {
      const amount  = parseFloat(document.getElementById('tx-amount').value);
      const cat     = getSelectedCategory();
      const date    = document.getElementById('tx-date').value;
      const payment = document.getElementById('tx-payment').value;
      const desc    = document.getElementById('tx-description').value.trim();
      const month   = date.substring(0, 7); // "YYYY-MM"

      const txData = {
        userId:        uid,
        amount:        amount,
        category:      cat,
        type:          currentType,
        date:          date,
        month:         month,
        paymentMethod: payment,
        description:   desc,
        tags:          currentTags,
        updatedAt:     firebase.firestore.FieldValue.serverTimestamp()
      };

      if (editingId) {
        // Update existing
        await db
          .collection(COLLECTIONS.TRANSACTIONS)
          .doc(editingId)
          .update(txData);

        Toast.success('Updated', 'Transaction updated successfully');

      } else {
        // Create new
        txData.createdAt = firebase.firestore.FieldValue.serverTimestamp();

        await db
          .collection(COLLECTIONS.TRANSACTIONS)
          .add(txData);

        Toast.success('Saved', 'Transaction added successfully');

        // Check budget alerts after adding
        checkBudgetAlert(uid, cat, month);
      }

      // Notify partner if linked
      if (store.state.profile?.partnerId) {
        await sendPartnerNotification(editingId ? 'updated' : 'added', amount, cat);
      }

      // Close modal & reset
      closeAddTransaction();
      resetForm();

    } catch (err) {
      console.error('Save transaction error:', err);
      Toast.error('Failed', 'Could not save transaction. Try again');
    } finally {
      if (btn)      btn.disabled      = false;
      if (spinner)  spinner.classList.add('hidden');
      if (btnText)  btnText.classList.remove('hidden');
    }
  }

  // ── Delete transaction ────────────────────
  async function remove(txId) {
    const confirmed = await Modal.confirm({
      title:   'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This cannot be undone.',
      okText:  'Delete',
      okClass: 'btn-danger'
    });

    if (!confirmed) return;

    try {
      await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .doc(txId)
        .delete();

      Toast.success('Deleted', 'Transaction removed');

    } catch (err) {
      console.error('Delete transaction error:', err);
      Toast.error('Failed', 'Could not delete transaction');
    }
  }

  // ── Show transaction detail ────────────────
  function showDetail(txId) {
    // Find in store
    const allTxns = [
      ...store.state.transactions,
      ...store.state.partnerTxns
    ];
    const tx = allTxns.find(t => t.id === txId);
    if (!tx) return;

    const cat     = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES.at(-1);
    const symbol  = store.getCurrencySymbol();
    const isExp   = tx.type === 'expense';
    const isOwn   = tx.userId === store.state.user?.uid;
    const profile = store.state.profile;

    const body = `
      <div class="tx-detail">

        <!-- Amount header -->
        <div class="tx-detail-header"
          style="background: ${cat.color}15; border-color: ${cat.color}30"
        >
          <div class="tx-detail-icon"
            style="color: ${cat.color}; background: ${cat.color}20"
          >
            ${Icons[cat.icon] || Icons.other}
          </div>
          <div class="tx-detail-amount ${isExp ? 'expense' : 'income'}">
            ${isExp ? '-' : '+'}${symbol}${Number(tx.amount).toFixed(2)}
          </div>
          <div class="tx-detail-category">${cat.label}</div>
        </div>

        <!-- Details list -->
        <div class="tx-detail-list">
          ${tx.description ? `
            <div class="tx-detail-row">
              <span class="tx-detail-label">Description</span>
              <span class="tx-detail-value">${tx.description}</span>
            </div>` : ''
          }
          <div class="tx-detail-row">
            <span class="tx-detail-label">Date</span>
            <span class="tx-detail-value">${formatDate(tx.date)}</span>
          </div>
          <div class="tx-detail-row">
            <span class="tx-detail-label">Payment</span>
            <span class="tx-detail-value">${capitalise(tx.paymentMethod || 'card')}</span>
          </div>
          <div class="tx-detail-row">
            <span class="tx-detail-label">Type</span>
            <span class="tx-detail-value">${capitalise(tx.type)}</span>
          </div>
          ${tx.tags?.length ? `
            <div class="tx-detail-row">
              <span class="tx-detail-label">Tags</span>
              <div class="tx-detail-tags">
                ${tx.tags.map(t => `
                  <span class="tag-chip">${t}</span>
                `).join('')}
              </div>
            </div>` : ''
          }
          <div class="tx-detail-row">
            <span class="tx-detail-label">Added by</span>
            <span class="tx-detail-value" style="color: ${
              isOwn ? 'var(--you-color)' : 'var(--her-color)'
            }">
              ${isOwn
                ? profile?.name || 'You'
                : store.state.partnerProfile?.name || 'Partner'
              }
            </span>
          </div>
        </div>

        <!-- Actions (only for own transactions) -->
        ${isOwn ? `
          <div class="tx-detail-actions">
            <button
              class="btn btn-secondary"
              onclick="
                Modal.close('modal-tx-detail');
                openAddTransaction(${JSON.stringify(tx).replace(/"/g, '&quot;')})
              "
            >
              ${Icons.edit}
              Edit
            </button>
            <button
              class="btn btn-danger"
              onclick="
                Modal.close('modal-tx-detail');
                Transactions.remove('${tx.id}')
              "
            >
              ${Icons.delete}
              Delete
            </button>
          </div>` : ''
        }
      </div>
    `;

    Modal.create({
      id:       'modal-tx-detail',
      title:    'Transaction Detail',
      body,
      position: 'bottom'
    });
    Modal.open('modal-tx-detail');
  }

  // ── Check budget alert ─────────────────────
  async function checkBudgetAlert(uid, category, month) {
    try {
      const budget = store.state.budgets.find(
        b => b.category === category && b.month === month
      );
      if (!budget) return;

      // Sum spending for this category
      const spent = store.state.transactions
        .filter(t => t.category === category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const pct = (spent / budget.amount) * 100;

      if (pct >= 100) {
        Toast.warning(
          'Budget exceeded',
          `${CATEGORIES.find(c => c.id === category)?.label} budget is over limit`
        );
        await createNotification(uid, {
          type:    'budget_exceeded',
          title:   'Budget Exceeded',
          message: `Your ${CATEGORIES.find(c => c.id === category)?.label} budget is 100% used`,
          data:    { category, budget: budget.amount, spent }
        });

      } else if (pct >= 80) {
        Toast.warning(
          'Budget warning',
          `${CATEGORIES.find(c => c.id === category)?.label} is at ${Math.round(pct)}%`
        );
      }

    } catch (err) {
      console.error('Budget alert check error:', err);
    }
  }

  // ── Send partner notification ──────────────
  async function sendPartnerNotification(action, amount, category) {
    const partnerId = store.state.profile?.partnerId;
    const myName    = store.state.profile?.name || 'Partner';
    const cat       = CATEGORIES.find(c => c.id === category);
    const symbol    = store.getCurrencySymbol();

    if (!partnerId) return;

    try {
      await createNotification(partnerId, {
        type:      'partner_transaction',
        title:     `${myName} ${action} a transaction`,
        message:   `${symbol}${amount.toFixed(2)} in ${cat?.label || category}`,
        fromUserId: store.state.user.uid,
        data:      { action, amount, category }
      });
    } catch (err) {
      console.error('Partner notification error:', err);
    }
  }

  // ── Create notification in Firestore ───────
  async function createNotification(toUserId, data) {
    await db.collection(COLLECTIONS.NOTIFICATIONS).add({
      toUserId,
      fromUserId: store.state.user?.uid || null,
      isRead:     false,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
      ...data
    });
  }

  // ── Get transactions for a date range ──────
  async function fetchRange(uid, startDate, endDate) {
    try {
      const snap = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', uid)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'desc')
        .get();

      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Fetch range error:', err);
      return [];
    }
  }

  // ── Expose ────────────────────────────────
  return {
    initModal,
    resetForm,
    setType,
    populateForm,
    handleTagInput,
    removeTag,
    save,
    remove,
    showDetail,
    fetchRange
  };

})();

// ── Global bindings ────────────────────────
function initTransactionModal() {
  Transactions.initModal();
}
function setTransactionType(type) {
  Transactions.setType(type);
}
function handleTagInput(event) {
  Transactions.handleTagInput(event);
}
function saveTransaction() {
  Transactions.save();
}
function showTransactionDetail(id) {
  Transactions.showDetail(id);
}
function resetTransactionForm() {
  Transactions.resetForm();
}
function populateTransactionForm(tx) {
  Transactions.populateForm(tx);
}

window.Transactions          = Transactions;
window.initTransactionModal  = initTransactionModal;
window.setTransactionType    = setTransactionType;
window.handleTagInput        = handleTagInput;
window.saveTransaction       = saveTransaction;
window.showTransactionDetail = showTransactionDetail;
window.resetTransactionForm  = resetTransactionForm;
window.populateTransactionForm = populateTransactionForm;