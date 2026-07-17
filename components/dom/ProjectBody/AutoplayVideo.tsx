"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { PaneScrollRootContext } from "./PaneScrollRootContext";

interface AutoplayVideoProps {
  src: string;
  poster?: string | null;
  className?: string;
}

// Phase 8 — autoplay is required (§8's media recipe), but a long category
// body can carry dozens of video slots; playing all of them at once wastes
// decode/network resources on ones nowhere near the viewport. Poster-first:
// no <source> (no network request at all) until the video first scrolls
// into view, then play/pause tracks visibility from then on — the source
// itself is never removed once attached, so toggling back into view is an
// instant resume, not a re-buffer.
export default function AutoplayVideo({ src, poster, className }: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const rootRef = useContext(PaneScrollRootContext);
  const [sourceAttached, setSourceAttached] = useState(false);
  const inViewRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          setSourceAttached(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { root: rootRef?.current ?? null, rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootRef]);

  // Source only exists in the DOM once sourceAttached flips true — attaching
  // <source> children alone doesn't reliably trigger loading, so load() is
  // called explicitly once they're present.
  useEffect(() => {
    const el = ref.current;
    if (!el || !sourceAttached) return;
    el.load();
    if (inViewRef.current) el.play().catch(() => {});
  }, [sourceAttached]);

  return (
    <video ref={ref} className={className} poster={poster ?? undefined} muted loop playsInline preload="none">
      {sourceAttached && (
        <>
          <source src={src} type="video/mp4" />
          <source src={src} type="video/webm" />
        </>
      )}
    </video>
  );
}
