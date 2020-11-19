import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import {
  IFormatter,
  IFormatterValueType,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Select,
  Spinner,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import ClientScopeRepresentation from "keycloak-admin/lib/defs/clientScopeRepresentation";

import { useAdminClient } from "../../context/auth/AdminClient";
import { TableToolbar } from "../../components/table-toolbar/TableToolbar";
import { ListEmptyState } from "../../components/list-empty-state/ListEmptyState";
import { AddScopeDialog } from "./AddScopeDialog";
import { clientScopeTypesSelectOptions } from "./ClientScopeTypes";
import { FilterIcon } from "@patternfly/react-icons";

export type ClientScopesProps = {
  clientId: string;
  protocol: string;
};

const CellDropdown = (props: { name: string; t: TFunction }) => {
  const [open, setOpen] = useState(false);

  return (
    <Select
      key={new Date().getTime()}
      onToggle={() => setOpen(!open)}
      isOpen={open}
      selections={[props.name]}
      onSelect={(_, value) => {
        console.log(value);
        setOpen(false);
      }}
    >
      {clientScopeTypesSelectOptions(props.t)}
    </Select>
  );
};

type SearchType = "client" | "assigned";

export const ClientScopes = ({ clientId, protocol }: ClientScopesProps) => {
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();
  const [searchToggle, setSearchToggle] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("client");
  const [addToggle, setAddToggle] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [rows, setRows] = useState<{ cells: (string | undefined)[] }[]>();
  const [rest, setRest] = useState<ClientScopeRepresentation[]>();

  const loader = async () => {
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
        cells: [c.name, t("clientScope.optional"), scope.description],
      };
    });

    const defaultScopes = defaultClientScopes.map((c) => {
      const scope = find(c.id!);
      return {
        cells: [c.name, t("clientScope.default"), scope.description],
      };
    });

    setRows([...optional, ...defaultScopes]);
  };

  useEffect(() => {
    loader();
  }, []);

  useEffect(() => {
    if (rows) {
      loadRest(rows);
    }
  }, [rows]);

  const loadRest = async (rows: { cells: (string | undefined)[] }[]) => {
    const clientScopes = await adminClient.clientScopes.find();
    const names = rows.map((row) => row.cells[0]);

    setRest(
      clientScopes
        .filter((scope) => !names.includes(scope.name))
        .filter((scope) => scope.protocol === protocol)
    );
  };

  const dropdown = (): IFormatter => (data?: IFormatterValueType) => {
    return (data ? (
      <CellDropdown name={data.toString()} t={t} />
    ) : undefined) as object;
  };

  const filterData = () => {};

  return (
    <>
      {!rows && (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      )}

      {rows && rows.length > 0 && (
        <>
          {rest && (
            <AddScopeDialog
              clientScopes={rest}
              open={addDialogOpen}
              toggleDialog={() => setAddDialogOpen(!addDialogOpen)}
            />
          )}

          <TableToolbar
            searchTypeComponent={
              <Dropdown
                toggle={
                  <DropdownToggle
                    id="toggle-id"
                    onToggle={() => setSearchToggle(!searchToggle)}
                  >
                    <FilterIcon /> {t(`clientScopeSearch.${searchType}`)}
                  </DropdownToggle>
                }
                aria-label="Select Input"
                isOpen={searchToggle}
                dropdownItems={[
                  <DropdownItem
                    key="client"
                    onClick={() => {
                      setSearchType("client");
                      setSearchToggle(false);
                    }}
                  >
                    {t("clientScopeSearch.client")}
                  </DropdownItem>,
                  <DropdownItem
                    key="assigned"
                    onClick={() => {
                      setSearchType("assigned");
                      setSearchToggle(false);
                    }}
                  >
                    {t("clientScopeSearch.assigned")}
                  </DropdownItem>,
                ]}
              />
            }
            inputGroupName="clientsScopeToolbarTextInput"
            inputGroupPlaceholder={t("searchByName")}
            inputGroupOnChange={filterData}
            toolbarItem={
              <Split hasGutter>
                <SplitItem>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    {t("addClientScope")}
                  </Button>
                </SplitItem>
                <SplitItem>
                  <Select
                    id="add-dropdown"
                    key="add-dropdown"
                    isOpen={addToggle}
                    selections={[]}
                    placeholderText={t("changeTypeTo")}
                    onToggle={() => setAddToggle(!addToggle)}
                    onSelect={(_, value) => {
                      console.log(value);
                      setAddToggle(false);
                    }}
                  >
                    {clientScopeTypesSelectOptions(t)}
                  </Select>
                </SplitItem>
              </Split>
            }
          >
            <Table
              onSelect={() => {}}
              variant={TableVariant.compact}
              cells={[
                t("name"),
                { title: t("description"), cellFormatters: [dropdown()] },
                t("protocol"),
              ]}
              rows={rows}
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
        </>
      )}
      {rows && rows.length === 0 && (
        <ListEmptyState
          message={t("clients:emptyClientScopes")}
          instructions={t("clients:emptyClientScopesInstructions")}
          primaryActionText={t("clients:emptyClientScopesPrimaryAction")}
          onPrimaryAction={() => {}}
        />
      )}
    </>
  );
};
