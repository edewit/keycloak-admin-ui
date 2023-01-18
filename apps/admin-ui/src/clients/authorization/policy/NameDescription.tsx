import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form-v7";
import { FormGroup, ValidatedOptions } from "@patternfly/react-core";

import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { KeycloakTextInput } from "../../../components/keycloak-text-input/KeycloakTextInput";
import { KeycloakTextArea } from "../../../components/keycloak-text-area/KeycloakTextArea";

type NameDescriptionProps = {
  prefix: string;
};

export const NameDescription = ({ prefix }: NameDescriptionProps) => {
  const { t } = useTranslation("clients");
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <FormGroup
        label={t("common:name")}
        fieldId="kc-name"
        helperTextInvalid={t("common:required")}
        validated={
          errors.name ? ValidatedOptions.error : ValidatedOptions.default
        }
        isRequired
        labelIcon={
          <HelpItem
            helpText={`clients-help:${prefix}-name`}
            fieldLabelId="name"
          />
        }
      >
        <KeycloakTextInput
          id="kc-name"
          data-testid="name"
          validated={
            errors.name ? ValidatedOptions.error : ValidatedOptions.default
          }
          {...register("name", { required: true })}
        />
      </FormGroup>
      <FormGroup
        label={t("common:description")}
        fieldId="kc-description"
        labelIcon={
          <HelpItem
            helpText={`clients-help:${prefix}-description`}
            fieldLabelId="description"
          />
        }
        validated={
          errors.description ? ValidatedOptions.error : ValidatedOptions.default
        }
        helperTextInvalid={errors.description?.message}
      >
        <KeycloakTextArea
          id="kc-description"
          data-testid="description"
          validated={
            errors.description
              ? ValidatedOptions.error
              : ValidatedOptions.default
          }
          {...register("description", {
            maxLength: {
              value: 255,
              message: t("common:maxLength", { length: 255 }),
            },
          })}
        />
      </FormGroup>
    </>
  );
};
