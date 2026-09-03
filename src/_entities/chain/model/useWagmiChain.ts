import { useMemo } from "react";
import { defineChain } from "viem";
import { TChain } from "./types";

// The chain list ships rpc entries we can't call from the browser: websocket
// urls, and ones with an unfilled "${INFURA_API_KEY}" style placeholder.
const isPublicHttpRpc = (url: string) =>
  url.startsWith("http") && !url.includes("${");

export const useWagmiChain = (chainConfig: TChain) => {
  // Keep all of them, not just the first. Public endpoints go down often, and
  // Web3Provider feeds the whole list to a fallback transport.
  const rpcUrls = useMemo(() => {
    const usable = chainConfig.rpc.filter(isPublicHttpRpc);
    return usable.length ? usable : chainConfig.rpc.slice(0, 1);
  }, [chainConfig]);

  return useMemo(() => {
    return defineChain({
      id: chainConfig.chainId,
      name: chainConfig.name,
      rpcUrls: {
        default: { http: rpcUrls },
      },
      blockExplorers: {
        default: {
          name: chainConfig.explorers[0].name,
          url: chainConfig.explorers[0].url,
        },
      },
      nativeCurrency: chainConfig.nativeCurrency,
    });
  }, [chainConfig, rpcUrls]);
};
