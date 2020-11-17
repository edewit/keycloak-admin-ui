import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";
import {
  Button,
  Select,
  SelectOption,
  Split,
  SplitItem,
} from "@patternfly/react-core";

import { useAdminClient } from "../../context/auth/AdminClient";
import { DataLoader } from "../../components/data-loader/DataLoader";
import { TableToolbar } from "../../components/table-toolbar/TableToolbar";
import { ListEmptyState } from "../../components/list-empty-state/ListEmptyState";

export type ClientScopesProps = {
  clientId: string;
};

export const ClientScopes = ({ clientId }: ClientScopesProps) => {
  const { t } = useTranslation("client-scopes");
  const adminClient = useAdminClient();
  const [searchToggle, setSearchToggle] = useState(false);

  const loader = async (): Promise<
    {
      cells: (string | Record<string, any> | undefined)[];
    }[]
  > => {
    const defaultClientScopes = await adminClient.clients.listDefaultClientScopes(
      { id: clientId }
    );
    const optionalClientScopes = await adminClient.clients.listOptionalClientScopes(
      { id: clientId }
    );
    const clientScopes = await adminClient.clientScopes.find();

    const find = (id: string) =>
      clientScopes.find((clientScope) => id === clientScope.id)!;

    const optional = optionalClientScopes.map((c) => {
      const scope = find(c.id!);
      return {
        cells: [c.name, "optional", scope.description],
      };
    });

    const defaultScopes = defaultClientScopes.map((c) => {
      const scope = find(c.id!);
      return {
        cells: [c.name, "default", scope.description],
      };
    });

    return [...optional, ...defaultScopes];
  };

  const filterData = () => {};

  return (
    <DataLoader loader={loader}>
      {(rows) => (
        <>
          {rows.data.length > 0 && (
            <TableToolbar
              inputGroupName="clientsScopeToolbarTextInput"
              inputGroupPlaceholder={t("searchFor")}
              inputGroupOnChange={filterData}
              toolbarItem={
                <Split>
                  <SplitItem>
                    <Select
                      onSelect={() => {}}
                      onToggle={() => setSearchToggle(!searchToggle)}
                      aria-label="Select Input"
                      isOpen={searchToggle}
                    >
                      <SelectOption key="client">Client Scope</SelectOption>
                      <SelectOption key="assigned">Assigned type</SelectOption>
                    </Select>
                  </SplitItem>
                  <SplitItem>
                    <Button onClick={() => {}}>{t("createClientScope")}</Button>
                  </SplitItem>
                </Split>
              }
            >
              <Table
                variant={TableVariant.compact}
                cells={[t("name"), t("description"), t("protocol")]}
                rows={rows.data}
                actions={[
                  {
                    title: t("common:remove"),
                    onClick: () => {},
                  },
                ]}
                aria-label={t("clientScopeList")}
              >
                <TableHeader />
                <TableBody />
              </Table>
            </TableToolbar>
          )}
          {rows.data.length === 0 && (
            <ListEmptyState
              message={t("clients:emptyClientScopes")}
              instructions={t("clients:emptyClientScopesInstructions")}
              primaryActionText={t("clients:emptyClientScopesPrimaryAction")}
              onPrimaryAction={() => {}}
            />
          )}
        </>
      )}
    </DataLoader>
  );
};
