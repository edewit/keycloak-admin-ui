import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useErrorHandler } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import {
  AlertVariant,
  PageSection,
  Tab,
  TabTitleText,
} from "@patternfly/react-core";

import ClientScopeRepresentation from "keycloak-admin/lib/defs/clientScopeRepresentation";
import {
  useAdminClient,
  asyncStateFetch,
} from "../../context/auth/AdminClient";
import { KeycloakTabs } from "../../components/keycloak-tabs/KeycloakTabs";
import { useAlerts } from "../../components/alert/Alerts";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { convertFormValuesToObject, convertToFormValues } from "../../util";
import { MapperList } from "../details/MapperList";
import { ScopeForm } from "../details/ScopeForm";
import { RoleMapping, Row } from "../../components/role-mapping/RoleMapping";

export const ClientScopeForm = () => {
  const { t } = useTranslation("client-scopes");
  const form = useForm<ClientScopeRepresentation>();
  const { setValue } = form;
  const [clientScope, setClientScope] = useState<ClientScopeRepresentation>();

  const adminClient = useAdminClient();
  const handleError = useErrorHandler();
  const { id } = useParams<{ id: string }>();

  const { addAlert } = useAlerts();

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  useEffect(() => {
    return asyncStateFetch(
      async () => {
        if (id) {
          const data = await adminClient.clientScopes.findOne({ id });
          if (data) {
            Object.entries(data).map((entry) => {
              if (entry[0] === "attributes") {
                convertToFormValues(entry[1], "attributes", setValue);
              }
              setValue(entry[0], entry[1]);
            });
          }

          return data;
        }
      },
      (data) => setClientScope(data),
      handleError
    );
  }, [key]);

  const loader = async () => {
    const assignedRoles = await adminClient.clientScopes.listCompositeRealmScopeMappings(
      { id }
    );
    const clients = await adminClient.clients.find();

    const clientRoles = await Promise.all(
      clients.map(async (client) => {
        const clientScope = await adminClient.clientScopes.listCompositeClientScopeMappings(
          { id, client: client.id! }
        );
        return {
          client,
          role: clientScope,
        };
      })
    );

    return [
      ...assignedRoles.map((role) => {
        return {
          role,
        };
      }),
      ...clientRoles,
    ];
  };

  const save = async (clientScopes: ClientScopeRepresentation) => {
    try {
      clientScopes.attributes = convertFormValuesToObject(
        clientScopes.attributes!
      );

      if (id) {
        await adminClient.clientScopes.update({ id }, clientScopes);
      } else {
        await adminClient.clientScopes.create(clientScopes);
      }
      addAlert(t((id ? "update" : "create") + "Success"), AlertVariant.success);
    } catch (error) {
      addAlert(
        t((id ? "update" : "create") + "Error", { error }),
        AlertVariant.danger
      );
    }
  };

  return (
    <>
      <ViewHeader
        titleKey={
          clientScope ? clientScope.name! : "client-scopes:createClientScope"
        }
        subKey="client-scopes:clientScopeExplain"
        badge={clientScope ? clientScope.protocol : undefined}
        divider={!id}
      />

      <PageSection variant="light">
        <FormProvider {...form}>
          {!id && <ScopeForm save={save} />}
          {id && (
            <KeycloakTabs isBox>
              <Tab
                eventKey="settings"
                title={<TabTitleText>{t("common:settings")}</TabTitleText>}
              >
                <ScopeForm save={save} />
              </Tab>
              <Tab
                eventKey="mappers"
                title={<TabTitleText>{t("common:mappers")}</TabTitleText>}
              >
                {clientScope && (
                  <MapperList clientScope={clientScope} refresh={refresh} />
                )}
              </Tab>
              <Tab
                eventKey="scope"
                title={<TabTitleText>{t("scope")}</TabTitleText>}
              >
                <RoleMapping
                  loader={loader}
                  save={() => Promise.resolve()}
                  onHideRolesToggle={() => {}}
                />
              </Tab>
            </KeycloakTabs>
          )}
        </FormProvider>
      </PageSection>
    </>
  );
};
