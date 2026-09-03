import { Input } from "antd";
import { AddressInput } from "@shared/ui/AddressInput";
import { TAddress } from "@shared/lib/web3";
import { BoolInput } from "@shared/ui/BoolInput";
import { AmountInput } from "@shared/ui/AmountInput";

import { TAbiParam } from "../model/types";

type TProps = {
  value?: unknown;
  onChange?: (_value: unknown) => void;
  abiParam: TAbiParam["type"];
};

const noop = () => undefined;

export const ParamInput = ({ value, onChange = noop, abiParam }: TProps) => {
  if (abiParam == "address") {
    return <AddressInput value={value as TAddress} onChange={onChange} />;
  }

  // Kept as a real boolean rather than "1"/"0": viem rejects the string form
  // with "Invalid boolean value".
  if (abiParam == "bool") {
    return <BoolInput value={value === true} onChange={onChange} />;
  }

  if (abiParam == "uint256") {
    return <AmountInput value={String(value ?? "")} onChange={onChange} />;
  }

  return (
    <Input
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
