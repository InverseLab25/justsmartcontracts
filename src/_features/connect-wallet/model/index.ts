import { useCallback, useMemo } from "react";
import { useAccount, useConnect, useConnectors, type Connector } from "wagmi";

export const useWalletConnectors = (): Connector[] => {
  const connectors = useConnectors();
  const { connector: active } = useAccount();

  return useMemo(() => {
    const seen = new Set<string>();

    return connectors.filter((connector) => {
      // Already connected through this one, so offering it again just throws
      // ConnectorAlreadyConnectedError.
      if (active && connector.id === active.id) {
        return false;
      }

      // The Coinbase extension announces itself over EIP-6963 as well as being
      // configured explicitly, so the same wallet can arrive twice.
      const key = connector.name.trim().toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [connectors, active]);
};

export const useConnectWallet = () => {
  const { connect, isPending, error, reset } = useConnect();
  const { isConnected } = useAccount();

  const connectWith = useCallback(
    (connector: Connector, onDone: () => void) => {
      if (isConnected) {
        onDone();
        return;
      }

      connect({ connector }, { onSuccess: onDone });
    },
    [connect, isConnected]
  );

  return { connectWith, isPending, error, reset };
};
