import type { ArbitrageCategoryId } from '../domain/types';
import { fetchAllChainArbitrage } from './chains';
import { normalizeChainResponse } from './normalize';
import type { CategoryPayload } from './types';
import { mockItems } from './mockData';

const toIsoString = (value?: string) => {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
};

const resolveLastUpdated = (values: Array<string | undefined>) => {
  const timestamps = values
    .map((value) => (value ? Date.parse(value) : NaN))
    .filter((value) => !Number.isNaN(value));
  if (timestamps.length === 0) return new Date().toISOString();
  return new Date(Math.max(...timestamps)).toISOString();
};

export async function fetchArbitrageByCategory(
  categoryId: ArbitrageCategoryId
): Promise<CategoryPayload> {
  const { responses, failures } = await fetchAllChainArbitrage();

  // Filter chain data
  const realItems = responses
    .flatMap((response) => normalizeChainResponse(response))
    .filter((item) => item.category === categoryId);

  // Filter mock data
  const localItems = mockItems.filter((item) => item.category === categoryId);

  const items = [...realItems, ...localItems];

  if (items.length === 0 && responses.length === 0) {
    const missing = failures.length > 0 ? failures.join(', ') : 'unknown';
    throw new Error(`Failed to load data (${missing})`);
  }

  const lastUpdated = resolveLastUpdated(
    responses.map((response) => toIsoString(response.updatedAt))
  );

  return {
    items,
    lastUpdated,
    partial: failures.length > 0,
    missingChains: failures.length > 0 ? failures : undefined,
  };
}
