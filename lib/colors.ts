// Design System §1 color tokens as JS constants — the canvas texture
// compositors can't read CSS custom properties, so these mirror tokens.css.

export const COLORS = {
  tableCenter: "#186245",
  tableEdge: "#030F0A",

  cardBackBg: "#130A5D",
  cardBackBorder: "#FFFFFF",
  cardBackTrace: "#FFFFFF",

  cardFrontBg: "#FFFFFF",
  cardFrontText: "#1C1C1C",

  flagshipGold: "#B8860B",

  dockIcon: "#FFFFFF",
} as const;

// §5 elevation scale — shadow color is rgba(3,15,10,α) throughout, derived
// from tableEdge so shadows read as part of the felt.
export interface ElevationRow {
  offsetX: number;
  offsetY: number;
  blur: number;
  opacity: number;
}

export const ELEVATION: Record<
  "rest" | "bobPeak" | "hover" | "opened",
  ElevationRow
> = {
  rest: { offsetX: 4, offsetY: 8, blur: 8, opacity: 0.35 },
  bobPeak: { offsetX: 6, offsetY: 14, blur: 14, opacity: 0.28 },
  hover: { offsetX: 8, offsetY: 20, blur: 20, opacity: 0.4 },
  opened: { offsetX: 0, offsetY: 24, blur: 40, opacity: 0.5 },
};

export const SHADOW_RGB = "3, 15, 10";
