import React, { useContext } from "react";
import { AlertVariant } from "@patternfly/react-core";
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";
import { useTranslation } from "react-i18next";

import { HttpClientContext } from "../context/http-service/HttpClientContext";
import { RealmContext } from "../context/realm-context/RealmContext";
import { useAlerts } from "../components/alert/Alerts";
import { ClientScopeRow } from "./ClientScopesSection";

type ClientScopeListProps = {
  clientScopes: ClientScopeRow[];
  onSelect: (selected: boolean, rowId: number) => void;
  onChangeRow: (rowId: number) => void;
};

export const ClientScopeList = ({
  clientScopes,
  onSelect,
  onChangeRow,
}: ClientScopeListProps) => {
  const { t } = useTranslation("client-scopes");
  const httpClient = useContext(HttpClientContext)!;
  const { realm } = useContext(RealmContext);
  const { addAlert } = useAlerts();

  return (
    <>
      <Table
        variant={TableVariant.compact}
        cells={[t("name"), t("description"), t("protocol")]}
        rows={clientScopes}
        actions={[
          {
            title: t("changeType"),
            onClick: (_, rowId) => {
              onChangeRow(rowId);
            },
          },
          {
            title: t("common:delete"),
            onClick: async (_, rowId) => {
              try {
                await httpClient.doDelete(
                  `/admin/realms/${realm}/client-scopes/${clientScopes[rowId].scope.id}`
                );
                addAlert(t("deletedSuccess"), AlertVariant.success);
              } catch (error) {
                addAlert(`${t("deleteError")} ${error}`, AlertVariant.danger);
              }
            },
          },
        ]}
        onSelect={(_, isSelected, rowId) => onSelect(isSelected, rowId)}
        canSelectAll={false}
        aria-label={t("clientScopeList")}
      >
        <TableHeader />
        <TableBody />
      </Table>
    </>
  );
};
