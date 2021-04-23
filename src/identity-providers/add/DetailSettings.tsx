import { PageSection } from "@patternfly/react-core";
import IdentityProviderRepresentation from "keycloak-admin/lib/defs/identityProviderRepresentation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { FormAccess } from "../../components/form-access/FormAccess";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useAdminClient } from "../../context/auth/AdminClient";
import { toUpperCase } from "../../util";
import { GeneralSettings } from "./GeneralSettings";

export const DetailSettings = () => {
  const { t } = useTranslation("identity-providers");
  const { id } = useParams<{ id: string }>();

  const form = useForm<IdentityProviderRepresentation>();
  const { handleSubmit } = form;

  const adminClient = useAdminClient();

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
            <GeneralSettings />
          </FormAccess>
        </FormProvider>
      </PageSection>
    </>
  );
};
