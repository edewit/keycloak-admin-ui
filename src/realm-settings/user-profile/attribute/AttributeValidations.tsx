import React, { useState } from "react";
import {
  Button,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { WizardSectionHeader } from "../../../components/wizard-section-header/WizardSectionHeader";
import "../../realm-settings-section.css";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { AddValidatorDialog } from "../attribute/AddValidatorDialog";
import { useUserProfile } from "../UserProfileContext";
import { useParams } from "react-router-dom";
import type { AttributeParams } from "../../routes/Attribute";

export type AttributeValidationsProps = {
  showSectionHeading?: boolean;
  showSectionDescription?: boolean;
};

export const AttributeValidations = ({
  showSectionHeading = false,
  showSectionDescription = false,
}: AttributeValidationsProps) => {
  const { config } = useUserProfile();
  const { attributeName } = useParams<AttributeParams>();
  const { t } = useTranslation("realm-settings");
  const { t: helpText } = useTranslation("realm-settings-help");
  const [addValidatorModalOpen, setAddValidatorModalOpen] = useState(false);

  const toggleModal = () => {
    setAddValidatorModalOpen(!addValidatorModalOpen);
  };

  const attributes = config?.attributes!.map((attribute) => {
    return attribute;
  });

  const validationForAttrName = [];
  if (attributes) {
    const selectedAttribute = attributes.find((val) => {
      return val.name === attributeName;
    });
    validationForAttrName.push(
      Object.keys(selectedAttribute?.validations as [])
    );
  }

  return (
    <>
      {showSectionHeading && (
        <WizardSectionHeader
          title={t("permission")}
          description={helpText("attributePermissionDescription")}
          showDescription={showSectionDescription}
        />
      )}
      {addValidatorModalOpen && (
        <AddValidatorDialog
          onConfirm={() => console.log("TODO AddValidatorDialog onConfirm")}
          open={addValidatorModalOpen}
          toggleDialog={toggleModal}
        />
      )}
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
      <DataList aria-label={t("validations")} isCompact>
        <DataListItem aria-labelledby={"validations-list-item"}>
          <DataListItemRow data-testid="validations-list-row">
            <DataListItemCells
              dataListCells={[
                <DataListCell key="validation" data-testid="validation">
                  {validationForAttrName!.map((validation) => (
                    <>
                      <span>{validation}</span>
                      <Button
                        key="validation"
                        variant="link"
                        data-testid="deleteValidation"
                        onClick={() =>
                          console.log("TODO delete validator from attribute")
                        }
                      >
                        {t("common:delete")}
                      </Button>
                    </>
                  ))}
                </DataListCell>,
              ]}
            />
          </DataListItemRow>
        </DataListItem>
      </DataList>
    </>
  );
};
