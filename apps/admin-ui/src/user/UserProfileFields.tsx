import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { Form, FormGroup, Select, SelectOption } from "@patternfly/react-core";

import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { KeycloakTextInput } from "../components/keycloak-text-input/KeycloakTextInput";
import useToggle from "../utils/useToggle";
import { useUserProfile } from "../realm-settings/user-profile/UserProfileContext";

const ROOT_ATTRIBUTES = ["username", "fistName", "lastName", "email"];

export const UserProfileFields = () => {
  const { t } = useTranslation("users");
  const { config } = useUserProfile();
  const { errors, register, control } = useFormContext();
  const [open, toggle] = useToggle();

  const isBundleKey = (displayName?: string) => displayName?.includes("${");
  const unWrap = (key: string) => key.substring(2, key.length - 1);

  const isRootAttribute = (attr?: string) =>
    attr && ROOT_ATTRIBUTES.includes(attr);

  const isSelect = (attribute: UserProfileAttribute) =>
    Object.prototype.hasOwnProperty.call(
      attribute.validations as unknown as Record<string, string[]> | undefined,
      "options"
    );

  const fieldName = (attribute: UserProfileAttribute) =>
    `${isRootAttribute(attribute.name) ? "" : "attribute."}${attribute.name}`;

  return (
    <Form>
      {config?.attributes?.map((attribute) => (
        <FormGroup
          key={attribute.name}
          label={
            isBundleKey(attribute.displayName)
              ? t(unWrap(attribute.displayName!))
              : attribute.displayName
          }
          fieldId={attribute.name}
          isRequired={attribute.required !== undefined}
          validated={errors.username ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          {isSelect(attribute) ? (
            <Controller
              name={fieldName(attribute)}
              defaultValue=""
              control={control}
              render={({ onChange, value }) => (
                <Select
                  toggleId={attribute.name}
                  onToggle={toggle}
                  onSelect={(_, value) => {
                    onChange(value.toString());
                    toggle();
                  }}
                  selections={value}
                  variant="single"
                  aria-label={t("common:selectOne")}
                  isOpen={open}
                >
                  {(
                    attribute.validations as unknown as Record<
                      string,
                      { options: string[] }
                    >
                  ).options.options.map((option) => (
                    <SelectOption selected={value === option} key={option}>
                      {option}
                    </SelectOption>
                  ))}
                </Select>
              )}
            />
          ) : (
            <KeycloakTextInput
              ref={register()}
              type="text"
              id={attribute.name}
              aria-label={attribute.name}
              name={fieldName(attribute)}
            />
          )}
        </FormGroup>
      ))}
    </Form>
  );
};
