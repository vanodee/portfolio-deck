import Image from "next/image";
import { liveLinkIconSrc } from "@/lib/liveLinkIcon";
import type { LiveLink } from "@/data/types";
import styles from "./ProjectBodyShared.module.css";

interface LiveLinkRowProps {
  links?: LiveLink[];
}

export default function LiveLinkRow({ links }: LiveLinkRowProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className={styles.liveLinkContainer}>
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.liveLink}
        >
          <Image
            className={styles.liveLinkIcon}
            src={liveLinkIconSrc(link.ctaIcon)}
            width={50}
            height={50}
            alt="Live Link Icon"
          />
          <div className={styles.liveLinkText}>
            <p>{link.text}</p>
            {link.subText && <p>{link.subText}</p>}
          </div>
        </a>
      ))}
    </div>
  );
}
