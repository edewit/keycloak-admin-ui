import { useState } from "react";
import { t } from "i18next";
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core";

import { ResourcesTab } from "./ResourcesTab";

export function MyResourcesPage() {
  const [activeTabKey, setActiveTabKey] = useState(0);

  return (
    <Tabs
      activeKey={activeTabKey}
      onSelect={(_, key) => setActiveTabKey(key as number)}
      mountOnEnter
      unmountOnExit
    >
      <Tab eventKey={0} title={<TabTitleText>{t("myResources")}</TabTitleText>}>
        <ResourcesTab />
      </Tab>
      <Tab
        eventKey={1}
        title={<TabTitleText>{t("sharedwithMe")}</TabTitleText>}
      >
        <h1>Share</h1>
      </Tab>
    </Tabs>
  );
}
