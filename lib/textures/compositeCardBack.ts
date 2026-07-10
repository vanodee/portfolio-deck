import type { CardBackStyle } from "@/data/types";
import { tintedAsset } from "./tintSvg";

// DS §3.1 card back, composited at 2× (428×600). All geometry in source px
// then doubled: white shell (4px r), bg fill inset 8 (2px r), circuit trace
// clipped to a 192×279 centered window, 1px inner border inset 10 (2px r),
// logo mark 50×46 centered.

export const TEX_SCALE = 2;
export const CARD_W = 214;
export const CARD_H = 300;

export async function compositeCardBack(
  back: CardBackStyle,
): Promise<HTMLCanvasElement> {
  const s = TEX_SCALE;
  const w = CARD_W * s;
  const h = CARD_H * s;

  const [trace, logo] = await Promise.all([
    tintedAsset("/assets/circuit-trace.svg", back.traceColor, 192 * s, 279 * s),
    tintedAsset("/assets/logo-mark.png", back.traceColor, 100 * s, 92 * s),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Outer shell — cardstock edge, same color as the inner frame border
  // (white for standard cards, gold for the flagship); rounded corners
  // become the texture's alpha silhouette (the mesh plane is a sharp rect).
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4 * s);
  ctx.clip();
  ctx.fillStyle = back.borderColor;
  ctx.fillRect(0, 0, w, h);

  // Navy fill, inset 8px, 2px radius
  ctx.fillStyle = back.bgColor;
  ctx.beginPath();
  ctx.roundRect(8 * s, 8 * s, w - 16 * s, h - 16 * s, 2 * s);
  ctx.fill();

  // Circuit trace, clipped to the centered 192×279 window
  ctx.save();
  ctx.beginPath();
  ctx.rect((CARD_W - 192) * 0.5 * s, (CARD_H - 279) * 0.5 * s, 192 * s, 279 * s);
  ctx.clip();
  ctx.drawImage(trace, (CARD_W - 192) * 0.5 * s, (CARD_H - 279) * 0.5 * s);
  ctx.restore();

  // 1px inner border, inset 10px, 2px radius — reads as the card "frame"
  ctx.strokeStyle = back.borderColor;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.roundRect(10 * s, 10 * s, w - 20 * s, h - 20 * s, 2 * s);
  ctx.stroke();

  // Center logo mark, 50×46 → drawn from its tinted 100×92@2x raster
  ctx.drawImage(
    logo,
    (w - 50 * s) / 2,
    (h - 46 * s) / 2,
    50 * s,
    46 * s,
  );

  return canvas;
}
