import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/react-core/dist/styles/base.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { DropdownItem, Page } from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";
import Keycloak from "keycloak-js";

import KeycloakMasthead from "./Masthead";

async function initialize() {
  ReactDOM.render(
    <StrictMode>
      <Page
        header={
          <KeycloakMasthead
            brand={{
              src: "/logo.svg",
              alt: "keycloak logo",
              className: "logo",
            }}
            dropdownItems={[
              <DropdownItem key="server info">Realm info</DropdownItem>,
              <DropdownItem key="help" icon={<HelpIcon />}>
                Help on
              </DropdownItem>,
            ]}
            keycloak={
              {
                tokenParsed: {
                  given_name: "Erik Jan",
                  family_name: "de Wit",
                },
                login: () => console.log("Logging in..."),
                logout: () => console.log("Logging out.."),
                accountManagement: () => console.log("To account management"),
              } as unknown as Keycloak
            }
          />
        }
      />
    </StrictMode>,
    document.getElementById("app")
  );
}

initialize();
