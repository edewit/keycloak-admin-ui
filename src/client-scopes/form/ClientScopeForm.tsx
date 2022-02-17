import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertVariant,
  ButtonVariant,
  DropdownItem,
  PageSection,
  Tab,
  TabTitleText,
} from "@patternfly/react-core";

import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { KeycloakTabs } from "../../components/keycloak-tabs/KeycloakTabs";
import { useAlerts } from "../../components/alert/Alerts";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { KeycloakSpinner } from "../../components/keycloak-spinner/KeycloakSpinner";
import { convertFormValuesToObject } from "../../util";
import { MapperList } from "../details/MapperList";
import { ScopeForm } from "../details/ScopeForm";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import {
  mapRoles,
  RoleMapping,
  Row,
} from "../../components/role-mapping/RoleMapping";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import {
  AllClientScopes,
  changeScope,
  ClientScopeDefaultOptionalType,
} from "../../components/client-scope/ClientScopeTypes";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { toMapper } from "../routes/Mapper";
import { toClientScope } from "../routes/ClientScope";

export default function ClientScopeForm() {
  const { t } = useTranslation("client-scopes");
  const [clientScope, setClientScope] =
    useState<ClientScopeDefaultOptionalType>();
  const history = useHistory();
  const { realm } = useRealm();
  const [hide, toggleHide] = useToggle();

  const adminClient = useAdminClient();
  const { id, type } = useParams<{ id: string; type: AllClientScopes }>();

  const { addAlert, addError } = useAlerts();

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  useFetch(
    async () => {
      if (id) {
        const clientScope = await adminClient.clientScopes.findOne({ id });
        if (!clientScope) {
          throw new Error(t("common:notFound"));
        }
        return {
          ...clientScope,
          type,
        };
      }
    },
    (clientScope) => {
      setClientScope(clientScope);
    },
    [key, id]
  );

  const loader = async () => {
    const assignedRoles = (
      await adminClient.clientScopes.listRealmScopeMappings({ id })
    ).map((role) => ({ role }));
    const effectiveRoles = (
      await adminClient.clientScopes.listCompositeRealmScopeMappings({ id })
    ).map((role) => ({ role }));
    const clients = await adminClient.clients.find();

    const clientRoles = (
      await Promise.all(
        clients.map(async (client) => {
          const clientAssignedRoles = (
            await adminClient.clientScopes.listClientScopeMappings({
              id,
              client: client.id!,
            })
          ).map((role) => ({ role, client }));
          const clientEffectiveRoles = (
            await adminClient.clientScopes.listCompositeClientScopeMappings({
              id,
              client: client.id!,
            })
          ).map((role) => ({ role, client }));
          return mapRoles(clientAssignedRoles, clientEffectiveRoles, hide);
        })
      )
    ).flat();

    return [...mapRoles(assignedRoles, effectiveRoles, hide), ...clientRoles];
  };

  const save = async (clientScopes: ClientScopeDefaultOptionalType) => {
    try {
      clientScopes.name = clientScopes.name?.trim();
      clientScopes = convertFormValuesToObject(
        clientScopes
      ) as ClientScopeDefaultOptionalType;

      if (id) {
        await adminClient.clientScopes.update({ id }, clientScopes);
        changeScope(
          adminClient,
          { ...clientScopes, id, type },
          clientScopes.type
        );
      } else {
        await adminClient.clientScopes.create(clientScopes);
        const scope = await adminClient.clientScopes.findOneByName({
          name: clientScopes.name!,
        });
        if (!scope) {
          throw new Error(t("common:notFound"));
        }

        changeScope(
          adminClient,
          { ...clientScopes, id: scope.id },
          clientScopes.type
        );
        history.push(
          toClientScope({
            realm,
            id: scope.id!,
            type: clientScopes.type || "none",
            tab: "settings",
          })
        );
      }
      addAlert(t((id ? "update" : "create") + "Success"), AlertVariant.success);
    } catch (error) {
      addError(`client-scopes:${id ? "update" : "create"}Error`, error);
    }
  };

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("deleteClientScope", {
      count: 1,
      name: clientScope?.name,
    }),
    messageKey: "client-scopes:deleteConfirm",
    continueButtonLabel: "common:delete",
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        await adminClient.clientScopes.del({ id });
        addAlert(t("deletedSuccess"), AlertVariant.success);
      } catch (error) {
        addError("client-scopes:deleteError", error);
      }
    },
  });

  const assignRoles = async (rows: Row[]) => {
    try {
      const realmRoles = rows
        .filter((row) => row.client === undefined)
        .map((row) => row.role as RoleMappingPayload)
        .flat();
      await adminClient.clientScopes.addRealmScopeMappings(
        {
          id,
        },
        realmRoles
      );
      await Promise.all(
        rows
          .filter((row) => row.client !== undefined)
          .map((row) =>
            adminClient.clientScopes.addClientScopeMappings(
              {
                id,
                client: row.client!.id!,
              },
              [row.role as RoleMappingPayload]
            )
          )
      );
      addAlert(t("roleMappingUpdatedSuccess"), AlertVariant.success);
    } catch (error) {
      addError("client-scopes:roleMappingUpdatedError", error);
    }
  };

  const addMappers = async (
    mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
  ): Promise<void> => {
    if (!Array.isArray(mappers)) {
      const mapper = mappers as ProtocolMapperTypeRepresentation;
      history.push(
        toMapper({
          realm,
          id: clientScope!.id!,
          type,
          mapperId: mapper.id!,
        })
      );
    } else {
      try {
        await adminClient.clientScopes.addMultipleProtocolMappers(
          { id: clientScope!.id! },
          mappers as ProtocolMapperRepresentation[]
        );
        refresh();
        addAlert(t("common:mappingCreatedSuccess"), AlertVariant.success);
      } catch (error) {
        addError("common:mappingCreatedError", error);
      }
    }
  };

  const onDelete = async (mapper: ProtocolMapperRepresentation) => {
    try {
      await adminClient.clientScopes.delProtocolMapper({
        id: clientScope!.id!,
        mapperId: mapper.id!,
      });
      addAlert(t("common:mappingDeletedSuccess"), AlertVariant.success);
      refresh();
    } catch (error) {
      addError("common:mappingDeletedError", error);
    }
    return true;
  };

  if (id && !clientScope) {
    return <KeycloakSpinner />;
  }

  return (
    <>
      <DeleteConfirm />
      <ViewHeader
        titleKey={
          clientScope ? clientScope.name! : "client-scopes:createClientScope"
        }
        dropdownItems={
          clientScope
            ? [
                <DropdownItem key="delete" onClick={toggleDeleteDialog}>
                  {t("common:delete")}
                </DropdownItem>,
              ]
            : undefined
        }
        badges={[{ text: clientScope ? clientScope.protocol : undefined }]}
        divider={!id}
      />

      <PageSection variant="light" className="pf-u-p-0">
        {!id && (
          <PageSection variant="light">
            <ScopeForm save={save} clientScope={{}} />
          </PageSection>
        )}
        {id && clientScope && (
          <KeycloakTabs isBox>
            <Tab
              eventKey="settings"
              title={<TabTitleText>{t("common:settings")}</TabTitleText>}
            >
              <PageSection variant="light">
                <ScopeForm save={save} clientScope={clientScope} />
              </PageSection>
            </Tab>
            <Tab
              eventKey="mappers"
              title={<TabTitleText>{t("common:mappers")}</TabTitleText>}
            >
              <MapperList
                model={clientScope}
                onAdd={addMappers}
                onDelete={onDelete}
                detailLink={(id) =>
                  toMapper({ realm, id: clientScope.id!, type, mapperId: id! })
                }
              />
            </Tab>
            <Tab
              data-testid="scopeTab"
              eventKey="scope"
              title={<TabTitleText>{t("scope")}</TabTitleText>}
            >
              <RoleMapping
                id={id}
                name={clientScope.name!}
                type="clientScopes"
                loader={loader}
                save={assignRoles}
                onHideRolesToggle={toggleHide}
              />
            </Tab>
          </KeycloakTabs>
        )}
      </PageSection>
    </>
  );
}
