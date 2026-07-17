import Image from "next/image";
import AutoplayVideo from "./AutoplayVideo";

// PROJECT_PAGE_LAYOUT.md §8 — video always wins over image when both are
// populated for a slot. next/image dimensions are hardcoded (aspect
// enforced by container CSS, not real asset metadata), matching the
// reference's own approach: 1920x1080 landscape everywhere except the
// Logos & Branding portrait grid (1080x1920), which renders its own <Image>
// directly (PortraitImageGrid.tsx) rather than through this component.
interface MediaProps {
  image?: string | null;
  video?: string | null;
  videoPoster?: string | null;
  alt: string;
  className?: string;
}

export default function Media({ image, video, videoPoster, alt, className }: MediaProps) {
  if (video) {
    return <AutoplayVideo src={video} poster={videoPoster} className={className} />;
  }
  if (!image) return null;
  return (
    <Image className={className} src={image} width={1920} height={1080} alt={alt} />
  );
}
