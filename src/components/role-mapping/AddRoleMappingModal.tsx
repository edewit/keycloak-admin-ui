import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useErrorHandler } from "react-error-boundary";
import _ from "lodash";
import {
  Badge,
  Button,
  Chip,
  ChipGroup,
  Divider,
  Modal,
  ModalVariant,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  ToolbarItem,
} from "@patternfly/react-core";

import { KeycloakDataTable } from "../table-toolbar/KeycloakDataTable";
import {
  asyncStateFetch,
  useAdminClient,
} from "../../context/auth/AdminClient";
import ClientRepresentation from "keycloak-admin/lib/defs/clientRepresentation";
import { FilterIcon } from "@patternfly/react-icons";
import { Row, ServiceRole } from "./RoleMapping";
import RoleRepresentation from "keycloak-admin/lib/defs/roleRepresentation";

export type MappingType = "service-account" | "client-scope";

type AddRoleMappingModalProps = {
  id: string;
  type: MappingType;
  name: string;
  onAssign: (rows: Row[]) => void;
  onClose: () => void;
};

type ClientRole = ClientRepresentation & {
  numberOfRoles: number;
};

const realmRole = {
  name: "realmRoles",
} as ClientRepresentation;

export const AddRoleMappingModal = ({
  id,
  name,
  type,
  onAssign,
  onClose,
}: AddRoleMappingModalProps) => {
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();
  const errorHandler = useErrorHandler();

  const [clients, setClients] = useState<ClientRole[]>([]);
  const [searchToggle, setSearchToggle] = useState(false);

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  const [selectedClients, setSelectedClients] = useState<ClientRole[]>([]);
  const [selectedRows, setSelectedRows] = useState<Row[]>([]);

  useEffect(
    () =>
      asyncStateFetch(
        async () => {
          const clients = await adminClient.clients.find();
          return (
            await Promise.all(
              clients.map(async (client) => {
                let roles: RoleRepresentation[] = [];
                if (type === "service-account") {
                  roles = await adminClient.users.listAvailableClientRoleMappings(
                    {
                      id: id,
                      clientUniqueId: client.id!,
                    }
                  );
                } else if (type === "client-scope") {
                  roles = await adminClient.clientScopes.listAvailableClientScopeMappings(
                    {
                      id,
                      client: client.id!,
                    }
                  );
                }
                return {
                  roles,
                  client,
                };
              })
            )
          )
            .flat()
            .filter((row) => row.roles.length !== 0)
            .map((row) => {
              return { ...row.client, numberOfRoles: row.roles.length };
            });
        },
        (clients) => {
          setClients(clients);
        },
        errorHandler
      ),
    []
  );

  useEffect(refresh, [searchToggle]);

  const removeClient = (client: ClientRole) => {
    setSelectedClients(selectedClients.filter((item) => item.id !== client.id));
  };

  const loader = async () => {
    const realmRolesSelected = _.findIndex(
      selectedClients,
      (client) => client.name === "realmRoles"
    );
    let selected = selectedClients;
    if (realmRolesSelected !== -1) {
      selected = selectedClients.filter(
        (client) => client.name !== "realmRoles"
      );
    }

    let availableRoles: RoleRepresentation[] = [];
    if (type === "service-account") {
      availableRoles = await adminClient.users.listAvailableRealmRoleMappings({
        id,
      });
    } else if (type === "client-scope") {
      availableRoles = await adminClient.clientScopes.listAvailableRealmScopeMappings(
        { id }
      );
    }
    const realmRoles = availableRoles.map((role) => {
      return {
        role,
        client: undefined,
      };
    });

    const allClients =
      selectedClients.length !== 0
        ? selected
        : await adminClient.clients.find();

    const roles = (
      await Promise.all(
        allClients.map(async (client) => {
          let clientAvailableRoles: RoleRepresentation[] = [];
          if (type === "service-account") {
            clientAvailableRoles = await adminClient.users.listAvailableClientRoleMappings(
              {
                id,
                clientUniqueId: client.id!,
              }
            );
          } else if (type === "client-scope") {
            clientAvailableRoles = await adminClient.clientScopes.listAvailableClientScopeMappings(
              { id, client: client.id! }
            );
          }
          return clientAvailableRoles.map((role) => {
            return {
              role,
              client,
            };
          });
        })
      )
    ).flat();

    return [
      ...(realmRolesSelected !== -1 || selected.length === 0 ? realmRoles : []),
      ...roles,
    ];
  };

  const createSelectGroup = (clients: ClientRepresentation[]) => [
    <SelectGroup key="role" label={t("realmRoles")}>
      <SelectOption key="realmRoles" value={realmRole}>
        {t("realmRoles")}
      </SelectOption>
    </SelectGroup>,
    <Divider key="divider" />,
    <SelectGroup key="group" label={t("clients")}>
      {clients.map((client) => (
        <SelectOption key={client.id} value={client}>
          {client.clientId}
        </SelectOption>
      ))}
    </SelectGroup>,
  ];

  return (
    <Modal
      variant={ModalVariant.large}
      title={t("assignRolesTo", { client: name })}
      isOpen={true}
      onClose={onClose}
      actions={[
        <Button
          data-testid="assign"
          key="confirm"
          isDisabled={selectedRows?.length === 0}
          variant="primary"
          onClick={() => {
            onAssign(selectedRows);
            onClose();
          }}
        >
          {t("assign")}
        </Button>,
        <Button
          data-testid="cancel"
          key="cancel"
          variant="link"
          onClick={onClose}
        >
          {t("common:cancel")}
        </Button>,
      ]}
    >
      <Select
        toggleId="role"
        onToggle={() => setSearchToggle(!searchToggle)}
        isOpen={searchToggle}
        variant={SelectVariant.checkbox}
        hasInlineFilter
        menuAppendTo="parent"
        placeholderText={
          <>
            <FilterIcon /> {t("filterByOrigin")}
          </>
        }
        isGrouped
        onFilter={(evt) => {
          const value = evt?.target.value || "";
          return createSelectGroup(
            clients.filter((client) => client.clientId?.includes(value))
          );
        }}
        selections={selectedClients}
        onClear={() => setSelectedClients([])}
        onSelect={(_, selection) => {
          const client = selection as ClientRole;
          if (selectedClients.includes(client)) {
            removeClient(client);
          } else {
            setSelectedClients([...selectedClients, client]);
          }
        }}
      >
        {createSelectGroup(clients)}
      </Select>
      <ToolbarItem variant="chip-group">
        <ChipGroup>
          {selectedClients.map((client) => (
            <Chip
              key={`chip-${client.id}`}
              onClick={() => {
                removeClient(client);
                refresh();
              }}
            >
              {client.clientId || t("realmRoles")}
              <Badge isRead={true}>{client.numberOfRoles}</Badge>
            </Chip>
          ))}
        </ChipGroup>
      </ToolbarItem>

      <KeycloakDataTable
        key={key}
        onSelect={(rows) => setSelectedRows([...rows])}
        searchPlaceholderKey="clients:searchByRoleName"
        canSelectAll={false}
        loader={loader}
        ariaLabelKey="clients:roles"
        columns={[
          {
            name: "name",
            cellRenderer: ServiceRole,
          },
          {
            name: "role.description",
            displayKey: t("description"),
          },
        ]}
      />
    </Modal>
  );
};
