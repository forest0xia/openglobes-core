# DESIGN_SYSTEM.md — OpenGlobes Visual Design Specification

> Every UI component in @openglobes/core MUST follow this spec.
> Globe-specific repos inherit this system and only override colors/fonts via theme.

---

## Design Philosophy

**"Deep space observatory"** — the user is looking at Earth through the viewport of a research station. The UI is the instrument panel: precise, minimal, translucent, floating over a dark infinite canvas. Not playful, not corporate — *scientific elegance*.

Reference mood: Apple Vision Pro spatial UI + Bloomberg Terminal dark mode + deep-sea documentary cinematography.

Key principles:
1. **The globe is the hero** — UI panels are translucent overlays that never compete with the globe
2. **Dark-first** — all UI designed for dark backgrounds (each globe has a unique dark palette)
3. **Glassmorphism, not cards** — panels use backdrop-blur + semi-transparent backgrounds, not opaque cards
4. **Monochrome UI, colorful data** — UI chrome is neutral glass. Color is reserved for data points and rarity indicators
5. **Micro-animations everywhere** — every state change is animated (panel slides, point pulses, hover glows)
6. **Information density over simplicity** — this is a data exploration tool, not a marketing page

---

## Color System

### Base palette (CSS custom properties in tokens.css)

```css
:root {
  /* Backgrounds — layered glass */
  --og-bg-void: #050a12;           /* Deepest background behind globe */
  --og-bg-glass: rgba(8, 16, 32, 0.72);  /* Panel backgrounds */
  --og-bg-glass-hover: rgba(12, 24, 48, 0.82);
  --og-bg-glass-active: rgba(16, 32, 64, 0.88);
  --og-bg-surface: rgba(15, 25, 45, 0.55); /* Subtle surface inside panels */

  /* Borders — barely visible */
  --og-border: rgba(100, 160, 255, 0.08);  /* Default border */
  --og-border-hover: rgba(100, 160, 255, 0.15);
  --og-border-active: rgba(100, 160, 255, 0.25);

  /* Text */
  --og-text-primary: rgba(230, 240, 255, 0.95);   /* Headings, values */
  --og-text-secondary: rgba(160, 180, 210, 0.72);  /* Labels, descriptions */
  --og-text-tertiary: rgba(120, 140, 170, 0.5);    /* Hints, placeholders */

  /* Accent — used ONLY for interactive highlights */
  --og-accent: #4cc9f0;
  --og-accent-dim: rgba(76, 201, 240, 0.15);
  --og-accent-glow: rgba(76, 201, 240, 0.3);

  /* Data colors — rarity scale (consistent across all globes) */
  --og-rarity-common: #48bfe6;     /* Cyan */
  --og-rarity-uncommon: #56d6a0;   /* Teal-green */
  --og-rarity-rare: #f9c74f;       /* Gold */
  --og-rarity-legendary: #ef476f;  /* Crimson-pink */
  --og-rarity-mythic: #b185db;     /* Purple */

  /* Semantic */
  --og-success: #56d6a0;
  --og-warning: #f9c74f;
  --og-danger: #ef476f;

  /* Blur */
  --og-blur: 20px;
  --og-blur-heavy: 40px;

  /* Radius */
  --og-radius-sm: 6px;
  --og-radius-md: 10px;
  --og-radius-lg: 16px;
  --og-radius-xl: 24px;
  --og-radius-full: 9999px;

  /* Spacing scale (8px base) */
  --og-space-1: 4px;
  --og-space-2: 8px;
  --og-space-3: 12px;
  --og-space-4: 16px;
  --og-space-5: 20px;
  --og-space-6: 24px;
  --og-space-8: 32px;
  --og-space-10: 40px;
  --og-space-12: 48px;

  /* Shadows — very subtle, colored */
  --og-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --og-shadow-md: 0 4px 24px rgba(0, 0, 0, 0.4);
  --og-shadow-glow: 0 0 20px rgba(76, 201, 240, 0.15);

  /* Transitions */
  --og-transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --og-transition-normal: 250ms cubic-bezier(0.16, 1, 0.3, 1);
  --og-transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);
  --og-transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Per-globe color overrides

Each globe theme overrides ONLY these variables:
```css
/* Fish: deep ocean */
--og-bg-void: #050a12;
--og-accent: #4cc9f0;

/* Dino: warm earth */
--og-bg-void: #0d0800;
--og-accent: #d4a373;

/* Volcano: molten */
--og-bg-void: #0a0200;
--og-accent: #ff6b35;

/* Quake: emergency red */
--og-bg-void: #0a0005;
--og-accent: #ff3355;

/* Meteor: cosmic purple */
--og-bg-void: #050010;
--og-accent: #9b72cf;

/* Shipwreck: murky teal */
--og-bg-void: #020a08;
--og-accent: #2ec4b6;
```

Everything else (text colors, borders, glass backgrounds) stays the same.

---

## Typography

```css
/* Fonts — loaded from Google Fonts */
--og-font-display: 'Outfit', sans-serif;     /* Headlines, globe title, big numbers */
--og-font-body: 'DM Sans', sans-serif;       /* Body text, labels, descriptions */
--og-font-mono: 'JetBrains Mono', monospace; /* Data values, coordinates, IDs */

/* Scale */
--og-text-xs: 11px;     /* Tiny labels, attribution */
--og-text-sm: 13px;     /* Secondary text, filter labels */
--og-text-base: 15px;   /* Body text */
--og-text-lg: 18px;     /* Section headings */
--og-text-xl: 24px;     /* Panel titles */
--og-text-2xl: 32px;    /* Species name in detail view */
--og-text-3xl: 48px;    /* Hero stat numbers */

/* Weights */
--og-font-normal: 400;
--og-font-medium: 500;  /* Most headings */
--og-font-semibold: 600; /* Only for big hero numbers */

/* Letter spacing */
--og-tracking-tight: -0.02em;  /* Large headings */
--og-tracking-normal: 0;
--og-tracking-wide: 0.05em;    /* Tiny uppercase labels */
```

### Usage rules:
- Globe title (e.g., "FishGlobe"): display font, text-xl, medium
- Species/item name: display font, text-2xl, medium, tracking-tight
- Filter section headers: body font, text-sm, UPPERCASE, tracking-wide, text-tertiary
- Data labels (depth, weight): body font, text-sm, text-secondary
- Data values: mono font, text-base, text-primary
- Attribution: body font, text-xs, text-tertiary

---

## Glass Panel Component

THE core UI building block. Every panel (filter, detail, search) is a glass panel.

```css
.og-glass {
  background: var(--og-bg-glass);
  backdrop-filter: blur(var(--og-blur));
  -webkit-backdrop-filter: blur(var(--og-blur));
  border: 1px solid var(--og-border);
  border-radius: var(--og-radius-lg);
  box-shadow: var(--og-shadow-md);
  transition: background var(--og-transition-normal),
              border-color var(--og-transition-normal);
}

.og-glass:hover {
  border-color: var(--og-border-hover);
}

/* Inner sections within a panel */
.og-glass-inset {
  background: var(--og-bg-surface);
  border-radius: var(--og-radius-md);
  border: 1px solid var(--og-border);
  padding: var(--og-space-3) var(--og-space-4);
}
```

### Panel anatomy (FilterPanel example):
```
┌─────────────────────────┐  ← .og-glass, 320px wide desktop
│  FILTERS          [×]   │  ← Header: uppercase label + close btn
│─────────────────────────│  ← 1px border-bottom with --og-border
│  WATER TYPE             │  ← Section: uppercase, text-xs, tracking-wide
│  ┌─────┐┌─────┐┌─────┐ │
│  │Fresh ││Salt ││Brack│ │  ← Chip buttons: og-glass-inset, active = accent border
│  └─────┘└─────┘└─────┘ │
│                         │
│  DEPTH RANGE            │
│  ═══════●═══════════    │  ← Range slider: accent-colored track + thumb
│  0m              8000m  │
│                         │
│  RARITY                 │
│  ● Common    ● Rare     │  ← Colored dots matching rarity scale
│  ● Uncommon  ● Legend.  │
│                         │
│  4,677 species found    │  ← Result count: mono font, text-sm
└─────────────────────────┘
```

---

## Component Specifications

### SearchBar
- Position: top-left, overlaying globe
- Glass background with heavier blur (--og-blur-heavy)
- Left icon: magnifying glass SVG, text-tertiary color
- Input: transparent bg, text-primary, placeholder text-tertiary
- On focus: border transitions to --og-accent-dim, subtle glow shadow
- Dropdown results: glass panel, max 6 results, each with name + scientific name + rarity dot
- Width: 320px desktop, full-width - 32px mobile

### FilterPanel
- Desktop: left sidebar, 320px, glass panel, 16px from edge
- Mobile: bottom sheet, draggable handle at top (4px × 40px rounded pill)
- Sections separated by 1px --og-border lines
- Chip buttons: og-glass-inset, 32px height, text-sm
  - Default: text-secondary
  - Active: border --og-accent, text --og-accent, bg --og-accent-dim
  - Hover: border --og-border-hover
- Range slider: custom styled
  - Track: 3px height, bg --og-bg-surface, rounded-full
  - Active track: bg --og-accent
  - Thumb: 16px circle, bg --og-accent, shadow --og-shadow-glow
- Section label: text-xs, uppercase, tracking-wide, text-tertiary, margin-bottom 12px

### DetailDrawer
- Desktop: right sidebar, 400px, glass panel, slides in from right
- Mobile: full bottom sheet, slides up from bottom, max-height 85vh
- Header: species name (display font, text-2xl) + scientific name (mono, text-sm, text-secondary)
- Image area: 100% width, 200px height, dark fallback bg with subtle gradient
- Metadata grid: 2 columns
  - Label: text-sm, text-secondary
  - Value: mono font, text-base, text-primary
- External links: pill buttons with arrow icon, glass-inset style
- Close: [×] button top-right, or swipe down on mobile
- Entry animation: slide in + fade, 400ms spring easing

### MobileSheet
- Drag handle: centered pill, 4px × 40px, bg text-tertiary, rounded-full
- Three snap points: collapsed (handle only), half (50vh), full (85vh)
- Overscroll: rubber-band effect at limits
- Velocity-based snapping: fast swipe up → full, fast swipe down → collapse
- Background: og-glass with heavier blur
- Touch: prevent page scroll when sheet is being dragged

### LoadingOrb
- Centered in globe container
- Animated wireframe sphere: SVG or CSS, rotating slowly
- Color: --og-accent at 30% opacity
- Pulsing glow animation: scale 0.95 → 1.05, opacity cycling
- Fade out when globe loads (300ms)

### ZoomControls
- Position: bottom-right, 16px from edge
- Two buttons stacked vertically: [+] [−]
- Glass background, 44px × 44px each (touch-friendly)
- Icon: 1.5px stroke, text-secondary, hover → text-primary
- Active: scale(0.92) + accent border flash

### Attribution
- Position: bottom-center
- Collapsed by default: small "ℹ" icon
- Expand on click: glass panel with data source names, licenses, links
- Text: text-xs, text-tertiary
- This is legally required — never remove it

---

## Globe Point Styling

### Rarity-based points on the globe:
```
Common:    #48bfe6  (cyan)      — small dot, 3px
Uncommon:  #56d6a0  (teal)      — medium dot, 4px
Rare:      #f9c74f  (gold)      — larger dot, 5px, subtle pulse animation
Legendary: #ef476f  (crimson)   — largest dot, 6px, constant slow pulse + glow
Mythic:    #b185db  (purple)    — 7px, strong pulse + particle effect
```

### Cluster bubbles (zoomed out):
- Circle with count number inside
- Size proportional to log(count)
- Color: --og-accent at 40% opacity
- Border: --og-accent at 60%
- Text: white, mono font, text-sm

### Hover state (any point):
- Scale up 1.5×
- Add glow ring: 0 0 12px {point-color} at 50%
- Show tooltip above: name + rarity badge

### Selected state:
- Scale up 2×
- Bright glow ring
- DetailDrawer opens with this item's data
- Other points dim to 30% opacity (focus effect)

---

## Animation Specifications

### Panel entrance (filter, detail, search):
```css
/* Desktop: slide from side */
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
animation: slideInRight var(--og-transition-slow) forwards;

/* Mobile: slide from bottom */
@keyframes slideInUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
animation: slideInUp var(--og-transition-spring) forwards;
```

### Globe entrance:
```css
@keyframes globeFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
animation: globeFadeIn 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
```

### Point pulse (rare/legendary):
```css
@keyframes pointPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}
animation: pointPulse 2s ease-in-out infinite;
```

### Loading orb:
```css
@keyframes orbRotate {
  from { transform: rotateY(0deg) rotateX(15deg); }
  to { transform: rotateY(360deg) rotateX(15deg); }
}
@keyframes orbPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.95); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
```

---

## Responsive Breakpoints

```css
/* Mobile first */
--og-bp-sm: 640px;   /* Large phone */
--og-bp-md: 768px;   /* Tablet — panels switch from sheets to sidebars */
--og-bp-lg: 1024px;  /* Desktop */
--og-bp-xl: 1440px;  /* Large desktop — wider panels */
```

### Layout at each breakpoint:
```
Mobile (< 768px):
┌─────────────────────┐
│ [🔍 Search........] │  ← Full width, glass, top
│                     │
│    ╭───────╮        │
│    │       │        │
│    │ GLOBE │        │  ← Full viewport
│    │       │        │
│    ╰───────╯        │
│                     │
│ [+][-]              │  ← Zoom, bottom-right
│ ┌─ ─ ─ ─ ─ ─ ─ ─┐ │  ← Bottom sheet (collapsed)
│ │  ━━━  handle    │ │
│ │  Filters / Det. │ │
│ └─ ─ ─ ─ ─ ─ ─ ─┘ │
└─────────────────────┘

Desktop (≥ 768px):
┌──────────┬────────────────────┬───────────┐
│          │  [🔍 Search..]     │           │
│ FILTER   │                    │  DETAIL   │
│ PANEL    │    ╭──────────╮    │  DRAWER   │
│ 320px    │    │          │    │  400px    │
│ glass    │    │  GLOBE   │    │  glass    │
│          │    │          │    │           │
│          │    ╰──────────╯    │           │
│          │              [+][-]│           │
│          │     ℹ attrib.      │           │
└──────────┴────────────────────┴───────────┘
```

---

## Do NOT:
- Use opaque white/light backgrounds for any panel
- Use Inter, Roboto, Arial, or system fonts
- Use standard box shadows without colored tint
- Use solid borders heavier than 1px
- Use border-radius larger than 24px (except full-round pills)
- Make any UI element fight the globe for attention
- Use bright colors for UI chrome (buttons, borders) — only data points get color
- Skip backdrop-filter — it's the core of the glass effect
- Forget the -webkit-backdrop-filter prefix (Safari)
