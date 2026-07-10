// Canvas text can only use fonts that are already loaded — otherwise
// fillText silently falls back. next/font registers Outfit under a hashed
// family name, so we read the resolved family from the DOM.

let family: string | null = null;

export function getCanvasFontFamily(): string {
  if (family) return family;
  family = getComputedStyle(document.body).fontFamily || "sans-serif";
  return family;
}

let loaded: Promise<void> | null = null;

export function ensureCanvasFonts(): Promise<void> {
  if (loaded) return loaded;
  const fam = getCanvasFontFamily();
  loaded = Promise.all([
    document.fonts.load(`300 12px ${fam}`),
    document.fonts.load(`500 20px ${fam}`),
  ])
    .then(() => undefined)
    .catch(() => undefined); // fall back silently; fonts.ready backstop recomposites
  return loaded;
}
