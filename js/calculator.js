/**
 * WALLCALCULATOR.APP - Master Calculation & Blueprint Visualizer Engine
 * Industry-Standard IRC R602 Framing Math & Drywall Takeoff
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    unit: 'imperial', // 'imperial' (ft/in) or 'metric' (m)
    mode: 'both',     // 'both', 'studs', 'drywall'
    wallLength: 16,   // feet
    wallHeight: 8,    // feet
    studSpacing: 16,  // inches OC (16 or 24)
    lumberSize: '2x4',
    drywallSize: '4x8', // 32 sq ft or '4x12' (48 sq ft)
    drywallThickness: '1/2',
    wastePct: 10,     // 10%
    doors: 1,
    windows: 1,
    // Average US Contractor Material Prices ($ USD)
    prices: {
      stud: 4.85,
      drywallSheet: 14.50,
      screwsPerLb: 6.25,
      compoundPerGal: 8.50,
      tapePerRoll: 5.75
    }
  };

  // --- DOM ELEMENTS ---
  const el = {
    themeBtn: document.getElementById('theme-toggle-btn'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    wallLengthInput: document.getElementById('wall-length'),
    wallHeightInput: document.getElementById('wall-height'),
    spacingInputs: document.querySelectorAll('input[name="stud-spacing"]'),
    sheetSizeInputs: document.querySelectorAll('input[name="sheet-size"]'),
    doorsInput: document.getElementById('door-count'),
    windowsInput: document.getElementById('window-count'),
    wasteSlider: document.getElementById('waste-slider'),
    wasteValDisplay: document.getElementById('waste-val-display'),
    svgBlueprint: document.getElementById('blueprint-svg'),
    
    // Outputs
    valStuds: document.getElementById('takeoff-studs'),
    valSheets: document.getElementById('takeoff-sheets'),
    valArea: document.getElementById('takeoff-area'),
    valScrews: document.getElementById('takeoff-screws'),
    valMud: document.getElementById('takeoff-mud'),
    valTape: document.getElementById('takeoff-tape'),
    valTotalCost: document.getElementById('total-cost-num'),
    costBreakdown: document.getElementById('cost-breakdown-details'),
    btnToggleCosts: document.getElementById('btn-toggle-costs'),
    costTableBody: document.getElementById('cost-table-body'),
    
    // Actions
    btnPrint: document.getElementById('btn-print-takeoff'),
    btnCopy: document.getElementById('btn-copy-takeoff')
  };

  // --- CALCULATION LOGIC ---
  function calculateTakeoff() {
    const lengthFt = Math.max(1, parseFloat(state.wallLength) || 16);
    const heightFt = Math.max(4, parseFloat(state.wallHeight) || 8);
    const spacingInches = state.studSpacing;
    const wasteFactor = 1 + (state.wastePct / 100);
    const doors = Math.max(0, parseInt(state.doors) || 0);
    const windows = Math.max(0, parseInt(state.windows) || 0);

    // 1. Gross & Net Surface Area
    const grossAreaSqFt = lengthFt * heightFt;
    const doorArea = doors * 21; // Standard 3'x7' door = 21 sq ft
    const windowArea = windows * 12; // Standard 3'x4' window = 12 sq ft
    const totalOpeningsArea = Math.min(grossAreaSqFt * 0.7, doorArea + windowArea);
    const netAreaSqFt = Math.max(1, grossAreaSqFt - totalOpeningsArea);

    // 2. Wood Studs Takeoff (IRC Building Code Standard)
    // Formula: (Length in inches / spacing) + 1 for start/end
    const lengthInches = lengthFt * 12;
    const fieldStuds = Math.ceil(lengthInches / spacingInches) + 1;
    
    // Continuous Top (double) and Bottom (single) Plates = 3 continuous plates
    const plateLumberStuds = Math.ceil((lengthFt * 3) / heightFt);
    
    // Corners & Intersections (Standard 3-stud or California corner)
    const cornerStuds = 4;
    
    // Openings (Each door & window needs 2 King + 2 Jack/Trimmer + Header/Cripple lumber)
    const openingStuds = (doors * 4) + (windows * 4);

    const baseStudTotal = fieldStuds + plateLumberStuds + cornerStuds + openingStuds;
    const totalStudsWithWaste = Math.ceil(baseStudTotal * wasteFactor);

    // 3. Drywall Sheets Takeoff
    const sheetSqFt = state.drywallSize === '4x12' ? 48 : 32;
    // For walls, sheets are hung horizontally with staggered seams
    const rawSheets = netAreaSqFt / sheetSqFt;
    const totalSheetsWithWaste = Math.ceil(rawSheets * wasteFactor);

    // 4. Drywall Fasteners & Accessories
    // Screws: ~32 screws per 4x8 sheet (16" spacing on studs, 12" perimeter spacing)
    const totalScrews = Math.ceil(totalSheetsWithWaste * 32);
    const lbsScrews = Math.max(1, Math.ceil(totalScrews / 290)); // ~290 screws per 1-1/4" lb

    // Joint Compound (All-Purpose Mud): ~0.05 gallons per sq ft of finished board
    const galMud = Math.max(1, Math.ceil(netAreaSqFt * 0.053));

    // Drywall Joint Tape: ~0.37 linear feet of tape per sq ft of board
    const linearFtTape = Math.ceil(netAreaSqFt * 0.38);

    // 5. Cost Estimation
    const costStuds = totalStudsWithWaste * state.prices.stud;
    const costDrywall = totalSheetsWithWaste * state.prices.drywallSheet;
    const costScrews = lbsScrews * state.prices.screwsPerLb;
    const costMud = galMud * state.prices.compoundPerGal;
    const costTape = Math.ceil(linearFtTape / 250) * state.prices.tapePerRoll; // 250ft rolls

    let grandTotalCost = 0;
    if (state.mode === 'both') {
      grandTotalCost = costStuds + costDrywall + costScrews + costMud + costTape;
    } else if (state.mode === 'studs') {
      grandTotalCost = costStuds;
    } else if (state.mode === 'drywall') {
      grandTotalCost = costDrywall + costScrews + costMud + costTape;
    }

    return {
      lengthFt,
      heightFt,
      netAreaSqFt: Math.round(netAreaSqFt),
      grossAreaSqFt: Math.round(grossAreaSqFt),
      fieldStuds,
      totalStuds: totalStudsWithWaste,
      totalSheets: totalSheetsWithWaste,
      lbsScrews,
      galMud,
      linearFtTape,
      grandTotalCost: Math.round(grandTotalCost),
      costs: {
        studs: costStuds,
        drywall: costDrywall,
        screws: costScrews,
        mud: costMud,
        tape: costTape
      }
    };
  }

  // --- RENDER BLUEPRINT SVG ---
  function renderBlueprint(data) {
    if (!el.svgBlueprint) return;
    const svg = el.svgBlueprint;
    svg.innerHTML = '';

    const viewW = 600;
    const viewH = 180;
    const pad = 25;
    const wallW = viewW - (pad * 2);
    const wallH = viewH - (pad * 2);

    const lengthFt = data.lengthFt;
    const heightFt = data.heightFt;
    const spacingInches = state.studSpacing;
    const totalStudsInRow = Math.floor((lengthFt * 12) / spacingInches) + 1;

    // Namespace
    const ns = 'http://www.w3.org/2000/svg';

    // Group container
    const g = document.createElementNS(ns, 'g');

    // 1. Double Top Plate
    const topPlate1 = document.createElementNS(ns, 'rect');
    topPlate1.setAttribute('x', pad);
    topPlate1.setAttribute('y', pad);
    topPlate1.setAttribute('width', wallW);
    topPlate1.setAttribute('height', '5');
    topPlate1.setAttribute('fill', '#F97316');
    g.appendChild(topPlate1);

    const topPlate2 = document.createElementNS(ns, 'rect');
    topPlate2.setAttribute('x', pad);
    topPlate2.setAttribute('y', pad + 6);
    topPlate2.setAttribute('width', wallW);
    topPlate2.setAttribute('height', '5');
    topPlate2.setAttribute('fill', '#EA580C');
    g.appendChild(topPlate2);

    // 2. Bottom Sole Plate
    const bottomPlate = document.createElementNS(ns, 'rect');
    bottomPlate.setAttribute('x', pad);
    bottomPlate.setAttribute('y', pad + wallH - 6);
    bottomPlate.setAttribute('width', wallW);
    bottomPlate.setAttribute('height', '6');
    bottomPlate.setAttribute('fill', '#F97316');
    g.appendChild(bottomPlate);

    // 3. Vertical Studs
    const studHeight = wallH - 17;
    const studY = pad + 11;
    const studStepX = wallW / Math.max(1, totalStudsInRow - 1);

    for (let i = 0; i < totalStudsInRow; i++) {
      const studX = pad + (i * studStepX);
      const stud = document.createElementNS(ns, 'rect');
      stud.setAttribute('x', Math.min(pad + wallW - 3, Math.max(pad, studX - 1.5)));
      stud.setAttribute('y', studY);
      stud.setAttribute('width', '3');
      stud.setAttribute('height', studHeight);
      stud.setAttribute('fill', i === 0 || i === totalStudsInRow - 1 ? '#38BDF8' : '#0284C7');
      stud.setAttribute('opacity', '0.85');
      g.appendChild(stud);
    }

    // 4. Openings (Doors & Windows Representation)
    if (state.doors > 0 && wallW > 140) {
      const doorW = 45;
      const doorH = studHeight;
      const doorX = pad + (wallW * 0.22);
      const doorY = studY;

      // Rough opening cutout box
      const doorCutout = document.createElementNS(ns, 'rect');
      doorCutout.setAttribute('x', doorX);
      doorCutout.setAttribute('y', doorY);
      doorCutout.setAttribute('width', doorW);
      doorCutout.setAttribute('height', doorH);
      doorCutout.setAttribute('fill', '#0B0F19');
      doorCutout.setAttribute('stroke', '#F97316');
      doorCutout.setAttribute('stroke-width', '1.5');
      doorCutout.setAttribute('stroke-dasharray', '3 2');
      g.appendChild(doorCutout);

      // Header above door
      const header = document.createElementNS(ns, 'rect');
      header.setAttribute('x', doorX - 3);
      header.setAttribute('y', doorY);
      header.setAttribute('width', doorW + 6);
      header.setAttribute('height', '10');
      header.setAttribute('fill', '#F97316');
      g.appendChild(header);

      // Label
      const txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', doorX + (doorW / 2));
      txt.setAttribute('y', doorY + (doorH / 2) + 4);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#F97316');
      txt.setAttribute('font-size', '9');
      txt.setAttribute('font-weight', '700');
      txt.textContent = 'DOOR';
      g.appendChild(txt);
    }

    if (state.windows > 0 && wallW > 200) {
      const winW = 42;
      const winH = studHeight * 0.55;
      const winX = pad + (wallW * 0.65);
      const winY = studY + 15;

      const winCutout = document.createElementNS(ns, 'rect');
      winCutout.setAttribute('x', winX);
      winCutout.setAttribute('y', winY);
      winCutout.setAttribute('width', winW);
      winCutout.setAttribute('height', winH);
      winCutout.setAttribute('fill', '#0B0F19');
      winCutout.setAttribute('stroke', '#38BDF8');
      winCutout.setAttribute('stroke-width', '1.5');
      winCutout.setAttribute('stroke-dasharray', '3 2');
      g.appendChild(winCutout);

      const header = document.createElementNS(ns, 'rect');
      header.setAttribute('x', winX - 3);
      header.setAttribute('y', winY);
      header.setAttribute('width', winW + 6);
      header.setAttribute('height', '8');
      header.setAttribute('fill', '#38BDF8');
      g.appendChild(header);

      const sill = document.createElementNS(ns, 'rect');
      sill.setAttribute('x', winX - 3);
      sill.setAttribute('y', winY + winH - 4);
      sill.setAttribute('width', winW + 6);
      sill.setAttribute('height', '4');
      sill.setAttribute('fill', '#38BDF8');
      g.appendChild(sill);

      const txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', winX + (winW / 2));
      txt.setAttribute('y', winY + (winH / 2) + 3);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#38BDF8');
      txt.setAttribute('font-size', '8');
      txt.setAttribute('font-weight', '700');
      txt.textContent = 'WINDOW';
      g.appendChild(txt);
    }

    // 5. Dimension Indicators
    const dimText = document.createElementNS(ns, 'text');
    dimText.setAttribute('x', pad + (wallW / 2));
    dimText.setAttribute('y', viewH - 4);
    dimText.setAttribute('text-anchor', 'middle');
    dimText.setAttribute('fill', '#94A3B8');
    dimText.setAttribute('font-size', '10');
    dimText.setAttribute('font-weight', '600');
    dimText.textContent = `Wall Span: ${lengthFt} ft (${spacingInches}" OC)  •  Height: ${heightFt} ft`;
    g.appendChild(dimText);

    svg.appendChild(g);
  }

  // --- UPDATE UI ---
  function updateUI() {
    const data = calculateTakeoff();

    // Numbers display
    if (el.valStuds) el.valStuds.textContent = data.totalStuds;
    if (el.valSheets) el.valSheets.textContent = data.totalSheets;
    if (el.valArea) el.valArea.textContent = `${data.netAreaSqFt} sq ft`;
    if (el.valScrews) el.valScrews.textContent = `${data.lbsScrews} lbs`;
    if (el.valMud) el.valMud.textContent = `${data.galMud} gal`;
    if (el.valTape) el.valTape.textContent = `${data.linearFtTape} ft`;
    if (el.valTotalCost) el.valTotalCost.textContent = `$${data.grandTotalCost.toLocaleString()}`;

    // Cost Breakdown Table
    if (el.costTableBody) {
      el.costTableBody.innerHTML = `
        <tr><td>Lumber Studs (${data.totalStuds} pcs @ $${state.prices.stud.toFixed(2)})</td><td class="cost-num">$${data.costs.studs.toFixed(2)}</td></tr>
        <tr><td>Drywall Sheets (${data.totalSheets} sheets @ $${state.prices.drywallSheet.toFixed(2)})</td><td class="cost-num">$${data.costs.drywall.toFixed(2)}</td></tr>
        <tr><td>Drywall Screws (${data.lbsScrews} lbs @ $${state.prices.screwsPerLb.toFixed(2)})</td><td class="cost-num">$${data.costs.screws.toFixed(2)}</td></tr>
        <tr><td>Joint Compound Mud (${data.galMud} gal @ $${state.prices.compoundPerGal.toFixed(2)})</td><td class="cost-num">$${data.costs.mud.toFixed(2)}</td></tr>
        <tr><td>Joint Paper Tape (${data.linearFtTape} ft)</td><td class="cost-num">$${data.costs.tape.toFixed(2)}</td></tr>
      `;
    }

    // Render Live Blueprint
    renderBlueprint(data);
  }

  // --- EVENT LISTENERS ---
  function attachListeners() {
    // Mode switcher
    el.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.getAttribute('data-mode');
        updateUI();
      });
    });

    // Inputs
    if (el.wallLengthInput) {
      el.wallLengthInput.addEventListener('input', (e) => {
        state.wallLength = parseFloat(e.target.value) || 0;
        updateUI();
      });
    }

    if (el.wallHeightInput) {
      el.wallHeightInput.addEventListener('input', (e) => {
        state.wallHeight = parseFloat(e.target.value) || 0;
        updateUI();
      });
    }

    el.spacingInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        state.studSpacing = parseInt(e.target.value, 10);
        updateUI();
      });
    });

    el.sheetSizeInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        state.drywallSize = e.target.value;
        updateUI();
      });
    });

    if (el.doorsInput) {
      el.doorsInput.addEventListener('input', (e) => {
        state.doors = parseInt(e.target.value, 10) || 0;
        updateUI();
      });
    }

    if (el.windowsInput) {
      el.windowsInput.addEventListener('input', (e) => {
        state.windows = parseInt(e.target.value, 10) || 0;
        updateUI();
      });
    }

    if (el.wasteSlider) {
      el.wasteSlider.addEventListener('input', (e) => {
        state.wastePct = parseInt(e.target.value, 10);
        if (el.wasteValDisplay) el.wasteValDisplay.textContent = `${state.wastePct}%`;
        updateUI();
      });
    }

    // Cost Breakdown Toggle
    if (el.btnToggleCosts && el.costBreakdown) {
      el.btnToggleCosts.addEventListener('click', () => {
        const isOpen = el.costBreakdown.classList.toggle('open');
        el.btnToggleCosts.textContent = isOpen ? 'Hide Details' : 'Show Details';
      });
    }

    // Theme Toggle
    if (el.themeBtn) {
      el.themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
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
        const data = calculateTakeoff();
        const summary = `
=== WallCalculator.app Takeoff Report ===
Wall Span: ${data.lengthFt} ft × ${data.heightFt} ft (Net: ${data.netAreaSqFt} sq ft)
Stud Spacing: ${state.studSpacing}" On-Center | Waste: ${state.wastePct}%

MATERIAL REQUIREMENTS:
- Wood Studs: ${data.totalStuds} pieces (incl. top/bottom plates & corners)
- Drywall Sheets (${state.drywallSize} ft): ${data.totalSheets} sheets
- Drywall Screws: ${data.lbsScrews} lbs (1-1/4")
- Joint Compound: ${data.galMud} gallons
- Joint Tape: ${data.linearFtTape} linear feet
- Estimated Material Cost: $${data.grandTotalCost} USD

Generated on WallCalculator.app
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

    // Mobile Navigation Drawer Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('mobile-open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen);
        mobileMenuBtn.innerHTML = isOpen ? '✕' : '☰';
      });

      // Close menu when a link is clicked
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('mobile-open');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
          mobileMenuBtn.innerHTML = '☰';
        });
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('mobile-open') && !navLinks.contains(e.target) && e.target !== mobileMenuBtn) {
          navLinks.classList.remove('mobile-open');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
          mobileMenuBtn.innerHTML = '☰';
        }
      });
    }
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
