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

// `height` is the real measured content height (see generatePdf) - a document
// taller than one A4 page (a report card with more sections than a receipt,
// for example) must not be clamped to a fixed 1123px or everything past that
// point (signatures, footer, ...) gets silently cut off instead of flowing
// onto a second PDF page.
function isolateClonedDocument(clonedDocument: Document, clonedElement: HTMLElement, height: number) {
  clonedDocument
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => node.remove());

  clonedDocument.documentElement.style.background = "#ffffff";
  clonedDocument.documentElement.style.color = "#111827";
  clonedDocument.documentElement.style.margin = "0";
  clonedDocument.documentElement.style.padding = "0";
  clonedDocument.documentElement.style.width = "794px";
  clonedDocument.documentElement.style.minWidth = "794px";
  clonedDocument.documentElement.style.height = `${height}px`;
  clonedDocument.documentElement.style.overflow = "hidden";
  clonedDocument.body.innerHTML = "";
  clonedDocument.body.style.margin = "0";
  clonedDocument.body.style.padding = "0";
  clonedDocument.body.style.width = "794px";
  clonedDocument.body.style.minWidth = "794px";
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
  clonedElement.style.width = "794px";
  clonedElement.style.minHeight = `${height}px`;
  clonedElement.style.overflow = "hidden";
  clonedElement.style.background = "#ffffff";
  clonedElement.style.color = "#111827";
  clonedElement.style.pointerEvents = "none";

  clonedDocument.body.appendChild(clonedElement);
  forceInlineStyles(clonedElement, clonedDocument.defaultView || window);
  clonedElement.style.opacity = "1";
  clonedElement.style.transform = "none";
  clonedElement.style.overflow = "hidden";
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      generatePdf: async (selector: string, name = "receipt") => {
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return;

        const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
          import("jspdf"),
          import("html2canvas"),
        ]);

        await document.fonts.ready;

        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyOverflow = document.body.style.overflow;

        // Clone
        const cloned = element.cloneNode(true) as HTMLElement;
        cloned.style.position = "fixed";
        cloned.style.left = "0";
        cloned.style.top = "0";
        cloned.style.zIndex = "-1";
        cloned.style.opacity = "0";
        cloned.style.width = "794px";
        cloned.style.minHeight = "1123px";
        cloned.style.overflow = "hidden";
        cloned.style.background = "#ffffff";
        cloned.style.color = "#111827";
        cloned.style.pointerEvents = "none";
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.appendChild(cloned);

        // Wait for every image to actually load before measuring/capturing -
        // otherwise logos/photos/signatures that haven't finished downloading
        // yet render as blank space, and the height measured below would be
        // wrong for any image whose real dimensions hadn't resolved yet.
        await waitForImages(cloned);

        // Force all computed styles inline — resolves oklch before html2canvas sees it
        forceInlineStyles(cloned);

        // Real content height, not a fixed one page's worth - anything past a
        // single A4 page (1123px at 96dpi) used to be silently clipped instead
        // of flowing onto a second PDF page.
        const measuredHeight = Math.max(1123, Math.ceil(cloned.scrollHeight));

        let canvas: HTMLCanvasElement;
        try {
          canvas = await html2canvas(cloned, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            width: 794,
            height: measuredHeight,
            windowWidth: 794,
            windowHeight: measuredHeight,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDocument, clonedElement) => isolateClonedDocument(clonedDocument, clonedElement, measuredHeight),
            ignoreElements: (el) => el.tagName === "STYLE" && el.parentElement === cloned,
          });
        } finally {
          document.body.removeChild(cloned);
          document.documentElement.style.overflow = originalHtmlOverflow;
          document.body.style.overflow = originalBodyOverflow;
        }

        const imgData = canvas.toDataURL("image/jpeg", 1);

        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10;
        const usableWidth = pageWidth - margin * 2;
        const pageContentHeight = pageHeight - margin * 2;

        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;

        // First page
        pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageContentHeight;

        // Subsequent pages
        while (heightLeft > 0) {
          pdf.addPage();
          position = margin - (imgHeight - heightLeft);
          pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
          heightLeft -= pageContentHeight;
        }

        const filename = name.trim() || "receipt";
        pdf.save(`${filename}.pdf`);
      },
    },
  };
});
