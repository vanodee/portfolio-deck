import SoloImageContainer from "./SoloImageContainer";

interface MediaGalleryProps {
  images?: string[] | null;
  videos?: string[] | null;
  videoPosters?: string[] | null;
  alt: string;
}

// Section-level gallery fields — 3 parallel arrays (images/videos/
// videoPosters), paired positionally by index, each rendered as its own
// SoloImageContainer (PROJECT_PAGE_LAYOUT.md §8). Guards against GROQ
// returning null (not just undefined/omitted) for an unset array field —
// destructure defaults alone only catch undefined.
export default function MediaGallery({ images, videos, videoPosters, alt }: MediaGalleryProps) {
  const imgs = images ?? [];
  const vids = videos ?? [];
  const posters = videoPosters ?? [];
  const count = Math.max(imgs.length, vids.length);
  if (count === 0) return null;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SoloImageContainer
          key={i}
          image={imgs[i]}
          video={vids[i]}
          videoPoster={posters[i]}
          alt={alt}
        />
      ))}
    </>
  );
}
