import { useState } from "react";
import { Button, Modal, List, Alert, Empty } from "antd";
import { useConnectWallet, useWalletConnectors } from "./model";

export const ConnectButton = () => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const connectors = useWalletConnectors();
  const { connectWith, isPending, error, reset } = useConnectWallet();

  const openPicker = () => setPickerOpen(true);

  const closePicker = () => {
    setPickerOpen(false);
    reset();
  };

  return (
    <>
      <Button onClick={openPicker} size="middle" type="primary">
        Connect wallet
      </Button>

      <Modal
        title="Connect a wallet"
        open={pickerOpen}
        footer={null}
        onCancel={closePicker}
        destroyOnHidden
      >
        {error && (
          <Alert
            type="error"
            message={error.message}
            style={{ marginBottom: 12 }}
          />
        )}

        {connectors.length === 0 ? (
          <Empty description="No wallet detected. Install a browser wallet such as MetaMask, then reload." />
        ) : (
          <List
            dataSource={connectors}
            renderItem={(connector) => (
              <List.Item>
                <Button
                  block
                  loading={isPending}
                  icon={
                    connector.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={connector.icon} alt="" width={16} height={16} />
                    ) : undefined
                  }
                  onClick={() => connectWith(connector, closePicker)}
                >
                  {connector.name}
                </Button>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
};
