import { Page } from "@patternfly/react-core";
import { Outlet } from "react-router";

import { Header } from "./PageHeader";
import { PageNav } from "./PageNav";

export const Root = () => (
  <Page header={<Header />} sidebar={<PageNav />} isManagedSidebar>
    <Outlet />
  </Page>
);
