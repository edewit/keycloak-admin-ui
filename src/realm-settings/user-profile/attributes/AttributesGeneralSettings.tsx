import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { UseFormMethods, Controller } from "react-hook-form";
import { FormAccess } from "../../../components/form-access/FormAccess";
import { useRealm } from "../../../context/realm-context/RealmContext";

import { WizardSectionHeader } from "../../../components/wizard-section-header/WizardSectionHeader";
import { useAdminClient } from "../../../context/auth/AdminClient";

export type AttributesGeneralSettingsProps = {
  form: UseFormMethods;
  showSectionHeading?: boolean;
  showSectionDescription?: boolean;
  attributeGroupEdit?: boolean;
};

export const AttributesGeneralSettings = ({
  form,
  showSectionHeading = false,
  showSectionDescription = false,
  attributeGroupEdit = false,
}: AttributesGeneralSettingsProps) => {
  const { t } = useTranslation("realm-settings");
  const { t: helpText } = useTranslation("realm-settings-help");

  const adminClient = useAdminClient();
  const { realm } = useRealm();

  const [isAttributeGroupDropdownOpen, setIsAttributeGroupDropdownOpen] =
    useState(false);

  return (
    <>
      {showSectionHeading && (
        <WizardSectionHeader
          title={t("generalSettings")}
          description={helpText("attributeGeneralSettingsDescription")}
          showDescription={showSectionDescription}
        />
      )}
      <FormAccess role="manage-realm" isHorizontal>
        <FormGroup
          label={t("attributeName")}
          labelIcon={
            <HelpItem
              helpText="realm-settings-help:attributeNameHelp"
              fieldLabelId="realm-settings:attributeName"
            />
          }
          fieldId="kc-attribute-name"
          isRequired
        >
          <TextInput
            isRequired
            type="text"
            id="kc-attribute-name"
            name="name"
            defaultValue=""
            ref={form.register({
              required: {
                value: true,
                message: `${t("validateName")}`,
              },
            })}
            data-testid="attribute-name"
          />
          {form.errors.name && (
            <div className="error">{form.errors.name.message}</div>
          )}
        </FormGroup>
        <FormGroup
          label={t("attributeDisplayName")}
          labelIcon={
            <HelpItem
              helpText="realm-settings-help:attributeDisplayNameHelp"
              fieldLabelId="realm-settings:attributeDisplayName"
            />
          }
          fieldId="kc-attribute-display-name"
        >
          <TextInput
            isRequired
            type="text"
            id="kc-attribute-display-name"
            name="displayName"
            defaultValue=""
            data-testid="attribute-display-name"
          />
        </FormGroup>
        <FormGroup
          label={t("attributeGroup")}
          labelIcon={
            <HelpItem
              helpText="realm-setting-help:attributeGroupHelp"
              fieldLabelId="realm-setting:attributeGroup"
            />
          }
          fieldId="kc-attribute-group"
        >
          <Controller
            name="attributeGroup"
            defaultValue=""
            control={form.control}
            render={({ onChange, value }) => (
              <Select
                isDisabled={!!attributeGroupEdit}
                toggleId="kc-attributeGroup"
                onToggle={() =>
                  setIsAttributeGroupDropdownOpen(!isAttributeGroupDropdownOpen)
                }
                isOpen={isAttributeGroupDropdownOpen}
                onSelect={(_, value) => {
                  onChange(value.toString());
                  setIsAttributeGroupDropdownOpen(false);
                }}
                selections={value}
                variant={SelectVariant.single}
              >
                <SelectOption key={0} value="" isPlaceholder>
                  Select a group
                </SelectOption>
                <SelectOption key={1} value=""></SelectOption>
              </Select>
            )}
          ></Controller>
        </FormGroup>
      </FormAccess>
    </>
  );
};
