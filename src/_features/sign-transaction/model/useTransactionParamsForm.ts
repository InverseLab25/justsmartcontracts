import { useCallback, useEffect, useState } from "react";
import { Form } from "antd";
import { walletModel } from "@entities/wallet";
import { TAddress, isEvmAddress } from "@shared/lib/web3";
import { TNativeValue, TTransactionParams } from "@shared/lib/tx";
import { TAbiFunction, TContract } from "@entities/contract";
import { useInitialTransactionParams } from "./useInitialTransactionParams";
import { useEstimateTx, TTxEstimate } from "./useEstimateTx";

export const useTransactionParamsForm = (
  contract: TContract,
  abiItem: TAbiFunction,
  args: unknown[]
) => {
  const { address } = walletModel.useCurrentWallet();

  const [form] = Form.useForm<TTransactionParams>();

  const initialValues = useInitialTransactionParams(contract, abiItem, args);

  const estimateTx = useEstimateTx();

  const [gasError, setGasError] = useState<TTxEstimate | null>(null);

  const applyEstimate = useCallback(
    (estimate: TTxEstimate) => {
      const { gas, nonce, maxFee, maxPriorityFee } = estimate;

      form.setFieldsValue({ nonce, maxFee, maxPriorityFee });

      setGasError(estimate.gasError ? estimate : null);

      // A failed estimate reports zero gas; keep whatever the user typed rather
      // than wiping it.
      if (gas !== "0") {
        form.setFieldValue("gas", gas);
      }
    },
    [form]
  );

  // One estimate for the whole transaction instead of separate gas, fee and
  // nonce lookups that could disagree with each other.
  const updateEstimate = useCallback(
    (from: TAddress, value?: TNativeValue) => {
      estimateTx({
        from,
        to: initialValues.to,
        data: initialValues.data,
        value: BigInt(value || 0),
        abi: contract.abi,
      })
        .then(applyEstimate)
        .catch(() => undefined);
    },
    [applyEstimate, contract.abi, estimateTx, initialValues.data, initialValues.to]
  );

  const onValuesChange = useCallback(
    (changed: Partial<TTransactionParams>) => {
      if (changed.from && isEvmAddress(changed.from)) {
        updateEstimate(changed.from);
      }

      if (changed.value) {
        const from = form.getFieldValue("from");
        if (from && isEvmAddress(from)) {
          updateEstimate(from, changed.value);
        }
      }
    },
    [form, updateEstimate]
  );

  useEffect(() => {
    if (address) {
      form.setFieldValue("from", address);
      updateEstimate(address);
    }
  }, [address, form, updateEstimate]);

  return {
    form,
    onValuesChange,
    initialValues,
    gasError,
    payable: abiItem.stateMutability == "payable",
  };
};
