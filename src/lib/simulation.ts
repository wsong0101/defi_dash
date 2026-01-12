import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export const simulateOrThrow = async (
  client: SuiClient,
  tx: Transaction,
  sender: string
) => {
  const res = await client.devInspectTransactionBlock({
    transactionBlock: tx,
    sender,
  });

  if (res.effects.status.status === "failure") {
    const error = res.effects.status.error || "Unknown simulation failure";
    throw new Error(error);
  }

  return res;
};
