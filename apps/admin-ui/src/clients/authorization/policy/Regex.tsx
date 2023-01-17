import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form-v7";
import { FormGroup } from "@patternfly/react-core";

import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { KeycloakTextInput } from "../../../components/keycloak-text-input/KeycloakTextInput";

export const Regex = () => {
  const { t } = useTranslation("clients");
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <FormGroup
        label={t("targetClaim")}
        fieldId="targetClaim"
        helperTextInvalid={t("common:required")}
        validated={errors.targetClaim ? "error" : "default"}
        isRequired
        labelIcon={
          <HelpItem
            helpText="clients-help:targetClaim"
            fieldLabelId="clients:targetClaim"
          />
        }
      >
        <KeycloakTextInput
          id="targetClaim"
          data-testid="targetClaim"
          {...register("targetClaim", { required: true })}
          validated={errors.targetClaim ? "error" : "default"}
        />
      </FormGroup>
      <FormGroup
        label={t("regexPattern")}
        fieldId="pattern"
        labelIcon={
          <HelpItem
            helpText="clients-help:regexPattern"
            fieldLabelId="clients:regexPattern"
          />
        }
        isRequired
        validated={errors.pattern ? "error" : "default"}
        helperTextInvalid={t("common:required")}
      >
        <KeycloakTextInput
          {...register("pattern", { required: true })}
          id="pattern"
          data-testid="regexPattern"
          validated={errors.pattern ? "error" : "default"}
        />
      </FormGroup>
    </>
  );
};
