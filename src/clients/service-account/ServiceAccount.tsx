import React, { Fragment, useContext } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";
import { Badge } from "@patternfly/react-core";

import { useAdminClient } from "../../context/auth/AdminClient";
import { DataLoader } from "../../components/data-loader/DataLoader";
import { TableToolbar } from "../../components/table-toolbar/TableToolbar";
import { RealmContext } from "../../context/realm-context/RealmContext";
import RoleRepresentation from "keycloak-admin/lib/defs/roleRepresentation";

import "./service-account.css";

type ServiceAccountProps = {
  clientId: string;
};

export const ServiceAccount = ({ clientId }: ServiceAccountProps) => {
  const adminClient = useAdminClient();
  const { realm } = useContext(RealmContext);

  const loader = async () => {
    const serviceAccount = await adminClient.clients.getServiceAccountUser({
      id: clientId,
    });
    const availableRoles = await adminClient.users.listAvailableRealmRoleMappings(
      { id: serviceAccount.id! }
    );
    const effectiveRoles = await adminClient.users.listCompositeRealmRoleMappings(
      { id: serviceAccount.id! }
    );
    const assignedRoles = await adminClient.users.listRealmRoleMappings({
      id: serviceAccount.id!,
    });

    const clients = await adminClient.clients.find();
    const clientRoles = (
      await Promise.all(
        clients.map(async (client) => {
          return {
            client,
            roles: await adminClient.users.listClientRoleMappings({
              id: serviceAccount.id!,
              clientUniqueId: client.id!,
            }),
          };
        })
      )
    ).filter((rows) => rows.roles.length > 0);

    console.log("availableRoles", availableRoles);
    console.log("assignedRoles", assignedRoles);

    const findClient = (role: RoleRepresentation) => {
      const row = clientRoles.filter((row) =>
        row.roles.find((r) => r.id === role.id)
      )[0];
      return row ? row.client : undefined;
    };

    const data = [
      ...effectiveRoles,
      ...clientRoles.map((row) => row.roles).flat(),
    ].sort((r1, r2) => r1.name!.localeCompare(r2.name!));

    const addInherentData = await (async () =>
      Promise.all(
        data.map(async (role) => {
          const compositeRoles = await adminClient.roles.getCompositeRolesForRealm(
            { realm, id: role.id! }
          );
          return compositeRoles.length > 0
            ? compositeRoles.map((r) => {
                return { ...r, parent: role };
              })
            : { ...role, parent: undefined };
        })
      ))();
    return addInherentData.flat().map((role) => {
      const client = findClient(role);
      return {
        cells: [
          <Fragment key={role.id}>
            {client && (
              <Badge
                key={client.id}
                isRead
                className="keycloak-admin--service-account__client-name"
              >
                {client.clientId}
              </Badge>
            )}
            {role.name}
          </Fragment>,
          role.parent ? role.parent.name : "",
          role.description,
        ],
      };
    });
  };

  return (
    <TableToolbar>
      <DataLoader loader={loader}>
        {(clientRoles) => (
          <Table
            variant={TableVariant.compact}
            cells={["name", "inherent", "description"]}
            rows={clientRoles.data}
            aria-label="roleList"
          >
            <TableHeader />
            <TableBody />
          </Table>
        )}
      </DataLoader>
    </TableToolbar>
  );
};
