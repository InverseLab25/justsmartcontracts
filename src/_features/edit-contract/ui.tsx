import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { TContract, TContractWithoutId } from "@entities/contract";
import { useEditContact } from "./model";

const ContractFormModal = dynamic(
  () =>
    import("@entities/contract/ui/ContractFormModal").then(
      (m) => m.ContractFormModal
    ),
  { ssr: false }
);

type TProps = {
  contract: TContract;
};

export const EditContractButton = ({ contract }: TProps) => {
  const [formVisible, setFormVisible] = useState(false);
  const editContract = useEditContact(contract);

  const showModal = () => setFormVisible(true);
  const hideModal = () => setFormVisible(false);

  const onSubmit = useCallback(
    (values: TContractWithoutId) => {
      hideModal();

      editContract(values);
    },
    [editContract]
  );

  return (
    <>
      <Button size="small" icon={<EditOutlined />} onClick={showModal} />

      {formVisible && (
        <ContractFormModal
          title="Edit contract"
          value={contract}
          buttonText="Update"
          onSubmit={onSubmit}
          onCancel={hideModal}
        />
      )}
    </>
  );
};
