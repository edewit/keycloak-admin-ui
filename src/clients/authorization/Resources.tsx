import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  PageSection,
  Spinner,
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

import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { PaginatingTableToolbar } from "../../components/table-toolbar/PaginatingTableToolbar";

type ResourcesProps = {
  clientId: string;
};

type ExpandableResourceRepresentation = ResourceRepresentation & {
  isExpanded: boolean;
};

export const AuthorizationResources = ({ clientId }: ResourcesProps) => {
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();
  const [resources, setResources] =
    useState<ExpandableResourceRepresentation[]>();

  const [max, setMax] = useState(10);
  const [first, setFirst] = useState(0);

  useFetch(
    () => {
      const params = {
        first,
        max,
        deep: false,
        // search,
      };
      return adminClient.clients.listResources({
        ...params,
        id: clientId,
      });
    },
    (resources) =>
      setResources(
        resources.map((resource) => ({ ...resource, isExpanded: false }))
      ),
    []
  );

  const UriRenderer = ({ row }: { row: ResourceRepresentation }) => (
    <>
      {row.uris?.[0]}{" "}
      {(row.uris?.length || 0) > 1 && (
        <Label color="blue">
          {t("common:more", { count: (row.uris?.length || 1) - 1 })}
        </Label>
      )}
    </>
  );

  const DetailCell = ({ id, uris }: { id: string; uris?: string[] }) => {
    const [scope, setScope] = useState<{ id: string; name: string }[]>();
    const [permissions, setPermissions] =
      useState<ResourceServerRepresentation[]>();

    useFetch(
      async () => {
        const scopes = await adminClient.clients.listScopesByResource({
          id: clientId,
          resourceName: id,
        });
        const permissions = await adminClient.clients.listPermissionsByResource(
          {
            id: clientId,
            resourceId: id,
          }
        );
        return { scopes, permissions };
      },
      ({ scopes, permissions }) => {
        setScope(scopes);
        setPermissions(permissions);
      },
      []
    );
    return (
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>{t("uris")}</DescriptionListTerm>
          <DescriptionListDescription>
            {uris?.map((uri) => (
              <span key={uri} className="pf-u-pr-sm">
                {uri}
              </span>
            ))}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t("scopes")}</DescriptionListTerm>
          <DescriptionListDescription>
            {scope?.map((scope) => (
              <span key={scope.id} className="pf-u-pr-sm">
                {scope.name}
              </span>
            ))}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>
            {t("associatedPermissions")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {permissions?.map((permission) => (
              <span key={permission.id} className="pf-u-pr-sm">
                {permission.name}
              </span>
            ))}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    );
  };

  if (!resources) {
    return <Spinner />;
  }

  return (
    <PageSection variant="light" className="pf-u-p-0">
      <PaginatingTableToolbar
        count={resources.length}
        first={first}
        max={max}
        onNextClick={setFirst}
        onPreviousClick={setFirst}
        onPerPageSelect={(first, max) => {
          setFirst(first);
          setMax(max);
        }}
      >
        <TableComposable aria-label="Expandable Table" variant="compact">
          <Thead>
            <Tr>
              <Th />
              <Th>{t("common:name")}</Th>
              <Th>{t("common:type")}</Th>
              <Th>{t("owner")}</Th>
              <Th>{t("uris")}</Th>
            </Tr>
          </Thead>
          {resources.map((resource, rowIndex) => (
            <Tbody key={resource._id} isExpanded={resource.isExpanded}>
              <Tr>
                <Td
                  expand={{
                    rowIndex,
                    isExpanded: resource.isExpanded,
                    onToggle: (_, rowIndex) => {
                      const row = {
                        ...resources[rowIndex],
                        isExpanded: !resource.isExpanded,
                      };
                      const rows = [...resources];
                      rows[rowIndex] = row;
                      console.log(rows);
                      setResources(rows);
                    },
                  }}
                />
                <Td>{resource.name}</Td>
                <Td>{resource.type}</Td>
                <Td>{resource.owner?.name}</Td>
                <Td>
                  <UriRenderer row={resource} />
                </Td>
              </Tr>
              <Tr
                key={`child-${resource._id}`}
                isExpanded={resource.isExpanded}
              >
                <Td colSpan={5}>
                  <ExpandableRowContent>
                    {resource.isExpanded && (
                      <DetailCell id={resource._id!} uris={resource.uris} />
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
