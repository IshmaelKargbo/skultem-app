import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const MM_PER_PX_AT_96DPI = 25.4 / 96

// html2canvas can't parse oklch()/color-mix() — the color functions Tailwind
// v4's default palette (gray, white, etc.) compiles to — and throws instead
// of silently falling back. The report-card PDF plugin (plugins/pdf.client.ts)
// hit this exact problem; this ports its fix: inline every computed color
// AND strip all stylesheets from html2canvas's own internal clone (via
// `onclone`), since pseudo-elements and cascade-inherited colors can't be
// neutralized by setting inline styles on the real elements alone.
// Chrome's computed styles can surface any of CSS Color Level 4's functions —
// oklch/oklab are the common ones Tailwind v4 emits, but lab/lch/color() show
// up too (e.g. color-mix() results resolve to one of these) — html2canvas
// (a canvas2d-based renderer) understands none of them and throws.
const UNSUPPORTED_COLOR_FN = /\b(oklch|oklab|lab|lch|color-mix|color)\(/i

function isUnsupportedColor(value: string): boolean {
    return !!value && UNSUPPORTED_COLOR_FN.test(value)
}

// Tried letting a canvas 2D context's `fillStyle` setter/getter round-trip
// oklch → hex for us — that's the standard trick, and it does work in older
// engines that only understand sRGB internally. It doesn't here: this
// Chrome build's Canvas 2D understands oklch as a first-class color space
// and just echoes the string back unchanged, so every value silently stayed
// oklch (confirmed by testing raw strings through it in isolation) and only
// got caught by the blunt cssText regex fallback below — which is exactly
// why unrelated colors (amber-50, gray-800, amber-600) were all landing on
// the same flat gray. A real conversion means doing the color math: OKLCH
// -> OKLab -> LMS -> linear sRGB -> gamma-encoded sRGB, per the CSS Color 4
// spec (this is Björn Ottosson's reference oklab conversion).
function oklchComponentsToHex(L: number, C: number, hDeg: number, alpha = 1): string {
    const hRad = (hDeg * Math.PI) / 180
    const a = C * Math.cos(hRad)
    const b = C * Math.sin(hRad)
    return oklabComponentsToHex(L, a, b, alpha)
}

function oklabComponentsToHex(L: number, a: number, b: number, alpha = 1): string {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b
    const s_ = L - 0.0894841775 * a - 1.291485548 * b

    const l = l_ ** 3
    const m = m_ ** 3
    const s = s_ ** 3

    const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

    const gamma = (c: number) => {
        const clamped = Math.min(1, Math.max(0, c))
        return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055
    }

    const toByte = (c: number) => Math.round(gamma(c) * 255)
        .toString(16)
        .padStart(2, '0')

    const hex = `#${toByte(rLin)}${toByte(gLin)}${toByte(bLin)}`
    if (alpha >= 1) return hex

    return hex + Math.round(alpha * 255).toString(16).padStart(2, '0')
}

// Percentage-or-bare-number component, per CSS Color 4 (L in oklch/oklab is
// always 0–1 or 0%–100%; C/a/b/alpha follow the same rule against their own
// reference ranges — but for our purposes as literal numbers straight out of
// a browser-serialized value, treating any "%" suffix as /100 and passing
// bare numbers through covers every case getComputedStyle actually emits).
function component(raw: string): number {
    return raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw)
}

function oklchToHex(value: string): string {
    const oklch = value.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i)
    if (oklch) {
        const alpha = oklch[4] ? component(oklch[4]) : 1
        return oklchComponentsToHex(component(oklch[1]!), component(oklch[2]!), parseFloat(oklch[3]!), alpha)
    }

    const oklab = value.match(/oklab\(\s*([\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)/i)
    if (oklab) {
        const alpha = oklab[4] ? component(oklab[4]) : 1
        return oklabComponentsToHex(component(oklab[1]!), component(oklab[2]!), component(oklab[3]!), alpha)
    }

    // lab()/lch()/color-mix()/color() results — rare in practice (Tailwind's
    // default palette never emits these), and not worth writing three more
    // conversions for on spec. Neutral mid-gray beats a thrown exception.
    return '#888888'
}

function stripUnsupportedColors(value: string, property: string): string {
    if (!value) return value
    if (property === 'backgroundImage' && isUnsupportedColor(value)) return 'none'
    if (isUnsupportedColor(value)) return oklchToHex(value)
    return value
}

function forceInlineStyles(element: HTMLElement, sourceWindow: Window = window) {
    const all = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[]

    all.forEach((el) => {
        const computed = sourceWindow.getComputedStyle(el)

        Array.from(computed).forEach((prop) => {
            if (prop.startsWith('--')) return
            const value = computed.getPropertyValue(prop)
            if (!value) return

            if (isUnsupportedColor(value)) {
                if (prop === 'background-image') {
                    el.style.setProperty(prop, 'none')
                    return
                }
                if (prop.includes('color') || prop === 'fill' || prop === 'stroke') {
                    el.style.setProperty(prop, oklchToHex(value))
                }
                return
            }

            el.style.setProperty(prop, value, computed.getPropertyPriority(prop))
        })

        const props: (keyof CSSStyleDeclaration)[] = [
            'backgroundColor', 'color', 'borderColor', 'borderTopColor', 'borderRightColor',
            'borderBottomColor', 'borderLeftColor', 'outlineColor', 'textDecorationColor', 'fill', 'stroke'
        ]

        props.forEach((prop) => {
            const value = computed[prop] as string
            if (!value) return
            el.style[prop as any] = isUnsupportedColor(value)
                ? oklchToHex(value)
                : value
        })

        el.style.backgroundImage = stripUnsupportedColors(computed.backgroundImage, 'backgroundImage')
        el.style.boxShadow = 'none'
        el.style.filter = 'none'
        el.style.backdropFilter = 'none'
        el.style.textShadow = 'none'

        // The app's body font (Geist) is a variable webfont — html2canvas
        // draws text on a raw canvas 2D context, and if a variable font's
        // requested weight isn't a fully "settled" static instance at
        // capture time, the browser synthesizes bold by double-stamping the
        // glyph with a pixel offset. On the DOM that reads as a normal
        // embolden; through canvas2d it reads as visible ghosting/smearing
        // (exactly what showed up in exported PDFs). A real static font has
        // no synthesis step, so force one for the capture only — this
        // clone never reaches the screen, just the exported image.
        // !important: the computed-style copy above may have included the
        // `font` shorthand (which bundles family/weight/etc. into one
        // string) — if that got applied after this in cascade order it
        // would silently win over a plain assignment and undo this.
        el.style.setProperty('font-family', 'Arial, Helvetica, sans-serif', 'important')
        el.style.setProperty('font-variation-settings', 'normal', 'important')

        // html2canvas has a long-standing bug where letter-spacing on bold
        // text gets drawn twice (once per its normal text path, once per the
        // per-glyph path it falls back to for manual letter-spacing) —
        // exactly the ghosting seen here, and exactly why it only ever hit
        // the tracking-wide/tracking-widest bold headings and labels, never
        // the plain unspaced label text next to them. Flatten it for the
        // capture; the on-screen card keeps its real letter-spacing.
        el.style.letterSpacing = 'normal'

        // Belt-and-suspenders: the property-by-property pass above only
        // catches oklch/oklab/etc. when it shows up as a *whole* property
        // value. It's still very much alive here — html2canvas keeps
        // throwing on this element even after that pass runs — which means
        // something is slipping through: most likely a composite value
        // (a gradient color stop, a multi-layer background/shadow) where the
        // function is embedded *inside* a longer string my per-property
        // checks don't parse into parts. Scrub the fully serialized inline
        // style text directly instead of trying to enumerate every
        // composite property shape that could hide one.
        if (UNSUPPORTED_COLOR_FN.test(el.style.cssText)) {
            el.style.cssText = el.style.cssText.replace(
                /\b(?:oklch|oklab|lab|lch|color-mix|color)\([^)]*\)/gi,
                '#888888'
            )
        }
    })
}

function isolateClonedDocument(clonedDocument: Document, clonedElement: HTMLElement, width: number, height: number) {
    // Tried leaving the stylesheet in place (inline styles already win on
    // specificity, so it seemed redundant) — that produced a corrupted PDF
    // (invalid embedded image), not just a styling regression. html2canvas
    // parses the *raw stylesheet* itself for some decisions, not only
    // computed styles, and its CSS parser can't handle Tailwind v4's syntax
    // (@property, nested rules, CSS layers). So this stays necessary.
    clonedDocument.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove())

    clonedDocument.documentElement.style.background = '#ffffff'
    clonedDocument.documentElement.style.color = '#111827'
    clonedDocument.documentElement.style.margin = '0'
    clonedDocument.documentElement.style.padding = '0'
    clonedDocument.body.innerHTML = ''
    clonedDocument.body.style.margin = '0'
    clonedDocument.body.style.padding = '0'
    clonedDocument.body.style.background = '#ffffff'
    clonedDocument.body.style.color = '#111827'

    // `relative`, not `static` — the card's own children (decorative
    // watermark, the photo's negative-margin overlap) are `absolute` and
    // need THIS element as their positioning context. `static` was copied
    // from the receipt PDF plugin, where the source layout has no such
    // children; here it pushed them to the nearest positioned ancestor
    // (the body) instead, off the captured canvas bounds — blank output.
    clonedElement.style.position = 'relative'
    clonedElement.style.left = 'auto'
    clonedElement.style.top = 'auto'
    clonedElement.style.zIndex = 'auto'
    clonedElement.style.opacity = '1'
    clonedElement.style.transform = 'none'
    clonedElement.style.width = `${width}px`
    clonedElement.style.minHeight = `${height}px`
    clonedElement.style.background = '#ffffff'
    clonedElement.style.pointerEvents = 'none'

    clonedDocument.body.appendChild(clonedElement)
    forceInlineStyles(clonedElement, clonedDocument.defaultView || window)
    clonedElement.style.opacity = '1'
    clonedElement.style.transform = 'none'
}

async function captureElement(source: HTMLElement): Promise<HTMLCanvasElement> {
    await document.fonts.ready

    const rect = source.getBoundingClientRect()
    const width = Math.ceil(rect.width) || source.offsetWidth
    const height = Math.ceil(rect.height) || source.offsetHeight

    const cloned = source.cloneNode(true) as HTMLElement
    cloned.style.position = 'fixed'
    cloned.style.left = '0'
    cloned.style.top = '0'
    cloned.style.zIndex = '-1'
    cloned.style.opacity = '0'
    cloned.style.width = `${width}px`
    cloned.style.pointerEvents = 'none'
    document.body.appendChild(cloned)

    // First pass while the live stylesheets are still attached, so computed
    // values are correct — onclone's isolateClonedDocument then strips
    // stylesheets from html2canvas's own separate clone and re-forces styles
    // there, closing the gap this pass alone can't (pseudo-elements etc.).
    forceInlineStyles(cloned)

    try {
        const canvas = await html2canvas(cloned, {
            // scale: 3 is a suspected contributor to the bold-text ghosting
            // (high scale factors are a documented trigger for html2canvas
            // subpixel text-doubling) — dropping to 2 while isolating the
            // real cause; still ~180dpi on an 85mm card, plenty for print.
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width,
            height,
            windowWidth: width,
            windowHeight: height,
            onclone: (clonedDocument, clonedElement) => isolateClonedDocument(clonedDocument, clonedElement, width, height),
            ignoreElements: (el) => el.tagName === 'STYLE' && el.parentElement === cloned
        })
        return canvas
    } finally {
        document.body.removeChild(cloned)
    }
}

// Capture ONE card face right now, while it's actually the live DOM node —
// callers with a v-if/v-else front/back toggle (a single card previewed both
// sides) MUST call this immediately after making a face visible, not collect
// element references up front and capture them later: flipping `side` past
// v-if/v-else destroys the previous face's DOM node, so a saved reference to
// it reads a detached, zero-size element by the time it's captured (this was
// the root cause of the PDF coming out blank).
export async function captureCardFace(element: HTMLElement): Promise<HTMLCanvasElement> {
    return captureElement(element)
}

function buildPdfFromCanvases(canvases: HTMLCanvasElement[], widthMm: number, heightMm: number): jsPDF | undefined {
    if (!canvases.length) return

    const pdf = new jsPDF({
        orientation: widthMm >= heightMm ? 'l' : 'p',
        unit: 'mm',
        format: [widthMm, heightMm]
    })

    canvases.forEach((canvas, i) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        if (i > 0) pdf.addPage([widthMm, heightMm], widthMm >= heightMm ? 'l' : 'p')
        pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm)
    })

    return pdf
}

// Renders already-mounted card elements (front, back, one per student, ...)
// to a PDF sized to the card's real physical dimensions (not A4 — see the
// report-card plugin for that case). Only safe when every element in the
// list is simultaneously live in the DOM (e.g. a v-for batch render) — for a
// v-if/v-else single-card front/back toggle, use captureCardFace per side as
// you flip it and pass the resulting canvases to downloadCardsFromCanvases /
// printCardsFromCanvases instead.
export async function exportCardsToPdf(elements: HTMLElement[], widthMm: number, heightMm: number) {
    const canvases: HTMLCanvasElement[] = []
    for (const el of elements) canvases.push(await captureElement(el))
    return buildPdfFromCanvases(canvases, widthMm, heightMm)
}

export async function downloadCardsPdf(elements: HTMLElement[], widthMm: number, heightMm: number, filename: string) {
    const pdf = await exportCardsToPdf(elements, widthMm, heightMm)
    pdf?.save(`${filename}.pdf`)
}

export async function printCardsPdf(elements: HTMLElement[], widthMm: number, heightMm: number, filename: string) {
    const pdf = await exportCardsToPdf(elements, widthMm, heightMm)
    if (!pdf) return

    pdf.autoPrint()
    window.open(pdf.output('bloburl'), '_blank')
}

export async function downloadCardsFromCanvases(canvases: HTMLCanvasElement[], widthMm: number, heightMm: number, filename: string) {
    const pdf = buildPdfFromCanvases(canvases, widthMm, heightMm)
    pdf?.save(`${filename}.pdf`)
}

export async function printCardsFromCanvases(canvases: HTMLCanvasElement[], widthMm: number, heightMm: number, filename: string) {
    const pdf = buildPdfFromCanvases(canvases, widthMm, heightMm)
    if (!pdf) return

    pdf.autoPrint()
    window.open(pdf.output('bloburl'), '_blank')
}

export const MM_PER_PX = MM_PER_PX_AT_96DPI
