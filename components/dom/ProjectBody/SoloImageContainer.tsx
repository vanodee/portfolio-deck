import Media from "./Media";
import styles from "./ProjectBodyShared.module.css";

interface SoloImageContainerProps {
  image?: string | null;
  video?: string | null;
  videoPoster?: string | null;
  alt: string;
}

// Single full-width gallery item — natural aspect ratio, no crop (unlike
// TextImageRow's fixed-height rowImageContainer).
export default function SoloImageContainer({ image, video, videoPoster, alt }: SoloImageContainerProps) {
  if (!image && !video) return null;

  return (
    <div className={styles.soloImageContainer}>
      <Media
        image={image}
        video={video}
        videoPoster={videoPoster}
        alt={alt}
        className={styles.mediaAuto}
        // Full pane content width: pane caps at 1400px (lib/layout.ts
        // getReadingPane) minus .section's 40px side padding = 1320px;
        // below that, pane = viewportW - 32px minus the same 80px padding.
        sizes="(max-width: 767px) 100vw, (max-width: 1463px) calc(100vw - 112px), 1320px"
      />
    </div>
  );
}
