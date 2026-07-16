import styles from "./DigitCard.module.css";

const CORNER_MARK_SRC = "/assets/icons/card-corner-mark.png";

// 404 page card (NotFoundContent.tsx) — same shell as PhotoCard.tsx, one big
// digit instead of a photo+name.
export default function DigitCard({ digit }: { digit: string }) {
  return (
    <div className={styles.card}>
      <img className={styles.cornerMarkTL} src={CORNER_MARK_SRC} alt="" />
      <img className={styles.cornerMarkBR} src={CORNER_MARK_SRC} alt="" />
      <div className={styles.content}>
        <span className={styles.digit}>{digit}</span>
      </div>
    </div>
  );
}
