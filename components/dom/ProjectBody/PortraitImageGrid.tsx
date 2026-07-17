import Image from "next/image";
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
        />
      ))}
      {vids.map((src, i) => (
        <video
          key={`vid-${i}`}
          className={styles.portraitImage}
          poster={posters[i]}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
          <source src={src} type="video/webm" />
        </video>
      ))}
    </div>
  );
}
