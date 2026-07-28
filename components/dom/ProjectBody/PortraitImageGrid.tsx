import Image from "next/image";
import AutoplayVideo from "./AutoplayVideo";
import styles from "./ProjectBodyShared.module.css";

interface PortraitImageGridProps {
  images?: string[] | null;
  videos?: string[] | null;
  videoPosters?: string[] | null;
  alt: string;
}

// Logos & Branding Core Sections only — 3-col portrait grid. Images and
// videos render as two independently-gated passes, not interleaved
// (PROJECT_PAGE_LAYOUT.md §7/§9). Guards against GROQ returning null (not
// just undefined) for an unset array field.
export default function PortraitImageGrid({
  images,
  videos,
  videoPosters,
  alt,
}: PortraitImageGridProps) {
  const imgs = images ?? [];
  const vids = videos ?? [];
  const posters = videoPosters ?? [];
  if (imgs.length === 0 && vids.length === 0) return null;

  return (
    <div className={styles.portraitImageContainer}>
      {imgs.map((src, i) => (
        <Image
          key={`img-${i}`}
          className={styles.portraitImage}
          src={src}
          width={1080}
          height={1920}
          alt={alt}
          // 3-column grid across the pane's content width: pane caps at
          // 1400px (lib/layout.ts getReadingPane) minus .section's 80px
          // total side padding minus 2 16px gaps, /3 = 429px; below 768px,
          // pane = viewportW - 16px minus .section's 48px padding minus 2
          // 12px gaps (ProjectBodyShared.module.css's 768px block), /3.
          sizes="(max-width: 767px) calc((100vw - 88px) / 3), (max-width: 1463px) calc((100vw - 144px) / 3), 429px"
        />
      ))}
      {vids.map((src, i) => (
        <AutoplayVideo
          key={`vid-${i}`}
          className={styles.portraitImage}
          src={src}
          poster={posters[i]}
        />
      ))}
    </div>
  );
}
