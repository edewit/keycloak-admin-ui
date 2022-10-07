import { Page } from "@patternfly/react-core";
import { Outlet } from "react-router";

import { PageHeader } from "./PageHeader";
import { PageNav } from "./PageNav";

export const Root = () => (
  <Page header={<PageHeader />} sidebar={<PageNav />} isManagedSidebar>
    <Outlet />
  </Page>
);
