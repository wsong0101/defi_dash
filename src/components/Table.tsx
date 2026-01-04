import { ReactNode } from 'react';
import styles from './Table.module.css';
import { SortKey } from '../domain/types';

export interface Column<Row> {
  key: keyof Row;
  label: string;
  align?: 'left' | 'right';
  sortKey?: SortKey;
  render?: (row: Row) => ReactNode;
}

interface TableProps<Row extends { id: string }> {
  columns: Column<Row>[];
  rows: Row[];
  emptyLabel?: string;
  sortKey?: SortKey;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: SortKey) => void;
}

export function Table<Row extends { id: string }>({
  columns,
  rows,
  emptyLabel,
  sortKey,
  sortDirection,
  onSort,
}: TableProps<Row>) {
  if (!rows.length) {
    return <div className={styles.empty}>{emptyLabel || 'No data'}</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSorted = sortKey && column.sortKey === sortKey;
              const isSortable = !!column.sortKey && !!onSort;

              return (
                <th
                  key={String(column.key)}
                  className={[
                    column.align === 'right' ? styles.alignRight : '',
                    isSortable ? styles.thSortable : '',
                  ].join(' ')}
                  onClick={() => isSortable && onSort && onSort(column.sortKey!)}
                >
                  {column.label}
                  {isSorted ? (
                    <span className={styles.sortIcon}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  ) : null}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={column.align === 'right' ? styles.alignRight : undefined}
                >
                  {column.render ? column.render(row) : (row[column.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
