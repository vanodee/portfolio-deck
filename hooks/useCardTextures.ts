"use client";

import { useEffect, useState } from "react";
import type * as THREE from "three";
import type { Project } from "@/data/types";
import {
  getBackTexture,
  getFrontTexture,
  onTexturesRefreshed,
} from "@/lib/textures/textureCache";

export function useCardTextures(project: Project) {
  const [textures, setTextures] = useState<{
    back: THREE.CanvasTexture;
    front: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      Promise.all([getBackTexture(project), getFrontTexture(project)])
        .then(([back, front]) => {
          if (alive) setTextures({ back, front });
        })
        .catch((err) => console.error("[textures] failed", project.id, err));
    load();
    const unsubscribe = onTexturesRefreshed(load);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [project]);

  return textures;
}
