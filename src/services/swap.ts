import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { MetaAg, getTokenPrice } from "@7kprotocol/sdk-ts";
import { getReserveByCoinType, normalizeCoinType } from "../lib/const";
import { formatUnits } from "../lib/format";
import { simulateOrThrow } from "../lib/simulation";

export type SwapParams = {
  amountIn: string;
  coinTypeIn: string;
  coinTypeOut: string;
  slippageBps?: number;
};

export type SwapPreview = {
  rawOut: string | number | bigint;
  amountInDisplay: string;
  amountOutDisplay: string;
  usdIn: number;
  usdOut: number;
  symbolIn: string;
  symbolOut: string;
};

export const buildSwapTx = async (
  client: SuiClient,
  sender: string,
  params: SwapParams
): Promise<{ tx: Transaction; preview: SwapPreview }> => {
  const { amountIn, coinTypeIn, coinTypeOut, slippageBps = 100 } = params;

  const normalizedIn = normalizeCoinType(coinTypeIn);
  const normalizedOut = normalizeCoinType(coinTypeOut);
  const reserveIn = getReserveByCoinType(normalizedIn);
  const reserveOut = getReserveByCoinType(normalizedOut);
  const decimalsIn = reserveIn?.decimals ?? 6;
  const decimalsOut = reserveOut?.decimals ?? 8;
  const symbolIn = reserveIn?.symbol ?? "TOKEN_IN";
  const symbolOut = reserveOut?.symbol ?? "TOKEN_OUT";

  const metaAg = new MetaAg({
    partner:
      "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf",
  });

  const quotes = await metaAg.quote(
    { amountIn, coinTypeIn: normalizedIn, coinTypeOut: normalizedOut },
    { sender }
  );

  if (!quotes.length) throw new Error("No quotes found for requested pair");

  const quote = quotes.sort(
    (a, b) =>
      Number(b.simulatedAmountOut || b.amountOut) -
      Number(a.simulatedAmountOut || a.amountOut)
  )[0];

  const rawOut = quote.simulatedAmountOut || quote.amountOut;
  const priceIn = await getTokenPrice(normalizedIn);
  const priceOut = await getTokenPrice(normalizedOut);
  const humanIn = Number(amountIn) / Math.pow(10, decimalsIn);
  const humanOut = Number(rawOut) / Math.pow(10, decimalsOut);

  const tx = new Transaction();
  const coinOut = await metaAg.swap(
    {
      quote,
      signer: sender,
      coinIn: coinWithBalance({ balance: BigInt(amountIn), type: coinTypeIn }),
      tx,
    },
    slippageBps
  );

  tx.transferObjects([coinOut], sender);

  return {
    tx,
    preview: {
      rawOut,
      amountInDisplay: `${formatUnits(amountIn, decimalsIn)} ${symbolIn}`,
      amountOutDisplay: `${formatUnits(rawOut, decimalsOut)} ${symbolOut}`,
      usdIn: humanIn * priceIn,
      usdOut: humanOut * priceOut,
      symbolIn,
      symbolOut,
    },
  };
};

export const dryRunSwap = async (
  client: SuiClient,
  sender: string,
  params: SwapParams
) => {
  const { tx, preview } = await buildSwapTx(client, sender, params);
  await simulateOrThrow(client, tx, sender);
  return { tx, preview };
};

export const executeSwap = async (
  client: SuiClient,
  signer: any,
  sender: string,
  params: SwapParams
) => {
  if (process.env.EXECUTE_REAL_TX !== "true") {
    throw new Error(
      "Execution blocked: set EXECUTE_REAL_TX=true in environment to send real transactions."
    );
  }
  const { tx, preview } = await dryRunSwap(client, sender, params);
  const res = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEffects: true },
  });
  return { res, preview };
};
