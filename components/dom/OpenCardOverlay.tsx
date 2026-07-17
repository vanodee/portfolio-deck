"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getReadingPane } from "@/lib/layout";
import { MOTION } from "@/lib/motion";
import { drawPlaceholderArt } from "@/lib/textures/compositeCardFront";
import { sanityImageAtWidth } from "@/lib/sanityImage";
import { getProjectDetail } from "@/lib/getProjects";
import { useTableStore } from "@/store/useTableStore";
import type { ProjectDetail } from "@/data/types";
import WebAppsBody from "./ProjectBody/WebAppsBody";
import WebsitesBody from "./ProjectBody/WebsitesBody";
import UxCaseStudiesBody from "./ProjectBody/UxCaseStudiesBody";
import LogosBrandingBody from "./ProjectBody/LogosBrandingBody";
import { PaneScrollRootContext } from "./ProjectBody/PaneScrollRootContext";
import styles from "./OpenCardOverlay.module.css";

// The scrollable reading view (PRD §4.5). Mounts once the card mesh has
// finished scaling into place ('open'); the pane geometry mirrors the mesh
// target (getReadingPane) so the crossfade reads as one object.
//
// Shared hero/overview shell per PROJECT_PAGE_LAYOUT.md §5/§6. Category-
// specific body content (§9) is a later phase — see the marker comment below
// for where it slots in, between Overview and the closing image.

// Sized off its own container's rendered box (fixed height via CSS, same
// .imageBlock rules the real hero image uses) rather than a fixed aspect
// ratio, so the placeholder and the real image never cause a height jump
// when the detail fetch resolves.
function ArtBlock({ projectId }: { projectId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const w = canvas.clientWidth * 2;
    const h = canvas.clientHeight * 2;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) drawPlaceholderArt(ctx, projectId, 0, 0, w, h);
  }, [projectId]);
  return (
    <div className={styles.heroImageContainer}>
      <canvas ref={ref} className={styles.heroImage} aria-hidden="true" />
    </div>
  );
}

type DetailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; detail: ProjectDetail };

export default function OpenCardOverlay() {
  const openCardId = useTableStore((s) => s.openCardId);
  const openPhase = useTableStore((s) => s.openPhase);
  const closeCard = useTableStore((s) => s.closeCard);
  const projects = useTableStore((s) => s.projects);

  const visible = openPhase === "open";
  const project = projects.find((p) => p.id === openCardId);
  const paneRef = useRef<HTMLDivElement>(null);

  // Lazy per-card detail fetch (hero/overview content) — decoupled from the
  // open animation, which only needs the id (never content). A failure here
  // is low-stakes (the grid/cards already work) so it's caught locally
  // rather than thrown to app/global-error.tsx.
  const [detailState, setDetailState] = useState<DetailState>({ status: "loading" });
  useEffect(() => {
    if (!openCardId || !project) return;
    let current = true;
    setDetailState({ status: "loading" });
    getProjectDetail(openCardId, project.category)
      .then((detail) => {
        if (current) setDetailState({ status: "ready", detail });
      })
      .catch((err) => {
        console.error("[sanity] project detail fetch failed", openCardId, err);
        if (current) setDetailState({ status: "error" });
      });
    return () => {
      current = false;
    };
  }, [openCardId, project?.category]);

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
            ref={paneRef}
            className={styles.pane}
            style={
              {
                width: pane.width,
                top: pane.top,
                bottom: 0,
                x: "-50%",
                "--projectBgColor": project.frontBg,
                "--projectColor": project.projectColor,
                "--projectColorDark": project.projectColorDark,
                "--projectCtaColor": project.ctaColor,
              } as React.CSSProperties
            }
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

            {detailState.status === "ready" && detailState.detail.heroImage ? (
              <div className={styles.heroImageContainer}>
                <img
                  src={sanityImageAtWidth(detailState.detail.heroImage, 1600)}
                  alt=""
                  className={styles.heroImage}
                />
              </div>
            ) : (
              <ArtBlock projectId={project.id} />
            )}

            <div className={styles.heroText}>
              <span className={styles.categoryPill}>{project.category}</span>
              <h1 className={styles.heroHeading}>{project.title}</h1>
              {detailState.status === "ready" && detailState.detail.heroSubheading && (
                <h2 className={styles.heroSubheading}>
                  {detailState.detail.heroSubheading}
                </h2>
              )}
              {detailState.status === "ready" && detailState.detail.heroDescription && (
                <p className={styles.heroDescription}>
                  {detailState.detail.heroDescription}
                </p>
              )}
              {detailState.status === "loading" && (
                <p className={styles.bodyMuted}>Loading…</p>
              )}
              {detailState.status === "error" && (
                <p className={styles.bodyMuted}>
                  Couldn&apos;t load this project&apos;s details — try closing
                  and reopening the card.
                </p>
              )}
            </div>

            {detailState.status === "ready" && (
              <div className={styles.customSection}>
                {detailState.detail.projectTags.length > 0 && (
                  <div className={styles.tagsRow}>
                    {detailState.detail.projectTags.map((tag, i) => (
                      <span key={i} className={styles.tagItem}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {detailState.detail.quickStats.length > 0 && (
                  <div className={styles.quickStats}>
                    {detailState.detail.quickStats.map((stat, i) => (
                      <div key={i} className={styles.quickStatItem}>
                        <span className={styles.statLabel}>{stat.title}</span>
                        <span className={styles.statValue}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {detailState.detail.tools.length > 0 && (
                  <div className={styles.toolsRow}>
                    <span className={styles.toolsLabel}>Tools</span>
                    <div className={styles.toolSet}>
                      {detailState.detail.tools.map((tool, i) => (
                        <div
                          key={i}
                          className={styles.toolItem}
                          style={{ "--toolColor": tool.color } as React.CSSProperties}
                        >
                          {tool.icon && <img src={tool.icon} alt="" />}
                          <span>{tool.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <PaneScrollRootContext.Provider value={paneRef}>
              {detailState.status === "ready" && detailState.detail.category === "Web Apps" && (
                <WebAppsBody detail={detailState.detail} />
              )}
              {detailState.status === "ready" && detailState.detail.category === "Websites" && (
                <WebsitesBody detail={detailState.detail} />
              )}
              {detailState.status === "ready" && detailState.detail.category === "UX Case Studies" && (
                <UxCaseStudiesBody detail={detailState.detail} />
              )}
              {detailState.status === "ready" && detailState.detail.category === "Logos & Branding" && (
                <LogosBrandingBody detail={detailState.detail} />
              )}
            </PaneScrollRootContext.Provider>

            {detailState.status === "ready" && detailState.detail.closingImage && (
              <div className={styles.closingImageContainer}>
                <img
                  src={sanityImageAtWidth(detailState.detail.closingImage, 1600)}
                  alt=""
                  className={styles.heroImage}
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
