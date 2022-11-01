import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { Form, FormGroup } from "@patternfly/react-core";

import { KeycloakTextInput } from "../components/keycloak-text-input/KeycloakTextInput";
import { useUserProfile } from "../realm-settings/user-profile/UserProfileContext";

export const UserProfileFields = () => {
  const { t } = useTranslation("users");
  const { config } = useUserProfile();
  const { errors, register } = useFormContext();

  const isBundleKey = (displayName?: string) => displayName?.includes("${");
  const unWrap = (key: string) => key.substring(2, key.length - 1);

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
          fieldId="kc-username"
          isRequired
          validated={errors.username ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          <KeycloakTextInput
            ref={register()}
            type="text"
            id="kc-username"
            aria-label={t("username")}
            name={`attributes.${attribute.name}`}
          />
        </FormGroup>
      ))}
    </Form>
  );
};
