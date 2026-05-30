// ─────────────────────────────────────────
//  SVG Icons & UI Component Helpers
//  CoupleSpend App
// ─────────────────────────────────────────

// ── SVG Icon Library ──────────────────────
const Icons = {

  // ── Navigation ─────────────────────────
  dashboard: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`,

  transactions: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>`,

  compare: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>`,

  analytics: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 21H4.6A1.6 1.6 0 0 1 3 19.4V3"/>
      <path d="m7 14 4-4 4 4 4-4"/>
    </svg>`,

  settings: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1
        0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33
        1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0
        0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0
        2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65
        0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65
        1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1
        2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51
        V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0
        1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06
        A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0
        1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`,

  notifications: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>`,

  // ── Actions ────────────────────────────
  add: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5"  x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>`,

  edit: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`,

  delete: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`,

  close: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>`,

  back: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>`,

  chevronRight: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>`,

  chevronDown: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>`,

  check: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,

  // ── Categories ─────────────────────────
  food: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6"  y1="1" x2="6"  y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>`,

  transport: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5"  cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>`,

  shopping: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`,

  entertainment: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>`,

  health: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>`,

  education: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`,

  housing: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`,

  utilities: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83
        M16.95 16.95l2.83 2.83M1 12h4M19 12h4
        M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>`,

  travel: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0
        1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0
        1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361
        1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6
        l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2
        2 0 0 1 22 16.92z"/>
    </svg>`,

  gifts: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5" rx="1"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>`,

  savings: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11
        5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2
        v-4h-2c0-1-.5-1.5-1-2z"/>
      <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
      <circle cx="16.5" cy="10.5" r=".5" fill="currentColor"/>
    </svg>`,

  income: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>`,

  other: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8"  x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,

  // ── Finance ────────────────────────────
  wallet: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16
        a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3H8L6 7h12l-2-4z"/>
      <circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/>
    </svg>`,

  currency: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3
        a1.5 1.5 0 0 0 0 3H15"/>
    </svg>`,

  trending_up: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>`,

  trending_down: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>`,

  // ── Export / Share ─────────────────────
  download: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`,

  share: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5"  r="3"/>
      <circle cx="6"  cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49"/>
    </svg>`,

  export: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12
        a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9"  y1="15" x2="15" y2="15"/>
    </svg>`,

  copy: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9
        a2 2 0 0 1 2 2v1"/>
    </svg>`,

  // ── User ───────────────────────────────
  user: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>`,

  users: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,

  link: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07
        l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07
        7.07l1.71-1.71"/>
    </svg>`,

  logout: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>`,

  // ── Misc ───────────────────────────────
  calendar: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2"  x2="16" y2="6"/>
      <line x1="8"  y1="2"  x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>`,

  filter: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>`,

  search: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>`,

  refresh: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>`,

  info: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8"  x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,

  warning: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71
        3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9"  x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,

  budget: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,

  recurring: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10
        M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>`,

  backup: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>`,

  palette: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13.5" cy="6.5"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="8.5"  cy="7.5"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="6.5"  cy="12.5" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0
        1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125
        -.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1
        1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554
        C21.965 6.012 17.461 2 12 2z"/>
    </svg>`
};

// ── Get icon SVG ───────────────────────────
function getIcon(name, size = 'md') {
  const svg = Icons[name] || Icons.other;
  // Replace default stroke-width based on size
  return `<span class="icon icon-${size}">${svg}</span>`;
}

// ── Build category grid ────────────────────
function buildCategoryGrid(selectedId = null) {
  const grid = document.getElementById('category-grid');
  if (!grid) return;

  grid.innerHTML = CATEGORIES.map(cat => `
    <button
      type="button"
      class="category-item ${selectedId === cat.id ? 'selected' : ''}"
      onclick="selectCategory('${cat.id}')"
      data-cat-id="${cat.id}"
      style="--cat-color: ${cat.color}"
    >
      <div class="category-icon"
        style="color: ${cat.color}; background: ${cat.color}18"
      >
        ${Icons[cat.icon] || Icons.other}
      </div>
      <span class="category-label">${cat.label}</span>
    </button>
  `).join('');
}

// ── Selected category ──────────────────────
let selectedCategory = null;

function selectCategory(catId) {
  selectedCategory = catId;

  // Update UI
  document.querySelectorAll('.category-item').forEach(item => {
    const id = item.getAttribute('data-cat-id');
    item.classList.toggle('selected', id === catId);
  });
}

function getSelectedCategory() {
  return selectedCategory;
}

// ── Build transaction item ─────────────────
function buildTransactionItem(tx, showOwner = false) {
  const cat    = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES.at(-1);
  const symbol = store.getCurrencySymbol();
  const isExp  = tx.type === 'expense';
  const date   = formatDate(tx.date);
  const owner  = showOwner
    ? (tx.userId === store.state.user?.uid
        ? store.state.profile?.name || 'You'
        : store.state.partnerProfile?.name || 'Partner')
    : null;

  return `
    <div
      class="tx-item"
      onclick="showTransactionDetail('${tx.id}')"
      data-tx-id="${tx.id}"
    >
      <div class="tx-icon"
        style="
          color: ${cat.color};
          background: ${cat.color}18;
        "
      >
        ${Icons[cat.icon] || Icons.other}
      </div>
      <div class="tx-info">
        <div class="tx-name truncate">
          ${tx.description || cat.label}
        </div>
        <div class="tx-meta">
          ${date}
          ${tx.paymentMethod ? ` · ${capitalise(tx.paymentMethod)}` : ''}
          ${owner ? ` · <span style="color:${
            tx.userId === store.state.user?.uid
              ? 'var(--you-color)'
              : 'var(--her-color)'
          }">${owner}</span>` : ''}
        </div>
      </div>
      <div class="tx-amount ${isExp ? 'expense' : 'income'}">
        ${isExp ? '-' : '+'}${symbol}${Number(tx.amount).toFixed(2)}
      </div>
    </div>
  `;
}

// ── Build month picker ─────────────────────
function buildMonthPicker(currentMonth, onPrev, onNext) {
  return `
    <div class="month-picker">
      <button class="month-nav-btn" onclick="(${onPrev})()" aria-label="Previous month">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span class="month-picker-label">
        ${store.formatMonth(currentMonth)}
      </span>
      <button class="month-nav-btn" onclick="(${onNext})()" aria-label="Next month">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  `;
}

// ── Build empty state ──────────────────────
function buildEmptyState(iconName, title, desc, actionLabel = '', actionFn = '') {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        ${Icons[iconName] || Icons.info}
      </div>
      <div class="empty-state-title">${title}</div>
      ${desc ? `<p class="empty-state-desc">${desc}</p>` : ''}
      ${actionLabel
        ? `<button class="btn btn-primary" onclick="${actionFn}">
             ${actionLabel}
           </button>`
        : ''
      }
    </div>
  `;
}

// ── Format date ────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Today';
  }
  if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric'
  });
}

// ── Get today's date string ────────────────
function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// ── Capitalise first letter ────────────────
function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Group transactions by date ─────────────
function groupByDate(transactions) {
  const groups = {};
  transactions.forEach(tx => {
    const key = tx.date || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return groups;
}

// ── Count up animation ─────────────────────
function animateCount(el, from, to, duration = 800, prefix = '', suffix = '') {
  if (!el) return;
  const start   = performance.now();
  const range   = to - from;

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = from + (range * eased);
    el.textContent = prefix + value.toFixed(2) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ── Debounce ───────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Copy to clipboard ──────────────────────
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    Toast.success('Copied', 'Text copied to clipboard');
    return true;
  } catch (err) {
    Toast.error('Failed', 'Could not copy to clipboard');
    return false;
  }
}

// ── Expose globally ────────────────────────
window.Icons                = Icons;
window.getIcon              = getIcon;
window.buildCategoryGrid    = buildCategoryGrid;
window.selectCategory       = selectCategory;
window.getSelectedCategory  = getSelectedCategory;
window.buildTransactionItem = buildTransactionItem;
window.buildMonthPicker     = buildMonthPicker;
window.buildEmptyState      = buildEmptyState;
window.formatDate           = formatDate;
window.getTodayStr          = getTodayStr;
window.capitalise           = capitalise;
window.groupByDate          = groupByDate;
window.animateCount         = animateCount;
window.debounce             = debounce;
window.copyToClipboard      = copyToClipboard;