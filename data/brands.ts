import type { Brand } from "./types";

// Placeholder brands (varied name lengths, to exercise wrapping under the
// wordmark's wide 0.5em tracking in a 230px card) — 19 entries, one short of
// a full 4-column row so the "Tables I've Played" grid's last row visibly
// exercises the flex-wrap centering (AboutContent.module.css .brandGrid)
// instead of landing on an exact multiple of 4. logoSrc points at the
// dropped demo logo (public/assets/icons/janettotty_logo.svg), reused
// across every instance until real per-brand assets are wired up.
const DEMO_LOGO = "/assets/icons/janettotty_logo.svg";

export const BRANDS: Brand[] = [
  {
    id: "nordvale",
    name: "Nordvale",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "kestrel-finch",
    name: "Kestrel & Finch Studio",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "iron-quill",
    name: "Iron Quill",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "bramblewood",
    name: "Bramblewood Collective",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "hollow-pine",
    name: "Hollow Pine & Co.",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "marrow-lane",
    name: "Marrow Lane Studio",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "thistlewood",
    name: "Thistlewood Collective",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "foxglove-vane",
    name: "Foxglove & Vane",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "cinderwick",
    name: "Cinderwick Supply",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "amberfield",
    name: "Amberfield Works",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "northbrook",
    name: "Northbrook Atelier",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "vellum-oak",
    name: "Vellum & Oak",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "driftwood",
    name: "Driftwood Society",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "larkspur",
    name: "Larkspur Trading Co.",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "grayhollow",
    name: "Grayhollow Studio",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "ember-birch",
    name: "Ember & Birch",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "wrenfield",
    name: "Wrenfield Collective",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "copper-thistle",
    name: "Copper Thistle Co.",
    logoSrc: DEMO_LOGO,
  },
  {
    id: "saltmarsh",
    name: "Saltmarsh Works",
    logoSrc: DEMO_LOGO,
  },
];
