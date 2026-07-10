"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS } from "@/data/projects";
import { getReadingPane } from "@/lib/layout";
import { MOTION } from "@/lib/motion";
import { drawPlaceholderArt } from "@/lib/textures/compositeCardFront";
import { useTableStore } from "@/store/useTableStore";
import styles from "./OpenCardOverlay.module.css";

// The scrollable reading view (PRD §4.5). Mounts once the card mesh has
// finished scaling into place ('open'); the pane geometry mirrors the mesh
// target (getReadingPane) so the crossfade reads as one object.

function ArtBlock({ projectId }: { projectId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const w = canvas.clientWidth * 2;
    const h = Math.round(w * (634 / 1153));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) drawPlaceholderArt(ctx, projectId, 0, 0, w, h);
  }, [projectId]);
  return <canvas ref={ref} className={styles.art} aria-hidden="true" />;
}

export default function OpenCardOverlay() {
  const openCardId = useTableStore((s) => s.openCardId);
  const openPhase = useTableStore((s) => s.openPhase);
  const closeCard = useTableStore((s) => s.closeCard);

  const visible = openPhase === "open";
  const project = PROJECTS.find((p) => p.id === openCardId);

  // Pane geometry must match the card mesh's scale target.
  const [pane, setPane] = useState<{ width: number; top: number } | null>(null);
  useEffect(() => {
    if (!visible) return;
    const update = () =>
      setPane(getReadingPane(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCard();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, closeCard]);

  return (
    <AnimatePresence>
      {visible && project && pane && (
        <>
          <motion.div
            key="backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.overlay.fadeOut / 1000 }}
            onClick={closeCard}
          />
          <motion.div
            key="pane"
            className={styles.pane}
            style={{
              width: pane.width,
              top: pane.top,
              bottom: 0,
              x: "-50%",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{
              duration: MOTION.overlay.fadeIn / 1000,
              ease: "easeOut",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
          >
            <button
              type="button"
              className={styles.close}
              onClick={closeCard}
              aria-label="Close"
            >
              ✕
            </button>
            <ArtBlock projectId={project.id} />
            <div className={styles.content}>
              <h2 className={styles.title}>{project.title}</h2>
              <p className={styles.meta}>
                {project.category} — {project.date}
              </p>
              <div className={styles.body}>
                {project.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
