// Design System §6 motion tokens — single source of truth for every
// duration/stagger in the app. All values in milliseconds.

export const MOTION = {
  idleBob: {
    periodMin: 3200,
    periodMax: 4200, // randomized per card, deliberately desynced
    liftPx: 6, // vertical travel at bob peak (rest → bobPeak elevation row)
    scalePulse: 0.008,
  },

  hover: {
    in: 220, // ease-out — snappy response in
    out: 320, // ease-in-out — softer settle out
    liftPx: 14,
    scale: 1.03,
  },

  peek: {
    holdThreshold: 600, // hover hold before the "tell" triggers
    in: 380, // ease-out
    out: 280, // ease-in
    angleRad: 0.3, // partial flip — a few degrees, not 180°
  },

  flip: 500, // flipEase (overshoot)

  scaleOpen: 550, // openEase
  close: 400, // ease-in — quicker than open

  overlay: {
    fadeIn: 200,
    fadeOut: 180,
  },

  shuffle: {
    lift: 150,
    travelMin: 500,
    travelMax: 650, // scaled by travel distance
    staggerMin: 50,
    staggerMax: 80,
    liftPx: 26,
  },

  deal: {
    jitter: 500, // deck riffle before dealing (400–600ms window)
    perCard: 450, // expo-out
    stagger: 75, // 60–90ms window
  },

  // Open-reveal gather/scatter stages reuse deal's perCard/stagger/expo-out
  // for travel timing — these are just the fan-stack geometry constants.
  gather: {
    fanStepPx: 10, // lateral peek offset per stacked rank, alternating sides
    fanAngleStepRad: 0.05, // ~3° in-plane tilt per stacked rank
    fanMaxRank: 4, // caps fan spread so a larger deck doesn't splay too wide
    stackZBase: -2, // first-gathered card's z depth under the open card
    stackZStep: 0.15, // additional depth per rank further back in the stack
  },

  bulkReveal: {
    stagger: 50, // 40–60ms window, reuses flip timing
  },

  // About page — Photo Card spread (Hero section). NOT part of DS §3's
  // documented card-front spec yet; new, About-page-specific geometry, and
  // NOT a reuse/edit of `gather` above (that block is WebGL open-card 3D
  // stack choreography, tuned for a different purpose — see PRD §4.5).
  // Click-anywhere-on-spread cycles which card is frontmost (round-robin);
  // each card's peek offset is driven by its rank relative to the front card.
  photoSpread: {
    offsetXStepPx: 34, // lateral peek offset per stacked rank
    offsetYStepPx: 22, // vertical peek offset per stacked rank
    rotationStepDeg: 7, // in-plane tilt per stacked rank, at rest
    hoverRotationStepDeg: 14, // in-plane tilt per stacked rank, spread hovered (mouse only)
    // The front (rank 0) card sits outside the rank*step formula above (it's
    // always the pivot, 0deg at rest) — without its own hover reaction it
    // reads as dead/static next to the fanning cards behind it. Tilts the
    // opposite way from the back cards' positive rotation so the whole
    // spread reads as pivoting apart from a shared center, not just the back
    // cards sliding out from under an inert top card.
    frontHoverRotationDeg: -6,
    cycleDuration: 380, // ms — rank-swap transition on click, also drives the hover-rotation tween
  },

  // About page — Experience Card spread (Experience section). Also NOT a
  // reuse/edit of `gather` — this fan is static (no interaction).
  //
  // Two responsive variants (ExperienceCardSpread.tsx switches on
  // hooks/useBreakpoint.ts at the same 767px threshold the rest of the page
  // uses): `desktop` is the horizontal fan below, `mobile` is a vertical
  // peek-stack (top-anchored cards stacked directly on top of each other).
  // ExperienceCard.module.css's text block is top-anchored (not centered)
  // specifically so both variants can reveal it without needing separate
  // text positioning per variant.
  experienceFan: {
    desktop: {
      // Narrowed from the original 190/7/26 (responsive audit finding: the
      // original fan's natural width, 214 + 3*190 = 784px, didn't fit any
      // "desktop" viewport below ~980px, clipping cards with no way to
      // scroll back to them). Tightening the step means a neighbor's card
      // BODY now covers more of the previous card, which is why the text
      // moved to the top of the card (ExperienceCard.module.css) — a
      // trailing card's own top-anchored text sits above where the next
      // card's top edge begins, so it stays clear even at this step.
      // `.runSpreadWrap`'s `overflow-x: auto` (AboutContent.module.css) is
      // the safety net if some in-between width still doesn't fit.
      xStepPx: 150,
      rotationStepDeg: 5, // rotation per step away from center
      liftPx: 18, // vertical drop per step away from center (bow shape)
    },
    mobile: {
      // Cards stacked directly on top of each other (no x offset, no
      // rotation) — only `revealPx` differs per card, exposing just its
      // (top-anchored) text above the card underneath. Two prior estimates
      // (96px, then 135px) both verified too short via screenshot/DOM
      // measurement — the worst case (longest title + company,
      // "Sr. Product Designer" / "Pretzl (via Peanut Technologies)") renders
      // its text block bottom edge 153px from the card's own top (measured
      // live, getBoundingClientRect, after ExperienceCard.module.css's
      // .content padding-top was also trimmed 32px->24px to help). 160px
      // clears that with a small margin, rather than continuing to guess.
      revealPx: 160,
    },
  },

  // Ambient "dealer's choice" glow (PRD §4.7 / DS §1.7) — always-on soft
  // pulse around the flagship card, independent of hover/face state.
  flagshipGlow: {
    period: 2800, // one breathe cycle, sine in-out
    minOpacity: 0.10,
    maxOpacity: 0.3,
  },

  // Onboarding-only "overhand shuffle" loop (Card.tsx onboardingShuffleStart)
  // — X-axis only (no Y/Z/rotation): a clean, repeating merge <-> cut cycle,
  // scoped entirely to the pre-click onboarding screen. Not part of the
  // design system yet — placeholder values pending user tuning.
  onboardingShuffle: {
    cutOffsetX: 90, // px each pile shifts left/right of center when cut apart
    fanAmpX: 15, // stable per-card X fan within a pile, ± this many px
    cutDuration: 190, // ms — merged<->cut transition, either direction
    holdMerged: 130, // ms — hold fully merged before cutting
    holdCut: 160, // ms — hold cut apart before recombining
    loopStagger: 10, // ms — per-card initial phase offset (stackIndex * loopStagger)
    ascendDuration: 800, // ms — slow rise from shuffle rest position to deck.y, pre-deal
  },

  // Onboarding -> table handoff choreography (border fade-in, logo travel,
  // dock formation, header/heading reveal). Also pending design-system sync.
  // Dual-purposed: lib/dockChoreography.ts also replays logoTravel/
  // dockCrossfade/dockFormation in reverse-then-forward for the Home <->
  // About dock route transition.
  onboarding: {
    helloFadeOut: 180, // "Hello!" + subheading fade on deck click
    logoTravel: 900, // standalone logo's translate+scale travel to the dock position
    dockCrossfade: 220, // logo <-> dock opacity swap, once the logo arrives
    dockFormation: 1400, // pill extend + button reveal, after the crossfade
    // Rest-state clip is an ellipse, not a circle — a circle inscribed in
    // the center logo's box clips its corners; an ellipse can be sized to
    // clear a rectangular logo cleanly while still reading as a small pill.
    dockRestRx: 42, // px, rest-state ellipse half-width (clears the logo's corners)
    dockRestRy: 28, // px, rest-state ellipse half-height
    dockFormedRadius: 280, // px, fully-formed ellipse radius (both axes) — covers the whole pill
    dockButtonStagger: 90, // per-button reveal stagger within each group
    dockButtonOffsetX: 20, // px, buttons start shifted toward dock center
    borderFadeIn: 700, // dashed play-area border alpha fade-in
    headerFadeIn: 850, // header fade+translate-in, post deal-complete
    headerTranslateX: 40, // px, "from the left" starting offset
    // "Pick a Card" waits for the header's fade+translate to fully finish
    // (PickACardHeading.tsx delays by headerFadeIn + this gap, not just this
    // gap alone), then adds this small extra beat before starting itself.
    headingDelayAfterHeader: 80,
    headingFadeIn: 700,
    pickACardTranslateY: 20, // px — downward-entrance offset for "Pick a Card"

    // Page-load entrance + click-exit for "Hello!"/subheading/cards — the
    // rest of this block is the CLICK->table handoff, this part is the
    // initial load-in that precedes it.
    helloEnterTranslateVh: 32, // vh — "Hello!"'s on-load starting offset (scales with viewport height)
    helloEnterDuration: 1000, // ms — "Hello!" translate-into-place duration on load
    helloExitTranslateY: 24, // px — additional upward translate during click-exit
    cardsFadeInDelay: 0, // ms — cards start fading in shortly after Hello begins moving
    cardsFadeInDuration: 0, // ms — card opacity 0->1 fade duration
    // Subheading waits for BOTH Hello's translate and the cards' fade-in to
    // finish (computed as Math.max of the two, plus this gap) — see
    // OnboardingScreen.tsx, same "derive from the other side's duration"
    // pattern as headingDelayAfterHeader above.
    subheadingDelayGap: 120,
    subheadingFadeIn: 500, // ms — subheading's own fade-in duration
  },

  // Home <-> About route-nav table-exit — the deck + "Pick a Card" heading
  // sliding out/in, distinct from (but triggered alongside) the dock's own
  // formation choreography above (lib/dockChoreography.ts). TableHeader and
  // PlayArea persist across the route change (app/layout.tsx); this is what
  // animates their contents rather than having them just vanish/reappear.
  // Placeholder values, same pending-tuning caveat as onboarding.
  tableNav: {
    // px — must clear the play area's max width (DS §4.1, min(1200px, ...))
    // from any column's content-local position, or cards only partially
    // slide out of frame instead of fully exiting (verified via live
    // browser testing: 500px left a couple of columns still peeking in).
    cardTranslateX: 1200,
    cardDuration: 450, // ms per card (reuses deal.perCard's magnitude)
    cardStagger: 40, // ms between cards
    headingTranslateY: 60, // px, upward exit distance
    headingDuration: 500, // ms
  },

  // About page's own content translate+fade on Home <-> About nav — a single
  // DOM block, not staggered WebGL cards, so this is its own (smaller, no
  // stagger) counterpart to tableNav above. Placeholder values, same
  // pending-tuning caveat as tableNav/onboarding.
  aboutNav: {
    translateX: 60, // px, "from the right" entrance/exit offset
    duration: 500, // ms
  },

  // About page section-reveal — the first-visit-only "dealt in" stagger for
  // Hero's photo cards/stat chips, The Run's experience cards, the tool-chip
  // grid, and the brand-card grid (hooks/useAboutSectionsGate.ts,
  // hooks/useSectionReveal.ts, hooks/useEntranceHoldReveal.ts). Distinct from
  // aboutNav above, which is the page-level slide-in/out on route change —
  // this is purely within-page, per-section, viewport-triggered choreography.
  // Placeholder values, same pending-tuning caveat as onboarding/tableNav.
  aboutSectionReveal: {
    translateY: 40, // px, "from below" starting offset for every deal-in element
    duration: 220, // ms, per-item translate+fade-in
    // Gap AFTER a given item's own entrance fully finishes, before the next
    // item's starts — items are sequenced strictly one-at-a-time (delay_i =
    // i * (duration + stagger)), never overlapping, so this is breathing
    // room between entrances rather than an overlap offset.
    stagger: 10,
    heroChipsGap: 150, // ms, extra gap after Hero's photo-card stagger fully finishes before stat chips begin
    chipHoldDuration: 650, // ms, a tool chip stays in forced-hover (name-revealed) pose before settling to idle
    brandHoldDuration: 650, // ms, a brand card stays in forced-reveal (logo-shown) pose before settling to its name
    // Padding added on top of MOTION.aboutNav.duration when gating reveal
    // start on nav-arrivals (About mounted via router.push, not a direct/
    // hard-reloaded load) — mirrors beginAboutNavExit's own settle-margin.
    routeTransitionBuffer: 100,
  },

  // Route toggle (ControlDock right group, DockToggle.tsx) — the thumb's
  // slide + the sequenced icon de-emphasis/re-emphasis around it.
  // thumbTravelPx must match ControlDock.module.css's .toggleTrack geometry
  // (thumb diameter 45 -- it lands flush against the opposite groove wall,
  // no gap; see that file's comment for the border-box accounting) — it
  // lives here because it's consumed as a Framer Motion `x` transform, not
  // a CSS property. Placeholder values, same pending-tuning caveat as
  // onboarding/tableNav above.
  //
  // The toggle's own animation (thumbDuration below) is deliberately much
  // shorter than the actual Home <-> About navigation it triggers
  // (lib/choreography.ts's beginTableNavExit, ~1.1s+ for the deck to slide
  // off-table) -- ControlDock.tsx flips the toggle optimistically on click
  // rather than waiting for the route to actually change, so the control
  // itself always feels immediately responsive. Once thumbDuration elapses,
  // ControlDock.tsx disables the whole dock (matching the existing
  // dealing/open-card "locked" treatment) until the real transition
  // finishes, rather than leaving the dock clickable while the toggle's
  // visual state doesn't yet match the in-flight navigation.
  dockToggle: {
    thumbTravelPx: 45, // px, left (Home) rest -> right (About) rest
    thumbDuration: 320, // ms — thumb translateX, openEaseBezierPoints
    iconOutDuration: 150, // ms — origin icon's scale/opacity de-emphasis, starts immediately as the thumb departs (delay 0)
    iconInDuration: 180, // ms — destination icon's scale/opacity re-emphasis
    iconInDelay: 140, // ms — thumbDuration - iconInDuration, timed so the destination icon finishes exactly as the thumb arrives, not simultaneously with the origin's fade. Update this if thumbDuration/iconInDuration change.
    inactiveScale: 0.72, // inactive icon's scale-down from its 30px rest size
    inactiveOpacity: 0.45, // inactive icon's dimmed opacity
  },

  // Left dock-group route-swap (ControlDock's Eye/Shuffle <-> Email/
  // LinkedIn/X) — triggered by the same toggle click as MOTION.dockToggle
  // above, on the same "flip immediately, don't wait for the real route
  // change" philosophy: the current side's buttons translate down and fade
  // out, staggered one after another, the instant the toggle is clicked;
  // once the route actually changes and the new side's buttons mount, they
  // play the exact reverse (translate up from below + fade in), same
  // per-button order. Both totals finish well within MOTION.dockToggle
  // .thumbDuration + the navBusy lockout window, long before the ~1.1s+
  // beginTableNavExit navigation itself fires. Placeholder values, same
  // pending-tuning caveat as the rest of this file.
  dockLeftSwap: {
    offsetY: 14, // px, downward exit / upward-from entrance offset
    duration: 220, // ms, per button
    stagger: 60, // ms, delay between each button's start
  },
} as const;
