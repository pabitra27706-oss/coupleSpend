// ─────────────────────────────────────────
//  Share Manager
//  CoupleSpend App
// ─────────────────────────────────────────

const ShareManager = (() => {

  // ── Build share text ───────────────────────
  function buildShareText(type = 'monthly') {
    const profile  = store.state.profile;
    const partner  = store.state.partnerProfile;
    const myTxns   = store.state.transactions;
    const herTxns  = store.state.partnerTxns;
    const month    = store.state.currentMonth;
    const symbol   = store.getCurrencySymbol();

    const mySpend   = store.getTotalSpend(myTxns);
    const herSpend  = store.getTotalSpend(herTxns);
    const myIncome  = store.getTotalIncome(myTxns);
    const myCat     = store.getSpendByCategory(myTxns);

    // Top 3 categories
    const topCats = Object.entries(myCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, amt]) => {
        const cat = CATEGORIES.find(c => c.id === id);
        return `  ${cat?.label || id}: ${symbol}${amt.toFixed(2)}`;
      })
      .join('\n');

    const monthLabel = store.formatMonth(month);
    const myName     = profile?.name       || 'Me';
    const herName    = partner?.name       || profile?.partnerName || 'Partner';

    if (type === 'summary') {
      return `CoupleSpend - ${monthLabel}\n\n${myName}: ${symbol}${mySpend.toFixed(2)}\n${herName}: ${symbol}${herSpend.toFixed(2)}\nCombined: ${symbol}${(mySpend + herSpend).toFixed(2)}\n\nTracked with CoupleSpend`;
    }

    return `CoupleSpend Monthly Report\n${monthLabel}\n${'─'.repeat(30)}\n\n${myName}\n  Expenses: ${symbol}${mySpend.toFixed(2)}\n  Income:   ${symbol}${myIncome.toFixed(2)}\n\n${herName}\n  Expenses: ${symbol}${herSpend.toFixed(2)}\n\nTop Categories:\n${topCats || '  No data'}\n\nCombined: ${symbol}${(mySpend + herSpend).toFixed(2)}\n${'─'.repeat(30)}\nTracked with CoupleSpend App`;
  }

  // ── Native Share API ───────────────────────
  async function shareNative(type = 'monthly') {
    const text = buildShareText(type);

    if (!navigator.share) {
      // Fallback to copy
      await copyToClipboard(text);
      return;
    }

    try {
      await navigator.share({
        title: 'CoupleSpend Report',
        text
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        Toast.error('Share failed', 'Could not open share menu');
      }
    }
  }

  // ── Share with file ────────────────────────
  async function shareWithFile(type = 'pdf') {
    if (!navigator.share) {
      Toast.info('Not supported', 'Native share not available');
      return;
    }

    try {
      Toast.info('Preparing', 'Getting file ready...');

      // For now share text only
      // File sharing requires more complex handling
      await shareNative('monthly');

    } catch (err) {
      console.error('Share file error:', err);
    }
  }

  // ── Share via WhatsApp ─────────────────────
  function shareWhatsApp(type = 'summary') {
    const text = buildShareText(type);
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  }

  // ── Share via Email ────────────────────────
  function shareEmail() {
    const month   = store.state.currentMonth;
    const subject = encodeURIComponent(
      `CoupleSpend Report - ${store.formatMonth(month)}`
    );
    const body    = encodeURIComponent(buildShareText('monthly'));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // ── Copy summary ───────────────────────────
  async function copySummary(type = 'monthly') {
    const text = buildShareText(type);
    await copyToClipboard(text);
  }

  // ── Generate shareable link ────────────────
  async function generateShareLink() {
    Toast.info('Generating', 'Creating share link...');

    try {
      const uid    = store.state.user?.uid;
      const month  = store.state.currentMonth;

      // Create report doc in Firestore
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + APP_CONFIG.reportExpireDays);

      const reportRef = await db.collection(COLLECTIONS.REPORTS).add({
        userId:     uid,
        type:       'monthly',
        month,
        expiresAt:  firebase.firestore.Timestamp.fromDate(expiry),
        createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        data: {
          mySpend:   store.getTotalSpend(store.state.transactions),
          herSpend:  store.getTotalSpend(store.state.partnerTxns),
          month
        }
      });

      // Build link
      const baseUrl = window.location.origin;
      const link    = `${baseUrl}/report.html?id=${reportRef.id}`;

      await copyToClipboard(link);
      Toast.success(
        'Link copied',
        `Expires in ${APP_CONFIG.reportExpireDays} days`
      );

      return link;

    } catch (err) {
      console.error('Generate link error:', err);
      Toast.error('Failed', 'Could not generate share link');
      return null;
    }
  }

  // ── Show share options sheet ───────────────
  function showShareOptions() {
    Modal.sheet({
      id:    'modal-share',
      title: 'Share Report',
      items: [
        {
          label:  'Share via Apps',
          icon:   `<div class="sheet-item-icon">${Icons.share}</div>`,
          action: () => shareNative('monthly')
        },
        {
          label:  'Share on WhatsApp',
          icon:   `<div class="sheet-item-icon" style="background:rgba(37,211,102,0.1);color:#25D366">
                     <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                     </svg>
                   </div>`,
          action: () => shareWhatsApp('summary')
        },
        {
          label:  'Share via Email',
          icon:   `<div class="sheet-item-icon">${Icons.transactions}</div>`,
          action: () => shareEmail()
        },
        {
          label:  'Copy Summary Text',
          icon:   `<div class="sheet-item-icon">${Icons.copy}</div>`,
          action: () => copySummary('summary')
        },
        {
          label:  'Copy Full Report',
          icon:   `<div class="sheet-item-icon">${Icons.copy}</div>`,
          action: () => copySummary('monthly')
        },
        {
          label:  'Generate Share Link',
          icon:   `<div class="sheet-item-icon">${Icons.link}</div>`,
          action: () => generateShareLink()
        }
      ]
    });
  }

  // ── Expose ────────────────────────────────
  return {
    shareNative,
    shareWithFile,
    shareWhatsApp,
    shareEmail,
    copySummary,
    generateShareLink,
    showShareOptions,
    buildShareText
  };

})();

window.ShareManager = ShareManager;