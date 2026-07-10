import type { PhotoCardData } from "@/data/types";
import styles from "./PhotoCard.module.css";

const CORNER_MARK_SRC = "/assets/icons/card-corner-mark.png";

// Always face-up — no flip state, unlike the WebGL project cards.
export default function PhotoCard({ photo }: { photo: PhotoCardData }) {
  return (
    <div className={styles.card}>
      <img className={styles.cornerMarkTL} src={CORNER_MARK_SRC} alt="" />
      <img className={styles.cornerMarkBR} src={CORNER_MARK_SRC} alt="" />
      <div className={styles.content}>
        <div className={styles.imageWrap}>
          <img className={styles.image} src={photo.image} alt={photo.name} />
        </div>
        <div className={styles.text}>
          <p className={styles.name}>{photo.name}</p>
          <p className={styles.subtitle}>{photo.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
