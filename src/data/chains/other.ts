import { fetchChainArbitrage } from './fetchChain';

export const fetchOtherArbitrage = () => fetchChainArbitrage('other', '/arbitrage/other');
