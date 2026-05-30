// ─────────────────────────────────────────
//  Modal Manager
//  CoupleSpend App
// ─────────────────────────────────────────

const Modal = (() => {
  
  // ── Active modals stack ─────────────────
  let stack = [];
  
  // ── Open a modal ────────────────────────
  function open(id) {
    const overlay = document.getElementById(id);
    if (!overlay) {
      console.warn(`Modal "${id}" not found`);
      return;
    }
    
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    
    // Push to stack
    stack.push(id);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Click overlay to close
    overlay.addEventListener('click', onOverlayClick);
    
    // Escape key to close
    document.addEventListener('keydown', onEscKey);
  }
  
  // ── Close a modal ────────────────────────
  function close(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    
    // Remove from stack
    stack = stack.filter(s => s !== id);
    
    // Remove events
    overlay.removeEventListener('click', onOverlayClick);
    
    // Restore scroll if no more modals
    if (stack.length === 0) {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEscKey);
    }
  }
  
  // ── Close top modal ──────────────────────
  function closeLast() {
    if (stack.length > 0) {
      close(stack[stack.length - 1]);
    }
  }
  
  // ── Close all modals ─────────────────────
  function closeAll() {
    [...stack].forEach(id => close(id));
  }
  
  // ── Overlay click handler ────────────────
  function onOverlayClick(e) {
    // Only close if clicking the overlay itself
    if (e.target === e.currentTarget) {
      closeLast();
    }
  }
  
  // ── Escape key handler ───────────────────
  function onEscKey(e) {
    if (e.key === 'Escape') closeLast();
  }
  
  // ── Create dynamic modal ─────────────────
  function create({
    id,
    title = '',
    body = '',
    position = 'bottom', // 'bottom' | 'center'
    showHandle = true,
    onClose = null
  }) {
    // Remove existing if any
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = `modal-overlay hidden ${position === 'center' ? 'center' : ''}`;
    
    overlay.innerHTML = `
      <div class="modal modal-${position}">
        ${showHandle && position === 'bottom'
          ? `<div class="modal-handle"></div>`
          : ''
        }
        ${title
          ? `<div class="modal-header">
               <h2 class="modal-title">${title}</h2>
               <button
                 class="btn btn-icon btn-ghost"
                 onclick="Modal.close('${id}')"
                 aria-label="Close"
               >
                 <svg viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor"
                   stroke-width="2"
                   stroke-linecap="round"
                   stroke-linejoin="round"
                 >
                   <line x1="18" y1="6"  x2="6"  y2="18"/>
                   <line x1="6"  y1="6"  x2="18" y2="18"/>
                 </svg>
               </button>
             </div>`
          : ''
        }
        <div class="modal-body">${body}</div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    if (onClose) {
      overlay.addEventListener('modalClose', onClose);
    }
    
    return overlay;
  }
  
  // ── Confirm Dialog ────────────────────────
  function confirm({
    title = 'Are you sure?',
    message = '',
    okText = 'Confirm',
    okClass = 'btn-danger',
    onOk = () => {},
    onCancel = () => {}
  }) {
    return new Promise((resolve) => {
      const id = 'modal-confirm-dynamic';
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      
      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.className = 'modal-overlay center';
      
      overlay.innerHTML = `
        <div class="modal modal-center">
          <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
          </div>
          <div class="modal-body">
            ${message
              ? `<p class="confirm-message">${message}</p>`
              : ''
            }
            <div class="confirm-actions">
              <button
                class="btn btn-secondary"
                id="${id}-cancel"
              >Cancel</button>
              <button
                class="btn ${okClass}"
                id="${id}-ok"
              >${okText}</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      function cleanup(result) {
        overlay.remove();
        document.body.style.overflow = '';
        resolve(result);
      }
      
      document.getElementById(`${id}-ok`).addEventListener('click', () => {
        cleanup(true);
        onOk();
      });
      
      document.getElementById(`${id}-cancel`).addEventListener('click', () => {
        cleanup(false);
        onCancel();
      });
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(false);
      });
    });
  }
  
  // ── Bottom Sheet ──────────────────────────
  function sheet({
    id,
    title = '',
    items = []
    // items: [{ label, icon, action, danger }]
  }) {
    const sheetId = id || `sheet-${Date.now()}`;
    
    const itemsHTML = items.map(item => `
      <button
        class="sheet-item ${item.danger ? 'sheet-item-danger' : ''}"
        onclick="
          Modal.close('${sheetId}');
          (${item.action.toString()})();
        "
      >
        ${item.icon
          ? `<span class="sheet-item-icon">${item.icon}</span>`
          : ''
        }
        <span class="sheet-item-label">${item.label}</span>
      </button>
    `).join('');
    
    const overlay = create({
      id: sheetId,
      title,
      body: `<div class="sheet-items">${itemsHTML}</div>`,
      position: 'bottom'
    });
    
    open(sheetId);
    return sheetId;
  }
  
  // ── Expose ────────────────────────────────
  return { open, close, closeLast, closeAll, create, confirm, sheet };
  
})();

// ── Add Transaction modal helpers ──────────
function openAddTransaction(txData = null) {
  // Reset form
  resetTransactionForm();
  
  // If editing, populate form
  if (txData) {
    populateTransactionForm(txData);
    document.getElementById('modal-add-title').textContent = 'Edit Transaction';
    document.getElementById('save-transaction-btn')
      .querySelector('.btn-text').textContent = 'Save Changes';
    // Store edit id
    document.getElementById('modal-add-inner')
      .setAttribute('data-edit-id', txData.id);
  } else {
    document.getElementById('modal-add-title').textContent = 'Add Transaction';
    document.getElementById('save-transaction-btn')
      .querySelector('.btn-text').textContent = 'Save Transaction';
    document.getElementById('modal-add-inner')
      .removeAttribute('data-edit-id');
  }
  
  Modal.open('modal-add-transaction');
}

function closeAddTransaction() {
  Modal.close('modal-add-transaction');
  resetTransactionForm();
}

// ── Confirm dialog helpers ──────────────────
let confirmResolve = null;

function showConfirm(title, message, okText = 'Delete') {
  return Modal.confirm({ title, message, okText });
}

function closeConfirm(result) {
  Modal.close('modal-confirm');
  if (confirmResolve) {
    confirmResolve(result);
    confirmResolve = null;
  }
}

window.Modal = Modal;
window.openAddTransaction = openAddTransaction;
window.closeAddTransaction = closeAddTransaction;
window.showConfirm = showConfirm;
window.closeConfirm = closeConfirm;