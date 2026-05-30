// ─────────────────────────────────────────
//  SPA Router
//  CoupleSpend App
// ─────────────────────────────────────────

const router = (() => {
  
  // ── Route Config ───────────────────────
  const routes = {
    dashboard: {
      title: 'Dashboard',
      subtitle: '',
      showBack: false,
      init: () => window.dashboardPage?.init()
    },
    transactions: {
      title: 'Transactions',
      subtitle: '',
      showBack: false,
      init: () => window.transactionsPage?.init()
    },
    compare: {
      title: 'Compare',
      subtitle: 'You vs Partner',
      showBack: false,
      init: () => window.comparePage?.init()
    },
    analytics: {
      title: 'Analytics',
      subtitle: '',
      showBack: false,
      init: () => window.analyticsPage?.init()
    },
    budget: {
      title: 'Budget',
      subtitle: '',
      showBack: true,
      init: () => window.budgetPage?.init()
    },
    notifications: {
      title: 'Notifications',
      subtitle: '',
      showBack: true,
      init: () => window.notificationsPage?.init()
    },
    settings: {
      title: 'Settings',
      subtitle: '',
      showBack: true,
      init: () => window.settingsPage?.init()
    }
  };
  
  // ── Bottom nav pages ───────────────────
  const bottomNavPages = [
    'dashboard',
    'transactions',
    'compare',
    'analytics'
  ];
  
  // ── State ──────────────────────────────
  let currentPage = 'dashboard';
  let previousPage = null;
  let history = [];
  
  // ── Initialize ─────────────────────────
  function init() {
    // Get page from URL hash
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const page = routes[hash] ? hash : 'dashboard';
    
    navigate(page, true);
    
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const newPage = window.location.hash.replace('#', '');
      if (routes[newPage] && newPage !== currentPage) {
        navigate(newPage, true);
      }
    });
  }
  
  // ── Navigate ────────────────────────────
  function navigate(page, fromHash = false) {
    if (!routes[page]) {
      console.warn(`Route "${page}" not found`);
      return;
    }
    
    // Hide current page
    const currentEl = document.getElementById(`page-${currentPage}`);
    if (currentEl) currentEl.classList.remove('active');
    
    // Track history
    if (currentPage !== page) {
      history.push(currentPage);
      previousPage = currentPage;
    }
    
    // Update current page
    currentPage = page;
    
    // Show new page
    const newEl = document.getElementById(`page-${page}`);
    if (newEl) {
      newEl.classList.add('active');
      newEl.classList.add('page-enter');
      setTimeout(() => newEl.classList.remove('page-enter'), 300);
    }
    
    // Update header
    updateHeader(page);
    
    // Update bottom nav
    updateBottomNav(page);
    
    // Update URL hash (avoid re-trigger)
    if (!fromHash) {
      window.location.hash = page;
    }
    
    // Init page content
    const route = routes[page];
    if (route.init) {
      route.init();
    }
    
    // Scroll to top
    const main = document.getElementById('app-main');
    if (main) main.scrollTop = 0;
  }
  
  // ── Go back ────────────────────────────
  function back() {
    if (history.length > 0) {
      const prev = history.pop();
      navigate(prev);
    } else {
      navigate('dashboard');
    }
  }
  
  // ── Update Header ──────────────────────
  function updateHeader(page) {
    const route = routes[page];
    const title = document.getElementById('header-title');
    const subtitle = document.getElementById('header-subtitle');
    const backBtn = document.getElementById('header-back');
    
    if (title) title.textContent = route.title;
    if (subtitle) subtitle.textContent = route.subtitle || '';
    
    // Show/hide back button
    if (backBtn) {
      if (route.showBack) {
        backBtn.classList.remove('hidden');
      } else {
        backBtn.classList.add('hidden');
      }
    }
  }
  
  // ── Update Bottom Nav ──────────────────
  function updateBottomNav(page) {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      const itemPage = item.getAttribute('data-page');
      item.classList.toggle('active', itemPage === page);
    });
    
    // Hide bottom nav on detail pages
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      if (bottomNavPages.includes(page)) {
        bottomNav.classList.remove('hidden');
      } else {
        bottomNav.classList.add('hidden');
      }
    }
  }
  
  // ── Get current page ───────────────────
  function getCurrent() {
    return currentPage;
  }
  
  // ── Expose public API ──────────────────
  return {
    init,
    navigate,
    back,
    getCurrent
  };
  
})();

window.router = router;