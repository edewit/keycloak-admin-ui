import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useErrorHandler } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { PageSection } from "@patternfly/react-core";

import IdentityProviderRepresentation from "keycloak-admin/lib/defs/identityProviderRepresentation";
import { FormAccess } from "../../components/form-access/FormAccess";
import { ScrollForm } from "../../components/scroll-form/ScrollForm";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import {
  asyncStateFetch,
  useAdminClient,
} from "../../context/auth/AdminClient";
import { toUpperCase } from "../../util";
import { GeneralSettings } from "./GeneralSettings";
import { AdvancedSettings } from "./AdvancedSettings";

export const DetailSettings = () => {
  const { t } = useTranslation("identity-providers");
  const { id } = useParams<{ id: string }>();

  const form = useForm<IdentityProviderRepresentation>();
  const { handleSubmit, setValue } = form;

  const adminClient = useAdminClient();
  const errorHandler = useErrorHandler();

  useEffect(() =>
    asyncStateFetch(
      () => adminClient.identityProviders.findOne({ alias: id }),
      (provider) => {
        Object.entries(provider).map((entry) => setValue(entry[0], entry[1]));
      },
      errorHandler
    )
  );

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
          <ScrollForm
            className="pf-u-px-lg"
            sections={[t("generalSettings"), t("advancedSettings")]}
          >
            <FormAccess
              role="manage-identity-providers"
              isHorizontal
              onSubmit={handleSubmit(save)}
            >
              <GeneralSettings />
            </FormAccess>
            <FormAccess
              role="manage-identity-providers"
              isHorizontal
              onSubmit={handleSubmit(save)}
            >
              <AdvancedSettings />
            </FormAccess>
          </ScrollForm>
        </FormProvider>
      </PageSection>
    </>
  );
};
