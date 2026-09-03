import { Button, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { ExternalLink } from "@shared/ui/ExternalLink";
import { useCopyToClipboard } from "@shared/lib/clipboard";

import styles from "./Footer.module.scss";

const DonationAddress = "0x43283C9B024659FA5F8A679B193B75C15D2Ecc87";

export const Footer = () => {
  const copy = useCopyToClipboard();

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <ExternalLink href="https://github.com/olekon/justsmartcontracts">
          GitHub
        </ExternalLink>

        <span className={styles.dot}>·</span>

        <ExternalLink href="https://x.com/atarpara">X</ExternalLink>

        <span className={styles.dot}>·</span>

        <span className={styles.label}>Donations</span>
        <span className={styles.address}>{DonationAddress}</span>

        <Tooltip title="Copy donation address">
          <Button
            type="text"
            size="small"
            aria-label="Copy donation address"
            icon={<CopyOutlined />}
            onClick={() => copy(DonationAddress, "Donation address copied")}
          />
        </Tooltip>
      </div>
    </div>
  );
};
