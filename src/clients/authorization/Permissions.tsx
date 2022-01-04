import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertVariant,
  Button,
  DescriptionList,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  PageSection,
  Title,
  ToolbarItem,
  Tooltip,
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
import { PlusCircleIcon } from "@patternfly/react-icons";

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
import useToggle from "../../utils/useToggle";

import "./permissions.css";

type PermissionsProps = {
  clientId: string;
};

type ExpandablePolicyRepresentation = PolicyRepresentation & {
  associatedPolicies?: PolicyRepresentation[];
  isExpanded: boolean;
};

export const AuthorizationPermissions = ({ clientId }: PermissionsProps) => {
  const { t } = useTranslation("clients");
  const history = useHistory();
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const { realm } = useRealm();

  const [permissions, setPermissions] =
    useState<ExpandablePolicyRepresentation[]>();
  const [selectedPermission, setSelectedPermission] =
    useState<PolicyRepresentation>();
  const [policyProviders, setPolicyProviders] =
    useState<PolicyProviderRepresentation[]>();
  const [disabledCreate, setDisabledCreate] =
    useState<{ resources: boolean; scopes: boolean }>();
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
      const params = {
        first: 0,
        max: 1,
      };
      const [policies, resources, scopes] = await Promise.all([
        adminClient.clients.listPolicyProviders({
          id: clientId,
        }),
        adminClient.clients.listResources({ ...params, id: clientId }),
        adminClient.clients.listAllScopes({ ...params, id: clientId }),
      ]);
      return {
        policies: policies.filter(
          (p) => p.type === "resource" || p.type === "scope"
        ),
        resources: resources.length !== 1,
        scopes: scopes.length !== 1,
      };
    },
    ({ policies, resources, scopes }) => {
      setPolicyProviders(policies);
      setDisabledCreate({ resources, scopes });
    },
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

  const style = "pf-u-m-sm";
  const EmptyResourceButton = () => (
    <Button
      className={disabledCreate?.resources ? "disabled " : "" + style}
      variant="secondary"
      onClick={() =>
        !disabledCreate?.resources &&
        history.push(toCreateResource({ realm, id: clientId }))
      }
    >
      {t("createResourceBasedPermission")}
    </Button>
  );

  const EmptyScopeButton = () => (
    <Button
      className={disabledCreate?.scopes ? "disabled " : "" + style}
      variant="secondary"
      onClick={() =>
        !disabledCreate?.scopes &&
        history.push(toCreateResource({ realm, id: clientId }))
      }
    >
      {t("createScopeBasedPermission")}
    </Button>
  );

  return (
    <PageSection variant="light" className="pf-u-p-0">
      <DeleteConfirm />
      {permissions.length > 0 && (
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
                    <DropdownToggle onToggle={toggleCreate} isPrimary>
                      {t("createPermission")}
                    </DropdownToggle>
                  }
                  isOpen={createOpen}
                  dropdownItems={[
                    <DropdownItem
                      key="createResourceBasedPermission"
                      isDisabled={disabledCreate?.resources}
                      component="button"
                      onClick={() =>
                        history.push(toCreateResource({ realm, id: clientId }))
                      }
                    >
                      {t("createResourceBasedPermission")}
                    </DropdownItem>,
                    <DropdownItem
                      key="createScopeBasedPermission"
                      isDisabled={disabledCreate?.scopes}
                      component="button"
                      onClick={() =>
                        history.push(toCreateResource({ realm, id: clientId }))
                      }
                    >
                      {t("createScopeBasedPermission")}
                    </DropdownItem>,
                  ]}
                />
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
      )}
      {permissions.length === 0 && (
        <EmptyState data-testid="empty-state" variant="large">
          <EmptyStateIcon icon={PlusCircleIcon} />
          <Title headingLevel="h1" size="lg">
            {t("emptyPermissions")}
          </Title>
          <EmptyStateBody>{t("emptyPermissionInstructions")}</EmptyStateBody>
          {disabledCreate?.resources ? (
            <Tooltip content={t("noResourceCreateHint")}>
              <EmptyResourceButton />
            </Tooltip>
          ) : (
            <EmptyResourceButton />
          )}
          <br />
          {disabledCreate?.scopes ? (
            <Tooltip content={t("noScopeCreateHint")}>
              <EmptyScopeButton />
            </Tooltip>
          ) : (
            <EmptyScopeButton />
          )}
        </EmptyState>
      )}
    </PageSection>
  );
};
