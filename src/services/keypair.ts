import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export const getKeypairFromEnv = (): Ed25519Keypair => {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey || secretKey === "YOUR_SECRET_KEY_HERE") {
    throw new Error("SECRET_KEY missing in environment");
  }
  try {
    return Ed25519Keypair.fromSecretKey(secretKey as any);
  } catch (err) {
    throw new Error(`Failed to parse SECRET_KEY: ${String(err)}`);
  }
};
