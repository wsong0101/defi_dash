import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesById } from '../config/categories';
import { protocols, protocolsById } from '../config/protocols';
import type {
  ArbitrageCategoryId,
  ArbitrageItem,
  ArbitrageItemBase,
  ChainId,
  LendingArbitrageItem,
  LiquidityArbitrageItem,
  LSTArbitrageItem,
  SortKey,
} from '../domain/types';
import { fetchCategory } from '../services/dataService';
import { formatNumber, formatPercent } from '../utils/format';
import { ProtocolLogo } from '../components/ProtocolLogo';
import { Select } from '../components/Select';
import { SkeletonTable } from '../components/SkeletonTable';
import { Table, type Column } from '../components/Table';
import { Modal } from '../components/Modal';
import { LoopingStrategy } from '../components/LoopingStrategy';
import styles from './CategoryView.module.css';

interface CategoryViewProps {
  categoryId: ArbitrageCategoryId;
}

type SortDirection = 'asc' | 'desc';

const chainLabels: Record<ChainId, string> = {
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  polygon: 'Polygon',
  optimism: 'Optimism',
  other: 'Other',
};

export function CategoryView({ categoryId }: CategoryViewProps) {
  const categoryMeta = categoriesById[categoryId];
  const [sortKey, setSortKey] = useState<SortKey>(categoryMeta?.defaultSort ?? 'tvl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [selectedLendingItem, setSelectedLendingItem] = useState<LendingArbitrageItem | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['arbitrage', categoryId],
    queryFn: () => fetchCategory(categoryId),
    enabled: Boolean(categoryMeta) && !categoryMeta?.comingSoon,
  });

  const filteredRows = useMemo(() => {
    let rows = [...(data?.items ?? [])];
    if (protocolFilter !== 'all') {
      rows = rows.filter((row) => row.protocolId === protocolFilter);
    }
    const direction = sortDirection === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });
    return rows;
  }, [data, protocolFilter, sortDirection, sortKey]);

  const protoOptions = useMemo(() => {
    const eligible = protocols.filter((p) => p.categories.includes(categoryId));
    return [{ label: 'All protocols', value: 'all' }].concat(
      eligible.map((p) => ({ label: p.name, value: p.id }))
    );
  }, [categoryId]);

  const columns = useMemo(
    () =>
      buildColumns(categoryId, (item) => {
        if (isLendingRow(item as ArbitrageItem)) {
          setSelectedLendingItem(item as LendingArbitrageItem);
        }
      }),
    [categoryId]
  );

  const handleRefresh = async () => {
    await refetch();
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const lastUpdated = data?.lastUpdated;
  const showCached = isError && Boolean(data);
  const showError = isError && !data;
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  if (!categoryMeta) {
    return <div className={styles.errorText}>Invalid category: {categoryId}</div>;
  }

  const isComingSoon = categoryMeta.comingSoon;

  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <div>
          <p className={styles.metaLabel}>{categoryMeta.label}</p>
          <p className={styles.metaDescription}>{categoryMeta.description}</p>
        </div>
        <div className={styles.metaInline}>
          {lastUpdated ? (
            <span className={styles.metaValue}>
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          ) : null}
          {data?.partial ? <span className={styles.badge}>Partial</span> : null}
          {showCached ? <span className={styles.badge}>Cached</span> : null}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {isComingSoon && (
          <div className={styles.comingSoonOverlay}>
            <span className={styles.comingSoonBadge}>{categoryMeta.label} • Coming Soon</span>
          </div>
        )}

        <div className={isComingSoon ? styles.blurredSection : undefined}>
          <div className={styles.actions}>
            <Select
              label="Protocol"
              options={protoOptions}
              value={protocolFilter}
              onChange={setProtocolFilter}
            />
            <button
              type="button"
              className={styles.refresh}
              onClick={handleRefresh}
              aria-label="Refresh"
              disabled={isComingSoon}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
              </svg>
            </button>
          </div>

          {isLoading && !data && !isComingSoon ? (
            <SkeletonTable rows={4} columns={columns.length || 4} />
          ) : showError ? (
            <div className={styles.errorCard}>
              <div>
                <p className={styles.errorTitle}>Failed to load</p>
                <p className={styles.errorText}>{errorMessage}</p>
              </div>
              <button type="button" className={styles.refresh} onClick={handleRefresh}>
                Retry
              </button>
            </div>
          ) : (
            <Table
              columns={columns}
              rows={filteredRows}
              emptyLabel={isComingSoon ? 'Loading data...' : 'No rows with current filters'}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </div>
      </div>

      {selectedLendingItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLendingItem(null)}
          title={`Looping Strategy: ${selectedLendingItem.token}`}
        >
          <LoopingStrategy
            token={selectedLendingItem.token}
            supplyApy={selectedLendingItem.supplyApy}
            borrowApy={selectedLendingItem.borrowApy}
            maxLtv={selectedLendingItem.collateralRatio}
            chain={selectedLendingItem.chain}
          />
        </Modal>
      )}
    </div>
  );
}

function getSortValue(row: ArbitrageItem, key: SortKey): number {
  switch (key) {
    case 'premium':
      if ('premium' in row) return row.premium;
      return 0;
    case 'apy':
      if (isLendingRow(row)) return row.supplyApy;
      if ('arbApy' in row) return row.arbApy;
      if ('premium' in row) return row.premium;
      return 0;
    case 'tvl':
      return row.tvl;
    case 'updatedAt':
      return new Date(row.updatedAt).getTime();
    default:
      return 0;
  }
}

function buildColumns(
  categoryId: ArbitrageCategoryId,
  onAction?: (item: ArbitrageItemBase) => void
): Column<ArbitrageItemBase>[] {
  const baseColumns: Column<ArbitrageItemBase>[] = [
    {
      key: 'protocolId',
      label: 'Protocol',
      render: (row) => {
        const proto = protocolsById[row.protocolId];
        return proto ? (
          <ProtocolLogo name={proto.name} logo={proto.logo} siteUrl={proto.siteUrl} />
        ) : (
          row.protocolId
        );
      },
    },
    {
      key: 'chain',
      label: 'Chain',
      render: (row) => chainLabels[row.chain],
    },
    {
      key: 'tvl',
      label: 'TVL',
      align: 'right',
      sortKey: 'tvl',
      render: (row) => `$${formatNumber(row.tvl)}`,
    },
  ];

  if (categoryId === 'lst') {
    const lstColumns: Column<LSTArbitrageItem>[] = [
      {
        key: 'token',
        label: 'LST Asset',
        render: (row) => row.token || 'UNKNOWN',
      },
      {
        key: 'marketPrice',
        label: 'Market',
        align: 'right',
        render: (row) => row.marketPrice?.toFixed(4) ?? '-',
      },
      {
        key: 'redemptionPrice',
        label: 'Redeem',
        align: 'right',
        render: (row) => row.redemptionPrice?.toFixed(4) ?? '-',
      },
      {
        key: 'premium',
        label: 'Spread',
        align: 'right',
        sortKey: 'premium',
        render: (row) => formatPercent(row.premium),
      },
      {
        key: 'withdrawalDuration',
        label: 'Unlock',
        align: 'right',
        render: (row) => row.withdrawalDuration || '-',
      },
      {
        key: 'arbApy',
        label: 'APY',
        align: 'right',
        sortKey: 'apy',
        render: (row) => formatPercent(row.arbApy ?? 0),
      },
      {
        key: 'id',
        label: 'Action',
        align: 'right',
        render: () => (
          <button type="button" className={styles.actionButton}>
            [Trade]
          </button>
        ),
      },
    ];
    return lstColumns as Column<ArbitrageItemBase>[];
  }

  if (categoryId === 'liquidity') {
    const liqColumns: Column<LiquidityArbitrageItem>[] = [
      ...baseColumns,
      {
        key: 'premium',
        label: 'Premium',
        align: 'right',
        sortKey: 'premium',
        render: (row) => formatPercent(row.premium),
      },
    ];
    return liqColumns as Column<ArbitrageItemBase>[];
  }

  if (categoryId === 'lending') {
    const lendingColumns: Column<LendingArbitrageItem>[] = [
      {
        key: 'token',
        label: 'Asset',
        render: (row) => row.token,
      },
      baseColumns[0],
      baseColumns[2],
      {
        key: 'supplyApy',
        label: 'Supply APY',
        align: 'right',
        sortKey: 'apy',
        render: (row) => formatPercent(row.supplyApy),
      },
      {
        key: 'borrowApy',
        label: 'Borrow APY',
        align: 'right',
        render: (row) => formatPercent(row.borrowApy),
      },
      {
        key: 'collateralRatio',
        label: 'Max LTV',
        align: 'right',
        render: (row) => `${(row.collateralRatio * 100).toFixed(0)}%`,
      },
      {
        key: 'id',
        label: 'Action',
        align: 'right',
        render: (row) => (
          <button type="button" className={styles.actionButton} onClick={() => onAction?.(row)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        ),
      },
    ];
    return lendingColumns as Column<ArbitrageItemBase>[];
  }
  return [];
}

function isLendingRow(row: ArbitrageItem): row is LendingArbitrageItem {
  return (row as LendingArbitrageItem).supplyApy !== undefined;
}
