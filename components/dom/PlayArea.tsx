"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useShowTableContent } from "@/hooks/useShowTableContent";
import { getLayout, type FrameRect } from "@/lib/layout";
import { MOTION } from "@/lib/motion";
import { exitCardsOffTable } from "@/lib/choreography";
import { useTableStore } from "@/store/useTableStore";
import TableCanvas from "@/components/canvas/TableCanvas";
import A11yCardButtons from "./A11yCardButtons";
import AboutContent from "./AboutContent";
import PickACardHeading from "./PickACardHeading";
import styles from "./PlayArea.module.css";

// How quickly the applied scroll position eases toward its target each
// frame (0..1) — higher is snappier, lower is glidier. Wheel/touch input
// only ever moves the *target*; this loop is what makes the actual motion
// smooth regardless of how choppy the raw input deltas are.
const SCROLL_EASE = 0.18;

// The real main container for site content (everything except TableHeader):
// the card grid and "Pick a Card" heading live here. Card overflow scrolls
// natively via .scrollProxy; the WebGL canvas stays a full-viewport sibling
// (see TableCanvas.tsx for why) and is visually clipped to this box.
export default function PlayArea() {
  const breakpoint = useBreakpoint();
  // Scroll is frozen for the entire flip→scale→open→close lifecycle so the
  // frameRect/scroll snapshot Card.tsx uses to escape to the reading view
  // never goes stale mid-animation (see contentPanOffset in lib/layout.ts).
  const scrollLocked = useTableStore((s) => s.openCardId !== null);
  // This component persists across the Home <-> About route change
  // (app/layout.tsx) — the frame/border chrome below is always rendered,
  // but its Home-only content (heading, card grid, canvas) is gated to the
  // "/" route so nothing Home-specific bleeds onto About, which renders its
  // own content (AboutContent.tsx) in the branch below instead.
  const pathname = usePathname();
  const onHome = pathname === "/";
  // Dashed border stays invisible through Home's own onboarding gate,
  // fading in once the deck is clicked (appPhase leaves "onboarding") —
  // alpha-only, so the frame's own geometry/scroll-boundary role never
  // changes. Off Home, there's no onboarding concept — always visible,
  // like persistent chrome/a navbar.
  const appPhase = useTableStore((s) => s.appPhase);
  const borderVisible = !onHome || appPhase !== "onboarding";
  // Scroll stays disabled and the rail hidden through onboarding + dealing
  // (matches Card.tsx's isInteractive(), which also gates on dealComplete
  // rather than the onboarding sub-phase — cards aren't at final grid
  // positions yet mid-deal, so scrolling shouldn't re-enable until then).
  const dealComplete = useTableStore((s) => s.dealComplete);
  const scrollDisabled = !dealComplete;

  // Home <-> About dock-nav transition: the deck slides off-table to the
  // left and fades (About click). Card.tsx/TableCanvas fully unmount once
  // off Home (gated below), so only the exit direction needs an external
  // trigger here — the reverse (entering Home) is decided per-card at its
  // own mount time (Card.tsx's startOffTable), since there's no
  // continuously-mounted instance left to animate by the time we'd want to
  // call back in. Guarded against firing on the very first render (initial
  // onboarding entrance is a separate, existing concern).
  const showTableContent = useShowTableContent();
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (!showTableContent) {
      exitCardsOffTable();
    }
  }, [showTableContent]);

  // Settles dockNavPhase "collapsing" -> "expanding" (lib/choreography.ts's
  // beginTableNavExit/beginAboutNavExit) once `onHome` — derived straight
  // from pathname — has actually changed, rather than on a timer inside
  // those functions. router.push resolves asynchronously (verified live:
  // the pathname update lands a real ~80ms+ after router.push is called,
  // not the same tick/transition), so settling it there left a window where
  // dockNavPhase had already left "collapsing" while the outgoing route was
  // still showing — useShowTableContent/PickACardHeading/AboutContent's
  // `exiting` all key directly off dockNavPhase, so that window read as a
  // visible stutter of the outgoing route right before the real navigation
  // landed. Keying this off `onHome` instead guarantees it can't fire early.
  // Guarded no-op unless a collapse is actually in flight (store).
  useEffect(() => {
    useTableStore.getState().beginDockExpand();
  }, [onHome]);

  const frameRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const targetScrollRef = useRef(0);
  const isSyncingRailRef = useRef(false);

  const [frameRect, setFrameRect] = useState<FrameRect | null>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setFrameRect({ left: r.left, top: r.top, width: r.width, height: r.height });
      setContentWidth(r.width);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const el = proxyRef.current;
    if (!el) return;
    // Visible scrollport height — the reference budget getLayout uses to
    // size cards at the original 2-row density (lib/layout.ts). Keyed on
    // onHome (not []): the scrollProxy div only exists while onHome, so a
    // first-ever mount landing directly on /about would otherwise never
    // attach this observer at all, even after later navigating to Home.
    const measureHeight = () => setAvailableHeight(el.clientHeight);
    measureHeight();
    const ro = new ResizeObserver(measureHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHome]);

  // Eases the applied scroll position toward targetScrollRef every frame,
  // and mirrors it onto the visible/draggable scrollbar rail. Wheel/touch
  // input (below) only ever nudges the target — this is what turns raw,
  // discrete wheel deltas into a smooth glide instead of a jump.
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const proxy = proxyRef.current;
      const rail = railRef.current;
      if (proxy) {
        const current = proxy.scrollTop;
        const target = targetScrollRef.current;
        const next = Math.abs(target - current) < 0.5 ? target : current + (target - current) * SCROLL_EASE;
        proxy.scrollTop = next;
        scrollYRef.current = next;
        if (rail && Math.abs(rail.scrollTop - next) > 0.5) {
          isSyncingRailRef.current = true;
          rail.scrollTop = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // The rail is the only real draggable scrollbar (native, clickable arrows
  // included) — its own scroll events are genuine user drag/click input,
  // except when the flag above shows the change was our own sync write.
  // Keyed on onHome for the same reason as the availableHeight effect above
  // — the rail only exists while onHome.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => {
      if (isSyncingRailRef.current) {
        isSyncingRailRef.current = false;
        return;
      }
      const proxy = proxyRef.current;
      targetScrollRef.current = rail.scrollTop;
      scrollYRef.current = rail.scrollTop;
      if (proxy) proxy.scrollTop = rail.scrollTop;
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => rail.removeEventListener("scroll", onScroll);
  }, [onHome]);

  // Memoized so the object identity only changes when its actual inputs do
  // — every Card holds this in its handle-registration effect deps
  // (lib/cardHandles.ts), and a fresh reference on every unrelated render
  // (e.g. store churn during open/close choreography) would unregister and
  // re-register all 15 handles on every tick, racing choreography calls
  // that read the registry synchronously.
  const layout = useMemo(
    () =>
      contentWidth != null && availableHeight != null
        ? getLayout(breakpoint, contentWidth, availableHeight)
        : null,
    [breakpoint, contentWidth, availableHeight],
  );

  const handleScrollForward = (deltaY: number, immediate: boolean) => {
    const proxy = proxyRef.current;
    if (!proxy) return;
    const max = Math.max(0, proxy.scrollHeight - proxy.clientHeight);
    const nextTarget = Math.min(max, Math.max(0, targetScrollRef.current + deltaY));
    targetScrollRef.current = nextTarget;
    if (immediate) {
      proxy.scrollTop = nextTarget;
      scrollYRef.current = nextTarget;
      const rail = railRef.current;
      if (rail) {
        isSyncingRailRef.current = true;
        rail.scrollTop = nextTarget;
      }
    }
  };

  return (
    <div className={styles.viewport}>
      <div
        ref={frameRef}
        className={styles.frame}
        style={{
          ["--frame-border-alpha" as string]: borderVisible ? 0.35 : 0,
          transitionDuration: `${MOTION.onboarding.borderFadeIn}ms`,
        }}
      >
        {onHome && (
          <>
            <PickACardHeading />
            <div className={styles.scrollportWrap}>
              <div ref={proxyRef} className={styles.scrollProxy}>
                {layout && <A11yCardButtons layout={layout} />}
              </div>
              <div
                ref={railRef}
                className={styles.scrollbarRail}
                style={{
                  pointerEvents: scrollLocked || scrollDisabled ? "none" : "auto",
                  display: scrollDisabled ? "none" : undefined,
                }}
              >
                {layout && <div style={{ height: layout.contentHeight }} />}
              </div>
            </div>
            {layout && (
              <TableCanvas
                layout={layout}
                frameRect={frameRect}
                scrollYRef={scrollYRef}
                onScrollForward={handleScrollForward}
              />
            )}
          </>
        )}
        {!onHome && <AboutContent />}
      </div>
    </div>
  );
}
