import { useMemo } from "react";
import { encodeFunctionData } from "viem";
import { TTransactionParams } from "@shared/lib/tx";
import { THexString } from "@shared/lib/web3";
import { TAbiFunction, TContract } from "@entities/contract";

export const useInitialTransactionParams = (
  contract: TContract,
  abiItem: TAbiFunction,
  args: unknown[]
) => {
  // Fees and gas are left at zero here on purpose. They depend on the sender,
  // so useEstimateTx fills them in once a from address is known.
  return useMemo(() => {
    // This runs during render, so a throw here takes the whole page down via
    // the error boundary. The form validates and dry-run encodes before we get
    // called, so this catch should never fire - it just refuses to be the thing
    // that crashes the app if it does.
    let data: THexString = "0x";

    try {
      data = encodeFunctionData({
        abi: contract.abi,
        args,
        functionName: abiItem.name,
      });
    } catch (e) {
      console.error("Failed to encode call data", e);
    }

    const values: Partial<TTransactionParams> = {
      data,
      to: contract.address,
      maxFee: "0",
      maxPriorityFee: "0",
    };

    return values;
  }, [abiItem.name, args, contract.abi, contract.address]);
};
