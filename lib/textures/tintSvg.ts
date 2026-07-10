// Loads a white-on-transparent asset (SVG or PNG) and tints it to a target
// color via source-in compositing. Cached per (src, color, w, h) — the
// white and gold variants each rasterize exactly once.

const cache = new Map<string, Promise<HTMLCanvasElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function tintedAsset(
  src: string,
  color: string,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const key = `${src}|${color}|${width}x${height}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const promise = loadImage(src).then((img) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  });

  cache.set(key, promise);
  return promise;
}
