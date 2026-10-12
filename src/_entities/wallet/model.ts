import { TAddress } from "@shared/lib/web3";
import { useConnection } from "wagmi";

type TWalletModel = {
  address: TAddress | null;
};

export const useCurrentWallet = (): TWalletModel => {
  const { address } = useConnection();
  return { address: address || null };
};
