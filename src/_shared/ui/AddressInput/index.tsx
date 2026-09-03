import { Input } from "antd";
import { TValueInput, TWithClassname } from "@shared/lib/props";
import { TAddress } from "@shared/lib/web3";
import { AddressIcon } from "../AddressIcon";

type TProps = TWithClassname &
  TValueInput<TAddress> & {
    disabled?: boolean;
  };

export const AddressInput = ({
  value,
  onChange,
  className,
  disabled = false,
}: TProps) => {
  return (
    <Input
      maxLength={42}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value as TAddress)}
      // Was addonBefore, which antd 5.29 deprecates. prefix puts the icon
      // inside the field instead of in a separate grey box, which also gives
      // the address text the full width to itself.
      prefix={<AddressIcon address={value} size="small" />}
      autoComplete="off"
      disabled={disabled}
    />
  );
};
