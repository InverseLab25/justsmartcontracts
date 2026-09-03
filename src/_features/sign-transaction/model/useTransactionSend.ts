import { useCallback, useState } from "react";
import { useSendTransaction } from "wagmi";
import { TTransactionParams, stringToNative } from "@shared/lib/tx";
import { TChainId, THexString } from "@shared/lib/web3";
import { walletModel } from "@entities/wallet";

import { useWatchTxNotification } from "./useTxNotification";

const convertTx = (tx: TTransactionParams) => ({
  to: tx.to,
  data: tx.data,
  nonce: tx.nonce,
  gas: stringToNative(tx.gas),
  value: stringToNative(tx.value),
});

export const useTransactionSend = (chain: TChainId) => {
  const [txHash, setTxHash] = useState<THexString | undefined>(undefined);

  const switchChain = walletModel.useSwitchWalletChain(chain);
  const { sendTransactionAsync } = useSendTransaction();

  const send = useCallback(
    async (tx: TTransactionParams) => {
      try {
        if (await switchChain()) {
          const hash = await sendTransactionAsync(convertTx(tx));
          setTxHash(hash);
        }
      } catch (e) {
        console.log(e);
      }
    },
    [switchChain, sendTransactionAsync]
  );

  useWatchTxNotification(chain, txHash);

  return {
    hash: txHash,
    send,
  };
};
