// ─────────────────────────────────────────
//  Firebase Configuration
//  CoupleSpend App
// ─────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyAB6Dgzgyv49Rm5FBg7pYAXvRZWj8F8tDw",
  authDomain: "couplespend-620d1.firebaseapp.com",
  databaseURL: "https://couplespend-620d1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "couplespend-620d1",
  storageBucket: "couplespend-620d1.firebasestorage.app",
  messagingSenderId: "850758074918",
  appId: "1:850758074918:web:5028ec08474ea1f7485ce7",
  measurementId: "G-J939N5K3P1"
};

// ── Initialize Firebase ──────────────────
firebase.initializeApp(firebaseConfig);

// ── Service References ───────────────────
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ── Enable Offline Persistence ───────────
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence: not supported');
    }
  });

// ── Collection References ────────────────
const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  RECURRING: 'recurring',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  COUPLE: 'couple'
};

// ── App Constants ────────────────────────
const APP_CONFIG = {
  version: '1.0.0',
  name: 'CoupleSpend',
  defaultCurrency: 'USD',
  defaultTheme: 'dark',
  maxReceiptSize: 5 * 1024 * 1024,
  reportExpireDays: 7,
  cacheDuration: 60 * 60 * 1000
};

// ── Categories ───────────────────────────
const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#f97316', icon: 'food' },
  { id: 'transport', label: 'Transport', color: '#3b82f6', icon: 'transport' },
  { id: 'shopping', label: 'Shopping', color: '#a855f7', icon: 'shopping' },
  { id: 'entertainment', label: 'Entertainment', color: '#ec4899', icon: 'entertainment' },
  { id: 'health', label: 'Health', color: '#10b981', icon: 'health' },
  { id: 'education', label: 'Education', color: '#06b6d4', icon: 'education' },
  { id: 'housing', label: 'Housing', color: '#f59e0b', icon: 'housing' },
  { id: 'utilities', label: 'Utilities', color: '#64748b', icon: 'utilities' },
  { id: 'travel', label: 'Travel', color: '#8b5cf6', icon: 'travel' },
  { id: 'gifts', label: 'Gifts', color: '#ef4444', icon: 'gifts' },
  { id: 'savings', label: 'Savings', color: '#14b8a6', icon: 'savings' },
  { id: 'income', label: 'Income', color: '#22c55e', icon: 'income' },
  { id: 'other', label: 'Other', color: '#94a3b8', icon: 'other' }
];

// ── Theme Presets ────────────────────────
const THEMES = {
  dark: {
    name: 'Dark',
    '--bg-base': '#0f172a',
    '--bg-card': '#1e293b',
    '--bg-input': '#334155',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#94a3b8',
    '--text-muted': '#64748b',
    '--border': '#334155',
    '--accent': '#6366f1',
    '--accent-hover': '#4f46e5',
    '--you-color': '#6366f1',
    '--her-color': '#ec4899',
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--danger': '#ef4444',
    '--shadow': '0 4px 24px rgba(0,0,0,0.4)'
  },
  light: {
    name: 'Light',
    '--bg-base': '#f8fafc',
    '--bg-card': '#ffffff',
    '--bg-input': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-muted': '#94a3b8',
    '--border': '#e2e8f0',
    '--accent': '#6366f1',
    '--accent-hover': '#4f46e5',
    '--you-color': '#6366f1',
    '--her-color': '#ec4899',
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--danger': '#ef4444',
    '--shadow': '0 4px 24px rgba(0,0,0,0.08)'
  },
  amoled: {
    name: 'AMOLED',
    '--bg-base': '#000000',
    '--bg-card': '#0a0a0a',
    '--bg-input': '#1a1a1a',
    '--text-primary': '#ffffff',
    '--text-secondary': '#a0a0a0',
    '--text-muted': '#606060',
    '--border': '#1a1a1a',
    '--accent': '#6366f1',
    '--accent-hover': '#4f46e5',
    '--you-color': '#818cf8',
    '--her-color': '#f472b6',
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--danger': '#ef4444',
    '--shadow': '0 4px 24px rgba(0,0,0,0.8)'
  },
  ocean: {
    name: 'Ocean',
    '--bg-base': '#0c1a2e',
    '--bg-card': '#112240',
    '--bg-input': '#1d3461',
    '--text-primary': '#ccd6f6',
    '--text-secondary': '#8892b0',
    '--text-muted': '#4a5568',
    '--border': '#1d3461',
    '--accent': '#64ffda',
    '--accent-hover': '#00d4aa',
    '--you-color': '#64ffda',
    '--her-color': '#ff79c6',
    '--success': '#64ffda',
    '--warning': '#f1fa8c',
    '--danger': '#ff5555',
    '--shadow': '0 4px 24px rgba(0,0,0,0.5)'
  },
  rose: {
    name: 'Rose',
    '--bg-base': '#1a0a0f',
    '--bg-card': '#2d1018',
    '--bg-input': '#3d1520',
    '--text-primary': '#fce7f3',
    '--text-secondary': '#f9a8d4',
    '--text-muted': '#9f6b7e',
    '--border': '#3d1520',
    '--accent': '#f43f5e',
    '--accent-hover': '#e11d48',
    '--you-color': '#a78bfa',
    '--her-color': '#f43f5e',
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--danger': '#ef4444',
    '--shadow': '0 4px 24px rgba(0,0,0,0.5)'
  }
};

// ── Currency List ────────────────────────
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' }
];

// ── Window Exports ───────────────────────
window.db = db;
window.auth = auth;
window.storage = storage;
window.COLLECTIONS = COLLECTIONS;
window.APP_CONFIG = APP_CONFIG;
window.CATEGORIES = CATEGORIES;
window.THEMES = THEMES;
window.CURRENCIES = CURRENCIES;