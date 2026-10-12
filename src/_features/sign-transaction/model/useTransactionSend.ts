import { useCallback, useState } from "react";
import { useConnection, useSendTransaction, useSwitchChain } from "wagmi";
import { TTransactionParams, stringToNative } from "@shared/lib/tx";
import { TChainId, THexString } from "@shared/lib/web3";
import { useNotifications } from "@shared/lib/notify";

import { useWatchTxNotification } from "./useTxNotification";

const convertTx = (tx: TTransactionParams) => ({
  to: tx.to,
  data: tx.data,
  nonce: Number(tx.nonce),
  gas: stringToNative(tx.gas),
  value: stringToNative(tx.value),
});

const errorText = (e: unknown) => {
  const error = e as { shortMessage?: string; message?: string };
  return error.shortMessage || error.message || "Transaction failed";
};

export const useTransactionSend = (chain: TChainId) => {
  const [txHash, setTxHash] = useState<THexString | undefined>(undefined);

  const chainId = Number(chain);
  const { chainId: walletChainId } = useConnection();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const notify = useNotifications();

  const send = useCallback(
    async (tx: TTransactionParams) => {
      try {
        // The wallet can sit on a different chain than the app. Going through
        // the connector here (rather than a wallet client bound to the app
        // chain) also adds the chain to the wallet when it doesn't know it.
        if (walletChainId !== chainId) {
          await switchChainAsync({ chainId });
        }
        const hash = await sendTransactionAsync({ ...convertTx(tx), chainId });
        setTxHash(hash);
      } catch (e) {
        notify(errorText(e), "error");
      }
    },
    [walletChainId, chainId, switchChainAsync, sendTransactionAsync, notify]
  );

  useWatchTxNotification(chain, txHash);

  return {
    hash: txHash,
    send,
  };
};
