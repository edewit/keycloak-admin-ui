import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalVariant } from "@patternfly/react-core";
import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";

export type Validator = {
  name: string;
  description: string;
};

export type AddRoleValidatorDialogProps = {
  open: boolean;
  toggleDialog: () => void;
  onConfirm: (newValidator: UserProfileAttribute[]) => void;
  selected: Validator;
};

export const AddRoleValidatorDialog = (props: AddRoleValidatorDialogProps) => {
  const { t } = useTranslation("realm-settings");
  const selectedRoleValidator = props.selected;

  return (
    <Modal
      variant={ModalVariant.small}
      title={t("addValidator")}
      isOpen
      onClose={props.toggleDialog}
      width={"40%"}
    >
      <p>{selectedRoleValidator.name}</p>
    </Modal>
  );
};
