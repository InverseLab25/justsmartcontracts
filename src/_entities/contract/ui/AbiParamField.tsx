import { Button, Form, Input } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { TAbiParam } from "../model/types";
import {
  getArrayItemType,
  getArrayLength,
  getComponents,
  isArrayType,
  isCommaSeparated,
  isComplexParam,
  isTupleType,
  shouldUseColumns,
  validateCommaSeparated,
  validateScalar,
} from "../lib/abiValue";
import { ParamInput } from "./ParamInput";

import styles from "./AbiParamField.module.scss";
import grid from "./ParamGrid.module.scss";

type TName = (string | number)[];

type TProps = {
  param: TAbiParam;
  name: TName;
  label?: string;
  // True when the enclosing form is laid out in columns. A struct nested in a
  // long function should follow the form it sits in, not re-decide from its
  // own field count.
  columns?: boolean;
};

const paramLabel = (param: TAbiParam, fallback: string) =>
  `${param.name || fallback} (${param.type})`;

// antd wants a rejected promise for a failed field.
const toRule = (check: (_value: unknown) => string | null) => ({
  validator: (_: unknown, value: unknown) => {
    const error = check(value);
    return error ? Promise.reject(new Error(error)) : Promise.resolve();
  },
});

// Recurses on the abi rather than rendering one text box per argument, so a
// struct becomes a labelled group of fields and an array becomes a list you can
// add rows to. Names are positional indexes all the way down, which is what
// makes anonymous tuple components work.
export const AbiParamField = ({ param, name, label, columns }: TProps) => {
  if (isArrayType(param.type)) {
    const itemType = getArrayItemType(param.type);

    // One line of comma separated values beats a row per item for something
    // like uint256[] or address[], which is most of what people pass.
    if (isCommaSeparated(param)) {
      return (
        <Form.Item
          className={`${styles.field} ${styles.scalar}`}
          label={label}
          name={name}
          extra={`Comma separated ${itemType} values`}
          rules={[toRule((value) => validateCommaSeparated(param, value))]}
        >
          <Input placeholder={itemType === "address" ? "0xabc…, 0xdef…" : "1, 2, 3"} />
        </Form.Item>
      );
    }

    const fixedLength = getArrayLength(param.type);
    const item = { ...param, type: itemType, name: "" } as TAbiParam;

    // A fixed-size array has exactly as many slots as the type says, so there
    // is nothing to add or remove.
    if (fixedLength !== null) {
      return (
        <div className={styles.group}>
          <div className={styles.groupLabel}>{label}</div>
          {Array.from({ length: fixedLength }, (_, index) => (
            <AbiParamField
              key={index}
              param={item}
              name={[...name, index]}
              label={`[${index}] (${itemType})`}
              columns={columns}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={styles.group}>
        <div className={styles.groupLabel}>{label}</div>
        <Form.List name={name}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div key={field.key} className={styles.row}>
                  <div className={styles.rowField}>
                    <AbiParamField
                      param={item}
                      name={[field.name]}
                      label={`[${index}] (${itemType})`}
                      columns={columns}
                    />
                  </div>
                  <Button
                    type="text"
                    aria-label={`Remove item ${index}`}
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                Add item
              </Button>
            </>
          )}
        </Form.List>
      </div>
    );
  }

  if (isTupleType(param.type)) {
    const components = getComponents(param);
    const useColumns = columns || shouldUseColumns(components.length);

    return (
      <div className={styles.group}>
        <div className={styles.groupLabel}>{label}</div>
        <div className={useColumns ? grid.grid : grid.single}>
          {components.map((component, index) => (
            <div
              key={index}
              className={
                useColumns && isComplexParam(component)
                  ? grid.wide
                  : undefined
              }
            >
              <AbiParamField
                param={component}
                name={[...name, index]}
                label={paramLabel(component, String(index))}
                columns={useColumns}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Form.Item
      className={`${styles.field} ${styles.scalar}`}
      label={label}
      name={name}
      rules={[toRule((value) => validateScalar(param.type, value))]}
    >
      {/* @ts-ignore value and onChange props are supplied by Form.Item */}
      <ParamInput abiParam={param.type} />
    </Form.Item>
  );
};
