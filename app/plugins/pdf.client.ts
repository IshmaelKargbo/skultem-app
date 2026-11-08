// jsPDF and html2canvas are loaded lazily inside generatePdf() below, not imported here at the
// top - this file is a Nuxt plugin, so a static import here would pull both (sizeable) libraries
// into every page's initial bundle even though only report cards/receipts ever call $generatePdf.

// html2canvas can't parse oklch()/color-mix() — the color functions Tailwind
// v4's default palette (gray, white, etc.) compiles to — and throws instead
// of silently falling back. This used to just guess a fixed fallback color
// per property name (e.g. every border always became the same gray), which
// is why colors that should differ all flattened to the same few shades in
// the exported PDF. Ported from utils/idCardExport.ts's fix: do the real
// OKLCH -> OKLab -> LMS -> linear sRGB -> gamma-encoded sRGB math (per the
// CSS Color 4 spec / Björn Ottosson's reference oklab conversion) so the
// actual color survives instead of being replaced with a placeholder.
const UNSUPPORTED_COLOR_FN = /\b(oklch|oklab|lab|lch|color-mix|color)\(/i;

function isUnsupportedColor(value: string): boolean {
  return !!value && UNSUPPORTED_COLOR_FN.test(value);
}

function oklchComponentsToHex(L: number, C: number, hDeg: number, alpha = 1): string {
  const hRad = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  return oklabComponentsToHex(L, a, b, alpha);
}

function oklabComponentsToHex(L: number, a: number, b: number, alpha = 1): string {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const gamma = (c: number) => {
    const clamped = Math.min(1, Math.max(0, c));
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const toByte = (c: number) => Math.round(gamma(c) * 255).toString(16).padStart(2, "0");

  const hex = `#${toByte(rLin)}${toByte(gLin)}${toByte(bLin)}`;
  if (alpha >= 1) return hex;

  return hex + Math.round(alpha * 255).toString(16).padStart(2, "0");
}

function component(raw: string): number {
  return raw.endsWith("%") ? parseFloat(raw) / 100 : parseFloat(raw);
}

function oklchToHex(value: string): string {
  const oklch = value.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
  if (oklch) {
    const alpha = oklch[4] ? component(oklch[4]) : 1;
    return oklchComponentsToHex(component(oklch[1]!), component(oklch[2]!), parseFloat(oklch[3]!), alpha);
  }

  const oklab = value.match(/oklab\(\s*([\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
  if (oklab) {
    const alpha = oklab[4] ? component(oklab[4]) : 1;
    return oklabComponentsToHex(component(oklab[1]!), component(oklab[2]!), component(oklab[3]!), alpha);
  }

  // lab()/lch()/color-mix()/color() results — rare in practice (Tailwind's
  // default palette never emits these), and not worth writing three more
  // conversions for on spec. Neutral mid-gray beats a thrown exception.
  return "#888888";
}

function stripUnsupportedColors(value: string, property: string): string {
  if (!value) return value;
  if (property === "backgroundImage" && isUnsupportedColor(value)) return "none";
  if (isUnsupportedColor(value)) return oklchToHex(value);
  return value;
}

function forceInlineStyles(element: HTMLElement, sourceWindow: Window = window) {
  const all = [element, ...Array.from(element.querySelectorAll("*"))] as HTMLElement[];

  all.forEach((el) => {
    const computed = sourceWindow.getComputedStyle(el);

    Array.from(computed).forEach((prop) => {
      if (prop.startsWith("--")) return;
      const value = computed.getPropertyValue(prop);
      if (!value) return;

      if (isUnsupportedColor(value)) {
        if (prop === "background-image") {
          el.style.setProperty(prop, "none");
          return;
        }
        if (prop.includes("color") || prop === "fill" || prop === "stroke") {
          el.style.setProperty(prop, oklchToHex(value));
        }
        return;
      }

      el.style.setProperty(prop, value, computed.getPropertyPriority(prop));
    });

    // Pull every computed value and inline it — this bypasses oklch in stylesheets
    const props: (keyof CSSStyleDeclaration)[] = [
      "backgroundColor",
      "color",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "textDecorationColor",
      "fill",
      "stroke",
    ];

    props.forEach((prop) => {
      const value = computed[prop] as string;
      if (!value) return;
      el.style[prop as any] = isUnsupportedColor(value) ? oklchToHex(value) : value;
    });

    // Kill anything that can also carry oklch
    el.style.backgroundImage = stripUnsupportedColors(computed.backgroundImage, "backgroundImage");
    el.style.boxShadow = "none";
    el.style.filter = "none";
    el.style.backdropFilter = "none";
    el.style.textShadow = "none";

    // Belt-and-suspenders: the property-by-property pass above only catches
    // oklch/oklab/etc. when it shows up as a *whole* property value. A
    // composite value (gradient stop, multi-layer background/shadow) can
    // still hide the function inside a longer string. Scrub the fully
    // serialized inline style text directly instead of trying to enumerate
    // every composite shape that could hide one.
    if (UNSUPPORTED_COLOR_FN.test(el.style.cssText)) {
      el.style.cssText = el.style.cssText.replace(
        /\b(?:oklch|oklab|lab|lch|color-mix|color)\([^)]*\)/gi,
        "#888888"
      );
    }
  });
}

// ApexCharts hardcodes pixel width/height directly on the chart's own wrapper div and its
// <svg> (not a percentage), sized to whatever the container measured on the live page. The
// clone is forced down to a fixed 794px page width for capture, but that resize only affects
// elements sized by CSS/layout - it can't shrink an already-fixed pixel width baked onto the
// chart itself, so a chart rendered wide on a big screen just overflows/clips instead of
// scaling down, which is why the exported chart looks cropped or shifted. Drop the hardcoded
// width/height and let each SVG's own viewBox scale it to fit its new, correctly-narrow
// container instead - the same trick used to make any SVG behave like a responsive image.
function resizeApexCharts(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".apexcharts-canvas").forEach((canvas) => {
    canvas.style.width = "100%";
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";

    const svg = canvas.querySelector("svg.apexcharts-svg");
    if (svg) {
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      (svg as unknown as HTMLElement).style.width = "100%";
      (svg as unknown as HTMLElement).style.height = "auto";
    }
  });
}

// Waits for every real <img> in the clone to either finish loading or fail -
// html2canvas was being invoked immediately after cloning, so any image that
// hadn't finished downloading yet (logo, signature, watermark, ...) silently
// rendered blank. `document.fonts.ready` only covers text, not images.
async function waitForImages(container: HTMLElement, timeoutMs = 4000) {
  const images = Array.from(container.querySelectorAll("img"));

  await Promise.race([
    Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      })
    ),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

// html2canvas clones the element a SECOND time internally (into an offscreen iframe, via its own
// `onclone`) before it actually rasterizes anything - our own `cloned` div above is only the first
// of two clones. A plain remote <img src> that loaded fine in the page (and satisfied
// waitForImages above) can still come out blank in the final canvas, because that second,
// html2canvas-owned clone doesn't reliably re-resolve/re-load it (cross-origin timing, or the
// re-parenting isolateClonedDocument does below). A data: URI sidesteps all of that - once the
// bytes are inlined, every subsequent clone already "has" the image with no network/CORS
// involved, so it survives no matter how many times the node gets cloned. Swaps img.src in place;
// on any failure (network, opaque cross-origin response, ...) the original src is left as-is, so
// this can only help, never regress on top of waitForImages.
async function inlineImagesAsDataUrls(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));

  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;

      try {
        const res = await fetch(src, { mode: "cors" });
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        // Left as the original src - waitForImages already gave it its best shot.
      }
    })
  );
}

// `height` is the real measured content height (see generatePdf) - a document
// taller than one A4 page (a report card with more sections than a receipt,
// for example) must not be clamped to a fixed 1123px or everything past that
// point (signatures, footer, ...) gets silently cut off instead of flowing
// onto a second PDF page.
function isolateClonedDocument(clonedDocument: Document, clonedElement: HTMLElement, height: number, width = 794) {
  clonedDocument
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => node.remove());

  clonedDocument.documentElement.style.background = "#ffffff";
  clonedDocument.documentElement.style.color = "#111827";
  clonedDocument.documentElement.style.margin = "0";
  clonedDocument.documentElement.style.padding = "0";
  clonedDocument.documentElement.style.width = `${width}px`;
  clonedDocument.documentElement.style.minWidth = `${width}px`;
  clonedDocument.documentElement.style.height = `${height}px`;
  clonedDocument.documentElement.style.overflow = "hidden";
  clonedDocument.body.innerHTML = "";
  clonedDocument.body.style.margin = "0";
  clonedDocument.body.style.padding = "0";
  clonedDocument.body.style.width = `${width}px`;
  clonedDocument.body.style.minWidth = `${width}px`;
  clonedDocument.body.style.height = `${height}px`;
  clonedDocument.body.style.overflow = "hidden";
  clonedDocument.body.style.background = "#ffffff";
  clonedDocument.body.style.color = "#111827";

  clonedElement.style.position = "static";
  clonedElement.style.left = "auto";
  clonedElement.style.top = "auto";
  clonedElement.style.zIndex = "auto";
  clonedElement.style.opacity = "1";
  clonedElement.style.transform = "none";
  clonedElement.style.width = `${width}px`;
  clonedElement.style.minHeight = `${height}px`;
  clonedElement.style.overflow = "hidden";
  clonedElement.style.background = "#ffffff";
  clonedElement.style.color = "#111827";
  clonedElement.style.pointerEvents = "none";

  clonedDocument.body.appendChild(clonedElement);
  forceInlineStyles(clonedElement, clonedDocument.defaultView || window);
  resizeApexCharts(clonedElement);
  clonedElement.style.opacity = "1";
  clonedElement.style.transform = "none";
  clonedElement.style.overflow = "hidden";
}

// Captures one element as a white A4-width canvas, the same way generatePdf does - used by generatePdfPages,
// which needs each page captured on its own.
async function capturePage(element: HTMLElement, landscape: boolean): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import("html2canvas");
  const pagePxWidth = landscape ? 1123 : 794;

  const html = document.documentElement;
  const wasDark = html.classList.contains("dark");
  if (wasDark) html.classList.remove("dark");
  const originalHtmlOverflow = html.style.overflow;
  const originalBodyOverflow = document.body.style.overflow;

  const cloned = element.cloneNode(true) as HTMLElement;
  Object.assign(cloned.style, {
    position: "fixed", left: "0", top: "0", zIndex: "-1", opacity: "0", width: `${pagePxWidth}px`,
    overflow: "hidden", background: "#ffffff", color: "#111827", pointerEvents: "none",
  });
  html.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.appendChild(cloned);

  try {
    await waitForImages(cloned);
    await inlineImagesAsDataUrls(cloned);
    forceInlineStyles(cloned);
    const height = Math.ceil(cloned.scrollHeight);
    return await html2canvas(cloned, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: pagePxWidth,
      height,
      windowWidth: pagePxWidth,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDocument, clonedElement) => isolateClonedDocument(clonedDocument, clonedElement, height, pagePxWidth),
    });
  } finally {
    document.body.removeChild(cloned);
    html.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
    if (wasDark) html.classList.add("dark");
  }
}

// A vertical span of the document, in CSS px from its top.
type Span = { start: number, end: number }

// Blocks a page break must not cut through. Generic (table rows, images, text lines) plus anything a page
// marks with data-pdf-keep. Spans taller than a page are left out - those have to break somewhere.
function measureKeepBlocks(root: HTMLElement): Span[] {
  const top = root.getBoundingClientRect().top;
  const selector = "tr, img, svg, canvas, p, h1, h2, h3, h4, h5, h6, li, dt, dd, [data-pdf-keep]";
  const spans: Span[] = [];
  root.querySelectorAll(selector).forEach((el) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    if (r.height <= 0) return;
    spans.push({ start: r.top - top, end: r.bottom - top });
  });
  return spans;
}

// Where each page starts and ends. A page ends at the lowest point that doesn't cut through a kept block,
// as long as that still fills at least 60% of the page; otherwise it is cut at the page height.
function planPageSlices(totalPx: number, firstPagePx: number, nextPagePx: number, keep: Span[]): Span[] {
  const slices: Span[] = [];
  let start = 0;
  while (start < totalPx - 1) {
    const room = slices.length === 0 ? firstPagePx : nextPagePx;
    const limit = start + room;
    if (limit >= totalPx) {
      slices.push({ start, end: totalPx });
      break;
    }
    const fits = (y: number) => !keep.some(b => b.start < y - 0.5 && b.end > y + 0.5 && b.end - b.start < room);
    const candidates = keep.flatMap(b => [b.start, b.end])
      .filter(y => y > start + room * 0.6 && y <= limit)
      .sort((a, b) => b - a);
    const end = candidates.find(fits) ?? limit;
    slices.push({ start, end });
    start = end;
  }
  return slices.length ? slices : [{ start: 0, end: totalPx }];
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      // One PDF page per `pageSelector` element inside `selector` (e.g. an exam timetable's page per class), each
      // scaled to fit its page - unlike generatePdf, which slices one long capture wherever the page ends.
      generatePdfPages: async (selector: string, pageSelector: string, name = "document",
        options: { landscape?: boolean } = {}) => {
        const landscape = !!options.landscape;
        const root = document.querySelector(selector) as HTMLElement | null;
        if (!root) return;
        const pages = Array.from(root.querySelectorAll(pageSelector)) as HTMLElement[];
        if (!pages.length) return;

        const { jsPDF } = await import("jspdf");
        await document.fonts.ready;

        const pdf = new jsPDF({ orientation: landscape ? "l" : "p", unit: "mm", format: "a4" });
        const pageWidth = landscape ? 297 : 210;
        const pageHeight = landscape ? 210 : 297;
        const margin = 8;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        for (let i = 0; i < pages.length; i++) {
          const canvas = await capturePage(pages[i]!, landscape);
          let width = usableWidth;
          let height = (canvas.height * width) / canvas.width;
          // A long class sheet shrinks to fit one page rather than spilling onto the next.
          if (height > usableHeight) {
            height = usableHeight;
            width = (canvas.width * height) / canvas.height;
          }
          if (i > 0) pdf.addPage();
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", (pageWidth - width) / 2, margin, width, height);
        }

        pdf.save(`${name.trim() || "document"}.pdf`);
      },

      generatePdf: async (selector: string, name = "receipt", options: { landscape?: boolean } = {}) => {
        // Portrait A4 is 794x1123px at 96dpi; landscape swaps them. Nothing else changes between the two.
        const landscape = !!options.landscape;
        const pagePxWidth = landscape ? 1123 : 794;
        // Minimum capture height = what fits inside the PDF page margins (10mm each side), not the full
        // page: landscape's full 794px scales to ~196mm but only 190mm is usable, so a short document
        // spilled 6mm of blank white onto a second page. Portrait's 1123px already fits.
        const pagePxHeight = landscape ? 760 : 1123;

        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return;

        const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
          import("jspdf"),
          import("html2canvas"),
        ]);

        await document.fonts.ready;

        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyOverflow = document.body.style.overflow;

        // Every generated document (report card, receipt, payslip, attendance/academic report...)
        // must render light-on-white regardless of the app's current theme - forceInlineStyles
        // below bakes in whatever is *currently computed* on screen, and a bunch of CSS (color
        // tokens, the .dark .apexcharts-* overrides in main.css) keys off the "dark" class on
        // <html>. Dropping it for the duration of the capture makes every computed style resolve
        // to its light-mode value, the same way it would for a viewer who never enabled dark mode.
        const html = document.documentElement;
        const wasDark = html.classList.contains("dark");
        if (wasDark) html.classList.remove("dark");

        // Clone
        const cloned = element.cloneNode(true) as HTMLElement;
        cloned.style.position = "fixed";
        cloned.style.left = "0";
        cloned.style.top = "0";
        cloned.style.zIndex = "-1";
        cloned.style.opacity = "0";
        cloned.style.width = `${pagePxWidth}px`;
        cloned.style.minHeight = `${pagePxHeight}px`;
        cloned.style.overflow = "hidden";
        cloned.style.background = "#ffffff";
        cloned.style.color = "#111827";
        cloned.style.pointerEvents = "none";
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.appendChild(cloned);

        let canvas: HTMLCanvasElement;
        let keepBlocks: Span[] = [];
        try {
          // Wait for every image to actually load before measuring/capturing -
          // otherwise logos/photos/signatures that haven't finished downloading
          // yet render as blank space, and the height measured below would be
          // wrong for any image whose real dimensions hadn't resolved yet.
          await waitForImages(cloned);
          await inlineImagesAsDataUrls(cloned);

          // Force all computed styles inline — resolves oklch before html2canvas sees it
          forceInlineStyles(cloned);

          // Things a page break must not cut through (rows, images, lines of text, and any block marked
          // data-pdf-keep, e.g. the signatures), in CSS px from the top of the document.
          keepBlocks = measureKeepBlocks(cloned);

          // Real content height, not a fixed one page's worth - anything past a
          // single A4 page (1123px at 96dpi) used to be silently clipped instead
          // of flowing onto a second PDF page.
          const measuredHeight = Math.max(pagePxHeight, Math.ceil(cloned.scrollHeight));

          canvas = await html2canvas(cloned, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            width: pagePxWidth,
            height: measuredHeight,
            windowWidth: pagePxWidth,
            windowHeight: measuredHeight,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDocument, clonedElement) => isolateClonedDocument(clonedDocument, clonedElement, measuredHeight, pagePxWidth),
            ignoreElements: (el) => el.tagName === "STYLE" && el.parentElement === cloned,
          });
        } finally {
          document.body.removeChild(cloned);
          document.documentElement.style.overflow = originalHtmlOverflow;
          document.body.style.overflow = originalBodyOverflow;
          if (wasDark) html.classList.add("dark");
        }

        const pdf = new jsPDF({
          orientation: landscape ? "l" : "p",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = landscape ? 297 : 210;
        const pageHeight = landscape ? 210 : 297;
        const margin = 10;
        // Continuation pages start a little lower, as breathing room. Breaks themselves fall between rows and
        // blocks (planPageSlices), not wherever a page's worth of height happens to end.
        const continuationTopMargin = 20;
        const usableWidth = pageWidth - margin * 2;
        const pageContentHeight = pageHeight - margin * 2;
        const continuationContentHeight = pageHeight - continuationTopMargin - margin;

        // Each page gets its own slice of the capture - never the whole image shifted up, which drew the
        // strip under the bottom margin on one page and again at the top of the next (duplicated rows).
        const totalPx = canvas.height / 2; // captured at scale 2
        const mmPerPx = usableWidth / pagePxWidth;
        const firstPagePx = pageContentHeight / mmPerPx;
        const nextPagePx = continuationContentHeight / mmPerPx;

        // Only a little too tall for one page (e.g. a report card whose signatures spill over): shrink it a touch
        // to fit on one page instead of leaving a near-empty second page.
        if (totalPx > firstPagePx && totalPx <= firstPagePx * 1.2) {
          const height = pageContentHeight;
          const width = usableWidth * (firstPagePx / totalPx);
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", (pageWidth - width) / 2, margin, width, height);
          pdf.save(`${name.trim() || "receipt"}.pdf`);
          return;
        }

        const slices = planPageSlices(totalPx, firstPagePx, nextPagePx, keepBlocks);
        slices.forEach((slice, index) => {
          if (index > 0) pdf.addPage();
          const sourceTop = Math.round(slice.start * 2);
          const sourceHeight = Math.max(1, Math.round((slice.end - slice.start) * 2));
          const part = document.createElement("canvas");
          part.width = canvas.width;
          part.height = sourceHeight;
          const ctx = part.getContext("2d");
          if (!ctx) return;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, part.width, part.height);
          ctx.drawImage(canvas, 0, sourceTop, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const top = index === 0 ? margin : continuationTopMargin;
          pdf.addImage(part.toDataURL("image/jpeg", 0.95), "JPEG", margin, top, usableWidth, sourceHeight / 2 * mmPerPx);
        });

        const filename = name.trim() || "receipt";
        pdf.save(`${filename}.pdf`);
      },
    },
  };
});
