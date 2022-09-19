import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Page,
  PageSection,
  Spinner,
  DropdownItem,
} from "@patternfly/react-core";

import { KeycloakMasthead } from "keycloak-masthead";
import { useAccountClient } from "./context/AccountClient";
import { PageNav } from "./PageNav";
import Pages from "./page/pages";

import style from "./app.module.css";

export const App = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<ContentItem[]>();
  const accountClient = useAccountClient();

  useEffect(() => {
    (async () => {
      await accountClient.init();
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
            features={{ hasManageAccount: false }}
            showNavToggle
            brand={{
              src: "/logo.svg",
              alt: "keycloak logo",
              className: style.logo,
            }}
            dropdownItems={[<DropdownItem key="back">Realm info</DropdownItem>]}
            keycloak={accountClient.keycloak}
            trans={(key: string, params?: object): string => t(key, params)}
          />
        }
        isManagedSidebar
        sidebar={<PageNav content={content} />}
      >
        <PageSection variant="light" isFilled>
          <Switch>
            {content
              .filter((r) => r.componentName !== undefined)
              .map((route) => (
                <Route
                  key={route.id}
                  path={`/${route.path}`}
                  component={Pages[route.componentName!]}
                />
              ))}
          </Switch>
        </PageSection>
      </Page>
    </Router>
  );
};
