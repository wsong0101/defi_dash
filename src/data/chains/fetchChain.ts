import type { ChainId } from '../../domain/types';
import { apiClient } from '../httpClient';
import type { ChainArbitrageResponse } from '../types';
import { mockItems } from '../mockData';

export async function fetchChainArbitrage(
  chainId: ChainId,
  path: string
): Promise<ChainArbitrageResponse> {
  try {
    const response = await apiClient.get<ChainArbitrageResponse>(path);
    if (!response.data || !Array.isArray(response.data.items)) {
      throw new Error('Invalid response format');
    }
    return {
      chain: chainId,
      updatedAt: response.data.updatedAt,
      items: response.data.items,
    };
  } catch (error) {
    console.warn(`Failed to fetch ${chainId} data, using mock data.`);
    const items = mockItems.filter((item) => item.chain === chainId);
    return {
      chain: chainId,
      updatedAt: new Date().toISOString(),
      items,
    };
  }
}
