import type { Project } from "@/data/types";
import { COLORS } from "@/lib/colors";
import { ensureCanvasFonts, getCanvasFontFamily } from "./fonts";
import { tintedAsset } from "./tintSvg";
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
  ctx.fillStyle = project.frontBg;
  ctx.fillRect(0, 0, w, h);

  // Image block (bleed geometry, clipped by the card silhouette). The 8px
  // shell padding stays visible at the bottom of the block only.
  const imgW = (CARD_W + IMG_BLEED_X * 2) * s;
  const imgH = imgW / IMG_ASPECT;
  const imgX = -IMG_BLEED_X * s;
  const imgY = -IMG_BLEED_Y * s;
  if (project.image) {
    // Future CMS asset path — drawn identically to the placeholder.
    // (Prototype data has image: null; loader added with the Sanity swap.)
    drawPlaceholderArt(ctx, project.id, imgX, imgY, imgW, imgH);
  } else {
    drawPlaceholderArt(ctx, project.id, imgX, imgY, imgW, imgH);
  }

  // Watermark — logo at 5% opacity behind the text block, bottom-right.
  const textTop = h - TEXT_BLOCK_H * s;
  ctx.globalAlpha = 0.05;
  ctx.drawImage(watermark, w - 120 * s, textTop + 14 * s, 106 * s, 98 * s);
  ctx.globalAlpha = 1;

  // Text block — anchored bottom, 127px tall, 18px top / 8px side padding.
  ctx.fillStyle = COLORS.cardFrontText;
  ctx.textBaseline = "top";
  ctx.font = `500 ${20 * s}px ${fam}`;
  ctx.fillText(project.title, 8 * s, textTop + 18 * s);

  // Category/date micro-label — 6px Light, uppercase, 2.4px tracking,
  // anchored at the block's bottom padding.
  ctx.font = `300 ${6 * s}px ${fam}`;
  drawTrackedText(
    ctx,
    `${project.category} - ${project.date}`.toUpperCase(),
    8 * s,
    h - 8 * s - 6 * s,
    2.4 * s,
  );

  return canvas;
}
