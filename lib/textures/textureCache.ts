import * as THREE from "three";
import type { Project } from "@/data/types";
import { compositeCardBack } from "./compositeCardBack";
import { compositeCardFront } from "./compositeCardFront";

// Param-keyed texture cache. Textures are composited once per param set —
// springs animate the mesh, never the texture (PRD §8). A single fonts.ready
// backstop recomposites fronts in case text was drawn before Outfit loaded.

interface Entry {
  promise: Promise<THREE.CanvasTexture>;
  texture?: THREE.CanvasTexture;
}

const cache = new Map<string, Entry>();
const listeners = new Set<() => void>();

function build(
  key: string,
  compose: () => Promise<HTMLCanvasElement>,
  force = false,
): Promise<THREE.CanvasTexture> {
  const existing = cache.get(key);
  if (existing && !force) return existing.promise;

  const entry: Entry = {
    promise: compose().then((canvas) => {
      if (entry.texture) {
        // Recomposite path: swap the backing canvas in place.
        entry.texture.image = canvas;
        entry.texture.needsUpdate = true;
      } else {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        entry.texture = tex;
      }
      return entry.texture;
    }),
  };
  if (existing) entry.texture = existing.texture;
  cache.set(key, entry);
  return entry.promise;
}

export function getBackTexture(
  project: Project,
  force = false,
): Promise<THREE.CanvasTexture> {
  const key = `back|${JSON.stringify(project.back)}`;
  return build(key, () => compositeCardBack(project.back), force);
}

export function getFrontTexture(
  project: Project,
  force = false,
): Promise<THREE.CanvasTexture> {
  const key = `front|${project.id}|${project.title}|${project.category}|${project.frontBg}|${project.image}`;
  return build(key, () => compositeCardFront(project), force);
}

/** Notifies subscribers when fronts have been recomposited post-font-load. */
export function onTexturesRefreshed(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let fontBackstopArmed = false;

export function armFontBackstop(projects: Project[]) {
  if (fontBackstopArmed || typeof document === "undefined") return;
  fontBackstopArmed = true;
  document.fonts.ready.then(async () => {
    await Promise.all(projects.map((p) => getFrontTexture(p, true)));
    listeners.forEach((cb) => cb());
  });
}
