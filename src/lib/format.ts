export const formatUnits = (
  amount: string | number | bigint,
  decimals: number
): string => {
  const s = amount.toString();
  if (decimals === 0) return s;
  const pad = s.padStart(decimals + 1, "0");
  const split = pad.length - decimals;
  const human = `${pad.slice(0, split)}.${pad.slice(split)}`;
  return human.replace(/\.?0+$/, "") || "0";
};

export const formatUsd = (value: number | bigint): string => {
  const n = typeof value === "bigint" ? Number(value) : value;
  if (!isFinite(n)) return "$0";
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
