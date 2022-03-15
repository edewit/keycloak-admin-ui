/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { useState } from "react";
import {
  Button,
  ButtonVariant,
  Divider,
  Flex,
  FlexItem,
  Text,
  TextVariants,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import "../../realm-settings-section.css";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { AddValidatorDialog } from "../attribute/AddValidatorDialog";
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { useConfirmDialog } from "../../../components/confirm-dialog/ConfirmDialog";
import "../../realm-settings-section.css";
import type { Validator } from "./Validators";

export const AttributeValidations = () => {
  const { t } = useTranslation("realm-settings");
  const [addValidatorModalOpen, setAddValidatorModalOpen] = useState(false);
  const [validatorToDelete, setValidatorToDelete] =
    useState<{ name: string }>();
  const [newValidator, setNewValidator] = useState(null);
  const [validators, setValidators] = useState([]);

  const toggleModal = () => {
    setAddValidatorModalOpen(!addValidatorModalOpen);
  };

  if (newValidator) {
    setValidators(validators.concat([newValidator]));
    setNewValidator(null);
  }

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("deleteValidatorConfirmTitle"),
    messageKey: t("deleteValidatorConfirmMsg", {
      validatorName: validatorToDelete?.name!,
    }),
    continueButtonLabel: "common:delete",
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      console.log("TODO");
    },
  });

  return (
    <>
      {addValidatorModalOpen && (
        <AddValidatorDialog
          onConfirm={(newValidator) => {
            setNewValidator(newValidator as any);
          }}
          toggleDialog={toggleModal}
        />
      )}
      <DeleteConfirm />
      <div className="kc-attributes-validations">
        <Flex>
          <FlexItem align={{ default: "alignRight" }}>
            <Button
              id="addValidator"
              onClick={() => toggleModal()}
              variant="link"
              className="kc-addValidator"
              data-testid="addValidator"
              icon={<PlusCircleIcon />}
            >
              {t("realm-settings:addValidator")}
            </Button>
          </FlexItem>
        </Flex>
        <Divider />
        <TableComposable aria-label="validators-table">
          <Thead>
            <Tr>
              <Th>{t("validatorColNames.colName")}</Th>
              <Th>{t("validatorColNames.colConfig")}</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {validators.length > 0 ? (
              validators!.map((validator: Validator) => (
                <Tr key={validator.name}>
                  <Td dataLabel={t("validatorColNames.colName")}>
                    {validator.name}
                  </Td>
                  <Td dataLabel={t("validatorColNames.colConfig")}>
                    {JSON.stringify(validator.config)}
                  </Td>
                  <Td>
                    <Button
                      key="validator"
                      variant="link"
                      data-testid="deleteValidator"
                      isDisabled={true}
                      onClick={() => {
                        toggleDeleteDialog();
                        setValidatorToDelete({
                          name: validator.name,
                        });
                      }}
                    >
                      {t("common:delete")}
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Text className="kc-emptyValidators" component={TextVariants.h6}>
                {t("realm-settings:emptyValidators")}
              </Text>
            )}
          </Tbody>
        </TableComposable>
      </div>
    </>
  );
};
