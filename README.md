# CoupleSpend - Complete Project Reference Guide

---

## Project Overview
```
App Name:    CoupleSpend
Purpose:     Track & compare spending between couples
Stack:       HTML + CSS + Vanilla JS + Firebase + PWA
Hosting:     GitHub Pages
Database:    Firebase Firestore
Auth:        Firebase Authentication
Charts:      Chart.js CDN
Export:      jsPDF + XLSX + html2canvas CDN
```

---

## Complete File Map

```
couplespend/
│
├── index.html
├── app.html
├── manifest.json
├── sw.js
│
├── css/
│   ├── variables.css
│   ├── global.css
│   ├── components.css
│   ├── login.css
│   ├── dashboard.css
│   ├── transactions.css
│   ├── compare.css
│   ├── analytics.css
│   ├── budget.css
│   └── settings.css
│
├── js/
│   ├── core/
│   │   ├── firebase-config.js
│   │   ├── auth.js
│   │   ├── store.js
│   │   └── router.js
│   │
│   ├── ui/
│   │   ├── toast.js
│   │   ├── modal.js
│   │   ├── theme.js
│   │   ├── components.js
│   │   └── charts.js
│   │
│   ├── features/
│   │   ├── transactions.js
│   │   ├── compare.js
│   │   ├── budget.js
│   │   ├── export.js
│   │   ├── share.js
│   │   ├── backup.js
│   │   ├── notifications.js
│   │   └── recurring.js
│   │
│   └── pages/
│       ├── dashboard.js
│       ├── transactions-page.js
│       ├── analytics-page.js
│       └── settings.js
│
└── assets/
    └── icons/
        ├── icon-72.png
        ├── icon-96.png
        ├── icon-128.png
        ├── icon-192.png
        └── icon-512.png
```

---

## Every File - Name, Role & Contents

---

### ROOT FILES

---

#### `index.html`
```
ROLE:
  Login & Register page
  First page user sees
  Handles auth forms

CONTAINS:
  - Login form (email + password)
  - Register form (name, partner name,
    email, currency, password)
  - Tab switcher (Login / Register)
  - Google Sign In button
  - Forgot password button
  - Password strength indicator
  - Toast container
  - Background decorative circles
  - PWA meta tags
  - Links all CSS files
  - Loads Firebase CDN scripts
  - Loads firebase-config.js
  - Loads auth.js
  - Registers service worker

DEPENDS ON:
  css/variables.css
  css/global.css
  css/login.css
  js/core/firebase-config.js
  js/core/auth.js
  Firebase CDN (compat v9.22.2)

KEY FUNCTIONS CALLED:
  switchTab(tab)
  handleLogin(event)
  handleRegister(event)
  handleGoogleLogin()
  handleForgotPassword()
  togglePassword(inputId, btn)

FIRESTORE WRITES:
  users/{uid} → creates profile doc on register
```

---

#### `app.html`
```
ROLE:
  Main app shell after login
  Contains all page sections
  Navigation structure
  Add transaction modal
  Confirm dialog modal
  Auth guard overlay

CONTAINS:
  - Auth guard loading overlay
  - Top header (title, notif bell,
    avatar)
  - 7 page sections (dashboard,
    transactions, compare, analytics,
    budget, notifications, settings)
  - Bottom navigation bar (5 items)
  - Center add (+) button
  - Add Transaction modal (bottom sheet)
    · Type toggle (expense/income)
    · Amount input with currency symbol
    · Category grid (4 columns)
    · Date & payment method row
    · Description input
    · Tags input with chips
    · Save button
  - Confirm dialog modal
  - Toast container
  - All CDN script tags
  - All JS file script tags
  - Auth state listener (onAuthStateChanged)
  - Calls store.init(), router.init(),
    ThemeManager, initTransactionModal

DEPENDS ON:
  All CSS files
  All JS files
  Firebase CDN
  Chart.js CDN
  jsPDF CDN
  XLSX CDN
  html2canvas CDN

SCRIPT LOAD ORDER (critical):
  1. Firebase CDN scripts
  2. Chart.js CDN
  3. Export library CDNs
  4. js/core/firebase-config.js
  5. js/core/store.js
  6. js/core/router.js
  7. js/ui/toast.js
  8. js/ui/modal.js
  9. js/ui/charts.js
  10. js/ui/components.js
  11. js/ui/theme.js
  12. js/features/transactions.js
  13. js/features/budget.js
  14. js/features/recurring.js
  15. js/features/analytics.js
  16. js/features/compare.js
  17. js/features/notifications.js
  18. js/features/export.js
  19. js/features/share.js
  20. js/features/backup.js
  21. js/pages/dashboard.js
  22. js/pages/settings.js
  23. js/pages/transactions-page.js
  24. js/pages/analytics-page.js
  Inline: auth guard + app init
```

---

#### `manifest.json`
```
ROLE:
  PWA configuration file
  Makes app installable
  Defines app icons, name,
  colors, shortcuts

CONTAINS:
  - name: "CoupleSpend - Finance Tracker"
  - short_name: "CoupleSpend"
  - start_url: /index.html
  - display: standalone
  - background_color: #0f172a
  - theme_color: #6366f1
  - icons array (72,96,128,192,512 px)
  - categories: finance, productivity
  - shortcuts:
    · Add Transaction → app.html#add
    · Dashboard → app.html#dashboard

DEPENDS ON:
  assets/icons/ (all icon sizes)

LINKED IN:
  index.html <link rel="manifest">
  app.html   <link rel="manifest">
```

---

#### `sw.js`
```
ROLE:
  Service Worker for PWA
  Offline support
  Asset caching
  Push notification handling
  Background sync

CONTAINS:
  CACHE NAMES:
    couplespend-static-v1
    couplespend-dynamic-v1

  STATIC ASSETS LIST:
    All HTML, CSS, JS, icon files
    listed for precaching on install

  EVENT LISTENERS:
    install  → precache static assets
    activate → clean old caches
    fetch    → handle network requests
    push     → show push notifications
    notificationclick → open app
    sync     → background sync
    message  → SKIP_WAITING, CACHE_URLS

  FETCH STRATEGIES:
    Cache First    → JS, CSS, images, CDN
    Network First  → HTML pages
    Stale While
    Revalidate     → everything else

  SKIPS (always network):
    firestore.googleapis.com
    firebase.googleapis.com
    firebaseapp.com
    googleapis.com
    chrome-extension://

  PUSH NOTIFICATION:
    Shows notification with icon,
    badge, vibration pattern

  FUNCTIONS:
    handleFetch(request)
    cacheFirst(request)
    networkFirst(request)
    staleWhileRevalidate(request)
    isStaticAsset(url)
    syncOfflineTransactions()
    getOfflineQueue()

REGISTERED IN:
  index.html (on load)
  app.html   (after auth)
```

---

### CSS FILES

---

#### `css/variables.css`
```
ROLE:
  CSS custom properties (variables)
  Theme system foundation
  All color, spacing, typography
  border radius, z-index definitions

CONTAINS:
  :root DEFAULT VARS:
    --bg-base, --bg-card, --bg-input
    --text-primary, --text-secondary,
    --text-muted
    --border
    --accent, --accent-hover
    --you-color, --her-color
    --success, --warning, --danger
    --shadow
    --font-base, --font-mono
    --text-xs through --text-3xl
    --weight-normal through --weight-bold
    --space-1 through --space-12
    --radius-sm through --radius-full
    --transition-fast/base/slow
    --z-base through --z-top
    --nav-height: 64px
    --bottom-nav-h: 68px
    --max-width: 480px

  RGB VARIANTS:
    --accent-rgb, --you-rgb, --her-rgb
    --success-rgb, --warning-rgb,
    --danger-rgb

  DATA ATTRIBUTE SELECTORS:
    [data-accent="indigo/violet/pink/
    cyan/emerald/rose/amber"]
    → changes --accent color

    [data-you="indigo/blue/violet/
    cyan/emerald"]
    → changes --you-color

    [data-her="pink/rose/orange/
    amber/red"]
    → changes --her-color

LOADED FIRST IN:
  index.html, app.html
```

---

#### `css/global.css`
```
ROLE:
  Global reset and base styles
  Reusable utility classes
  Button, card, input, badge styles
  Animations & keyframes
  Scrollbar, selection styles

CONTAINS:
  GOOGLE FONTS IMPORT:
    Inter (400,500,600,700)

  RESET:
    *, html, body, img

  SCROLLBAR: webkit custom

  REUSABLE COMPONENTS:
    .btn (+ variants: primary, secondary,
      ghost, danger, full, sm, lg, icon)
    .card, .card-sm
    .input, .input-group, .input-label,
    .input-error
    .badge (+ accent, success, warning,
      danger variants)
    .divider, .divider-text
    .skeleton (loading animation)
    .progress-bar, .progress-fill
    .toggle (checkbox toggle switch)
    .spinner (loading spinner)

  UTILITY CLASSES:
    text-primary/secondary/muted/
    accent/success/warning/danger/
    you/her
    text-xs/sm/base/lg/xl/2xl
    font-medium/semi/bold
    flex, flex-col, items-center,
    justify-between/center
    gap-1/2/3/4, flex-1
    w-full, h-full
    p-4/5, mt-1/2/4/6, mb-2/4
    hidden, visible, truncate,
    overflow-hidden
    rounded-full/lg, text-center/right

  ANIMATIONS:
    @keyframes fadeIn, slideUp,
    slideDown, scaleIn, spin,
    countUp, skeleton-pulse

  SVG ICON BASE:
    .icon, .icon-sm/md/lg/xl/2xl

  RESPONSIVE:
    640px, 768px breakpoints

DEPENDS ON:
  css/variables.css (must load first)
```

---

#### `css/components.css`
```
ROLE:
  App shell component styles
  Shared between all pages
  Navigation, header, modals,
  transaction items, empty states

CONTAINS:
  AUTH GUARD:
    .auth-guard overlay
    .auth-guard-inner

  APP LAYOUT:
    .app-wrapper (flex column)
    .app-header (sticky top, 64px)
    .app-header-inner
    .header-left, .header-right
    .header-title, .header-subtitle
    .header-avatar, .avatar (sm/md/lg)
    .notif-badge (red dot counter)

  PAGES:
    .app-main (scrollable content area)
    .page (hidden by default)
    .page.active (visible + animation)
    .page-content (padded flex column)
    .page-skeleton (loading skeleton)

  BOTTOM NAV:
    .bottom-nav (fixed, 68px)
    .nav-item (flex, 5 items)
    .nav-item.active
    .nav-icon, .nav-label
    .nav-add (center + button)
    .nav-add-icon (accent circle)

  MODAL SYSTEM:
    .modal-overlay (fixed fullscreen)
    .modal (content box)
    .modal-bottom (slides from bottom)
    .modal-center (centered dialog)
    .modal-handle (drag indicator)
    .modal-header, .modal-title
    .modal-body

  CONFIRM DIALOG:
    .confirm-message
    .confirm-actions

  ADD TRANSACTION MODAL:
    .type-toggle (expense/income)
    .type-btn, .type-btn.active
    .amount-input-wrap
    .amount-currency, .amount-input
    .category-grid (4-col grid)
    .category-item, .category-item.selected
    .category-icon, .category-label
    .tags-input-wrap
    .tag-chip, .tag-chip-remove
    .tags-input
    .form-row-2 (2-col grid)

  SHARED COMPONENTS:
    .section-header, .section-title,
    .section-action
    .summary-card (stat cards)
    .tx-item (transaction list row)
    .tx-icon, .tx-info, .tx-name,
    .tx-meta, .tx-amount
    .empty-state (centered placeholder)
    .month-picker (prev/next nav)

DEPENDS ON:
  css/variables.css
  css/global.css
```

---

#### `css/login.css`
```
ROLE:
  Styles for index.html only
  Login and register page layout

CONTAINS:
  .auth-wrapper (full viewport flex)
  .auth-bg (fixed background)
  .auth-bg-circle-1/2/3 (blurred circles)
  .auth-container (max-width card)
  .auth-logo (icon + text)
  .auth-logo-icon (accent square)
  .auth-logo-name, .auth-logo-tagline

  TAB SWITCHER:
    .auth-tabs (container)
    .auth-tab (button)
    .auth-tab.active
    .auth-tab-indicator (sliding bg)
    .auth-tab-indicator.right

  FORM LAYOUT:
    .auth-form (card with gap)
    .auth-form-row (2-col grid)

  INPUT ICONS:
    .input-icon-wrap (relative)
    .input-icon (absolute left icon)
    .input-with-icon (left padding)
    .input-icon-right (absolute right)

  OTHER:
    .auth-forgot (right aligned)
    .auth-error (red error box)
    .google-icon
    .password-strength
    .strength-bars, .strength-bar
    .strength-label
    .auth-footer (terms text)

  TOAST:
    .toast-container (fixed top-right)
    .toast (card notification)
    .toast-icon, .toast-content
    .toast-title, .toast-message
    .toast.success/error/warning/info
    .toast.exit (remove animation)

  RESPONSIVE:
    max-width 420px (single column form)
```

---

#### `css/dashboard.css`
```
ROLE:
  Dashboard page visual styles

CONTAINS:
  .dashboard-month (header row)

  HERO CARD:
    .hero-card (accent bg, rounded)
    .hero-card-bg (circle decoration)
    .hero-label (small uppercase)
    .hero-amount (large number)
    .hero-sub (income/net row)
    .hero-compare (partner section)
    .hero-compare-bar (split bar)
    .hero-compare-you (white fill)
    .hero-compare-her (translucent)
    .hero-compare-label

  QUICK STATS:
    .stats-row (3-col grid)
    .stat-card (card + tap animation)
    .stat-card-icon (colored square)
    .stat-card-value
    .stat-card-label

  CHARTS:
    .chart-wrap (height: 220px)

  CATEGORY LEGEND:
    .cat-legend (flex column)
    .legend-item (flex row)
    .legend-dot (colored circle)
    .legend-label, .legend-pct,
    .legend-amt

  BUDGET ROWS:
    .budget-list
    .dash-budget-row
    .dash-budget-info
    .dash-budget-cat
    .dash-budget-icon
    .dash-budget-name
    .dash-budget-amounts

  CARD FLUSH:
    .card-flush (no padding card)

  TX DETAIL MODAL:
    .tx-detail-header
    .tx-detail-icon
    .tx-detail-amount.expense/income
    .tx-detail-category
    .tx-detail-list
    .tx-detail-row
    .tx-detail-label, .tx-detail-value
    .tx-detail-tags
    .tx-detail-actions
```

---

#### `css/transactions.css`
```
ROLE:
  Transaction list page styles

CONTAINS:
  FILTER BAR:
    .filter-bar (horizontal scroll)
    .filter-chip (pill button)
    .filter-chip.active (accent border)

  SEARCH:
    .search-wrap (relative)
    .search-icon (absolute left)
    .search-input (left padded)

  DATE GROUPS:
    .date-group (flex column)
    .date-group-header (sticky)
    .date-group-label (uppercase small)
    .date-group-total (red amount)
    .date-group-card (card container)

  OWNER TOGGLE:
    .owner-toggle (3-button row)
    .owner-toggle-btn
    .owner-toggle-btn.active-you
    .owner-toggle-btn.active-her

  SUMMARY STRIP:
    .tx-summary-strip (3-col flex)
    .tx-summary-item
    .tx-summary-label
    .tx-summary-value.income/expense
```

---

#### `css/compare.css`
```
ROLE:
  Compare page (You vs Partner) styles

CONTAINS:
  WINNER BANNER:
    .compare-winner-card
    .winner-you/her/tie (color variants)
    .compare-winner-icon
    .compare-winner-text
    .compare-winner-diff

  HEAD TO HEAD:
    .compare-heads (flex row)
    .compare-head-card (flex-1)
    .you-card, .her-card (border colors)
    .compare-head-avatar
    .compare-head-name/amount/sub/income
    .compare-vs (VS circle)

  COMBINED CARD:
    .compare-combined
    .compare-combined-label/amount
    .compare-split-bar
    .compare-split-you (flex proportion)
    .compare-split-her (flex proportion)
    .compare-split-labels

  CATEGORY TABLE:
    .compare-table-head (grid 4-col)
    .compare-table-row
    .compare-table-cat
    .compare-cat-icon, .compare-cat-label
    .compare-table-val
    .compare-table-diff
    .diff-positive (red)
    .diff-negative (green)

  INSIGHTS:
    .insights-list
    .insight-item
    .insight-icon (colored box)
    .insight-text

  SHEET (action menu):
    .sheet-items
    .sheet-item, .sheet-item-danger
    .sheet-item-icon, .sheet-item-label

  EMPTY STATE:
    .no-partner-state
```

---

#### `css/analytics.css`
```
ROLE:
  Analytics page styles
  Also contains theme & accent
  option styles (used in settings)

CONTAINS:
  PERIOD TABS:
    .period-tabs (4-button row)
    .period-tab
    .period-tab.active (accent bg)

  STAT CARDS:
    .analytics-stats (2-col grid)
    .analytics-stat-card
    .analytics-stat-label/value/change
    .change-up/down/flat (colors)

  CHARTS:
    .line-chart-wrap (height 200px)
    .trend-chart-wrap (height 240px)

  CATEGORY BARS:
    .cat-bar-list
    .cat-bar-item
    .cat-bar-header
    .cat-bar-left/right
    .cat-bar-icon/name/amount/pct
    .cat-progress, .cat-progress-fill

  THEME OPTIONS (used in settings):
    .theme-options (3-col grid)
    .theme-option (button)
    .theme-preview (mini preview box)
    .theme-preview-bar (accent strip)
    .theme-preview-lines
    .theme-option-label
    .theme-option.active

  ACCENT OPTIONS (used in settings):
    .accent-options (flex wrap)
    .accent-option (button)
    .accent-dot (colored circle)
```

---

#### `css/budget.css`
```
ROLE:
  Budget page styles

CONTAINS:
  SUMMARY CARD:
    .budget-summary-card
    .budget-summary-top
    .budget-summary-label
    .budget-summary-amount
    .budget-spent (large number)
    .budget-total (muted)
    .budget-summary-sub (remaining)

  SVG DONUT:
    .budget-summary-circle (70x70)
    .budget-donut (SVG element)
    .budget-donut-bg (gray track)
    .budget-donut-fill (colored arc)
    .budget-donut-text (center %)

  BUDGET CARDS:
    .budget-cards (flex column)
    .budget-card
    .budget-card-header
    .budget-card-left/right
    .budget-card-icon (40x40)
    .budget-card-info
    .budget-card-name/status
    .budget-card-actions
    .budget-card-progress
    .budget-card-amounts (4-col grid)
    .budget-amount-item
    .budget-amount-label/value
    .budget-card-footer
```

---

#### `css/settings.css`
```
ROLE:
  Settings page styles

CONTAINS:
  PROFILE SECTION:
    .settings-profile (flex row)
    .settings-avatar (relative)
    .settings-avatar-edit (edit btn)
    .settings-profile-name (editable)
    .settings-profile-email/since

  SECTION LAYOUT:
    .settings-section (flex column)
    .settings-section-title (uppercase)
    .settings-row (flex between)
    .settings-row-info/label/desc
    .settings-toggle-row
    .settings-group-title

  PARTNER:
    .settings-partner-card
    .settings-partner-info/name/email
    .settings-link-partner
    .settings-link-icon/title/desc
    .settings-your-id (ID display box)
    .settings-id-label/value

  MENU CARD:
    .settings-menu-card (flush card)
    .settings-menu-item (button row)
    .settings-menu-icon (colored box)
    .settings-menu-label

  FONT SIZE:
    .font-size-options (flex)
    .font-size-btn (A buttons)
    .font-size-btn.active

  CURRENCY:
    .currency-list (scrollable)
    .currency-item (button row)
    .currency-symbol/name/code

  ABOUT:
    .settings-about
    .settings-about-name/version
```

---

### JS/CORE FILES

---

#### `js/core/firebase-config.js`
```
ROLE:
  Firebase initialization
  All app constants & config
  Global window exports

CONTAINS:
  firebaseConfig OBJECT:
    apiKey, authDomain, databaseURL,
    projectId, storageBucket,
    messagingSenderId, appId,
    measurementId

  FIREBASE INIT:
    firebase.initializeApp(firebaseConfig)

  SERVICE REFERENCES:
    db       = firebase.firestore()
    auth     = firebase.auth()
    storage  = firebase.storage()

  FIRESTORE SETTINGS:
    experimentalForceLongPolling: true
    enablePersistence (offline support)

  COLLECTIONS OBJECT:
    USERS, TRANSACTIONS, BUDGETS,
    RECURRING, NOTIFICATIONS,
    REPORTS, COUPLE

  APP_CONFIG OBJECT:
    version, name, defaultCurrency,
    defaultTheme, maxReceiptSize,
    reportExpireDays, cacheDuration

  CATEGORIES ARRAY (13 items):
    Each: { id, label, color, icon }
    food, transport, shopping,
    entertainment, health, education,
    housing, utilities, travel,
    gifts, savings, income, other

  THEMES OBJECT (5 themes):
    dark, light, amoled, ocean, rose
    Each has all --css-variables

  CURRENCIES ARRAY (16 currencies):
    USD, EUR, GBP, JPY, INR, AUD,
    CAD, SGD, MYR, THB, PHP, IDR,
    KRW, CNY, BRL, MXN

  WINDOW EXPORTS:
    window.db, auth, storage,
    COLLECTIONS, APP_CONFIG,
    CATEGORIES, THEMES, CURRENCIES

MUST LOAD BEFORE:
  All other JS files
  
FIREBASE CDN REQUIRED:
  firebase-app-compat.js
  firebase-auth-compat.js
  firebase-firestore-compat.js
  firebase-storage-compat.js
```

---

#### `js/core/auth.js`
```
ROLE:
  Authentication logic for index.html
  Login, register, Google auth,
  password reset, tab switching

CONTAINS:
  STATE:
    currentTab (login/register)

  ON PAGE LOAD:
    auth.onAuthStateChanged → redirect
    to app.html if already logged in
    Calls applySavedTheme()

  FUNCTIONS:
    switchTab(tab)
      → shows/hides login or register form
      → moves tab indicator

    handleLogin(event)
      → validates email + password
      → calls auth.signInWithEmailAndPassword
      → on success: redirect to app.html
      → on fail: shows error message

    handleRegister(event)
      → validates all fields
      → checks password match
      → calls auth.createUserWithEmailAndPassword
      → updates displayName
      → writes to Firestore users/{uid}
        with: name, partnerName, email,
        currency, theme, accentColor,
        youColor, herColor, partnerId:null,
        notifications object, createdAt
      → redirect to app.html

    handleGoogleLogin()
      → GoogleAuthProvider popup
      → if new user: creates Firestore profile
      → redirect to app.html

    handleForgotPassword()
      → reads email from login input
      → calls auth.sendPasswordResetEmail
      → shows toast

    togglePassword(inputId, btn)
      → toggles input type text/password
      → swaps eye icon SVG

    checkPasswordStrength(password)
      → scores 0-4 based on rules
      → colors strength bars
      → updates label text

    setButtonLoading(btn, spinner, loading)
    showFormError(errorBox, message)
    clearErrors()
    getAuthErrorMessage(code)
      → maps Firebase error codes
      → to human readable messages

    applySavedTheme()
      → reads localStorage cs_theme
      → applies CSS variables from THEMES

    showToast(type, title, message, duration)
      → creates toast element
      → appends to #toast-container

  WINDOW EXPORTS:
    showToast, switchTab

USED IN:
  index.html (inline onclick + onsubmit)
```

---

#### `js/core/store.js`
```
ROLE:
  Central app state manager
  Firestore data loading
  Real-time listeners
  Computed value helpers
  Month management

CONTAINS:
  PRIVATE STATE OBJECT:
    user           → Firebase auth user
    profile        → Firestore user doc
    partnerProfile → Partner's doc
    transactions   → Current month (mine)
    partnerTxns    → Current month (partner)
    budgets        → Current month budgets
    recurring      → Active recurring txns
    notifications  → Unread notifications
    currentMonth   → "YYYY-MM" string
    isLoading      → boolean
    listeners      → Firestore unsubs

  SUBSCRIBER SYSTEM:
    subscribers = {}
    subscribe(key, callback) → returns unsub fn
    notify(key)
    setState(key, value) → sets + notifies

  ASYNC FUNCTIONS:
    init(firebaseUser)
      → sets user, currentMonth
      → calls all load functions
      → starts real-time listeners

    loadProfile(uid)
      → reads users/{uid}
      → setState('profile', ...)

    loadPartnerProfile(partnerId)
      → reads users/{partnerId}
      → setState('partnerProfile', ...)

    loadTransactions(uid, month)
      → queries transactions where
        userId==uid AND month==month
      → ordered by date desc
      → setState('transactions', ...)

    loadPartnerTransactions(partnerId, month)
      → same query for partner
      → setState('partnerTxns', ...)

    loadBudgets(uid, month)
      → queries budgets where
        userId==uid AND month==month
      → setState('budgets', ...)

    loadRecurring(uid)
      → queries recurring where
        userId==uid AND isActive==true
      → setState('recurring', ...)

    loadNotifications(uid)
      → queries notifications where
        toUserId==uid AND isRead==false
      → limit 20, ordered by createdAt
      → setState('notifications', ...)
      → calls updateNotifBadge()

    changeMonth(month)
      → stops listeners
      → reloads txns + budgets
      → restarts listeners
      → notifies 'currentMonth'

  REAL-TIME LISTENERS:
    startListeners(uid)
      → transactions onSnapshot
      → notifications onSnapshot
      → partnerTxns onSnapshot (if linked)

    stopListeners()
      → calls all unsubscribe functions

  COMPUTED HELPERS:
    getTotalSpend(transactions)
      → sum of expense amounts

    getTotalIncome(transactions)
      → sum of income amounts

    getSpendByCategory(transactions)
      → returns { catId: amount } map

    getCurrencySymbol()
      → finds symbol from CURRENCIES

    formatAmount(amount)
      → symbol + number.toFixed(2)

    formatMonth(monthStr)
      → "January 2024" format

  PRIVATE HELPERS:
    updateNotifBadge(count)
      → shows/hides red badge on bell

  WINDOW EXPORT:
    window.store

FIRESTORE QUERIES:
  transactions: where userId, month
                orderBy date desc
  budgets:      where userId, month
  recurring:    where userId, isActive
  notifications: where toUserId, isRead
                 orderBy createdAt, limit 20
```

---

#### `js/core/router.js`
```
ROLE:
  Single Page App routing
  Page show/hide management
  Header title updates
  Bottom nav active state
  URL hash management

CONTAINS:
  ROUTES OBJECT (7 routes):
    dashboard, transactions, compare,
    analytics, budget, notifications,
    settings
    Each has: title, subtitle,
    showBack (bool), init (function ref)

  BOTTOM NAV PAGES:
    dashboard, transactions,
    compare, analytics
    (budget/notifications/settings
    hide bottom nav)

  STATE:
    currentPage  → current page id
    previousPage → previous page id
    history      → navigation stack array

  FUNCTIONS:
    init()
      → reads URL hash
      → calls navigate() for initial page
      → listens for hashchange events

    navigate(page, fromHash)
      → hides current page element
      → pushes to history
      → shows new page element
      → adds page-enter animation class
      → calls updateHeader(page)
      → calls updateBottomNav(page)
      → updates window.location.hash
      → calls route.init() function
      → scrolls app-main to top

    back()
      → pops from history
      → calls navigate(prev)

    updateHeader(page)
      → sets #header-title text
      → sets #header-subtitle text
      → shows/hides #header-back btn

    updateBottomNav(page)
      → toggles .active on nav items
      → shows/hides .bottom-nav
        based on bottomNavPages list

    getCurrent()
      → returns currentPage string

  WINDOW EXPORT:
    window.router

PAGES INITIALIZED BY ROUTER:
  dashboard     → dashboardPage.init()
  transactions  → transactionsPage.init()
  compare       → comparePage.init()
  analytics     → analyticsPage.init()
  budget        → budgetPage.init()
  notifications → notificationsPage.init()
  settings      → settingsPage.init()
```

---

### JS/UI FILES

---

#### `js/ui/toast.js`
```
ROLE:
  Toast notification system
  Replaces browser alerts
  Used throughout entire app

CONTAINS:
  ICONS (SVG paths):
    success, error, warning, info

  QUEUE:
    queue array
    isShowing flag

  FUNCTIONS:
    getContainer()
      → creates #toast-container if missing
      → returns container element

    show(type, title, message, duration)
      → limits to 3 simultaneous toasts
      → creates toast div with icon,
        title, message, close button
      → appends to container
      → auto removes after duration ms
      → click also dismisses

    dismiss(toast)
      → adds .exit class (animation)
      → removes after 300ms

    dismissAll()
      → dismisses all active toasts

    SHORTHAND METHODS:
      success(title, message, duration)
      error(title, message, duration)
      warning(title, message, duration)
      info(title, message, duration)

  WINDOW EXPORTS:
    window.Toast
    window.showToast (global shorthand)

USED BY:
  Every JS file that needs notifications
  Called as Toast.success('...') or
  showToast('success', '...')
```

---

#### `js/ui/modal.js`
```
ROLE:
  Modal & bottom sheet manager
  Handles open/close/stack
  Creates dynamic modals
  Confirm dialogs
  Action sheets

CONTAINS:
  STATE:
    stack = [] (open modal ids)

  FUNCTIONS:
    open(id)
      → removes hidden class
      → pushes to stack
      → prevents body scroll
      → adds overlay click listener
      → adds Escape key listener

    close(id)
      → adds hidden class
      → removes from stack
      → restores scroll if no more modals
      → removes event listeners

    closeLast()
      → closes top of stack

    closeAll()
      → closes all open modals

    onOverlayClick(e)
      → closes if click is on overlay
        not on modal content

    onEscKey(e)
      → closes on Escape key

    create({id, title, body, position,
            showHandle, onClose})
      → creates modal DOM element
      → appends to body
      → returns overlay element

    confirm({title, message, okText,
             okClass, onOk, onCancel})
      → returns Promise<boolean>
      → creates dynamic confirm dialog
      → resolves true on ok, false on cancel

    sheet({id, title, items})
      → items: [{label, icon, action,
                danger}]
      → creates bottom action sheet
      → calls open() automatically

  GLOBAL HELPERS (window functions):
    openAddTransaction(txData)
      → resets or populates form
      → opens #modal-add-transaction
      → sets edit mode if txData given

    closeAddTransaction()
      → closes modal + resets form

    showConfirm(title, message, okText)
      → returns Modal.confirm()

    closeConfirm(result)
      → resolves confirm promise

  WINDOW EXPORTS:
    window.Modal
    window.openAddTransaction
    window.closeAddTransaction
    window.showConfirm
    window.closeConfirm
```

---

#### `js/ui/theme.js`
```
ROLE:
  Theme management system
  Applies CSS variables dynamically
  Saves preferences to localStorage
  AND Firebase profile
  Builds theme/accent UI options

CONTAINS:
  STORAGE KEYS:
    cs_theme, cs_accent,
    cs_you_color, cs_her_color,
    cs_font_size

  CURRENT STATE:
    { theme, accent, youColor,
      herColor, fontSize }

  FUNCTIONS:
    init(profileData)
      → loads saved preferences
      → falls back to localStorage
      → calls applyAll()

    applyAll()
      → calls all apply functions

    applyTheme(themeName)
      → reads THEMES[themeName] object
      → sets all --css-variables on :root
      → updates meta theme-color
      → saves to localStorage

    applyAccent(accentName)
      → sets data-accent attribute
      → saves to localStorage

    applyPartnerColors(youColor, herColor)
      → sets data-you + data-her attributes
      → saves to localStorage

    applyFontSize(size)
      → sets font-size on html element
      → small:14px, normal:16px, large:18px
      → saves to localStorage

    saveToProfile()
      → writes theme, accentColor,
        youColor, herColor to Firestore
        users/{uid}

    setTheme(name)  → apply + save
    setAccent(name) → apply + save
    setPartnerColors(you, her) → apply + save
    setFontSize(size) → apply only

    getCurrent()
      → returns copy of current state

    buildThemeOptions()
      → returns HTML string of theme
        preview buttons for settings page

    buildAccentOptions()
      → returns HTML string of accent
        color circles for settings page

  ACCENT_OPTIONS ARRAY:
    indigo, violet, pink, cyan,
    emerald, rose, amber

  GLOBAL HELPERS:
    applyTheme(name)
    applyAccent(name)

  WINDOW EXPORT:
    window.ThemeManager
    window.applyTheme
    window.applyAccent
```

---

#### `js/ui/components.js`
```
ROLE:
  SVG icon library
  Reusable HTML builder functions
  Utility/helper functions
  Global state for selected category

CONTAINS:
  Icons OBJECT (40+ icons):
    NAVIGATION:
      dashboard, transactions, compare,
      analytics, settings, notifications

    ACTIONS:
      add, edit, delete, close, back,
      chevronRight, chevronDown, check

    CATEGORIES (matching CATEGORIES ids):
      food, transport, shopping,
      entertainment, health, education,
      housing, utilities, travel,
      gifts, savings, income, other

    FINANCE:
      wallet, currency, trending_up,
      trending_down

    EXPORT/SHARE:
      download, share, export, copy

    USER:
      user, users, link, logout

    MISC:
      calendar, filter, search, refresh,
      info, warning, budget, recurring,
      backup, palette

  BUILDER FUNCTIONS:
    getIcon(name, size)
      → wraps icon in .icon span

    buildCategoryGrid(selectedId)
      → populates #category-grid
      → creates button per category
      → applies selected state

    selectCategory(catId)
      → sets selectedCategory var
      → updates .selected class

    getSelectedCategory()
      → returns selectedCategory value

    buildTransactionItem(tx, showOwner)
      → returns tx-item HTML string
      → shows category icon + color
      → formats amount as expense/income
      → shows owner name if showOwner=true

    buildMonthPicker(month, onPrev, onNext)
      → returns month-picker HTML
      → prev/next buttons + formatted label

    buildEmptyState(icon, title, desc,
                    actionLabel, actionFn)
      → returns empty-state HTML
      → centered icon + text + optional btn

  UTILITY FUNCTIONS:
    formatDate(dateStr)
      → "Today", "Yesterday", "Jan 15"

    getTodayStr()
      → "YYYY-MM-DD" string

    capitalise(str)
      → first letter uppercase

    groupByDate(transactions)
      → returns { dateStr: [txns] } map

    animateCount(el, from, to, duration,
                 prefix, suffix)
      → requestAnimationFrame counter
      → ease-out cubic animation

    debounce(fn, delay)
      → returns debounced function

    copyToClipboard(text)
      → navigator.clipboard.writeText
      → shows Toast on success/fail

  WINDOW EXPORTS:
    Icons, getIcon, buildCategoryGrid,
    selectCategory, getSelectedCategory,
    buildTransactionItem, buildMonthPicker,
    buildEmptyState, formatDate,
    getTodayStr, capitalise, groupByDate,
    animateCount, debounce, copyToClipboard

GLOBAL STATE:
  selectedCategory (module-level var)
```

---

#### `js/ui/charts.js`
```
ROLE:
  Chart.js wrapper
  All chart creation functions
  Theme-aware colors
  Chart instance management

CONTAINS:
  instances OBJECT:
    { canvasId: ChartInstance }
    tracks all active charts

  FUNCTIONS:
    getThemeColors()
      → reads CSS variables from :root
      → returns color object:
        { isDark, accent, youColor,
          herColor, success, warning,
          danger, bgCard, bgInput,
          textPrimary, textMuted, border,
          gridColor, labelColor }

    getDefaultOptions(colors)
      → base Chart.js options object
      → responsive, animation
      → tooltip styling (themed)
      → x/y axis styling (themed)

    destroy(canvasId)
      → destroys Chart instance
      → removes from instances map

    destroyAll()
      → destroys all chart instances

    createDoughnut(canvasId, opts)
      OPTS: labels, data, colors,
            symbol, cutout, onHover
      → creates doughnut chart
      → themed tooltip with %
      → stores in instances

    createBar(canvasId, opts)
      OPTS: labels, datasets, symbol,
            stacked, horizontal
      DATASET: { label, data, color,
                 extra }
      → creates bar chart
      → supports grouped & stacked
      → themed legend if multi-dataset

    createLine(canvasId, opts)
      OPTS: labels, datasets, symbol,
            smooth, fill
      → creates line chart
      → tension 0.4 if smooth
      → fill area if fill=true

    createPie(canvasId, opts)
      → createDoughnut with cutout 0%

    createArea(canvasId, opts)
      → createLine with fill=true

    update(canvasId, newData)
      → updates existing chart data

    getLast6MonthLabels()
      → ["Jan '24", "Feb '24", ...]
      → last 6 months from today

    getLast6MonthKeys()
      → ["2024-01", "2024-02", ...]
      → last 6 months as YYYY-MM

  WINDOW EXPORT:
    window.ChartManager

REQUIRES:
  Chart.js CDN loaded before this file
```

---

### JS/FEATURES FILES

---

#### `js/features/transactions.js`
```
ROLE:
  Add/Edit/Delete transaction logic
  Form management for add modal
  Transaction detail view
  Budget alert checking
  Partner notifications

CONTAINS:
  MODULE STATE:
    editingId     → null or txn id
    currentTags   → array of tag strings
    currentType   → 'expense' or 'income'

  FUNCTIONS:
    initModal()
      → builds category grid
      → sets today's date
      → sets currency symbol

    resetForm()
      → clears all form fields
      → resets type to expense
      → clears tags
      → resets category selection
      → removes edit id from modal

    setType(type)
      → toggles expense/income buttons
      → updates currentType

    populateForm(tx)
      → fills form for editing
      → sets all fields from tx object
      → calls setType, buildCategoryGrid,
        renderTags

    handleTagInput(event)
      → Enter/comma → adds tag
      → Backspace on empty → removes last
      → max 5 tags

    renderTags()
      → builds tag chips in #tags-display
      → each chip has remove button

    removeTag(index)
      → splices from currentTags
      → re-renders

    validate()
      → checks amount > 0
      → checks category selected
      → shows Toast on fail

    save()
      → validates form
      → sets button loading state
      → reads all form values
      → builds txData object
      → if editingId: updates Firestore doc
      → if new: adds new Firestore doc
      → calls checkBudgetAlert
      → calls sendPartnerNotification
      → closes modal, resets form
      → shows success Toast

    remove(txId)
      → Modal.confirm() dialog
      → deletes from Firestore
      → shows Toast

    showDetail(txId)
      → finds tx in store
      → builds detail modal HTML
      → shows amount, category,
        date, payment, tags, owner
      → edit/delete buttons if own tx
      → opens dynamic modal

    checkBudgetAlert(uid, category, month)
      → finds matching budget in store
      → sums category spending
      → if >= 100%: warning Toast + notification
      → if >= 80%: warning Toast only

    sendPartnerNotification(action, amount, cat)
      → creates notification doc for partner

    createNotification(toUserId, data)
      → writes to NOTIFICATIONS collection

    fetchRange(uid, startDate, endDate)
      → async query for date range
      → returns transactions array

  GLOBAL BINDINGS (window functions):
    initTransactionModal()
    setTransactionType(type)
    handleTagInput(event)
    saveTransaction()
    showTransactionDetail(id)
    resetTransactionForm()
    populateTransactionForm(tx)

  FIRESTORE OPERATIONS:
    CREATE: transactions collection
    UPDATE: transactions/{id}
    DELETE: transactions/{id}
    CREATE: notifications collection

  WINDOW EXPORT:
    window.Transactions
    + all global binding functions
```

---

#### `js/features/compare.js`
```
ROLE:
  Compare page logic
  You vs Partner data
  Bar chart building
  Category comparison table
  Spending insights generation

CONTAINS:
  MODULE STATE:
    chartBar     → Bar Chart instance
    chartHistory → History Chart instance
    currentMonth → "YYYY-MM"

  FUNCTIONS:
    init()
      → sets currentMonth from store
      → calls render()
      → subscribes to store changes

    render()
      → gets profile, partnerProfile,
        myTxns, partnerTxns
      → if no partner: shows link state
      → builds HTML with:
        · Month picker
        · Winner banner (you/her/tie)
        · Head to head cards
        · VS divider
        · Combined total + split bar
        · Bar chart canvas
        · Category table
        · Insights section
        · Export button

    buildCategoryTable(myCat, herCat, symbol)
      → merges all categories
      → sorts by combined spend
      → returns table rows HTML
      → shows you amount | her amount | diff

    buildBarChart(myCat, herCat,
                  myName, herName, symbol)
      → destroys old chart
      → gets top 7 categories
      → creates grouped bar chart
      → you = youColor, her = herColor
      → themed options

    buildInsights(myTxns, herTxns,
                  mySpend, herSpend,
                  myCat, herCat,
                  myName, herName, symbol)
      → generates text insights:
        · Who spent more overall
        · Each person's top category
        · Transaction count comparison
        · Average transaction comparison
      → returns insight-item HTML array

    buildNoPartnerState()
      → returns empty state with
        link partner button

    prevMonth() / nextMonth()
      → navigates months
      → calls store.changeMonth()
      → re-renders

  GLOBAL FUNCTION:
    exportCompareReport()
      → calls ExportManager.exportComparePDF()

  WINDOW EXPORT:
    window.comparePage
    window.exportCompareReport
```

---

#### `js/features/budget.js`
```
ROLE:
  Budget management page
  Set/edit/delete budgets
  Budget vs actual tracking
  Budget tips/alerts display

CONTAINS:
  MODULE STATE:
    currentMonth → "YYYY-MM"

  FUNCTIONS:
    init()
      → sets currentMonth
      → calls render()
      → subscribes to budgets + txns

    render()
      → gets budgets, txns, catSpend
      → calculates totals + percentage
      → builds HTML with:
        · Month picker
        · Budget summary card
          (SVG donut + totals)
        · Add Budget button
        · Budget cards list
        · Budget tips/alerts section
        · Empty state if no budgets

    buildBudgetCard(budget, catSpend, symbol)
      → shows category icon + name
      → color-coded status
        (on track/almost/over)
      → progress bar (colored by %)
      → 4-column amounts grid
        (spent, budget, left, used%)
      → edit + delete action buttons
      → alert threshold badge

    buildBudgetTips(budgets, catSpend, symbol)
      → shows warning/danger insights
      → for budgets >= 80% or 100%

    showAddBudget(existingBudget)
      → if existingBudget: edit mode
      → shows available categories
        (not already budgeted)
      → form: category, amount,
        alert%, shared toggle
      → creates dynamic modal

    saveBudget(editId)
      → reads form values
      → validates amount > 0
      → if editId: updates Firestore
      → if new: creates Firestore doc
      → calls store.loadBudgets()

    editBudget(budgetId)
      → finds budget in store
      → calls showAddBudget(budget)

    deleteBudget(budgetId)
      → Modal.confirm()
      → deletes from Firestore
      → reloads budgets

    prevMonth() / nextMonth()
      → navigation + re-render

  FIRESTORE OPERATIONS:
    CREATE: budgets collection
    UPDATE: budgets/{id}
    DELETE: budgets/{id}

  WINDOW EXPORT:
    window.budgetPage
```

---

#### `js/features/export.js`
```
ROLE:
  Export to PDF, CSV, Excel
  Chart image export
  File download helper

CONTAINS:
  HELPER FUNCTIONS:
    getExportData()
      → collects all data from store
      → returns: profile, partner,
        myTxns, partnerTxns, budgets,
        month, symbol, mySpend, herSpend,
        myIncome, herIncome, myCatSpend,
        herCatSpend, generatedAt

    formatTxDate(dateStr)
      → "Jan 15, 2024" format

    getCatLabel(catId)
      → finds category label from CATEGORIES

  MAIN FUNCTIONS:
    exportPDF(type)
      → uses jsPDF library
      → PAGE 1:
        · Accent colored header bar
        · Two summary boxes (you + partner)
        · Combined total line
        · Category breakdown table
          (zebra striped rows)
      · PAGE 2:
        · Your transactions table
        · Partner transactions table
          (max 50 each, note if more)
      · Footer on each page:
        · CoupleSpend + page numbers
      → saves as CoupleSpend_{month}_Report.pdf

    exportComparePDF()
      → calls exportPDF('compare')

    exportCSV(who)
      → who: 'me', 'partner', 'both'
      → headers: Date, Description,
        Category, Type, Amount, Payment,
        Tags, Owner
      → proper CSV escaping (quotes)
      → downloads as .csv file

    exportExcel()
      → uses XLSX library
      → SHEET 1: Your Transactions
      → SHEET 2: Partner Transactions
      → SHEET 3: Comparison by category
        (with totals row)
      → SHEET 4: Budgets
        (with spent, remaining, % used)
      → column widths configured
      → saves as .xlsx

    exportChartImage(canvasId, fileName)
      → canvas.toDataURL('image/png')
      → triggers download as .png

    downloadFile(content, fileName, mime)
      → creates Blob
      → creates temp link
      → triggers click download
      → revokes object URL

  REQUIRES CDN:
    jsPDF: jspdf.umd.min.js
    jsPDF AutoTable: jspdf.plugin.autotable.min.js
    XLSX: xlsx.full.min.js

  WINDOW EXPORT:
    window.ExportManager
```

---

#### `js/features/share.js`
```
ROLE:
  Share report features
  Multiple sharing methods

CONTAINS:
  FUNCTIONS:
    buildShareText(type)
      → type 'summary': short 5-line text
      → type 'monthly': full report text
        with name, amounts, top categories
      → uses store data for all values

    shareNative(type)
      → uses navigator.share API
      → fallback: copyToClipboard
      → catches AbortError (user cancelled)

    shareWithFile(type)
      → checks navigator.share support
      → currently shares text only

    shareWhatsApp(type)
      → builds wa.me URL
      → encodes text as query param
      → opens in new tab

    shareEmail()
      → builds mailto: URL
      → pre-fills subject + body
      → sets window.location.href

    copySummary(type)
      → calls buildShareText
      → calls copyToClipboard

    generateShareLink()
      → creates report doc in Firestore
        with expiry (7 days default)
      → builds URL with report id
      → copies link to clipboard
      → shows Toast with expiry info

    showShareOptions()
      → Modal.sheet() with items:
        · Share via Apps (native)
        · Share on WhatsApp
        · Share via Email
        · Copy Summary Text
        · Copy Full Report
        · Generate Share Link

  WINDOW EXPORT:
    window.ShareManager
```

---

#### `js/features/backup.js`
```
ROLE:
  Full data backup to JSON
  Restore from JSON file
  Preview before restore

CONTAINS:
  FUNCTIONS:
    createBackup()
      → fetches ALL transactions
        (not just current month)
      → fetches ALL budgets
      → fetches ALL recurring
      → converts Firestore timestamps
        to ISO strings
      → builds backup JSON object:
        { version, appName, exportedAt,
          userId, profile, data, stats }
      → downloads as
        CoupleSpend_Backup_{date}.json

    restoreBackup()
      → creates hidden file input
      → accepts .json files
      → reads file as text
      → parses JSON
      → validates appName field
      → calls showRestorePreview()

    showRestorePreview(backupData)
      → shows modal with:
        · Backup date
        · Profile name
        · Stats (txn, budget, recurring count)
        · Warning message
        · Two buttons:
          - Merge with existing
          - Replace all data

    performRestore(backupData, mode)
      → mode 'replace':
        deletes all existing transactions
        via Firestore batch
      → imports transactions in
        batches of 400 (Firestore limit)
      → imports budgets
      → uses set() with merge option
      → reloads store data
      → shows success Toast

    downloadJSON(json, fileName)
      → creates JSON Blob
      → triggers download

  FIRESTORE OPERATIONS:
    READ:   transactions (all for uid)
    READ:   budgets (all for uid)
    READ:   recurring (all for uid)
    DELETE: (replace mode) batch delete
    WRITE:  batch set with merge

  WINDOW EXPORT:
    window.BackupManager
```

---

#### `js/features/notifications.js`
```
ROLE:
  Notifications page rendering
  Mark read / clear operations
  Push notification permission
  Local notification display
  Create notification helper

CONTAINS:
  FUNCTIONS:
    init()
      → calls render()
      → calls markAllRead()

    render()
      → reads store.state.notifications
      → if empty: empty state
      → builds notification list:
        · Header with count + clear btn
        · .notif-list card
        · Each item: notif-item

    buildNotifItem(notif)
      → maps type to icon + color:
        budget_alert    → budget icon (warning)
        budget_exceeded → warning icon (danger)
        partner_transaction → users (herColor)
        partner_linked  → link (success)
        weekly_report   → analytics (accent)
        monthly_report  → analytics (accent)
        goal_achieved   → check (success)
      → shows: icon, title, message,
        time ago, unread dot

    handleTap(notifId, type)
      → marks notification as read
        in Firestore
      → navigates to relevant page:
        budget_alert → budget page
        partner_transaction → compare page
        partner_linked → settings page
        report → analytics page

    markAllRead()
      → batch updates all unread
        to isRead: true

    clearAll()
      → Modal.confirm()
      → batch deletes all notifications
      → clears store state
      → re-renders

    getTimeAgo(timestamp)
      → converts Firestore timestamp
      → "Just now", "5m ago", "2h ago",
        "3d ago", "Jan 15"

    requestPushPermission()
      → checks Notification API support
      → requests browser permission
      → returns boolean

    showLocalNotification(title, body, data)
      → creates browser Notification
      → uses app icon
      → onclick: focus window

    createNotification(toUserId, {type,
                       title, message, data})
      → writes to NOTIFICATIONS collection

  CSS (injected via extraStyles):
    Notification item styles
    Recurring item styles
    Analytics extra styles
    Payment method styles
    Backup preview styles

  WINDOW EXPORT:
    window.notificationsPage
```

---

#### `js/features/recurring.js`
```
ROLE:
  Recurring transaction automation
  Check and add due transactions
  CRUD for recurring items
  UI for managing recurring

CONTAINS:
  FUNCTIONS:
    checkAndAdd()
      → called on app load (3s delay)
      → filters recurring where
        isActive=true AND nextDate <= today
      → calls addRecurringTransaction()
        for each due item

    addRecurringTransaction(rec, date, uid)
      → creates transaction doc
        with isRecurring:true flag
      → calculates nextDate via getNextDate
      → updates recurring doc with
        new nextDate + lastAdded date
      → shows local notification

    getNextDate(frequency, fromDate)
      → frequency options:
        daily    → +1 day
        weekly   → +7 days
        biweekly → +14 days
        monthly  → +1 month
        yearly   → +1 year
      → returns "YYYY-MM-DD" string

    add(data)
      → creates new recurring doc
        with: userId, amount, category,
        type, description, frequency,
        paymentMethod, startDate,
        nextDate, isActive:true
      → calls store.loadRecurring()

    toggle(recurringId, isActive)
      → updates isActive field
      → reloads recurring from store
      → shows Paused/Resumed Toast

    remove(recurringId)
      → Modal.confirm()
      → deletes from Firestore
      → reloads recurring from store

    showRecurringList()
      → creates dynamic modal
      → if empty: empty state
      → if has items: list of recurring
      → Add Recurring button

    buildRecurringItem(rec, symbol)
      → shows: icon, name, frequency,
        next date, paused badge
      → amount with +/- color
      → pause/resume + delete buttons

    showAddForm()
      → creates dynamic modal with form:
        category, type, amount,
        description, frequency,
        start date, payment method

    saveForm()
      → reads form values
      → validates amount
      → calls add(data)

  AUTO-INIT:
    DOMContentLoaded listener
    → 3 second delay
    → calls checkAndAdd() if user logged in

  FIRESTORE OPERATIONS:
    CREATE: transactions (auto-add)
    UPDATE: recurring/{id} nextDate
    CREATE: recurring (new)
    UPDATE: recurring/{id} isActive
    DELETE: recurring/{id}

  WINDOW EXPORT:
    window.RecurringManager
```

---

### JS/PAGES FILES

---

#### `js/pages/dashboard.js`
```
ROLE:
  Dashboard page content
  Main summary view
  Doughnut chart
  Recent transactions
  Budget overview

CONTAINS:
  MODULE STATE:
    chartInstance → Chart instance
    initialized   → boolean

  FUNCTIONS:
    init()
      → calls render()
      → subscribes to 'transactions'
        store changes

    render()
      → reads from store:
        profile, transactions,
        partnerTxns, currentMonth
      → computes: mySpend, myIncome,
        herSpend, diff, myCatSpend
      → builds complete page HTML:
        · Month label + analytics btn
        · Hero card with:
          - Total expense amount
          - Income + net row
          - Partner compare bar (if linked)
        · Stats row (3 cards):
          - Transaction count
          - Budget count
          - Partner spend (or link btn)
        · Category doughnut chart card
        · Budget overview card (if budgets)
        · Recent transactions card (last 5)
      → calls animateCount on hero amount
      → calls buildDoughnutChart after 100ms
      → calls buildCatLegend after 100ms

    buildBudgetRows(catSpend, symbol)
      → maps store.budgets (first 4)
      → shows: icon, name, spent/budget
      → color-coded progress bar
      → returns HTML string

    buildDoughnutChart(catSpend, symbol)
      → destroys old chart instance
      → gets top 6 categories
      → creates doughnut via new Chart()
      → themed tooltip with %
      → stores as chartInstance

    buildCatLegend(catSpend, symbol)
      → populates #cat-legend
      → shows dot, label, %, amount
      → top 6 categories

  WINDOW EXPORT:
    window.dashboardPage
```

---

#### `js/pages/transactions-page.js`
```
ROLE:
  Transactions list page
  Search, filter, group by date
  Owner toggle (you/partner/both)
  Month navigation
  Summary strip

CONTAINS:
  MODULE STATE:
    currentOwner  → 'you'/'her'/'all'
    currentFilter → 'all'/'expense'/'income'/
                    category.id
    searchQuery   → string
    currentMonth  → "YYYY-MM"

  FUNCTIONS:
    init()
      → sets currentMonth
      → calls render()
      → subscribes to transactions
        + partnerTxns store changes

    render()
      → builds page HTML:
        · Month picker
        · Owner toggle (if partner linked)
        · Search bar input
        · Filter chips (all types + all cats)
        · Summary strip (count, income, spend)
        · Transaction groups

    buildSummaryStrip(symbol)
      → filters via getFilteredTxns()
      → shows count, income total,
        expense total

    buildTransactionGroups(symbol)
      → gets filtered transactions
      → if empty: empty state
      → groups by date via groupByDate()
      → sorts dates descending
      → for each date:
        · Date label + day total
        · Card with transaction items
      → calls buildTransactionItem()

    getFilteredTxns()
      → applies owner filter
        (you/her/all from store)
      → filters by currentMonth
      → filters by type or category
      → filters by searchQuery
        (description, category, tags)
      → returns filtered array

    setOwner(owner) → re-render
    setFilter(filter) → re-render

    onSearch(val) [debounced 300ms]
      → updates searchQuery
      → updates only groups container
        and summary strip (no full re-render)

    prevMonth() / nextMonth()
      → updates currentMonth
      → calls store.changeMonth()
      → re-renders after load

  WINDOW EXPORT:
    window.transactionsPage
```

---

#### `js/pages/analytics-page.js`
```
ROLE:
  Analytics page with multiple charts
  Key stats with period filtering
  Category breakdown bars
  Payment method analysis
  Day of week spending pattern

CONTAINS:
  MODULE STATE:
    currentPeriod → '1m'/'3m'/'6m'/'1y'
    historyData   → cached txn array

  FUNCTIONS:
    init()
      → calls render()
      → subscribes to transactions changes

    render()
      → builds page HTML:
        · Period tabs (1m/3m/6m/1y)
        · Key stats grid (2x2)
        · Spending trend line chart
        · Category breakdown bars
        · Two doughnut charts (you + partner)
        · Payment method breakdown
        · Day of week bar chart
        · Share + Export action buttons
      → calls chart builders after 100ms

    buildKeyStats(symbol)
      → current month stats:
        Total Expenses + % change vs prev
        Transaction count
        Average per transaction
        Net savings (income - expense)
      → returns 4 stat card HTML

    buildCategoryBars(symbol)
      → all expense categories this month
      → sorted by amount desc
      → shows icon, name, amount, %
      → colored progress bar
      → returns HTML string

    buildPaymentBreakdown(symbol)
      → groups transactions by paymentMethod
      → shows icon, name, count, total
      → sorted by total desc

    buildTrendChart(symbol) [async]
      → fetches 6 months history
        if not cached (historyData)
      → also fetches partner history
      → creates line chart with:
        · You dataset (youColor)
        · Partner dataset (herColor)

    buildDoughnuts(symbol)
      → my doughnut: top 6 categories
      → her doughnut (if partner linked)
      → both use ChartManager.createDoughnut
      → builds small legend below each

    buildSmallLegend(entries, symbol)
      → top 4 entries
      → dot + label + % format

    buildDayChart(symbol)
      → groups expenses by day of week
      → Sun Mon Tue Wed Thu Fri Sat
      → creates bar chart

    setPeriod(period)
      → updates currentPeriod
      → clears historyData cache
      → destroys all charts
      → re-renders

    showExportSheet()
      → Modal.sheet with:
        · Export PDF
        · Export CSV
        · Export Excel
        · Save Trend Chart image

  WINDOW EXPORT:
    window.analyticsPage
```

---

#### `js/pages/settings.js`
```
ROLE:
  Settings page content
  Profile editing
  Partner linking/unlinking
  Theme + appearance controls
  Notification toggles
  Data management actions
  Logout

CONTAINS:
  FUNCTIONS:
    init() → calls render()

    render()
      → builds complete settings page:
        · Profile card (editable name,
          avatar, email, member since)
        · Partner section:
          - Linked: shows partner card
          - Unlinked: ID copy + input
        · Partner display name input
        · Appearance section:
          - Theme grid (5 options)
          - Accent color circles (7)
          - You + Her color pickers
          - Font size A/A/A buttons
        · Preferences section:
          - Currency picker button
          - 5 notification toggles
        · Data section menu:
          - Manage Budgets
          - Export Data
          - Backup & Restore
          - Clear All Data
        · About card (version)
        · Sign Out button

    buildColorOptions(type, current)
      → type 'you': indigo/blue/violet/
        cyan/emerald options
      → type 'her': pink/rose/orange/
        amber/red options
      → returns accent-options HTML

    buildNotifToggles(notifs)
      → 5 toggles: budgetAlert,
        partnerAdded, weeklyReport,
        monthlyReport, dailyReminder
      → each with label + description
      → toggle switch component

    formatMemberDate(timestamp)
      → converts Firestore timestamp
      → "January 2024" format

    saveName(name)
      → updates Firestore users/{uid}
      → updates auth displayName
      → updates store profile

    savePartnerName(name)
      → updates partnerName field
        in Firestore

    copyUserId()
      → copies store.state.user.uid
      → calls copyToClipboard()

    linkPartner()
      → reads #partner-id-input
      → validates not self-linking
      → checks partner doc exists
      → updates BOTH user docs
        with partnerId
      → sends notification to partner
      → loads partner profile + txns
      → re-renders

    unlinkPartner()
      → Modal.confirm()
      → clears partnerId on both accounts
      → clears store partnerProfile
        and partnerTxns
      → re-renders

    toggleNotification(key, value)
      → updates notifications.{key}
        field in Firestore

    setTheme(name)
      → ThemeManager.setTheme()
      → refreshes #theme-options HTML

    setAccent(name)
      → ThemeManager.setAccent()
      → refreshes #accent-options HTML

    setPartnerColor(type, name)
      → ThemeManager.setPartnerColors()
      → refreshes color option HTML

    setFontSize(size)
      → ThemeManager.setFontSize()

    showCurrencyPicker()
      → creates modal with currency list
      → all 16 currencies
      → active state on current

    setCurrency(code)
      → updates currency in Firestore
      → updates store profile
      → closes modal + re-renders

    showExportOptions()
      → Modal.sheet with:
        · Export as PDF
        · Export as CSV
        · Export as Excel

    showBackupOptions()
      → Modal.sheet with:
        · Create Backup
        · Restore from File

    editAvatar()
      → Toast.info (coming soon)

    clearData()
      → double Modal.confirm()
      → batch deletes all transactions
      → batch deletes all budgets
      → clears store state

    logout()
      → Modal.confirm()
      → store.stopListeners()
      → auth.signOut()
      → redirect to index.html

  WINDOW EXPORT:
    window.settingsPage
```

---

## Firebase Data Structure

```
Firestore Collections:

users/{uid}
  name:         string
  partnerName:  string
  email:        string
  photoURL:     string|null
  currency:     string (USD/EUR/...)
  theme:        string (dark/light/...)
  accentColor:  string (indigo/violet/...)
  youColor:     string
  herColor:     string
  partnerId:    string|null
  fcmToken:     string|null
  notifications:
    budgetAlert:   boolean
    partnerAdded:  boolean
    weeklyReport:  boolean
    monthlyReport: boolean
    dailyReminder: boolean
  createdAt:    timestamp

transactions/{id}
  userId:        string (uid)
  amount:        number
  category:      string (category.id)
  type:          string (expense/income)
  date:          string (YYYY-MM-DD)
  month:         string (YYYY-MM)
  paymentMethod: string (card/cash/...)
  description:   string
  tags:          string[]
  isRecurring:   boolean
  recurringId:   string|null
  createdAt:     timestamp
  updatedAt:     timestamp

budgets/{id}
  userId:    string
  category:  string (category.id)
  amount:    number
  month:     string (YYYY-MM)
  alertAt:   number (50/70/80/90/100)
  shared:    boolean
  createdAt: timestamp
  updatedAt: timestamp

recurring/{id}
  userId:        string
  amount:        number
  category:      string
  type:          string
  description:   string
  frequency:     string (daily/weekly/...)
  paymentMethod: string
  startDate:     string
  nextDate:      string (YYYY-MM-DD)
  endDate:       string|null
  lastAdded:     string|null
  isActive:      boolean
  createdAt:     timestamp

notifications/{id}
  toUserId:   string
  fromUserId: string|null
  type:       string (budget_alert/...)
  title:      string
  message:    string
  isRead:     boolean
  data:       object
  createdAt:  timestamp

reports/{id}
  userId:     string
  type:       string (monthly)
  month:      string
  sharedLink: string
  expiresAt:  timestamp
  data:       object
  createdAt:  timestamp
```

---

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read:  if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /transactions/{id} {
      allow create: if request.auth != null;
      allow update, delete:
        if request.auth.uid == resource.data.userId;
      allow read: if request.auth != null;
    }

    match /budgets/{id} {
      allow create: if request.auth != null;
      allow update, delete:
        if request.auth.uid == resource.data.userId;
      allow read: if request.auth != null;
    }

    match /recurring/{id} {
      allow create: if request.auth != null;
      allow update, delete:
        if request.auth.uid == resource.data.userId;
      allow read: if request.auth != null;
    }

    match /notifications/{id} {
      allow create: if request.auth != null;
      allow update:
        if request.auth.uid == resource.data.toUserId;
      allow delete:
        if request.auth.uid == resource.data.toUserId;
      allow read:
        if request.auth.uid == resource.data.toUserId;
    }

    match /reports/{id} {
      allow create: if request.auth != null;
      allow read:   if true;
      allow delete:
        if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## CDN Dependencies

```html
<!-- Firebase v9.22.2 (MUST be compat version) -->
firebase-app-compat.js
firebase-auth-compat.js
firebase-firestore-compat.js
firebase-storage-compat.js

<!-- Charts -->
chart.js v4.4.0

<!-- PDF Export -->
jspdf v2.5.1
jspdf-autotable v3.5.31

<!-- Excel Export -->
xlsx v0.18.5

<!-- Screenshot -->
html2canvas v1.4.1

<!-- Fonts (auto-loaded in global.css) -->
Google Fonts: Inter 400,500,600,700
```

---

## Common Issues & Fixes

```
PROBLEM: App shows blank after login
FIX: Check script load order in app.html
     firebase-config.js must be FIRST

PROBLEM: Firestore permission denied
FIX: Check security rules are published
     Check user is authenticated

PROBLEM: Theme not applying
FIX: Check variables.css loads before global.css
     Check THEMES object in firebase-config.js

PROBLEM: Charts not showing
FIX: Check Chart.js CDN loads before charts.js
     Check canvas element IDs match

PROBLEM: Partner not seeing transactions
FIX: Check partnerId set on BOTH user docs
     Check Firestore rules allow read

PROBLEM: Export PDF blank/error
FIX: Check jsPDF CDN loaded
     Check window.jspdf exists

PROBLEM: PWA not installing
FIX: Check manifest.json linked in HTML
     Check sw.js registered
     Check HTTPS (GitHub Pages is HTTPS)

PROBLEM: Offline not working
FIX: Check sw.js file exists at root
     Check STATIC_ASSETS paths correct
     Check cache name version

PROBLEM: Notifications not showing
FIX: Check browser supports Notification API
     Request permission first
     Check NOTIFICATIONS collection rules
```

---

## Part Reference Guide

```
PART 1: manifest.json
         js/core/firebase-config.js
         css/variables.css
         css/global.css

PART 2: index.html
         css/login.css
         js/core/auth.js

PART 3: app.html
         js/core/store.js
         js/core/router.js
         css/components.css

PART 4: js/ui/toast.js
         js/ui/modal.js
         js/ui/theme.js
         js/ui/components.js

PART 5: js/features/transactions.js
         js/pages/dashboard.js
         css/dashboard.css
         css/transactions.css

PART 6: js/pages/transactions-page.js
         js/features/compare.js
         css/compare.css
         css/analytics.css

PART 7: js/pages/settings.js
         js/features/budget.js
         css/budget.css
         css/settings.css

PART 8: js/features/export.js
         js/features/share.js
         js/features/backup.js
         sw.js

PART 9: js/ui/charts.js
         js/pages/analytics-page.js
         js/features/notifications.js
         js/features/recurring.js
```