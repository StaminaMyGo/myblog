version: alpha
name: Minimal-design-analysis
description: A restrained, HSL-driven design system in the spirit of the Obsidian "Minimal" theme, recolored with the Apple palette. One accent color (Action Blue #0066cc) drives every interactive element; all backgrounds, borders and text shades are derived from a single base hue/saturation/lightness triplet so light and dark modes share one code path. No decorative gradients, no chrome shadows — only content speaks.

colors:
  # --- Accent (the single interactive color) ---
  accent: "#0066cc"
  accent-hover: "#0071e3"
  accent-on-dark: "#2997ff"
  accent-rgb: "0,102,204"

  # --- HSL base triplet (Minimal's dynamic color engine) ---
  # Light mode defaults. Dark mode only overrides base-l / accent-l.
  base-h: 0
  base-s: 0%
  base-l: 96%
  accent-h: 211
  accent-s: 100%
  accent-l: 40%

  # --- Ink / text ---
  ink: "#1d1d1f"
  text-normal: "#1d1d1f"
  text-muted: "#7a7a7a"
  text-faint: "#cccccc"
  text-on-dark: "#ffffff"
  text-on-dark-muted: "#cccccc"

  # --- Surfaces / backgrounds ---
  background-primary: "#ffffff"
  background-secondary: "#f5f5f7"
  background-secondary-alt: "#fafafc"
  surface-tile-dark-1: "#272729"
  surface-tile-dark-2: "#2a2a2c"
  surface-tile-dark-3: "#252527"
  surface-black: "#000000"
  surface-chip-translucent: "#d2d2d7"

  # --- Lines / dividers ---
  divider-soft: "#f0f0f0"
  hairline: "#e0e0e0"
  border: "#e0e0e0"

  # --- On-colors ---
  on-accent: "#ffffff"
  on-dark: "#ffffff"

typography:
  hero-display:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: -0.28px
  display-lg:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0
  display-md:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.47
    letterSpacing: -0.374px
  lead:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: 0.196px
  tagline:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.19
    letterSpacing: 0.231px
  body-strong:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.24
    letterSpacing: -0.374px
  body:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: -0.374px
  caption:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.224px
  caption-strong:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.29
    letterSpacing: -0.224px
  button-large:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 300
    lineHeight: 1.0
    letterSpacing: 0
  fine-print:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.12px
  nav-link:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.12px

rounded:
  none: 0px
  xs: 5px
  sm: 8px
  md: 11px
  lg: 18px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 17px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

# --- Minimal's derived color system ---
# These are not hard-coded hex values. They are computed from the HSL base
# triplet above, exactly like the Obsidian Minimal theme. Change base-h/s/l
# or accent-h/s/l and the whole interface re-tints automatically.
derived:
  light:
    bg1: "hsl(base-h, base-s, base-l)"                       # primary background
    bg2: "hsl(base-h, base-s, calc(base-l - 2%))"            # secondary background
    bg3: "hsla(base-h, base-s, calc(base-l - 50%), 0.12)"    # hover / overlay
    ui1: "hsl(base-h, base-s, calc(base-l - 6%))"            # subtle border
    ui2: "hsl(base-h, base-s, calc(base-l - 12%))"           # medium border
    ui3: "hsl(base-h, base-s, calc(base-l - 20%))"           # strong border
    tx1: "hsl(base-h, base-s, calc(base-l - 90%))"           # normal text
    tx2: "hsl(base-h, calc(base-s - 20%), calc(base-l - 50%))" # muted text
    tx3: "hsl(base-h, calc(base-s - 10%), calc(base-l - 25%))" # faint text
    ax1: "hsl(accent-h, accent-s, accent-l)"                 # accent
    ax2: "hsl(accent-h, accent-s, calc(accent-l - 8%))"      # accent hover
    ax3: "hsl(accent-h, accent-s, calc(accent-l + 6%))"      # accent active
  dark:
    base-l: 15%
    accent-l: 60%
    bg1: "hsl(base-h, base-s, base-l)"
    bg2: "hsl(base-h, base-s, calc(base-l - 2%))"
    ui1: "hsl(base-h, base-s, calc(base-l + 6%))"
    ui2: "hsl(base-h, base-s, calc(base-l + 12%))"
    ui3: "hsl(base-h, base-s, calc(base-l + 20%))"
    tx1: "hsl(base-h, calc(base-s - 10%), calc(base-l + 67%))"
    tx2: "hsl(base-h, calc(base-s - 20%), calc(base-l + 45%))"
    ax1: "hsl(accent-h, accent-s, accent-l)"

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: 11px 22px
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
  button-secondary-pill:
    backgroundColor: "{colors.background-primary}"
    textColor: "{colors.accent}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: 11px 22px
  button-dark-utility:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 8px 15px
  text-link:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    typography: "{typography.body}"
  text-link-on-dark:
    backgroundColor: transparent
    textColor: "{colors.accent-on-dark}"
    typography: "{typography.body}"
  global-nav:
    backgroundColor: "{colors.surface-black}"
    textColor: "{colors.on-dark}"
    typography: "{typography.nav-link}"
    height: 44px
  sub-nav-frosted:
    backgroundColor: "{colors.background-secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.tagline}"
    height: 52px
  product-tile-light:
    backgroundColor: "{colors.background-primary}"
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: 80px
  product-tile-parchment:
    backgroundColor: "{colors.background-secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: 80px
  product-tile-dark:
    backgroundColor: "{colors.surface-tile-dark-1}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: 80px
  search-input:
    backgroundColor: "{colors.background-primary}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: 12px 20px
    height: 44px
  card:
    backgroundColor: "{colors.background-primary}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: 24px
    border: "1px solid {colors.hairline}"
  footer:
    backgroundColor: "{colors.background-secondary}"
    textColor: "{colors.text-muted}"
    typography: "{typography.fine-print}"
    padding: 64px
