import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import {
  ActionGroup,
  AlertVariant,
  Button,
  FormGroup,
  PageSection,
  TextInput,
} from "@patternfly/react-core";

import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { ProviderRouteParams } from "../routes/NewProvider";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { FormAccess } from "../../components/form-access/FormAccess";
import { toUserFederation } from "../routes/UserFederation";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useAlerts } from "../../components/alert/Alerts";
import { SettingsCache } from "../shared/SettingsCache";
import { ExtendedHeader } from "../shared/ExtendedHeader";

import "./custom-provider-settings.css";

export default function CustomProviderSettings() {
  const { t } = useTranslation("user-federation");
  const { id, providerId } = useParams<ProviderRouteParams>();
  const history = useHistory();
  const form = useForm<ComponentRepresentation>({
    mode: "onChange",
  });
  const {
    register,
    errors,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = form;

  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const { realm } = useRealm();

  useFetch(
    async () => {
      if (id) {
        return await adminClient.components.findOne({ id });
      }
      return undefined;
    },
    (fetchedComponent) => {
      if (fetchedComponent) {
        reset({ ...fetchedComponent });
      } else if (id) {
        throw new Error(t("common:notFound"));
      }
    },
    []
  );

  const save = async (component: ComponentRepresentation) => {
    const saveComponent = {
      ...component,
      providerId,
      providerType: "org.keycloak.storage.UserStorageProvider",
      parentId: realm,
    };
    try {
      if (!id) {
        await adminClient.components.create(saveComponent);
        history.push(toUserFederation({ realm }));
      } else {
        await adminClient.components.update({ id }, saveComponent);
      }
      reset({ ...component });
      addAlert(t(!id ? "createSuccess" : "saveSuccess"), AlertVariant.success);
    } catch (error) {
      addError(`user-federation:${!id ? "createError" : "saveError"}`, error);
    }
  };

  return (
    <FormProvider {...form}>
      <ExtendedHeader provider={providerId} save={() => handleSubmit(save)()} />
      <PageSection variant="light">
        <FormAccess
          role="manage-realm"
          isHorizontal
          className="keycloak__user-federation__custom-form"
          onSubmit={handleSubmit(save)}
        >
          <FormGroup
            label={t("consoleDisplayName")}
            labelIcon={
              <HelpItem
                helpText="users-federation-help:consoleDisplayNameHelp"
                fieldLabelId="users-federation:consoleDisplayName"
              />
            }
            helperTextInvalid={t("validateName")}
            validated={errors.name ? "error" : "default"}
            fieldId="kc-console-display-name"
            isRequired
          >
            <TextInput
              isRequired
              type="text"
              id="kc-console-display-name"
              name="name"
              ref={register({
                required: true,
              })}
              data-testid="console-name"
              validated={errors.name ? "error" : "default"}
            />
          </FormGroup>
          <SettingsCache form={form} unWrap />
          <ActionGroup>
            <Button
              isDisabled={!isDirty}
              variant="primary"
              type="submit"
              data-testid="custom-save"
            >
              {t("common:save")}
            </Button>
            <Button
              variant="link"
              onClick={() => history.push(toUserFederation({ realm }))}
              data-testid="custom-cancel"
            >
              {t("common:cancel")}
            </Button>
          </ActionGroup>
        </FormAccess>
      </PageSection>
    </FormProvider>
  );
}
