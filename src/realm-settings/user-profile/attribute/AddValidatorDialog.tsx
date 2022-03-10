import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalVariant } from "@patternfly/react-core";
import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { AddRoleValidatorDialog } from "./AddRoleValidatorDialog";
import { validators } from "./Validators";

export type Validator = {
  name: string;
  description: string;
  config: [
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

export type AddValidatorDialogProps = {
  open: boolean;
  toggleDialog: () => void;
  onConfirm: (newValidator: UserProfileAttribute[]) => void;
};

export const AddValidatorDialog = (props: AddValidatorDialogProps) => {
  const { t } = useTranslation("realm-settings");
  const [selectedValidatorName, setSelectedValidatorName] =
    useState<Validator>();
  const [addRoleValidatorModalOpen, setAddRoleValidatorModalOpen] =
    useState(false);
  const toggleModal = () => {
    setAddRoleValidatorModalOpen(!addRoleValidatorModalOpen);
  };

  console.log("selectedValidatorName >>>>> ", selectedValidatorName);

  return (
    <>
      {addRoleValidatorModalOpen && (
        <AddRoleValidatorDialog
          onConfirm={() => console.log("TODO")}
          open={addRoleValidatorModalOpen}
          toggleDialog={toggleModal}
          selected={selectedValidatorName!}
        />
      )}
      <Modal
        variant={ModalVariant.small}
        title={t("addValidator")}
        isOpen
        onClose={props.toggleDialog}
        width={"40%"}
      >
        <TableComposable aria-label="validators-table">
          <Thead>
            <Tr>
              <Th>{t("validatorDialogColNames.colName")}</Th>
              <Th>{t("validatorDialogColNames.colDescription")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {validators.map((validator) => (
              <Tr
                key={validator.name}
                onRowClick={() => {
                  setSelectedValidatorName(validator as Validator);
                  toggleModal();
                }}
                isHoverable
              >
                <Td dataLabel={t("validatorDialogColNames.colName")}>
                  {validator.name}
                </Td>
                <Td dataLabel={t("validatorDialogColNames.colDescription")}>
                  {validator.description}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </Modal>
    </>
  );
};
