import { useCallback, useState } from "react";
import { usePublicClient } from "wagmi";
import { TAbiEvent, TContract } from "@entities/contract";
import { TEventQuery } from "./types";
import { useNotifications } from "@shared/lib/notify";

// Public rpcs generally refuse getLogs over more than a few thousand blocks, so
// an empty From block searches a recent window rather than all of history.
export const DefaultBlockRange = 10000n;

export type TSearchedRange = {
  from: bigint;
  to: bigint;
};

export const useFetchEvents = (contract: TContract, event: TAbiEvent) => {
  const notify = useNotifications();

  const client = usePublicClient();

  const [events, setEvents] = useState<any[]>([]);
  const [range, setRange] = useState<TSearchedRange | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(
    async ({ fromBlock, toBlock, topics }: TEventQuery) => {
      if (!client) {
        notify("No RPC client for this chain", "error");
        return;
      }

      setLoading(true);

      try {
        const latest = await client.getBlockNumber();

        const to = toBlock ? BigInt(toBlock) : latest;
        const from = fromBlock
          ? BigInt(fromBlock)
          : to > DefaultBlockRange
            ? to - DefaultBlockRange
            : 0n;

        setRange({ from, to });

        const hasTopics = Object.values(topics).length > 0;

        const config = {
          address: contract.address,
          event: event,
          fromBlock: from,
          toBlock: to,
          ...(hasTopics && {
            args: Object.fromEntries(
              Object.entries(topics).map(([key, value]) => [
                key,
                value.values[0],
              ])
            ),
          }),
        };

        // @ts-ignore: no way I am going to make it properly typescript-compatible
        const result = await client.getLogs(config);
        setEvents(result);
      } catch (e: any) {
        notify(e.details || e.shortMessage || e.toString(), "error", 8);
      } finally {
        setLoading(false);
      }
    },
    [client, contract.address, event, notify]
  );

  return {
    events,
    range,
    loading,
    fetch,
  };
};
