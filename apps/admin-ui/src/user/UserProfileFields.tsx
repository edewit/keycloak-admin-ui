import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
  FormGroup,
  Select,
  SelectOption,
} from "@patternfly/react-core";

import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import type { UserProfileAttributeRequired } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { KeycloakTextInput } from "../components/keycloak-text-input/KeycloakTextInput";
import { useUserProfile } from "../realm-settings/user-profile/UserProfileContext";
import useToggle from "../utils/useToggle";
import { Fragment, useMemo } from "react";

const ROOT_ATTRIBUTES = ["username", "fistName", "lastName", "email"];

export const UserProfileFields = () => {
  const { config } = useUserProfile();

  const attributes = useMemo(
    () =>
      config?.attributes?.sort((a, b) => {
        if ((a.group || "") > (b.group || "")) {
          return 1;
        } else if ((a.group || "") < (b.group || "")) {
          return -1;
        } else {
          return 0;
        }
      }),
    [config]
  );

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {[{ name: "" }, ...(config?.groups || [])].map((g) => (
        <FormFieldGroupExpandable
          key={g.name}
          label={g.displayHeader}
          header={
            <FormFieldGroupHeader
              titleText={{ text: g.displayHeader, id: g.name! }}
              titleDescription={g.displayDescription}
            />
          }
          isExpanded
        >
          {attributes?.map((attribute) => (
            <Fragment key={attribute.name}>
              {(attribute.group || "") === g.name && (
                <FormField attribute={attribute} />
              )}
            </Fragment>
          ))}
        </FormFieldGroupExpandable>
      ))}
    </>
  );
};

const FormField = ({ attribute }: { attribute: UserProfileAttribute }) => {
  const { t } = useTranslation("users");
  const { errors, register, control } = useFormContext();
  const [open, toggle] = useToggle();

  const isBundleKey = (displayName?: string) => displayName?.includes("${");
  const unWrap = (key: string) => key.substring(2, key.length - 1);

  const isSelect = (attribute: UserProfileAttribute) =>
    Object.prototype.hasOwnProperty.call(
      attribute.validations || {},
      "options"
    );

  const isRootAttribute = (attr?: string) =>
    attr && ROOT_ATTRIBUTES.includes(attr);

  const isRequired = (required: UserProfileAttributeRequired | undefined) =>
    Object.keys(required || {}).length !== 0;

  const fieldName = (attribute: UserProfileAttribute) =>
    `${isRootAttribute(attribute.name) ? "" : "attributes."}${attribute.name}`;

  return (
    <FormGroup
      key={attribute.name}
      label={
        (isBundleKey(attribute.displayName)
          ? t(unWrap(attribute.displayName!))
          : attribute.displayName) || attribute.name
      }
      fieldId={attribute.name}
      isRequired={isRequired(attribute.required)}
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
              {[
                <SelectOption key="empty" value="">
                  {t("common:choose")}
                </SelectOption>,
                ...(
                  attribute.validations?.options as { options: string[] }
                ).options.map((option) => (
                  <SelectOption
                    selected={value === option}
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
          ref={register()}
          type="text"
          id={attribute.name}
          aria-label={attribute.name}
          name={fieldName(attribute)}
        />
      )}
    </FormGroup>
  );
};
