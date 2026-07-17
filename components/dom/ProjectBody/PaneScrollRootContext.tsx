"use client";

import { createContext, type RefObject } from "react";

// The reading pane scrolls internally (.pane { overflow-y: auto }), not the
// page — IntersectionObserver's default root (the top-level viewport) never
// changes as the pane scrolls, so every video would report as permanently
// "intersecting" without this. Provided once by OpenCardOverlay, consumed by
// AutoplayVideo wherever it's rendered (arbitrarily deep in a category body).
export const PaneScrollRootContext = createContext<RefObject<HTMLElement | null> | null>(null);
