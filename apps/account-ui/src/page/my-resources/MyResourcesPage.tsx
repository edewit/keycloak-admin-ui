import { Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import { t } from "i18next";
import { useState } from "react";
import { ResourceToolbar } from "./ResourceToolbar";

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
        <ResourceToolbar onFilter={() => console.log("super")} />
        <h1>Hello</h1>
      </Tab>
      <Tab
        eventKey={1}
        title={<TabTitleText>{t("sharedwithMe")}</TabTitleText>}
      >
        <ResourceToolbar onFilter={() => console.log("hello")} />
        <h1>Share</h1>
      </Tab>
    </Tabs>
  );
}
