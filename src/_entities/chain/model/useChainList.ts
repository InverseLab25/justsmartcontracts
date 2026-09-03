import { useQuery } from "@tanstack/react-query";
import { TChain } from "./types";

const Endpoint = "https://chainid.network/chains.json";

const rawToTChain = (item: any): TChain => {
  return {
    chain: item.chain,
    chainId: item.chainId,
    explorers: item.explorers,
    name: item.name,
    rpc: item.rpc,
    nativeCurrency: item.nativeCurrency,
  };
};

// Only reached when the network fetch fails. Imported dynamically so the ~280KB
// chain dump lands in its own chunk instead of the main bundle.
const loadDefaultChains = async (): Promise<TChain[]> => {
  const { default: raw } = await import("./defaultChains.json");
  return (raw as any[]).map(rawToTChain);
};

const fetcher = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint);
    const data = (await response.json()) as any[];

    return data
      .filter(
        (item) =>
          item.rpc &&
          item.rpc.length > 0 &&
          item.explorers &&
          item.explorers.length > 0
      )
      .map(rawToTChain);
  } catch (e) {
    console.log(e);
    return loadDefaultChains();
  }
};

type TChainListContext =
  | {
      loading: true;
      chains: null;
    }
  | {
      loading: false;
      chains: TChain[];
    };

export const useChainList = (): TChainListContext => {
  // Was swr. react-query is already here for wagmi, so this drops a dependency
  // rather than adding one. The list never changes mid-session, hence no
  // staleness or refetching.
  const response = useQuery({
    queryKey: ["chains", Endpoint],
    queryFn: () => fetcher(Endpoint),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  // The fetcher resolves to the bundled defaults rather than throwing, so no
  // data means it is genuinely still in flight.
  if (response.isLoading || !response.data) {
    return {
      loading: true,
      chains: null,
    };
  }

  return { loading: false, chains: response.data };
};

export const useChainListSafe = () => {
  const response = useChainList();

  if (!response.chains) {
    throw new Error("Unexpected missing chains");
  }

  return response.chains;
};
