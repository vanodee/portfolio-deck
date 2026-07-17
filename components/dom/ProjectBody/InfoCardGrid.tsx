import styles from "./ProjectBodyShared.module.css";

export interface InfoCardItem {
  title?: string;
  description?: string;
  list?: string[];
}

interface InfoCardGridProps {
  items?: InfoCardItem[];
  columns?: 2 | 3;
  /** Numbers cards 1, 2, 3… instead of a title (UX Case Studies' Key
   * Insights / Problem Statement / Design Goals sections). */
  numbered?: boolean;
}

export default function InfoCardGrid({ items, columns = 3, numbered }: InfoCardGridProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`${styles.infoCardContainer} ${columns === 2 ? styles.twoCol : ""}`}>
      {items.map((item, i) => (
        <div key={i} className={styles.infoCard}>
          <h4>{numbered ? i + 1 : item.title}</h4>
          {item.description && <p>{item.description}</p>}
          {item.list && item.list.length > 0 && (
            <ul>
              {item.list.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
