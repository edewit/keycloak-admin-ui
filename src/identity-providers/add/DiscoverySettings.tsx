import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  ExpandableSection,
  Form,
  FormGroup,
  NumberInput,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";

import { HelpItem } from "../../components/help-enabler/HelpItem";
import { SwitchField } from "../component/SwitchField";
import { TextField } from "../component/TextField";
import { FormGroupField } from "../component/FormGroupField";

const promptOptions = [
  "unspecified",
  "none",
  "consent",
  "login",
  "select_account",
];

export const DiscoverySettings = () => {
  const { t } = useTranslation("identity-providers");
  const { register, control, errors } = useFormContext();

  const validateSignature = useWatch({
    control: control,
    name: "config.validateSignature",
  });
  const useJwks = useWatch({
    control: control,
    name: "config.useJwksUrl",
  });
  const [promptOpen, setPromptOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      toggleText={isExpanded ? t("hideMetaData") : t("showMetaData")}
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
    >
      <Form isHorizontal>
        <FormGroup
          label={t("authorizationUrl")}
          fieldId="kc-authorization-url"
          isRequired
          validated={
            errors.config && errors.config.authorizationUrl
              ? ValidatedOptions.error
              : ValidatedOptions.default
          }
          helperTextInvalid={t("common:required")}
        >
          <TextInput
            type="text"
            id="kc-authorization-url"
            name="config.authorizationUrl"
            ref={register({ required: true })}
            validated={
              errors.config && errors.config.authorizationUrl
                ? ValidatedOptions.error
                : ValidatedOptions.default
            }
          />
        </FormGroup>
        <SwitchField label="passLoginHint" field="config.loginHint" />
        <SwitchField label="passCurrentLocale" field="config.uiLocales" />
        <FormGroup
          label={t("tokenUrl")}
          fieldId="tokenUrl"
          isRequired
          validated={
            errors.config && errors.config.tokenUrl
              ? ValidatedOptions.error
              : ValidatedOptions.default
          }
          helperTextInvalid={t("common:required")}
        >
          <TextInput
            type="text"
            id="tokenUrl"
            name="config.tokenUrl"
            ref={register({ required: true })}
            validated={
              errors.config && errors.config.tokenUrl
                ? ValidatedOptions.error
                : ValidatedOptions.default
            }
          />
        </FormGroup>
        <TextField field="config.logoutUrl" label="logoutUrl" />
        <SwitchField
          field="config.backchannelSupported"
          label="backchannelLogout"
        />
        <SwitchField field="config.disableUserInfo" label="disableUserInfo" />
        <TextField field="config.userInfoUrl" label="userInfoUrl" />
        <TextField field="config.issuer" label="issuer" />
        <FormGroupField label="prompt">
          <Controller
            name="config.prompt"
            defaultValue={promptOptions[0]}
            control={control}
            render={({ onChange, value }) => (
              <Select
                toggleId="prompt"
                required
                onToggle={() => setPromptOpen(!promptOpen)}
                onSelect={(_, value) => {
                  onChange(value as string);
                  setPromptOpen(false);
                }}
                selections={value}
                variant={SelectVariant.single}
                aria-label={t("prompt")}
                isOpen={promptOpen}
              >
                {promptOptions.map((option) => (
                  <SelectOption
                    selected={option === value}
                    key={option}
                    value={option}
                  >
                    {t(`prompts.${option}`)}
                  </SelectOption>
                ))}
              </Select>
            )}
          />
        </FormGroupField>
        <SwitchField
          field="config.acceptsPromptNoneForwardFromClient"
          label="acceptsPromptNone"
        />
        <SwitchField
          field="config.validateSignature"
          label="validateSignature"
        />
        {validateSignature === "true" && (
          <>
            <SwitchField field="config.useJwksUrl" label="useJwksUrl" />
            {useJwks === "true" && (
              <TextField field="config.jwksUrl" label="jwksUrl" />
            )}
          </>
        )}
        <FormGroup
          label={t("allowedClockSkew")}
          labelIcon={
            <HelpItem
              helpText={"identity-providers-help:allowedClockSkew"}
              forLabel={t("allowedClockSkew")}
              forID="allowedClockSkew"
            />
          }
          fieldId="allowedClockSkew"
        >
          <Controller
            name="config.allowedClockSkew"
            control={control}
            defaultValue={0}
            render={({ onChange, value }) => (
              <NumberInput
                value={value}
                data-testid="allowedClockSkew"
                onMinus={() => onChange(value - 1)}
                onChange={onChange}
                onPlus={() => onChange(value + 1)}
                inputName="input"
                inputAriaLabel={t("allowedClockSkew")}
                minusBtnAriaLabel={t("common:minus")}
                plusBtnAriaLabel={t("common:plus")}
                min={0}
                unit={t("common:times.seconds")}
              />
            )}
          />
        </FormGroup>
        <TextField field="config.forwardParameters" label="forwardParameters" />
      </Form>
    </ExpandableSection>
  );
};
