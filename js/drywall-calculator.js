/**
 * WALLCALCULATOR.APP - Dedicated Drywall Sheet Calculator Engine
 * Specialized Gypsum Board Layout, Joint Compound Mud, Screws & 2D CAD Visualizer
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    roomLength: 16,        // feet
    roomWidth: 12,         // feet
    wallHeight: 8,         // feet
    calcScope: 'walls-only', // 'walls-only' or 'walls-ceiling'
    panelSize: '4x8',      // '4x8' (32 sq ft) or '4x12' (48 sq ft)
    orientation: 'horizontal', // 'horizontal' or 'vertical'
    doors: 1,              // standard 3x7 door (21 sq ft)
    windows: 2,            // standard 3x4 window (12 sq ft)
    wastePct: 10,          // 10% standard waste
    pricePerSheet: 14.50,  // USD per panel
    mudPricePerBucket: 18.25, // USD per 4.5 gal bucket
    screwPricePerLb: 6.50, // USD per lb
    tapePricePerRoll: 7.20 // USD per 500ft roll
  };

  // --- DOM ELEMENTS ---
  const el = {
    themeBtn: document.getElementById('theme-toggle-btn'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    navLinks: document.querySelector('.nav-links'),

    // Inputs
    roomLengthInput: document.getElementById('drywall-room-length'),
    roomWidthInput: document.getElementById('drywall-room-width'),
    wallHeightInput: document.getElementById('drywall-wall-height'),
    scopeInputs: document.querySelectorAll('input[name="calc-scope"]'),
    panelInputs: document.querySelectorAll('input[name="panel-size"]'),
    orientationInputs: document.querySelectorAll('input[name="sheet-orientation"]'),
    doorsInput: document.getElementById('drywall-door-count'),
    windowsInput: document.getElementById('drywall-window-count'),
    sheetPriceInput: document.getElementById('sheet-price-input'),
    wasteSlider: document.getElementById('waste-slider'),
    wasteValDisplay: document.getElementById('waste-val-display'),
    svgBlueprint: document.getElementById('blueprint-svg'),

    // Outputs
    valTotalSheets: document.getElementById('takeoff-total-sheets'),
    valNetArea: document.getElementById('takeoff-net-area'),
    valMudBuckets: document.getElementById('takeoff-mud-buckets'),
    valDrywallScrews: document.getElementById('takeoff-drywall-screws'),
    valJointTape: document.getElementById('takeoff-joint-tape'),
    valPerimeterArea: document.getElementById('takeoff-gross-area'),
    valTotalCost: document.getElementById('total-cost-num'),
    costBreakdown: document.getElementById('cost-breakdown-details'),
    btnToggleCosts: document.getElementById('btn-toggle-costs'),
    costTableBody: document.getElementById('cost-table-body'),

    // Actions
    btnPrint: document.getElementById('btn-print-takeoff'),
    btnCopy: document.getElementById('btn-copy-takeoff')
  };

  // --- CALCULATION LOGIC ---
  function calculateDrywall() {
    const lengthFt = Math.max(1, parseFloat(state.roomLength) || 16);
    const widthFt = Math.max(0, isNaN(parseFloat(state.roomWidth)) ? 12 : parseFloat(state.roomWidth));
    const heightFt = Math.max(4, parseFloat(state.wallHeight) || 8);
    const wasteFactor = 1 + (state.wastePct / 100);
    const doors = Math.max(0, parseInt(state.doors) || 0);
    const windows = Math.max(0, parseInt(state.windows) || 0);

    // 1. Surface Areas
    // If width > 0, calculate 4 walls of a room: 2 * (L + W) * H
    // If width == 0, calculate single linear wall: L * H
    let wallGrossArea = 0;
    if (widthFt > 0) {
      wallGrossArea = 2 * (lengthFt + widthFt) * heightFt;
    } else {
      wallGrossArea = lengthFt * heightFt;
    }

    // Ceiling Area (if enabled and width > 0)
    let ceilingArea = 0;
    if (state.calcScope === 'walls-ceiling' && widthFt > 0) {
      ceilingArea = lengthFt * widthFt;
    }

    // Openings Deductions
    const doorDeduction = doors * 21; // 3ft x 7ft
    const windowDeduction = windows * 12; // 3ft x 4ft
    const totalDeductions = doorDeduction + windowDeduction;

    const netWallArea = Math.max(0, wallGrossArea - totalDeductions);
    const totalNetArea = Math.round(netWallArea + ceilingArea);
    const grossArea = Math.round(wallGrossArea + ceilingArea);

    // 2. Drywall Panels
    const sheetSqFt = state.panelSize === '4x12' ? 48 : 32;
    const baseSheets = totalNetArea / sheetSqFt;
    const totalSheets = Math.ceil(baseSheets * wasteFactor);

    // 3. Joint Compound (Mud)
    // Professional rule: ~1 standard 4.5-gal bucket per 9-10 sheets of 4x8 (roughly 300 sq ft) for 3 full coats
    const mudBuckets = Math.max(1, Math.ceil(totalSheets / 9.5));

    // 4. Drywall Fasteners (Screws)
    // 1-1/4" coarse drywall screws: ~1 lb (roughly 300 screws) per 4-5 sheets (or 1.2 lbs per 300 sq ft)
    const drywallScrewsLbs = Math.max(1, Math.ceil(totalNetArea / 280));

    // 5. Paper Joint Tape
    // Professional rule: ~37 linear feet of tape per 4x8 sheet, or ~30 feet per 100 sq ft
    const totalTapeFt = Math.round(totalSheets * (state.panelSize === '4x12' ? 48 : 37));
    const tapeRolls500ft = Math.max(1, Math.ceil(totalTapeFt / 500));

    // 6. Costs
    const sheetPrice = parseFloat(state.pricePerSheet) || 14.50;
    const mudPrice = parseFloat(state.mudPricePerBucket) || 18.25;
    const screwPrice = parseFloat(state.screwPricePerLb) || 6.50;
    const tapePrice = parseFloat(state.tapePricePerRoll) || 7.20;

    const sheetTotalCost = totalSheets * sheetPrice;
    const mudTotalCost = mudBuckets * mudPrice;
    const screwTotalCost = drywallScrewsLbs * screwPrice;
    const tapeTotalCost = tapeRolls500ft * tapePrice;
    const grandTotalCost = (sheetTotalCost + mudTotalCost + screwTotalCost + tapeTotalCost).toFixed(2);

    return {
      lengthFt,
      widthFt,
      heightFt,
      panelSize: state.panelSize,
      orientation: state.orientation,
      calcScope: state.calcScope,
      grossArea,
      totalNetArea,
      totalSheets,
      mudBuckets,
      drywallScrewsLbs,
      totalTapeFt,
      tapeRolls500ft,
      sheetTotalCost: sheetTotalCost.toFixed(2),
      mudTotalCost: mudTotalCost.toFixed(2),
      screwTotalCost: screwTotalCost.toFixed(2),
      tapeTotalCost: tapeTotalCost.toFixed(2),
      grandTotalCost,
      sheetPrice
    };
  }

  // --- RENDER DYNAMIC 2D BLUEPRINT SVG (DRYWALL PANEL LAYOUT) ---
  function renderBlueprint(data) {
    if (!el.svgBlueprint) return;

    while (el.svgBlueprint.firstChild) {
      el.svgBlueprint.removeChild(el.svgBlueprint.firstChild);
    }

    const svgW = el.svgBlueprint.clientWidth || 550;
    const svgH = 150;
    const pad = 12;
    const wallW = svgW - (pad * 2);
    const wallH = svgH - (pad * 2);

    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');

    // Wall Background
    const wallBg = document.createElementNS(ns, 'rect');
    wallBg.setAttribute('x', pad);
    wallBg.setAttribute('y', pad);
    wallBg.setAttribute('width', wallW);
    wallBg.setAttribute('height', wallH);
    wallBg.setAttribute('fill', '#070919');
    wallBg.setAttribute('stroke', 'rgba(0, 240, 255, 0.4)');
    wallBg.setAttribute('stroke-width', '1.5');
    wallBg.setAttribute('rx', '4');
    g.appendChild(wallBg);

    // Staggered Drywall Panels (Horizontal Hanging: 2 rows of 4ft height = 8ft wall)
    const isHorizontal = state.orientation === 'horizontal';
    const panelLengthInches = state.panelSize === '4x12' ? 144 : 96;
    const wallLengthInches = Math.max(96, data.lengthFt * 12);
    const pxPerInch = wallW / wallLengthInches;

    if (isHorizontal) {
      // 2 or 3 horizontal courses
      const numCourses = Math.max(2, Math.round(data.heightFt / 4));
      const courseH = wallH / numCourses;

      for (let r = 0; r < numCourses; r++) {
        const yPos = pad + (r * courseH);
        // Stagger every alternating course by half sheet
        const staggerOffset = (r % 2 === 1) ? (panelLengthInches / 2) * pxPerInch : 0;
        let currentX = pad - staggerOffset;

        while (currentX < pad + wallW) {
          const panelW = panelLengthInches * pxPerInch;
          const drawX = Math.max(pad, currentX);
          const drawW = Math.min(panelW - Math.max(0, pad - currentX), (pad + wallW) - drawX);

          if (drawW > 2) {
            const panel = document.createElementNS(ns, 'rect');
            panel.setAttribute('x', drawX);
            panel.setAttribute('y', yPos);
            panel.setAttribute('width', drawW);
            panel.setAttribute('height', courseH);
            panel.setAttribute('fill', ((Math.floor(currentX / panelW) + r) % 2 === 0) ? '#0F1E36' : '#14284A');
            panel.setAttribute('stroke', '#00F0FF');
            panel.setAttribute('stroke-width', '1');
            panel.setAttribute('opacity', '0.85');
            g.appendChild(panel);

            // Subtle seam taper line
            const taper = document.createElementNS(ns, 'line');
            taper.setAttribute('x1', drawX);
            taper.setAttribute('y1', yPos + courseH);
            taper.setAttribute('x2', drawX + drawW);
            taper.setAttribute('y2', yPos + courseH);
            taper.setAttribute('stroke', '#8B5CF6');
            taper.setAttribute('stroke-width', '1.5');
            g.appendChild(taper);
          }
          currentX += panelW;
        }
      }
    } else {
      // Vertical Hanging
      const panelW = (48) * pxPerInch; // 4ft wide
      let currentX = pad;
      let colIdx = 0;

      while (currentX < pad + wallW) {
        const drawW = Math.min(panelW, (pad + wallW) - currentX);
        const panel = document.createElementNS(ns, 'rect');
        panel.setAttribute('x', currentX);
        panel.setAttribute('y', pad);
        panel.setAttribute('width', drawW);
        panel.setAttribute('height', wallH);
        panel.setAttribute('fill', colIdx % 2 === 0 ? '#0F1E36' : '#14284A');
        panel.setAttribute('stroke', '#00F0FF');
        panel.setAttribute('stroke-width', '1');
        panel.setAttribute('opacity', '0.85');
        g.appendChild(panel);

        currentX += panelW;
        colIdx++;
      }
    }

    // Door Opening Cutout
    if (state.doors > 0 && wallW > 160) {
      const doorW = 44;
      const doorH = wallH * 0.88;
      const doorX = pad + (wallW * 0.22);
      const doorY = pad + wallH - doorH;

      const door = document.createElementNS(ns, 'rect');
      door.setAttribute('x', doorX);
      door.setAttribute('y', doorY);
      door.setAttribute('width', doorW);
      door.setAttribute('height', doorH);
      door.setAttribute('fill', '#050714');
      door.setAttribute('stroke', '#F97316');
      door.setAttribute('stroke-width', '1.5');
      door.setAttribute('stroke-dasharray', '4 2');
      g.appendChild(door);

      const txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', doorX + (doorW / 2));
      txt.setAttribute('y', doorY + (doorH / 2) + 3);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#F97316');
      txt.setAttribute('font-size', '9');
      txt.setAttribute('font-weight', '700');
      txt.textContent = 'DOOR';
      g.appendChild(txt);
    }

    // Window Opening Cutout
    if (state.windows > 0 && wallW > 240) {
      const winW = 42;
      const winH = wallH * 0.5;
      const winX = pad + (wallW * 0.65);
      const winY = pad + (wallH * 0.18);

      const win = document.createElementNS(ns, 'rect');
      win.setAttribute('x', winX);
      win.setAttribute('y', winY);
      win.setAttribute('width', winW);
      win.setAttribute('height', winH);
      win.setAttribute('fill', '#050714');
      win.setAttribute('stroke', '#38BDF8');
      win.setAttribute('stroke-width', '1.5');
      win.setAttribute('stroke-dasharray', '4 2');
      g.appendChild(win);

      const txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', winX + (winW / 2));
      txt.setAttribute('y', winY + (winH / 2) + 3);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#38BDF8');
      txt.setAttribute('font-size', '9');
      txt.setAttribute('font-weight', '700');
      txt.textContent = 'WINDOW';
      g.appendChild(txt);
    }

    el.svgBlueprint.appendChild(g);
  }

  // --- UPDATE UI DASHBOARD ---
  function updateUI() {
    const data = calculateDrywall();

    if (el.valTotalSheets) el.valTotalSheets.textContent = data.totalSheets;
    if (el.valNetArea) el.valNetArea.textContent = `${data.totalNetArea} sq ft`;
    if (el.valMudBuckets) el.valMudBuckets.textContent = `${data.mudBuckets} (${data.mudBuckets * 4.5} gal)`;
    if (el.valDrywallScrews) el.valDrywallScrews.textContent = `${data.drywallScrewsLbs} lbs`;
    if (el.valJointTape) el.valJointTape.textContent = `${data.totalTapeFt} ft (${data.tapeRolls500ft} roll${data.tapeRolls500ft > 1 ? 's' : ''})`;
    if (el.valPerimeterArea) el.valPerimeterArea.textContent = `${data.grossArea} sq ft`;
    if (el.valTotalCost) el.valTotalCost.textContent = data.grandTotalCost;

    // Detailed Table
    if (el.costTableBody) {
      el.costTableBody.innerHTML = `
        <tr>
          <td><strong>${data.panelSize} Gypsum Panels</strong> (${data.panelSize === '4x12' ? '48' : '32'} sq ft each)</td>
          <td>${data.totalSheets} pcs</td>
          <td>$${data.sheetPrice.toFixed(2)}</td>
          <td>$${data.sheetTotalCost}</td>
        </tr>
        <tr>
          <td><strong>All-Purpose Joint Compound</strong> (4.5 gal bucket)</td>
          <td>${data.mudBuckets} bucket${data.mudBuckets > 1 ? 's' : ''}</td>
          <td>$${state.mudPricePerBucket.toFixed(2)}</td>
          <td>$${data.mudTotalCost}</td>
        </tr>
        <tr>
          <td><strong>Drywall Screws 1-1/4"</strong> (Coarse thread)</td>
          <td>${data.drywallScrewsLbs} lbs</td>
          <td>$${state.screwPricePerLb.toFixed(2)}</td>
          <td>$${data.screwTotalCost}</td>
        </tr>
        <tr>
          <td><strong>Paper Joint Tape</strong> (500-ft roll)</td>
          <td>${data.tapeRolls500ft} roll${data.tapeRolls500ft > 1 ? 's' : ''}</td>
          <td>$${state.tapePricePerRoll.toFixed(2)}</td>
          <td>$${data.tapeTotalCost}</td>
        </tr>
        <tr style="border-top: 1px solid var(--border-color); font-weight: 700;">
          <td>Total Estimated Takeoff</td>
          <td>--</td>
          <td>--</td>
          <td style="color: var(--brand-primary);">$${data.grandTotalCost}</td>
        </tr>
      `;
    }

    renderBlueprint(data);
  }

  // --- ATTACH EVENT LISTENERS ---
  function attachListeners() {
    if (el.roomLengthInput) {
      el.roomLengthInput.addEventListener('input', (e) => {
        state.roomLength = Math.max(1, parseFloat(e.target.value) || 16);
        updateUI();
      });
    }

    if (el.roomWidthInput) {
      el.roomWidthInput.addEventListener('input', (e) => {
        state.roomWidth = Math.max(0, parseFloat(e.target.value) || 0);
        updateUI();
      });
    }

    if (el.wallHeightInput) {
      el.wallHeightInput.addEventListener('input', (e) => {
        state.wallHeight = Math.max(4, parseFloat(e.target.value) || 8);
        updateUI();
      });
    }

    el.scopeInputs.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.calcScope = e.target.value;
          updateUI();
        }
      });
    });

    el.panelInputs.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.panelSize = e.target.value;
          updateUI();
        }
      });
    });

    el.orientationInputs.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.orientation = e.target.value;
          updateUI();
        }
      });
    });

    if (el.doorsInput) {
      el.doorsInput.addEventListener('input', (e) => {
        state.doors = Math.max(0, parseInt(e.target.value) || 0);
        updateUI();
      });
    }

    if (el.windowsInput) {
      el.windowsInput.addEventListener('input', (e) => {
        state.windows = Math.max(0, parseInt(e.target.value) || 0);
        updateUI();
      });
    }

    if (el.sheetPriceInput) {
      el.sheetPriceInput.addEventListener('input', (e) => {
        state.pricePerSheet = Math.max(1, parseFloat(e.target.value) || 14.50);
        updateUI();
      });
    }

    if (el.wasteSlider && el.wasteValDisplay) {
      el.wasteSlider.addEventListener('input', (e) => {
        state.wastePct = parseInt(e.target.value) || 10;
        el.wasteValDisplay.textContent = `${state.wastePct}%`;
        updateUI();
      });
    }

    // Cost Breakdown Toggle
    if (el.btnToggleCosts && el.costBreakdown) {
      el.btnToggleCosts.addEventListener('click', () => {
        el.costBreakdown.classList.toggle('open');
        el.btnToggleCosts.textContent = el.costBreakdown.classList.contains('open') ? 'Hide Details ▲' : 'Show Details ▼';
      });
    }

    // Print Action
    if (el.btnPrint) {
      el.btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Copy Action
    if (el.btnCopy) {
      el.btnCopy.addEventListener('click', () => {
        const data = calculateDrywall();
        const summary = `
=== WallCalculator.app Drywall Takeoff ===
Room Length: ${data.lengthFt} ft | Room Width: ${data.widthFt} ft | Wall Height: ${data.heightFt} ft
Panel Size: ${data.panelSize} | Scope: ${data.calcScope} | Waste: ${state.wastePct}%

MATERIAL TAKE-OFF LIST:
- Drywall Sheets: ${data.totalSheets} panels (${data.panelSize})
- Net Surface Area: ${data.totalNetArea} sq ft (Gross: ${data.grossArea} sq ft)
- All-Purpose Joint Compound: ${data.mudBuckets} bucket(s) [4.5-gallon]
- Drywall Screws (1-1/4"): ${data.drywallScrewsLbs} lbs
- Paper Joint Tape: ${data.totalTapeFt} ft (${data.tapeRolls500ft} roll[s])
- Total Estimated Material Cost: $${data.grandTotalCost} USD

Generated on WallCalculator.app/drywall-calculator
        `.trim();

        navigator.clipboard.writeText(summary).then(() => {
          const originalText = el.btnCopy.innerHTML;
          el.btnCopy.innerHTML = '<span>✓</span> Copied to Clipboard!';
          setTimeout(() => {
            el.btnCopy.innerHTML = originalText;
          }, 2000);
        });
      });
    }

    // Theme Switcher
    if (el.themeBtn) {
      el.themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateUI();
      });
    }

    // Mobile Navigation Drawer Toggle
    if (el.mobileMenuBtn && el.navLinks) {
      el.mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = el.navLinks.classList.toggle('mobile-open');
        el.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
        el.mobileMenuBtn.innerHTML = isOpen ? '✕' : '☰';
      });

      el.navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          el.navLinks.classList.remove('mobile-open');
          el.mobileMenuBtn.setAttribute('aria-expanded', 'false');
          el.mobileMenuBtn.innerHTML = '☰';
        });
      });

      document.addEventListener('click', (e) => {
        if (el.navLinks.classList.contains('mobile-open') && !el.navLinks.contains(e.target) && e.target !== el.mobileMenuBtn) {
          el.navLinks.classList.remove('mobile-open');
          el.mobileMenuBtn.setAttribute('aria-expanded', 'false');
          el.mobileMenuBtn.innerHTML = '☰';
        }
      });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });

    window.addEventListener('resize', () => {
      renderBlueprint(calculateDrywall());
    });
  }

  // --- INIT ---
  function init() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    attachListeners();
    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
