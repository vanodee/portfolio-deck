// Loads a cross-origin image (Sanity's CDN) for canvas drawing. crossOrigin
// must be set before assigning src or the canvas taints once uploaded as a
// WebGL texture (Sanity's image CDN sends permissive CORS headers, so
// "anonymous" is sufficient — no manage.sanity.io CORS entry needed here).
// Cached per URL so repeated composites for the same project don't re-fetch.

const cache = new Map<string, Promise<HTMLImageElement>>();

export function loadRemoteImage(src: string): Promise<HTMLImageElement> {
  const hit = cache.get(src);
  if (hit) return hit;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  cache.set(src, promise);
  return promise;
}
