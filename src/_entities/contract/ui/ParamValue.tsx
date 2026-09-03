import { BooleanValue } from "@shared/ui/BooleanValue";
import { AddressValue } from "@shared/ui/AddressValue";
import { TAddress } from "@shared/lib/web3";
import type { TAbiParam } from "../model/types";
import {
  getArrayItemType,
  getComponents,
  isArrayType,
  isTupleType,
} from "../lib/abiValue";

import styles from "./ParamValue.module.scss";

type TProps = {
  abiParam: TAbiParam;
  value: unknown;
};

// Recurses the same way the inputs do, so a struct return reads as its named
// fields instead of "[object Object]".
export const ParamValue = ({ abiParam, value }: TProps) => {
  const { type } = abiParam;

  if (isArrayType(type)) {
    const items = Array.isArray(value) ? value : [];
    const item = { ...abiParam, type: getArrayItemType(type) } as TAbiParam;

    if (!items.length) {
      return <span className={styles.empty}>[]</span>;
    }

    return (
      <div className={styles.list}>
        {items.map((entry, index) => (
          <div key={index} className={styles.item}>
            <span className={styles.index}>{index}</span>
            <ParamValue abiParam={item} value={entry} />
          </div>
        ))}
      </div>
    );
  }

  if (isTupleType(type)) {
    const components = getComponents(abiParam);
    // viem decodes named tuples to objects and anonymous ones to arrays.
    const read = (name: string, index: number) =>
      Array.isArray(value)
        ? value[index]
        : (value as Record<string, unknown>)?.[name];

    return (
      <div className={styles.tuple}>
        {components.map((component, index) => (
          <div key={index} className={styles.field}>
            <span className={styles.fieldName}>
              {component.name || index}
            </span>
            <ParamValue
              abiParam={component}
              value={read(component.name || "", index)}
            />
          </div>
        ))}
      </div>
    );
  }

  if (type === "bool") {
    return <BooleanValue value={String(value)} />;
  }

  if (type === "address") {
    return <AddressValue value={value as TAddress} />;
  }

  return <>{String(value)}</>;
};
