import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/react-core/dist/styles/base.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { DropdownItem, Page } from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";

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
              <DropdownItem key="manage">Manage account</DropdownItem>,
              <DropdownItem key="server info">Realm info</DropdownItem>,
              <DropdownItem key="help" icon={<HelpIcon />}>
                Help on
              </DropdownItem>,
              <DropdownItem key="sign out">Sign out</DropdownItem>,
            ]}
          />
        }
      />
    </StrictMode>,
    document.getElementById("app")
  );
}

initialize();
