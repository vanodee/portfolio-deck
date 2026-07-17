import type { CardBackStyle } from "@/data/types";
import { COLORS } from "@/lib/colors";

// Default-blue vs. flagship-gold back styling, derived from isFlagship so
// the two signals can never drift out of sync (single source of truth for
// every Project-building path).

export const STANDARD_BACK: CardBackStyle = {
  traceColor: COLORS.cardBackTrace,
  borderColor: COLORS.cardBackBorder,
  bgColor: COLORS.cardBackBg,
};

export const FLAGSHIP_BACK: CardBackStyle = {
  traceColor: COLORS.flagshipGold,
  borderColor: COLORS.flagshipGold,
  bgColor: COLORS.cardBackBg,
};

export function backFor(isFlagship: boolean): CardBackStyle {
  return isFlagship ? FLAGSHIP_BACK : STANDARD_BACK;
}
