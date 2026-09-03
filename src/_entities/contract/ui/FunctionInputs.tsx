import { Alert, Button, Form } from "antd";
import { encodeAbiParameters } from "viem";
import { useCallback, useMemo, useState } from "react";
import {
  getDefaultParamValue,
  isComplexParam,
  shouldUseColumns,
  toAbiArgs,
} from "../lib/abiValue";
import { TAbiConstructor, TAbiFunction } from "../model/types";
import { AbiParamField } from "./AbiParamField";

import grid from "./ParamGrid.module.scss";

type TProps = {
  abiItem: TAbiFunction | TAbiConstructor;
  onSubmit: (_values: unknown[]) => void;
  buttonText: string;
};

export const FunctionInputs = ({ abiItem, onSubmit, buttonText }: TProps) => {
  const [error, setError] = useState<string | null>(null);

  // Seeded on the Form rather than per field: AbiParamField owns the nested
  // Form.Item names, so there is no single item to hang a default on.
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        abiItem.inputs.map((input, index) => [index, getDefaultParamValue(input)])
      ),
    [abiItem.inputs]
  );

  const columns = shouldUseColumns(abiItem.inputs.length);

  const submit = useCallback(
    (values: Record<string, unknown>) => {
      const raw = abiItem.inputs.map((_, index) => values[index]);

      // Converting here means every consumer gets args already shaped for viem,
      // nesting included.
      try {
        const args = toAbiArgs(abiItem.inputs, raw);

        // Encode once as a dry run. The per-field rules catch bad values, but
        // this proves the whole arg list encodes before anything downstream
        // tries it during render, where a throw would blank the page.
        encodeAbiParameters(abiItem.inputs, args);

        onSubmit(args);
        setError(null);
      } catch (e: any) {
        setError(e?.shortMessage || (e instanceof Error ? e.message : String(e)));
      }
    },
    [abiItem.inputs, onSubmit]
  );

  return (
    <Form layout="vertical" initialValues={initialValues} onFinish={submit}>
      <div className={columns ? grid.grid : grid.single}>
        {abiItem.inputs.map((input, index) => (
          <div
            key={index}
            className={columns && isComplexParam(input) ? grid.wide : undefined}
          >
            <AbiParamField
              param={input}
              name={[index]}
              label={`${input.name || index} (${input.type})`}
              columns={columns}
            />
          </div>
        ))}
      </div>

      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 12 }} />
      )}

      <Form.Item>
        <Button htmlType="submit">{buttonText}</Button>
      </Form.Item>
    </Form>
  );
};
