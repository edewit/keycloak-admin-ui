import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Checkbox, ToolbarItem } from "@patternfly/react-core";

import ClientRepresentation from "keycloak-admin/lib/defs/clientRepresentation";
import RoleRepresentation from "keycloak-admin/lib/defs/roleRepresentation";
import { AddRoleMappingModal, MappingType } from "./AddRoleMappingModal";
import { KeycloakDataTable } from "../table-toolbar/KeycloakDataTable";
import { emptyFormatter } from "../../util";

export type CompositeRole = RoleRepresentation & {
  parent: RoleRepresentation;
};

export type Row = {
  client?: ClientRepresentation;
  role: CompositeRole | RoleRepresentation;
};

export const ServiceRole = ({ role, client }: Row) => (
  <>
    {client && (
      <Badge
        key={`${client.id}-${role.id}`}
        isRead
        className="keycloak-admin--service-account__client-name"
      >
        {client.clientId}
      </Badge>
    )}
    {role.name}
  </>
);

type RoleMappingProps = {
  name: string;
  id: string;
  type: MappingType;
  loader: () => Promise<Row[]>;
  save: (rows: Row[]) => Promise<void>;
  onHideRolesToggle: () => void;
};

export const RoleMapping = ({
  name,
  id,
  type,
  loader,
  save,
  onHideRolesToggle,
}: RoleMappingProps) => {
  const { t } = useTranslation("clients");

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  const [hide, setHide] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const assignRoles = async (rows: Row[]) => {
    await save(rows);
    refresh();
  };

  return (
    <>
      {showAssign && (
        <AddRoleMappingModal
          id={id}
          type={type}
          name={name}
          onAssign={assignRoles}
          onClose={() => setShowAssign(false)}
        />
      )}
      <KeycloakDataTable
        data-testid="assigned-roles"
        key={key}
        loader={loader}
        onSelect={() => {}}
        searchPlaceholderKey="clients:searchByName"
        ariaLabelKey="clients:clientScopeList"
        toolbarItem={
          <>
            <ToolbarItem>
              <Checkbox
                label={t("hideInheritedRoles")}
                id="hideInheritedRoles"
                isChecked={hide}
                onChange={(check) => {
                  setHide(check);
                  onHideRolesToggle();
                  refresh();
                }}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                data-testid="assignRole"
                onClick={() => setShowAssign(true)}
              >
                {t("assignRole")}
              </Button>
            </ToolbarItem>
          </>
        }
        columns={[
          {
            name: "role.name",
            displayKey: t("name"),
            cellRenderer: ServiceRole,
          },
          {
            name: "role.parent.name",
            displayKey: t("inherentFrom"),
            cellFormatters: [emptyFormatter()],
          },
          {
            name: "role.description",
            displayKey: t("description"),
            cellFormatters: [emptyFormatter()],
          },
        ]}
      />
    </>
  );
};
