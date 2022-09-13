import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Page,
  PageSection,
  Spinner,
  DropdownItem,
} from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";

import { KeycloakMasthead } from "keycloak-masthead";
import { PageNav } from "./PageNav";

import style from "./app.module.css";

export const App = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<ContentItem[]>();

  useEffect(() => {
    (async () => {
      const response = await fetch("/resources/content.json");
      setContent(await response.json());
    })();
  }, []);

  if (!content) return <Spinner />;

  return (
    <Router>
      <Page
        header={
          <KeycloakMasthead
            showNavToggle
            brand={{
              src: "/logo.svg",
              alt: "keycloak logo",
              className: style.logo,
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
        isManagedSidebar
        sidebar={<PageNav content={content} />}
      >
        <PageSection>{t("accountManagementWelcomeMessage")}</PageSection>
      </Page>
    </Router>
  );
};
