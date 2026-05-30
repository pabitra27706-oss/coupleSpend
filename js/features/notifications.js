// ─────────────────────────────────────────
//  Notifications Page & Manager
//  CoupleSpend App
// ─────────────────────────────────────────

const notificationsPage = (() => {
  
  // ── Initialize ────────────────────────────
  function init() {
    render();
    markAllRead();
  }
  
  // ── Render ────────────────────────────────
  function render() {
    const content = document.getElementById('notifications-content');
    if (!content) return;
    
    const notifs = store.state.notifications;
    
    if (notifs.length === 0) {
      content.innerHTML = buildEmptyState(
        'notifications',
        'No notifications',
        'You\'re all caught up! Notifications will appear here.',
        '',
        ''
      );
      return;
    }
    
    content.innerHTML = `
      <div class="notif-header">
        <span class="section-title">
          ${notifs.length} unread
        </span>
        <button
          class="section-action"
          onclick="notificationsPage.clearAll()"
        >
          Clear all
        </button>
      </div>

      <div class="notif-list card card-flush">
        ${notifs.map(n => buildNotifItem(n)).join('')}
      </div>
    `;
  }
  
  // ── Build notification item ────────────────
  function buildNotifItem(notif) {
    const icons = {
      budget_alert: { icon: Icons.budget, color: 'var(--warning)' },
      budget_exceeded: { icon: Icons.warning, color: 'var(--danger)' },
      partner_transaction: { icon: Icons.users, color: 'var(--her-color)' },
      partner_linked: { icon: Icons.link, color: 'var(--success)' },
      weekly_report: { icon: Icons.analytics, color: 'var(--accent)' },
      monthly_report: { icon: Icons.analytics, color: 'var(--accent)' },
      goal_achieved: { icon: Icons.check, color: 'var(--success)' }
    };
    
    const meta = icons[notif.type] || {
      icon: Icons.info,
      color: 'var(--accent)'
    };
    
    const timeAgo = getTimeAgo(notif.createdAt);
    
    return `
      <div
        class="notif-item ${notif.isRead ? 'read' : 'unread'}"
        onclick="notificationsPage.handleTap('${notif.id}', '${notif.type}')"
        data-notif-id="${notif.id}"
      >
        <div class="notif-icon" style="
          color: ${meta.color};
          background: ${meta.color}18
        ">
          ${meta.icon}
        </div>
        <div class="notif-body">
          <div class="notif-title">${notif.title || ''}</div>
          <div class="notif-message">${notif.message || ''}</div>
          <div class="notif-time">${timeAgo}</div>
        </div>
        ${!notif.isRead
          ? `<div class="notif-dot"></div>`
          : ''
        }
      </div>
    `;
  }
  
  // ── Handle tap ────────────────────────────
  async function handleTap(notifId, type) {
    // Mark as read
    try {
      await db
        .collection(COLLECTIONS.NOTIFICATIONS)
        .doc(notifId)
        .update({ isRead: true });
    } catch (err) {
      console.error('Mark read error:', err);
    }
    
    // Navigate based on type
    switch (type) {
      case 'budget_alert':
      case 'budget_exceeded':
        router.navigate('budget');
        break;
      case 'partner_transaction':
        router.navigate('compare');
        break;
      case 'partner_linked':
        router.navigate('settings');
        break;
      case 'weekly_report':
      case 'monthly_report':
        router.navigate('analytics');
        break;
      default:
        break;
    }
  }
  
  // ── Mark all as read ───────────────────────
  async function markAllRead() {
    const unread = store.state.notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    
    try {
      const batch = db.batch();
      unread.forEach(n => {
        const ref = db.collection(COLLECTIONS.NOTIFICATIONS).doc(n.id);
        batch.update(ref, { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  }
  
  // ── Clear all ─────────────────────────────
  async function clearAll() {
    const confirmed = await Modal.confirm({
      title: 'Clear Notifications',
      message: 'Remove all notifications?',
      okText: 'Clear All'
    });
    
    if (!confirmed) return;
    
    try {
      const notifs = store.state.notifications;
      const batch = db.batch();
      
      notifs.forEach(n => {
        const ref = db.collection(COLLECTIONS.NOTIFICATIONS).doc(n.id);
        batch.delete(ref);
      });
      
      await batch.commit();
      store.setState('notifications', []);
      render();
      Toast.success('Cleared', 'All notifications removed');
      
    } catch (err) {
      console.error('Clear notifications error:', err);
      Toast.error('Failed', 'Could not clear notifications');
    }
  }
  
  // ── Time ago helper ────────────────────────
  function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ?
        timestamp.toDate() :
        new Date(timestamp);
      
      const now = new Date();
      const diffMs = now - date;
      const diffM = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMs / 3600000);
      const diffD = Math.floor(diffMs / 86400000);
      
      if (diffM < 1) return 'Just now';
      if (diffM < 60) return `${diffM}m ago`;
      if (diffH < 24) return `${diffH}h ago`;
      if (diffD < 7) return `${diffD}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
    } catch {
      return '';
    }
  }
  
  // ── Request push permission ────────────────
  async function requestPushPermission() {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  // ── Show local notification ────────────────
  function showLocalNotification(title, body, data = {}) {
    if (
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) return;
    
    const notif = new Notification(title, {
      body,
      icon: '/assets/icons/icon-192.png',
      badge: '/assets/icons/icon-72.png',
      data,
      tag: 'couplespend'
    });
    
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  }
  
  // ── Create in-app notification ─────────────
  async function createNotification(toUserId, {
    type = 'info',
    title = '',
    message = '',
    data = {}
  }) {
    try {
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        toUserId,
        fromUserId: store.state.user?.uid || null,
        type,
        title,
        message,
        isRead: false,
        data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error('Create notification error:', err);
    }
  }
  
  // ── Expose ────────────────────────────────
  return {
    init,
    render,
    handleTap,
    markAllRead,
    clearAll,
    requestPushPermission,
    showLocalNotification,
    createNotification
  };
  
})();

window.notificationsPage = notificationsPage;