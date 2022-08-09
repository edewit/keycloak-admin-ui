import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sortBy } from "lodash-es";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Modal,
  ModalVariant,
  ToolbarItem,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";

import { KeycloakDataTable } from "../table-toolbar/KeycloakDataTable";
import { useAdminClient } from "../../context/auth/AdminClient";
import {
  castAdminClient,
  mapping,
  ResourcesKey,
  Row,
  ServiceRole,
} from "./RoleMapping";

type AddRoleMappingModalProps = {
  id: string;
  type: ResourcesKey;
  name?: string;
  isRadio?: boolean;
  onAssign: (rows: Row[]) => void;
  onClose: () => void;
  isLDAPmapper?: boolean;
};

type FilterType = "roles" | "clients";

export const AddRoleMappingModal = ({
  id,
  name,
  type,
  isRadio = false,
  isLDAPmapper,
  onAssign,
  onClose,
}: AddRoleMappingModalProps) => {
  const { t } = useTranslation("common");
  const { adminClient } = useAdminClient();

  const [searchToggle, setSearchToggle] = useState(false);

  const [filterType, setFilterType] = useState<FilterType>("roles");
  const [selectedRows, setSelectedRows] = useState<Row[]>([]);
  const [key, setKey] = useState(0);
  const refresh = () => setKey(key + 1);

  const mapType = mapping.find((m) => m.resource === type)!;
  const alphabetize = (rolesList: Row[]) => {
    return sortBy(rolesList, ({ role }) => role.name?.toUpperCase());
  };

  const loader = async (first?: number, max?: number, search?: string) => {
    const params: Record<string, string | number> = {
      first: first!,
      max: max!,
    };

    if (search) {
      params.search = search;
    }

    return (
      await castAdminClient(adminClient, mapType.resource)[
        mapType.functions.list[1]
      ]({ ...params, id })
    ).map((role) => ({
      id: role.id,
      role,
      client: undefined,
    }));
  };

  /* this is still pretty expensive querying all client and then all roles */
  const clientRolesLoader = async () => {
    const allClients = await adminClient.clients.find();

    const roles = (
      await Promise.all(
        allClients.map(async (client) => {
          const clientAvailableRoles = await castAdminClient(
            adminClient,
            mapType.resource === "roles" ? "clients" : mapType.resource
          )[mapType.functions.list[0]]({
            id: mapType.resource === "roles" ? client.id : id,
            client: client.id,
            clientUniqueId: client.id,
          });

          return clientAvailableRoles.map((role) => {
            return {
              id: role.id,
              role,
              client,
            };
          });
        })
      )
    ).flat();

    return alphabetize(roles);
  };

  return (
    <Modal
      variant={ModalVariant.large}
      title={
        isLDAPmapper ? t("assignRole") : t("assignRolesTo", { client: name })
      }
      isOpen={true}
      onClose={onClose}
      actions={[
        <Button
          data-testid="assign"
          key="confirm"
          isDisabled={selectedRows.length === 0}
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
      <KeycloakDataTable
        key={key}
        onSelect={(rows) => setSelectedRows([...rows])}
        searchPlaceholderKey="clients:searchByRoleName"
        searchTypeComponent={
          <ToolbarItem>
            <Dropdown
              onSelect={() => {
                setFilterType(filterType === "roles" ? "clients" : "roles");
                setSearchToggle(false);
                refresh();
              }}
              data-testid="filter-type-dropdown"
              toggle={
                <DropdownToggle
                  onToggle={setSearchToggle}
                  icon={<FilterIcon />}
                >
                  {filterType === "roles"
                    ? t("common:filterByRoles")
                    : t("common:filterByClients")}
                </DropdownToggle>
              }
              isOpen={searchToggle}
              dropdownItems={[
                <DropdownItem key="filter-type">
                  {filterType === "roles"
                    ? t("common:filterByClients")
                    : t("common:filterByRoles")}
                </DropdownItem>,
              ]}
            />
          </ToolbarItem>
        }
        canSelectAll
        isRadio={isRadio}
        loader={filterType === "roles" ? loader : clientRolesLoader}
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
