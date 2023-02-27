import { FormGroup, Select, SelectOption } from "@patternfly/react-core";
import { TFuncKey } from "i18next";
import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeycloakTextInput } from "ui-shared";
import { UserProfileAttributeMetadata } from "../api/representations";

const ROOT_ATTRIBUTES = ["username", "firstName", "lastName", "email"];

type FormFieldProps = {
  attribute: UserProfileAttributeMetadata;
};

export const FormField = ({ attribute }: FormFieldProps) => {
  const { t } = useTranslation();
  const {
    formState: { errors },
    register,
    control,
  } = useFormContext();
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  const isBundleKey = (displayName?: string) => displayName?.includes("${");
  const unWrap = (key: string) => key.substring(2, key.length - 1);

  const isSelect = (attribute: UserProfileAttributeMetadata) =>
    Object.hasOwn(attribute.validators, "options");

  const isRootAttribute = (attr?: string) =>
    attr && ROOT_ATTRIBUTES.includes(attr);

  const fieldName = (attribute: UserProfileAttributeMetadata) =>
    `${isRootAttribute(attribute.name) ? "" : "attributes."}${attribute.name}`;

  return (
    <FormGroup
      key={attribute.name}
      label={
        (isBundleKey(attribute.displayName)
          ? t(unWrap(attribute.displayName) as TFuncKey)
          : attribute.displayName) || attribute.name
      }
      fieldId={attribute.name}
      isRequired={attribute.required}
      validated={errors.username ? "error" : "default"}
      helperTextInvalid={t("required")}
    >
      {isSelect(attribute) ? (
        <Controller
          name={fieldName(attribute)}
          defaultValue=""
          control={control}
          render={({ field }) => (
            <Select
              toggleId={attribute.name}
              onToggle={toggle}
              onSelect={(_, value) => {
                field.onChange(value.toString());
                toggle();
              }}
              selections={field.value}
              variant="single"
              aria-label={t("selectOne")}
              isOpen={open}
            >
              {[
                <SelectOption key="empty" value="">
                  {t("choose")}
                </SelectOption>,
                ...(
                  attribute.validators.options as { options: string[] }
                ).options.map((option) => (
                  <SelectOption
                    selected={field.value === option}
                    key={option}
                    value={option}
                  >
                    {option}
                  </SelectOption>
                )),
              ]}
            </Select>
          )}
        />
      ) : (
        <KeycloakTextInput
          id={attribute.name}
          {...register(fieldName(attribute))}
        />
      )}
    </FormGroup>
  );
};
