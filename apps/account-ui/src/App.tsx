import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Page, PageSection, Spinner } from "@patternfly/react-core";

import { Header } from "./PageHeader";
import { PageNav } from "./PageNav";

export const App = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<ContentItem[]>();

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/resources/content.json");
      setContent(await response.json());
    };
    load();
  }, []);

  console.log(content);

  if (!content) return <Spinner />;

  return (
    <Router>
      <Page
        header={<Header />}
        isManagedSidebar
        sidebar={<PageNav content={content} />}
      >
        <PageSection>{t("accountManagementWelcomeMessage")}</PageSection>
      </Page>
    </Router>
  );
};
