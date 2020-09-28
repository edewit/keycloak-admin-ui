import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, PageSection, Spinner } from "@patternfly/react-core";

import { ClientList } from "./ClientList";
import { RealmContext } from "../context/realm-context/RealmContext";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { PaginatingTableToolbar } from "../components/table-toolbar/PaginatingTableToolbar";
import { AdminClient } from "../auth/AdminClient";

export const ClientsSection = () => {
  const { t } = useTranslation("clients");
  const history = useHistory();

  const [max, setMax] = useState(10);
  const [first, setFirst] = useState(0);
  const [search, setSearch] = useState("");
  const httpClient = useContext(AdminClient)!;
  const [clients, setClients] = useState<ClientRepresentation[]>();
  const { realm } = useContext(RealmContext);

  const loader = async () => await httpClient.clients.find({ first, max, realm });
    const params: { [name: string]: string | number } = { first, max };
    if (search) {
      params.clientId = search;
      params.search = "true";
    }
    const result = await httpClient.clients.find({ params: params });
    setClients(result);

  useEffect(() => {
    loader();
  }, [first, max]);

  return (
    <>
      <ViewHeader
        titleKey="clients:clientList"
        subKey="clients:clientsExplain"
      />
      <PageSection variant="light">
        {!clients && (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        )}
        {clients && (
          <PaginatingTableToolbar
            count={clients!.length}
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
            inputGroupOnClick={() => loader()}
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
            <ClientList
              clients={clients}
              refresh={loader}
                baseUrl={httpClient.baseUrl + "/"}
            />
          </PaginatingTableToolbar>
        )}
      </PageSection>
    </>
  );
};
