import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertVariant,
  Button,
  DescriptionList,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  PageSection,
  ToolbarItem,
} from "@patternfly/react-core";
import {
  ExpandableRowContent,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import type PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import { KeycloakSpinner } from "../../components/keycloak-spinner/KeycloakSpinner";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { PaginatingTableToolbar } from "../../components/table-toolbar/PaginatingTableToolbar";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useAlerts } from "../../components/alert/Alerts";
import { toCreateResource } from "../routes/NewResource";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toResourceDetails } from "../routes/Resource";
import { SearchDropdown } from "./SearchDropdown";
import { MoreLabel } from "./MoreLabel";
import { DetailDescription } from "./DetailDescription";
import { CaretDownIcon } from "@patternfly/react-icons";
import useToggle from "../../utils/useToggle";

type PermissionsProps = {
  clientId: string;
};

type ExpandablePolicyRepresentation = PolicyRepresentation & {
  associatedPolicies?: PolicyRepresentation[];
  isExpanded: boolean;
};

export const AuthorizationPermissions = ({ clientId }: PermissionsProps) => {
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const { realm } = useRealm();

  const [permissions, setPermissions] =
    useState<ExpandablePolicyRepresentation[]>();
  const [selectedPermission, setSelectedPermission] =
    useState<PolicyRepresentation>();
  const [policyProviders, setPolicyProviders] =
    useState<PolicyProviderRepresentation[]>();
  const [disabledCreate] = useState<boolean[]>();
  const [createOpen, toggleCreate] = useToggle();

  const [key, setKey] = useState(0);
  const refresh = () => setKey(key + 1);

  const [max, setMax] = useState(10);
  const [first, setFirst] = useState(0);

  const AssociatedPoliciesRenderer = ({
    row,
  }: {
    row: ExpandablePolicyRepresentation;
  }) => {
    return (
      <>
        {row.associatedPolicies?.[0]?.name}{" "}
        <MoreLabel array={row.associatedPolicies} />
      </>
    );
  };

  useFetch(
    async () => {
      const permissions = await adminClient.clients.findPermissions({
        first,
        max,
        id: clientId,
      });

      return await Promise.all(
        permissions.map(async (permission) => {
          const associatedPolicies =
            await adminClient.clients.getAssociatedPolicies({
              id: clientId,
              permissionId: permission.id!,
            });

          return {
            ...permission,
            associatedPolicies,
            isExpanded: false,
          };
        })
      );
    },
    setPermissions,
    [key]
  );

  useFetch(
    async () => {
      const policies = await adminClient.clients.listPolicyProviders({
        id: clientId,
      });
      return policies.filter(
        (p) => p.type === "resource" || p.type === "scope"
      );
    },
    setPolicyProviders,
    []
  );

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: "clients:deletePermission",
    messageKey: t("deletePermissionConfirm", {
      permission: selectedPermission?.name,
    }),
    continueButtonLabel: "clients:confirm",
    onConfirm: async () => {
      try {
        await adminClient.clients.delPermission({
          id: clientId,
          type: selectedPermission?.type!,
          permissionId: selectedPermission?.id!,
        });
        addAlert(t("permissionDeletedSuccess"), AlertVariant.success);
        refresh();
      } catch (error) {
        addError("clients:permissionDeletedError", error);
      }
    },
  });

  if (!permissions) {
    return <KeycloakSpinner />;
  }

  return (
    <PageSection variant="light" className="pf-u-p-0">
      <DeleteConfirm />
      <PaginatingTableToolbar
        count={permissions.length}
        first={first}
        max={max}
        onNextClick={setFirst}
        onPreviousClick={setFirst}
        onPerPageSelect={(first, max) => {
          setFirst(first);
          setMax(max);
        }}
        toolbarItem={
          <>
            <ToolbarItem>
              <SearchDropdown types={policyProviders} />
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                toggle={
                  <DropdownToggle
                    onToggle={toggleCreate}
                    toggleIndicator={CaretDownIcon}
                    isPrimary
                  >
                    {t("createPermission")}
                  </DropdownToggle>
                }
                isOpen={createOpen}
                dropdownItems={[
                  <DropdownItem
                    key="createResourceBasedPermission"
                    isDisabled={disabledCreate?.[0]}
                    component="button"
                  >
                    Disabled action
                  </DropdownItem>,
                ]}
              />
              <Button
                data-testid="createPermission"
                component={(props) => (
                  <Link
                    {...props}
                    to={toCreateResource({ realm, id: clientId })}
                  />
                )}
              ></Button>
            </ToolbarItem>
          </>
        }
      >
        <TableComposable aria-label={t("resources")} variant="compact">
          <Thead>
            <Tr>
              <Th />
              <Th>{t("common:name")}</Th>
              <Th>{t("common:type")}</Th>
              <Th>{t("associatedPolicy")}</Th>
              <Th>{t("common:description")}</Th>
              <Th />
            </Tr>
          </Thead>
          {permissions.map((permission, rowIndex) => (
            <Tbody key={permission.id} isExpanded={permission.isExpanded}>
              <Tr>
                <Td
                  expand={{
                    rowIndex,
                    isExpanded: permission.isExpanded,
                    onToggle: (_, rowIndex) => {
                      const rows = permissions.map((p, index) =>
                        index === rowIndex
                          ? { ...p, isExpanded: !p.isExpanded }
                          : p
                      );
                      setPermissions(rows);
                    },
                  }}
                />
                <Td data-testid={`name-column-${permission.name}`}>
                  <Link
                    to={toResourceDetails({
                      realm,
                      id: clientId,
                      resourceId: permission.id!,
                    })}
                  >
                    {permission.name}
                  </Link>
                </Td>
                <Td>
                  {
                    policyProviders?.find((p) => p.type === permission.type)
                      ?.name
                  }
                </Td>
                <Td>
                  <AssociatedPoliciesRenderer row={permission} />
                </Td>
                <Td>{permission.description}</Td>
                <Td
                  actions={{
                    items: [
                      {
                        title: t("common:delete"),
                        onClick: async () => {
                          setSelectedPermission(permission);
                          toggleDeleteDialog();
                        },
                      },
                    ],
                  }}
                ></Td>
              </Tr>
              <Tr
                key={`child-${permission.id}`}
                isExpanded={permission.isExpanded}
              >
                <Td colSpan={6}>
                  <ExpandableRowContent>
                    {permission.isExpanded && (
                      <DescriptionList
                        isHorizontal
                        className="keycloak_resource_details"
                      >
                        <DetailDescription
                          name="associatedPolicy"
                          array={permission.associatedPolicies}
                          convert={(p) => p.name!}
                        />
                      </DescriptionList>
                    )}
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          ))}
        </TableComposable>
      </PaginatingTableToolbar>
    </PageSection>
  );
};
