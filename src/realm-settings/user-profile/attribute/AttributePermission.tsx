import React from "react";
import {
  Checkbox,
  FormGroup,
  Grid,
  GridItem,
  InputGroup,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { UseFormMethods, Controller } from "react-hook-form";
import { FormAccess } from "../../../components/form-access/FormAccess";
import { WizardSectionHeader } from "../../../components/wizard-section-header/WizardSectionHeader";
import "../../realm-settings-section.css";

export type AttributePermissionProps = {
  form: UseFormMethods;
  showSectionHeading?: boolean;
  showSectionDescription?: boolean;
};

export const AttributePermission = ({
  form,
  showSectionHeading = false,
  showSectionDescription = false,
}: AttributePermissionProps) => {
  const { t } = useTranslation("realm-settings");
  const { t: helpText } = useTranslation("realm-settings-help");

  return (
    <>
      {showSectionHeading && (
        <WizardSectionHeader
          title={t("permission")}
          description={helpText("attributePermissionDescription")}
          showDescription={showSectionDescription}
        />
      )}
      <FormAccess role="manage-realm" isHorizontal>
        <FormGroup
          hasNoPaddingTop
          label={t("whoCanEdit")}
          labelIcon={
            <HelpItem
              helpText="realm-settings-help:whoCanEditHelp"
              fieldLabelId="realm-settings:whoCanEdit"
            />
          }
          fieldId="kc-edit"
        >
          <Grid>
            <GridItem lg={4} sm={6}>
              <Controller
                name="edit"
                defaultValue={true}
                control={form.control}
                render={({ onChange, value }) => (
                  <InputGroup>
                    <Checkbox
                      data-testid="editUser"
                      label={t("user")}
                      id="kc-edit-user"
                      name="edit"
                      isChecked={value}
                      onChange={onChange}
                    />
                  </InputGroup>
                )}
              />
            </GridItem>
            <GridItem lg={8} sm={6}>
              <Controller
                name="edit"
                defaultValue={true}
                control={form.control}
                render={({ onChange, value }) => (
                  <InputGroup>
                    <Checkbox
                      data-testid="editAdmin"
                      label={t("admin")}
                      id="kc-edit-admin"
                      name="edit"
                      isChecked={value}
                      onChange={onChange}
                    />
                  </InputGroup>
                )}
              />
            </GridItem>
          </Grid>
        </FormGroup>
        <FormGroup
          hasNoPaddingTop
          label={t("whoCanView")}
          labelIcon={
            <HelpItem
              helpText="realm-settings-help:whoCanViewHelp"
              fieldLabelId="realm-settings:whoCanView"
            />
          }
          fieldId="kc-view"
        >
          <Grid>
            <GridItem lg={4} sm={6}>
              <Controller
                name="view"
                defaultValue={true}
                control={form.control}
                render={({ onChange, value }) => (
                  <InputGroup>
                    <Checkbox
                      data-testid="viewUser"
                      label={t("user")}
                      id="kc-view-user"
                      name="view"
                      isChecked={value}
                      onChange={onChange}
                    />
                  </InputGroup>
                )}
              />
            </GridItem>
            <GridItem lg={8} sm={6}>
              <Controller
                name="view"
                defaultValue={true}
                control={form.control}
                render={({ onChange, value }) => (
                  <InputGroup>
                    <Checkbox
                      data-testid="viewAdmin"
                      label={t("admin")}
                      id="kc-view-admin"
                      name="view"
                      isChecked={value}
                      onChange={onChange}
                    />
                  </InputGroup>
                )}
              />
            </GridItem>
          </Grid>
        </FormGroup>
      </FormAccess>
    </>
  );
};
