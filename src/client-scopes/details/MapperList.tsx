import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import {
  AlertVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";

import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

import { ListEmptyState } from "../../components/list-empty-state/ListEmptyState";
import { useAlerts } from "../../components/alert/Alerts";
import { AddMapperDialog } from "../add/MapperDialog";
import { useAdminClient } from "../../context/auth/AdminClient";
import { KeycloakDataTable } from "../../components/table-toolbar/KeycloakDataTable";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toMapper } from "../routes/Mapper";

type MapperListProps = {
  clientScope: ClientScopeRepresentation;
  type: string;
  refresh: () => void;
};

type Row = ProtocolMapperRepresentation & {
  category: string;
  type: string;
  priority: number;
};

export const MapperList = ({ clientScope, type, refresh }: MapperListProps) => {
  const { t } = useTranslation("client-scopes");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const history = useHistory();
  const { realm } = useRealm();

  const [mapperAction, setMapperAction] = useState(false);
  const mapperList = clientScope.protocolMappers;
  const mapperTypes =
    useServerInfo().protocolMapperTypes![clientScope.protocol!];

  const [key, setKey] = useState(0);
  useEffect(() => setKey(new Date().getTime()), [mapperList]);

  const [addMapperDialogOpen, setAddMapperDialogOpen] = useState(false);
  const [filter, setFilter] = useState(clientScope.protocolMappers);
  const toggleAddMapperDialog = (buildIn: boolean) => {
    if (buildIn) {
      setFilter(mapperList || []);
    } else {
      setFilter(undefined);
    }
    setAddMapperDialogOpen(!addMapperDialogOpen);
  };

  const addMappers = async (
    mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
  ): Promise<void> => {
    if (filter === undefined) {
      const mapper = mappers as ProtocolMapperTypeRepresentation;
      history.push(
        toMapper({
          realm,
          id: clientScope.id!,
          type,
          mapperId: mapper.id!,
        })
      );
    } else {
      try {
        await adminClient.clientScopes.addMultipleProtocolMappers(
          { id: clientScope.id! },
          mappers as ProtocolMapperRepresentation[]
        );
        refresh();
        addAlert(t("common:mappingCreatedSuccess"), AlertVariant.success);
      } catch (error) {
        addError("common:mappingCreatedError", error);
      }
    }
  };

  const loader = async () =>
    Promise.resolve(
      (mapperList || [])
        .map((mapper) => {
          const mapperType = mapperTypes.filter(
            (type) => type.id === mapper.protocolMapper
          )[0];
          return {
            ...mapper,
            category: mapperType.category,
            type: mapperType.name,
            priority: mapperType.priority,
          } as Row;
        })
        .sort((a, b) => a.priority - b.priority)
    );

  const MapperLink = ({ id, name }: Row) => (
    <Link to={toMapper({ realm, id: clientScope.id!, type, mapperId: id! })}>
      {name}
    </Link>
  );

  return (
    <>
      <AddMapperDialog
        protocol={clientScope.protocol!}
        filter={filter}
        onConfirm={addMappers}
        open={addMapperDialogOpen}
        toggleDialog={() => setAddMapperDialogOpen(!addMapperDialogOpen)}
      />

      <KeycloakDataTable
        key={key}
        loader={loader}
        ariaLabelKey="client-scopes:clientScopeList"
        searchPlaceholderKey="common:searchForMapper"
        toolbarItem={
          <Dropdown
            onSelect={() => setMapperAction(false)}
            toggle={
              <DropdownToggle
                isPrimary
                id="mapperAction"
                onToggle={() => setMapperAction(!mapperAction)}
                toggleIndicator={CaretDownIcon}
              >
                {t("common:addMapper")}
              </DropdownToggle>
            }
            isOpen={mapperAction}
            dropdownItems={[
              <DropdownItem
                key="predefined"
                onClick={() => toggleAddMapperDialog(true)}
              >
                {t("fromPredefinedMapper")}
              </DropdownItem>,
              <DropdownItem
                key="byConfiguration"
                onClick={() => toggleAddMapperDialog(false)}
              >
                {t("byConfiguration")}
              </DropdownItem>,
            ]}
          />
        }
        actions={[
          {
            title: t("common:delete"),
            onRowClick: async (mapper) => {
              try {
                await adminClient.clientScopes.delProtocolMapper({
                  id: clientScope.id!,
                  mapperId: mapper.id!,
                });
                addAlert(
                  t("common:mappingDeletedSuccess"),
                  AlertVariant.success
                );
                refresh();
              } catch (error) {
                addError("common:mappingDeletedError", error);
              }
              return true;
            },
          },
        ]}
        columns={[
          {
            name: "name",
            cellRenderer: MapperLink,
          },
          { name: "category" },
          {
            name: "type",
          },
          {
            name: "priority",
          },
        ]}
        emptyState={
          <ListEmptyState
            message={t("common:emptyMappers")}
            instructions={t("common:emptyMappersInstructions")}
            secondaryActions={[
              {
                text: t("common:emptyPrimaryAction"),
                onClick: () => toggleAddMapperDialog(true),
              },
              {
                text: t("emptySecondaryAction"),
                onClick: () => toggleAddMapperDialog(false),
              },
            ]}
          />
        }
      />
    </>
  );
};
