import { fetchArbitrageByCategory } from '../data';
import type { ArbitrageCategoryId } from '../domain/types';
import type { CategoryPayload } from '../data/types';

export async function fetchCategory(categoryId: ArbitrageCategoryId): Promise<CategoryPayload> {
  return fetchArbitrageByCategory(categoryId);
}
