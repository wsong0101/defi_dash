import type { ChainId } from '../../domain/types';
import { fetchArbitrumArbitrage } from './arbitrum';
import { fetchEthereumArbitrage } from './ethereum';
import { fetchOptimismArbitrage } from './optimism';
import { fetchOtherArbitrage } from './other';
import { fetchPolygonArbitrage } from './polygon';
import type { ChainArbitrageResponse } from '../types';

type ChainFetcher = {
  chainId: ChainId;
  fetcher: () => Promise<ChainArbitrageResponse>;
};

const chainFetchers: ChainFetcher[] = [
  { chainId: 'ethereum', fetcher: fetchEthereumArbitrage },
  { chainId: 'arbitrum', fetcher: fetchArbitrumArbitrage },
  { chainId: 'optimism', fetcher: fetchOptimismArbitrage },
  { chainId: 'polygon', fetcher: fetchPolygonArbitrage },
  { chainId: 'other', fetcher: fetchOtherArbitrage },
];

export async function fetchAllChainArbitrage() {
  const results = await Promise.allSettled(chainFetchers.map((entry) => entry.fetcher()));
  const responses: ChainArbitrageResponse[] = [];
  const failures: ChainId[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      responses.push(result.value);
    } else {
      failures.push(chainFetchers[index].chainId);
    }
  });

  return { responses, failures };
}
