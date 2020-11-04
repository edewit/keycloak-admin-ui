import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";

import { ClientScopeRepresentation } from "../../client-scopes/models/client-scope";
import { DataLoader } from "../../components/data-loader/DataLoader";
import { HttpClientContext } from "../../context/http-service/HttpClientContext";
import { RealmContext } from "../../context/realm-context/RealmContext";
import { TableToolbar } from "../../components/table-toolbar/TableToolbar";
import { ListEmptyState } from "../../components/list-empty-state/ListEmptyState";

export type ClientScopesProps = {
  clientId: string;
};

export const ClientScopes = ({ clientId }: ClientScopesProps) => {
  const { t } = useTranslation("client-scopes");
  const httpClient = useContext(HttpClientContext)!;
  const { realm } = useContext(RealmContext);

  //const [rows, setRows] = useState<{ cells: (string | Record<string, any> | ClientScopeRepresentation[] | undefined)[]; }[]>();

  const columns: (keyof ClientScopeRepresentation)[] = [
    "name",
    "description",
    "protocol",
  ];
  const url = `/admin/realms/${realm}/clients/${clientId}`;

  const loader = async (): Promise<
    {
      cells: (string | Record<string, any> | undefined)[];
    }[]
  > => {
    const defaultClientScopes = (
      await httpClient.doGet<ClientScopeRepresentation[]>(
        url + "/default-client-scopes"
      )
    ).data!;
    const optionalClientScopes = (
      await httpClient.doGet<ClientScopeRepresentation[]>(
        url + "/optional-client-scopes"
      )
    ).data!;
    const clientScopes = (
      await httpClient.doGet<ClientScopeRepresentation[]>(
        `/admin/realms/${realm}/client-scopes`
      )
    ).data!;

    console.log(defaultClientScopes);
    console.log(optionalClientScopes);
    console.log(clientScopes);

    return defaultClientScopes.map((c) => {
      return {
        cells: columns.map((col) => {
          return c[col];
        }),
      };
    });
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
                <Button onClick={() => {}}>{t("createClientScope")}</Button>
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
