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
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
import { AddRegistrationProviderParams } from "../routes/AddRegistrationProvider";
import { toClientRegistration } from "../routes/ClientRegistration";

export default function AddProvider() {
  const { t } = useTranslation("clients");
  const { providerId, subTab } = useParams<AddRegistrationProviderParams>();
  const form = useForm<ComponentRepresentation>({
    defaultValues: { providerId },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const { adminClient } = useAdminClient();
  const { realm } = useRealm();
  const { addAlert, addError } = useAlerts();
  const [provider, setProvider] = useState<ComponentTypeRepresentation>();
  const [policy, setPolicy] = useState<ComponentRepresentation>();
  const [parentId, setParentId] = useState("");

  useFetch(
    async () =>
      await Promise.all([
        adminClient.components.find({
          type: "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy",
        }),
        adminClient.realms.getClientRegistrationPolicyProviders({ realm }),
        adminClient.realms.findOne({ realm }),
      ]),
    ([policies, providers, realm]) => {
      setProvider(providers.find((p) => p.id === providerId));
      setPolicy(policies.find((p) => p.providerId === providerId));
      setParentId(realm?.id || "");
    },
    []
  );

  if (!provider) {
    return <KeycloakSpinner />;
  }

  const onSubmit = async (component: ComponentTypeRepresentation) => {
    try {
      await adminClient.components.create({
        ...component,
        subType: subTab,
        parentId,
        providerType: policy?.providerType,
        providerId,
      });
      addAlert(t("providerCreateSuccess"));
    } catch (error) {
      addError("clients:providerCreateError", error);
    }
  };

  return (
    <>
      <ViewHeader titleKey="clients:createPolicy" />
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
