import { useMemo } from "react";
import { WagmiProvider, createConfig, fallback, http } from "wagmi";
// Deep paths on purpose: the @wagmi/connectors barrel drags in every connector
// (and a tempo module that doesn't resolve against viem 2.56).
import { coinbaseWallet } from "@wagmi/connectors/coinbaseWallet";
import { walletConnect } from "@wagmi/connectors/walletConnect";
import { WalletConnectProjectId } from "@shared/lib/env";
import { TWithChildren } from "@shared/lib//props";
import { useChainConfig } from "../model";
import { useWagmiChain } from "../model/useWagmiChain";
import { TChainId } from "@shared/lib/web3";

type TProps = TWithChildren & {
  chain: TChainId;
};

// No generic injected() on purpose. It is the same provider that EIP-6963
// discovery already reports under the wallet's real name, so listing both gave
// a duplicate entry that threw "Connector already connected". Discovery also
// means a wallet only appears when it is actually installed.
const connectors = [
  coinbaseWallet({ appName: "JustSmartContracts" }),
  ...(WalletConnectProjectId
    ? [walletConnect({ projectId: WalletConnectProjectId })]
    : []),
];

export const Web3Provider = ({ chain, children }: TProps) => {
  const chainConfig = useChainConfig(chain);

  const wagmiChain = useWagmiChain(chainConfig);

  const wagmiConfig = useMemo(() => {
    // Public rpcs only, no api key. They are unreliable one at a time, so hand
    // the whole list to a fallback transport and let viem move on when one
    // fails rather than surfacing the error.
    const urls = wagmiChain.rpcUrls.default.http;

    return createConfig({
      chains: [wagmiChain],
      connectors,
      transports: {
        [wagmiChain.id]: urls.length
          ? fallback(urls.map((url) => http(url, { batch: true })))
          : http(undefined, { batch: true }),
      },
      ssr: false,
      multiInjectedProviderDiscovery: true,
    });
  }, [wagmiChain]);

  return (
    <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
  );
};
