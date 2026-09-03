import { Modal } from "antd";
import { ContractForm } from "./ContractForm";
import { TContract, TContractWithoutId } from "../model/types";

type TProps = {
  title: string;
  buttonText: string;
  value?: TContract;
  onSubmit: (values: TContractWithoutId) => void;
  onCancel: () => void;
};

// Split out so antd's Modal and the ABI form only load once someone opens one.
// Callers mount this lazily, hence no `open` prop - being rendered means open.
export const ContractFormModal = ({
  title,
  buttonText,
  value,
  onSubmit,
  onCancel,
}: TProps) => (
  <Modal title={title} open footer={null} onCancel={onCancel} destroyOnHidden>
    <ContractForm value={value} buttonText={buttonText} onSubmit={onSubmit} />
  </Modal>
);
