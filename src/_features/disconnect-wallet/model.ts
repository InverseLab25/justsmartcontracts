import { useCallback } from "react";
import { useDisconnect } from "wagmi";
import { TAddress } from "@shared/lib/web3";
import { useCopyToClipboard } from "@shared/lib/clipboard";

export const useDisconnectWallet = () => {
  const { disconnect, isPending } = useDisconnect();

  return {
    disconnect: useCallback(() => disconnect(), [disconnect]),
    isPending,
  };
};

export const useCopyAddress = (address: TAddress) => {
  const copy = useCopyToClipboard();

  return useCallback(() => copy(address, "Address copied"), [address, copy]);
};
