# README.md

```markdown
# CoupleSpend - Finance Tracker PWA

> Track, compare and manage spending with your partner.
> Built with vanilla JavaScript, Firebase and Chart.js.

---

## Live Demo

```
https://yourusername.github.io/couplespend
```

---

## Screenshots

```
Login Page  →  Dashboard  →  Compare  →  Analytics
```

---

## Features

### Core
- Email & Password authentication
- Google Sign In
- Add / Edit / Delete transactions
- Income & expense tracking
- Category system (13 categories)
- Tags & payment method tracking
- Offline support (PWA)
- Installable on mobile home screen

### Partner System
- Link partner account via User ID
- View partner transactions (read only)
- Real-time sync between accounts
- Partner activity notifications

### Compare
- Side by side monthly spending
- Category breakdown comparison
- Who spent more indicator
- Split bar visualization
- Spending insights & analysis

### Analytics
- 6 month spending trend chart
- Category breakdown with bars
- Doughnut charts (you & partner)
- Payment method analysis
- Day of week spending pattern
- Period filter (1m / 3m / 6m / 1y)

### Budget
- Set budget per category per month
- Visual progress bars
- Alert at 50% / 70% / 80% / 90% / 100%
- Shared couple budgets
- Budget tips & warnings
- SVG donut overview chart

### Export
- PDF full report (2 pages)
- CSV raw data export
- Excel multi-sheet (.xlsx)
- Chart image export (.png)
- Custom date range

### Share
- Native Share API (mobile)
- WhatsApp quick share
- Email share with pre-filled body
- Copy summary to clipboard
- Generate shareable link (7 day expiry)

### Recurring Transactions
- Daily / Weekly / Biweekly / Monthly / Yearly
- Auto-add when due on app load
- Pause & resume
- Manage recurring list

### Notifications
- In-app notification center
- Budget alert notifications
- Partner activity alerts
- Mark read / clear all
- Local browser notifications

### Backup & Restore
- Export all data as JSON
- Restore from JSON backup
- Merge or replace mode
- Preview before restore

### Themes & Customization
- 5 themes: Dark, Light, AMOLED, Ocean, Rose
- 7 accent colors
- Custom "You" color (5 options)
- Custom "Partner" color (5 options)
- 3 font sizes: Small / Normal / Large
- 16 currency options

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript   |
| Database   | Firebase Firestore                |
| Auth       | Firebase Authentication           |
| Storage    | Firebase Storage                  |
| Charts     | Chart.js v4.4.0                   |
| PDF        | jsPDF v2.5.1 + AutoTable          |
| Excel      | SheetJS (XLSX) v0.18.5            |
| Screenshot | html2canvas v1.4.1                |
| Hosting    | GitHub Pages                      |
| PWA        | Service Worker + Web Manifest     |

---

## Project Structure

```
couplespend/
│
├── index.html              ← Login & Register page
├── app.html                ← Main app shell
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service worker
│
├── css/
│   ├── variables.css       ← CSS variables & themes
│   ├── global.css          ← Reset, utilities, components
│   ├── components.css      ← App shell, nav, modals
│   ├── login.css           ← Auth page styles
│   ├── dashboard.css       ← Dashboard page styles
│   ├── transactions.css    ← Transaction list styles
│   ├── compare.css         ← Compare page styles
│   ├── analytics.css       ← Analytics + theme options
│   ├── budget.css          ← Budget page styles
│   └── settings.css        ← Settings page styles
│
├── js/
│   ├── core/
│   │   ├── firebase-config.js  ← Firebase init + constants
│   │   ├── auth.js             ← Login/register logic
│   │   ├── store.js            ← App state manager
│   │   └── router.js           ← SPA page routing
│   │
│   ├── ui/
│   │   ├── toast.js            ← Toast notifications
│   │   ├── modal.js            ← Modal & sheet manager
│   │   ├── theme.js            ← Theme system
│   │   ├── components.js       ← SVG icons + UI builders
│   │   └── charts.js           ← Chart.js wrappers
│   │
│   ├── features/
│   │   ├── transactions.js     ← CRUD transactions
│   │   ├── compare.js          ← Compare page logic
│   │   ├── budget.js           ← Budget management
│   │   ├── export.js           ← PDF, CSV, Excel export
│   │   ├── share.js            ← Share features
│   │   ├── backup.js           ← Backup & restore
│   │   ├── notifications.js    ← Notifications system
│   │   └── recurring.js        ← Recurring transactions
│   │
│   └── pages/
│       ├── dashboard.js            ← Dashboard page
│       ├── transactions-page.js    ← Transactions list
│       ├── analytics-page.js       ← Analytics page
│       └── settings.js             ← Settings page
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

## Firebase Setup

### 1. Create Firebase Project

```
1. Go to console.firebase.google.com
2. Click "Add project"
3. Enter project name: couplespend
4. Enable Google Analytics (optional)
5. Click "Create project"
```

### 2. Register Web App

```
1. Click </> (Web) icon
2. App nickname: CoupleSpend Web
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the firebaseConfig object
```

### 3. Enable Authentication

```
1. Go to Authentication → Get started
2. Sign-in method tab
3. Enable: Email/Password
4. Enable: Google
5. Add authorized domain:
   yourusername.github.io
```

### 4. Create Firestore Database

```
1. Go to Firestore Database → Create database
2. Choose: Start in production mode
3. Select region closest to you
4. Click "Done"
```

### 5. Set Security Rules

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

### 6. Update Firebase Config

```javascript
// js/core/firebase-config.js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "YOUR_DATABASE_URL",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID"
};
```

---

## GitHub Pages Deployment

### 1. Create Repository

```bash
# Create new repo on github.com
# Name: couplespend (or any name)
# Visibility: Public (required for free Pages)
```

### 2. Push Code (SPCK Editor)

```
1. Open SPCK Editor
2. Open project folder
3. Tap Git icon
4. Initialize repository
5. Add remote:
   https://github.com/yourusername/couplespend.git
6. Stage all files
7. Commit: "Initial commit"
8. Push to main branch
```

### 3. Enable GitHub Pages

```
1. Go to repository on github.com
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main
5. Folder: / (root)
6. Click Save
7. Wait 2-5 minutes
8. URL will be:
   https://yourusername.github.io/couplespend
```

### 4. Add Domain to Firebase

```
1. Firebase Console
2. Authentication → Settings
3. Authorized domains
4. Add domain:
   yourusername.github.io
```

---

## Installation as PWA

### Android

```
1. Open Chrome
2. Go to your GitHub Pages URL
3. Tap menu (3 dots) → top right
4. Tap "Add to Home screen"
5. Tap "Add"
6. Icon appears on home screen
```

### iOS (Safari)

```
1. Open Safari
2. Go to your GitHub Pages URL
3. Tap Share button (box with arrow)
4. Scroll down → "Add to Home Screen"
5. Tap "Add"
6. Icon appears on home screen
```

---

## How to Link Partner Account

### Step 1 - You share your ID

```
1. Open app → Settings
2. Scroll to Partner section
3. Copy your User ID
4. Send to partner via WhatsApp/message
```

### Step 2 - Partner links

```
1. Partner opens app → Settings
2. Paste your User ID in "Partner's User ID"
3. Tap "Link" button
4. Both accounts are now connected
```

### Step 3 - Enjoy features

```
→ Compare page shows both spending
→ Dashboard shows partner total
→ Notifications for partner activity
→ Shared budget option available
```

---

## Categories

| ID            | Label          | Color     |
|---------------|----------------|-----------|
| food          | Food & Dining  | #f97316   |
| transport     | Transport      | #3b82f6   |
| shopping      | Shopping       | #a855f7   |
| entertainment | Entertainment  | #ec4899   |
| health        | Health         | #10b981   |
| education     | Education      | #06b6d4   |
| housing       | Housing        | #f59e0b   |
| utilities     | Utilities      | #64748b   |
| travel        | Travel         | #8b5cf6   |
| gifts         | Gifts          | #ef4444   |
| savings       | Savings        | #14b8a6   |
| income        | Income         | #22c55e   |
| other         | Other          | #94a3b8   |

---

## Supported Currencies

```
USD  EUR  GBP  JPY  INR
AUD  CAD  SGD  MYR  THB
PHP  IDR  KRW  CNY  BRL  MXN
```

---

## Themes

| Theme  | Background | Accent   |
|--------|------------|----------|
| Dark   | #0f172a    | #6366f1  |
| Light  | #f8fafc    | #6366f1  |
| AMOLED | #000000    | #6366f1  |
| Ocean  | #0c1a2e    | #64ffda  |
| Rose   | #1a0a0f    | #f43f5e  |

---

## CDN Links Used

```html
<!-- Firebase v9.22.2 -->
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-storage-compat.js"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- jsPDF -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>

<!-- SheetJS Excel -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<!-- html2canvas -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

---

## Common Issues & Fixes

### Blank screen after login

```
Cause:  Script load order wrong in app.html
Fix:    firebase-config.js must load first
        Check browser console for errors
```

### Permission denied errors

```
Cause:  Firestore security rules not published
        OR user not authenticated
Fix:    Publish rules in Firebase console
        Check auth state before Firestore calls
```

### Partner not visible

```
Cause:  partnerId not set on both user docs
Fix:    Both users must be linked
        Check users collection in Firebase console
        partnerId field must match partner's uid
```

### Theme not changing

```
Cause:  variables.css not loading before global.css
Fix:    Check link order in HTML head
        variables.css → global.css → other CSS
```

### Charts not rendering

```
Cause:  Chart.js CDN not loaded
        OR canvas element ID mismatch
Fix:    Check CDN script loads before charts.js
        Check canvas id matches JS reference
```

### Export PDF empty

```
Cause:  jsPDF CDN not loaded
Fix:    Check window.jspdf exists in console
        Check CDN links are correct
```

### PWA not installing

```
Cause:  Not on HTTPS
        OR manifest.json errors
        OR sw.js not registered
Fix:    GitHub Pages uses HTTPS automatically
        Validate manifest.json format
        Check sw.js path is correct (root)
```

### Offline not working

```
Cause:  Service worker not registered
        OR file paths wrong in STATIC_ASSETS
Fix:    Check sw.js is at project root
        Update STATIC_ASSETS list in sw.js
        Clear browser cache and reload
```

### Google Sign In popup blocked

```
Cause:  Browser blocking popups
Fix:    Allow popups for your domain
        Or use redirect method instead
```

---

## Firestore Indexes Required

```
Collection: transactions
Fields:     userId ASC, month ASC, date DESC
Type:       Composite

Collection: notifications  
Fields:     toUserId ASC, isRead ASC, createdAt DESC
Type:       Composite

Collection: budgets
Fields:     userId ASC, month ASC
Type:       Composite
```

```
Note: Firebase will show error links in
console when indexes are needed.
Click the link to auto-create them.
```

---

## Data Collections Reference

```
users/             → User profiles & settings
transactions/      → All income & expense records
budgets/           → Monthly spending limits
recurring/         → Automatic repeat transactions
notifications/     → In-app notification messages
reports/           → Shareable report links
```

---

## Environment

```
Node.js:     Not required (no build step)
Browser:     Chrome 90+ / Safari 14+ / Firefox 88+
Mobile:      Android 8+ / iOS 14+
Firebase:    v9.22.2 (compat mode)
Screen:      Optimized for 375px - 480px width
```

---

## File Load Order (Critical)

```
CSS (in <head>):
  1. css/variables.css
  2. css/global.css
  3. css/components.css
  4. css/login.css (index.html only)
  5. css/dashboard.css (app.html only)
  6. css/transactions.css
  7. css/compare.css
  8. css/analytics.css
  9. css/budget.css
  10. css/settings.css

JS (before </body>):
  1. Firebase CDN scripts (4 files)
  2. Chart.js CDN
  3. jsPDF CDN + AutoTable CDN
  4. XLSX CDN
  5. html2canvas CDN
  6. js/core/firebase-config.js
  7. js/core/store.js
  8. js/core/router.js
  9. js/ui/toast.js
  10. js/ui/modal.js
  11. js/ui/charts.js
  12. js/ui/components.js
  13. js/ui/theme.js
  14. js/features/transactions.js
  15. js/features/budget.js
  16. js/features/recurring.js
  17. js/features/compare.js
  18. js/features/notifications.js
  19. js/features/export.js
  20. js/features/share.js
  21. js/features/backup.js
  22. js/pages/dashboard.js
  23. js/pages/settings.js
  24. js/pages/transactions-page.js
  25. js/pages/analytics-page.js
  26. Inline auth + init script
```

---

## Version History

```
v1.0.0  →  Initial release
           Core transactions, compare,
           analytics, budget, export,
           share, backup, themes, PWA
```

---

## License

```
MIT License
Free to use, modify and distribute
```

---

## Built With

```
SPCK Editor    → Mobile code editor
Firebase       → Backend & database
GitHub Pages   → Free hosting
Chart.js       → Data visualization
jsPDF          → PDF generation
SheetJS        → Excel generation
```

---

*CoupleSpend - Track together, save together*
```