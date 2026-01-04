import { useState } from 'react';
import styles from './ProtocolLogo.module.css';

interface ProtocolLogoProps {
  name: string;
  logo: string;
  siteUrl?: string;
}

export function ProtocolLogo({ name, logo, siteUrl }: ProtocolLogoProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = logo && !imgError;

  const content = (
    <div className={styles.wrapper}>
      {showImage ? (
        <img
          className={styles.logo}
          src={logo}
          alt={`${name} logo`}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`${styles.logo} ${styles.placeholder}`}>{name.charAt(0)}</div>
      )}
      <span className={styles.name}>{name}</span>
    </div>
  );

  if (siteUrl) {
    return (
      <a className={styles.link} href={siteUrl} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
