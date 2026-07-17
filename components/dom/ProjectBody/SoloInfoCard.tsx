import styles from "./ProjectBodyShared.module.css";

interface SoloInfoCardProps {
  title?: string;
  description?: string;
  list?: string[];
}

// A standalone single card outside any grid (§7's .infoCard + .soloInfoCard
// combined — left-aligned instead of centered).
export default function SoloInfoCard({ title, description, list }: SoloInfoCardProps) {
  if (!title && !description && !list?.length) return null;

  return (
    <div className={`${styles.infoCard} ${styles.soloInfoCard}`}>
      {title && <h4>{title}</h4>}
      {description && <p>{description}</p>}
      {list && list.length > 0 && (
        <ul>
          {list.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
