import { isAddress } from "viem";

export type THexString = `0x${string}`;

export type TAddress = THexString;

export const isEvmAddress = (a: string): a is TAddress => {
  return isAddress(a);
};

export const shortenAddress = (address: TAddress, chars = 4) =>
  `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
