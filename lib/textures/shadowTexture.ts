import * as THREE from "three";

// One shared soft-shadow texture for every card (PRD §8 — no real-time
// shadow casting). A blurred rounded rect in the felt-derived shadow color;
// per-card springs animate the quad's offset/scale/opacity to move through
// the DS §5 elevation rows, with quad scale approximating blur growth.

// Texture canvas is padded around the card silhouette so the blur has room.
export const SHADOW_PAD = 0.35; // padding as a fraction of card size per side

// The ambient flagship glow (DS §1.7) reuses the same blob texture as the
// shadow/hover-glow but on a much larger plane, so the same blur reads as a
// genuine diffuse halo rather than a tight edge highlight.
export const FLAGSHIP_GLOW_PAD = 0.9;

function makeBlobTexture(color: string): THREE.CanvasTexture {
  const w = 256;
  const h = 340;
  const padX = w * SHADOW_PAD * 0.5;
  const padY = h * SHADOW_PAD * 0.5;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.filter = "blur(14px)";
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(padX, padY, w - padX * 2, h - padY * 2, 10);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

let shadowCached: THREE.CanvasTexture | null = null;
let glowCached: THREE.CanvasTexture | null = null;

export function getShadowTexture(): THREE.CanvasTexture {
  if (!shadowCached) shadowCached = makeBlobTexture("rgb(3, 15, 10)");
  return shadowCached;
}

/** White blob for the hover glow (DS §1.6) — tinted via material color. */
export function getGlowTexture(): THREE.CanvasTexture {
  if (!glowCached) glowCached = makeBlobTexture("rgb(255, 255, 255)");
  return glowCached;
}
