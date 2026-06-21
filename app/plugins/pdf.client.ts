import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function oklchToHex(property: string): string {
  const normalized = property.toLowerCase();

  // Map common semantic uses to safe fallbacks
  if (normalized.includes("background")) return "#ffffff";
  if (normalized === "color" || normalized.includes("text") || normalized === "fill" || normalized === "stroke") {
    return "#111827";
  }
  if (normalized.includes("border") || normalized.includes("outline")) return "#e5e7eb";
  return "#ffffff";
}

function stripUnsupportedColors(value: string, property: string): string {
  if (!value) return value;
  if (property === "backgroundImage" && (value.includes("oklch") || value.includes("color-mix"))) return "none";
  if (property.includes("color") || property.includes("Color") || property === "fill" || property === "stroke") {
    if (value.includes("oklch") || value.includes("color-mix")) return oklchToHex(property);
  }
  if (value.includes("oklch") || value.includes("color-mix")) return oklchToHex(property);
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

      if (value.includes("oklch") || value.includes("color-mix")) {
        if (prop === "background-image") {
          el.style.setProperty(prop, "none");
          return;
        }

        if (prop.includes("color") || prop === "fill" || prop === "stroke") {
          el.style.setProperty(prop, oklchToHex(prop));
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

      if (value.includes("oklch") || value.includes("color-mix")) {
        // Replace with safe fallback
        el.style[prop as any] = oklchToHex(prop as string);
      } else {
        // Inline the resolved value so html2canvas sees rgb() not oklch()
        el.style[prop as any] = value;
      }
    });

    // Kill anything that can also carry oklch
    el.style.backgroundImage = stripUnsupportedColors(computed.backgroundImage, "backgroundImage");
    el.style.boxShadow = "none";
    el.style.filter = "none";
    el.style.backdropFilter = "none";
    el.style.textShadow = "none";
  });
}

function isolateClonedDocument(clonedDocument: Document, clonedElement: HTMLElement) {
  clonedDocument
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => node.remove());

  clonedDocument.documentElement.style.background = "#ffffff";
  clonedDocument.documentElement.style.color = "#111827";
  clonedDocument.documentElement.style.margin = "0";
  clonedDocument.documentElement.style.padding = "0";
  clonedDocument.documentElement.style.width = "794px";
  clonedDocument.documentElement.style.minWidth = "794px";
  clonedDocument.documentElement.style.height = "1123px";
  clonedDocument.documentElement.style.overflow = "hidden";
  clonedDocument.body.innerHTML = "";
  clonedDocument.body.style.margin = "0";
  clonedDocument.body.style.padding = "0";
  clonedDocument.body.style.width = "794px";
  clonedDocument.body.style.minWidth = "794px";
  clonedDocument.body.style.height = "1123px";
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
  clonedElement.style.minHeight = "1123px";
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

        // Force all computed styles inline — resolves oklch before html2canvas sees it
        forceInlineStyles(cloned);

        let canvas: HTMLCanvasElement;
        try {
          canvas = await html2canvas(cloned, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            scrollX: 0,
            scrollY: 0,
            onclone: isolateClonedDocument,
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
