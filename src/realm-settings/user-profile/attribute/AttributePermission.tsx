import React from "react";
import { Checkbox, FormGroup, Grid, GridItem } from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { UseFormMethods, Controller } from "react-hook-form";
import { FormAccess } from "../../../components/form-access/FormAccess";
import "../../realm-settings-section.css";

export type AttributePermissionProps = {
  form: UseFormMethods;
};

export const AttributePermission = ({ form }: AttributePermissionProps) => {
  const { t } = useTranslation("realm-settings");

  return (
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
        fieldId="kc-who-can-edit"
      >
        <Grid>
          <GridItem lg={4} sm={6}>
            <Controller
              name="userEdit"
              control={form.control}
              render={({ onChange, value }) => (
                <Checkbox
                  id="user-edit"
                  label={t("user")}
                  value="user"
                  data-testid="userEdit"
                  ref={form.register}
                  isChecked={value}
                  onChange={(value) => {
                    onChange(value);
                  }}
                />
              )}
            />
          </GridItem>
          <GridItem lg={8} sm={6}>
            <Controller
              name="adminEdit"
              control={form.control}
              render={({ onChange, value }) => (
                <Checkbox
                  id="admin-edit"
                  label={t("admin")}
                  value="admin"
                  data-testid="adminEdit"
                  ref={form.register}
                  isChecked={value}
                  onChange={(value) => {
                    onChange(value);
                  }}
                />
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
        fieldId="kc-who-can-view"
      >
        <Grid>
          <GridItem lg={4} sm={6}>
            <Controller
              name="userView"
              control={form.control}
              render={({ onChange, value }) => (
                <Checkbox
                  id="user-view"
                  label={t("user")}
                  value="user"
                  data-testid="userView"
                  ref={form.register}
                  isChecked={value}
                  onChange={(value) => {
                    onChange(value);
                  }}
                />
              )}
            />
          </GridItem>
          <GridItem lg={8} sm={6}>
            <Controller
              name="adminView"
              control={form.control}
              render={({ onChange, value }) => (
                <Checkbox
                  id="admin-view"
                  label={t("admin")}
                  value="admin"
                  data-testid="adminView"
                  ref={form.register}
                  isChecked={value}
                  onChange={(value) => {
                    onChange(value);
                  }}
                />
              )}
            />
          </GridItem>
        </Grid>
      </FormGroup>
    </FormAccess>
  );
};
