import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormGroup,
  Switch,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";
import { HelpItem } from "../../components/help-enabler/HelpItem";

export const X509 = () => {
  const { t } = useTranslation("clients");
  const { register, control, errors } = useFormContext();
  return (
    <>
      <FormGroup
        label={t("allowRegexComparison")}
        labelIcon={
          <HelpItem
            helpText="clients-help:allowRegexComparison"
            fieldLabelId="clients:allowRegexComparison"
          />
        }
        fieldId="allowRegexComparison"
        hasNoPaddingTop
      >
        <Controller
          name="attributes.x509.allow.regex.pattern.comparison"
          defaultValue="false"
          control={control}
          render={({ onChange, value }) => (
            <Switch
              id="allowRegexComparison"
              label={t("common:on")}
              labelOff={t("common:off")}
              isChecked={value === "true"}
              onChange={(value) => onChange(value.toString())}
            />
          )}
        />
      </FormGroup>
      <FormGroup
        label={t("subject")}
        fieldId="kc-subject"
        labelIcon={
          <HelpItem
            helpText="clients-help:subject"
            fieldLabelId="clients:subject"
          />
        }
        helperTextInvalid={t("common:required")}
        validated={
          errors.attributes?.["x509.subjectdn"]
            ? ValidatedOptions.error
            : ValidatedOptions.default
        }
        isRequired
      >
        <TextInput
          ref={register({ required: true })}
          type="text"
          id="kc-subject"
          name="attributes.x509.subjectdn"
          validated={
            errors.attributes?.["x509.subjectdn"]
              ? ValidatedOptions.error
              : ValidatedOptions.default
          }
        />
      </FormGroup>
    </>
  );
};
