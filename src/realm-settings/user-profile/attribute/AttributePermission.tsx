import React, { useState } from "react";
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
  const [isCheckedUserEdit, setIsCheckedUserEdit] = useState(true);
  const [isCheckedAdminEdit, setIsCheckedAdminEdit] = useState(true);
  const [isCheckedUserView, setIsCheckedUserView] = useState(false);
  const [isCheckedAdminView, setIsCheckedAdminView] = useState(false);

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
              name="whoCanEdit"
              control={form.control}
              render={({ onChange }) => (
                <Checkbox
                  id="user-edit"
                  label={t("user")}
                  data-testid="userEdit"
                  ref={form.register}
                  isChecked={isCheckedUserEdit}
                  onChange={(value) => {
                    onChange(setIsCheckedUserEdit(value));
                  }}
                />
              )}
            />
          </GridItem>
          <GridItem lg={8} sm={6}>
            <Controller
              name="whoCanEdit"
              control={form.control}
              render={({ onChange }) => (
                <Checkbox
                  id="admin-edit"
                  label={t("admin")}
                  data-testid="adminEdit"
                  ref={form.register}
                  isChecked={isCheckedAdminEdit}
                  onChange={(value) => {
                    onChange(setIsCheckedAdminEdit(value));
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
              name="whoCanView"
              control={form.control}
              render={({ onChange }) => (
                <Checkbox
                  id="user-view"
                  label={t("user")}
                  data-testid="userView"
                  ref={form.register}
                  isChecked={isCheckedUserEdit ? true : isCheckedUserView}
                  onChange={(value) => {
                    onChange(setIsCheckedUserView(value));
                  }}
                  isDisabled={isCheckedUserEdit}
                />
              )}
            />
          </GridItem>
          <GridItem lg={8} sm={6}>
            <Controller
              name="whoCanView"
              control={form.control}
              render={({ onChange }) => (
                <Checkbox
                  id="admin-view"
                  label={t("admin")}
                  data-testid="adminView"
                  ref={form.register}
                  isChecked={isCheckedAdminEdit ? true : isCheckedAdminView}
                  onChange={(value) => {
                    onChange(setIsCheckedAdminView(value));
                  }}
                  isDisabled={isCheckedAdminEdit}
                />
              )}
            />
          </GridItem>
        </Grid>
      </FormGroup>
    </FormAccess>
  );
};
