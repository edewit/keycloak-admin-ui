import React from "react";
import { PageSection } from "@patternfly/react-core";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { RealmRolesList } from "./RealmRolesList";

export const RealmRolesSection = () => {
  return (
    <>
      <ViewHeader titleKey="roles:title" subKey="roles:roleExplain" />
      <PageSection variant="light">
        <RealmRolesList />
      </PageSection>
    </>
  );
};
