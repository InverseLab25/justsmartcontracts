import { Button, Divider, Form, Input } from "antd";
import { TAbiEvent } from "@entities/contract";
import { EventFilterInput } from "./EventFilterInput";
import { TEventBlockFilter, TEventQuery } from "../model/types";
import { useEventFilters } from "../model/useEventFilters";
import { DefaultBlockRange } from "../model/useFetchEvents";

import styles from "./EventArgsForm.module.scss";

type TProps = {
  event: TAbiEvent;
  loading?: boolean;
  onSubmit: (_values: TEventQuery) => void;
};

export const EventArgsForm = ({ event, loading, onSubmit }: TProps) => {
  const { filters, add, remove, update, enable } = useEventFilters(event);

  const hasFilters = Object.keys(filters).length > 0;

  const submit = ({ fromBlock, toBlock }: TEventBlockFilter) => {
    const topics = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value.active)
    );

    onSubmit({
      ...(fromBlock && { fromBlock: Number(fromBlock) }),
      ...(toBlock && { toBlock: Number(toBlock) }),
      topics,
    });
  };

  return (
    <Form
      preserve={false}
      layout="vertical"
      onFinish={submit}
      className={styles.root}
    >
      <div>
        <div className={styles.blocks}>
          <Form.Item
            name="fromBlock"
            label="From block"
            className={`${styles.field} ${styles.block}`}
          >
            <Input type="number" placeholder="latest block minus range" />
          </Form.Item>
          <Form.Item
            name="toBlock"
            label="To block"
            className={`${styles.field} ${styles.block}`}
          >
            <Input type="number" placeholder="latest" />
          </Form.Item>
        </div>
        <div className={styles.hint}>
          Leave empty to search the last {String(DefaultBlockRange)} blocks.
          Public RPCs reject much wider ranges.
        </div>
      </div>

      {hasFilters && (
        <>
          <Divider orientation="left" className={styles.divider}>
            Filter by
          </Divider>

          <div className={styles.filters}>
            {Object.entries(filters).map(([name, filter]) => (
              <EventFilterInput
                key={name}
                name={name}
                filter={filter}
                add={() => add(name)}
                remove={() => remove(name)}
                update={(index, value) => update(name, index, value)}
                enable={(value) => enable(name, value)}
              />
            ))}
          </div>
        </>
      )}

      <Form.Item className={styles.field}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Fetch
        </Button>
      </Form.Item>
    </Form>
  );
};
