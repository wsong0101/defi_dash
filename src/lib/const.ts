// Canonical coin/type metadata used by test and service layers.
// Only contains tokens referenced in existing scripts; extend as needed.
export const COIN_TYPES = {
  SUI: "0x2::sui::SUI",
  USDC:
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  LBTC:
    "0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040::lbtc::LBTC",
  WUSDC:
    "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  WUSDT:
    "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  WETH:
    "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
  WBTC:
    "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN",
  CETUS:
    "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
  AFSUI:
    "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
  HASUI:
    "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
  CERT:
    "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
  SCA:
    "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
} as const;

export type CoinSymbol = keyof typeof COIN_TYPES;

export type ReserveMeta = {
  coinType: string;
  symbol: string;
  decimals: number;
};

// Fallback decimals chosen from common Sui deployments; adjust if protocol differs.
export const RESERVES: ReserveMeta[] = [
  { coinType: COIN_TYPES.SUI, symbol: "SUI", decimals: 9 },
  { coinType: COIN_TYPES.USDC, symbol: "USDC", decimals: 6 },
  { coinType: COIN_TYPES.LBTC, symbol: "LBTC", decimals: 8 },
  { coinType: COIN_TYPES.WUSDC, symbol: "wUSDC", decimals: 6 },
  { coinType: COIN_TYPES.WUSDT, symbol: "wUSDT", decimals: 6 },
  { coinType: COIN_TYPES.WETH, symbol: "wETH", decimals: 18 },
  { coinType: COIN_TYPES.WBTC, symbol: "wBTC", decimals: 8 },
  { coinType: COIN_TYPES.CETUS, symbol: "CETUS", decimals: 9 },
  { coinType: COIN_TYPES.AFSUI, symbol: "AFSUI", decimals: 9 },
  { coinType: COIN_TYPES.HASUI, symbol: "HASUI", decimals: 9 },
  { coinType: COIN_TYPES.CERT, symbol: "CERT", decimals: 9 },
  { coinType: COIN_TYPES.SCA, symbol: "SCA", decimals: 9 },
];

export const normalizeCoinType = (coinType: string): string => {
  const parts = coinType.split("::");
  if (parts.length !== 3) return coinType;
  const pkg = parts[0].replace(/^0x/, "").padStart(64, "0");
  return `0x${pkg}::${parts[1]}::${parts[2]}`;
};

export const getReserveByCoinType = (coinType?: string): ReserveMeta | null => {
  if (!coinType) return null;
  const normalized = normalizeCoinType(coinType);
  return RESERVES.find(
    (r) => normalizeCoinType(r.coinType) === normalized
  ) || null;
};
