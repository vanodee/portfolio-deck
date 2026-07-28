import Media from "./Media";
import styles from "./ProjectBodyShared.module.css";

interface DividerSectionProps {
  title?: string;
  image?: string | null;
  video?: string | null;
  videoPoster?: string | null;
}

// Chapter divider (UX Case Studies only — 4 of them). Rendered as a direct
// sibling of the numbered sections, not nested inside one — its own
// dark-overlay + centered-heading treatment is independent of the
// light/dark section alternation.
export default function DividerSection({ title, image, video, videoPoster }: DividerSectionProps) {
  if (!title && !image && !video) return null;

  return (
    <div className={styles.dividerImageContainer}>
      <Media
        image={image}
        video={video}
        videoPoster={videoPoster}
        alt={title || "Section divider"}
        className={styles.mediaFill}
        // Same full pane content width as SoloImageContainer — dividerImageContainer
        // sits directly in .section too.
        sizes="(max-width: 767px) 100vw, (max-width: 1463px) calc(100vw - 112px), 1320px"
      />
      {title && <h2>{title}</h2>}
    </div>
  );
}
