# PRLens Design System (Midnight Neon Aesthetic)

This project strictly adheres to the "Midnight Neon" developer aesthetic. The design is built to feel like a high-performance editor or terminal—technical, brutalist, and entirely free of typical SaaS soft purples or heavy drop shadows.

## Core Vibe
- **Style:** Developer-centric / Editor UI / Cyber-minimalism / Clean Brutalism
- **Keywords:** Pitch-black backgrounds, high-contrast neon accents, monospaced metadata, stark structural borders, large brutalist typography.

## Typography
The typography system relies on three distinct fonts to establish hierarchy and a developer feel.

- **Headings (Structural & Brutalist):** `Space Grotesk`
  - Usage: H1, H2, Page titles.
  - Rules: Giant scales on landing pages, extremely tight line height (`0.85m`), and negative letter-spacing (`-0.05em`).
- **Body Text (Legibility):** `Inter`
  - Usage: Paragraphs, descriptions, AI text output.
  - Rules: Clean, readable line height (`1.6`), soft muted colors for secondary text.
- **Accents (Technical & Actionable):** `JetBrains Mono`
  - Usage: Buttons, tabs, metadata, badges, PR tags, file paths.
  - Rules: Often set in `uppercase`, slightly smaller font sizes, bold weight, with loose letter spacing (`1px` to `2px`).

## Color Palette
The app runs exclusively in an ultra-premium dark mode. Pure white and pure black are used only sparingly, preferring zinc scales.

- **Background Primary:** Deep Midnight (`#09090b`) - *Main page background.*
- **Background Secondary:** Zinc 900 (`#18181b`) - *Sidebars, component cards, header bars.*
- **Background Void:** Absolute Black (`#000000`) - *Contrast sections.*
- **Text Primary:** Crisp White (`#fafafa`) or slightly off-white.
- **Text Muted:** Zinc 400 (`#a1a1aa` or `#d4d4d8`).
- **Accent (The Star):** Electric Neon Lemon (`#CCFF00`) - *Active tabs, primary CTA backgrounds, hover text, active border accents, glowing badges.*
- **Borders:** Extremely subtle alpha whites (`rgba(255,255,255,0.05)` to `0.1`) are used to separate layout zones rather than shadows.

## Components & Elements

### Layout Structure
- **Borders over Shadows:** UI sections, cards, and sidebars are separated by crisp `1px solid rgba(255,255,255,0.05)` borders. Shadows are almost never used; if they are, it is a hard neon glow (`box-shadow: 0 4px 20px rgba(204,255,0,0.1)`).
- **Corner Radii:** Sharp edges. Buttons and badges use a `4px` radius. Cards and containers use a maximum of `6px` radius. No fully rounded pills.

### Buttons & Tags
- **Primary Buttons:** JetBrains Mono font, uppercase, `4px` border-radius. Background is solid Neon `#CCFF00`, text is Black `#09090b`. 
- **Badges:** Small, monospaced text. Usually structural with transparent dark backgrounds and thin borders. Active/Success state badges (e.g. "Merged") use `.neon-badge` which gives them `#ccff00` text and a very soft `rgba(204,255,0,0.05)` background.

### Signature Animations
- **Text Slicer (Mask Reveal):** Headings are split into individual lines (`.mask-line` with `overflow: hidden`) housing the text (`.mask-text` sliding up from `translateY(110%)` using `cubic-bezier(0.16, 1, 0.3, 1)` easing). Triggered using IntersectionObserver.
- **Infinite Marquee:** Continuous side-scrolling text strips using CSS transforms for decorative structural elements.
- **Fade Ins:** Standard subtle upward drifts for body content to ensure it doesn't distract from the brutalist headers. 

## Golden Rule
If an element looks "soft", "fluffy", or like a standard marketing site, it breaks the aesthetic. Elements should look like they belong in a specialized IDE toolbar or a high-end CLI output.