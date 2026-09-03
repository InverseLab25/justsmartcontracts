import Link from "next/link";
import { SetCurrentChain } from "@features/set-current-chain";
import { walletModel } from "@entities/wallet";
import { ConnectButton } from "@features/connect-wallet";
import { ConnectedWallet } from "@features/disconnect-wallet";
import { ToggleThemeButton } from "@features/toggle-theme";

import styles from "./Header.module.scss";

const WalletBlock = () => {
  const { address } = walletModel.useCurrentWallet();

  if (address) {
    return <ConnectedWallet address={address} />;
  }

  return <ConnectButton />;
};

export const Header = () => {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Link href="/" className={styles.brand}>
          JustSmartContracts
        </Link>

        <div className={styles.controls}>
          <WalletBlock />
          <div className={styles.chainSelect}>
            <SetCurrentChain />
          </div>
          <ToggleThemeButton />
        </div>
      </div>
    </div>
  );
};
