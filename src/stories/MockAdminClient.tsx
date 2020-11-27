import React, { ReactNode } from "react";
import { HashRouter } from "react-router-dom";
import KeycloakAdminClient from "keycloak-admin";

import { AccessContextProvider } from "../context/access/Access";
import { WhoAmIContextProvider } from "../context/whoami/WhoAmI";
import { RealmContextProvider } from "../context/realm-context/RealmContext";

import whoamiMock from "../context/whoami/__tests__/mock-whoami.json";
import { AdminClient } from "../context/auth/AdminClient";

export const MockAdminClient = (props: {
  children: ReactNode;
  mock?: object;
}) => {
  return (
    <HashRouter>
      <AdminClient.Provider
        value={
          ({
            ...props.mock,
            keycloak: {},
            whoAmI: { find: () => whoamiMock },
            setConfig: () => {},
          } as unknown) as KeycloakAdminClient
        }
      >
        <WhoAmIContextProvider>
          <RealmContextProvider>
            <AccessContextProvider>{props.children}</AccessContextProvider>
          </RealmContextProvider>
        </WhoAmIContextProvider>
      </AdminClient.Provider>
    </HashRouter>
  );
};
