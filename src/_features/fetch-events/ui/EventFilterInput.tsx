import { Button, Switch } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { ParamInput } from "@entities/contract";
import { TEventFilter } from "../model/types";

import styles from "./EventFilterInput.module.scss";

type TProps = {
  name: string;
  filter: TEventFilter;
  enable: (_value: boolean) => void;
  add: () => void;
  remove: () => void;
  update: (_index: number, _value: string) => void;
};

export const EventFilterInput = ({
  name,
  filter,
  enable,
  add,
  remove,
  update,
}: TProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <b className={styles.name}>{`${name} (${filter.type})`}</b>
        <Switch checked={filter.active} onChange={enable} />
        <Button
          size="small"
          aria-label={`Add ${name} value`}
          icon={<PlusOutlined />}
          onClick={add}
          disabled={!filter.active}
        />
        <Button
          size="small"
          aria-label={`Remove ${name} value`}
          icon={<MinusOutlined />}
          disabled={filter.values.length <= 1 || !filter.active}
          onClick={remove}
        />
      </div>

      {filter.active && filter.values.length > 0 && (
        <div className={styles.values}>
          {filter.values.map((item, index) => (
            <ParamInput
              key={index}
              abiParam={filter.type}
              onChange={(value) => update(index, String(value))}
              value={item}
            />
          ))}
        </div>
      )}
    </div>
  );
};
