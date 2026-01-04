import { useState, useRef, useEffect } from 'react';
import styles from './ChainSelect.module.css';

export interface ChainOption {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

interface ChainSelectProps {
  options: ChainOption[];
  value: string;
  onChange: (value: string) => void;
}

export function ChainSelect({ options, value, onChange }: ChainSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption && (
          <>
            <img src={selectedOption.icon} alt="" className={styles.icon} />
            <span className={styles.label}>{selectedOption.label}</span>
          </>
        )}
        <span className={styles.arrow} />
      </button>

      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {options.map((option) => (
            <li
              key={option.id}
              role="option"
              aria-selected={option.id === value}
              className={`${styles.option} ${option.id === value ? styles.selected : ''} ${option.disabled ? styles.disabled : ''}`}
            >
              {option.disabled ? (
                <div className={styles.optionContent}>
                  <img src={option.icon} alt="" className={styles.icon} />
                  <span>{option.label}</span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.optionButton}
                  onClick={() => handleSelect(option.id)}
                >
                  <img src={option.icon} alt="" className={styles.icon} />
                  <span>{option.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
