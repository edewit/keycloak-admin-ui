import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, PageSection } from "@patternfly/react-core";

import { DataLoader } from "../components/data-loader/DataLoader";
import { TableToolbar } from "../components/table-toolbar/TableToolbar";
import { ClientList } from "./ClientList";
import { HttpClientContext } from "../http-service/HttpClientContext";
import { KeycloakContext } from "../auth/KeycloakContext";
import { ClientRepresentation } from "./models/client-model";
import { RealmContext } from "../components/realm-context/RealmContext";
import { ViewHeader } from "../components/view-header/ViewHeader";

export const ClientsSection = () => {
  const { t } = useTranslation("clients");
  const history = useHistory();

  const [max, setMax] = useState(10);
  const [first, setFirst] = useState(0);
  const [search, setSearch] = useState("");
  const [resultLength, setResultLength] = useState(0);
  const httpClient = useContext(HttpClientContext)!;
  const keycloak = useContext(KeycloakContext);
  const { realm } = useContext(RealmContext);

  const loader = async () => {
    const params: { [name: string]: string | number } = { first, max };
    if (search) {
      params.clientId = search;
      params.search = "true";
    }
    const result = await httpClient.doGet<ClientRepresentation[]>(
      `/admin/realms/${realm}/clients`,
      { params: params }
    );
    setResultLength(result.data!.length);
    return result.data;
  };

  return (
    <>
      <ViewHeader
        titleKey="clients:clientList"
        subKey="clients:clientsExplain"
      />
      <PageSection variant="light">
        <TableToolbar
          count={resultLength}
          first={first}
          max={max}
          onNextClick={setFirst}
          onPreviousClick={setFirst}
          onPerPageSelect={(first, max) => {
            setFirst(first);
            setMax(max);
          }}
          inputGroupName="clientsToolbarTextInput"
          inputGroupOnChange={setSearch}
          inputGroupPlaceholder={t("Search for client")}
          toolbarItem={
            <>
              <Button onClick={() => history.push("/add-client")}>
                {t("createClient")}
              </Button>
              <Button
                onClick={() => history.push("/import-client")}
                variant="link"
              >
                {t("importClient")}
              </Button>
            </>
          }
        >
          <DataLoader loader={loader}>
            {(clients) => (
              <ClientList
                clients={clients}
                baseUrl={keycloak!.authServerUrl()!}
              />
            )}
          </DataLoader>
        </TableToolbar>
      </PageSection>
    </>
  );
};
