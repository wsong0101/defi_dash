import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
} from "@suilend/sdk";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { getReserveByCoinType, normalizeCoinType } from "../lib/const";
import { formatUnits } from "../lib/format";
import { simulateOrThrow } from "../lib/simulation";

export type DepositParams = {
  coinType: string;
  amount: string;
};

export const buildDepositTx = async (
  client: SuiClient,
  sender: string,
  params: DepositParams
) => {
  const suilend = await SuilendClient.initialize(
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    client
  );

  const normalizedCoin = normalizeCoinType(params.coinType);
  const reserve = getReserveByCoinType(normalizedCoin);
  const decimals = reserve?.decimals ?? 6;
  const symbol = reserve?.symbol ?? "TOKEN";

  const tx = new Transaction();
  tx.setSender(sender);

  const caps = await SuilendClient.getObligationOwnerCaps(
    sender,
    [LENDING_MARKET_TYPE],
    client
  );

  let obligationCap = caps[0];

  if (!obligationCap) {
    const newCap = suilend.createObligation(tx);
    tx.transferObjects([newCap], sender);
  }

  // Re-fetch after potential creation to ensure id exists
  const obligationOwnerCaps = await SuilendClient.getObligationOwnerCaps(
    sender,
    [LENDING_MARKET_TYPE],
    client
  );
  obligationCap = obligationOwnerCaps[0] || obligationCap;

  if (!obligationCap) {
    throw new Error("Failed to obtain obligation owner cap");
  }

  suilend.deposit(
    tx,
    normalizedCoin,
    BigInt(params.amount),
    obligationCap.obligationId
  );

  return {
    tx,
    meta: {
      amountDisplay: `${formatUnits(params.amount, decimals)} ${symbol}`,
      symbol,
    },
  };
};

export const dryRunDeposit = async (
  client: SuiClient,
  sender: string,
  params: DepositParams
) => {
  const { tx, meta } = await buildDepositTx(client, sender, params);
  await simulateOrThrow(client, tx, sender);
  return { tx, meta };
};

export const executeDeposit = async (
  client: SuiClient,
  signer: any,
  sender: string,
  params: DepositParams
) => {
  if (process.env.EXECUTE_REAL_TX !== "true") {
    throw new Error(
      "Execution blocked: set EXECUTE_REAL_TX=true in environment to send real transactions."
    );
  }
  const { tx, meta } = await dryRunDeposit(client, sender, params);
  const res = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEffects: true },
  });
  return { res, meta };
};
