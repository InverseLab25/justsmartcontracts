import { useMemo } from "react";
import { Dropdown, type MenuProps } from "antd";
import { CopyOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { WalletCard } from "@entities/wallet";
import { TAddress } from "@shared/lib/web3";
import { useCopyAddress, useDisconnectWallet } from "./model";

import styles from "./ConnectedWallet.module.scss";

type TProps = {
  address: TAddress;
};

export const ConnectedWallet = ({ address }: TProps) => {
  const { disconnect } = useDisconnectWallet();
  const copyAddress = useCopyAddress(address);

  const items: MenuProps["items"] = useMemo(
    () => [
      {
        key: "copy",
        icon: <CopyOutlined />,
        label: "Copy address",
        onClick: copyAddress,
      },
      { type: "divider" },
      {
        key: "disconnect",
        icon: <LogoutOutlined />,
        label: "Disconnect",
        danger: true,
        onClick: disconnect,
      },
    ],
    [copyAddress, disconnect]
  );

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <button type="button" className={styles.trigger}>
        <WalletCard
          wallet={address}
          suffix={<DownOutlined className={styles.chevron} />}
        />
      </button>
    </Dropdown>
  );
};
