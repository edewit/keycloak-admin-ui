import React, { useState } from "react";
import {
  Divider,
  FormGroup,
  Radio,
  Select,
  SelectOption,
  SelectVariant,
  Switch,
  TextInput,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { UseFormMethods, Controller } from "react-hook-form";
import { FormAccess } from "../../../components/form-access/FormAccess";
import { useAdminClient, useFetch } from "../../../context/auth/AdminClient";
import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import "../../realm-settings-section.css";

export type AttributeGeneralSettingsProps = {
  form: UseFormMethods;
};

const ENABLED_REQUIRED_WHEN = ["Always", "Scopes are requested"] as const;
const REQUIRED_FOR = [
  "Both users and admins",
  "Only users",
  "Only admins",
] as const;

export const AttributeGeneralSettings = ({
  form,
}: AttributeGeneralSettingsProps) => {
  const { t } = useTranslation("realm-settings");
  const adminClient = useAdminClient();
  const [selectOpen, setSelectOpen] = useState(false);
  const [clientScopes, setClientScopes] =
    useState<ClientScopeRepresentation[]>();

  const [isAttributeGroupDropdownOpen, setIsAttributeGroupDropdownOpen] =
    useState(false);

  useFetch(
    () => adminClient.clientScopes.find(),
    (clientScopes) => {
      setClientScopes(clientScopes);
    },
    []
  );

  return (
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
          type="text"
          id="kc-attribute-display-name"
          name="displayName"
          defaultValue=""
          ref={form.register}
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
      <Divider />
      <FormGroup label={t("enabledWhen")} fieldId="enabledWhen" hasNoPaddingTop>
        <Controller
          name="enabledWhen"
          data-testid="enabledWhen"
          defaultValue={ENABLED_REQUIRED_WHEN[0]}
          control={form.control}
          render={({ onChange, value }) => (
            <>
              {ENABLED_REQUIRED_WHEN.map((option) => (
                <Radio
                  id={option}
                  key={option}
                  data-testid={option}
                  isChecked={value === option}
                  name="enabledWhen"
                  onChange={() => onChange(option)}
                  label={option}
                  className="pf-u-mb-md"
                />
              ))}
            </>
          )}
        />
      </FormGroup>
      <FormGroup fieldId="kc-scope">
        <Controller
          name="scope"
          control={form.control}
          render={({
            onChange,
            value,
          }: {
            onChange: (newValue: ClientScopeRepresentation[]) => void;
            value: ClientScopeRepresentation[];
          }) => (
            <Select
              name="scope"
              data-testid="scopeFld"
              variant={SelectVariant.typeaheadMulti}
              typeAheadAriaLabel="Select"
              onToggle={(isOpen) => setSelectOpen(isOpen)}
              selections={value}
              onSelect={(_, selectedValue) => {
                const option =
                  selectedValue.toString() as ClientScopeRepresentation;
                const changedValue = value.includes(option)
                  ? value.filter((item) => item !== option)
                  : [...value, option];

                onChange(changedValue);
              }}
              onClear={(clientScope) => {
                clientScope.stopPropagation();
                onChange([]);
              }}
              isOpen={selectOpen}
              aria-labelledby={"scope"}
            >
              {clientScopes?.map((option) => (
                <SelectOption key={option.name} value={option.name} />
              ))}
            </Select>
          )}
        />
      </FormGroup>
      <Divider />
      <FormGroup
        label={t("required")}
        labelIcon={
          <HelpItem
            helpText="realm-settings-help:requiredHelp"
            fieldLabelId="realm-settings:required"
          />
        }
        fieldId="kc-required"
        hasNoPaddingTop
      >
        <Controller
          name="required"
          defaultValue={["false"]}
          control={form.control}
          render={({ onChange, value }) => (
            <Switch
              id={"kc-required"}
              isDisabled={false}
              onChange={(value) => onChange([`${value}`])}
              isChecked={value[0] === "true"}
              label={t("common:on")}
              labelOff={t("common:off")}
            />
          )}
        ></Controller>
      </FormGroup>
      <FormGroup label={t("requiredFor")} fieldId="requiredFor" hasNoPaddingTop>
        <Controller
          name="requiredFor"
          data-testid="requiredFor"
          defaultValue={REQUIRED_FOR[0]}
          control={form.control}
          render={({ onChange, value }) => (
            <div className="kc-requiredFor">
              {REQUIRED_FOR.map((option) => (
                <Radio
                  id={option}
                  key={option}
                  data-testid={option}
                  isChecked={value === option}
                  name="requiredFor"
                  onChange={() => onChange(option)}
                  label={option}
                  className="kc-requiredFor-option"
                />
              ))}
            </div>
          )}
        />
      </FormGroup>
      <FormGroup
        label={t("requiredWhen")}
        fieldId="requiredWhen"
        hasNoPaddingTop
      >
        <Controller
          name="requiredWhen"
          data-testid="requiredWhen"
          defaultValue={ENABLED_REQUIRED_WHEN[0]}
          control={form.control}
          render={({ onChange, value }) => (
            <>
              {ENABLED_REQUIRED_WHEN.map((option) => (
                <Radio
                  id={option}
                  key={option}
                  data-testid={option}
                  isChecked={value === option}
                  name="requiredWhen"
                  onChange={() => onChange(option)}
                  label={option}
                  className="pf-u-mb-md"
                />
              ))}
            </>
          )}
        />
      </FormGroup>
      <FormGroup fieldId="kc-scope">
        <Controller
          name="scope"
          control={form.control}
          render={({
            onChange,
            value,
          }: {
            onChange: (newValue: ClientScopeRepresentation[]) => void;
            value: ClientScopeRepresentation[];
          }) => (
            <Select
              name="scope"
              data-testid="scopeFld"
              variant={SelectVariant.typeaheadMulti}
              typeAheadAriaLabel="Select"
              onToggle={(isOpen) => setSelectOpen(isOpen)}
              selections={value}
              onSelect={(_, selectedValue) => {
                const option =
                  selectedValue.toString() as ClientScopeRepresentation;
                const changedValue = value.includes(option)
                  ? value.filter((item) => item !== option)
                  : [...value, option];

                onChange(changedValue);
              }}
              onClear={(clientScope) => {
                clientScope.stopPropagation();
                onChange([]);
              }}
              isOpen={selectOpen}
              aria-labelledby={"scope"}
            >
              {clientScopes?.map((option) => (
                <SelectOption key={option.name} value={option.name} />
              ))}
            </Select>
          )}
        />
      </FormGroup>
    </FormAccess>
  );
};
