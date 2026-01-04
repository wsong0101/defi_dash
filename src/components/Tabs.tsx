import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <nav className={styles.tabs} aria-label="Categories">
      {tabs
        .filter((t) => !t.disabled)
        .map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeId ? `${styles.tab} ${styles.active}` : styles.tab}
            onClick={() => onChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.badge ? <span className={styles.badge}>{tab.badge}</span> : null}
          </button>
        ))}

      <div style={{ flex: 1 }} />

      {tabs
        .filter((t) => t.disabled)
        .map((tab) => (
          <button key={tab.id} type="button" className={styles.tab} disabled>
            <span>{tab.label}</span>
            {tab.badge ? <span className={styles.badge}>{tab.badge}</span> : null}
          </button>
        ))}
    </nav>
  );
}
