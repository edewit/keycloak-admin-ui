import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import {
  ClipboardCopy,
  FormGroup,
  NumberInput,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";

import { HelpItem } from "../../components/help-enabler/HelpItem";
import { useParams } from "react-router-dom";

type GeneralSettingsProps = {
  callbackUrl: string;
};

export const GeneralSettings = ({ callbackUrl }: GeneralSettingsProps) => {
  const { t } = useTranslation("identity-providers");
  const { t: th } = useTranslation("identity-providers-help");
  const { id } = useParams<{ id: string }>();

  const { register, control, errors } = useFormContext();

  return (
    <>
      <FormGroup
        label={t("redirectURI")}
        labelIcon={
          <HelpItem
            helpText={th("redirectURI")}
            forLabel={t("redirectURI")}
            forID="kc-redirect-uri"
          />
        }
        fieldId="kc-redirect-uri"
      >
        <ClipboardCopy
          isReadOnly
        >{`${callbackUrl}/${id}/endpoint`}</ClipboardCopy>
      </FormGroup>
      <FormGroup
        label={t("clientId")}
        labelIcon={
          <HelpItem
            helpText={th("clientId")}
            forLabel={t("clientId")}
            forID="kc-client-id"
          />
        }
        fieldId="kc-client-id"
        isRequired
        validated={
          errors.config && errors.config.clientId
            ? ValidatedOptions.error
            : ValidatedOptions.default
        }
        helperTextInvalid={t("common:required")}
      >
        <TextInput
          isRequired
          type="text"
          id="kc-client-id"
          data-testid="clientId"
          name="config.clientId"
          ref={register({ required: true })}
        />
      </FormGroup>
      <FormGroup
        label={t("clientSecret")}
        labelIcon={
          <HelpItem
            helpText={th("clientSecret")}
            forLabel={t("clientSecret")}
            forID="kc-client-secret"
          />
        }
        fieldId="kc-client-secret"
        isRequired
        validated={
          errors.config && errors.config.clientSecret
            ? ValidatedOptions.error
            : ValidatedOptions.default
        }
        helperTextInvalid={t("common:required")}
      >
        <TextInput
          isRequired
          type="password"
          id="kc-client-secret"
          data-testid="clientSecret"
          name="config.clientSecret"
          ref={register({ required: true })}
        />
      </FormGroup>
      <FormGroup
        label={t("displayOrder")}
        labelIcon={
          <HelpItem
            helpText={th("displayOrder")}
            forLabel={t("displayOrder")}
            forID="kc-display-order"
          />
        }
        fieldId="kc-display-order"
      >
        <Controller
          name="config.guiOrder"
          control={control}
          defaultValue={0}
          render={({ onChange, value }) => (
            <NumberInput
              value={value}
              data-testid="displayOrder"
              onMinus={() => onChange(value - 1)}
              onChange={onChange}
              onPlus={() => onChange(value + 1)}
              inputName="input"
              inputAriaLabel={t("displayOrder")}
              minusBtnAriaLabel={t("common:minus")}
              plusBtnAriaLabel={t("common:plus")}
            />
          )}
        />
      </FormGroup>
    </>
  );
};
