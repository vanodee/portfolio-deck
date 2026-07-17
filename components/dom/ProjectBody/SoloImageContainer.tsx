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
      <Media image={image} video={video} videoPoster={videoPoster} alt={alt} className={styles.mediaAuto} />
    </div>
  );
}
