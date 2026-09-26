/**
 * WALLCALCULATOR.APP - Dedicated Wall Stud Calculator Engine
 * Specialized Structural Framing, IRC R602 Plate Math & CAD Visualizer
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    wallLength: 16,     // feet
    wallHeight: 8,      // feet
    studSpacing: 16,    // 12, 16, or 24 inches OC
    lumberSize: '2x4',  // '2x4' or '2x6'
    wallType: 'exterior', // 'interior' or 'exterior'
    corners: 2,         // number of corners/intersections
    doors: 1,
    windows: 1,
    wastePct: 10,       // 10%
    pricePerStud: 4.85, // USD
    nailPricePerLb: 3.50
  };

  // --- DOM ELEMENTS ---
  const el = {
    themeBtn: document.getElementById('theme-toggle-btn'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    navLinks: document.querySelector('.nav-links'),
    
    // Inputs
    wallLengthInput: document.getElementById('stud-wall-length'),
    wallHeightInput: document.getElementById('stud-wall-height'),
    spacingInputs: document.querySelectorAll('input[name="stud-spacing"]'),
    lumberInputs: document.querySelectorAll('input[name="lumber-size"]'),
    wallTypeInputs: document.querySelectorAll('input[name="wall-type"]'),
    cornersInput: document.getElementById('corner-count'),
    doorsInput: document.getElementById('door-count'),
    windowsInput: document.getElementById('window-count'),
    wasteSlider: document.getElementById('waste-slider'),
    wasteValDisplay: document.getElementById('waste-val-display'),
    studPriceInput: document.getElementById('stud-price-input'),
    svgBlueprint: document.getElementById('blueprint-svg'),

    // Outputs
    valTotalStuds: document.getElementById('takeoff-total-studs'),
    valFieldStuds: document.getElementById('takeoff-field-studs'),
    valPlates: document.getElementById('takeoff-plate-studs'),
    valCorners: document.getElementById('takeoff-corner-studs'),
    valOpenings: document.getElementById('takeoff-opening-studs'),
    valNails: document.getElementById('takeoff-framing-nails'),
    valTotalCost: document.getElementById('total-cost-num'),
    costBreakdown: document.getElementById('cost-breakdown-details'),
    btnToggleCosts: document.getElementById('btn-toggle-costs'),
    costTableBody: document.getElementById('cost-table-body'),

    // Actions
    btnPrint: document.getElementById('btn-print-takeoff'),
    btnCopy: document.getElementById('btn-copy-takeoff')
  };

  // --- CALCULATION LOGIC ---
  function calculateStuds() {
    const lengthFt = Math.max(1, parseFloat(state.wallLength) || 16);
    const heightFt = Math.max(4, parseFloat(state.wallHeight) || 8);
    const spacingInches = state.studSpacing;
    const wasteFactor = 1 + (state.wastePct / 100);
    const corners = Math.max(0, parseInt(state.corners) || 0);
    const doors = Math.max(0, parseInt(state.doors) || 0);
    const windows = Math.max(0, parseInt(state.windows) || 0);

    // 1. Field Studs: (Length in inches / spacing) + 1
    const lengthInches = lengthFt * 12;
    const fieldStuds = Math.ceil(lengthInches / spacingInches) + 1;

    // 2. Continuous Horizontal Plates
    // Exterior/Bearing = Double Top Plate + Single Bottom Sole Plate (3 continuous lines)
    // Non-bearing interior can use Single or Double top plate. Standard construction uses 3 plates.
    const plateMultiplier = state.wallType === 'exterior' ? 3 : 3;
    const totalPlateFt = lengthFt * plateMultiplier;
    const plateStuds = Math.ceil(totalPlateFt / heightFt);

    // 3. Corners & Intersections (Standard 3-stud or California corner)
    // Each corner requires 2 additional studs beyond the regular field stud
    const cornerStuds = corners * 2;

    // 4. Rough Openings (King Studs & Jack/Trimmer Studs)
    // Each door: 2 King studs + 2 Jack studs + Header lumber (~4 studs)
    // Each window: 2 King studs + 2 Jack studs + Sill + Header lumber (~4 studs)
    const openingStuds = (doors * 4) + (windows * 4);

    // 5. Totals
    const baseStudTotal = fieldStuds + plateStuds + cornerStuds + openingStuds;
    const totalStudsWithWaste = Math.ceil(baseStudTotal * wasteFactor);

    // 6. Fasteners (16d framing nails: ~6 nails per stud connection, ~100 nails per lb)
    const totalNails = totalStudsWithWaste * 6;
    const framingNailsLbs = Math.max(3, Math.ceil(totalNails / 80));

    // 7. Costs
    const studUnitPrice = parseFloat(state.pricePerStud) || (state.lumberSize === '2x6' ? 7.25 : 4.85);
    const studCost = totalStudsWithWaste * studUnitPrice;
    const nailCost = framingNailsLbs * state.nailPricePerLb;
    const grandTotalCost = (studCost + nailCost).toFixed(2);

    return {
      lengthFt,
      heightFt,
      spacingInches,
      lumberSize: state.lumberSize,
      fieldStuds,
      plateStuds,
      cornerStuds,
      openingStuds,
      baseStudTotal,
      totalStuds: totalStudsWithWaste,
      framingNailsLbs,
      studCost: studCost.toFixed(2),
      nailCost: nailCost.toFixed(2),
      grandTotalCost,
      studUnitPrice
    };
  }

  // --- RENDER DYNAMIC 2D BLUEPRINT SVG ---
  function renderBlueprint(data) {
    if (!el.svgBlueprint) return;

    while (el.svgBlueprint.firstChild) {
      el.svgBlueprint.removeChild(el.svgBlueprint.firstChild);
    }

    const svgW = el.svgBlueprint.clientWidth || 550;
    const svgH = 150;
    const pad = 14;
    const wallW = svgW - (pad * 2);
    const wallH = svgH - (pad * 2);

    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');

    // 1. Top Double Plate
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
    topPlate2.setAttribute('fill', '#F97316');
    topPlate2.setAttribute('opacity', '0.9');
    g.appendChild(topPlate2);

    // 2. Bottom Sole Plate
    const bottomPlate = document.createElementNS(ns, 'rect');
    bottomPlate.setAttribute('x', pad);
    bottomPlate.setAttribute('y', pad + wallH - 6);
    bottomPlate.setAttribute('width', wallW);
    bottomPlate.setAttribute('height', '6');
    bottomPlate.setAttribute('fill', '#F97316');
    g.appendChild(bottomPlate);

    // 3. Vertical Field Studs
    const studHeight = wallH - 18;
    const studY = pad + 12;
    const totalCols = Math.max(2, Math.round((data.lengthFt * 12) / data.spacingInches) + 1);
    const studStepX = wallW / Math.max(1, totalCols - 1);

    for (let i = 0; i < totalCols; i++) {
      const studX = pad + (i * studStepX);
      const stud = document.createElementNS(ns, 'rect');
      stud.setAttribute('x', Math.min(pad + wallW - 3, Math.max(pad, studX - 1.5)));
      stud.setAttribute('y', studY);
      stud.setAttribute('width', '3');
      stud.setAttribute('height', studHeight);
      stud.setAttribute('fill', (i === 0 || i === totalCols - 1) ? '#8B5CF6' : '#0284C7');
      stud.setAttribute('opacity', '0.9');
      g.appendChild(stud);
    }

    // 4. Door Rough Opening
    if (state.doors > 0 && wallW > 150) {
      const doorW = 42;
      const doorH = studHeight;
      const doorX = pad + (wallW * 0.22);
      const doorY = studY;

      // Cutout box
      const doorCutout = document.createElementNS(ns, 'rect');
      doorCutout.setAttribute('x', doorX);
      doorCutout.setAttribute('y', doorY);
      doorCutout.setAttribute('width', doorW);
      doorCutout.setAttribute('height', doorH);
      doorCutout.setAttribute('fill', '#070919');
      doorCutout.setAttribute('stroke', '#F97316');
      doorCutout.setAttribute('stroke-width', '1.5');
      doorCutout.setAttribute('stroke-dasharray', '3 2');
      g.appendChild(doorCutout);

      // Header
      const header = document.createElementNS(ns, 'rect');
      header.setAttribute('x', doorX - 3);
      header.setAttribute('y', doorY);
      header.setAttribute('width', doorW + 6);
      header.setAttribute('height', '9');
      header.setAttribute('fill', '#F97316');
      g.appendChild(header);

      // King & Jack Studs
      const kingLeft = document.createElementNS(ns, 'rect');
      kingLeft.setAttribute('x', doorX - 3);
      kingLeft.setAttribute('y', studY);
      kingLeft.setAttribute('width', '3');
      kingLeft.setAttribute('height', studHeight);
      kingLeft.setAttribute('fill', '#38BDF8');
      g.appendChild(kingLeft);

      const kingRight = document.createElementNS(ns, 'rect');
      kingRight.setAttribute('x', doorX + doorW);
      kingRight.setAttribute('y', studY);
      kingRight.setAttribute('width', '3');
      kingRight.setAttribute('height', studHeight);
      kingRight.setAttribute('fill', '#38BDF8');
      g.appendChild(kingRight);

      // Label
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

    // 5. Window Rough Opening
    if (state.windows > 0 && wallW > 220) {
      const winW = 38;
      const winH = studHeight * 0.52;
      const winX = pad + (wallW * 0.65);
      const winY = studY + (studHeight * 0.18);

      const winCutout = document.createElementNS(ns, 'rect');
      winCutout.setAttribute('x', winX);
      winCutout.setAttribute('y', winY);
      winCutout.setAttribute('width', winW);
      winCutout.setAttribute('height', winH);
      winCutout.setAttribute('fill', '#070919');
      winCutout.setAttribute('stroke', '#38BDF8');
      winCutout.setAttribute('stroke-width', '1.5');
      winCutout.setAttribute('stroke-dasharray', '3 2');
      g.appendChild(winCutout);

      // Header & Sill
      const winHeader = document.createElementNS(ns, 'rect');
      winHeader.setAttribute('x', winX - 3);
      winHeader.setAttribute('y', winY - 7);
      winHeader.setAttribute('width', winW + 6);
      winHeader.setAttribute('height', '7');
      winHeader.setAttribute('fill', '#F97316');
      g.appendChild(winHeader);

      const winSill = document.createElementNS(ns, 'rect');
      winSill.setAttribute('x', winX - 3);
      winSill.setAttribute('y', winY + winH);
      winSill.setAttribute('width', winW + 6);
      winSill.setAttribute('height', '5');
      winSill.setAttribute('fill', '#F97316');
      g.appendChild(winSill);

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

  // --- UPDATE UI ---
  function updateUI() {
    const data = calculateStuds();

    if (el.valTotalStuds) el.valTotalStuds.textContent = data.totalStuds;
    if (el.valFieldStuds) el.valFieldStuds.textContent = data.fieldStuds;
    if (el.valPlates) el.valPlates.textContent = data.plateStuds;
    if (el.valCorners) el.valCorners.textContent = data.cornerStuds;
    if (el.valOpenings) el.valOpenings.textContent = data.openingStuds;
    if (el.valNails) el.valNails.textContent = data.framingNailsLbs + ' lbs';
    if (el.valTotalCost) el.valTotalCost.textContent = '$' + data.grandTotalCost;

    if (el.costTableBody) {
      el.costTableBody.innerHTML = `
        <tr>
          <td>${data.totalStuds} × ${data.lumberSize} Framing Studs (@ $${data.studUnitPrice})</td>
          <td class="cost-num">$${data.studCost}</td>
        </tr>
        <tr>
          <td>${data.framingNailsLbs} lbs × 16d Framing Nails (@ $3.50/lb)</td>
          <td class="cost-num">$${data.nailCost}</td>
        </tr>
      `;
    }

    renderBlueprint(data);
  }

  // --- EVENT LISTENERS ---
  function attachListeners() {
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

    el.lumberInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        state.lumberSize = e.target.value;
        if (el.studPriceInput) {
          el.studPriceInput.value = state.lumberSize === '2x6' ? 7.25 : 4.85;
          state.pricePerStud = parseFloat(el.studPriceInput.value);
        }
        updateUI();
      });
    });

    el.wallTypeInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        state.wallType = e.target.value;
        updateUI();
      });
    });

    if (el.cornersInput) {
      el.cornersInput.addEventListener('input', (e) => {
        state.corners = parseInt(e.target.value, 10) || 0;
        updateUI();
      });
    }

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
        if (el.wasteValDisplay) el.wasteValDisplay.textContent = state.wastePct + '%';
        updateUI();
      });
    }

    if (el.studPriceInput) {
      el.studPriceInput.addEventListener('input', (e) => {
        state.pricePerStud = parseFloat(e.target.value) || 0;
        updateUI();
      });
    }

    // Toggle cost breakdown
    if (el.btnToggleCosts && el.costBreakdown) {
      el.btnToggleCosts.addEventListener('click', () => {
        el.costBreakdown.classList.toggle('open');
        el.btnToggleCosts.textContent = el.costBreakdown.classList.contains('open') ? 'Hide Details ▲' : 'View Details ▼';
      });
    }

    // Print PDF Action
    if (el.btnPrint) {
      el.btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Copy Action
    if (el.btnCopy) {
      el.btnCopy.addEventListener('click', () => {
        const data = calculateStuds();
        const summary = `
=== WallStudCalculator.app Framing Takeoff ===
Wall Length: ${data.lengthFt} ft | Wall Height: ${data.heightFt} ft
Lumber Size: ${data.lumberSize} | Stud Spacing: ${data.spacingInches}" OC | Waste: ${state.wastePct}%

LUMBER TAKE-OFF LIST:
- Total Studs: ${data.totalStuds} pieces
  • Field Vertical Studs: ${data.fieldStuds}
  • Top & Bottom Plates: ${data.plateStuds}
  • Corner Intersections: ${data.cornerStuds}
  • Door & Window Openings: ${data.openingStuds}
- 16d Framing Nails: ${data.framingNailsLbs} lbs
- Estimated Lumber Cost: $${data.grandTotalCost} USD

Generated on WallCalculator.app/wall-stud-calculator.html
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
      renderBlueprint(calculateStuds());
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
