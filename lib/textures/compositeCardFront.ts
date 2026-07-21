import type { Project } from "@/data/types";
import { COLORS } from "@/lib/colors";
import { ensureCanvasFonts, getCanvasFontFamily } from "./fonts";
import { tintedAsset } from "./tintSvg";
import { loadRemoteImage } from "./loadRemoteImage";
import { sanityImageAtWidth } from "@/lib/sanityImage";
import { CARD_W, CARD_H, TEX_SCALE } from "./compositeCardBack";

// DS §3.2 card front. The image block "bleeds" past the card edges in Figma
// (−54px sides, −10px top, aspect 1153:634); a textured mesh can't paint
// outside itself, so the bleed is reproduced as an oversized crop clipped at
// the card boundary.

const IMG_BLEED_X = 54;
const IMG_BLEED_Y = 10;
const IMG_ASPECT = 1153 / 634;
const TEXT_BLOCK_H = 127;

// Muted placeholder palettes, keyed deterministically off the project id.
const PALETTES: Array<[string, string, string]> = [
  ["#0E7C66", "#DDEFE7", "#0A1128"],
  ["#4A5899", "#E4E7F5", "#1B2240"],
  ["#8C5E2A", "#F3E9DB", "#33220E"],
  ["#7A3B52", "#F2E2E8", "#2E1620"],
  ["#2F6E8E", "#DFEDF4", "#122B38"],
  ["#5E7A3B", "#EAF2DD", "#24300F"],
];

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function drawPlaceholderArt(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const [base, light, dark] = PALETTES[hashId(id) % PALETTES.length];

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, light);
  grad.addColorStop(1, base);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // A couple of large soft shapes so each card reads distinct at a glance.
  const cx = x + w * (0.3 + (hashId(id) % 5) * 0.1);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.55, h * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x + w * 0.75, y + h * 0.3, h * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// Greedy word-wrap, capped at maxLines — overflow past that is
// ellipsis-truncated on the last line rather than spilling into the
// category label / watermark below.
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
    last = last.slice(0, -1).trimEnd();
  }
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackingPx: number,
) {
  // letterSpacing is typed in lib.dom but not implemented everywhere yet.
  const spacing = ctx as { letterSpacing?: string };
  if (typeof spacing.letterSpacing === "string") {
    spacing.letterSpacing = `${trackingPx}px`;
    ctx.fillText(text, x, y);
    spacing.letterSpacing = "0px";
    return;
  }
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + trackingPx;
  }
}

// object-fit: cover, centered — no hotspot/focal-point math (deferred; see
// FRONTEND_INTEGRATION.md §3's hotspotPosition gotcha — first pass ignores
// it and center-crops).
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number,
) {
  const srcAspect = img.width / img.height;
  const dstAspect = dWidth / dHeight;
  let sx = 0;
  let sy = 0;
  let sWidth = img.width;
  let sHeight = img.height;
  if (srcAspect > dstAspect) {
    sWidth = img.height * dstAspect;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / dstAspect;
    sy = (img.height - sHeight) / 2;
  }
  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

export async function compositeCardFront(
  project: Project,
): Promise<HTMLCanvasElement> {
  const s = TEX_SCALE;
  const w = CARD_W * s;
  const h = CARD_H * s;

  await ensureCanvasFonts();
  const watermark = await tintedAsset(
    "/assets/logo-mark.png",
    "#000000",
    106 * s,
    98 * s,
  );

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const fam = getCanvasFontFamily();

  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4 * s);
  ctx.clip();
  ctx.fillStyle = COLORS.cardFrontBg;
  ctx.fillRect(0, 0, w, h);

  // Image block (bleed geometry, clipped by the card silhouette). The 8px
  // shell padding stays visible at the bottom of the block only.
  const imgW = (CARD_W + IMG_BLEED_X * 2) * s;
  const imgH = imgW / IMG_ASPECT;
  const imgX = -IMG_BLEED_X * s;
  const imgY = -IMG_BLEED_Y * s;
  if (project.image) {
    try {
      const img = await loadRemoteImage(
        sanityImageAtWidth(project.image, 800),
      );
      drawImageCover(ctx, img, imgX, imgY, imgW, imgH);
    } catch {
      // Bad/missing CMS asset — fall back rather than leave the card blank.
      drawPlaceholderArt(ctx, project.id, imgX, imgY, imgW, imgH);
    }
  } else {
    drawPlaceholderArt(ctx, project.id, imgX, imgY, imgW, imgH);
  }

  // Watermark — logo at 5% opacity behind the text block, bottom-right.
  const textTop = h - TEXT_BLOCK_H * s;
  ctx.globalAlpha = 0.05;
  ctx.drawImage(watermark, w - 120 * s, textTop + 14 * s, 106 * s, 98 * s);
  ctx.globalAlpha = 1;

  // Text block — anchored bottom, 127px tall, 18px top / 8px side padding
  // (both sides — title wraps at the right padding rather than overflowing).
  ctx.fillStyle = COLORS.cardFrontText;
  ctx.textBaseline = "top";
  const titleFontSize = 20;
  const titleLineHeight = 24;
  const titleMaxLines = 2;
  ctx.font = `500 ${titleFontSize * s}px ${fam}`;
  const titleMaxWidth = w - 8 * s * 2;
  const titleLines = wrapText(ctx, project.title, titleMaxWidth, titleMaxLines);
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 8 * s, textTop + 18 * s + i * titleLineHeight * s);
  });

  // Category micro-label — 11px Light, uppercase, 2.4px tracking, anchored
  // at the block's bottom padding. Bumped from 7px (comfortably fits every
  // real category name on one line at this size — the longest, "Logos &
  // Branding," measures well under the available width).
  const categoryFontSize = 10;
  ctx.font = `300 ${categoryFontSize * s}px ${fam}`;
  drawTrackedText(
    ctx,
    project.category.toUpperCase(),
    8 * s,
    h - 8 * s - categoryFontSize * s,
    2.4 * s,
  );

  return canvas;
}
