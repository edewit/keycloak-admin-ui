import React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { ActionGroup, Button, PageSection } from "@patternfly/react-core";

import IdentityProviderRepresentation from "keycloak-admin/lib/defs/identityProviderRepresentation";
import { FormAccess } from "../../components/form-access/FormAccess";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useAdminClient } from "../../context/auth/AdminClient";
import { DiscoverySettings } from "./DiscoverySettings";
import { OIDCGeneralSettings } from "./OIDCGeneralSettings";
import { OpenIdConnectSettings } from "./OpenIdConnectSettings";
import { useRealm } from "../../context/realm-context/RealmContext";
import { OIDCAuthentication } from "./OIDCAuthentication";

export const AddOpenIdConnect = () => {
  const { t } = useTranslation("identity-providers");
  const history = useHistory();
  const id = "oidc";

  const form = useForm<IdentityProviderRepresentation>({
    defaultValues: { alias: id },
  });
  const {
    handleSubmit,
    formState: { isDirty },
  } = form;

  const adminClient = useAdminClient();
  const { realm } = useRealm();

  const save = async (provider: IdentityProviderRepresentation) => {
    await adminClient.identityProviders.create({ ...provider, providerId: id });
  };

  return (
    <>
      <ViewHeader titleKey={t("addOpenIdProvider")} />
      <PageSection variant="light">
        <FormProvider {...form}>
          <FormAccess
            role="manage-identity-providers"
            isHorizontal
            onSubmit={handleSubmit(save)}
          >
            <OIDCGeneralSettings />
            <OpenIdConnectSettings />
            <DiscoverySettings />
            <OIDCAuthentication />
            <ActionGroup>
              <Button
                isDisabled={!isDirty}
                variant="primary"
                type="submit"
                data-testid="createProvider"
              >
                {t("common:add")}
              </Button>
              <Button
                variant="link"
                data-testid="cancel"
                onClick={() => history.push(`/${realm}/identity-providers`)}
              >
                {t("common:cancel")}
              </Button>
            </ActionGroup>
          </FormAccess>
        </FormProvider>
      </PageSection>
    </>
  );
};
