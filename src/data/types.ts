import type { ArbitrageCategoryId, ArbitrageItem, ChainId } from '../domain/types';

export interface ChainArbitrageRecord {
  id: string;
  category: ArbitrageCategoryId;
  protocolId: string;
  tvl?: number;
  premium?: number;
  supplyApy?: number;
  borrowApy?: number;
  collateralRatio?: number;
  updatedAt?: string;
  token?: string;
  marketPrice?: number;
  redemptionPrice?: number;
  withdrawalDuration?: string;
  arbApy?: number;
}

export interface ChainArbitrageResponse {
  chain: ChainId;
  updatedAt?: string;
  items: ChainArbitrageRecord[];
}

export interface CategoryPayload {
  items: ArbitrageItem[];
  lastUpdated?: string;
  partial?: boolean;
  missingChains?: ChainId[];
}
