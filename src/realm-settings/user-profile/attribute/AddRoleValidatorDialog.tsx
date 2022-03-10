import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { FormProvider, useForm } from "react-hook-form";
import { DynamicComponents } from "../../../components/dynamic/DynamicComponents";

export type Validator = {
  name: string;
  description: string;
  properties: [
    {
      name?: string;
      label?: string;
      helpText?: string;
      type?: string;
      defaultValue?: any;
      options?: string[];
      secret?: boolean;
    }
  ];
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
      title={t("addValidatorRole", {
        validatorName: selectedRoleValidator.name,
      })}
      description={selectedRoleValidator.description}
      isOpen
      onClose={props.toggleDialog}
      width={"40%"}
      actions={[
        <Button
          key="save"
          data-testid="save-validator-role-button"
          variant="primary"
          //   onClick={() => {
          //     onConfirm(selectedRoleValidator);
          //   }}
        >
          {t("common:save")}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          //   onClick={() => {
          //     toggleDialog();
          //   }}
        >
          {t("common:cancel")}
        </Button>,
      ]}
    >
      <FormProvider {...form}>
        <DynamicComponents properties={selectedRoleValidator.properties} />
      </FormProvider>
    </Modal>
  );
};
