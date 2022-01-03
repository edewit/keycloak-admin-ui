import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  AlertVariant,
  Button,
  // Label,
  PageSection,
  ToolbarItem,
} from "@patternfly/react-core";
import {
  // ExpandableRowContent,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
// import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import { KeycloakSpinner } from "../../components/keycloak-spinner/KeycloakSpinner";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { PaginatingTableToolbar } from "../../components/table-toolbar/PaginatingTableToolbar";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useAlerts } from "../../components/alert/Alerts";
// import { DetailCell } from "./DetailCell";
import { toCreateResource } from "../routes/NewResource";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toResourceDetails } from "../routes/Resource";

type PermissionsProps = {
  clientId: string;
};

type ExpandablePolicyRepresentation = PolicyRepresentation & {
  associatedPolicies: PolicyRepresentation[];
  isExpanded: boolean;
};

export const AuthorizationPermissions = ({ clientId }: PermissionsProps) => {
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const { realm } = useRealm();

  const [permissions, setPermissions] =
    useState<ExpandablePolicyRepresentation[]>();
  const [selectedResource, setSelectedResource] =
    useState<ResourceRepresentation>();

  const [key, setKey] = useState(0);
  const refresh = () => setKey(key + 1);

  const [max, setMax] = useState(10);
  const [first, setFirst] = useState(0);

  useFetch(
    async () => {
      const params = {
        first,
        max,
      };
      const permissions = (await adminClient.clients.findPermissions({
        ...params,
        id: clientId,
      } as unknown as any)) as ExpandablePolicyRepresentation[];
      await Promise.all(
        permissions.map(async () => {
          // p.associatedPolicies =
          //   await adminClient.clients.getAssociatedPolicies({
          //     id: clientId,
          //     permissionId: p.id!,
          //   });
        })
      );
      return permissions;
    },
    (resources) =>
      setPermissions(
        resources.map((resource) => ({ ...resource, isExpanded: false }))
      ),
    [key]
  );

  // const UriRenderer = ({ row }: { row: ResourceRepresentation }) => (
  //   <>
  //     {row.uris?.[0]}{" "}
  //     {(row.uris?.length || 0) > 1 && (
  //       <Label color="blue">
  //         {t("common:more", { count: (row.uris?.length || 1) - 1 })}
  //       </Label>
  //     )}
  //   </>
  // );

  // const fetchPermissions = async (id: string) => {
  //   return adminClient.clients.listPermissionsByResource({
  //     id: clientId,
  //     resourceId: id,
  //   });
  // };

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: "clients:deleteResource",
    children: (
      <>
        {t("deleteResourceConfirm")}
        {permissions?.length && (
          <Alert
            variant="warning"
            isInline
            isPlain
            title={t("deleteResourceWarning")}
            className="pf-u-pt-lg"
          >
            <p className="pf-u-pt-xs">
              {permissions.map((permission) => (
                <strong key={permission.id} className="pf-u-pr-md">
                  {permission.name}
                </strong>
              ))}
            </p>
          </Alert>
        )}
      </>
    ),
    continueButtonLabel: "clients:confirm",
    onConfirm: async () => {
      try {
        await adminClient.clients.delResource({
          id: clientId,
          resourceId: selectedResource?._id!,
        });
        addAlert(t("resourceDeletedSuccess"), AlertVariant.success);
        refresh();
      } catch (error) {
        addError("clients:resourceDeletedError", error);
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
          <ToolbarItem>
            <Button
              data-testid="createResource"
              component={(props) => (
                <Link
                  {...props}
                  to={toCreateResource({ realm, id: clientId })}
                />
              )}
            >
              {t("createResource")}
            </Button>
          </ToolbarItem>
        }
      >
        <TableComposable aria-label={t("resources")} variant="compact">
          <Thead>
            <Tr>
              <Th />
              <Th>{t("common:name")}</Th>
              <Th>{t("common:type")}</Th>
              <Th>{t("owner")}</Th>
              <Th>{t("uris")}</Th>
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
                    onToggle: () => {
                      // const rows = resources.map((resource, index) =>
                      //   index === rowIndex
                      //     ? { ...resource, isExpanded: !resource.isExpanded }
                      //     : resource
                      // );
                      // setResources(rows);
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
                <Td>{permission.type}</Td>
                <Td
                  actions={{
                    items: [
                      {
                        title: t("common:delete"),
                        onClick: async () => {
                          setSelectedResource(undefined);
                          toggleDeleteDialog();
                        },
                      },
                      {
                        title: t("createPermission"),
                        className: "pf-m-link",
                        isOutsideDropdown: true,
                      },
                    ],
                  }}
                ></Td>
              </Tr>
              {/* <Tr
                key={`child-${permission.id}`}
                isExpanded={permission.isExpanded}
              >
                <Td colSpan={5}>
                  <ExpandableRowContent>
                    {permission.isExpanded && (
                      <DetailCell
                        clientId={clientId}
                        id={permission._id!}
                        uris={permission.uris}
                      />
                    )}
                  </ExpandableRowContent>
                </Td>
              </Tr> */}
            </Tbody>
          ))}
        </TableComposable>
      </PaginatingTableToolbar>
    </PageSection>
  );
};
