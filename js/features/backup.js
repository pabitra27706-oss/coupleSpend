// ─────────────────────────────────────────
//  Backup & Restore Manager
//  CoupleSpend App
// ─────────────────────────────────────────

const BackupManager = (() => {

  // ── Create backup ─────────────────────────
  async function createBackup() {
    Toast.info('Creating', 'Preparing backup...');

    try {
      const uid = store.state.user?.uid;

      // Fetch ALL transactions (not just current month)
      const txSnap = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', uid)
        .orderBy('date', 'desc')
        .get();

      const bgSnap = await db
        .collection(COLLECTIONS.BUDGETS)
        .where('userId', '==', uid)
        .get();

      const recSnap = await db
        .collection(COLLECTIONS.RECURRING)
        .where('userId', '==', uid)
        .get();

      const transactions = txSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        // Convert timestamps to strings
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || null
      }));

      const budgets = bgSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null
      }));

      const recurring = recSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null
      }));

      const backup = {
        version:      APP_CONFIG.version,
        appName:      APP_CONFIG.name,
        exportedAt:   new Date().toISOString(),
        userId:       uid,
        profile: {
          name:        store.state.profile?.name,
          partnerName: store.state.profile?.partnerName,
          currency:    store.state.profile?.currency,
          theme:       store.state.profile?.theme
        },
        data: {
          transactions,
          budgets,
          recurring
        },
        stats: {
          totalTransactions: transactions.length,
          totalBudgets:      budgets.length,
          totalRecurring:    recurring.length
        }
      };

      const json     = JSON.stringify(backup, null, 2);
      const date     = new Date().toISOString().split('T')[0];
      const fileName = `CoupleSpend_Backup_${date}.json`;

      downloadJSON(json, fileName);

      Toast.success(
        'Backup created',
        `${transactions.length} transactions saved to ${fileName}`
      );

    } catch (err) {
      console.error('Backup error:', err);
      Toast.error('Failed', 'Could not create backup');
    }
  }

  // ── Restore backup ────────────────────────
  function restoreBackup() {
    // Create file input
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate backup format
        if (!data.appName || data.appName !== APP_CONFIG.name) {
          Toast.error('Invalid file', 'This is not a valid CoupleSpend backup');
          return;
        }

        // Show restore preview
        showRestorePreview(data);

      } catch (err) {
        console.error('Parse backup error:', err);
        Toast.error('Invalid file', 'Could not read backup file');
      }
    };

    input.click();
  }

  // ── Show restore preview ───────────────────
  function showRestorePreview(backupData) {
    const { stats, exportedAt, profile } = backupData;
    const exportDate = new Date(exportedAt).toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'long',
      day:   'numeric'
    });

    const body = `
      <div class="backup-preview">

        <div class="backup-preview-header">
          <div class="backup-preview-icon">
            ${Icons.backup}
          </div>
          <div>
            <div class="backup-preview-title">Backup from ${exportDate}</div>
            <div class="backup-preview-sub">
              ${profile?.name || 'Unknown user'}
            </div>
          </div>
        </div>

        <div class="backup-stats">
          <div class="backup-stat">
            <div class="backup-stat-value">${stats?.totalTransactions || 0}</div>
            <div class="backup-stat-label">Transactions</div>
          </div>
          <div class="backup-stat">
            <div class="backup-stat-value">${stats?.totalBudgets || 0}</div>
            <div class="backup-stat-label">Budgets</div>
          </div>
          <div class="backup-stat">
            <div class="backup-stat-value">${stats?.totalRecurring || 0}</div>
            <div class="backup-stat-label">Recurring</div>
          </div>
        </div>

        <div class="backup-warning">
          ${Icons.warning}
          <span>Existing data will be merged with backup data</span>
        </div>

        <div class="restore-options">
          <button
            class="btn btn-secondary btn-full"
            onclick="BackupManager.performRestore(
              ${JSON.stringify(backupData).replace(/</g, '\\u003c')
                .replace(/>/g, '\\u003e')
                .replace(/&/g, '\\u0026')},
              'merge'
            ); Modal.close('modal-restore-preview')"
          >
            Merge with existing data
          </button>
          <button
            class="btn btn-danger btn-full"
            onclick="BackupManager.performRestore(
              ${JSON.stringify(backupData).replace(/</g, '\\u003c')
                .replace(/>/g, '\\u003e')
                .replace(/&/g, '\\u0026')},
              'replace'
            ); Modal.close('modal-restore-preview')"
          >
            Replace all data
          </button>
        </div>

      </div>
    `;

    Modal.create({
      id:       'modal-restore-preview',
      title:    'Restore Backup',
      body,
      position: 'bottom'
    });
    Modal.open('modal-restore-preview');
  }

  // ── Perform restore ────────────────────────
  async function performRestore(backupData, mode = 'merge') {
    const confirmed = await Modal.confirm({
      title:   mode === 'replace'
        ? 'Replace all data?'
        : 'Merge backup data?',
      message: mode === 'replace'
        ? 'This will DELETE all current transactions and replace with backup data.'
        : 'Backup transactions will be added to your existing data.',
      okText:  mode === 'replace' ? 'Replace' : 'Merge',
      okClass: mode === 'replace' ? 'btn-danger' : 'btn-primary'
    });

    if (!confirmed) return;

    Toast.info('Restoring', 'Importing your data...');

    try {
      const uid      = store.state.user?.uid;
      const { data } = backupData;

      // If replace mode: delete existing
      if (mode === 'replace') {
        const existing = await db
          .collection(COLLECTIONS.TRANSACTIONS)
          .where('userId', '==', uid)
          .get();

        const batch = db.batch();
        existing.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      // Import transactions in batches of 400
      const txns     = data.transactions || [];
      const batchSize = 400;

      for (let i = 0; i < txns.length; i += batchSize) {
        const chunk = txns.slice(i, i + batchSize);
        const batch = db.batch();

        chunk.forEach(tx => {
          const { id, createdAt, updatedAt, ...txData } = tx;
          const ref = mode === 'merge' && id
            ? db.collection(COLLECTIONS.TRANSACTIONS).doc(id)
            : db.collection(COLLECTIONS.TRANSACTIONS).doc();

          batch.set(ref, {
            ...txData,
            userId:    uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: mode === 'merge' });
        });

        await batch.commit();
      }

      // Import budgets
      const budgets = data.budgets || [];
      if (budgets.length > 0) {
        const bBatch = db.batch();
        budgets.forEach(b => {
          const { id, createdAt, ...bData } = b;
          const ref = mode === 'merge' && id
            ? db.collection(COLLECTIONS.BUDGETS).doc(id)
            : db.collection(COLLECTIONS.BUDGETS).doc();

          bBatch.set(ref, {
            ...bData,
            userId:    uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: mode === 'merge' });
        });
        await bBatch.commit();
      }

      // Reload store data
      const currentMonth = store.state.currentMonth;
      await store.loadTransactions(uid, currentMonth);
      await store.loadBudgets(uid, currentMonth);

      Toast.success(
        'Restored',
        `${txns.length} transactions imported successfully`
      );

    } catch (err) {
      console.error('Restore error:', err);
      Toast.error('Failed', 'Could not restore backup data');
    }
  }

  // ── Download JSON helper ───────────────────
  function downloadJSON(json, fileName) {
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ── Expose ────────────────────────────────
  return {
    createBackup,
    restoreBackup,
    showRestorePreview,
    performRestore
  };

})();

window.BackupManager = BackupManager;