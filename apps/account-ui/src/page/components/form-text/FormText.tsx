import { useTranslation } from "react-i18next";
import { RegisterOptions, useFormContext } from "react-hook-form";
import { FormGroup, ValidatedOptions } from "@patternfly/react-core";
import {
  KeycloakTextInput,
  KeycloakTextInputProps,
} from "../keycloak-text-input/KeycloakTextInput";

type FormTextProps = Omit<KeycloakTextInputProps, "name"> & {
  name: string;
  options?: RegisterOptions;
};

export const FormText = ({ name, options, ...rest }: FormTextProps) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <FormGroup
      isRequired={options?.required === true}
      label={t(name)}
      fieldId={name}
      helperTextInvalid={errors[name]?.message}
      validated={
        errors[name] ? ValidatedOptions.error : ValidatedOptions.default
      }
    >
      <KeycloakTextInput
        isRequired={options?.required === true}
        id={name}
        validated={
          errors[name] ? ValidatedOptions.error : ValidatedOptions.default
        }
        {...rest}
        {...register(name, options)}
      />
    </FormGroup>
  );
};
