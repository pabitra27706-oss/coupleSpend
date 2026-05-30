// ─────────────────────────────────────────
//  Toast Notification System
//  CoupleSpend App
// ─────────────────────────────────────────

const Toast = (() => {

  // ── SVG Icons ──────────────────────────
  const ICONS = {
    success: `<polyline points="20 6 9 17 4 12"/>`,
    error:   `<circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>`,
    warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94
                a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9"  x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>`,
    info:    `<circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8"  x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>`
  };

  // ── Queue ───────────────────────────────
  let queue    = [];
  let isShowing = false;

  // ── Get or create container ─────────────
  function getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id        = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  // ── Show toast ──────────────────────────
  function show(type = 'info', title = '', message = '', duration = 3500) {
    const container = getContainer();

    // Limit to 3 toasts at a time
    const existing = container.querySelectorAll('.toast');
    if (existing.length >= 3) {
      existing[0].remove();
    }

    const icon = ICONS[type] || ICONS.info;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-icon">
        <svg viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >${icon}</svg>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message
          ? `<div class="toast-message">${message}</div>`
          : ''
        }
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <svg viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6"  y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto remove
    const timer = setTimeout(() => {
      dismiss(toast);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      dismiss(toast);
    });

    return toast;
  }

  // ── Dismiss ─────────────────────────────
  function dismiss(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('exit');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }

  // ── Dismiss all ─────────────────────────
  function dismissAll() {
    const container = getContainer();
    container.querySelectorAll('.toast').forEach(t => dismiss(t));
  }

  // ── Shorthand methods ───────────────────
  function success(title, message, duration) {
    return show('success', title, message, duration);
  }
  function error(title, message, duration) {
    return show('error', title, message, duration);
  }
  function warning(title, message, duration) {
    return show('warning', title, message, duration);
  }
  function info(title, message, duration) {
    return show('info', title, message, duration);
  }

  // ── Expose ──────────────────────────────
  return { show, dismiss, dismissAll, success, error, warning, info };

})();

// ── Global shorthand ───────────────────────
window.Toast    = Toast;
window.showToast = (type, title, msg, dur) => Toast.show(type, title, msg, dur);