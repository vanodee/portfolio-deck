// Width-only Sanity CDN transform — no server-side fit/height crop, so
// whatever container the caller draws into (canvas cover-crop, CSS
// object-fit) is the only crop that ever runs (avoids the double-cropping
// problem FRONTEND_INTEGRATION.md §3 flags). Shared by the canvas card-front
// compositor and any DOM <img> usage (reading pane hero/closing images).
export function sanityImageAtWidth(url: string, width: number): string {
  return `${url}${url.includes("?") ? "&" : "?"}w=${width}&auto=format`;
}
