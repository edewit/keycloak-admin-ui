/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
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
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { FormAccess } from "../../../components/form-access/FormAccess";
import { useAdminClient, useFetch } from "../../../context/auth/AdminClient";
import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import "../../realm-settings-section.css";
import type { AttributeParams } from "../../routes/Attribute";
import { useParams } from "react-router-dom";
import { arrayEquals } from "../../../util";
import type UserProfileConfig from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";

const ENABLED_REQUIRED_WHEN = ["Always", "Scopes are requested"] as const;
const REQUIRED_FOR = [
  { label: "Both users and admins", value: ["admin", "user"] },
  { label: "Only users", value: ["user"] },
  { label: "Only admins", value: ["admin"] },
] as const;

export const AttributeGeneralSettings = () => {
  const { t } = useTranslation("realm-settings");
  const adminClient = useAdminClient();
  const form = useFormContext();
  const [config, setConfig] = useState<UserProfileConfig | null>(null);
  const [clientScopes, setClientScopes] =
    useState<ClientScopeRepresentation[]>();
  const [selectEnabledWhenOpen, setSelectEnabledWhenOpen] = useState(false);
  const [selectRequiredForOpen, setSelectRequiredForOpen] = useState(false);
  const [isAttributeGroupDropdownOpen, setIsAttributeGroupDropdownOpen] =
    useState(false);
  const [enabledWhenSelection, setEnabledWhenSelection] = useState("Always");
  const [requiredWhenSelection, setRequiredWhenSelection] = useState("Always");
  const attributes = config?.attributes;
  const { realm, attributeName } = useParams<AttributeParams>();
  const editMode = attributeName ? true : false;

  const requiredToggle = useWatch({
    control: form.control,
    name: "required",
    defaultValue: false,
  });

  useFetch(
    () =>
      Promise.all([
        adminClient.users.getProfile({ realm }),
        adminClient.clientScopes.find(),
      ]),
    ([config, clientScopes]) => {
      setConfig(config);
      setClientScopes(clientScopes);
    },
    []
  );

  const scopeNames = clientScopes?.map((clientScope) => clientScope.name);

  const attribute = attributes?.find(
    (attribute) => attribute.name === attributeName
  );

  let attributeScopes: any;
  let attributeScopesEnabledWhen = "";
  let attributeRequired = false;
  let attributeScopesRequiredWhen = "";
  let attributeRequiredWhenScopes: any;
  const formValues = form.getValues();

  useEffect(() => {
    if (attribute) {
      const scopesComparison = arrayEquals(
        attribute.selector?.scopes,
        scopeNames
      );

      attributeScopesEnabledWhen = scopesComparison
        ? t("always")
        : t("scopesAsRequested");

      attributeScopes = scopesComparison ? [] : attribute.selector?.scopes;

      const attributeRequiredContents = Object.entries(attribute.required!).map(
        ([key, value]) => ({ key, value })
      );

      attributeRequired = attributeRequiredContents.length !== 0 ? true : false;

      const requiredWhenScopesComparison = arrayEquals(
        attribute.required?.scopes,
        scopeNames
      );

      attributeScopesRequiredWhen = requiredWhenScopesComparison
        ? t("always")
        : t("scopesAsRequested");

      attributeRequiredWhenScopes = requiredWhenScopesComparison
        ? []
        : attribute.required?.scopes;
    }

    if (formValues.enabledWhen === "") {
      form.setValue("enabledWhen", t("always"));
    }

    if (formValues.requiredWhen === "") {
      form.setValue("scopeRequired", t("always"));
    }

    if (formValues.enabledWhen === "Always") {
      form.setValue("scopes", []);
    }

    if (formValues.requiredWhen === "Always") {
      form.setValue("scopeRequired", []);
    }

    form.setValue("name", attribute?.name);
    form.setValue("displayName", attribute?.displayName);
    form.setValue("attributeGroup", attribute?.group);
    form.setValue("enabledWhen", attributeScopesEnabledWhen);
    form.setValue("scopes", attributeScopes);
    form.setValue("required", attributeRequired);
    form.setValue("roles", attribute?.required?.roles);

    form.setValue("requiredWhen", attributeScopesRequiredWhen);
    form.setValue("scopeRequired", attributeRequiredWhenScopes);
  }, [formValues, attribute]);

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
          isDisabled={editMode}
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
          control={form.control}
          defaultValue={ENABLED_REQUIRED_WHEN[0]}
          render={({ onChange, value }) => (
            <>
              {ENABLED_REQUIRED_WHEN.map((option) => (
                <Radio
                  id={option}
                  key={option}
                  data-testid={option}
                  isChecked={value === option}
                  name="enabledWhen"
                  onChange={() => {
                    onChange(option);
                    setEnabledWhenSelection(option);
                  }}
                  label={option}
                  className="pf-u-mb-md"
                />
              ))}
            </>
          )}
        />
      </FormGroup>
      <FormGroup fieldId="kc-scope-enabled-when">
        <Controller
          name="scopes"
          control={form.control}
          defaultValue={[]}
          render={({
            onChange,
            value,
          }: {
            onChange: (newValue: string[]) => void;
            value: string[];
          }) => (
            <Select
              name="scopes"
              data-testid="enabled-when-scope-field"
              variant={SelectVariant.typeaheadMulti}
              typeAheadAriaLabel="Select"
              chipGroupProps={{
                numChips: 3,
                expandedText: t("common:hide"),
                collapsedText: t("common:showRemaining"),
              }}
              onToggle={(isOpen) => setSelectEnabledWhenOpen(isOpen)}
              selections={value}
              onSelect={(_, selectedValue) => {
                const option = selectedValue.toString();
                let changedValue = [""];
                if (value) {
                  changedValue = value.includes(option)
                    ? value.filter((item) => item !== option)
                    : [...value, option];
                } else {
                  changedValue = [option];
                }

                onChange(changedValue);
              }}
              onClear={(selectedValues) => {
                selectedValues.stopPropagation();
                onChange([]);
              }}
              isOpen={selectEnabledWhenOpen}
              isDisabled={enabledWhenSelection === "Always"}
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
          defaultValue={false}
          control={form.control}
          render={({ onChange, value }) => (
            <Switch
              id={"kc-required"}
              onChange={(value) => {
                onChange(value);
                form.setValue("required", value);
              }}
              isChecked={value === true}
              label={t("common:on")}
              labelOff={t("common:off")}
            />
          )}
        ></Controller>
      </FormGroup>
      {requiredToggle && (
        <>
          <FormGroup
            label={t("requiredFor")}
            fieldId="requiredFor"
            hasNoPaddingTop
          >
            <Controller
              name="roles"
              data-testid="requiredFor"
              defaultValue={REQUIRED_FOR[0].value}
              control={form.control}
              render={({ onChange, value }) => (
                <div className="kc-requiredFor">
                  {REQUIRED_FOR.map((option) => (
                    <Radio
                      id={option.label}
                      key={option.label}
                      data-testid={option.label}
                      isChecked={value === option.value}
                      name="roles"
                      onChange={() => {
                        onChange(option.value);
                      }}
                      label={option.label}
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
                      onChange={() => {
                        onChange(option);
                        setRequiredWhenSelection(option);
                      }}
                      label={option}
                      className="pf-u-mb-md"
                    />
                  ))}
                </>
              )}
            />
          </FormGroup>
          <FormGroup fieldId="kc-scope-required-when">
            <Controller
              name="scopeRequired"
              control={form.control}
              defaultValue={[]}
              render={({
                onChange,
                value,
              }: {
                onChange: (newValue: string[]) => void;
                value: string[];
              }) => (
                <Select
                  name="scopeRequired"
                  data-testid="required-when-scope-field"
                  variant={SelectVariant.typeaheadMulti}
                  typeAheadAriaLabel="Select"
                  chipGroupProps={{
                    numChips: 3,
                    expandedText: t("common:hide"),
                    collapsedText: t("common:showRemaining"),
                  }}
                  onToggle={(isOpen) => setSelectRequiredForOpen(isOpen)}
                  selections={value}
                  onSelect={(_, selectedValue) => {
                    const option = selectedValue.toString();
                    let changedValue = [""];
                    if (value) {
                      changedValue = value.includes(option)
                        ? value.filter((item) => item !== option)
                        : [...value, option];
                    } else {
                      changedValue = [option];
                    }
                    onChange(changedValue);
                  }}
                  onClear={(selectedValues) => {
                    selectedValues.stopPropagation();
                    onChange([]);
                  }}
                  isOpen={selectRequiredForOpen}
                  isDisabled={requiredWhenSelection === "Always"}
                  aria-labelledby={"scope"}
                >
                  {clientScopes?.map((option) => (
                    <SelectOption key={option.name} value={option.name} />
                  ))}
                </Select>
              )}
            />
          </FormGroup>
        </>
      )}
    </FormAccess>
  );
};
