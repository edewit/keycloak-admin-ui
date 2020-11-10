import React from "react";
import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import KeycloakAdminClient from "keycloak-admin";

import clientMock from "./mock-clients.json";
import { ClientList } from "../ClientList";
import { AdminClient } from "../../context/auth/AdminClient";

test("renders ClientList", () => {
  const container = mount(
    <MemoryRouter>
      <AdminClient.Provider
        value={
          ({
            setConfig: () => {},
          } as unknown) as KeycloakAdminClient
        }
      >
        <ClientList
          clients={clientMock}
          baseUrl="http://blog.nerdin.ch"
          refresh={() => {}}
        />
      </AdminClient.Provider>
    </MemoryRouter>
  );
  expect(container).toMatchSnapshot();
});
