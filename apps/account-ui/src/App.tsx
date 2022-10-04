import { BrowserRouter as Router } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Page, PageSection } from "@patternfly/react-core";

import { Header } from "./PageHeader";
import { PageNav } from "./PageNav";

export const App = () => {
  const { t } = useTranslation();

  return (
    <Router>
      <Page header={<Header />} isManagedSidebar sidebar={<PageNav />}>
        <PageSection>{t("welcomeMessage")}</PageSection>
      </Page>
    </Router>
  );
};
