import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  InputGroup,
} from "@patternfly/react-core";
import { ExternalLinkSquareAltIcon } from "@patternfly/react-icons";

import { KeycloakTextInput } from "./components/keycloak-text-input/KeycloakTextInput";
import { FormText } from "./components/form-text/FormText";
import { useAccountClient, useFetch } from "../context/fetch";
import { UserRepresentation } from "../representations";
import environment from "../environment";
import { FormSelect } from "./components/form-select/FormSelect";

const emailRegexPattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function AccountPage() {
  const { t } = useTranslation();
  const accountClient = useAccountClient();
  const form = useForm<UserRepresentation>({ mode: "onChange" });
  const {
    features: {
      isRegistrationEmailAsUsername,
      isEditUserNameAllowed,
      updateEmailFeatureEnabled,
      isInternationalizationEnabled,
    },
    availableLocales,
  } = environment;
  const {
    register,
    reset,
    formState: { isValid },
    handleSubmit,
  } = form;

  useFetch(
    (signal) => accountClient.fetchPersonalInfo({ signal }),
    (data) => reset(data),
    [reset]
  );

  const save = (userInfo: UserRepresentation) =>
    accountClient.savePersonalInfo(userInfo);

  const handleEmailUpdate = (action: string) =>
    accountClient.keycloak.login({ action });

  return (
    <Form isHorizontal onSubmit={handleSubmit(save)}>
      <FormProvider {...form}>
        {!isRegistrationEmailAsUsername && (
          <FormText
            name="username"
            isDisabled={isEditUserNameAllowed}
            options={{
              maxLength: {
                value: 254,
                message: t("error-invalid-length-too-long", [
                  t("username"),
                  254,
                ]),
              },
              required: true,
            }}
          />
        )}
        {!updateEmailFeatureEnabled && (
          <FormText
            type="email"
            name="email"
            options={{
              pattern: {
                value: emailRegexPattern,
                message: t("emailInvalid"),
              },
              maxLength: {
                value: 254,
                message: t("error-invalid-length-too-long", [t("email"), 254]),
              },
              required: true,
            }}
          />
        )}
        {updateEmailFeatureEnabled && (
          <FormGroup label={t("email")} fieldId="email-address">
            <InputGroup>
              <KeycloakTextInput
                isDisabled
                type="email"
                id="email-address"
                {...register("email")}
              />
              {(!isRegistrationEmailAsUsername || isEditUserNameAllowed) && (
                <Button
                  id="update-email-btn"
                  variant="link"
                  onClick={() => handleEmailUpdate("UPDATE_EMAIL")}
                  icon={<ExternalLinkSquareAltIcon />}
                  iconPosition="right"
                >
                  {t("updateEmail")}
                </Button>
              )}
            </InputGroup>
          </FormGroup>
        )}
        <FormText name="firstName" options={{ required: true }} />
        <FormText name="lastName" options={{ required: true }} />
        {isInternationalizationEnabled && (
          <FormSelect
            name="selectLocale"
            controller={{ defaultValue: [] }}
            options={availableLocales.map(({ locale, label }) => ({
              key: locale,
              value: label,
            }))}
          />
        )}
      </FormProvider>
      <ActionGroup>
        <Button
          type="submit"
          id="save-btn"
          variant="primary"
          isDisabled={!isValid}
        >
          {t("doSave")}
        </Button>
        <Button id="cancel-btn" variant="link" onClick={() => reset()}>
          {t("doCancel")}
        </Button>
      </ActionGroup>
    </Form>
  );
}
