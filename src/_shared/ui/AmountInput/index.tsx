import { Input, Select, Space } from "antd";
import { useEffect, useRef, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { TValueInput } from "@shared/lib/props";

export enum Mode {
  WEI = 0,
  GWEI = 9,
  ETH = 18,
}

type TProps = TValueInput<string> & {
  disabled?: boolean;
  defaultMode?: Mode;
};

const options = [
  {
    value: Mode.WEI,
    label: "wei",
  },
  {
    value: Mode.GWEI,
    label: "gwei",
  },
  {
    value: Mode.ETH,
    label: "eth",
  },
];

const getValidationRegexp = (mode: number) => {
  if (mode === Mode.WEI) {
    //only integer numbers fow 'wei'
    return /^\d+$/;
  }

  if (mode === Mode.GWEI) {
    //limit to 9 decimals for 'gwei'
    return /^(\d+\.?\d{0,9}|\.\d{1,9})$/;
  }

  //limit to 18 decimals for 'ether'
  return /^(\d+\.?\d{0,18}|\.\d{1,18})$/;
};

const convertToWei = (mode: Mode, value: string) => {
  return String(parseUnits(value as `${number}`, mode));
};

const convertFromWei = (mode: Mode, value: string) => {
  return String(formatUnits(BigInt(value || "0"), mode));
};

export const AmountInput = ({
  value,
  disabled,
  onChange,
  defaultMode = Mode.WEI,
}: TProps) => {
  const [formatted, setFormatted] = useState(
    convertFromWei(defaultMode, value)
  );

  const [mode, setMode] = useState(defaultMode);

  // What we last sent up. Anything else arriving in `value` came from outside -
  // the gas estimate writing into the form, say - and has to be shown.
  const emitted = useRef(value);

  // Without this the displayed text is seeded once on mount and never updated,
  // so "Max fee per gas" and "Max priority fee per gas" sat at 0 while the form
  // actually held the estimated values.
  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value;
      setFormatted(convertFromWei(mode, value));
    }
  }, [value, mode]);

  const handleModeChange = (newMode: Mode) => {
    //convert stored value from old mode to new mode
    const weis = convertToWei(mode, formatted);
    const value = convertFromWei(newMode, weis);
    setMode(newMode);
    setFormatted(value);
  };

  const handleValueChange = (e: string) => {
    const reg = getValidationRegexp(mode);

    if ((!Number.isNaN(e) && reg.test(e)) || e === "") {
      setFormatted(e);

      const weis = convertToWei(mode, e || "0");
      emitted.current = weis;
      onChange(weis);
    }
  };

  // Was Input addonAfter, which antd 5.29 deprecates in favour of Space.Compact.
  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        disabled={disabled}
        value={formatted}
        onChange={(e) => handleValueChange(e.target.value)}
      />
      <Select
        options={options}
        defaultValue={defaultMode}
        style={{ width: 88, flex: "none" }}
        onChange={handleModeChange}
        disabled={disabled}
      />
    </Space.Compact>
  );
};
