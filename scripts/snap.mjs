// Headless verification harness (dev-only tooling, not app code).
// Usage: node scripts/snap.mjs <outDir> <step> [--mobile]
// Steps: load-sequence | hover | reveal | shuffle | open | close | about | about-hover
// Saves PNGs into <outDir> and prints console messages + errors.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [outDir = ".", step = "load-sequence", ...flags] = process.argv.slice(2);
const mobile = flags.includes("--mobile");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
});

const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[PAGEERROR] ${e.message}`));

const shot = (name) =>
  page.screenshot({ path: join(outDir, `${name}${mobile ? "-mobile" : ""}.png`) });

// The about/about-hover steps verify the /about route's Chip component
// directly and don't involve the Home deck/dealing flow at all.
const isAboutStep = step === "about" || step === "about-hover";

if (isAboutStep) {
  await page.goto("http://localhost:3000/about", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300); // let textures warm
} else {
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
}

const CENTER_CARD = mobile ? { x: 195, y: 300 } : { x: 590, y: 320 }; // grid slot 1-ish
// Dock is now a wide, edge-pinned pill (liquid-glass restyle) — left group
// sits near the pill's left edge rather than near horizontal center.
const EYE = mobile ? { x: 52, y: 801 } : { x: 530, y: 849 };
const SHUFFLE = mobile ? { x: 105, y: 801 } : { x: 591, y: 849 };
// Onboarding gates the deal behind a click on the deck (new pre-table
// phase) — every scenario below needs it clicked before assuming a dealt
// table. Coordinates are the deck's resting screen position, derived from
// lib/layout.ts's deck.y/topPad/cardH math for CARD_COUNT=15 (data/projects.ts)
// at this script's viewport sizes: screenX = frameRect.left + contentWidth/2,
// screenY = frameRect.top + topPad + cardH/2 (scrollTop is 0 pre-deal).
// Recompute if CARD_COUNT or the DESKTOP/MOBILE layout constants change.
const DECK = mobile ? { x: 195, y: 185 } : { x: 720, y: 287 };
// First tool chip's (TypeScript) centered position on /about
// (app/about/page.tsx: 6 chips, 64px gap, flex-wrap centered block).
// Recompute if the chips' size/gap/order or the about-page layout change.
const TOOL_CHIP = mobile ? { x: 301, y: 205 } : { x: 449, y: 437 };

if (!isAboutStep) {
  await page.waitForTimeout(300); // let textures warm + onboarding screen mount
  await shot("onboarding");
  await page.mouse.click(DECK.x, DECK.y);
}

switch (step) {
  case "load-sequence": {
    await shot("deal-0ms");
    await page.waitForTimeout(400);
    await shot("deal-400ms");
    await page.waitForTimeout(400);
    await shot("deal-800ms");
    await page.waitForTimeout(400);
    await shot("deal-1200ms");
    await page.waitForTimeout(1000);
    await shot("deal-settled");
    // two more 600ms apart to see idle bob drift
    await page.waitForTimeout(600);
    await shot("bob-a");
    await page.waitForTimeout(600);
    await shot("bob-b");
    break;
  }
  case "shuffle": {
    await page.waitForTimeout(2600); // let deal finish
    await page.mouse.click(SHUFFLE.x, SHUFFLE.y);
    await page.waitForTimeout(280);
    await shot("shuffle-mid");
    await page.waitForTimeout(250);
    await shot("shuffle-late");
    await page.waitForTimeout(900);
    await shot("shuffle-settled");
    break;
  }
  case "reveal": {
    await page.waitForTimeout(2600);
    await page.mouse.click(EYE.x, EYE.y);
    await page.waitForTimeout(300);
    await shot("reveal-mid");
    await page.waitForTimeout(900);
    await shot("reveal-settled");
    break;
  }
  case "hover": {
    await page.waitForTimeout(2600);
    await page.mouse.move(CENTER_CARD.x, CENTER_CARD.y);
    await page.waitForTimeout(320);
    await shot("hover");
    await page.waitForTimeout(600); // peek threshold + in
    await shot("peek");
    break;
  }
  // Open/close timings below assume 15 projects (14 "other" cards) and the
  // current MOTION.deal.stagger (75ms) / perCard (450ms) — gather/scatter
  // total ≈ (14-1)*75 + 450 + 100 = 1525ms. Recompute if PROJECTS.length or
  // those MOTION values change.
  case "open": {
    await page.waitForTimeout(2600); // let entrance deal finish
    await page.mouse.click(CENTER_CARD.x, CENTER_CARD.y);
    await page.waitForTimeout(350);
    await shot("open-flipping"); // mid-flip (flip: 500ms)
    await page.waitForTimeout(400);
    await shot("open-gathering"); // flip settled (~500ms), mid-gather (~1525ms)
    await page.waitForTimeout(1425);
    await shot("open-scaling"); // gather settled (~2025ms), mid-scale (scaleOpen: 550ms)
    await page.waitForTimeout(1000);
    await shot("open-settled"); // scale + overlay fade-in done (~2775ms)
    break;
  }
  case "close": {
    await page.waitForTimeout(2600);
    await page.mouse.click(CENTER_CARD.x, CENTER_CARD.y);
    await page.waitForTimeout(3100); // full open sequence settled (~2775ms) + margin
    await shot("before-close");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await shot("closing"); // mid closing scale-down (close: 400ms)
    await page.waitForTimeout(400);
    await shot("scattering"); // closing settled (~400ms), mid-scatter (~1525ms)
    await page.waitForTimeout(1825);
    await shot("closed"); // scatter settled + margin
    break;
  }
  case "about": {
    await shot("about-rest"); // stat + tool chip, gloss visible, no hover
    break;
  }
  case "about-hover": {
    await page.mouse.move(TOOL_CHIP.x, TOOL_CHIP.y);
    await page.waitForTimeout(280); // past MOTION.hover.in (220ms)
    await shot("about-hover-lifted"); // lift + revealed label
    break;
  }
  default:
    console.error("unknown step", step);
}

console.log(logs.join("\n") || "(no console messages)");
await browser.close();
