"use client";

// Required Next.js convention: an error thrown inside app/layout.tsx itself
// (e.g. the project listing fetch, RootLayout's own async work) can't be
// caught by a route-level error.tsx in the same segment — only this file,
// which replaces the root layout entirely and must define its own
// <html>/<body>. Deliberately self-contained (inline styles, no shared
// components/CSS custom properties) since nothing from the normal layout
// tree is guaranteed to have mounted.

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          textAlign: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          color: "#FFFFFF",
          background:
            "radial-gradient(120% 120% at 50% 20%, #186245 0%, #030F0A 100%)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>
          The deck couldn&apos;t be dealt
        </h1>
        <p style={{ opacity: 0.75, maxWidth: 420, margin: 0 }}>
          Something went wrong loading the table. Please try again in a
          moment.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            padding: "10px 24px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.1)",
            color: "#FFFFFF",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
