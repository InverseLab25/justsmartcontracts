import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { TContractWithoutId } from "@entities/contract";
import { useAddContact } from "./model";

const ContractFormModal = dynamic(
  () =>
    import("@entities/contract/ui/ContractFormModal").then(
      (m) => m.ContractFormModal
    ),
  { ssr: false }
);

export const AddContractButton = () => {
  const [formVisible, setFormVisible] = useState(false);
  const addContract = useAddContact();

  const showModal = () => setFormVisible(true);
  const hideModal = () => setFormVisible(false);

  const onSubmit = useCallback(
    (values: TContractWithoutId) => {
      hideModal();

      addContract(values);
    },
    [addContract]
  );

  return (
    <>
      <Button icon={<PlusOutlined />} onClick={showModal}>
        Add contract
      </Button>

      {formVisible && (
        <ContractFormModal
          title="Add new contract"
          buttonText="Add"
          onSubmit={onSubmit}
          onCancel={hideModal}
        />
      )}
    </>
  );
};
