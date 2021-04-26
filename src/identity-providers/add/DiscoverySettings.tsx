import React from "react";
import { useTranslation } from "react-i18next";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Form,
  FormGroup,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";

import { SwitchField } from "../component/SwitchField";
import { TextField } from "../component/TextField";

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

  return (
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
      <TextField field="config.userInfoUrl" label="userInfoUrl" />
      <TextField field="config.issuer" label="issuer" />
      <SwitchField field="config.validateSignature" label="validateSignature" />
      {validateSignature === "true" && (
        <>
          <SwitchField field="config.useJwksUrl" label="useJwksUrl" />
          {useJwks === "true" && (
            <TextField field="config.jwksUrl" label="jwksUrl" />
          )}
        </>
      )}
    </Form>
  );
};
