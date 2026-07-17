import styles from "./ProjectBodyShared.module.css";

interface SoloTextContainerProps {
  heading?: string;
  text?: string;
  bulletList?: string[];
}

// Heading + body + optional bullet list, no paired media.
export default function SoloTextContainer({ heading, text, bulletList }: SoloTextContainerProps) {
  if (!heading && !text && !bulletList?.length) return null;

  return (
    <div className={styles.soloTextContainer}>
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
  );
}
