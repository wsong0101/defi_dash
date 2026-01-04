import styles from './SkeletonTable.module.css';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 4, columns = 4 }: SkeletonTableProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        {Array.from({ length: columns }).map((_, idx) => (
          <span key={idx} className={styles.cell} />
        ))}
      </div>
      <div className={styles.body}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className={styles.row}>
            {Array.from({ length: columns }).map((__, colIdx) => (
              <span key={colIdx} className={styles.cell} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
