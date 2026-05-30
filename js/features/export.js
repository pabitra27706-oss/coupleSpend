// ─────────────────────────────────────────
//  Export Manager
//  PDF, CSV, Excel
//  CoupleSpend App
// ─────────────────────────────────────────

const ExportManager = (() => {

  // ── Helpers ───────────────────────────────
  function getExportData() {
    const profile     = store.state.profile;
    const partner     = store.state.partnerProfile;
    const myTxns      = store.state.transactions;
    const partnerTxns = store.state.partnerTxns;
    const budgets     = store.state.budgets;
    const month       = store.state.currentMonth;
    const symbol      = store.getCurrencySymbol();

    const mySpend     = store.getTotalSpend(myTxns);
    const myIncome    = store.getTotalIncome(myTxns);
    const herSpend    = store.getTotalSpend(partnerTxns);
    const herIncome   = store.getTotalIncome(partnerTxns);
    const myCatSpend  = store.getSpendByCategory(myTxns);
    const herCatSpend = store.getSpendByCategory(partnerTxns);

    return {
      profile,
      partner,
      myTxns,
      partnerTxns,
      budgets,
      month,
      symbol,
      mySpend,
      myIncome,
      herSpend,
      herIncome,
      myCatSpend,
      herCatSpend,
      generatedAt: new Date().toLocaleDateString('en-US', {
        year:  'numeric',
        month: 'long',
        day:   'numeric'
      })
    };
  }

  function formatTxDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'short',
      day:   'numeric'
    });
  }

  function getCatLabel(catId) {
    return CATEGORIES.find(c => c.id === catId)?.label || catId;
  }

  // ── Lighten color for background ──────────
  function lightenColor(rgb) {
    return [
      Math.min(rgb[0] + 180, 255),
      Math.min(rgb[1] + 180, 255),
      Math.min(rgb[2] + 180, 255)
    ];
  }

  // ── Export PDF ────────────────────────────
  async function exportPDF() {
    Toast.show('info', 'Generating', 'Creating PDF report...');

    try {
      if (!window.jspdf) {
        Toast.show('error', 'Missing', 'PDF library not loaded');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
      const data = getExportData();
      const {
        profile, partner,
        myTxns, partnerTxns,
        mySpend, myIncome,
        herSpend, herIncome,
        myCatSpend, herCatSpend,
        symbol, month, generatedAt
      } = data;

      const pageW  = doc.internal.pageSize.getWidth();
      const margin = 14;
      let   y      = margin;

      // ── Text helper ──────────────────────
      const addText = (text, x, yPos, opts = {}) => {
        doc.setFontSize(opts.size  || 10);
        doc.setFont('helvetica', opts.style || 'normal');
        doc.setTextColor(...(opts.color || [30, 30, 30]));
        doc.text(String(text), x, yPos,
          opts.align ? { align: opts.align } : {}
        );
      };

      // ── Line helper ──────────────────────
      const addLine = (yPos, color = [220, 220, 220]) => {
        doc.setDrawColor(...color);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageW - margin, yPos);
      };

      // ── Page check helper ────────────────
      const checkPage = (needed = 20) => {
        if (y + needed > 270) {
          doc.addPage();
          y = margin;
        }
      };

      // ── HEADER ───────────────────────────
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(
        margin, y, pageW - margin * 2, 28, 4, 4, 'F'
      );

      addText('CoupleSpend', margin + 4, y + 10, {
        size: 16, style: 'bold', color: [255, 255, 255]
      });
      addText('Finance Report', margin + 4, y + 18, {
        size: 9, color: [200, 200, 255]
      });
      addText(
        store.formatMonth(month),
        pageW - margin - 4, y + 10,
        { size: 12, style: 'bold', color: [255,255,255], align: 'right' }
      );
      addText(
        `Generated: ${generatedAt}`,
        pageW - margin - 4, y + 18,
        { size: 8, color: [200, 200, 255], align: 'right' }
      );
      y += 36;

      // ── SUMMARY ──────────────────────────
      addText('Summary', margin, y, {
        size: 13, style: 'bold'
      });
      y += 8;
      addLine(y);
      y += 6;

      const boxW = (pageW - margin * 2 - 6) / 2;

      const boxes = [
        {
          label:  profile?.name || 'You',
          spend:  `${symbol}${mySpend.toFixed(2)}`,
          income: `${symbol}${myIncome.toFixed(2)}`,
          color:  [99, 102, 241]
        },
        {
          label:  partner?.name
                  || profile?.partnerName
                  || 'Partner',
          spend:  `${symbol}${herSpend.toFixed(2)}`,
          income: `${symbol}${herIncome.toFixed(2)}`,
          color:  [236, 72, 153]
        }
      ];

      boxes.forEach((box, i) => {
        const bx = margin + i * (boxW + 6);

        // Light background
        const lightColor = lightenColor(box.color);
        doc.setFillColor(...lightColor);
        doc.roundedRect(bx, y, boxW, 30, 3, 3, 'F');

        // Colored border
        doc.setDrawColor(...box.color);
        doc.setLineWidth(0.5);
        doc.roundedRect(bx, y, boxW, 30, 3, 3, 'S');

        // Left accent bar
        doc.setFillColor(...box.color);
        doc.roundedRect(bx, y, 3, 30, 1, 1, 'F');

        addText(box.label, bx + 6, y + 8, {
          size: 9, style: 'bold', color: box.color
        });
        addText('Total Expenses', bx + 6, y + 15, {
          size: 7, color: [120, 120, 120]
        });
        addText(box.spend, bx + 6, y + 23, {
          size: 12, style: 'bold', color: [30, 30, 30]
        });
        addText(
          `Income: ${box.income}`,
          bx + boxW - 4, y + 23,
          { size: 7, color: [16, 185, 129], align: 'right' }
        );
      });
      y += 38;

      // Combined row
      const diff    = mySpend - herSpend;
      const whoMore = diff > 0
        ? `${partner?.name || 'Partner'} saved more`
        : diff < 0
        ? `${profile?.name || 'You'} saved more`
        : 'Equal spending';

      addText(
        `Combined: ${symbol}${(mySpend + herSpend).toFixed(2)}`
        + `   ·   Difference: ${symbol}${Math.abs(diff).toFixed(2)}`
        + `   ·   ${whoMore}`,
        margin, y,
        { size: 8, color: [100, 100, 100] }
      );
      y += 14;

      // ── CATEGORY BREAKDOWN ────────────────
      checkPage(60);
      addText('Category Breakdown', margin, y, {
        size: 13, style: 'bold'
      });
      y += 8;
      addLine(y);
      y += 6;

      const cols = {
        cat:   margin,
        you:   margin + 75,
        her:   margin + 115,
        total: margin + 155
      };

      // Table header background
      doc.setFillColor(245, 245, 250);
      doc.rect(margin, y - 3, pageW - margin * 2, 10, 'F');

      addText('Category', cols.cat, y + 4, {
        size: 8, style: 'bold', color: [80, 80, 80]
      });
      addText(
        profile?.name || 'You',
        cols.you, y + 4,
        { size: 8, style: 'bold', color: [99, 102, 241] }
      );
      addText(
        partner?.name || 'Partner',
        cols.her, y + 4,
        { size: 8, style: 'bold', color: [236, 72, 153] }
      );
      addText('Total', cols.total, y + 4, {
        size: 8, style: 'bold', color: [80, 80, 80]
      });
      y += 12;

      // All categories merged
      const allCats = new Set([
        ...Object.keys(myCatSpend),
        ...Object.keys(herCatSpend)
      ]);

      [...allCats]
        .sort((a, b) => {
          const ta = (myCatSpend[a] || 0) + (herCatSpend[a] || 0);
          const tb = (myCatSpend[b] || 0) + (herCatSpend[b] || 0);
          return tb - ta;
        })
        .forEach((catId, idx) => {
          checkPage(10);

          const myAmt  = myCatSpend[catId]  || 0;
          const herAmt = herCatSpend[catId] || 0;
          const total  = myAmt + herAmt;

          // Zebra stripe
          if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 252);
            doc.rect(
              margin, y - 3,
              pageW - margin * 2, 9, 'F'
            );
          }

          addText(getCatLabel(catId), cols.cat, y + 3, {
            size: 8, color: [40, 40, 40]
          });
          addText(
            myAmt > 0
              ? `${symbol}${myAmt.toFixed(2)}`
              : '-',
            cols.you, y + 3,
            {
              size:  8,
              color: myAmt > 0
                ? [99, 102, 241]
                : [160, 160, 160]
            }
          );
          addText(
            herAmt > 0
              ? `${symbol}${herAmt.toFixed(2)}`
              : '-',
            cols.her, y + 3,
            {
              size:  8,
              color: herAmt > 0
                ? [236, 72, 153]
                : [160, 160, 160]
            }
          );
          addText(
            `${symbol}${total.toFixed(2)}`,
            cols.total, y + 3,
            { size: 8, style: 'bold', color: [40, 40, 40] }
          );
          y += 9;
        });

      y += 6;

      // ── TRANSACTIONS DETAIL ───────────────
      const addTxTable = (txns, ownerName, color) => {
        if (txns.length === 0) return;
        checkPage(20);

        addText(
          `${ownerName}'s Transactions`,
          margin, y,
          { size: 13, style: 'bold' }
        );
        y += 8;
        addLine(y);
        y += 6;

        // Table header
        doc.setFillColor(245, 245, 250);
        doc.rect(margin, y - 3, pageW - margin * 2, 10, 'F');

        const tc = {
          date: margin,
          desc: margin + 28,
          cat:  margin + 90,
          pay:  margin + 128,
          amt:  pageW - margin - 4
        };

        const headers = [
          'Date', 'Description',
          'Category', 'Payment', 'Amount'
        ];
        const xPositions = [
          tc.date, tc.desc, tc.cat, tc.pay, tc.amt
        ];

        headers.forEach((h, i) => {
          addText(h, xPositions[i], y + 4, {
            size:  7,
            style: 'bold',
            color: [80, 80, 80],
            align: i === 4 ? 'right' : 'left'
          });
        });
        y += 12;

        txns.slice(0, 50).forEach((tx, idx) => {
          checkPage(10);
          const isExp = tx.type === 'expense';

          if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 252);
            doc.rect(
              margin, y - 3,
              pageW - margin * 2, 9, 'F'
            );
          }

          addText(
            formatTxDate(tx.date),
            tc.date, y + 3,
            { size: 7, color: [100, 100, 100] }
          );
          addText(
            (tx.description || getCatLabel(tx.category))
              .substring(0, 35),
            tc.desc, y + 3,
            { size: 7, color: [40, 40, 40] }
          );
          addText(
            getCatLabel(tx.category),
            tc.cat, y + 3,
            { size: 7, color: [100, 100, 100] }
          );
          addText(
            tx.paymentMethod || '-',
            tc.pay, y + 3,
            { size: 7, color: [100, 100, 100] }
          );
          addText(
            `${isExp ? '-' : '+'}${symbol}${tx.amount.toFixed(2)}`,
            tc.amt, y + 3,
            {
              size:  7,
              style: 'bold',
              color: isExp
                ? [239, 68, 68]
                : [16, 185, 129],
              align: 'right'
            }
          );
          y += 9;
        });

        if (txns.length > 50) {
          checkPage(10);
          addText(
            `... and ${txns.length - 50} more transactions`,
            margin, y + 4,
            { size: 7, color: [120, 120, 120] }
          );
          y += 10;
        }
        y += 8;
      };

      doc.addPage();
      y = margin;
      addTxTable(
        myTxns,
        profile?.name || 'You',
        [99, 102, 241]
      );
      addTxTable(
        partnerTxns,
        partner?.name || 'Partner',
        [236, 72, 153]
      );

      // ── FOOTER on each page ───────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addLine(282, [220, 220, 220]);
        addText(
          'CoupleSpend · Finance Tracker',
          margin, 287,
          { size: 7, color: [150, 150, 150] }
        );
        addText(
          `Page ${i} of ${totalPages}`,
          pageW - margin, 287,
          { size: 7, color: [150, 150, 150], align: 'right' }
        );
      }

      // ── Save file ─────────────────────────
      const fileName = `CoupleSpend_${month}_Report.pdf`;
      doc.save(fileName);
      Toast.show('success', 'Exported', `PDF saved as ${fileName}`);

    } catch (err) {
      console.error('PDF export error:', err);
      Toast.show('error', 'Failed', 'Could not generate PDF: ' + err.message);
    }
  }

  // ── Export Compare PDF ─────────────────────
  async function exportComparePDF() {
    return exportPDF();
  }

  // ── Export CSV ────────────────────────────
  function exportCSV(who = 'both') {
    Toast.show('info', 'Generating', 'Creating CSV file...');

    try {
      const data = getExportData();
      const {
        myTxns, partnerTxns,
        symbol, month,
        profile, partner
      } = data;

      let txns = [];
      if (who === 'me') {
        txns = myTxns.map(t => ({
          ...t, _owner: profile?.name || 'You'
        }));
      } else if (who === 'partner') {
        txns = partnerTxns.map(t => ({
          ...t, _owner: partner?.name || 'Partner'
        }));
      } else {
        txns = [
          ...myTxns.map(t => ({
            ...t, _owner: profile?.name || 'You'
          })),
          ...partnerTxns.map(t => ({
            ...t, _owner: partner?.name || 'Partner'
          }))
        ].sort((a, b) =>
          new Date(b.date) - new Date(a.date)
        );
      }

      const headers = [
        'Date', 'Description', 'Category',
        'Type', 'Amount', 'Payment Method',
        'Tags', 'Owner'
      ];

      const rows = txns.map(tx => [
        tx.date || '',
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        getCatLabel(tx.category) || '',
        tx.type || '',
        tx.amount?.toFixed(2) || '0.00',
        tx.paymentMethod || '',
        `"${(tx.tags || []).join(', ')}"`,
        tx._owner || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      downloadFile(
        csvContent,
        `CoupleSpend_${month}_Transactions.csv`,
        'text/csv'
      );

      Toast.show('success', 'Exported', 'CSV file downloaded');

    } catch (err) {
      console.error('CSV export error:', err);
      Toast.show('error', 'Failed', 'Could not generate CSV');
    }
  }

  // ── Export Excel ──────────────────────────
  function exportExcel() {
    Toast.show('info', 'Generating', 'Creating Excel file...');

    try {
      if (!window.XLSX) {
        Toast.show('error', 'Missing', 'Excel library not loaded');
        return;
      }

      const data = getExportData();
      const {
        myTxns, partnerTxns,
        mySpend, herSpend,
        myIncome, herIncome,
        myCatSpend, herCatSpend,
        budgets, month,
        profile, partner, symbol
      } = data;

      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Your Transactions ──
      const myRows = [
        [
          'Date', 'Description', 'Category',
          'Type', 'Amount', 'Payment', 'Tags'
        ],
        ...myTxns.map(tx => [
          tx.date,
          tx.description || '',
          getCatLabel(tx.category),
          tx.type,
          tx.amount,
          tx.paymentMethod || '',
          (tx.tags || []).join(', ')
        ])
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(myRows);
      ws1['!cols'] = [
        { wch: 12 }, { wch: 30 }, { wch: 16 },
        { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(
        wb, ws1, profile?.name || 'You'
      );

      // ── Sheet 2: Partner Transactions ──
      const herRows = [
        [
          'Date', 'Description', 'Category',
          'Type', 'Amount', 'Payment', 'Tags'
        ],
        ...partnerTxns.map(tx => [
          tx.date,
          tx.description || '',
          getCatLabel(tx.category),
          tx.type,
          tx.amount,
          tx.paymentMethod || '',
          (tx.tags || []).join(', ')
        ])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(herRows);
      ws2['!cols'] = [
        { wch: 12 }, { wch: 30 }, { wch: 16 },
        { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(
        wb, ws2, partner?.name || 'Partner'
      );

      // ── Sheet 3: Comparison ──
      const allCats = new Set([
        ...Object.keys(myCatSpend),
        ...Object.keys(herCatSpend)
      ]);

      const compareRows = [
        [
          'Category',
          profile?.name || 'You',
          partner?.name || 'Partner',
          'Total',
          'Difference'
        ],
        ...[...allCats]
          .sort((a, b) => {
            return (
              (myCatSpend[b] || 0) + (herCatSpend[b] || 0)
            ) - (
              (myCatSpend[a] || 0) + (herCatSpend[a] || 0)
            );
          })
          .map(catId => {
            const my  = myCatSpend[catId]  || 0;
            const her = herCatSpend[catId] || 0;
            return [
              getCatLabel(catId),
              my, her,
              my + her,
              my - her
            ];
          }),
        [],
        [
          'TOTAL',
          mySpend, herSpend,
          mySpend + herSpend,
          mySpend - herSpend
        ],
        [
          'INCOME',
          myIncome, herIncome,
          myIncome + herIncome,
          myIncome - herIncome
        ]
      ];

      const ws3 = XLSX.utils.aoa_to_sheet(compareRows);
      ws3['!cols'] = [
        { wch: 18 }, { wch: 14 },
        { wch: 14 }, { wch: 14 }, { wch: 14 }
      ];
      XLSX.utils.book_append_sheet(wb, ws3, 'Comparison');

      // ── Sheet 4: Budgets ──
      const budgetRows = [
        [
          'Category', 'Budget', 'Spent',
          'Remaining', 'Used %', 'Alert At'
        ],
        ...budgets.map(b => {
          const spent  = myCatSpend[b.category] || 0;
          const remain = b.amount - spent;
          const pct    = ((spent / b.amount) * 100).toFixed(1);
          return [
            getCatLabel(b.category),
            b.amount,
            spent,
            remain,
            `${pct}%`,
            `${b.alertAt || 80}%`
          ];
        })
      ];

      const ws4 = XLSX.utils.aoa_to_sheet(budgetRows);
      ws4['!cols'] = [
        { wch: 18 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 10 }, { wch: 10 }
      ];
      XLSX.utils.book_append_sheet(wb, ws4, 'Budgets');

      XLSX.writeFile(wb, `CoupleSpend_${month}_Report.xlsx`);
      Toast.show('success', 'Exported', 'Excel file downloaded');

    } catch (err) {
      console.error('Excel export error:', err);
      Toast.show('error', 'Failed', 'Could not generate Excel file');
    }
  }

  // ── Export chart as image ──────────────────
  async function exportChartImage(canvasId, fileName = 'chart') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      Toast.show('error', 'Not found', 'Chart not available');
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link    = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href     = dataUrl;
      link.click();
      Toast.show('success', 'Saved', 'Chart image downloaded');
    } catch (err) {
      console.error('Chart export error:', err);
      Toast.show('error', 'Failed', 'Could not save chart');
    }
  }

  // ── Download file helper ───────────────────
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ── Expose ────────────────────────────────
  return {
    exportPDF,
    exportComparePDF,
    exportCSV,
    exportExcel,
    exportChartImage
  };

})();

window.ExportManager = ExportManager;