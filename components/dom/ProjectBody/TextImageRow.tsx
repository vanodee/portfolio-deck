import Media from "./Media";
import styles from "./ProjectBodyShared.module.css";

interface TextImageRowProps {
  heading?: string;
  text?: string;
  bulletList?: string[];
  image?: string | null;
  video?: string | null;
  videoPoster?: string | null;
  alt: string;
  reverse?: boolean;
}

// PROJECT_PAGE_LAYOUT.md §7 — the core alternating layout primitive. reverse
// is desktop-only (both variants collapse to column-reverse ≤768px).
export default function TextImageRow({
  heading,
  text,
  bulletList,
  image,
  video,
  videoPoster,
  alt,
  reverse,
}: TextImageRowProps) {
  const hasMedia = Boolean(image || video);
  if (!heading && !text && !bulletList?.length && !hasMedia) return null;

  return (
    <div className={`${styles.textImageRow} ${reverse ? styles.reverse : ""}`}>
      <div className={styles.textContainer}>
        {heading && <h3>{heading}</h3>}
        {text && <p>{text}</p>}
        {bulletList && bulletList.length > 0 && (
          <ul className={styles.bulletList}>
            {bulletList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      {hasMedia && (
        <div className={styles.rowImageContainer}>
          <Media image={image} video={video} videoPoster={videoPoster} alt={alt} className={styles.mediaFill} />
        </div>
      )}
    </div>
  );
}
