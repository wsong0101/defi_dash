import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

type Network = "mainnet" | "testnet" | "devnet" | string;

let cachedClient: SuiClient | null = null;

export const getSuiClient = (network?: Network): SuiClient => {
  if (cachedClient) return cachedClient;
  const url =
    process.env.SUI_FULLNODE_URL ||
    (network ? getFullnodeUrl(network as any) : getFullnodeUrl("mainnet"));
  cachedClient = new SuiClient({ url });
  return cachedClient;
};
