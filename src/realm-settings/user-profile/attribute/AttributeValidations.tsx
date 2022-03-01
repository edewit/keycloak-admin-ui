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
import { useUserProfile } from "../UserProfileContext";
import { useParams } from "react-router-dom";
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { useConfirmDialog } from "../../../components/confirm-dialog/ConfirmDialog";
import type { AttributeParams } from "../../routes/Attribute";
import "../../realm-settings-section.css";
import type { UseFormMethods } from "react-hook-form";

export type AttributeValidationsProps = {
  form: UseFormMethods;
};

export const AttributeValidations = ({ form }: AttributeValidationsProps) => {
  const { config } = useUserProfile();
  const { attributeName } = useParams<AttributeParams>();
  const { t } = useTranslation("realm-settings");
  const [addValidatorModalOpen, setAddValidatorModalOpen] = useState(false);
  const [validatorToDelete, setValidatorToDelete] =
    useState<{ name: string }>();

  const toggleModal = () => {
    setAddValidatorModalOpen(!addValidatorModalOpen);
  };

  const attributes = config?.attributes!.map((attribute) => {
    return attribute;
  });

  const validatorForAttrName: { name: string; config: string }[] = [];
  if (attributes) {
    const selectedAttribute = attributes.find((val) => {
      return val.name === attributeName;
    });

    if (selectedAttribute?.validations) {
      Object.entries(selectedAttribute.validations! as {}).forEach(
        ([key, value]) =>
          validatorForAttrName.push({ name: key, config: value as string })
      );
    }
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
          onConfirm={() => console.log("TODO")}
          open={addValidatorModalOpen}
          toggleDialog={toggleModal}
        />
      )}
      <DeleteConfirm />
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
          {validatorForAttrName.length > 0 ? (
            validatorForAttrName!.map((validator) => (
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
    </>
  );
};
