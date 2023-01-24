import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import {
  ActionGroup,
  Button,
  FormGroup,
  PageSection,
  ValidatedOptions,
} from "@patternfly/react-core";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAlerts } from "../../components/alert/Alerts";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { FormAccess } from "../../components/form-access/FormAccess";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { KeycloakSpinner } from "../../components/keycloak-spinner/KeycloakSpinner";
import { KeycloakTextInput } from "../../components/keycloak-text-input/KeycloakTextInput";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useParams } from "../../utils/useParams";
import {
  AddRegistrationProviderParams,
  toAddRegistrationProviderTab,
} from "../routes/AddRegistrationProvider";
import { toClientRegistration } from "../routes/ClientRegistration";

export default function AddProvider() {
  const { t } = useTranslation("clients");
  const { id, providerId, subTab } = useParams<AddRegistrationProviderParams>();
  const navigate = useNavigate();
  const form = useForm<ComponentRepresentation>({
    defaultValues: { providerId },
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const { adminClient } = useAdminClient();
  const { realm } = useRealm();
  const { addAlert, addError } = useAlerts();
  const [provider, setProvider] = useState<ComponentTypeRepresentation>();
  const [parentId, setParentId] = useState("");

  useFetch(
    async () =>
      await Promise.all([
        adminClient.realms.getClientRegistrationPolicyProviders({ realm }),
        adminClient.realms.findOne({ realm }),
        id ? adminClient.components.findOne({ id }) : Promise.resolve(),
      ]),
    ([providers, realm, data]) => {
      setProvider(providers.find((p) => p.id === providerId));
      setParentId(realm?.id || "");
      reset(data || { providerId });
    },
    []
  );

  const providerName = useWatch({ control, defaultValue: "", name: "name" });

  if (!provider) {
    return <KeycloakSpinner />;
  }

  const onSubmit = async (component: ComponentRepresentation) => {
    if (component.config)
      Object.entries(component.config).forEach(
        ([key, value]) =>
          (component.config![key] = Array.isArray(value) ? value : [value])
      );
    try {
      const updatedComponent = {
        ...component,
        subType: subTab,
        parentId,
        providerType:
          "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy",
        providerId,
      };
      if (id) {
        await adminClient.components.update({ id }, updatedComponent);
      } else {
        const { id } = await adminClient.components.create(updatedComponent);
        navigate(
          toAddRegistrationProviderTab({ id, realm, subTab, providerId })
        );
      }
      addAlert(t("providerCreateSuccess"));
    } catch (error) {
      addError("clients:providerCreateError", error);
    }
  };

  return (
    <>
      <ViewHeader
        titleKey={id ? providerName : "clients:createPolicy"}
        subKey={id}
      />
      <PageSection variant="light">
        <FormAccess
          role="manage-clients"
          isHorizontal
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormGroup label={t("provider")} fieldId="provider">
            <KeycloakTextInput
              id="providerId"
              data-testid="providerId"
              name="providerId"
              ref={register()}
              readOnly
            />
          </FormGroup>
          <FormGroup
            label={t("common:name")}
            fieldId="kc-name"
            helperTextInvalid={t("common:required")}
            validated={
              errors.name ? ValidatedOptions.error : ValidatedOptions.default
            }
            labelIcon={
              <HelpItem
                helpText="clients-help:clientPolicyName"
                fieldLabelId="kc-name"
              />
            }
            isRequired
          >
            <KeycloakTextInput
              id="kc-name"
              data-testid="name"
              name="name"
              validated={
                errors.name ? ValidatedOptions.error : ValidatedOptions.default
              }
              ref={register({ required: true })}
            />
          </FormGroup>
          <FormProvider {...form}>
            <DynamicComponents properties={provider.properties} />
          </FormProvider>
          <ActionGroup>
            <Button data-testid="save" type="submit">
              {t("common:save")}
            </Button>
            <Button
              variant="link"
              component={(props) => (
                <Link
                  {...props}
                  to={toClientRegistration({ realm, subTab })}
                ></Link>
              )}
            >
              {t("common:cancel")}
            </Button>
          </ActionGroup>
        </FormAccess>
      </PageSection>
    </>
  );
}
