import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { decodeErrorResult, slice } from "viem";
import { lookupSelector } from "@shared/lib/selectors";
import type { Abi, Address, Hex, PublicClient } from "viem";

export type TTxEstimate = {
  gas: string;
  nonce: number;
  maxFee: string;
  maxPriorityFee: string;
  // Set when gas estimation reverted, which means signing this would waste a
  // transaction. Worth saying out loud rather than leaving the gas field at 0.
  gasError?: string;
  // The raw revert payload, shown alongside the decoded name so there's
  // something to paste into a block explorer when the decode is wrong.
  gasErrorData?: string;
};

type TRequest = {
  from: Address;
  to?: Address;
  data?: Hex;
  value?: bigint;
  // Lets a custom error selector be turned into its name.
  abi?: Abi;
};

// A revert arrives as four bytes of selector plus any arguments. Try the
// contract's own abi first, since that gives argument values too. Fall back to
// the public 4 byte directories, which cover errors thrown from a library or
// some other contract the call touched.
// The revert data is not on the error viem throws. It sits a few links down
// the cause chain, on the RpcRequestError, so walk the whole thing rather than
// guessing a depth.
const findRevertData = (error: any): Hex | undefined => {
  const seen = new Set<unknown>();
  let current = error;

  while (current && !seen.has(current)) {
    seen.add(current);

    const data = current.data;

    if (typeof data === "string" && data.startsWith("0x") && data.length >= 10) {
      return data as Hex;
    }

    // Some transports nest it one further, as { data: { data: "0x..." } }.
    if (
      data &&
      typeof data === "object" &&
      typeof data.data === "string" &&
      data.data.startsWith("0x")
    ) {
      return data.data as Hex;
    }

    current = current.cause;
  }

  return undefined;
};

type TRevert = { reason: string; data?: Hex };

const revertReason = async (error: any, abi?: Abi): Promise<TRevert> => {
  const hex = findRevertData(error);

  if (hex) {
    if (abi) {
      try {
        const decoded = decodeErrorResult({ abi, data: hex });
        const args = decoded.args?.length
          ? `(${decoded.args.map(String).join(", ")})`
          : "()";

        // require/revert("...") comes back as the builtin Error(string), where
        // the message is the interesting part, not the wrapper.
        return {
          reason:
            decoded.errorName === "Error"
              ? `Reverted: ${decoded.args?.[0]}`
              : `Reverted with ${decoded.errorName}${args}`,
          data: hex,
        };
      } catch {
        // Not an error this abi knows about; fall through to the directory.
      }
    }

    const name = await lookupSelector(slice(hex, 0, 4));

    return {
      reason: name ? `Reverted with ${name}` : "Reverted with an unknown error",
      data: hex,
    };
  }

  // details carries the node's own words ("execution reverted"), which beats
  // shortMessage's "Execution reverted for an unknown reason."
  return {
    reason:
      error?.details ||
      error?.shortMessage ||
      error?.message ||
      "Gas estimation failed",
  };
};

// A block is a couple of seconds on an L2 and fees barely move within one, so
// this stops a refetch on every keystroke while staying honest.
const FeesStaleTime = 12_000;
const GasStaleTime = 5_000;

// Same headroom viem uses by default: 1.2x the next block's base fee.
const BaseFeeMultiplier = 120n;

type TFees = {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
};

// estimateFeesPerGas would be the obvious call, but it reads the base fee via
// getBlock, whose response carries every transaction hash in the block - about
// 10KB to learn one number. eth_feeHistory returns the base fee on its own, and
// eth_maxPriorityFeePerGas the tip, so two small calls replace one large one.
const readFees = async (client: PublicClient): Promise<TFees> => {
  const [history, priority] = await Promise.all([
    // rewardPercentiles gives us a priority fee too, for chains that don't
    // implement eth_maxPriorityFeePerGas.
    client.getFeeHistory({
      blockCount: 1,
      rewardPercentiles: [50],
      blockTag: "latest",
    }),
    client.estimateMaxPriorityFeePerGas().catch(() => null),
  ]);

  // The array is blockCount + 1 long: the last entry is the next block's base
  // fee, which is what we're actually paying.
  const baseFee = history.baseFeePerGas.at(-1) ?? 0n;
  const maxPriorityFeePerGas = priority ?? history.reward?.[0]?.[0] ?? 0n;

  return {
    maxFeePerGas: (baseFee * BaseFeeMultiplier) / 100n + maxPriorityFeePerGas,
    maxPriorityFeePerGas,
  };
};

// Deliberately explicit calls rather than prepareTransactionRequest, which
// probes eth_fillTransaction first - public rpcs answer that with "rpc method
// is unsupported".
//
// Everything goes through react-query's fetchQuery rather than straight to the
// client, which dedupes identical in-flight requests. React strict mode invokes
// the effect twice in dev and was sending every call down the wire twice.
export const useEstimateTx = () => {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  return useCallback(
    async ({ from, to, data, value, abi }: TRequest): Promise<TTxEstimate> => {
      if (!publicClient) {
        throw new Error("No RPC client for this chain");
      }

      const chainId = publicClient.chain?.id;

      let gasError: string | undefined;
      let gasErrorData: string | undefined;

      // Settled independently: a call that would revert shouldn't stop us
      // filling in the nonce and fees.
      const [gas, fees, nonce] = await Promise.all([
        queryClient
          .fetchQuery({
            queryKey: [
              "estimateGas",
              chainId,
              from,
              to,
              data,
              String(value ?? 0n),
            ],
            queryFn: () =>
              publicClient.estimateGas({
                account: from,
                to,
                data,
                value: value ?? 0n,
              }),
            staleTime: GasStaleTime,
          })
          .catch(async (e) => {
            const revert = await revertReason(e, abi);
            gasError = revert.reason;
            gasErrorData = revert.data;
            return null;
          }),
        queryClient
          .fetchQuery({
            queryKey: ["fees", chainId],
            queryFn: () => readFees(publicClient as PublicClient),
            staleTime: FeesStaleTime,
          })
          .catch(() => null),
        queryClient
          .fetchQuery({
            queryKey: ["txCount", chainId, from],
            queryFn: () => publicClient.getTransactionCount({ address: from }),
            staleTime: GasStaleTime,
          })
          .catch(() => 0),
      ]);

      return {
        // Zero means "couldn't work it out", and the form leaves whatever the
        // user typed alone.
        gas: gas === null ? "0" : String(gas),
        nonce,
        maxFee: String(fees?.maxFeePerGas ?? 0n),
        maxPriorityFee: String(fees?.maxPriorityFeePerGas ?? 0n),
        gasError,
        gasErrorData,
      };
    },
    [publicClient, queryClient]
  );
};
