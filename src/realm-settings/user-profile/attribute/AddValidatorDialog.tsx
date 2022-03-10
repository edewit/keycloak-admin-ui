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

export type Validator = {
  name: string;
  description: string;
};

export type AddValidatorDialogProps = {
  open: boolean;
  toggleDialog: () => void;
  onConfirm: (newValidator: UserProfileAttribute[]) => void;
};

const validators = [
  {
    name: "double",
    description:
      "Check if the value is a double and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number.",
  },
  {
    name: "email",
    description: "Check if the value has a valid e-mail format.",
  },
  {
    name: "integer",
    description:
      "Check if the value is an integer and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number.",
  },
  {
    name: "length",
    description:
      "Check the length of a string value based on a minimum and maximum length.",
  },
  {
    name: "local-date",
    description:
      "Check if the value has a valid format based on the realm and/or user locale.",
  },
  {
    name: "options",
    description:
      "Check if the value is from the defined set of allowed values. Useful to validate values entered through select and multiselect fields.",
  },
  {
    name: "pattern",
    description: "Check if the value matches a specific RegEx pattern.",
  },
  {
    name: "person-name-prohibited-characters",
    description:
      "Check if the value is a valid person name as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in person names.",
  },
  { name: "uri", description: "Check if the value is a valid URI." },
  {
    name: "username-prohibited-characters",
    description:
      "Check if the value is a valid username as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in usernames.",
  },
];

export const AddValidatorDialog = (props: AddValidatorDialogProps) => {
  const { t } = useTranslation("realm-settings");
  const [selectedValidatorName, setSelectedValidatorName] =
    useState<Validator>();
  const [addRoleValidatorModalOpen, setAddRoleValidatorModalOpen] =
    useState(false);
  const toggleModal = () => {
    setAddRoleValidatorModalOpen(!addRoleValidatorModalOpen);
  };

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
                  setSelectedValidatorName(validator);
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
