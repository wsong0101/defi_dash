import type { ChainId } from '../domain/types';

export type ApyRequest = {
  chain: ChainId;
  protocolId: string;
  asset: string;
};

export type ApySnapshot = {
  supplyApy: number;
  borrowApy?: number;
  updatedAt: string;
};

export async function fetchApySnapshot(request: ApyRequest): Promise<ApySnapshot> {
  void request;
  throw new Error('APY fetch not implemented.');
}
