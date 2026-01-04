import type { ChainArbitrageResponse, ChainArbitrageRecord } from './types';
import type {
  ArbitrageItem,
  ChainId,
  LSTArbitrageItem,
  LiquidityArbitrageItem,
  LendingArbitrageItem,
} from '../domain/types';

const toUpdatedAt = (record: ChainArbitrageRecord, fallback?: string) =>
  record.updatedAt ?? fallback ?? new Date().toISOString();

const toTvl = (record: ChainArbitrageRecord) => record.tvl ?? 0;

const normalizeRecord = (
  record: ChainArbitrageRecord,
  chain: ChainId,
  fallbackUpdatedAt?: string
): ArbitrageItem | null => {
  const updatedAt = toUpdatedAt(record, fallbackUpdatedAt);
  const tvl = toTvl(record);

  switch (record.category) {
    case 'lst': {
      const item: LSTArbitrageItem = {
        id: record.id,
        category: 'lst',
        protocolId: record.protocolId,
        chain,
        tvl,
        premium: record.premium ?? 0,
        updatedAt,
        token: record.token ?? 'UNKNOWN',
        marketPrice: record.marketPrice ?? 0,
        redemptionPrice: record.redemptionPrice ?? 0,
        withdrawalDuration: record.withdrawalDuration ?? 'N/A',
        arbApy: record.arbApy ?? 0,
      };
      return item;
    }
    case 'liquidity': {
      const item: LiquidityArbitrageItem = {
        id: record.id,
        category: 'liquidity',
        protocolId: record.protocolId,
        chain,
        tvl,
        premium: record.premium ?? 0,
        updatedAt,
      };
      return item;
    }
    case 'lending': {
      const item: LendingArbitrageItem = {
        id: record.id,
        category: 'lending',
        protocolId: record.protocolId,
        chain,
        tvl,
        supplyApy: record.supplyApy ?? 0,
        borrowApy: record.borrowApy ?? 0,
        collateralRatio: record.collateralRatio ?? 0,
        updatedAt,
        token: record.token ?? 'UNKNOWN',
      };
      return item;
    }
    default:
      return null;
  }
};

export const normalizeChainResponse = (response: ChainArbitrageResponse): ArbitrageItem[] => {
  const items = response.items ?? [];
  return items
    .map((record) => normalizeRecord(record, response.chain, response.updatedAt))
    .filter((item): item is ArbitrageItem => item !== null);
};
