import type { ReactNode } from "react";
import styles from "./ProjectBodyShared.module.css";

// Light/dark section rhythm — omission is the caller's responsibility (each
// category body checks its own fields before rendering a Section at all),
// since only the caller knows which fields back a given section.
export default function Section({ dark, children }: { dark?: boolean; children: ReactNode }) {
  return <div className={dark ? styles.sectionDark : styles.section}>{children}</div>;
}
