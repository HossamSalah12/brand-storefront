# DESIGN.md — Maison Éthère Luxury Fashion Editorial Design Specification

*Production-ready frontend visual & component specification for implementation in Next.js / Tailwind CSS by Claude Code.*

*Source of Truth: Stitch Canvas Workspace (`DESIGN_SYSTEM_1`, `DOCUMENT_4`, `SCREEN_2`, and Screens `5`–`23`).*

---

## 1. Design Principles & Visual Direction

- **Brand Identity**: Parisian High Fashion Atelier / Contemporary Haute Couture Digital Salon ("Maison Éthère").
- **Core Aesthetic**: Architectural minimalism, generous editorial negative space, warm-to-monochrome contrast, razor-sharp hairline dividers, and museum-grade typography.
- **Tone**: Quiet luxury, confident understatement, tactile, archival, and uncompromisingly dignified.
- **Philosophy**: Interface elements act strictly as pedestals for garments. The UI recedes so fabric texture, silhouette cut, drape, and material qualities take center stage.
- **Inviolable Invariants**:
  - **NO SaaS UI tropes**: Zero heavy drop shadows (`box-shadow: none`), zero multi-color gradients, zero bubble rounded corners, and zero saturated primary colors.
  - **Depth Mechanism**: Depth is achieved solely through warm tonal layering (`#FFFFFF` surfaces over `#FBF9F5` canvas) bounded by `#E8E4DC` hairlines.
  - **Zero Radius Rule**: All buttons, cards, images, dialogs, drawers, and layout panels feature sharp rectilinear corners (`border-radius: 0px`).

---

## 2. Color Palette & Canonical Tokens

### A. Surfaces & Canvases

| Token Name | CSS Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Surface Base** | `--color-surface` | `#FBF9F5` | Global body background (Warm Alabaster Canvas) |
| **Surface Bright** | `--color-surface-bright` | `#FFFFFF` | Elevated cards, input fields, popovers, product card backdrop |
| **Surface Dim** | `--color-surface-dim` | `#F0EDE6` | Subtle recessed wells, secondary modules |
| **Surface Container** | `--color-surface-container` | `#F5F3EF` | Ledgers, side panels, slideover drawers, table headers |
| **Surface Container High** | `--color-surface-container-high`| `#EAE6DF` | Active chips, hover fills, elevated borders |

### B. Text & Foreground Hierarchy

| Token Name | CSS Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **On-Surface (Primary)** | `--color-on-surface` | `#111315` | Deep Parisian ink charcoal; primary headings, body text, icons |
| **On-Surface Muted** | `--color-on-surface-muted` | `#57585A` | Editorial secondary text, subheadings, shipping metadata |
| **On-Surface Tertiary** | `--color-on-surface-tertiary`| `#8C8C8E` | Micro-labels, category overlines, timestamps, breadcrumb links |
| **On-Surface Disabled** | `--color-on-surface-disabled`| `#BCB9B3` | Disabled buttons, unavailable size chips |

### C. Hairlines & Dividers

| Token Name | CSS Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Border Hairline** | `--color-border` | `#E8E4DC` | Universal 1px dividing hairline across all panels and tables |
| **Border Subtle** | `--color-border-subtle` | `#F0EDE6` | Whispering partition lines between minor ledger rows |
| **Border Focus** | `--color-border-focus` | `#111315` | Crisp 2px interactive focus ring |

### D. Accents & Semantic States

| Token Name | CSS Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Accent Bronze / Gold** | `--color-accent-gold` | `#C5A880` | Restrained warm champagne bronze (sparingly for monogram/VIP) |
| **State Success** | `--color-state-success` | `#2D5A43` | Muted forest cypress (order completed, authenticated in-stock) |
| **State Warning** | `--color-state-warning` | `#9C6826` | Deep amber ochre (low stock warnings, e.g. "1 piece remaining") |
| **State Error** | `--color-state-error` | `#9E2A2B` | Deep garnet red (form errors, payment declined, alert badges) |

---

## 3. Typography System

### A. Font Families

```css
--font-display: 'Bodoni Moda', Didot, 'Playfair Display', Georgia, serif;
--font-sans: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
```

- **Display & Monograph Titles**: Neoclassical serifs with high stroke contrast (`Bodoni Moda`).
- **Body, Metadata, & Interface**: Disciplined, hyper-legible geometric grotesque sans-serifs (`Plus Jakarta Sans`).
- **Tabular Figures**: Prices, waybill numbers, and dates must use tabular lining figures:
  ```css
  font-variant-numeric: tabular-nums;
  ```

### B. Type Scale & Cadence

| Level | Font Family | Size | Weight | Line Height | Tracking (Letter Spacing) | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `Bodoni Moda` | `48px` – `64px` | 400 | 1.1 | `-0.02em` | Homepage Monograph Hero, Runway Titles |
| **H1 Headline** | `Bodoni Moda` | `36px` – `42px` | 400 | 1.15 | `-0.015em` | PLP Category Title, Account Title, Order Confirmed |
| **H2 Section** | `Bodoni Moda` | `24px` – `28px` | 400 | 1.25 | `0em` | PDP Product Title, "Silhouettes Complémentaires" |
| **H3 Subsection** | `Bodoni Moda` | `18px` – `20px` | 400 | 1.3 | `0em` | Product Card Names, Cart Drawer Drawer Headings |
| **Overline / Tag** | `Plus Jakarta Sans` | `10px` – `11px` | 600 | 1.2 | `+0.15em` (Caps) | `"TAILORING"`, `"COLLECTION FW25"`, `"SALON PRIVÉ"` |
| **Body Primary** | `Plus Jakarta Sans` | `14px` – `15px` | 400 | 1.6 | `+0.01em` | Fabric composition notes, craftsmanship dossier |
| **Body Secondary**| `Plus Jakarta Sans` | `13px` – `14px` | 400 | 1.5 | `+0.01em` | Address lines, shipping ledger details, policy copy |
| **Caption / Meta**| `Plus Jakarta Sans` | `11px` – `12px` | 500 | 1.4 | `+0.06em` (Caps) | Colorway labels, size codes, timestamps |
| **Financial / Num**| `Plus Jakarta Sans` | `14px` – `18px` | 500 | 1.2 | `0em` (Tabular) | Prices (`€1,850.00`), Subtotals, Waybill Codes |

---

## 4. Spacing System (8pt Editorial Cadence)

```css
--space-1: 4px;   /* Micro badges, inline tags */
--space-2: 8px;   /* Icon gaps, chip spacing */
--space-3: 12px;  /* Vertical form input padding */
--space-4: 16px;  /* Mobile gutter, standard card padding */
--space-5: 20px;  /* Field gaps, compact list gutters */
--space-6: 24px;  /* Desktop card insets, button heights */
--space-8: 32px;  /* Section sub-headers, column gaps */
--space-10: 40px; /* Modular gutters */
--space-12: 48px; /* Component vertical rhythm */
--space-16: 64px; /* Standard section padding on desktop */
--space-20: 80px; /* Generous breathing room between editorial chapters */
--space-24: 96px; /* Campaign hero spacing, monograph footer gap */
```

---

## 5. Grid System & Layout Boundaries

- **Desktop Grid (≥1024px)**: 12-column fluid grid, `32px` gutter width, outer margins `48px` to `80px`.
- **Tablet Grid (768px–1023px)**: 8-column fluid grid, `20px` gutter width, outer margins `32px`.
- **Mobile Grid (<768px)**: 4-column grid (or 2-column product grid), `16px` gutters, outer margin `16px` to `20px`.
- **Maximum Content Container**: `1440px` centered (`max-w-[1440px] mx-auto`).
- **Narrow Editorial Container**: `980px` – `1040px` (for Single Column Checkout, Order Details, Archival Articles).
- **Drawer Width**: `460px` max on Desktop; `100vw` on Mobile.

---

## 6. Borders, Shadows, and Gradients

### A. Border Radius Rules

- **`rounded-none` (`border-radius: 0px`)**: Mandatory baseline across all Primary buttons, Secondary buttons, Product Cards, Images, Modals, Drawers, Footers, and Form Inputs.
- **`rounded-full` (`border-radius: 9999px`)**: Strictly restricted to:
  1. Status milestone indicator dots (e.g., green live dispatch dot).
  2. Circular colorway swatches.
  3. Client monogram avatar badges.

### B. Shadows & Gradients Rules

- **Drop Shadows**: `box-shadow: none !important;` across all standard components.
- **Floating Sticky Headers**: Subtle architectural blur shadow:
  ```css
  box-shadow: 0 4px 20px rgba(17, 19, 21, 0.04);
  ```
- **Gradients**: Zero colored, vibrant, or multi-stop gradients. Pure monochromatic surfaces only.

---

## 7. Master Components & Interactive States

### A. Buttons & Interactive Triggers

All interactive buttons have a minimum touch target of `50px` on Desktop and `48px` on Mobile.

1. **Primary Button (`.btn-primary`)**:
   - `background-color: #111315; color: #FFFFFF; border: 1px solid #111315; border-radius: 0;`
   - Typography: `11px` – `12px`, font-weight `600`, `letter-spacing: 0.12em`, `text-transform: uppercase`.
   - Padding: `16px 28px`.
   - Hover: `background-color: #2B2D2F; border-color: #2B2D2F; transition: background-color 150ms ease;`
   - Focus: `outline: 2px solid #111315; outline-offset: 2px;`
   - Active: `background-color: #000000; transform: translateY(1px);`
   - Disabled: `background-color: #F5F3EF; color: #BCB9B3; border-color: #E8E4DC; cursor: not-allowed;`

2. **Secondary / Outline Button (`.btn-secondary`)**:
   - `background-color: transparent; color: #111315; border: 1px solid #111315; border-radius: 0;`
   - Typography: Same as Primary.
   - Hover: `background-color: #111315; color: #FFFFFF; transition: all 150ms ease;`
   - Active: `background-color: #2B2D2F; color: #FFFFFF;`
   - Disabled: `color: #BCB9B3; border-color: #E8E4DC; cursor: not-allowed;`

3. **Tertiary / Ghost Button (`.btn-ghost`)**:
   - `background-color: transparent; color: #111315; border: none; padding: 12px 0; border-radius: 0;`
   - Typography: `11px`, font-weight `600`, `letter-spacing: 0.12em`, uppercase.
   - Hover: Underline appears (`text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px;`).

4. **Loading Button State**:
   - Maintains original button dimensions. Copy is hidden or replaced by a centered micro-spinner ring:
     ```css
     .micro-spinner {
       width: 16px; height: 16px;
       border: 1px solid currentColor;
       border-top-color: transparent;
       border-radius: 9999px;
       animation: spin 0.8s linear infinite;
     }
     ```

---

### B. Form Fields & Controls

1. **Text Inputs & Search (`.input-text`)**:
   - Container: Minimalist box with `1px solid #E8E4DC` border, `background-color: #FFFFFF`, `border-radius: 0;`.
   - Height / Padding: `14px 16px` (Height: `48px`).
   - Font: `13px Plus Jakarta Sans`, color `#111315`.
   - Placeholder: `#8C8C8E`.
   - Focus State: `outline: none; border-color: #111315; box-shadow: 0 0 0 1px #111315;`.
   - Error State: `border-color: #9E2A2B; box-shadow: 0 0 0 1px #9E2A2B;`.
   - Label Treatment: Stacked floating overline: `10px Plus Jakarta Sans`, font-weight `600`, uppercase, `letter-spacing: 0.12em`, color `#57585A`, `margin-bottom: 6px`.

2. **Checkboxes**:
   - Custom `18px x 18px` square box (`border-radius: 0;`), `border: 1px solid #111315`.
   - Unchecked: `background-color: #FFFFFF;`
   - Checked: `background-color: #111315;` with an internal razor-thin white checkmark vector.

3. **Radio Controls**:
   - `18px x 18px` circular control (`border-radius: 9999px;`), `border: 1px solid #111315`.
   - Unchecked: `background-color: transparent;`
   - Checked: Centered `8px x 8px` solid `#111315` inner dot.

4. **Variant / Sizing Chips**:
   - Height: `44px`, min-width `44px`, `border: 1px solid #E8E4DC`, `border-radius: 0;`, `background-color: #FFFFFF; color: #111315;`.
   - Typography: `11px Plus Jakarta Sans`, weight `600`, uppercase.
   - Hover: `border-color: #111315;`
   - Selected: `background-color: #111315; color: #FFFFFF; border-color: #111315;`
   - Out of Stock / Disabled: `background-color: #F5F3EF; color: #BCB9B3; border-color: #E8E4DC; cursor: not-allowed; position: relative; overflow: hidden;` with a subtle 45-degree diagonal hairline slash (`#E8E4DC`).

5. **Quantity Stepper**:
   - Rectangular unified container with `1px solid #E8E4DC` border.
   - Flex row: `[ − ] [ 01 ] [ + ]`.
   - Hit areas: Minimum `44px x 44px` for decrement and increment triggers; centered value in tabular lining figures.

---

### C. Navigation Chrome & Shell Elements

1. **Announcement Bar**:
   - Height: `32px`.
   - Background: `#111315`. Text: `#FBF9F5`.
   - Typography: `10px Plus Jakarta Sans`, font-weight `600`, uppercase, tracking `+0.15em`.
   - Content: `"COMPLIMENTARY WORLDWIDE COURIER DELIVERY & CLIMATE-NEUTRAL PACKAGING — AUTUMN/WINTER 2025"`.

2. **Header / Navbar**:
   - Height: `72px` (Desktop) / `56px` (Mobile & Sticky scroll).
   - Surface: `#FBF9F5` with `border-bottom: 1px solid #E8E4DC;`.
   - Desktop Layout: 3-column split:
     - Left: Category navigation (`WOMEN`, `MEN`, `ACCESSORIES`, `SHOES`, `EDITORIAL`, `MAISON`) in `11px Plus Jakarta Sans`, tracking `+0.12em`.
     - Center: `Maison Éthère` high-contrast serif logo wordmark (`22px Bodoni Moda`, regular, tracking `+0.05em`).
     - Right: Utility cluster (`EUR / EN`, Search icon, Wishlist `♡ (0)`, Bag `[0]`).
   - Mobile Layout: Left hamburger menu trigger (`44px` touch hit area), Center logo wordmark, Right Bag counter `[0]`.

3. **Footer**:
   - Surface: `#FBF9F5` with `border-top: 1px solid #E8E4DC`.
   - Padding: `80px 0 40px`.
   - Desktop Structure: 4-column directory:
     1. Collections (Ready-to-Wear, Tailoring, Handcrafted Leather, Footwear, Fine Jewelry).
     2. Client Services (Private Styling, Concierge Care, Complimentary Alterations, Global Shipping, Returns & Exchanges).
     3. The Maison (Heritage & Atelier, Sustainable Craftsmanship, Editorial Journal, Careers, Press).
     4. Private Salon / Newsletter (Email input with adjacent black `SUBSCRIBE` trigger).
   - Bottom Legal Bar: `border-top: 1px solid #E8E4DC; padding-top: 24px;` containing copyright notice, Terms of Service, Privacy Policy, Cookie Preferences, and Accessibility statement.

---

### D. Product Presentation Components

1. **Product Card (The Core Molecule)**:
   - Aspect Ratio: Strict `3:4` vertical portrait orientation.
   - Background Well: `#F5F3EF`.
   - Image Framing: Architectural high-fashion crop, model from neck to knee or pristine silhouette drape.
   - Wishlist Icon: Positioned top-right (`16px` inset), hairline vector heart with `44px` touch area.
   - Badging: Micro badge top-left (`NEW SEASON`, `ONLY 1 REMAINING`) in `10px Plus Jakarta Sans`, font-weight `600`, tracking `+0.12em`, `#111315` text over white badge with `1px solid #E8E4DC`.
   - Metadata Stack:
     1. Overline: Capsule category (e.g. `TAILORING · AW25`), `10px`, `#8C8C8E`.
     2. Title: Garment name (e.g. `The Solène Structured Blazer`), `14px Bodoni Moda`, regular, `#111315`.
     3. Price: `€1,850.00`, `13px Plus Jakarta Sans`, tabular figures.
   - Hover State:
     - Primary image crossfades smoothly (`400ms ease-out`) to secondary detail image (e.g., fabric weave or runway turn).
     - Bottom drawer bar slides up from base of card revealing quick size selectors (`FR 34 · FR 36 · FR 38 · FR 40`).

2. **Product Detail Page (PDP) Layout**:
   - Desktop Split: Asymmetrical 12-column split (Left 7 columns: multi-angle vertical editorial gallery; Right 5 columns: sticky purchasing dossier).
   - Gallery Presentation: Full-resolution vertical scroll or thumbnail rail with generous `16px` vertical gaps.
   - Purchasing Dossier:
     - Overline & Breadcrumb trail (`COLLECTION / WOMEN / TAILORING / THE SOLÈNE BLAZER`).
     - Product Title in `28px Bodoni Moda`.
     - Price & Tax indicator (`€1,850.00 EUR · All applicable duties included`).
     - Colorway Swatch list with active selection ring.
     - Size Selection grid with integrated "Size Dossier / Anatomical Guide" modal trigger.
     - Primary Action: Full-width black button `"ADD TO PRIVATE BAG — €1,850.00"`.
     - Secondary Action: `"REQUEST PRIVATE ATELIER FITTING"`.
     - Atelier Accordions: Craftsmanship dossier, Material provenance (e.g., *Double-faced Super 130s wool from Biella*), Delivery & Complimentary Returns.

---

### E. Commerce Ledgers & Transactional Flows

1. **Cart Slideover Drawer**:
   - Position: Fixed right-edge slideover (`width: 460px` desktop, `100vw` mobile).
   - Surface: `#FBF9F5` with `border-left: 1px solid #E8E4DC`.
   - Backdrop: `rgba(17, 19, 21, 0.4)` with `backdrop-filter: blur(4px)`.
   - Header: `"Your Wardrobe Selection (2)"` with hairline close trigger `✕`.
   - Item Row: Tabular layout with `3:4` thumbnail, garment title in `14px Bodoni Moda`, selected size/color chips, quantity stepper, price, and discreet `"Remove"` trigger.
   - Packaging Option: Radio/Checkbox for `"Include climate-neutral cedar gift casing & archival box"`.
   - Sticky Summary Ledger:
     - Subtotal, complimentary carbon-offset delivery notation, customs breakdown.
     - Total Due in `18px Plus Jakarta Sans` tabular numbers.
     - Primary CTA: `"PROCEED TO SECURE DISPATCH"`.

2. **Checkout Flow (Single-Column Bespoke Dossier)**:
   - Max Width: `980px` centered.
   - Accordion Stepper:
     1. Authentication / Client Email (`salon.prive@client.com`).
     2. Dispatch Address (floating labels, postcode validation).
     3. Courier Allocation (White-Glove Private Courier vs. Carbon-Neutral Air Express).
     4. Payment Protocol (Encrypted Credit Vault, Apple Pay, Concierge Wire Transfer).
   - Review Ledger: Itemized side ledger with transparent duty calculation and order total.

3. **Order Confirmation & Tracking**:
   - Archival Waybill Ledger: Monograph receipt layout topped with `"Order Confirmed — Reference #ME-8832-AW25"`.
   - Logistics Milestone Timeline: Vertical or horizontal progress pipeline:
     - `Allocated at Atelier` → `Crafting & Inspection` → `Dispatched via Secure Courier` → `Delivered to Salon`.
     - Completed milestones denoted by `#2D5A43` forest cypress dots; pending milestones in `#BCB9B3`.

4. **Self-Service Returns & Exchanges**:
   - Interactive Item Checklist: Patrons select specific pieces from their order history, choose action (`Exchange for Alternate Size` vs. `Return to Atelier Archive`), select return reason, and generate instant digital courier waybill / QR codes.

---

### F. Overlays, Modals, & Feedback States

1. **Modal Windows**:
   - Surface: `#FFFFFF` or `#FBF9F5`, `border: 1px solid #E8E4DC`, `border-radius: 0; box-shadow: none;`.
   - Backdrop: `rgba(17, 19, 21, 0.4)` with `backdrop-filter: blur(4px)`.
   - Close Trigger: Minimalist `24px` hairline `✕` with `44px` hit target.

2. **Toast Notifications**:
   - Position: Top-right viewport coordinates (`top: 24px; right: 24px;`).
   - Surface: `#FFFFFF`, `border: 1px solid #E8E4DC`, `border-radius: 0; padding: 16px 20px; min-width: 320px;`.
   - Typography: `12px Plus Jakarta Sans`, `#111315`.

3. **Empty States (Cart, Wishlist, Orders)**:
   - Aesthetic: Archival and poetic.
   - Icon: Hairline vector luggage tag, archival envelope, or hanger.
   - Heading: `22px Bodoni Moda`, e.g., *"Your Private Archive is Empty"*.
   - Body: *"Explore the Autumn/Winter capsule to assemble your personal wardrobe."*
   - CTA: Single black primary button `"DISCOVER THE CAPSULE"`.

4. **Loading Skeletons**:
   - Background Pulse: Warm muted wave shimmering between `#F5F3EF` and `#EAE6DF` (never cold blue/gray).
   - Animation Timing: `1.8s` continuous ease-in-out wave.

5. **Error Banners**:
   - Surface: `#FDF7F7` (delicate rose tint), `border: 1px solid #9E2A2B; padding: 14px 18px;`.
   - Typography: `12px Plus Jakarta Sans`, color `#9E2A2B`.

---

## 8. Responsive Specifications & Breakpoints

```css
/* Breakpoint Tokens */
--breakpoint-sm: 640px;   /* Small phablet */
--breakpoint-md: 768px;   /* Tablet portrait */
--breakpoint-lg: 1024px;  /* Tablet landscape / Standard laptop */
--breakpoint-xl: 1280px;  /* Desktop monitor */
--breakpoint-2xl: 1536px; /* High-res studio display */
```

### A. Desktop (≥1024px)

- 12-column grid with `32px` gutters.
- Full split navigation header.
- Asymmetrical PDP with sticky right purchasing column.
- 460px right slideover cart drawer.

### B. Tablet (768px – 1023px)

- 8-column grid with `20px` gutters.
- Collapsible filter trigger panel on PLP.
- 2-column or 3-column product card grid.

### C. Mobile (<768px)

- 4-column grid, `16px` page gutters.
- PLP: 2-column compact product card grid (`12px` row gap, `8px` column gap).
- PDP: Horizontal swipeable image carousel with indicator pips.
- Sticky Bottom Action Bar: Fixed to viewport base on PDP with blur surface:
  ```css
  background: rgba(251, 249, 245, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid #E8E4DC;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  ```
- All interactive touch targets strictly enforce `min-height: 48px` and `min-width: 48px`.

---

## 9. RTL & Arabic Language Adaptations

When rendering Arabic (`dir="rtl"` / `lang="ar"`):

1. **Typography Substitution**:
   - High-contrast Naskh / Amiri style serif for display headlines (`font-family: 'Amiri', 'Traditional Arabic', serif;`).
   - Clean, modern IBM Plex Sans Arabic or Noto Sans Arabic for body copy and interface labels.

2. **Directional Inversions**:
   - Navigation: Logo remains centered; category links align right; utility icons align left.
   - Drawers: Cart drawer slides in from the **left** edge (`transform: translateX(-100%) -> translateX(0)`).
   - Chevrons & Carets: Inverted horizontally (`rotate(180deg)`).
   - PDP Asymmetrical Split: Editorial image gallery aligns right; sticky purchase dossier pins to the left.
   - Numerical Currency: Maintains Latin numbers with `tabular-nums` (e.g., `1,850.00 ر.س` or `1,850.00 €`).

---

## 10. Motion & Animation Guidelines

Motion must feel heavy, tactile, and measured — never frenetic or cartoonish.

```css
/* Timing Tokens */
--duration-fast: 150ms;       /* Button color swaps, chip selection */
--duration-normal: 300ms;     /* Accordion expansions, dropdowns */
--duration-deliberate: 500ms; /* Image reveals, drawer slide, modal entrance */

/* Easing Curves */
--ease-editorial: cubic-bezier(0.25, 1, 0.5, 1);
--ease-snap: cubic-bezier(0.16, 1, 0.3, 1);
```

- **Product Card Image Hover**: Subtle scale zoom strictly capped at `scale(1.03)` over `600ms cubic-bezier(0.25, 1, 0.5, 1)`.
- **Wishlist Toggle**: Gentle pulse bounce (`scale(1.2) -> scale(1.0)` over `200ms`) with immediate `#111315` fill.
- **Cart Drawer Slide**: `transform: translateX(100%) -> translateX(0)` in `350ms cubic-bezier(0.25, 1, 0.5, 1)`.
- **Accordion Expansion**: CSS grid height transition (`grid-template-rows: 0fr -> 1fr`) over `300ms ease`.

### Reduced Motion Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 11. Accessibility (WCAG 2.1 AA Standards)

- **Contrast Compliance**:
  - Ink Charcoal (`#111315`) on Warm Alabaster (`#FBF9F5`) yields `16.4:1` (Surpasses AAA).
  - Editorial Muted (`#57585A`) on Warm Alabaster (`#FBF9F5`) yields `6.8:1` (Surpasses AA requirement of 4.5:1).
- **Keyboard Navigation**:
  - High-visibility focus ring on all focusable interactive controls:
    ```css
    :focus-visible {
      outline: 2px solid #111315;
      outline-offset: 2px;
    }
    ```
- **Screen Reader Announcements**:
  - Dynamic stock updates and cart drawers must utilize `aria-live="polite"`.
  - All icon-only triggers (`♡`, `✕`, `[0]`) must contain descriptive `aria-label` tags (e.g. `aria-label="Add The Solène Blazer to Wishlist"`).

---

*End of DESIGN.md specification. Hand directly to Claude Code to initiate implementation in Next.js.*
