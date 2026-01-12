import type { ChainId } from '../domain/types';

export type LendingProtocolId = 'navi' | 'suilend';

export const NAVI_PROTOCOL_ID: LendingProtocolId = 'navi';
export const SUILEND_PROTOCOL_ID: LendingProtocolId = 'suilend';

// Canonical reference to a single lending market on a chain.
export type LendingMarketRef = {
  protocolId: LendingProtocolId;
  chain: ChainId;
  assetSymbol: string;
  marketId?: string;
};

export type LendingRateSnapshot = {
  supplyApy: number;
  borrowApy: number;
  rewardApr?: number;
  updatedAt: string;
  dataSource?: string;
};

// Inputs needed to solve for the collateral price that drives health factor to 1.0.
export type LiquidationPriceRequest = {
  collateralAmount: number;
  collateralPriceUsd: number;
  debtAmount: number;
  debtPriceUsd: number;
  liquidationThreshold: number;
  feeBps?: number;
};

export type LiquidationPriceResult = {
  liquidationPriceUsd: number;
  breakEvenHealthFactor: number;
  notes?: string;
};

// Inputs to derive health factor and net APY for an open position.
export type HealthComputationRequest = {
  collateralValueUsd: number;
  debtValueUsd: number;
  liquidationThreshold: number;
  supplyApy: number;
  borrowApy: number;
  rewardApr?: number;
};

export type HealthComputationResult = {
  healthFactor: number;
  currentLtv: number;
  netApy: number;
};

// Parameters for building a looping quote (levered supply/borrow cycle).
export type LoopingQuoteRequest = {
  depositAmountUsd: number;
  priceUsd: number;
  maxLtv: number;
  liquidationThreshold: number;
  targetLeverage?: number;
  maxIterations?: number;
  rates: LendingRateSnapshot;
};

export type LoopingLeg = {
  action: 'supply' | 'borrow' | 'swap' | 'repay' | 'withdraw';
  asset: string;
  amountUsd?: number;
  note?: string;
};

export type LoopingQuoteResult = {
  leverage: number;
  totalCollateralUsd: number;
  totalDebtUsd: number;
  healthFactor: number;
  netApy: number;
  liquidationPriceUsd?: number;
  legs: LoopingLeg[];
};

// Parameters for unwinding an existing looped position.
export type LoopingExitRequest = {
  positionId?: string;
  unwindPercent?: number;
  slippageBps?: number;
  receiver?: string;
};

export type LoopingExitPlan = {
  repayAmountUsd: number;
  withdrawAmountUsd: number;
  finalHealthFactor?: number;
  legs: LoopingLeg[];
};

// Shared adapter surface for Navi and Suilend so callers can be protocol-agnostic.
export interface LendingProtocolAdapter {
  readonly protocolId: LendingProtocolId;
  readonly chain: ChainId;
  /**
   * Fetch the current lend/borrow rates for a market (including reward APR if available).
   */
  fetchRates(request: LendingMarketRef): Promise<LendingRateSnapshot>;
  /**
   * Solve for the collateral price that would cause liquidation based on the supplied position.
   * Expected approach: find price P where (collateralAmount * P * liquidationThreshold) / (debtAmount * debtPriceUsd)
   * reduces health factor to 1.0, accounting for protocol-specific liquidation buffers and fees.
   */
  estimateLiquidationPrice(request: LiquidationPriceRequest): Promise<LiquidationPriceResult>;
  /**
   * Compute health factor, current LTV, and blended net APY for an active position.
   * Suggested formulae:
   * - healthFactor = (collateralValueUsd * liquidationThreshold) / debtValueUsd
   * - currentLtv = debtValueUsd / collateralValueUsd
   * - netApy = (supplyApy * collateralValueUsd + (rewardApr ?? 0) * collateralValueUsd - borrowApy * debtValueUsd) / (collateralValueUsd - debtValueUsd)
   */
  computeHealth(request: HealthComputationRequest): Promise<HealthComputationResult>;
  /**
   * Produce a looping plan (target leverage, expected HF/APY, and the sequence of legs).
   * Implementations should iterate supply/borrow cycles until reaching targetLeverage or maxLtv,
   * then derive resulting HF/net APY/liquidation price along with the ordered legs required.
   */
  quoteLooping(request: LoopingQuoteRequest): Promise<LoopingQuoteResult>;
  /**
   * Plan how to unwind a looped position, returning the legs required to repay and withdraw.
   * Use unwindPercent to support partial exits while keeping HF above 1.0 for any remaining position.
   */
  planLoopingExit(request: LoopingExitRequest): Promise<LoopingExitPlan>;
}

export class NaviLendingAdapter implements LendingProtocolAdapter {
  readonly protocolId: LendingProtocolId = NAVI_PROTOCOL_ID;
  readonly chain: ChainId = 'sui';

  async fetchRates(_request: LendingMarketRef): Promise<LendingRateSnapshot> {
    throw new Error('Navi rate lookup not implemented yet.');
  }

  async estimateLiquidationPrice(
    _request: LiquidationPriceRequest
  ): Promise<LiquidationPriceResult> {
    throw new Error('Navi liquidation price estimation not implemented yet.');
  }

  async computeHealth(_request: HealthComputationRequest): Promise<HealthComputationResult> {
    throw new Error('Navi health factor computation not implemented yet.');
  }

  async quoteLooping(_request: LoopingQuoteRequest): Promise<LoopingQuoteResult> {
    throw new Error('Navi looping quote not implemented yet.');
  }

  async planLoopingExit(_request: LoopingExitRequest): Promise<LoopingExitPlan> {
    throw new Error('Navi looping exit planning not implemented yet.');
  }
}

export class SuilendAdapter implements LendingProtocolAdapter {
  readonly protocolId: LendingProtocolId = SUILEND_PROTOCOL_ID;
  readonly chain: ChainId = 'sui';

  async fetchRates(_request: LendingMarketRef): Promise<LendingRateSnapshot> {
    throw new Error('Suilend rate lookup not implemented yet.');
  }

  async estimateLiquidationPrice(
    _request: LiquidationPriceRequest
  ): Promise<LiquidationPriceResult> {
    throw new Error('Suilend liquidation price estimation not implemented yet.');
  }

  async computeHealth(_request: HealthComputationRequest): Promise<HealthComputationResult> {
    throw new Error('Suilend health factor computation not implemented yet.');
  }

  async quoteLooping(_request: LoopingQuoteRequest): Promise<LoopingQuoteResult> {
    throw new Error('Suilend looping quote not implemented yet.');
  }

  async planLoopingExit(_request: LoopingExitRequest): Promise<LoopingExitPlan> {
    throw new Error('Suilend looping exit planning not implemented yet.');
  }
}
