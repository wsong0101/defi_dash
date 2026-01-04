import type { Protocol } from '../domain/types';

export const protocols: Protocol[] = [
  {
    id: 'navi',
    name: 'Navi Protocol',
    logo: '',
    siteUrl: 'https://naviprotocol.io',
    categories: ['lending'],
    chains: ['sui'],
  },
  {
    id: 'suilend',
    name: 'Suilend',
    logo: '',
    siteUrl: 'https://suilend.fi',
    categories: ['lending'],
    chains: ['sui'],
  },
];

export const protocolsById = Object.fromEntries(
  protocols.map((protocol) => [protocol.id, protocol])
);
