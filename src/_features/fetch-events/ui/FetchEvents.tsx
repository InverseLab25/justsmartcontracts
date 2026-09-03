import { TAbiEvent, TContract } from "@entities/contract";
import { EventArgsForm } from "./EventArgsForm";
import { TEventQuery } from "../model/types";
import { useFetchEvents } from "../model/useFetchEvents";
import { EventsTable } from "./EventsTable";

import styles from "./FetchEvents.module.scss";

type TProps = {
  contract: TContract;
  event: TAbiEvent;
};

export const FetchEvents = ({ contract, event }: TProps) => {
  const { loading, fetch, events, range } = useFetchEvents(contract, event);

  const submit = (values: TEventQuery) => {
    fetch(values);
  };

  return (
    <div className={styles.root}>
      <EventArgsForm onSubmit={submit} event={event} loading={loading} />

      {/* Without this an empty table looks like "no events" when the real
          answer is "not in the blocks we looked at". */}
      {range && !loading && (
        <div className={styles.range}>
          Searched blocks {String(range.from)} to {String(range.to)}
        </div>
      )}

      <EventsTable
        chain={contract.chain}
        event={event}
        items={events}
        loading={loading}
      />
    </div>
  );
};
