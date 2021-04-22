import { PageSection } from "@patternfly/react-core";
import IdentityProviderRepresentation from "keycloak-admin/lib/defs/identityProviderRepresentation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { FormAccess } from "../../components/form-access/FormAccess";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useAdminClient } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { getBaseUrl, toUpperCase } from "../../util";
import { DiscoverySettings } from "./DiscoverySettings";
import { GeneralSettings } from "./GeneralSettings";
import { OpenIdConnectSettings } from "./OpenIdConnectSettings";

export const DetailSettings = () => {
  const { t } = useTranslation("identity-providers");
  const { id } = useParams<{ id: string }>();

  const form = useForm<IdentityProviderRepresentation>();
  const { handleSubmit } = form;

  const adminClient = useAdminClient();
  const { realm } = useRealm();

  const callbackUrl = `${getBaseUrl(adminClient)}/realms/${realm}/broker`;

  const save = (provider: IdentityProviderRepresentation) => {
    console.log(provider);
  };

  return (
    <>
      <ViewHeader
        titleKey={t("addIdentityProvider", { provider: toUpperCase(id) })}
      />
      <PageSection variant="light">
        <FormProvider {...form}>
          <FormAccess
            role="manage-identity-providers"
            isHorizontal
            onSubmit={handleSubmit(save)}
          >
            <GeneralSettings callbackUrl={callbackUrl} />
            <OpenIdConnectSettings />
            <DiscoverySettings />
          </FormAccess>
        </FormProvider>
      </PageSection>
    </>
  );
};
