import { ReactNode } from "react";
import { TAddress, shortenAddress } from "@shared/lib/web3";
import { AddressIcon } from "@shared/ui/AddressIcon";

import styles from "./WalletCard.module.scss";

type TProps = {
  wallet: TAddress;
  // Lets a feature hang an affordance (a chevron, say) inside the pill instead
  // of parking a second control next to it in the header.
  suffix?: ReactNode;
};

export const WalletCard = ({ wallet, suffix }: TProps) => {
  return (
    <span className={styles.root} title={wallet}>
      <AddressIcon size="small" address={wallet} />
      <span className={styles.address}>{shortenAddress(wallet)}</span>
      {suffix}
    </span>
  );
};
