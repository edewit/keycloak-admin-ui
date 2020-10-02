import React, { useContext, useEffect, useState } from "react";
import {
  AlertVariant,
  Button,
  Dropdown,
  DropdownItem,
  KebabToggle,
  PageSection,
  Spinner,
  ToolbarItem,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { RealmContext } from "../context/realm-context/RealmContext";
import { HttpClientContext } from "../context/http-service/HttpClientContext";
import { ClientRepresentation } from "../realm/models/Realm";
import { TableToolbar } from "../components/table-toolbar/TableToolbar";
import { ClientScopeList } from "./ClientScopesList";
import { ViewHeader } from "../components/view-header/ViewHeader";
import {
  ClientScopeRepresentation,
  ProtocolMapperRepresentation,
} from "./models/client-scope";
import { typeDialog } from "./type-dialog/TypeDialog";
import { useAlerts } from "../components/alert/Alerts";

export type ClientScopeRow = {
  cells: (
    | string
    | Record<string, any>
    | ProtocolMapperRepresentation[]
    | undefined
  )[];
  scope: ClientScopeRepresentation;
  selected: boolean;
};

export const ClientScopesSection = () => {
  const { t } = useTranslation("client-scopes");
  const history = useHistory();

  const httpClient = useContext(HttpClientContext)!;
  const { realm } = useContext(RealmContext);
  const { addAlert } = useAlerts();

  const [rawData, setRawData] = useState<ClientScopeRow[]>([]);
  const [filteredData, setFilteredData] = useState<ClientScopeRow[]>();
  const [open, setOpen] = useState(false);

  const [scopes, setScopes] = useState<
    { name: string; ids: (string | undefined)[] }[]
  >([
    { name: "default", ids: [] },
    { name: "optional", ids: [] },
  ]);

  const columns: (keyof ClientScopeRepresentation)[] = [
    "name",
    "description",
    "protocol",
  ];

  useEffect(() => {
    (async () => {
      if (filteredData) {
        return filteredData;
      }
      const result = await httpClient.doGet<ClientRepresentation[]>(
        `/admin/realms/${realm}/client-scopes`
      );
      setRawData(
        result.data!.map((scope) => {
          return {
            cells: columns.map((col) => scope[col]),
            scope,
            selected: false,
          };
        })
      );

      const update = [...scopes];
      for (const scope of scopes) {
        const url = `/admin/realms/${realm}/default-${scope.name}-client-scopes/`;
        const response = await httpClient.doGet<ClientScopeRepresentation[]>(
          url
        );
        update.find((s) => s.name === scope.name)!.ids = response.data!.map(
          (client) => client.id
        );
      }
      setScopes(update);
    })();
  }, []);

  const clearSelected = () => {
    rawData.forEach((row) => (row.selected = false));
    setRawData([...rawData]);
  };

  const [toggleDialog, Dialog] = typeDialog({
    onCancel: clearSelected,
    onConfirm: async (value) => {
      const selectedRows = rawData.filter((row) => row.selected);
      for (const selectedRow of selectedRows) {
        for (const scope of scopes) {
          for (const id of scope.ids) {
            if (id == selectedRow.scope.id) {
              const url = `/admin/realms/${realm}/default-${scope.name}-client-scopes/${id}`;
              await httpClient.doDelete(url);
            }
          }
        }
        try {
          await httpClient.doPut(
            `/admin/realms/${realm}/default-${value}-client-scopes/${selectedRow.scope.id}`,
            selectedRow.scope
          );
          clearSelected();
          addAlert(t("changeTypeSuccess"), AlertVariant.success);
        } catch (error) {
          addAlert(`${t("changeTypeError")} ${error}`, AlertVariant.danger);
        }
      }
    },
    numberOfClients: rawData.filter((row) => row.selected).length,
  });

  const filterData = (search: string) => {
    setFilteredData(
      rawData.filter((group) =>
        group.scope.name!.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const onSelect = (selected: boolean, rowId: number) => {
    const update = [...rawData];
    update[rowId].selected = selected;
    setRawData(update);
  };
  return (
    <>
      <Dialog />
      <ViewHeader
        titleKey="clientScopes"
        subKey="client-scopes:clientScopeExplain"
      />
      <PageSection variant="light">
        {!rawData && (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        )}
        {rawData && (
          <TableToolbar
            count={0}
            first={1}
            max={100}
            onNextClick={() => {}}
            onPreviousClick={() => {}}
            onPerPageSelect={() => {}}
            inputGroupName="clientsScopeToolbarTextInput"
            inputGroupPlaceholder={""}
            inputGroupOnChange={filterData}
            toolbarItem={
              <>
                <Button onClick={() => history.push("/add-client-scopes")}>
                  {t("createClientScope")}
                </Button>
                <ToolbarItem>
                  <Dropdown
                    toggle={<KebabToggle onToggle={() => setOpen(!open)} />}
                    isOpen={open}
                    isPlain
                    dropdownItems={[
                      <DropdownItem
                        key="type"
                        component="button"
                        onClick={() => toggleDialog()}
                      >
                        {t("changeType")}
                      </DropdownItem>,
                      <DropdownItem key="delete" component="button">
                        {t("common:delete")}
                      </DropdownItem>,
                    ]}
                  />
                </ToolbarItem>
              </>
            }
          >
            <ClientScopeList
              clientScopes={filteredData || rawData}
              onSelect={onSelect}
              onChangeRow={(rowId) => {
                (filteredData || rawData)[rowId].selected = true;
                toggleDialog();
              }}
            />
          </TableToolbar>
        )}
      </PageSection>
    </>
  );
};
