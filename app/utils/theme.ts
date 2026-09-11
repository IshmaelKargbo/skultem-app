// Generates a Tailwind-style 50-950 shade scale from a single brand hex color by mixing it
// toward white (lighter shades) or black (darker shades) in RGB space, then writes the result as
// CSS custom properties on :root - overriding the --color-primary-*/--color-secondary-* scales
// Skultem's own default brand ships with (see assets/css/main.css). Every component already
// renders via `var(--color-primary-500)` etc. (through Nuxt UI's `primary`/`secondary` tokens in
// app.config.ts), so overriding these variables re-themes the whole app live, no rebuild needed.

const LIGHT_MIX: Record<number, number> = {
  50: 0.95,
  100: 0.9,
  200: 0.75,
  300: 0.6,
  400: 0.3,
}

const DARK_MIX: Record<number, number> = {
  600: 0.15,
  700: 0.3,
  800: 0.45,
  900: 0.6,
  950: 0.75,
}

type Rgb = [number, number, number]

function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([a-f\d]{6})$/i.exec(hex.trim())
  if (!match) return null
  const int = parseInt(match[1]!, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function rgbToHex([r, g, b]: Rgb): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ]
}

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]
const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// Returns null for anything that isn't a plain 6-digit hex color (including blank/unset) - the
// caller treats that as "no brand color", not an error.
export function generateShades(hex: string): Record<number, string> | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  const shades: Record<number, string> = { 500: rgbToHex(rgb) }

  for (const [shade, amount] of Object.entries(LIGHT_MIX)) {
    shades[Number(shade)] = rgbToHex(mix(rgb, WHITE, amount))
  }
  for (const [shade, amount] of Object.entries(DARK_MIX)) {
    shades[Number(shade)] = rgbToHex(mix(rgb, BLACK, amount))
  }

  return shades
}

function applyOne(name: 'primary' | 'secondary', hex?: string | null) {
  const root = document.documentElement
  const shades = hex ? generateShades(hex) : null

  if (!shades) {
    // No brand color set (or an invalid value) - clear any earlier override so Skultem's own
    // default scale from assets/css/main.css is what shows, rather than a stale/broken override.
    for (const shade of SHADE_STEPS) {
      root.style.removeProperty(`--color-${name}-${shade}`)
    }
    return
  }

  for (const shade of SHADE_STEPS) {
    root.style.setProperty(`--color-${name}-${shade}`, shades[shade]!)
  }
}

// Applies (or clears) the school's brand colors as live CSS variable overrides. Safe to call
// before the DOM exists (a no-op) - callers don't need their own environment guard.
export function applyBrandColors(primary?: string | null, secondary?: string | null) {
  if (typeof document === 'undefined') return
  applyOne('primary', primary)
  applyOne('secondary', secondary)
}
