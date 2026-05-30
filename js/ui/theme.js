// ─────────────────────────────────────────
//  Theme Manager
//  CoupleSpend App
// ─────────────────────────────────────────

const ThemeManager = (() => {

  // ── Storage keys ────────────────────────
  const KEYS = {
    THEME:   'cs_theme',
    ACCENT:  'cs_accent',
    YOU:     'cs_you_color',
    HER:     'cs_her_color',
    FONT:    'cs_font_size'
  };

  // ── Current state ────────────────────────
  let current = {
    theme:    'dark',
    accent:   'indigo',
    youColor: 'indigo',
    herColor: 'pink',
    fontSize: 'normal'
  };

  // ── Initialize ───────────────────────────
  function init(profileData = {}) {
    current.theme    = profileData.theme      || localStorage.getItem(KEYS.THEME)   || 'dark';
    current.accent   = profileData.accentColor || localStorage.getItem(KEYS.ACCENT)  || 'indigo';
    current.youColor = profileData.youColor    || localStorage.getItem(KEYS.YOU)     || 'indigo';
    current.herColor = profileData.herColor    || localStorage.getItem(KEYS.HER)     || 'pink';
    current.fontSize = localStorage.getItem(KEYS.FONT) || 'normal';

    applyAll();
  }

  // ── Apply all settings ───────────────────
  function applyAll() {
    applyTheme(current.theme);
    applyAccent(current.accent);
    applyPartnerColors(current.youColor, current.herColor);
    applyFontSize(current.fontSize);
  }

  // ── Apply theme ──────────────────────────
  function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    current.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);

    // Apply CSS variables
    Object.entries(theme).forEach(([key, val]) => {
      if (key.startsWith('--')) {
        document.documentElement.style.setProperty(key, val);
      }
    });

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme['--bg-base'] || '#0f172a');
    }

    localStorage.setItem(KEYS.THEME, themeName);
  }

  // ── Apply accent color ───────────────────
  function applyAccent(accentName) {
    current.accent = accentName;
    document.documentElement.setAttribute('data-accent', accentName);
    localStorage.setItem(KEYS.ACCENT, accentName);
  }

  // ── Apply partner colors ─────────────────
  function applyPartnerColors(youColor, herColor) {
    current.youColor = youColor;
    current.herColor = herColor;

    document.documentElement.setAttribute('data-you', youColor);
    document.documentElement.setAttribute('data-her', herColor);

    localStorage.setItem(KEYS.YOU, youColor);
    localStorage.setItem(KEYS.HER, herColor);
  }

  // ── Apply font size ──────────────────────
  function applyFontSize(size) {
    current.fontSize = size;
    const sizes = {
      small:  '14px',
      normal: '16px',
      large:  '18px'
    };
    document.documentElement.style.fontSize = sizes[size] || '16px';
    localStorage.setItem(KEYS.FONT, size);
  }

  // ── Save to Firebase ─────────────────────
  async function saveToProfile() {
    const uid = store.state.user?.uid;
    if (!uid) return;

    try {
      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        theme:       current.theme,
        accentColor: current.accent,
        youColor:    current.youColor,
        herColor:    current.herColor
      });

      store.updateProfile({
        theme:       current.theme,
        accentColor: current.accent,
        youColor:    current.youColor,
        herColor:    current.herColor
      });

    } catch (err) {
      console.error('Save theme error:', err);
    }
  }

  // ── Set theme + save ─────────────────────
  async function setTheme(themeName) {
    applyTheme(themeName);
    await saveToProfile();
  }

  // ── Set accent + save ────────────────────
  async function setAccent(accentName) {
    applyAccent(accentName);
    await saveToProfile();
  }

  // ── Set partner colors + save ────────────
  async function setPartnerColors(youColor, herColor) {
    applyPartnerColors(youColor, herColor);
    await saveToProfile();
  }

  // ── Set font size ────────────────────────
  function setFontSize(size) {
    applyFontSize(size);
  }

  // ── Get current settings ─────────────────
  function getCurrent() {
    return { ...current };
  }

  // ── Build theme preview HTML ─────────────
  function buildThemeOptions() {
    return Object.entries(THEMES).map(([key, theme]) => `
      <button
        class="theme-option ${current.theme === key ? 'active' : ''}"
        onclick="ThemeManager.setTheme('${key}')"
        title="${theme.name}"
        data-theme-key="${key}"
      >
        <div class="theme-preview" style="
          background: ${theme['--bg-card']};
          border: 2px solid ${current.theme === key
            ? theme['--accent']
            : theme['--border']
          };
        ">
          <div class="theme-preview-bar" style="
            background: ${theme['--accent']};
          "></div>
          <div class="theme-preview-lines">
            <div style="background: ${theme['--text-primary']}; opacity:0.8"></div>
            <div style="background: ${theme['--text-secondary']}; opacity:0.5"></div>
          </div>
        </div>
        <span class="theme-option-label">${theme.name}</span>
      </button>
    `).join('');
  }

  // ── Build accent options ──────────────────
  const ACCENT_OPTIONS = [
    { name: 'indigo',  color: '#6366f1', label: 'Indigo'  },
    { name: 'violet',  color: '#8b5cf6', label: 'Violet'  },
    { name: 'pink',    color: '#ec4899', label: 'Pink'    },
    { name: 'cyan',    color: '#06b6d4', label: 'Cyan'    },
    { name: 'emerald', color: '#10b981', label: 'Emerald' },
    { name: 'rose',    color: '#f43f5e', label: 'Rose'    },
    { name: 'amber',   color: '#f59e0b', label: 'Amber'   }
  ];

  function buildAccentOptions() {
    return ACCENT_OPTIONS.map(opt => `
      <button
        class="accent-option ${current.accent === opt.name ? 'active' : ''}"
        onclick="ThemeManager.setAccent('${opt.name}')"
        title="${opt.label}"
        style="--opt-color: ${opt.color}"
        data-accent-key="${opt.name}"
      >
        <div class="accent-dot" style="background: ${opt.color}">
          ${current.accent === opt.name
            ? `<svg viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
               ><polyline points="20 6 9 17 4 12"/></svg>`
            : ''
          }
        </div>
        <span>${opt.label}</span>
      </button>
    `).join('');
  }

  // ── Expose ────────────────────────────────
  return {
    init,
    setTheme,
    setAccent,
    setPartnerColors,
    setFontSize,
    getCurrent,
    applyTheme,
    applyAccent,
    buildThemeOptions,
    buildAccentOptions,
    ACCENT_OPTIONS
  };

})();

// ── Global helpers ────────────────────────
function applyTheme(name)  { ThemeManager.applyTheme(name); }
function applyAccent(name) { ThemeManager.applyAccent(name); }

window.ThemeManager = ThemeManager;
window.applyTheme   = applyTheme;
window.applyAccent  = applyAccent;