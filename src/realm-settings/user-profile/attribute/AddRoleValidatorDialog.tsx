import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalVariant } from "@patternfly/react-core";
import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { FormProvider, useForm } from "react-hook-form";
import { DynamicComponents } from "../../../components/dynamic/DynamicComponents";

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
  const form = useForm();
  const selectedRoleValidator = props.selected;

  return (
    <Modal
      variant={ModalVariant.small}
      title={t("addValidator")}
      isOpen
      onClose={props.toggleDialog}
      width={"40%"}
    >
      <FormProvider {...form}>
        <DynamicComponents properties={[selectedRoleValidator]} />
      </FormProvider>
      <p>{selectedRoleValidator.name}</p>
    </Modal>
  );
};
