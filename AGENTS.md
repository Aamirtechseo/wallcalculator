# On-Page SEO & Content Standard Operating Procedures (SOP)
## WallCalculator.app Site-Wide Architecture & Quality Guidelines

This document locks all on-page SEO, typography, heading, visual layout, and interlinking rules for `wallcalculator.app`. Every existing and newly created page on this website MUST strictly adhere to these standards.

---

### 1. Title Tag Specifications
* **Primary Keyword Placement:** Must feature the primary keyword near the start.
* **Character Limit:** **Strictly under 59 characters** (prevents truncation in Google mobile & desktop SERPs).
* **Click-Through Intent (CTR):** Include high-intent hooks (e.g., `Instant 2D Framing`, `Cost Takeoff`, `Material Estimator`).
* **Example:**
  `Free Wall Calculator - Instant 2D Framing & Cost Takeoff` (56 chars)

---

### 2. Meta Description Specifications
* **Character Limit:** **Strictly under 155 characters** (ensures full snippet visibility).
* **Keyword Placement:** Weave the primary keyword naturally inside the description. **Never start the description with the keyword**.
* **Forbidden Characters:** **NO em-dashes (`—`) or en-dashes (`–`)**. Use standard hyphens (`-`) or commas (`,`).
* **Forbidden Words:** **Zero occurrences of the word "our"** (avoid corporate/unnatural phrasing).
* **Example:**
  `Generate instant 2D framing blueprints and lumber takeoffs with this free wall calculator. Estimate studs, drywall, and costs in seconds. Try it free!` (150 chars)

---

### 3. H1 Heading Rule (LOCKED)
* **Keyword Position:** Must start directly with the Primary Keyword:  
  `<h1><span class="accent">[Primary Keyword]</span>: [Compelling Action Hook]</h1>`
* **Locked Restriction:** **Do NOT prefix with "Free" in the H1 tag**.
* **Example:**
  `Wall Calculator: Instant 2D Framing & Material Takeoff`

---

### 4. First Paragraph / Hero Subtitle Rule
* **Opening Hook:** Must start with a problem-focused hook or construction reality (e.g., preventing lumber waste, framing errors, building code compliance).
* **Locked Restrictions:** 
  * Do **NOT** start the paragraph with the primary keyword or "Our [keyword]".
  * Do **NOT** use the word "our" anywhere in the paragraph or page copy.
* **Keyword Integration:** Weave the primary keyword in naturally within the sentence flow.
* **Example:**
  `Framing errors and lumber miscalculations can quickly derail construction budgets and project timelines. Whether planning an addition, basement buildout, or interior partition, this interactive wall calculator instantly determines exact 2x4 and 2x6 studs, drywall panels, joint compound, and fasteners with real-time 2D framing blueprints.`

---

### 5. Heading Hierarchy & Distribution (H2 vs H3)
* **H2 Headings:**
  * Primary keyword must appear naturally in **exactly one** body H2 heading (e.g., `How a Free Wall Calculator Delivers Accurate Framing Takeoffs`).
  * Primary keyword must appear in the **Conclusion H2 heading** (`Conclusion: Streamline Framing Projects with a Wall Calculator`) and in the conclusion paragraph.
* **H3 Headings (Strict Lock):**
  * **The primary keyword must NEVER appear in any `<h3>` tag**.
  * H3 tags must use companion/secondary terms (e.g., `Stud Framing Estimator`, `Rough Openings: King Studs, Jack Studs & Headers`, `Drywall Hanging Strategy`).

---

### 6. Keyword Density Target
* **Calibration Range:** Strictly between **0.70% and 0.80%** of total page body word count.
* Formula: `(Keyword Matches × 2 / Total Words) × 100` must equal ~`0.75% – 0.78%`.

---

### 7. Design, Contrast & Mobile Responsiveness
* **Dark Theme:** Midnight cyber-indigo (`#060714`), vibrant electric cyan (`#00F0FF`), royal violet (`#8B5CF6`).
* **Light Theme Contrast:**
  * Brand Primary: `#0284C7` (deep blueprint blue, 4.6:1 WCAG AA contrast).
  * Brand Accent: `#7C3AED` / `#6D28D9` (royal purple, 6.5:1 to 7.2:1 contrast).
  * Primary Text: `#0F172A` (15.5:1 contrast).
  * Body Text: `#334155` (7.1:1 WCAG AAA contrast).
* **Mobile Responsiveness (`< 768px`):**
  * Sticky header must collapse desktop links into a slide-down mobile hamburger drawer (`☰` / `✕`).
  * Tab buttons must use responsive spans (`.tab-label-short` on `< 540px`).
  * Takeoff results must arrange in a responsive 2-column grid (`repeat(2, 1fr)`).
  * 2D SVG Blueprint must scale gracefully to `150px` height.

---

### 8. Visual Semantic Layout Architecture (Locked 7-Zone Anatomy)
Every page on `wallcalculator.app` must strictly follow this visual and structural HTML5 hierarchy:

1. **Header Zone (`<header class="header-nav">`):**
   * Sticky nav with Brand Logo, desktop navigation links, theme toggle button, and mobile hamburger drawer button (`☰`/`✕`).
2. **Hero & Interactive Tool Zone (`<section class="hero-section">`):**
   * Left Column: Trust pill badge, H1 heading, hook-first subtitle, trust checklist bullets.
   * Right Column: Dedicated interactive calculator card with mode tabs, dimension inputs, spacing pills, and opening inputs.
3. **Live 2D Blueprint Visualization Zone (`<div class="blueprint-wrapper">`):**
   * Dynamic CAD SVG visualizer that instantly recalculates and visually renders the structure.
4. **Results & Cost Takeoff Dashboard (`<div class="results-section">`):**
   * Material takeoff cards (responsive 2 or 3-column grid), total estimated cost box with toggleable breakdown, and action buttons (Print/PDF & Copy Material List).
5. **The Framing & Masonry Suite Zone (`<section class="suite-section" id="suite-tools">`):**
   * Visual companion tools silo cluster featuring razor-sharp vector SVG icons (never raw emojis) with active/coming-soon states.
6. **Semantic Educational & AEO Article Zone (`<article class="article-section" id="guide-article">`):**
   * **AEO Direct Answer Box (`.aeo-direct-box`):** Concise snippet designed for Google AI Overviews and Featured Snippets.
   * Structured H2 & H3 content sections explaining engineering rules, IRC building codes, and practical advice.
   * **Formula Code Cards (`.formula-card`):** Exact mathematical calculations displayed in monospaced blocks.
   * **Responsive Comparison Table (`.data-table-wrapper`):** Horizontal scrollable table for building code span limits.
   * **Conclusion Box (`.conclusion-box`):** Summary with primary keyword and closing takeaway.
   * **FAQ Accordion (`.faq-list`):** Interactive accordion backed by JSON-LD `FAQPage` schema.
7. **Footer Zone (`<footer class="site-footer">`):**
   * Cross-tool navigation links, disclaimer, and copyright.

---

### 9. Anti-Cannibalization Intent & Keyword Mapping Matrix
To prevent Google from splitting link equity and ranking signals, each URL owns a strictly unique search intent:

| Page URL | Primary Keyword | Search Volume | Keyword Difficulty | Distinct Intent Boundary |
| :--- | :--- | :--- | :--- | :--- |
| **`/` (Homepage)** | `Wall Calculator` | High (Broad) | Variable | All-in-one framing + drywall + fasteners + 2D blueprint |
| **`/wall-stud-calculator.html`** | `Wall Stud Calculator` | 2,400/mo | **12%** | Dedicated stud framing, 16 vs 24 OC, plates, king/jack studs |
| **`/drywall-calculator.html`** | `Drywall Sheet Calculator` | 8,900+/mo | **18%** | 4x8 vs 4x12 panels, joint compound mud, drywall screws |
| **`/retaining-wall-calculator.html`** | `Retaining Wall Calculator` | 1,600/mo | **28%** | Concrete retaining blocks, drainage gravel tons, capstones |
| **`/block-wall-calculator.html`** | `Block Wall Calculator` | 1,000/mo | **14%** | 8x8x16 CMU concrete cinder blocks, mortar bags, core grout |

* **Cannibalization Lock:** The homepage will NEVER target `wall stud calculator` as primary keyword. Child pages will NEVER target `wall calculator` as primary keyword.

---

### 10. Anchor Text Distribution & Internal Linking SOP
Internal links between pages must follow a calibrated ratio to pass maximum topical authority without triggering algorithmic over-optimization penalties:

* **25% Exact Match:** e.g., `wall stud calculator`, `drywall sheet calculator`
* **55% Partial Match:** e.g., `calculate wall framing studs`, `interactive drywall sheet estimator`
* **20% Entity / Contextual:** e.g., `lumber takeoff tool`, `gypsum board calculator`
* **Zero Generic Anchors:** Words like "click here", "read more", "this tool" are strictly prohibited.
