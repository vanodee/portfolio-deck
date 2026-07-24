// Tool colors from Sanity (`tools` documents' `color` field) are tuned for
// dark text on a light tag pill (OpenCardOverlay.module.css's `.toolItem`
// background, `card-front-text` on top) — every authored value sits at ~90%
// HSL lightness by design, regardless of hue. Chip.tsx's poker-chip face
// instead lays fixed white decorative elements (edge-spot marks, gloss
// highlight) directly over that color, which wash out at that lightness no
// matter the hue. This darkens only the lightness channel — hue/saturation
// untouched, so the chip still reads as "that tool's color" — down to
// whatever's minimally needed to clear a 3.5:1 contrast ratio against white
// (WCAG's non-text/UI-component AA floor, with a little headroom since the
// gloss overlay is itself partly transparent). Colors already dark enough
// pass through unchanged. Tag-pill usage elsewhere reads the CMS color
// directly and never calls this.
const MIN_CONTRAST_VS_WHITE = 3.5;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
  return [r, g, b];
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function channelLuminance(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastVsWhite(rgb: Rgb): number {
  return 1.05 / (relativeLuminance(rgb) + 0.05);
}

function toHex([r, g, b]: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** Darkens `hex` (hue/saturation preserved) to the lightest value that still
 * clears MIN_CONTRAST_VS_WHITE — never lightens past the original color. */
export function chipTint(hex: string): string {
  const [h, s, origL] = rgbToHsl(hexToRgb(hex));
  if (contrastVsWhite(hslToRgb(h, s, origL)) >= MIN_CONTRAST_VS_WHITE) return hex;

  let lo = 0;
  let hi = origL;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (contrastVsWhite(hslToRgb(h, s, mid)) >= MIN_CONTRAST_VS_WHITE) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return toHex(hslToRgb(h, s, lo));
}
