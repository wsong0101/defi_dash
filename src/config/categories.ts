import type { ArbitrageCategory } from '../domain/types';

export const categories: ArbitrageCategory[] = [
  {
    id: 'lending',
    label: 'Lending',
    description: 'Supply/borrow APY spreads and utilization-driven opportunities.',
    defaultSort: 'apy',
    supportedChains: ['sui', 'ethereum'],
  },
  {
    id: 'lst',
    label: 'LST',
    description: 'Staking derivatives premium/discount opportunities across chains.',
    defaultSort: 'premium',
    supportedChains: ['sui', 'ethereum'],
    comingSoon: true,
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    description: 'DEX/LP price and fee inefficiencies between pools.',
    defaultSort: 'premium',
    supportedChains: ['sui', 'ethereum'],
    comingSoon: true,
  },
];

export const categoriesById = Object.fromEntries(
  categories.map((category) => [category.id, category])
);
