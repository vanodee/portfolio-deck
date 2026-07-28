// Bakes Chip.tsx's decorative "poker chip" face into a cached data-URI <img>
// source, once per distinct resolved color, instead of two live <svg> blocks
// re-rendering the same filter/gradient pipeline on every chip instance
// (perf audit, 2026-07-28 — ~8+ tool chips + 2 stat chips previously each
// carried their own copy of 3 filters + 2 radial gradients, with per-instance
// useId() IDs guaranteeing nothing could ever be shared). Live SVG filters
// force the browser to re-run the whole filter pipeline whenever the
// filtered element (or an ancestor) animates a transform, rather than being
// reusable as a static texture — Chip's hover-lift and entrance stagger both
// do exactly that, so this also removes an ongoing per-animation-frame cost,
// not just the initial paint's.
//
// Geometry/filters are transcribed verbatim from Chip.tsx's own JSX (itself
// transcribed from the Figma-exported reference SVGs) — keep both in sync if
// the chip's shape ever changes. Every attribute name below uses raw SVG/XML
// spelling (kebab-case for CSS-mapped presentation attributes like
// `flood-opacity`/`stop-opacity`, camelCase for SVG-specific ones like
// `filterUnits`/`stdDeviation`), not JSX's camelCase prop names — these are
// hand-built XML strings, not JSX.
//
// Only 4 path fills vary by color (the rest — filters, vignette, edge-spot
// marks, ring strokes — are pure geometry/opacity, identical regardless of
// color); but the inner-shadow filters blend their overlay against
// SourceGraphic (`feBlend in2="shape"`), so the final rendered pixels do
// depend on the fill color. Caching is per distinct color, not global.
//
// Callers MUST pass a literal, portable color (hex/rgb) — never a CSS
// `var(--token)` reference. A data-URI SVG is a fully isolated document with
// no access to the host page's stylesheet/custom properties, so `var()`
// would fail to resolve inside it (see AboutContent.tsx's stat chips, which
// pass literal hex specifically for this reason).

const SHADOW_PATH =
  "M100 202C153.019 202 196 159.019 196 106C196 52.9807 153.019 10 100 10C46.9807 10 4 52.9807 4 106C4 159.019 46.9807 202 100 202Z";
const MAIN_PATH =
  "M100 196C153.019 196 196 153.019 196 100C196 46.9807 153.019 4 100 4C46.9807 4 4 46.9807 4 100C4 153.019 46.9807 196 100 196Z";
const EDGE_SPOTS_PATH =
  "M159.482 175.444C143.55 188.006 124.049 195.202 103.776 196L103.21 181.6C120.442 180.922 137.017 174.805 150.56 164.128L159.482 175.444ZM30.9375 143.581C40.1408 158.166 53.7251 169.462 69.7432 175.852L64.4043 189.237C45.5595 181.72 29.5774 168.43 18.75 151.271L30.9375 143.581ZM195.078 86.209C197.99 106.287 194.472 126.773 185.026 144.729L172.272 138.02C180.301 122.757 183.292 105.344 180.816 88.2773L195.078 86.209ZM27.7266 61.9805C19.6978 77.243 16.707 94.6557 19.1826 111.723L4.92091 113.791C2.00852 93.7124 5.52711 73.2273 14.9727 55.2715L27.7266 61.9805ZM135.595 10.7627C154.44 18.2798 170.421 31.5703 181.248 48.7285L169.061 56.4189C159.857 41.8345 146.273 30.5379 130.255 24.1484L135.595 10.7627ZM96.7881 18.4004C79.5561 19.0785 62.9809 25.1947 49.4385 35.8721L40.5166 24.5557C56.4489 11.994 75.9487 4.79776 96.2217 4L96.7881 18.4004Z";
const BEVEL_OUTER_PATH =
  "M100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170Z";
const RING_STROKE_OUTER_PATH =
  "M100 28C139.764 28 172 60.2355 172 100C172 139.764 139.764 172 100 172C60.2355 172 28 139.764 28 100C28 60.2355 60.2355 28 100 28Z";
const RING_STROKE_INNER_PATH =
  "M100 157C131.48 157 157 131.48 157 100C157 68.5198 131.48 43 100 43C68.5198 43 43 68.5198 43 100C43 131.48 68.5198 157 100 157Z";
const CENTER_DISC_PATH =
  "M100 155C130.376 155 155 130.376 155 100C155 69.6243 130.376 45 100 45C69.6243 45 45 69.6243 45 100C45 130.376 69.6243 155 100 155Z";

function chipStructureSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 202" fill="none">
<defs>
<filter id="innerA" x="30" y="30" width="140" height="144" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
</filter>
<filter id="innerB" x="26" y="26" width="148" height="152" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="22"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
</filter>
<filter id="drop" x="40" y="45" width="120" height="122" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="7"/>
<feGaussianBlur stdDeviation="2.5"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
</filter>
<radialGradient id="vignette" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(114 121) scale(77)">
<stop stop-opacity="0"/>
<stop offset="1" stop-opacity="0.2"/>
</radialGradient>
</defs>
<path d="${SHADOW_PATH}" fill="${color}"/>
<path d="${SHADOW_PATH}" fill="black" fill-opacity="0.5"/>
<path d="${MAIN_PATH}" fill="${color}"/>
<path d="${EDGE_SPOTS_PATH}" fill="white"/>
<g filter="url(#innerA)"><path d="${BEVEL_OUTER_PATH}" fill="${color}"/></g>
<g filter="url(#innerA)"><path d="${BEVEL_OUTER_PATH}" fill="url(#vignette)"/></g>
<g filter="url(#innerB)"><path d="${RING_STROKE_OUTER_PATH}" stroke="black" stroke-opacity="0.1" stroke-width="4"/></g>
<path d="${RING_STROKE_INNER_PATH}" stroke="black" stroke-opacity="0.1" stroke-width="3"/>
<g filter="url(#drop)"><path d="${CENTER_DISC_PATH}" fill="${color}"/></g>
</svg>`;
}

function chipLightSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 202" fill="none">
<defs>
<radialGradient id="light" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(76.96 61.6) scale(99.84)">
<stop stop-color="white" stop-opacity="0.55"/>
<stop offset="0.55" stop-color="white" stop-opacity="0.04"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</radialGradient>
</defs>
<path d="${MAIN_PATH}" fill="url(#light)"/>
</svg>`;
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const structureCache = new Map<string, string>();

/** Cached per distinct resolved color — see module comment. `color` must be
 * a literal hex/rgb, not a CSS `var()` reference. */
export function chipStructureDataUrl(color: string): string {
  const hit = structureCache.get(color);
  if (hit) return hit;
  const url = toDataUrl(chipStructureSvg(color));
  structureCache.set(color, url);
  return url;
}

// Fully color-independent (pure white-opacity gradient stops) — computed
// once, ever, for every chip regardless of variant/color.
let lightCache: string | null = null;

export function chipLightDataUrl(): string {
  if (!lightCache) lightCache = toDataUrl(chipLightSvg());
  return lightCache;
}
